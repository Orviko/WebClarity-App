"use client";

import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@ui/components/breadcrumb";
import { Separator } from "@ui/components/separator";
import { SidebarTrigger } from "@ui/components/sidebar";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { useActiveOrganization } from "@saas/organizations/hooks/use-active-organization";

function generateBreadcrumbs(
	pathname: string,
	basePath: string,
	t: ReturnType<typeof useTranslations>,
) {
	const segments = pathname.split("/").filter(Boolean);
	const breadcrumbs: { label: string; href: string }[] = [];

	// Known route segments that should appear in breadcrumbs
	const knownRoutes = [
		"admin",
		"projects",
		"reports",
		"shares",
		"resources",
		"settings",
	];

	// Handle admin routes separately
	const isAdminRoute = segments[0] === "admin";

	if (isAdminRoute) {
		// For admin routes, start with Dashboard, then Admin, then sub-routes
		breadcrumbs.push({
			label: t("app.menu.dashboard"),
			href: basePath,
		});

		// Add Admin breadcrumb
		if (segments.length > 1) {
			breadcrumbs.push({
				label: t("app.menu.admin"),
				href: "/admin",
			});
		}

		// Add remaining admin sub-routes
		let currentPath = "/admin";
		for (let i = 1; i < segments.length; i++) {
			const segment = segments[i];
			currentPath += `/${segment}`;

			const label = segment
				.split("-")
				.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
				.join(" ");

			breadcrumbs.push({ label, href: currentPath });
		}

		return breadcrumbs;
	}

	// Handle workspace routes - filter out "workspace" and organization slug
	const filteredSegments: string[] = [];
	let skipNext = false;

	for (let i = 0; i < segments.length; i++) {
		const segment = segments[i];

		// Skip "workspace" segment
		if (segment === "workspace") {
			skipNext = true; // Next segment is likely the organization slug
			continue;
		}

		// Skip organization slug (the segment after "workspace" that's not a known route)
		if (skipNext && !knownRoutes.includes(segment)) {
			skipNext = false;
			continue;
		}

		skipNext = false;
		filteredSegments.push(segment);
	}

	// Add "Dashboard" as the first breadcrumb
	breadcrumbs.push({
		label: t("app.menu.dashboard"),
		href: basePath,
	});

	// Build breadcrumbs from remaining segments
	let currentPath = basePath;
	for (let i = 0; i < filteredSegments.length; i++) {
		const segment = filteredSegments[i];
		currentPath += `/${segment}`;

		// Format segment name (capitalize, replace hyphens with spaces)
		const label = segment
			.split("-")
			.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
			.join(" ");

		breadcrumbs.push({ label, href: currentPath });
	}

	return breadcrumbs;
}

export function DashboardHeader() {
	const pathname = usePathname();
	const t = useTranslations();
	const { activeOrganization } = useActiveOrganization();

	// Determine base path for the current organization
	const basePath = activeOrganization?.slug
		? `/${activeOrganization.slug}`
		: "/";

	// Check if we're on specific dashboard pages
	const isWorkspaceDashboard =
		pathname === basePath || pathname === `${basePath}/`;
	const isAdminDashboard = pathname === "/admin" || pathname === "/admin/";

	// Don't show breadcrumb on the main workspace pages
	if (pathname === "/" || pathname === "/admin" || pathname === "/admin/") {
		return (
			<header className="flex h-16 shrink-0 items-center gap-2">
				<div className="flex items-center gap-2 px-4">
					<SidebarTrigger className="-ml-1" />
				</div>
			</header>
		);
	}

	const breadcrumbs =
		isWorkspaceDashboard || isAdminDashboard
			? [
					{
						label: t("app.menu.dashboard"),
						href: isAdminDashboard ? "/admin" : basePath,
					},
				]
			: generateBreadcrumbs(pathname, basePath, t);

	return (
		<header className="flex h-16 shrink-0 items-center gap-2">
			<div className="flex items-center gap-2 px-4">
				<SidebarTrigger className="-ml-1" />
				<Separator
					orientation="vertical"
					className="mr-2 data-[orientation=vertical]:h-4"
				/>
				<Breadcrumb>
					<BreadcrumbList>
						{breadcrumbs.map((crumb, index) => {
							const isLast = index === breadcrumbs.length - 1;
							return (
								<div
									key={crumb.href}
									className="flex items-center gap-2"
								>
									<BreadcrumbItem
										className={
											index === 0 ? "hidden md:block" : ""
										}
									>
										{isLast ? (
											<BreadcrumbPage>
												{crumb.label}
											</BreadcrumbPage>
										) : (
											<BreadcrumbLink href={crumb.href}>
												{crumb.label}
											</BreadcrumbLink>
										)}
									</BreadcrumbItem>
									{!isLast && (
										<BreadcrumbSeparator
											className={
												index === 0
													? "hidden md:block"
													: ""
											}
										/>
									)}
								</div>
							);
						})}
					</BreadcrumbList>
				</Breadcrumb>
			</div>
		</header>
	);
}
