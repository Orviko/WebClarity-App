import { orpcClient } from "@shared/lib/orpc-client";
import { notFound } from "next/navigation";
import { ShareStyleGuidePage } from "./share-style-guide-page";
import type { ShareData } from "./share-style-guide-page";
import { ShareHeadingStructurePage } from "./share-heading-structure-page";
import type { HeadingStructureShareData } from "./share-heading-structure-page";
import { ShareType } from "@repo/database/prisma/generated/enums";
import { ExpiredShareView } from "./expired-share-view";
import { auth } from "@repo/auth";

export async function generateMetadata({
	params,
}: {
	params: Promise<{ shareId: string }>;
}) {
	const { shareId } = await params;

	try {
		const shareType = await orpcClient.shared.getShareType({ shareId });

		// Fetch share data to get share OG image URL
		let shareOgImageUrl: string | null | undefined;
		let websiteUrl: string | undefined;

		if (shareType.type === ShareType.STYLE_GUIDE) {
			const data = await orpcClient.styleGuide.getShare({ shareId });
			shareOgImageUrl = data.shareOgImageUrl;
			websiteUrl = data.websiteUrl;
		} else {
			const data = await orpcClient.headingStructure.getShare({ shareId });
			shareOgImageUrl = data.shareOgImageUrl;
			websiteUrl = data.websiteUrl;
		}

		const title =
			shareType.type === ShareType.STYLE_GUIDE
				? `Style Guide - ${websiteUrl || shareId}`
				: `Heading Structure Analysis - ${websiteUrl || shareId}`;

		const description =
			shareType.type === ShareType.STYLE_GUIDE
				? `Explore the style guide for ${websiteUrl} - colors, typography, and design tokens`
				: `Analyze the heading structure for ${websiteUrl} - SEO and accessibility insights`;

		return {
			title,
			description,
			openGraph: {
				title,
				description,
				images: shareOgImageUrl
					? [{ url: shareOgImageUrl, width: 1200, height: 630 }]
					: [],
				type: "website",
			},
			twitter: {
				card: "summary_large_image",
				title,
				description,
				images: shareOgImageUrl ? [shareOgImageUrl] : [],
			},
		};
	} catch {
		return {
			title: `Share - ${shareId}`,
			description: "Shared content",
		};
	}
}

export default async function SharePage({
	params,
}: {
	params: Promise<{ shareId: string }>;
}) {
	const { shareId } = await params;

	try {
		// Get share details to check expiry and workspace membership
		const shareDetails = await orpcClient.shares.getShareDetails({ shareId });

		// If share is expired, show expired view
		if (shareDetails.isExpired) {
			return <ExpiredShareView shareId={shareId} shareDetails={shareDetails} />;
		}

		// First, get the share type
		const shareType = await orpcClient.shared.getShareType({ shareId });

		// Then fetch the appropriate data based on type
		if (shareType.type === ShareType.STYLE_GUIDE) {
			const shareData = await orpcClient.styleGuide.getShare({
				shareId,
			});

			return (
				<ShareStyleGuidePage data={shareData as unknown as ShareData} />
			);
		} else if (shareType.type === ShareType.HEADING_STRUCTURE) {
			const shareData = await orpcClient.headingStructure.getShare({
				shareId,
			});

			return (
				<ShareHeadingStructurePage
					data={shareData as unknown as HeadingStructureShareData}
				/>
			);
		} else {
			return notFound();
		}
	} catch (error) {
		console.error("Failed to load share:", error);
		return notFound();
	}
}
