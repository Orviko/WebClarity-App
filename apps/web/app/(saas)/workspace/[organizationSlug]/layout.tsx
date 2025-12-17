import { config } from "@repo/config";
import {
	getActiveOrganization,
	getOrganizationList,
	getSession,
} from "@saas/auth/lib/server";
import { activeOrganizationQueryKey } from "@saas/organizations/lib/api";
import { AppWrapper } from "@saas/shared/components/AppWrapper";
import { orpc } from "@shared/lib/orpc-query-utils";
import { getServerQueryClient } from "@shared/lib/server";
import { redirect } from "next/navigation";
import type { PropsWithChildren } from "react";

/**
 * Layout for /workspace/[organizationSlug] routes
 * 
 * Note: Authentication is now handled by middleware.
 * This layout focuses on organization access validation and data prefetching.
 */
export default async function OrganizationLayout({
	children,
	params,
}: PropsWithChildren<{
	params: Promise<{
		organizationSlug: string;
	}>;
}>) {
	const { organizationSlug } = await params;
	const session = await getSession();
	const organization = await getActiveOrganization(organizationSlug);

	// If organization not found or user doesn't have access, redirect to default workspace
	if (!organization) {
		const organizations = await getOrganizationList();

		// Find user's default workspace (active org or first org)
		const defaultOrganization =
			organizations.find(
				(org) => org.id === session?.session.activeOrganizationId,
			) || organizations[0];

		if (defaultOrganization) {
			redirect(`/workspace/${defaultOrganization.slug}`);
		} else {
			// No organizations available, redirect to onboarding
			redirect("/onboarding");
		}
	}

	// Prefetch organization data for client components
	const queryClient = getServerQueryClient();

	await queryClient.prefetchQuery({
		queryKey: activeOrganizationQueryKey(organizationSlug),
		queryFn: () => organization,
	});

	if (config.users.enableBilling) {
		await queryClient.prefetchQuery(
			orpc.payments.listPurchases.queryOptions({
				input: {
					organizationId: organization.id,
				},
			}),
		);
	}

	return <AppWrapper>{children}</AppWrapper>;
}
