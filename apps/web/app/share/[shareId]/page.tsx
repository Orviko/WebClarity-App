import { orpcClient } from "@shared/lib/orpc-client";
import { notFound } from "next/navigation";
import { ShareStyleGuidePage } from "./share-style-guide-page";
import type { ShareData } from "./share-style-guide-page";
import { ShareHeadingStructurePage } from "./share-heading-structure-page";
import type { HeadingStructureShareData } from "./share-heading-structure-page";
import { ShareType } from "@repo/database/prisma/generated/enums";

export async function generateMetadata({
	params,
}: {
	params: Promise<{ shareId: string }>;
}) {
	const { shareId } = await params;

	try {
		const shareType = await orpcClient.shared.getShareType({ shareId });
		const title =
			shareType.type === ShareType.STYLE_GUIDE
				? `Style Guide - ${shareId}`
				: `Heading Structure - ${shareId}`;
		const description =
			shareType.type === ShareType.STYLE_GUIDE
				? "Shared style guide with typography and colors"
				: "Shared heading structure analysis";

		return {
			title,
			description,
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
