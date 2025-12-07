import type { RouterClient } from "@orpc/server";
import { adminRouter } from "../modules/admin/router";
import { organizationsRouter } from "../modules/organizations/router";
import { paymentsRouter } from "../modules/payments/router";
import { styleGuideRouter } from "../modules/style-guide/router";
import { headingStructureRouter } from "../modules/heading-structure/router";
import { sharedRouter } from "../modules/shared/router";
import { usersRouter } from "../modules/users/router";
import { publicProcedure } from "./procedures";

export const router = publicProcedure.router({
	admin: adminRouter,
	organizations: organizationsRouter,
	users: usersRouter,
	payments: paymentsRouter,
	styleGuide: styleGuideRouter,
	headingStructure: headingStructureRouter,
	shared: sharedRouter,
});

export type ApiRouterClient = RouterClient<typeof router>;
