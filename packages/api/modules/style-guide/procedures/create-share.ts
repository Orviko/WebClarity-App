import { ORPCError } from "@orpc/server";
import { db } from "@repo/database/prisma/client";
import { ShareType } from "@repo/database/prisma/generated/enums";
import { logger } from "@repo/logs";
import { getBaseUrl } from "@repo/utils";
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
 * Shared handler logic for creating a style guide share
 */
export async function createShareHandler(
	input: z.infer<typeof createShareInputSchema>
) {
	const { userId, organizationId, ...shareData } = input;

	// Validation: both userId and organizationId must be provided together, or neither
	if ((userId && !organizationId) || (!userId && organizationId)) {
		const error = new Error("Both userId and organizationId must be provided for authenticated shares");
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
			const error = new Error(`Share limit reached (${limitCheck.currentCount}/${limitCheck.limit}). Upgrade to create more.`);
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

	// Default title format: "Style Guide - {websiteUrl}"
	// This is the full title that will be stored and editable by users
	const title = `Style Guide - ${validated.websiteUrl}`;

	// Create style guide data and share in a transaction
	const result = await db.$transaction(async (tx) => {
		// Create style guide data
		// Cast to any to satisfy Prisma's Json type requirements
		const styleGuideData = await tx.styleGuideData.create({
			data: {
				typographyData: validated.typographyData as any,
				colorsData: validated.colorsData as any,
				exportOptions: validated.exportOptions as any,
			},
		});

		// Create share
		const share = await tx.share.create({
			data: {
				shareId,
				type: ShareType.STYLE_GUIDE,
				expiresAt,
				title,
				websiteUrl: validated.websiteUrl,
				userId,
				organizationId,
				styleGuideDataId: styleGuideData.id,
			},
		});

		// Increment usage metric for workspace shares INSIDE transaction
		// This prevents race conditions where multiple requests bypass the limit
		if (organizationId) {
			await incrementUsage(organizationId, "shares", tx);
		}

		// Generate share OG image
		let shareOgImageUrl: string | null = null;
		try {
			const { generateAndUploadShareOGImage } = await import("@repo/share-og");

			shareOgImageUrl = await generateAndUploadShareOGImage(
				shareId,
				ShareType.STYLE_GUIDE,
				{
					websiteUrl: validated.websiteUrl,
					colorsData: validated.colorsData,
					typographyData: validated.typographyData,
				},
			);

			// Update share with share OG image URL
			await tx.share.update({
				where: { id: share.id },
				data: { shareOgImageUrl },
			});
		} catch (error) {
			logger.error("Share OG image generation failed, continuing without it:", error);
			// Don't fail the entire request if share OG generation fails
		}

		return { ...share, shareOgImageUrl };
	});

	// Generate share URL - use web app URL from environment variable
	// NEXT_PUBLIC_SITE_URL should be set in .env.local with the web app URL
	const webAppUrl =
		process.env.NEXT_PUBLIC_SITE_URL ||
		(process.env.NEXT_PUBLIC_VERCEL_URL
			? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
			: undefined);

	if (!webAppUrl) {
		throw new Error(
			"NEXT_PUBLIC_SITE_URL must be set in environment variables"
		);
	}

	const shareUrl = `${webAppUrl}/share/${shareId}`;

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
		tags: ["Style Guide"],
		summary: "Create a public share for style guide data",
		description:
			"Creates a share for style guide data. Authenticated users get 7 days, anonymous users get 24 hours.",
	})
	.use(rateLimitMiddleware())
	.input(createShareInputSchema)
	.handler(async ({ input }) => {
		return createShareHandler(input);
	});
