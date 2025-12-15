import { db } from "@repo/database/prisma/client";
import { z } from "zod";
import { protectedProcedure } from "../../../orpc/procedures";
import { verifyOrganizationMembership } from "../../organizations/lib/membership";

const searchSharesSchema = z.object({
	query: z.string().min(1),
	organizationId: z.string(),
});

export const searchShares = protectedProcedure
	.input(searchSharesSchema)
	.handler(async ({ input, context }) => {
		const { query, organizationId } = input;
		const userId = context.user.id;

		// Verify user is member of the workspace
		const membership = await verifyOrganizationMembership(
			organizationId,
			userId
		);

		if (!membership) {
			throw new Error("User is not a member of this workspace");
		}

		// Search shares by title or websiteUrl
		const shares = await db.share.findMany({
			where: {
				organizationId,
				OR: [
					{
						title: {
							contains: query,
							mode: "insensitive",
						},
					},
					{
						websiteUrl: {
							contains: query,
							mode: "insensitive",
						},
					},
				],
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
			orderBy: {
				createdAt: "desc",
			},
			take: 20, // Limit results
		});

		return shares;
	});
