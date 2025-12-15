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

	// If user is not logged in, redirect to login
	if (!session) {
		redirect("/auth/login");
	}

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
			redirect(`/app/${defaultOrganization.slug}`);
		} else {
			// No organizations available, redirect to /app which will handle it
			redirect("/app");
		}
	}

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
