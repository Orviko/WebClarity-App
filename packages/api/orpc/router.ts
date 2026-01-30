import type { RouterClient } from "@orpc/server";
import { adminRouter } from "../modules/admin/router";
import { domainsRouter } from "../modules/domains/router";
import { organizationsRouter } from "../modules/organizations/router";
import { paymentsRouter } from "../modules/payments/router";
import { styleGuideRouter } from "../modules/style-guide/router";
import { headingStructureRouter } from "../modules/heading-structure/router";
import { quickSeoRouter } from "../modules/quick-seo/router";
import { imagesAltRouter } from "../modules/images-alt/router";
import { socialViewRouter } from "../modules/social-view/router";
import { sharedRouter } from "../modules/shared/router";
import { usersRouter } from "../modules/users/router";
import { sharesRouter } from "../modules/shares/router";
import { usageRouter } from "../modules/usage/router";
import { publicProcedure } from "./procedures";

export const router = publicProcedure.router({
	admin: adminRouter,
	organizations: organizationsRouter,
	users: usersRouter,
	payments: paymentsRouter,
	styleGuide: styleGuideRouter,
	headingStructure: headingStructureRouter,
	quickSeo: quickSeoRouter,
	imagesAlt: imagesAltRouter,
	socialView: socialViewRouter,
	shared: sharedRouter,
	shares: sharesRouter,
	usage: usageRouter,
	domains: domainsRouter,
});

export type ApiRouterClient = RouterClient<typeof router>;
