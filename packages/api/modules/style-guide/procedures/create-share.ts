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

/**
 * Shared handler logic for creating a style guide share
 */
export async function createShareHandler(
	input: z.infer<typeof shareDataSchema>
) {
	// Validate and sanitize input data
	const validated = validateShareData(input);

	// Generate unique share ID
	const shareId = await generateShareId();

	// Calculate expiration (24 hours from now)
	const expiresAt = new Date();
	expiresAt.setHours(expiresAt.getHours() + 24);

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
				websiteUrl: validated.websiteUrl,
				styleGuideDataId: styleGuideData.id,
			},
		});

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
			"Creates a temporary public share (24 hours) for style guide typography and color data",
	})
	.use(rateLimitMiddleware())
	.input(shareDataSchema)
	.handler(async ({ input }) => {
		return createShareHandler(input);
	});
