import { orpcClient } from "@shared/lib/orpc-client";
import { notFound } from "next/navigation";
import { ShareStyleGuidePage } from "./share-style-guide-page";
import type { ShareData } from "./share-style-guide-page";

export async function generateMetadata({
	params,
}: {
	params: Promise<{ shareId: string }>;
}) {
	const { shareId } = await params;

	return {
		title: `Style Guide - ${shareId}`,
		description: "Shared style guide with typography and colors",
	};
}

export default async function SharePage({
	params,
}: {
	params: Promise<{ shareId: string }>;
}) {
	const { shareId } = await params;

	try {
		const shareData = await orpcClient.styleGuide.getShare({
			shareId,
		});

		// Type assertion: Prisma returns JsonValue, but we know the structure matches ShareData
		// The data was validated when it was created, so it's safe to cast
		return <ShareStyleGuidePage data={shareData as unknown as ShareData} />;
	} catch (error) {
		console.error("Failed to load share:", error);
		return notFound();
	}
}
