import { ORPCError } from "@orpc/server";
import { db } from "@repo/database/prisma/client";
import { ShareType } from "@repo/database/prisma/generated/enums";
import { z } from "zod";
import { publicProcedure } from "../../../orpc/procedures";
import { rateLimitMiddleware } from "../../../orpc/middleware/rate-limit";
import { generateShareId } from "../../shared/utils/generate-share-id";
import { validateShareData } from "../utils/validate-share-data";
import { shareDataSchema } from "../schema";

/**
 * Shared handler logic for creating a heading structure share
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

	// Create heading structure data and share in a transaction
	const result = await db.$transaction(async (tx) => {
		// Create heading structure data
		// Cast to any to satisfy Prisma's Json type requirements
		const headingStructureData = await tx.headingStructureData.create({
			data: {
				treeData: validated.treeData as any,
				exportOptions: validated.exportOptions as any,
			},
		});

		// Create share
		const share = await tx.share.create({
			data: {
				shareId,
				type: ShareType.HEADING_STRUCTURE,
				expiresAt,
				websiteUrl: validated.websiteUrl,
				headingStructureDataId: headingStructureData.id,
			},
		});

		return share;
	});

	// Generate share URL - use web app URL from environment variable
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
		tags: ["Heading Structure"],
		summary: "Create a public share for heading structure data",
		description:
			"Creates a temporary public share (24 hours) for heading structure tree data",
	})
	.use(rateLimitMiddleware())
	.input(shareDataSchema)
	.handler(async ({ input }) => {
		return createShareHandler(input);
	});

