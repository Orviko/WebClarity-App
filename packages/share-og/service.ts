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
		tree: any[];
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

			// Calculate actual issue counts from tree structure
			const { critical, warnings, noIssues } = calculateHeadingIssues(
				hsData.treeData.tree || []
			);

			template = HeadingStructureShareOGTemplate({
				websiteUrl: hsData.websiteUrl,
				totalHeadings: hsData.treeData.totalHeadings,
				errors: critical,
				warnings: warnings,
				checked: noIssues,
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
function calculateHeadingIssues(tree: any[]): {
	critical: number;
	warnings: number;
	noIssues: number;
} {
	let critical = 0;
	let warnings = 0;
	let noIssues = 0;

	const traverse = (nodes: any[]) => {
		for (const node of nodes) {
			if (!node.issues || node.issues.length === 0) {
				noIssues++;
			} else {
				// Critical issues: skip, empty, multiple-h1, missing-h1
				// Warnings: orphan, short, long
				const hasCritical = node.issues.some((issue: string) =>
					["skip", "empty", "multiple-h1", "missing-h1"].includes(
						issue
					)
				);
				if (hasCritical) {
					critical++;
				} else {
					warnings++;
				}
			}
			if (
				node.children &&
				Array.isArray(node.children) &&
				node.children.length > 0
			) {
				traverse(node.children);
			}
		}
	};

	traverse(tree);
	return { critical, warnings, noIssues };
}

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
	const colorMap = new Map<string, number>();

	// Helper function to normalize hex color
	const normalizeHex = (hex: string): string => {
		if (!hex || typeof hex !== "string") return "";
		const normalized = hex.trim().toUpperCase();
		return normalized.startsWith("#") ? normalized : `#${normalized}`;
	};

	// Helper function to check if color is neutral (grays, whites, blacks)
	const isNeutralColor = (hex: string): boolean => {
		if (!hex || !hex.startsWith("#")) return false;
		const rgb = hex.match(/^#([0-9a-f]{6})$/i);
		if (!rgb) return false;
		const r = parseInt(rgb[1].substring(0, 2), 16);
		const g = parseInt(rgb[1].substring(2, 4), 16);
		const b = parseInt(rgb[1].substring(4, 6), 16);
		const tolerance = 30;
		return (
			(Math.abs(r - g) < tolerance &&
				Math.abs(g - b) < tolerance &&
				Math.abs(r - b) < tolerance) ||
			(r < tolerance && g < tolerance && b < tolerance) ||
			(r > 255 - tolerance && g > 255 - tolerance && b > 255 - tolerance)
		);
	};

	// Extract colors from colorTokens (primary source)
	if (colorsData.colorTokens && typeof colorsData.colorTokens === "object") {
		const categories = ["background", "border", "icon", "text"];
		for (const category of categories) {
			if (
				Array.isArray(colorsData.colorTokens[category]) &&
				colorsData.colorTokens[category].length > 0
			) {
				for (const token of colorsData.colorTokens[category]) {
					if (token?.hex && typeof token.hex === "string") {
						const hex = normalizeHex(token.hex);
						if (hex) {
							const currentCount = colorMap.get(hex) || 0;
							colorMap.set(
								hex,
								currentCount + (token.usageCount || 0)
							);
						}
					}
				}
			}
		}
	}

	// Extract brand colors if available (high priority)
	if (Array.isArray(colorsData.brandColors)) {
		for (const brandColor of colorsData.brandColors) {
			if (brandColor?.hex && typeof brandColor.hex === "string") {
				const hex = normalizeHex(brandColor.hex);
				if (hex) {
					// Brand colors get high priority (use existing count or 1000)
					const currentCount = colorMap.get(hex) || 0;
					colorMap.set(
						hex,
						Math.max(currentCount, brandColor.usageCount || 1000)
					);
				}
			}
		}
	}

	// Fallback: Extract from fontSizes[].colors[] arrays if primary sources are empty
	if (
		colorMap.size === 0 &&
		colorsData.fontSizes &&
		typeof colorsData.fontSizes === "object"
	) {
		const categories = ["body", "heading", "button", "display"];
		for (const category of categories) {
			if (
				Array.isArray(colorsData.fontSizes[category]) &&
				colorsData.fontSizes[category].length > 0
			) {
				for (const fontSizeItem of colorsData.fontSizes[category]) {
					if (
						fontSizeItem?.colors &&
						Array.isArray(fontSizeItem.colors)
					) {
						for (const colorValue of fontSizeItem.colors) {
							if (typeof colorValue === "string") {
								const hex = normalizeHex(colorValue);
								if (hex) {
									const instanceCount =
										fontSizeItem.instanceCount || 1;
									const currentCount = colorMap.get(hex) || 0;
									colorMap.set(
										hex,
										currentCount + instanceCount
									);
								}
							}
						}
					}
				}
			}
		}
	}

	// Convert map to array and filter neutral colors (unless used frequently)
	for (const [hex, usageCount] of colorMap.entries()) {
		// Skip neutral colors unless they're used frequently (more than 5 times)
		if (isNeutralColor(hex) && usageCount <= 5) {
			continue;
		}
		allColors.push({ hex, usageCount });
	}

	// Sort by usage count and get top 3 distinct colors
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
		// Sort by usage count (check both new and old property names)
		const sortedFonts = [...typographyData.fontFamilies].sort(
			(a: any, b: any) => {
				const aCount = a.totalInstances || a.instanceCount || 0;
				const bCount = b.totalInstances || b.instanceCount || 0;
				return bCount - aCount;
			}
		);

		const primaryFont = sortedFonts[0];

		// Check for font name (new format: 'name', old format: 'fontFamily')
		let fontName: string | null = null;
		if (primaryFont?.name && typeof primaryFont.name === "string") {
			fontName = primaryFont.name;
		} else if (
			primaryFont?.fontFamily &&
			typeof primaryFont.fontFamily === "string"
		) {
			// Extract font name (remove quotes, weights, etc.)
			fontName = primaryFont.fontFamily
				.replace(/['"]/g, "")
				.split(",")[0]
				.trim();
		}

		if (fontName) {
			// Get usage count (new format: 'totalInstances', old format: 'instanceCount')
			const usageCount =
				primaryFont.totalInstances || primaryFont.instanceCount || 0;
			return {
				fontName: fontName || "Inter",
				usageCount,
			};
		}
	}

	return { fontName: "Inter", usageCount: 0 }; // Fallback
}
