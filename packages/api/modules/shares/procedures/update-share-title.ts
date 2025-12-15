import { db } from "@repo/database/prisma/client";
import { z } from "zod";
import { protectedProcedure } from "../../../orpc/procedures";
import { canManageShare } from "../lib/permissions";

const updateShareTitleSchema = z.object({
	shareId: z.string(),
	title: z.string().min(1).max(200),
});

export const updateShareTitle = protectedProcedure
	.input(updateShareTitleSchema)
	.handler(async ({ input, context }) => {
		const { shareId, title } = input;
		const userId = context.user.id;

		// Check permissions
		const canManage = await canManageShare(userId, shareId);

		if (!canManage) {
			throw new Error("You don't have permission to edit this share");
		}

		// Update share title
		const share = await db.share.update({
			where: { shareId },
			data: {
				title,
			},
			include: {
				user: {
					select: {
						id: true,
						name: true,
						image: true,
					},
				},
			},
		});

		return share;
	});

