import { config } from "@repo/config";
import { deleteObject, uploadBuffer } from "@repo/storage";
import { logger } from "@repo/logs";
import { ShareType } from "@repo/database/prisma/generated/enums";
import { generateShareOGImage } from "./generator";
import { StyleGuideShareOGTemplate } from "./templates/style-guide";
import { HeadingStructureShareOGTemplate } from "./templates/heading-structure";

interface StyleGuideData {
	websiteUrl: string;
	colorsData: any;
	typographyData: any;
}

interface ColorWithUsage {
	hex: string;
	usageCount: number;
}

interface HeadingStructureData {
	websiteUrl: string;
	treeData: {
		totalHeadings: number;
		issuesCount: number;
	};
}

export async function generateAndUploadShareOGImage(
	shareId: string,
	type: ShareType,
	data: StyleGuideData | HeadingStructureData
): Promise<string> {
	try {
		logger.info(
			`Starting Share OG image generation for shareId: ${shareId}, type: ${type}`
		);
		let template: React.ReactElement;

		// Generate appropriate template
		if (type === ShareType.STYLE_GUIDE) {
			const sgData = data as StyleGuideData;
			const topColors = extractTopColorsWithUsage(sgData.colorsData);
			const { fontName, usageCount } = extractPrimaryFontWithUsage(
				sgData.typographyData
			);

			template = StyleGuideShareOGTemplate({
				websiteUrl: sgData.websiteUrl,
				topColors,
				primaryFont: fontName,
				fontUsageCount: usageCount,
			});
		} else {
			const hsData = data as HeadingStructureData;

			template = HeadingStructureShareOGTemplate({
				websiteUrl: hsData.websiteUrl,
				totalHeadings: hsData.treeData.totalHeadings,
				errors: Math.floor(hsData.treeData.issuesCount * 0.6), // Estimate
				warnings: Math.ceil(hsData.treeData.issuesCount * 0.4), // Estimate
				checked: hsData.treeData.totalHeadings,
			});
		}

		// Generate WebP image
		const imageBuffer = await generateShareOGImage({
			template,
			maxSizeKB: 50,
		});

		// Upload to R2
		const imagePath = `${shareId}.webp`;
		await uploadBuffer(imagePath, imageBuffer, {
			bucket: config.storage.bucketNames.shareOg,
			contentType: "image/webp",
		});

		// Return public URL
		const publicUrl = process.env.NEXT_PUBLIC_SHARE_OG_PUBLIC_URL;
		if (!publicUrl) {
			throw new Error("NEXT_PUBLIC_SHARE_OG_PUBLIC_URL not configured");
		}

		return `${publicUrl}/${imagePath}`;
	} catch (error) {
		logger.error("Failed to generate share OG image:", error);
		throw error;
	}
}

export async function deleteShareOGImage(shareId: string): Promise<void> {
	try {
		const imagePath = `${shareId}.webp`;
		await deleteObject(imagePath, {
			bucket: config.storage.bucketNames.shareOg,
		});
	} catch (error) {
		logger.error("Failed to delete share OG image:", error);
		// Don't throw - cleanup failures shouldn't block deletion
	}
}

// Helper functions
function extractTopColors(colorsData: any): string[] {
	const colorsWithUsage = extractTopColorsWithUsage(colorsData);
	return colorsWithUsage.map((c) => c.hex);
}

function extractTopColorsWithUsage(colorsData: any): ColorWithUsage[] {
	if (!colorsData || typeof colorsData !== "object") {
		return [
			{ hex: "#667eea", usageCount: 0 },
			{ hex: "#764ba2", usageCount: 0 },
			{ hex: "#f093fb", usageCount: 0 },
		]; // Fallback gradient colors
	}

	const allColors: Array<{ hex: string; usageCount: number }> = [];

	// Extract colors from colorTokens
	if (colorsData.colorTokens && typeof colorsData.colorTokens === "object") {
		const categories = ["background", "border", "icon", "text"];
		for (const category of categories) {
			if (
				Array.isArray(colorsData.colorTokens[category]) &&
				colorsData.colorTokens[category].length > 0
			) {
				for (const token of colorsData.colorTokens[category]) {
					if (token?.hex && typeof token.hex === "string") {
						allColors.push({
							hex: token.hex,
							usageCount: token.usageCount || 0,
						});
					}
				}
			}
		}
	}

	// Extract brand colors if available
	if (Array.isArray(colorsData.brandColors)) {
		for (const brandColor of colorsData.brandColors) {
			if (brandColor?.hex && typeof brandColor.hex === "string") {
				allColors.push({
					hex: brandColor.hex,
					usageCount: brandColor.usageCount || 1000, // Brand colors get high priority
				});
			}
		}
	}

	// Sort by usage count and get top 3
	const topColors = allColors
		.sort((a, b) => b.usageCount - a.usageCount)
		.slice(0, 3);

	// Ensure we have at least 3 colors (pad with fallback if needed)
	while (topColors.length < 3) {
		const fallbacks = [
			{ hex: "#667eea", usageCount: 0 },
			{ hex: "#764ba2", usageCount: 0 },
			{ hex: "#f093fb", usageCount: 0 },
		];
		topColors.push(fallbacks[topColors.length] || fallbacks[0]);
	}

	return topColors.slice(0, 3);
}

function extractPrimaryFont(typographyData: any): string {
	const { fontName } = extractPrimaryFontWithUsage(typographyData);
	return fontName;
}

function extractPrimaryFontWithUsage(typographyData: any): {
	fontName: string;
	usageCount: number;
} {
	if (!typographyData || typeof typographyData !== "object") {
		return { fontName: "Inter", usageCount: 0 }; // Fallback
	}

	// Extract from fontFamilies array
	if (
		Array.isArray(typographyData.fontFamilies) &&
		typographyData.fontFamilies.length > 0
	) {
		// Sort by instanceCount and get the most used font
		const sortedFonts = [...typographyData.fontFamilies].sort(
			(a: any, b: any) => (b.instanceCount || 0) - (a.instanceCount || 0)
		);

		const primaryFont = sortedFonts[0];
		if (
			primaryFont?.fontFamily &&
			typeof primaryFont.fontFamily === "string"
		) {
			// Extract font name (remove quotes, weights, etc.)
			const fontName = primaryFont.fontFamily
				.replace(/['"]/g, "")
				.split(",")[0]
				.trim();
			return {
				fontName: fontName || "Inter",
				usageCount: primaryFont.instanceCount || 0,
			};
		}
	}

	return { fontName: "Inter", usageCount: 0 }; // Fallback
}
