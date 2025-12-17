import { config } from "@repo/config";
import { createPurchasesHelper } from "@repo/payments/lib/helper";
import { getOrganizationList, getSession } from "@saas/auth/lib/server";
import { orpcClient } from "@shared/lib/orpc-client";
import { attemptAsync } from "es-toolkit";
import { redirect } from "next/navigation";
import type { PropsWithChildren } from "react";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * Layout for /workspace routes
 * 
 * Note: Authentication and onboarding checks are now handled by middleware.
 * This layout focuses on billing checks and data prefetching.
 */
export default async function Layout({ children }: PropsWithChildren) {
	const session = await getSession();
	const organizations = await getOrganizationList();

	// Check billing requirements (if no free plan exists)
	const hasFreePlan = Object.values(config.payments.plans).some(
		(plan) => "isFree" in plan,
	);

	if (
		((config.organizations.enable && config.organizations.enableBilling) ||
			config.users.enableBilling) &&
		!hasFreePlan
	) {
		const organizationId = config.organizations.enable
			? session?.session.activeOrganizationId || organizations?.at(0)?.id
			: undefined;

		const [error, data] = await attemptAsync(() =>
			orpcClient.payments.listPurchases({
				organizationId,
			}),
		);

		if (error) {
			throw new Error("Failed to fetch purchases");
		}

		const purchases = data?.purchases ?? [];

		const { activePlan } = createPurchasesHelper(purchases);

		if (!activePlan) {
			redirect("/choose-plan");
		}
	}

	return children;
}
