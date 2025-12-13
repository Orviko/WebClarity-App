import { cleanupExpiredShares } from "@repo/api/modules/style-guide/cleanup";
import { cleanupOrphanedOGImages } from "@repo/share-og/cleanup";
import { logger } from "@repo/logs";
import { NextResponse } from "next/server";

/**
 * Scheduled cleanup endpoint for expired shares and orphaned OG images
 *
 * Currently configured to run weekly via Vercel Cron Jobs (see vercel.json)
 * This is a vendor-agnostic HTTP endpoint that can be called by any HTTP scheduler.
 *
 * Environment Variable Required:
 * - CRON_SECRET: Secret token for authenticating cron requests
 *   Generate with: openssl rand -base64 32
 *
 * Usage:
 *   GET /api/cron/cleanup-shares
 *   Authorization: Bearer <CRON_SECRET>
 *
 * Note: Lazy deletion on user visits handles most cleanup automatically.
 * This scheduled job handles edge cases and orphaned images.
 */
export async function GET(request: Request) {
	try {
		// Verify request is authenticated via CRON_SECRET
		// This works with any HTTP scheduler, not just Vercel
		const authHeader = request.headers.get("authorization");
		const cronSecret = process.env.CRON_SECRET;

		if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
			logger.warn("Unauthorized cron job access attempt");
			return NextResponse.json(
				{ error: "Unauthorized" },
				{ status: 401 },
			);
		}

		logger.info("Starting scheduled cleanup job...");

		// Run cleanup tasks in parallel
		await Promise.all([cleanupExpiredShares(), cleanupOrphanedOGImages()]);

		logger.info("Scheduled cleanup job completed successfully");

		return NextResponse.json({
			success: true,
			message: "Cleanup completed successfully",
		});
	} catch (error) {
		logger.error("Scheduled cleanup job failed:", error);
		return NextResponse.json(
			{
				error: "Cleanup failed",
				details: error instanceof Error ? error.message : String(error),
			},
			{ status: 500 },
		);
	}
}
