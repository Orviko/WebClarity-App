import { db } from "@repo/database/prisma/client";
import { z } from "zod";
import { protectedProcedure } from "../../../orpc/procedures";
import { isWorkspaceMember } from "../lib/permissions";

const renewShareSchema = z.object({
	shareId: z.string(),
});

export const renewShare = protectedProcedure
	.input(renewShareSchema)
	.handler(async ({ input, context }) => {
		const { shareId } = input;
		const userId = context.user.id;

		// Get share
		const share = await db.share.findUnique({
			where: { shareId },
		});

		if (!share) {
			throw new Error("Share not found");
		}

		// Only workspace shares can be renewed
		if (!share.userId || !share.organizationId) {
			throw new Error("Only workspace shares can be renewed");
		}

		// Check if user is workspace member
		const isMember = await isWorkspaceMember(userId, share.organizationId);

		if (!isMember) {
			throw new Error("You must be a workspace member to renew this share");
		}

		// Extend expiry by 7 days from now
		const newExpiresAt = new Date();
		newExpiresAt.setDate(newExpiresAt.getDate() + 7);

		// Update share
		const updatedShare = await db.share.update({
			where: { shareId },
			data: {
				expiresAt: newExpiresAt,
				isExpired: false,
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

		return updatedShare;
	});

