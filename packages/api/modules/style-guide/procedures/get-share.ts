import { ORPCError } from "@orpc/server";
import { db } from "@repo/database/prisma/client";
import { z } from "zod";
import { publicProcedure } from "../../../orpc/procedures";

export const getShare = publicProcedure
	.route({
		method: "GET",
		path: "/get-share",
		tags: ["Style Guide"],
		summary: "Get style guide share data",
		description: "Retrieves style guide data by share ID",
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
		const share = await db.styleGuideShare.findUnique({
			where: { shareId: input.shareId },
			include: {
				styleGuideData: true,
			},
		});

		if (!share) {
			throw new ORPCError("NOT_FOUND");
		}

		// Check if share has expired
		if (new Date() > share.expiresAt) {
			// Delete expired share
			await db.styleGuideShare.delete({
				where: { id: share.id },
			});

			throw new ORPCError("NOT_FOUND");
		}

		return {
			typographyData: share.styleGuideData.typographyData,
			colorsData: share.styleGuideData.colorsData,
			exportOptions: share.styleGuideData.exportOptions,
			websiteUrl: share.websiteUrl,
			createdAt: share.createdAt,
			expiresAt: share.expiresAt,
		};
	});
