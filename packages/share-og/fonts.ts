import fs from "fs";
import path from "path";

let interRegular: ArrayBuffer | null = null;
let interBold: ArrayBuffer | null = null;

export async function loadFonts() {
	if (!interRegular || !interBold) {
		// Try to load Inter fonts from public directory
		const fontsDir = path.join(process.cwd(), "public/fonts");

		// Always use .ttf files (Satori doesn't support .woff2)
		const regularPath = path.join(fontsDir, "Inter-Regular.ttf");
		const boldPath = path.join(fontsDir, "Inter-Bold.ttf");

		try {
			if (fs.existsSync(regularPath) && fs.existsSync(boldPath)) {
				console.log(
					"[Share OG] Loading fonts from disk (first time only):",
					{
						regularPath,
						boldPath,
					}
				);
				const regularBuffer = fs.readFileSync(regularPath);
				const boldBuffer = fs.readFileSync(boldPath);
				interRegular = regularBuffer.buffer.slice(
					regularBuffer.byteOffset,
					regularBuffer.byteOffset + regularBuffer.byteLength
				);
				interBold = boldBuffer.buffer.slice(
					boldBuffer.byteOffset,
					boldBuffer.byteOffset + boldBuffer.byteLength
				);
				console.log("[Share OG] ✅ Fonts loaded and cached in memory");
			} else {
				console.warn(
					"[Share OG] ⚠️ Font files not found, using system fonts as fallback"
				);
				// Fallback: return empty array - Satori will use system fonts
				return [];
			}
		} catch (error) {
			console.error("[Share OG] ❌ Failed to load fonts:", error);
			// If fonts don't exist, return empty array
			return [];
		}
	} else {
		console.log("[Share OG] Using cached fonts from memory ⚡");
	}

	return [
		{
			name: "Inter",
			data: interRegular,
			weight: 400,
			style: "normal",
		},
		{
			name: "Inter",
			data: interBold,
			weight: 700,
			style: "normal",
		},
	];
}
