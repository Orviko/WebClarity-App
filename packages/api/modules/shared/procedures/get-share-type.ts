import { ORPCError } from "@orpc/server";
import { db } from "@repo/database/prisma/client";
import { z } from "zod";
import { publicProcedure } from "../../../orpc/procedures";

export const getShareType = publicProcedure
	.route({
		method: "GET",
		path: "/get-share-type",
		tags: ["Share"],
		summary: "Get share type by share ID",
		description: "Retrieves the type of a share by share ID",
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
		// Find share
		const share = await db.share.findUnique({
			where: { shareId: input.shareId },
			select: {
				type: true,
				expiresAt: true,
				shareId: true,
				shareOgImageUrl: true,
				userId: true,
				organizationId: true,
				isExpired: true,
			},
		});

		if (!share) {
			throw new ORPCError("NOT_FOUND");
		}

		// Check if share has expired
		if (new Date() > share.expiresAt) {
			// Only delete anonymous shares (userId IS NULL)
			// Workspace shares should be marked as expired but not deleted
			if (!share.userId && !share.organizationId) {
				// Delete share OG image before deleting anonymous share
				if (share.shareOgImageUrl) {
					try {
						const { deleteShareOGImage } = await import(
							"@repo/share-og"
						);
						await deleteShareOGImage(share.shareId);
					} catch (error) {
						// Log but don't fail - cleanup failures shouldn't block deletion
						console.error(
							"Failed to delete share OG image during cleanup:",
							error
						);
					}
				}

				// Delete expired anonymous share
				await db.share.delete({
					where: { shareId: input.shareId },
				});

				throw new ORPCError("NOT_FOUND");
			} else {
				// Mark workspace share as expired if not already marked
				if (!share.isExpired) {
					await db.share.update({
						where: { shareId: input.shareId },
						data: { isExpired: true },
					});
				}
				// Still return the share type even if expired (for display purposes)
			}
		}

		return {
			type: share.type,
		};
	});
