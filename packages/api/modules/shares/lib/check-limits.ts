import { db } from "@repo/database/prisma/client";
import { logger } from "@repo/logs";
import {
	getUsageForMetric,
	calculateLimitsForOrganization,
	checkUsageThreshold,
	syncUsageMetric,
} from "../../usage/lib/usage-helper";

/**
 * Check if a workspace can create more shares based on their plan limit
 * Uses the new usage system with 80%/100% thresholds
 */
export async function checkShareLimit(organizationId: string): Promise<{
	canCreate: boolean;
	currentCount: number;
	limit: number | null;
	planName: string;
	status: "ok" | "warning" | "blocked";
	percentage: number;
}> {
	try {
		// Sync usage metric with actual count of non-expired shares
		const actualCount = await db.share.count({
			where: {
				organizationId,
				isExpired: false,
			},
		});

		await syncUsageMetric(organizationId, "shares", actualCount);

		// Get limits based on plan
		const { planName, limits } =
			await calculateLimitsForOrganization(organizationId);
		const limitValue = limits.shares;
		const limit = (typeof limitValue === "number" || limitValue === null) ? limitValue : null;

		// Get current usage
		const usage = await getUsageForMetric(organizationId, "shares");

		// Check threshold
		const threshold = checkUsageThreshold(usage.currentUsage, limit);

		return {
			canCreate: threshold.status !== "blocked",
			currentCount: usage.currentUsage,
			limit,
			planName,
			status: threshold.status,
			percentage: threshold.percentage,
		};
	} catch (error) {
		logger.error("Failed to check share limit:", error);
		throw error;
	}
}
