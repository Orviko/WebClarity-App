import { z } from "zod";
import { protectedProcedure } from "../../../orpc/procedures";
import { checkShareLimit } from "../lib/check-limits";

const checkShareLimitSchema = z.object({
	organizationId: z.string(),
});

export const checkShareLimitProcedure = protectedProcedure
	.input(checkShareLimitSchema)
	.handler(async ({ input, context }) => {
		const { organizationId } = input;

		// Check share limit for the workspace
		const limitCheck = await checkShareLimit(organizationId);

		return limitCheck;
	});

