import { ORPCError } from "@orpc/server";
import { db } from "@repo/database/prisma/client";
import { z } from "zod";
import { publicProcedure } from "../../../orpc/procedures";

export const getShareType = publicProcedure
	.route({
		method: "GET",
		path: "/get-share-type",
		tags: ["Share"],
		summary: "Get share type by share ID",
		description: "Retrieves the type of a share by share ID",
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
		// Find share
		const share = await db.share.findUnique({
			where: { shareId: input.shareId },
			select: {
				type: true,
				expiresAt: true,
			},
		});

		if (!share) {
			throw new ORPCError("NOT_FOUND");
		}

		// Check if share has expired
		if (new Date() > share.expiresAt) {
			// Delete expired share
			await db.share.delete({
				where: { shareId: input.shareId },
			});

			throw new ORPCError("NOT_FOUND");
		}

		return {
			type: share.type,
		};
	});

