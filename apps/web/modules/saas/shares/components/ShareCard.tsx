"use client";

import { UserAvatar } from "@shared/components/UserAvatar";
import { Badge } from "@ui/components/badge";
import { Button } from "@ui/components/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@ui/components/dropdown-menu";
import { formatExpiry } from "../lib/format-expiry";
import {
	MoreVerticalIcon,
	CopyIcon,
	CheckIcon,
	ExternalLinkIcon,
	PencilIcon,
	TrashIcon,
	RefreshCwIcon,
} from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useState } from "react";
import { RenameShareDialog } from "./RenameShareDialog";
import { DeleteShareDialog } from "./DeleteShareDialog";
import { RenewShareDialog } from "./RenewShareDialog";
import { cn } from "@ui/lib";

type Share = {
	id: string;
	shareId: string;
	title: string | null;
	websiteUrl: string;
	viewCount: number;
	isExpired: boolean;
	expiresAt: Date;
	shareOgImageUrl: string | null;
	type: "STYLE_GUIDE" | "HEADING_STRUCTURE";
	user: {
		id: string;
		name: string;
		image: string | null;
	} | null;
};

interface ShareCardProps {
	share: Share;
	onUpdate?: () => void;
}

export function ShareCard({ share, onUpdate }: ShareCardProps) {
	const t = useTranslations();
	const [isRenameOpen, setIsRenameOpen] = useState(false);
	const [isDeleteOpen, setIsDeleteOpen] = useState(false);
	const [isRenewOpen, setIsRenewOpen] = useState(false);
	const [copied, setCopied] = useState(false);

	const shareUrl =
		typeof window !== "undefined"
			? `${window.location.origin}/share/${share.shareId}`
			: `/share/${share.shareId}`;

	const handleCopyLink = async (e: React.MouseEvent) => {
		e.stopPropagation();
		try {
			await navigator.clipboard.writeText(shareUrl);
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		} catch (error) {
			console.error("Failed to copy link:", error);
		}
	};

	const handleView = (e: React.MouseEvent) => {
		e.stopPropagation();
		window.open(shareUrl, "_blank", "noopener,noreferrer");
	};

	// Use the actual title from database - no prefix logic, just show what's stored
	const displayTitle = share.title || share.websiteUrl;
	const reportTypeLabel =
		share.type === "STYLE_GUIDE"
			? t("shares.styleGuide")
			: t("shares.headingStructure");

	return (
		<>
			<div
				className={cn(
					"group relative flex items-center gap-4 p-3 pr-4 rounded-2xl border bg-card hover:shadow-md transition-all",
					share.isExpired && "opacity-60",
				)}
			>
				{/* Thumbnail - OG images are 1200x630 (aspect ratio 1.9:1) */}
				{share.shareOgImageUrl ? (
					<div className="relative w-48 aspect-[1.9/1] flex-shrink-0 overflow-hidden rounded-lg border">
						<Image
							src={share.shareOgImageUrl}
							alt={displayTitle}
							fill
							className="object-cover"
							sizes="160px"
						/>
					</div>
				) : (
					<div className="w-48 aspect-[1.9/1] flex-shrink-0 rounded-lg border bg-muted flex items-center justify-center">
						<span className="text-xs text-muted-foreground">
							No image
						</span>
					</div>
				)}

				{/* Content - Left Aligned */}
				<div className="flex-1 min-w-0 py-1 flex items-center gap-4">
					{/* Title, Website, Creator, and Badges */}
					<div className="flex-1 min-w-0 flex flex-col gap-2">
						{/* Title and Website */}
						<div>
							<h3 className="font-semibold text-base truncate mb-1">
								{displayTitle}
							</h3>
							<p className="text-sm text-muted-foreground truncate">
								{share.websiteUrl}
							</p>
						</div>

						{/* Creator and Badges Row */}
						<div className="flex items-center gap-3 flex-wrap">
							{/* Creator */}
							{share.user && (
								<div className="flex items-center gap-2">
									<UserAvatar
										name={share.user.name}
										avatarUrl={share.user.image}
										className="h-5 w-5"
									/>
									<span className="text-sm text-muted-foreground whitespace-nowrap">
										{share.user.name}
									</span>
								</div>
							)}

							{/* Stats and Badges */}
							<div className="flex items-center gap-2 flex-wrap">
								{/* Expiry Badge */}
								<Badge
									status={
										share.isExpired ? "error" : "success"
									}
									className="whitespace-nowrap"
								>
									{share.isExpired
										? t("shares.expired")
										: formatExpiry(
												new Date(share.expiresAt),
											)}
								</Badge>

								{/* View Count Badge */}
								<Badge
									status="info"
									className="whitespace-nowrap"
								>
									{t("shares.viewCount", {
										count: share.viewCount,
									})}
								</Badge>

								{/* Report Type Badge */}
								<Badge
									status={
										share.type === "STYLE_GUIDE"
											? "info"
											: "warning"
									}
									className="whitespace-nowrap"
								>
									{reportTypeLabel}
								</Badge>
							</div>
						</div>
					</div>

					{/* Actions - Right Side */}
					<div className="flex items-center gap-2 flex-shrink-0">
						{/* View Button */}
						<Button
							variant="outline"
							size="sm"
							onClick={handleView}
							className="gap-2"
						>
							<ExternalLinkIcon className="h-4 w-4" />
							{t("shares.view")}
						</Button>

						{/* Copy Button */}
						<Button
							variant="outline"
							size="sm"
							onClick={handleCopyLink}
							className="gap-2"
						>
							{copied ? (
								<>
									<CheckIcon className="h-4 w-4" />
									{t("shares.copied")}
								</>
							) : (
								<>
									<CopyIcon className="h-4 w-4" />
									{t("shares.copy")}
								</>
							)}
						</Button>

						{/* More Actions Dropdown */}
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button
									variant="outline"
									size="sm"
									className="gap-2"
									onClick={(e) => e.stopPropagation()}
								>
									<MoreVerticalIcon className="h-4 w-4" />
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="end">
								<DropdownMenuItem
									onClick={(e) => {
										e.stopPropagation();
										setIsRenameOpen(true);
									}}
								>
									<PencilIcon className="mr-2 h-4 w-4" />
									{t("shares.rename")}
								</DropdownMenuItem>
								{share.isExpired && (
									<DropdownMenuItem
										onClick={(e) => {
											e.stopPropagation();
											setIsRenewOpen(true);
										}}
									>
										<RefreshCwIcon className="mr-2 h-4 w-4" />
										{t("shares.renew")}
									</DropdownMenuItem>
								)}
								<DropdownMenuSeparator />
								<DropdownMenuItem
									onClick={(e) => {
										e.stopPropagation();
										setIsDeleteOpen(true);
									}}
									className="text-destructive"
								>
									<TrashIcon className="mr-2 h-4 w-4" />
									{t("shares.delete")}
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</div>
				</div>
			</div>

			<RenameShareDialog
				open={isRenameOpen}
				onOpenChange={setIsRenameOpen}
				shareId={share.shareId}
				currentTitle={displayTitle}
				onSuccess={onUpdate}
			/>

			<DeleteShareDialog
				open={isDeleteOpen}
				onOpenChange={setIsDeleteOpen}
				shareId={share.shareId}
				shareTitle={displayTitle}
				onSuccess={onUpdate}
			/>

			<RenewShareDialog
				open={isRenewOpen}
				onOpenChange={setIsRenewOpen}
				shareId={share.shareId}
				shareTitle={displayTitle}
				onSuccess={onUpdate}
			/>
		</>
	);
}
