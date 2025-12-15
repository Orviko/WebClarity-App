import { db } from "@repo/database/prisma/client";
import { logger } from "@repo/logs";

/**
 * Check if a workspace can create more shares based on their plan limit
 */
export async function checkShareLimit(organizationId: string): Promise<{
	canCreate: boolean;
	currentCount: number;
	limit: number | null;
	planName: string;
}> {
	try {
		// Get organization with share limit
		const org = await db.organization.findUnique({
			where: { id: organizationId },
			include: {
				purchases: {
					where: { status: "active" },
					take: 1,
					orderBy: { createdAt: "desc" },
				},
			},
		});

		if (!org) {
			throw new Error(`Organization ${organizationId} not found`);
		}

		// Get share limit from organization (can be set per-org)
		const shareLimit = org.shareLimit;

		// Count non-expired shares for this workspace
		const currentCount = await db.share.count({
			where: {
				organizationId,
				isExpired: false,
			},
		});

		// Determine plan name (simplified - can be enhanced later)
		const planName = org.purchases[0]?.productId || "Free";

		return {
			canCreate: shareLimit === null || currentCount < shareLimit,
			currentCount,
			limit: shareLimit,
			planName,
		};
	} catch (error) {
		logger.error("Failed to check share limit:", error);
		throw error;
	}
}
