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
import { Tabs, TabsList, TabsTrigger } from "@ui/components/tabs";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@ui/components/select";
import { cn } from "@ui/lib";
import { useQuery } from "@tanstack/react-query";
import { useActiveOrganization } from "@saas/organizations/hooks/use-active-organization";
import { sharesApi } from "@saas/shares/lib/api";
import { useRouter } from "next/navigation";
import { SearchResultItem } from "./SearchResultItem";

interface SearchModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function SearchModal({ open, onOpenChange }: SearchModalProps) {
	const t = useTranslations();
	const router = useRouter();
	const { activeOrganization } = useActiveOrganization();
	const [searchQuery, setSearchQuery] = React.useState("");
	const [activeTab, setActiveTab] = React.useState<"all" | "shares">("all");
	const [typeFilter, setTypeFilter] = React.useState<
		"all" | "STYLE_GUIDE" | "HEADING_STRUCTURE"
	>("all");

	// Derived state
	const isSearching = searchQuery.trim().length >= 2;
	const showMinCharMessage = searchQuery.length > 0 && !isSearching;
	const showRecentShares = !isSearching && !searchQuery.trim();
	const showSearchResults = isSearching;

	// Query: Recent shares (when not searching)
	const { data: recentShares } = useQuery({
		queryKey: ["recent-shares", activeOrganization?.id],
		queryFn: () => {
			if (!activeOrganization) return [];
			return sharesApi.listWorkspaceShares(
				activeOrganization.id,
				"all",
				"all",
			);
		},
		enabled: !!activeOrganization && showRecentShares,
	});

	// Query: Search results (when searching)
	const effectiveTypeFilter = activeTab === "shares" ? typeFilter : "all";
	const { data: searchResults, isLoading: isLoadingSearch } = useQuery({
		queryKey: [
			"shares-search",
			activeOrganization?.id,
			searchQuery.trim(),
			effectiveTypeFilter,
		],
		queryFn: async () => {
			if (!activeOrganization || !searchQuery.trim()) return [];
			return sharesApi.searchShares(
				activeOrganization.id,
				searchQuery.trim(),
				effectiveTypeFilter,
			);
		},
		enabled: !!activeOrganization && searchQuery.trim().length >= 2,
	});

	// Reset search query when modal closes
	React.useEffect(() => {
		if (!open) {
			setSearchQuery("");
			setActiveTab("all");
			setTypeFilter("all");
		}
	}, [open]);

	const handleShareSelect = (shareId: string) => {
		router.push(`/share/${shareId}`);
		onOpenChange(false);
	};

	// Filter recent shares by type if on "Shares" tab
	const filteredRecentShares = React.useMemo(() => {
		if (!recentShares) return [];
		if (activeTab === "all") return recentShares;
		if (typeFilter === "all") return recentShares;
		return recentShares.filter((share) => share.type === typeFilter);
	}, [recentShares, typeFilter, activeTab]);

	// Filter search results based on active tab
	const filteredSearchResults = React.useMemo(() => {
		if (!searchResults) return [];
		if (activeTab === "all") {
			// For "All" tab, show all results (type filter already applied in API)
			return searchResults;
		}
		// For "Shares" tab, type filter is already applied in API
		return searchResults;
	}, [searchResults, activeTab]);

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogHeader className="sr-only">
				<DialogTitle>Search</DialogTitle>
				<DialogDescription>
					Search for shares and more
				</DialogDescription>
			</DialogHeader>
			<DialogContent
				className={cn(
					"overflow-hidden p-0 max-w-2xl [&>button]:hidden",
				)}
			>
				<Command
					shouldFilter={false}
					className="[&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group-heading]]:px-0 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group]]:px-1 [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-input-wrapper]]:h-12 [&_[cmdk-input-wrapper]]:px-4 [&_[cmdk-input-wrapper]]:pr-11 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-input]]:text-base [&_[cmdk-item]]:px-3 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5 p-4"
				>
					<CommandInput
						placeholder={t("shares.searchPlaceholder")}
						value={searchQuery}
						onValueChange={setSearchQuery}
					/>
					<div className="flex items-center justify-between gap-2 py-3 border-b">
						<Tabs
							value={activeTab}
							onValueChange={(v) =>
								setActiveTab(v as "all" | "shares")
							}
						>
							<TabsList className="bg-background">
								<TabsTrigger
									value="all"
									className="data-[state=active]:bg-muted"
								>
									{t("shares.searchTabs.all")}
								</TabsTrigger>
								<TabsTrigger
									value="shares"
									className="data-[state=active]:bg-muted"
								>
									{t("shares.searchTabs.shares")}
								</TabsTrigger>
							</TabsList>
						</Tabs>
						{activeTab === "shares" && (
							<Select
								value={typeFilter}
								onValueChange={(v) =>
									setTypeFilter(
										v as
											| "all"
											| "STYLE_GUIDE"
											| "HEADING_STRUCTURE",
									)
								}
							>
								<SelectTrigger className="w-[180px]">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">
										{t("shares.allTypes")}
									</SelectItem>
									<SelectItem value="STYLE_GUIDE">
										{t("shares.styleGuide")}
									</SelectItem>
									<SelectItem value="HEADING_STRUCTURE">
										{t("shares.headingStructure")}
									</SelectItem>
								</SelectContent>
							</Select>
						)}
					</div>
					<CommandList>
						{showMinCharMessage && (
							<div className="py-6 text-center text-sm text-muted-foreground">
								{t("shares.searchMinChars")}
							</div>
						)}

						{showRecentShares && (
							<>
								{filteredRecentShares &&
								filteredRecentShares.length > 0 ? (
									<CommandGroup
										heading={t("shares.recentShares")}
									>
										{filteredRecentShares
											.slice(0, 10)
											.map((share) => (
												<CommandItem
													key={share.id}
													onSelect={() =>
														handleShareSelect(
															share.shareId,
														)
													}
												>
													<SearchResultItem
														share={share}
													/>
												</CommandItem>
											))}
									</CommandGroup>
								) : (
									<CommandEmpty>
										{t("shares.noShares")}
									</CommandEmpty>
								)}
							</>
						)}

						{showSearchResults && (
							<>
								{isLoadingSearch ? (
									<div className="py-6 text-center text-sm text-muted-foreground">
										Searching...
									</div>
								) : filteredSearchResults &&
								  filteredSearchResults.length > 0 ? (
									<CommandGroup heading={t("shares.title")}>
										{filteredSearchResults.map((share) => (
											<CommandItem
												key={share.id}
												onSelect={() =>
													handleShareSelect(
														share.shareId,
													)
												}
											>
												<SearchResultItem
													share={share}
												/>
											</CommandItem>
										))}
									</CommandGroup>
								) : (
									<CommandEmpty>
										{t("shares.noResults")}
									</CommandEmpty>
								)}
							</>
						)}
					</CommandList>
				</Command>
			</DialogContent>
		</Dialog>
	);
}
