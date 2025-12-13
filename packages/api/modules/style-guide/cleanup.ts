import { db } from "@repo/database/prisma/client";
import { logger } from "@repo/logs";

/**
 * Cleans up expired shares (older than 24 hours) from the unified Share table
 * Handles both STYLE_GUIDE and HEADING_STRUCTURE share types
 * Should be called periodically (e.g., via cron job or scheduled task)
 */
export async function cleanupExpiredShares(): Promise<void> {
	try {
		const now = new Date();

		// Find all expired shares from unified Share table
		const expiredShares = await db.share.findMany({
			where: {
				expiresAt: {
					lt: now,
				},
			},
		});

		if (expiredShares.length === 0) {
			logger.log("No expired shares to clean up");
			return;
		}

		logger.log(`Found ${expiredShares.length} expired shares to clean up`);

		// Delete OG images for expired shares
		const { deleteShareOGImage } = await import("@repo/share-og");
		for (const share of expiredShares) {
			if (share.shareOgImageUrl) {
				try {
					await deleteShareOGImage(share.shareId);
					logger.log(`Deleted OG image for expired share: ${share.shareId}`);
				} catch (error) {
					logger.error(
						`Failed to delete OG image for share ${share.shareId}:`,
						error,
					);
				}
			}
		}

		// Delete expired shares (cascade will delete related data)
		const deletedCount = await db.share.deleteMany({
			where: {
				expiresAt: {
					lt: now,
				},
			},
		});

		logger.log(`Cleaned up ${deletedCount.count} expired shares`);
	} catch (error) {
		logger.error(error);
		throw error;
	}
}

