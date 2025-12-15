"use client";

import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsList, TabsTrigger } from "@ui/components/tabs";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@ui/components/select";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { sharesApi } from "../lib/api";
import { ShareCard } from "./ShareCard";
import { Skeleton } from "@ui/components/skeleton";

interface SharesListProps {
	organizationId: string;
}

export function SharesList({ organizationId }: SharesListProps) {
	const t = useTranslations();
	const [filter, setFilter] = useState<"all" | "my">("all");
	const [typeFilter, setTypeFilter] = useState<
		"all" | "STYLE_GUIDE" | "HEADING_STRUCTURE"
	>("all");

	// Fetch shares
	const {
		data: shares,
		isLoading,
		refetch,
	} = useQuery({
		queryKey: ["shares", organizationId, filter, typeFilter],
		queryFn: () =>
			sharesApi.listWorkspaceShares(organizationId, filter, typeFilter),
		enabled: !!organizationId,
	});

	if (isLoading) {
		return (
			<div className="space-y-4">
				<div className="flex items-center justify-between gap-4">
					{/* User Filter (All/My) */}
					<Tabs
						value={filter}
						onValueChange={(v) => setFilter(v as "all" | "my")}
					>
						<TabsList>
							<TabsTrigger value="all">
								{t("shares.allShares")}
							</TabsTrigger>
							<TabsTrigger value="my">
								{t("shares.myShares")}
							</TabsTrigger>
						</TabsList>
					</Tabs>

					{/* Type Filter */}
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
				</div>
				<div className="space-y-3">
					{Array.from({ length: 6 }).map((_, i) => (
						<Skeleton key={i} className="h-28" />
					))}
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-4">
			{/* Filters */}
			<div className="flex items-center justify-between gap-4">
				{/* User Filter (All/My) */}
				<Tabs
					value={filter}
					onValueChange={(v) => setFilter(v as "all" | "my")}
				>
					<TabsList>
						<TabsTrigger value="all">
							{t("shares.allShares")}
						</TabsTrigger>
						<TabsTrigger value="my">
							{t("shares.myShares")}
						</TabsTrigger>
					</TabsList>
				</Tabs>

				{/* Type Filter */}
				<Select
					value={typeFilter}
					onValueChange={(v) =>
						setTypeFilter(
							v as "all" | "STYLE_GUIDE" | "HEADING_STRUCTURE",
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
			</div>

			{/* Shares List */}
			{!shares || shares.length === 0 ? (
				<div className="text-center py-12">
					<p className="text-muted-foreground">
						{t("shares.noShares")}
					</p>
					<p className="text-sm text-muted-foreground mt-2">
						{t("shares.noSharesDescription")}
					</p>
				</div>
			) : (
				<div className="space-y-3">
					{shares.map((share) => (
						<ShareCard
							key={share.id}
							share={share}
							onUpdate={() => refetch()}
						/>
					))}
				</div>
			)}
		</div>
	);
}
