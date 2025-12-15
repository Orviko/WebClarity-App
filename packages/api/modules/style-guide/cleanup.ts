import { db } from "@repo/database/prisma/client";
import { logger } from "@repo/logs";

/**
 * Cleans up expired shares from the unified Share table
 * - Workspace shares (userId NOT NULL): Mark as expired but don't delete
 * - Anonymous shares (userId IS NULL): Delete completely
 * Should be called periodically (e.g., via cron job or scheduled task)
 */
export async function cleanupExpiredShares(): Promise<void> {
	try {
		const now = new Date();

		// 1. Mark workspace shares as expired (don't delete)
		const workspaceSharesResult = await db.share.updateMany({
			where: {
				expiresAt: {
					lt: now,
				},
				userId: {
					not: null,
				},
				isExpired: false,
			},
			data: {
				isExpired: true,
			},
		});

		logger.log(
			`Marked ${workspaceSharesResult.count} workspace shares as expired`,
		);

		// 2. Find anonymous shares to delete
		const anonymousShares = await db.share.findMany({
			where: {
				expiresAt: {
					lt: now,
				},
				userId: null,
				organizationId: null,
			},
		});

		if (anonymousShares.length === 0) {
			logger.log("No anonymous shares to clean up");
			return;
		}

		logger.log(`Found ${anonymousShares.length} anonymous shares to delete`);

		// Delete OG images for anonymous shares
		const { deleteShareOGImage } = await import("@repo/share-og");
		for (const share of anonymousShares) {
			if (share.shareOgImageUrl) {
				try {
					await deleteShareOGImage(share.shareId);
					logger.log(`Deleted OG image for anonymous share: ${share.shareId}`);
				} catch (error) {
					logger.error(
						`Failed to delete OG image for share ${share.shareId}:`,
						error,
					);
				}
			}
		}

		// Delete anonymous shares (cascade will delete related data)
		const deletedCount = await db.share.deleteMany({
			where: {
				userId: null,
				organizationId: null,
				expiresAt: {
					lt: now,
				},
			},
		});

		logger.log(`Deleted ${deletedCount.count} anonymous shares`);
	} catch (error) {
		logger.error(error);
		throw error;
	}
}

