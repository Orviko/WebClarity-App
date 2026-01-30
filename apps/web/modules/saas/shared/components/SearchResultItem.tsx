"use client";

import { Share2Icon } from "lucide-react";
import { useTranslations } from "next-intl";
import { Badge } from "@ui/components/badge";

type Share = {
	id: string;
	shareId: string;
	title: string | null;
	websiteUrl: string;
	viewCount: number;
	isExpired: boolean;
	type:
		| "STYLE_GUIDE"
		| "HEADING_STRUCTURE"
		| "QUICK_SEO"
		| "IMAGES_ALT"
		| "SOCIAL_VIEW";
	shareOgImageUrl: string | null;
	user: {
		id: string;
		name: string;
		image: string | null;
	} | null;
};

interface SearchResultItemProps {
	share: Share;
}

export function SearchResultItem({ share }: SearchResultItemProps) {
	const t = useTranslations();
	const displayTitle = share.title || share.websiteUrl;

	return (
		<>
			<Share2Icon className="mr-2 h-4 w-4 shrink-0" />
			<div className="flex items-center gap-2 flex-1 min-w-0">
				<span className="truncate">{displayTitle}</span>
				<Badge
					status={
						share.type === "STYLE_GUIDE"
							? "info"
							: share.type === "HEADING_STRUCTURE"
								? "warning"
								: share.type === "QUICK_SEO"
									? "success"
									: share.type === "IMAGES_ALT"
										? "info"
										: "warning"
					}
					className="text-xs shrink-0"
				>
					{share.type === "STYLE_GUIDE"
						? t("shares.styleGuide")
						: share.type === "HEADING_STRUCTURE"
							? t("shares.headingStructure")
							: share.type === "QUICK_SEO"
								? t("shares.quickSeo")
								: share.type === "IMAGES_ALT"
									? t("shares.imagesAlt")
									: t("shares.socialView")}
				</Badge>
				{share.isExpired && (
					<Badge status="error" className="text-xs shrink-0">
						{t("shares.expired")}
					</Badge>
				)}
				{share.viewCount > 0 && (
					<span className="text-xs text-muted-foreground shrink-0">
						{t("shares.viewCount", { count: share.viewCount })}
					</span>
				)}
			</div>
		</>
	);
}
