import { db } from "@repo/database/prisma/client";
import { listObjects, deleteObject } from "@repo/storage";
import { logger } from "@repo/logs";
import { config } from "@repo/config";

/**
 * Cleans up orphaned OG images that no longer have corresponding shares
 * This handles cases where:
 * 1. Share creation failed after image upload
 * 2. OG image deletion failed during share cleanup
 * 3. Database was manually modified
 */
export async function cleanupOrphanedOGImages(): Promise<void> {
	try {
		logger.info("Starting orphaned OG image cleanup...");

		// List all images in the share OG bucket
		const allImages = await listObjects({
			bucket: config.storage.bucketNames.shareOg,
		});

		if (allImages.length === 0) {
			logger.info("No OG images found in bucket");
			return;
		}

		logger.info(`Found ${allImages.length} OG images in bucket`);

		// Get all valid share IDs from database
		const validShares = await db.share.findMany({
			select: { shareId: true },
		});

		const validImageNames = new Set(
			validShares.map((share) => `${share.shareId}.webp`),
		);

		// Find orphaned images
		const orphanedImages = allImages.filter(
			(img) => !validImageNames.has(img.key),
		);

		if (orphanedImages.length === 0) {
			logger.info("No orphaned OG images found");
			return;
		}

		logger.info(
			`Found ${orphanedImages.length} orphaned OG images, deleting...`,
		);

		// Delete orphaned images
		let deletedCount = 0;
		for (const image of orphanedImages) {
			try {
				await deleteObject(image.key, {
					bucket: config.storage.bucketNames.shareOg,
				});
				deletedCount++;
				logger.info(`Deleted orphaned OG image: ${image.key}`);
			} catch (error) {
				logger.error(
					`Failed to delete orphaned image ${image.key}:`,
					error,
				);
			}
		}

		logger.info(
			`Successfully deleted ${deletedCount}/${orphanedImages.length} orphaned OG images`,
		);
	} catch (error) {
		logger.error("Failed to cleanup orphaned OG images:", error);
		throw error;
	}
}

