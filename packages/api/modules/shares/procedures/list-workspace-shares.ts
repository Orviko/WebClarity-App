import { config } from "@repo/config";
import { db } from "@repo/database/prisma/client";
import { ShareType } from "@repo/database/prisma/generated/enums";
import { z } from "zod";
import { protectedProcedure } from "../../../orpc/procedures";
import { verifyOrganizationMembership } from "../../organizations/lib/membership";

const listWorkspaceSharesSchema = z.object({
	organizationId: z.string(),
	filter: z.enum(["all", "my"]).default("all"),
	type: z
		.enum(["all", "STYLE_GUIDE", "HEADING_STRUCTURE"])
		.optional()
		.default("all"),
});

export const listWorkspaceShares = protectedProcedure
	.input(listWorkspaceSharesSchema)
	.handler(async ({ input, context }) => {
		const { organizationId, filter, type } = input;
		const userId = context.user.id;

		// Verify user is member of the workspace
		const membership = await verifyOrganizationMembership(
			organizationId,
			userId
		);

		if (!membership) {
			throw new Error("User is not a member of this workspace");
		}

		// Fetch organization to check custom domain
		const organization = await db.organization.findUnique({
			where: { id: organizationId },
			select: {
				customDomain: true,
				customDomainEnabled: true,
			},
		});

		// Build where clause based on filter and type
		const where: {
			organizationId: string;
			userId?: string;
			type?: ShareType;
		} = {
			organizationId,
		};

		if (filter === "my") {
			where.userId = userId;
		}

		if (type && type !== "all") {
			where.type = type as ShareType;
		}

		// Fetch shares with creator info
		const shares = await db.share.findMany({
			where,
			include: {
				user: {
					select: {
						id: true,
						name: true,
						image: true,
						email: true,
					},
				},
			},
			orderBy: {
				createdAt: "desc",
			},
		});

		// Determine the base URL (custom domain or app URL)
		const baseUrl =
			organization?.customDomain && organization?.customDomainEnabled
				? `https://${organization.customDomain}`
				: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

		// Add shareUrl to each share (use shareId, not id)
		return shares.map((share) => ({
			...share,
			shareUrl: `${baseUrl}/share/${share.shareId}`,
		}));
	});
