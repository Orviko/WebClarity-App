import { db } from "@repo/database/prisma/client";
import { z } from "zod";
import { publicProcedure } from "../../../orpc/procedures";
import { isWorkspaceMember } from "../lib/permissions";
import { auth } from "@repo/auth";

const getShareDetailsSchema = z.object({
	shareId: z.string(),
});

export const getShareDetails = publicProcedure
	.input(getShareDetailsSchema)
	.handler(async ({ input, context }) => {
		const { shareId } = input;

		// Try to get session (may be null for anonymous users)
		let session: { user: { id: string } } | null = null;
		try {
			const authSession = await auth.api.getSession({
				headers: context.headers,
			});
			if (authSession?.user) {
				session = { user: { id: authSession.user.id } };
			}
		} catch {
			// Ignore auth errors for anonymous access
		}

		// Fetch share with full details
		const share = await db.share.findUnique({
			where: { shareId },
			include: {
				user: {
					select: {
						id: true,
						name: true,
						image: true,
						email: true,
					},
				},
				organization: {
					select: {
						id: true,
						name: true,
						slug: true,
						customDomain: true,
						customDomainEnabled: true,
					},
				},
				styleGuideData: true,
				headingStructureData: true,
			},
		});

		if (!share) {
			throw new Error("Share not found");
		}

		// Check if current user can manage this share
		let canManage = false;
		let isCreator = false;
		let isWorkspaceMemberUser = false;
		
		if (session?.user?.id && share.userId) {
			// Check if user is creator
			if (share.userId === session.user.id) {
				canManage = true;
				isCreator = true;
			} else if (share.organizationId) {
				isWorkspaceMemberUser = await isWorkspaceMember(
					session.user.id,
					share.organizationId,
				);
				canManage = isWorkspaceMemberUser;
			}
		}

		// Increment view count ONLY when:
		// 1. Share is not expired
		// 2. User is NOT the creator
		// 3. User is NOT a workspace member (only count external/public views)
		// This ensures views are only counted for actual external visitors to the share URL
		if (!share.isExpired && !isCreator && !isWorkspaceMemberUser) {
			await db.share.update({
				where: { id: share.id },
				data: {
					viewCount: {
						increment: 1,
					},
				},
			});
		}

		return {
			...share,
			canManage,
		};
	});

