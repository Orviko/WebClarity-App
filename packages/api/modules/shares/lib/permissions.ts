import { db } from "@repo/database/prisma/client";

/**
 * Check if a user can manage (edit/delete) a share
 * - Creator can always manage their own shares
 * - Workspace owner/admin can manage any workspace share
 */
export async function canManageShare(
	userId: string,
	shareId: string,
): Promise<boolean> {
	try {
		const share = await db.share.findUnique({
			where: { shareId },
			include: {
				organization: {
					include: {
						members: {
							where: { userId },
						},
					},
				},
			},
		});

		if (!share) {
			return false;
		}

		// Creator can always manage
		if (share.userId === userId) {
			return true;
		}

		// Workspace owner/admin can manage any workspace share
		if (share.organizationId && share.organization) {
			const member = share.organization.members[0];
			if (member && ["owner", "admin"].includes(member.role)) {
				return true;
			}
		}

		return false;
	} catch (error) {
		console.error("Failed to check share permissions:", error);
		return false;
	}
}

/**
 * Check if a user is a member of the workspace that owns a share
 */
export async function isWorkspaceMember(
	userId: string,
	organizationId: string,
): Promise<boolean> {
	try {
		const membership = await db.member.findFirst({
			where: {
				userId,
				organizationId,
			},
		});

		return !!membership;
	} catch (error) {
		console.error("Failed to check workspace membership:", error);
		return false;
	}
}

