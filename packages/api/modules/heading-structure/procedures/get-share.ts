import { ORPCError } from "@orpc/server";
import { db } from "@repo/database/prisma/client";
import { ShareType } from "@repo/database/prisma/generated/enums";
import { z } from "zod";
import { publicProcedure } from "../../../orpc/procedures";

export const getShare = publicProcedure
	.route({
		method: "GET",
		path: "/get-share",
		tags: ["Heading Structure"],
		summary: "Get heading structure share data",
		description: "Retrieves heading structure data by share ID",
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
				headingStructureData: true,
			},
		});

		if (!share) {
			throw new ORPCError("NOT_FOUND");
		}

		// Verify share type
		if (share.type !== ShareType.HEADING_STRUCTURE) {
			throw new ORPCError("NOT_FOUND");
		}

		// Check if share has expired
		if (new Date() > share.expiresAt) {
			// Delete expired share
			await db.share.delete({
				where: { id: share.id },
			});

			throw new ORPCError("NOT_FOUND");
		}

		if (!share.headingStructureData) {
			throw new ORPCError("NOT_FOUND");
		}

		return {
			treeData: share.headingStructureData.treeData,
			exportOptions: share.headingStructureData.exportOptions,
			websiteUrl: share.websiteUrl,
			createdAt: share.createdAt,
			expiresAt: share.expiresAt,
		};
	});
