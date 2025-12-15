import { db } from "@repo/database/prisma/client";
import { ShareType } from "@repo/database/prisma/generated/enums";
import { z } from "zod";
import { protectedProcedure } from "../../../orpc/procedures";
import { verifyOrganizationMembership } from "../../organizations/lib/membership";

const searchSharesSchema = z.object({
	query: z.string().min(1),
	organizationId: z.string(),
	type: z.enum(["all", "STYLE_GUIDE", "HEADING_STRUCTURE"]).optional().default("all"),
});

export const searchShares = protectedProcedure
	.input(searchSharesSchema)
	.handler(async ({ input, context }) => {
		const { query, organizationId, type } = input;
		const userId = context.user.id;

		// Verify user is member of the workspace
		const membership = await verifyOrganizationMembership(
			organizationId,
			userId
		);

		if (!membership) {
			throw new Error("User is not a member of this workspace");
		}

		// Build where clause with type filter
		const where: {
			organizationId: string;
			type?: ShareType;
			OR: Array<{
				title?: { contains: string; mode: "insensitive" };
				websiteUrl?: { contains: string; mode: "insensitive" };
			}>;
		} = {
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
		};

		// Add type filter if not "all"
		if (type && type !== "all") {
			where.type = type as ShareType;
		}

		// Search shares by title or websiteUrl
		const shares = await db.share.findMany({
			where,
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
