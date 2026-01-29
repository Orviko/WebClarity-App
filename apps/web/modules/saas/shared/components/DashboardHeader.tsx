"use client";

import { Separator } from "@ui/components/separator";
import { SidebarTrigger } from "@ui/components/sidebar";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { useActiveOrganization } from "@saas/organizations/hooks/use-active-organization";
import {
	BookOpenIcon,
	FileTextIcon,
	FolderKanbanIcon,
	LayoutDashboardIcon,
	SettingsIcon,
	Share2Icon,
	UserCogIcon,
	UsersIcon,
	Building2Icon,
	type LucideIcon,
} from "lucide-react";

interface PageInfo {
	label: string;
	icon: LucideIcon;
}

function getCurrentPageInfo(
	pathname: string,
	basePath: string,
	t: ReturnType<typeof useTranslations>,
): PageInfo | null {
	const segments = pathname.split("/").filter(Boolean);

	// Handle admin routes
	if (pathname.startsWith("/admin")) {
		if (pathname === "/admin" || pathname === "/admin/") {
			return {
				label: t("admin.menu.dashboard"),
				icon: LayoutDashboardIcon,
			};
		}

		if (pathname.startsWith("/admin/users")) {
			return {
				label: t("admin.menu.users"),
				icon: UsersIcon,
			};
		}

		if (pathname.startsWith("/admin/workspaces")) {
			return {
				label: t("admin.menu.workspaces"),
				icon: Building2Icon,
			};
		}

		// For other admin sub-routes, show formatted name with default icon
		const lastSegment = segments[segments.length - 1];
		const label = lastSegment
			.split("-")
			.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
			.join(" ");

		return {
			label,
			icon: LayoutDashboardIcon,
		};
	}

	// Handle workspace routes
	if (pathname === basePath || pathname === `${basePath}/`) {
		return {
			label: t("app.menu.dashboard"),
			icon: LayoutDashboardIcon,
		};
	}

	if (pathname.includes("/projects")) {
		return {
			label: t("app.menu.projects"),
			icon: FolderKanbanIcon,
		};
	}

	if (pathname.includes("/reports")) {
		return {
			label: t("app.menu.reports"),
			icon: FileTextIcon,
		};
	}

	if (pathname.includes("/shares")) {
		return {
			label: t("app.menu.shares"),
			icon: Share2Icon,
		};
	}

	if (pathname.includes("/resources")) {
		return {
			label: t("app.menu.resources"),
			icon: BookOpenIcon,
		};
	}

	if (pathname.includes("/settings")) {
		return {
			label: t("app.menu.organizationSettings"),
			icon: SettingsIcon,
		};
	}

	// For unknown routes, try to format the last segment
	const lastSegment = segments[segments.length - 1];
	if (lastSegment && lastSegment !== "workspace") {
		const label = lastSegment
			.split("-")
			.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
			.join(" ");

		return {
			label,
			icon: LayoutDashboardIcon,
		};
	}

	return null;
}

export function DashboardHeader() {
	const pathname = usePathname();
	const t = useTranslations();
	const { activeOrganization } = useActiveOrganization();

	// Determine base path for the current organization
	const basePath = activeOrganization?.slug
		? `/workspace/${activeOrganization.slug}`
		: "/workspace";

	// Get current page info
	const pageInfo = getCurrentPageInfo(pathname, basePath, t);

	// Don't show page info if we couldn't determine it
	if (!pageInfo) {
		return (
			<header className="flex h-16 shrink-0 items-center gap-2">
				<div className="flex items-center gap-2 px-4">
					<SidebarTrigger className="-ml-1" />
				</div>
			</header>
		);
	}

	const PageIcon = pageInfo.icon;

	return (
		<header className="flex h-16 shrink-0 items-center gap-2">
			<div className="flex items-center gap-2 px-4">
				<SidebarTrigger className="-ml-1" />
				<Separator
					orientation="vertical"
					className="mr-2 data-[orientation=vertical]:h-4"
				/>
				<div className="flex items-center gap-2">
					<PageIcon className="size-3 text-muted-foreground" />
					<span className="text-sm font-regular text-muted-foreground">
						{pageInfo.label}
					</span>
				</div>
			</div>
		</header>
	);
}
