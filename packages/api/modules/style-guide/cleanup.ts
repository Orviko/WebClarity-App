import { db } from "@repo/database/prisma/client";
import { logger } from "@repo/logs";

/**
 * Cleans up expired style guide shares (older than 24 hours)
 * Should be called periodically (e.g., via cron job or scheduled task)
 */
export async function cleanupExpiredShares(): Promise<void> {
	try {
		const now = new Date();

		// Find all expired shares
		const expiredShares = await db.styleGuideShare.findMany({
			where: {
				expiresAt: {
					lt: now,
				},
			},
			include: {
				styleGuideData: true,
			},
		});

		if (expiredShares.length === 0) {
			logger.log("No expired shares to clean up");
			return;
		}

		// Delete expired shares (cascade will delete related style guide data)
		const deletedCount = await db.styleGuideShare.deleteMany({
			where: {
				expiresAt: {
					lt: now,
				},
			},
		});

		logger.log(`Cleaned up ${deletedCount.count} expired style guide shares`);
	} catch (error) {
		logger.error(error);
		throw error;
	}
}

