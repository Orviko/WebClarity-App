"use client";

import { config } from "@repo/config";
import { useActiveOrganization } from "@saas/organizations/hooks/use-active-organization";
import { AppSidebar } from "@saas/shared/components/AppSidebar";
import { DashboardHeader } from "@saas/shared/components/DashboardHeader";
import { LoadingScreen } from "@shared/components/LoadingScreen";
import { SidebarInset, SidebarProvider } from "@ui/components/sidebar";
import { cn } from "@ui/lib";
import { useParams } from "next/navigation";
import type { PropsWithChildren } from "react";

export function AppWrapper({ children }: PropsWithChildren) {
	const { useSidebarLayout } = config.ui.saas;
	const params = useParams();
	const organizationSlug = params?.organizationSlug as string | undefined;
	const { loaded, activeOrganization } = useActiveOrganization();

	// Show loading screen while workspace data is loading
	// Only apply loading state if we're in an organization route
	const isLoadingWorkspaceData = organizationSlug && !loaded;

	if (!useSidebarLayout) {
		// Fallback to old layout if sidebar is disabled
		return (
			<div
				className={cn(
					"bg-[radial-gradient(farthest-corner_at_0%_0%,color-mix(in_oklch,var(--color-primary),transparent_95%)_0%,var(--color-background)_50%)] dark:bg-[radial-gradient(farthest-corner_at_0%_0%,color-mix(in_oklch,var(--color-primary),transparent_90%)_0%,var(--color-background)_50%)]",
				)}
			>
				<div className="md:pr-4 py-4 flex">
					<main className="py-6 border rounded-2xl bg-card px-4 md:p-8 min-h-full w-full">
						<div className="container px-0">{children}</div>
					</main>
				</div>
			</div>
		);
	}

	// Show loading screen until workspace data is ready
	if (isLoadingWorkspaceData) {
		return <LoadingScreen message="Loading workspace..." />;
	}

	return (
		<div className="h-screen overflow-hidden bg-background">
			<SidebarProvider className="h-full w-full">
				<AppSidebar />
				<SidebarInset className="flex flex-col overflow-hidden h-full md:h-[calc(100svh-1rem)] ml-0!">
					<DashboardHeader />
					<div className="flex-1 overflow-y-auto p-4 pt-0">
						<div className="flex flex-col gap-4">{children}</div>
					</div>
				</SidebarInset>
			</SidebarProvider>
		</div>
	);
}
