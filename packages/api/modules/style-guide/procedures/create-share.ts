import { ORPCError } from "@orpc/server";
import { db } from "@repo/database/prisma/client";
import { getBaseUrl } from "@repo/utils";
import { z } from "zod";
import { publicProcedure } from "../../../orpc/procedures";
import { rateLimitMiddleware } from "../../../orpc/middleware/rate-limit";
import { generateShareId } from "../utils/generate-share-id";
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
		const share = await tx.styleGuideShare.create({
			data: {
				shareId,
				expiresAt,
				websiteUrl: validated.websiteUrl,
				styleGuideDataId: styleGuideData.id,
			},
		});

		return share;
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
