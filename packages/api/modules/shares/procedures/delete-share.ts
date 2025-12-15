import { db } from "@repo/database/prisma/client";
import { z } from "zod";
import { protectedProcedure } from "../../../orpc/procedures";
import { canManageShare } from "../lib/permissions";

const deleteShareSchema = z.object({
	shareId: z.string(),
});

export const deleteShare = protectedProcedure
	.input(deleteShareSchema)
	.handler(async ({ input, context }) => {
		const { shareId } = input;
		const userId = context.user.id;

		// Check permissions
		const canManage = await canManageShare(userId, shareId);

		if (!canManage) {
			throw new Error("You don't have permission to delete this share");
		}

		// Get share to delete OG image
		const share = await db.share.findUnique({
			where: { shareId },
		});

		if (!share) {
			throw new Error("Share not found");
		}

		// Delete OG image if exists
		if (share.shareOgImageUrl) {
			try {
				const { deleteShareOGImage } = await import("@repo/share-og");
				await deleteShareOGImage(share.shareId);
			} catch (error) {
				console.error("Failed to delete OG image:", error);
				// Continue with share deletion even if OG image deletion fails
			}
		}

		// Delete share (cascade will delete related data)
		await db.share.delete({
			where: { shareId },
		});

		return { success: true };
	});

