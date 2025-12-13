import { ORPCError } from "@orpc/server";
import { db } from "@repo/database/prisma/client";
import { ShareType } from "@repo/database/prisma/generated/enums";
import { z } from "zod";
import { publicProcedure } from "../../../orpc/procedures";

export const getShare = publicProcedure
	.route({
		method: "GET",
		path: "/get-share",
		tags: ["Style Guide"],
		summary: "Get style guide share data",
		description: "Retrieves style guide data by share ID",
	})
	.input(
		z.object({
			shareId: z
				.string()
				.length(12, "Share ID must be 12 characters")
				.regex(
					/^[0-9A-Za-z]{12}$/,
					"Share ID must contain only alphanumeric characters"
				),
		})
	)
	.handler(async ({ input }) => {
		// Find share with related data
		const share = await db.share.findUnique({
			where: { shareId: input.shareId },
			include: {
				styleGuideData: true,
			},
		});

		if (!share) {
			throw new ORPCError("NOT_FOUND");
		}

		// Verify share type
		if (share.type !== ShareType.STYLE_GUIDE) {
			throw new ORPCError("NOT_FOUND");
		}

		// Check if share has expired
		if (new Date() > share.expiresAt) {
			// Delete share OG image before deleting share
			if (share.shareOgImageUrl) {
				try {
					const { deleteShareOGImage } = await import("@repo/share-og");
					await deleteShareOGImage(share.shareId);
				} catch (error) {
					// Log but don't fail - cleanup failures shouldn't block deletion
					console.error("Failed to delete share OG image during cleanup:", error);
				}
			}

			// Delete expired share
			await db.share.delete({
				where: { id: share.id },
			});

			throw new ORPCError("NOT_FOUND");
		}

		if (!share.styleGuideData) {
			throw new ORPCError("NOT_FOUND");
		}

		return {
			typographyData: share.styleGuideData.typographyData,
			colorsData: share.styleGuideData.colorsData,
			exportOptions: share.styleGuideData.exportOptions,
			websiteUrl: share.websiteUrl,
			shareOgImageUrl: share.shareOgImageUrl,
			createdAt: share.createdAt,
			expiresAt: share.expiresAt,
		};
	});
