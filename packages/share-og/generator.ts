import satori from "satori";
import sharp from "sharp";
import { loadFonts } from "./fonts";
import type { ReactElement } from "react";

export interface GenerateShareOGImageOptions {
	template: ReactElement;
	width?: number;
	height?: number;
	maxSizeKB?: number;
}

export async function generateShareOGImage({
	template,
	width = 1200,
	height = 630,
	maxSizeKB = 50,
}: GenerateShareOGImageOptions): Promise<Buffer> {
	// Load fonts
	const fonts = await loadFonts();

	// Generate SVG with Satori
	const svg = await satori(template, {
		width,
		height,
		fonts: fonts as any, // Type cast to avoid FontOptions incompatibility
	});

	// Convert SVG to WebP with Sharp
	let quality = 80;
	let webpBuffer: Buffer;

	// Iteratively reduce quality until under maxSizeKB
	do {
		webpBuffer = await sharp(Buffer.from(svg))
			.webp({ quality, effort: 6 })
			.toBuffer();

		if (webpBuffer.length <= maxSizeKB * 1024) break;
		quality -= 5;
	} while (quality > 20);

	return webpBuffer;
}

