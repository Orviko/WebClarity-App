"use client";

import { config } from "@repo/config";
import { useSession } from "@saas/auth/hooks/use-session";
import { useActiveOrganization } from "@saas/organizations/hooks/use-active-organization";
import { Logo } from "@shared/components/Logo";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupContent,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuAction,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarRail,
} from "@ui/components/sidebar";
import {
	ArchiveIcon,
	BookOpenIcon,
	BotMessageSquareIcon,
	FolderKanbanIcon,
	LayoutDashboardIcon,
	LayoutListIcon,
	PlusIcon,
	SettingsIcon,
	UserCog2Icon,
	UserCogIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { NavUser } from "./NavUser";
import { WorkspaceSwitcher } from "./WorkspaceSwitcher";
import { CreateProjectDialog } from "./CreateProjectDialog";
import { CreateBoardDialog } from "./CreateBoardDialog";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
	const t = useTranslations();
	const pathname = usePathname();
	const { user } = useSession();
	const { activeOrganization, isOrganizationAdmin } = useActiveOrganization();
	const [isProjectDialogOpen, setIsProjectDialogOpen] = useState(false);
	const [isBoardDialogOpen, setIsBoardDialogOpen] = useState(false);

	const basePath = activeOrganization
		? `/app/${activeOrganization.slug}`
		: "/app";

	const menuItems = [
		{
			label: t("app.menu.dashboard"),
			href: basePath,
			icon: LayoutDashboardIcon,
			isActive: pathname === basePath,
			hasAction: false,
		},
		{
			label: t("app.menu.projects"),
			href: `${basePath}/projects`,
			icon: FolderKanbanIcon,
			isActive: pathname.includes("/projects"),
			hasAction: true,
			onActionClick: () => setIsProjectDialogOpen(true),
		},
		{
			label: t("app.menu.boards"),
			href: `${basePath}/boards`,
			icon: LayoutListIcon,
			isActive: pathname.includes("/boards"),
			hasAction: true,
			onActionClick: () => setIsBoardDialogOpen(true),
		},
		{
			label: t("app.menu.resources"),
			href: `${basePath}/resources`,
			icon: BookOpenIcon,
			isActive: pathname.includes("/resources"),
			hasAction: false,
		},
		{
			label: t("app.menu.archive"),
			href: `${basePath}/archive`,
			icon: ArchiveIcon,
			isActive: pathname.includes("/archive"),
			hasAction: false,
		},
		{
			label: t("app.menu.aiChatbot"),
			href: activeOrganization
				? `/app/${activeOrganization.slug}/chatbot`
				: "/app/chatbot",
			icon: BotMessageSquareIcon,
			isActive: pathname.includes("/chatbot"),
			hasAction: false,
		},
		...(activeOrganization && isOrganizationAdmin
			? [
					{
						label: t("app.menu.organizationSettings"),
						href: `${basePath}/settings`,
						icon: SettingsIcon,
						isActive: pathname.startsWith(`${basePath}/settings/`),
						hasAction: false,
					},
				]
			: []),
		{
			label: t("app.menu.accountSettings"),
			href: "/app/settings",
			icon: UserCog2Icon,
			isActive: pathname.startsWith("/app/settings/"),
			hasAction: false,
		},
		...(user?.role === "admin"
			? [
					{
						label: t("app.menu.admin"),
						href: "/app/admin",
						icon: UserCogIcon,
						isActive: pathname.startsWith("/app/admin/"),
						hasAction: false,
					},
				]
			: []),
	];

	return (
		<Sidebar collapsible="icon" variant="inset" {...props}>
			<SidebarHeader>
				{config.organizations.enable &&
					!config.organizations.hideOrganization && (
						<WorkspaceSwitcher />
					)}
			</SidebarHeader>
			<SidebarContent>
				<SidebarGroup>
					<SidebarGroupContent>
						<SidebarMenu>
							{menuItems.map((item) => (
								<SidebarMenuItem key={item.href}>
									<SidebarMenuButton
										asChild
										isActive={item.isActive}
										tooltip={item.label}
										className="h-10! px-3! py-1.5! text-base!"
									>
										<Link href={item.href}>
											<item.icon />
											<span>{item.label}</span>
										</Link>
									</SidebarMenuButton>
									{item.hasAction && item.onActionClick && (
										<SidebarMenuAction
											onClick={item.onActionClick}
											className="top-1/2! -translate-y-1/2! right-1! w-auto! h-auto! aspect-auto! p-1.5! rounded-md! hover:bg-sidebar-accent!"
										>
											<PlusIcon className="size-4" />
										</SidebarMenuAction>
									)}
								</SidebarMenuItem>
							))}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
			</SidebarContent>
			<SidebarFooter>
				<NavUser />
			</SidebarFooter>
			<SidebarRail />
			<CreateProjectDialog
				open={isProjectDialogOpen}
				onOpenChange={setIsProjectDialogOpen}
			/>
			<CreateBoardDialog
				open={isBoardDialogOpen}
				onOpenChange={setIsBoardDialogOpen}
			/>
		</Sidebar>
	);
}
