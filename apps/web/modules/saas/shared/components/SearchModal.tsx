"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@ui/components/dialog";
import {
	Command,
	CommandInput,
	CommandList,
	CommandEmpty,
	CommandGroup,
	CommandItem,
} from "@ui/components/command";
import { ArrowRightIcon, Share2Icon } from "lucide-react";
import { cn } from "@ui/lib";
import { useQuery } from "@tanstack/react-query";
import { useActiveOrganization } from "@saas/organizations/hooks/use-active-organization";
import { sharesApi } from "@saas/shares/lib/api";
import { Badge } from "@ui/components/badge";
import { useRouter } from "next/navigation";

interface SearchModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function SearchModal({ open, onOpenChange }: SearchModalProps) {
	const t = useTranslations();
	const router = useRouter();
	const { activeOrganization } = useActiveOrganization();
	const [searchQuery, setSearchQuery] = React.useState("");

	// Search shares when query is provided and organization exists
	const { data: shares } = useQuery({
		queryKey: ["shares-search", activeOrganization?.id, searchQuery],
		queryFn: () => {
			if (!activeOrganization || !searchQuery.trim()) return [];
			return sharesApi.searchShares(activeOrganization.id, searchQuery);
		},
		enabled: !!activeOrganization && searchQuery.trim().length > 0,
	});

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogHeader className="sr-only">
				<DialogTitle>Search documentation...</DialogTitle>
				<DialogDescription>
					Search for a command to run...
				</DialogDescription>
			</DialogHeader>
			<DialogContent
				className={cn(
					"overflow-hidden p-2 max-w-2xl sm:max-w-lg [&>button]:hidden",
				)}
			>
				<Command className="[&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group]]:px-1 [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-input-wrapper]_svg]:h-4 [&_[cmdk-input-wrapper]_svg]:w-4 [&_[cmdk-item]]:px-3 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5">
					<CommandInput 
						placeholder={t("shares.searchPlaceholder")} 
						value={searchQuery}
						onValueChange={setSearchQuery}
					/>
					<CommandList>
						<CommandEmpty>No results found.</CommandEmpty>
						{shares && shares.length > 0 && (
							<CommandGroup heading={t("shares.title")}>
								{shares.map((share) => (
									<CommandItem
										key={share.id}
										onSelect={() => {
											router.push(`/share/${share.shareId}`);
											onOpenChange(false);
										}}
									>
										<Share2Icon className="mr-2 h-4 w-4" />
										<div className="flex items-center gap-2 flex-1 min-w-0">
											<span className="truncate">{share.title || share.websiteUrl}</span>
											<Badge status="info" className="text-xs shrink-0">
												{share.type === "STYLE_GUIDE"
													? t("shares.styleGuide")
													: t("shares.headingStructure")}
											</Badge>
											{share.isExpired && (
												<Badge status="error" className="text-xs shrink-0">
													{t("shares.expired")}
												</Badge>
											)}
										</div>
									</CommandItem>
								))}
							</CommandGroup>
						)}
						<CommandGroup heading="Pages">
							<CommandItem>
								<ArrowRightIcon className="size-4" />
								<span>Docs</span>
							</CommandItem>
							<CommandItem>
								<ArrowRightIcon className="size-4" />
								<span>Components</span>
							</CommandItem>
							<CommandItem>
								<ArrowRightIcon className="size-4" />
								<span>Blocks</span>
							</CommandItem>
							<CommandItem>
								<ArrowRightIcon className="size-4" />
								<span>Charts</span>
							</CommandItem>
							<CommandItem>
								<ArrowRightIcon className="size-4" />
								<span>Directory</span>
							</CommandItem>
							<CommandItem>
								<ArrowRightIcon className="size-4" />
								<span>Create</span>
							</CommandItem>
						</CommandGroup>
						<CommandGroup heading="Get Started">
							<CommandItem>
								<ArrowRightIcon className="size-4" />
								<span>Introduction</span>
							</CommandItem>
						</CommandGroup>
					</CommandList>
				</Command>
			</DialogContent>
		</Dialog>
	);
}
