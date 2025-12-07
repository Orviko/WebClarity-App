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
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarRail,
} from "@ui/components/sidebar";
import {
	BotMessageSquareIcon,
	HomeIcon,
	SettingsIcon,
	UserCog2Icon,
	UserCogIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { NavUser } from "./NavUser";
import { WorkspaceSwitcher } from "./WorkspaceSwitcher";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
	const t = useTranslations();
	const pathname = usePathname();
	const { user } = useSession();
	const { activeOrganization, isOrganizationAdmin } = useActiveOrganization();

	const basePath = activeOrganization
		? `/app/${activeOrganization.slug}`
		: "/app";

	const menuItems = [
		{
			label: t("app.menu.start"),
			href: basePath,
			icon: HomeIcon,
			isActive: pathname === basePath,
		},
		{
			label: t("app.menu.aiChatbot"),
			href: activeOrganization
				? `/app/${activeOrganization.slug}/chatbot`
				: "/app/chatbot",
			icon: BotMessageSquareIcon,
			isActive: pathname.includes("/chatbot"),
		},
		...(activeOrganization && isOrganizationAdmin
			? [
					{
						label: t("app.menu.organizationSettings"),
						href: `${basePath}/settings`,
						icon: SettingsIcon,
						isActive: pathname.startsWith(`${basePath}/settings/`),
					},
				]
			: []),
		{
			label: t("app.menu.accountSettings"),
			href: "/app/settings",
			icon: UserCog2Icon,
			isActive: pathname.startsWith("/app/settings/"),
		},
		...(user?.role === "admin"
			? [
					{
						label: t("app.menu.admin"),
						href: "/app/admin",
						icon: UserCogIcon,
						isActive: pathname.startsWith("/app/admin/"),
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
									>
										<Link href={item.href}>
											<item.icon />
											<span>{item.label}</span>
										</Link>
									</SidebarMenuButton>
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
		</Sidebar>
	);
}
