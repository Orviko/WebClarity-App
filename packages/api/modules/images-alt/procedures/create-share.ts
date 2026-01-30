import { ORPCError } from "@orpc/server";
import { db } from "@repo/database/prisma/client";
import { ShareType } from "@repo/database/prisma/generated/enums";
import { logger } from "@repo/logs";
import { z } from "zod";
import { publicProcedure } from "../../../orpc/procedures";
import { rateLimitMiddleware } from "../../../orpc/middleware/rate-limit";
import { generateShareId } from "../../shared/utils/generate-share-id";
import { validateShareData } from "../utils/validate-share-data";
import { shareDataSchema } from "../schema";
import { checkShareLimit } from "../../shares/lib/check-limits";
import { incrementUsage } from "../../usage/lib/usage-helper";

/**
 * Extended schema with optional auth fields
 */
const createShareInputSchema = shareDataSchema.extend({
	userId: z.string().optional(),
	organizationId: z.string().optional(),
});

/**
 * Shared handler logic for creating an Images Alt share
 */
export async function createShareHandler(
	input: z.infer<typeof createShareInputSchema>,
) {
	const { userId, organizationId, ...shareData } = input;

	// Validation: both userId and organizationId must be provided together, or neither
	if ((userId && !organizationId) || (!userId && organizationId)) {
		const error = new Error(
			"Both userId and organizationId must be provided for authenticated shares",
		);
		(error as any).code = "BAD_REQUEST";
		throw error;
	}

	// Check workspace membership if authenticated
	if (userId && organizationId) {
		const membership = await db.member.findFirst({
			where: { userId, organizationId },
		});

		if (!membership) {
			const error = new Error("User is not a member of this workspace");
			(error as any).code = "FORBIDDEN";
			throw error;
		}

		// Check share limit
		const limitCheck = await checkShareLimit(organizationId);
		if (!limitCheck.canCreate) {
			const error = new Error(
				`Share limit reached (${limitCheck.currentCount}/${limitCheck.limit}). Upgrade to create more.`,
			);
			(error as any).code = "FORBIDDEN";
			throw error;
		}
	}

	// Validate and sanitize input data
	const validated = validateShareData(shareData);

	// Generate unique share ID
	const shareId = await generateShareId();

	// Calculate expiration based on auth status
	const expiresAt = new Date();
	if (userId && organizationId) {
		// 7 days for workspace shares
		expiresAt.setDate(expiresAt.getDate() + 7);
	} else {
		// 24 hours for anonymous shares
		expiresAt.setHours(expiresAt.getHours() + 24);
	}

	// Default title format: "Images Alt Report - {websiteUrl}"
	const title = `Images Alt Report - ${validated.websiteUrl}`;

	// Create Images Alt data and share in a transaction
	const result = await db.$transaction(async (tx) => {
		// Create Images Alt data
		const imagesAltData = await tx.imagesAltData.create({
			data: {
				imagesData: validated.imagesData as any,
				exportOptions: validated.exportOptions as any,
			},
		});

		// Create share
		const share = await tx.share.create({
			data: {
				shareId,
				type: ShareType.IMAGES_ALT,
				expiresAt,
				title,
				websiteUrl: validated.websiteUrl,
				userId,
				organizationId,
				imagesAltDataId: imagesAltData.id,
			},
		});

		// Increment usage metric for workspace shares INSIDE transaction
		if (organizationId) {
			await incrementUsage(organizationId, "shares", tx);
		}

		return { ...share, shareOgImageUrl: null };
	});

	// Generate share URL - use custom domain if available
	let baseUrl: string;
	if (organizationId) {
		const organization = await db.organization.findUnique({
			where: { id: organizationId },
			select: { customDomain: true, customDomainEnabled: true },
		});

		if (organization?.customDomainEnabled && organization?.customDomain) {
			baseUrl = `https://${organization.customDomain}`;
		} else {
			baseUrl =
				process.env.NEXT_PUBLIC_SITE_URL ||
				(process.env.NEXT_PUBLIC_VERCEL_URL
					? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
					: undefined) ||
				process.env.NEXT_PUBLIC_APP_URL ||
				"";
		}
	} else {
		baseUrl =
			process.env.NEXT_PUBLIC_SITE_URL ||
			(process.env.NEXT_PUBLIC_VERCEL_URL
				? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
				: undefined) ||
			process.env.NEXT_PUBLIC_APP_URL ||
			"";
	}

	if (!baseUrl) {
		throw new Error(
			"NEXT_PUBLIC_SITE_URL or NEXT_PUBLIC_APP_URL must be set in environment variables",
		);
	}

	const shareUrl = `${baseUrl}/share/${shareId}`;

	return {
		shareId: result.shareId,
		shareUrl,
		expiresAt: result.expiresAt,
	};
}

export const createShare = publicProcedure
	.route({
		method: "POST",
		path: "/create-share",
		tags: ["Images Alt"],
		summary: "Create a public share for Images Alt data",
		description:
			"Creates a share for Images Alt analysis data. Authenticated users get 7 days, anonymous users get 24 hours.",
	})
	.use(rateLimitMiddleware())
	.input(createShareInputSchema)
	.handler(async ({ input }) => {
		return createShareHandler(input);
	});
