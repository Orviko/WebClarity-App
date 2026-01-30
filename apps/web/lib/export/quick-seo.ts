// Quick SEO Export Text Generator

type SEOStatus = "pass" | "warning" | "fail" | "info";

interface QuickSEOOpenGraph {
	hasImage: boolean;
	imageUrl: string;
	imageWidth: number | null;
	imageHeight: number | null;
	imageDimensionStatus: SEOStatus;
}

interface QuickSEOMeta {
	title: {
		content: string;
		length: number;
		status: SEOStatus;
	};
	description: {
		content: string;
		length: number;
		status: SEOStatus;
	};
	keywords: {
		content: string;
		count: number;
	};
	url: string;
	canonical: {
		url: string;
		matchesCurrentUrl: boolean;
		status: SEOStatus;
	};
}

interface QuickSEOContent {
	wordCount: number;
	wordCountStatus: SEOStatus;
	headingsCount: {
		total: number;
		h1: number;
		h2: number;
		h3: number;
		h4: number;
		h5: number;
		h6: number;
	};
	imagesCount: number;
	imagesWithAlt: number;
	imagesWithoutAlt: number;
	linksCount: {
		total: number;
		internal: number;
		external: number;
	};
}

interface QuickSEOTechnical {
	robotsTag: {
		content: string;
		isIndexable: boolean;
		status: SEOStatus;
	};
	xRobotsTag: {
		content: string;
		status: SEOStatus;
	};
	language: {
		code: string;
		name: string;
		status: SEOStatus;
	};
	author: {
		content: string;
	};
	robotsTxtUrl: string;
	sitemapUrl: string;
}

interface QuickSEOData {
	openGraph: QuickSEOOpenGraph;
	meta: QuickSEOMeta;
	content: QuickSEOContent;
	technical: QuickSEOTechnical;
}

export interface ExportOptions {
	includePassing?: boolean;
	includeWarnings?: boolean;
	includeFailures?: boolean;
	includeSummary?: boolean;
}

interface ExportContext {
	seoData: QuickSEOData;
	pageUrl: string;
	options: ExportOptions;
}

/**
 * Get status symbol
 */
function getStatusSymbol(status: SEOStatus): string {
	switch (status) {
		case "pass":
			return "✓";
		case "warning":
			return "⚠";
		case "fail":
			return "✗";
		case "info":
			return "ℹ";
		default:
			return "•";
	}
}

/**
 * Calculate status counts
 */
function calculateStatusCounts(data: QuickSEOData): {
	pass: number;
	warning: number;
	fail: number;
	total: number;
} {
	let pass = 0;
	let warning = 0;
	let fail = 0;

	const checkStatus = (status: SEOStatus) => {
		if (status === "pass") pass++;
		else if (status === "warning" || status === "info") warning++;
		else if (status === "fail") fail++;
	};

	checkStatus(data.openGraph.imageDimensionStatus);
	checkStatus(data.meta.title.status);
	checkStatus(data.meta.description.status);
	checkStatus(data.meta.canonical.status);
	checkStatus(data.content.wordCountStatus);
	checkStatus(data.technical.robotsTag.status);
	checkStatus(data.technical.language.status);

	return { pass, warning, fail, total: pass + warning + fail };
}

/**
 * Check if item should be included based on options
 */
function shouldIncludeItem(status: SEOStatus, options: ExportOptions): boolean {
	if (status === "pass" && options.includePassing === false) return false;
	if (
		(status === "warning" || status === "info") &&
		options.includeWarnings === false
	)
		return false;
	if (status === "fail" && options.includeFailures === false) return false;
	return true;
}

/**
 * Generate full text report
 */
export function generateFullReport(context: ExportContext): string {
	const { seoData, pageUrl, options } = context;
	const counts = calculateStatusCounts(seoData);

	const lines: string[] = [
		"═══════════════════════════",
		"QUICK SEO ANALYSIS REPORT",
		"═══════════════════════════",
		`Generated: ${new Date().toLocaleString()}`,
		`URL: ${pageUrl || "Unknown"}`,
		"",
	];

	// Add summary section if enabled
	if (options.includeSummary !== false) {
		lines.push("───────────────────────────");
		lines.push("SUMMARY");
		lines.push("───────────────────────────");
		lines.push(`  Total Checks:   ${counts.total}`);
		lines.push(`  Passing:        ${counts.pass}`);
		lines.push(`  Warnings:       ${counts.warning}`);
		lines.push(`  Failures:       ${counts.fail}`);
		lines.push("");
	}

	// Open Graph Section
	lines.push("───────────────────────────");
	lines.push("OPEN GRAPH");
	lines.push("───────────────────────────");

	if (shouldIncludeItem(seoData.openGraph.imageDimensionStatus, options)) {
		lines.push(
			`  ${getStatusSymbol(seoData.openGraph.imageDimensionStatus)} OG Image: ${seoData.openGraph.hasImage ? "Present" : "Missing"}`,
		);
		if (
			seoData.openGraph.hasImage &&
			seoData.openGraph.imageWidth &&
			seoData.openGraph.imageHeight
		) {
			lines.push(
				`    Dimensions: ${seoData.openGraph.imageWidth} × ${seoData.openGraph.imageHeight}px`,
			);
		}
	}
	lines.push("");

	// Meta Information Section
	lines.push("───────────────────────────");
	lines.push("META INFORMATION");
	lines.push("───────────────────────────");

	if (shouldIncludeItem(seoData.meta.title.status, options)) {
		lines.push(
			`  ${getStatusSymbol(seoData.meta.title.status)} Title (${seoData.meta.title.length} chars)`,
		);
		if (seoData.meta.title.content) {
			lines.push(`    "${seoData.meta.title.content}"`);
		}
	}

	if (shouldIncludeItem(seoData.meta.description.status, options)) {
		lines.push(
			`  ${getStatusSymbol(seoData.meta.description.status)} Description (${seoData.meta.description.length} chars)`,
		);
		if (seoData.meta.description.content) {
			lines.push(`    "${seoData.meta.description.content}"`);
		}
	}

	if (shouldIncludeItem(seoData.meta.canonical.status, options)) {
		lines.push(
			`  ${getStatusSymbol(seoData.meta.canonical.status)} Canonical URL`,
		);
		if (seoData.meta.canonical.url) {
			lines.push(`    ${seoData.meta.canonical.url}`);
			if (!seoData.meta.canonical.matchesCurrentUrl) {
				lines.push(`    ⚠ Does not match current URL`);
			}
		} else {
			lines.push(`    Not set`);
		}
	}

	lines.push(`  • Current URL: ${seoData.meta.url}`);

	if (seoData.meta.keywords.content) {
		lines.push(`  • Keywords: ${seoData.meta.keywords.count} keywords`);
	}
	lines.push("");

	// Content Analysis Section
	lines.push("───────────────────────────");
	lines.push("CONTENT ANALYSIS");
	lines.push("───────────────────────────");

	if (shouldIncludeItem(seoData.content.wordCountStatus, options)) {
		lines.push(
			`  ${getStatusSymbol(seoData.content.wordCountStatus)} Word Count: ${seoData.content.wordCount} words`,
		);
	}

	lines.push("  • Headings:");
	lines.push(`    H1: ${seoData.content.headingsCount.h1}`);
	lines.push(`    H2: ${seoData.content.headingsCount.h2}`);
	lines.push(`    H3: ${seoData.content.headingsCount.h3}`);
	lines.push(`    H4: ${seoData.content.headingsCount.h4}`);
	lines.push(`    H5: ${seoData.content.headingsCount.h5}`);
	lines.push(`    H6: ${seoData.content.headingsCount.h6}`);
	lines.push(`    Total: ${seoData.content.headingsCount.total} headings`);

	lines.push("  • Images:");
	lines.push(`    With alt text: ${seoData.content.imagesWithAlt}`);
	lines.push(`    Without alt text: ${seoData.content.imagesWithoutAlt}`);
	lines.push(`    Total: ${seoData.content.imagesCount} images`);

	lines.push("  • Links:");
	lines.push(`    Internal: ${seoData.content.linksCount.internal}`);
	lines.push(`    External: ${seoData.content.linksCount.external}`);
	lines.push(`    Total: ${seoData.content.linksCount.total} links`);
	lines.push("");

	// Technical SEO Section
	lines.push("───────────────────────────");
	lines.push("TECHNICAL SEO");
	lines.push("───────────────────────────");

	if (shouldIncludeItem(seoData.technical.robotsTag.status, options)) {
		lines.push(
			`  ${getStatusSymbol(seoData.technical.robotsTag.status)} Robots Meta: ${seoData.technical.robotsTag.isIndexable ? "Indexable" : "Not Indexable"}`,
		);
		if (seoData.technical.robotsTag.content) {
			lines.push(`    Content: ${seoData.technical.robotsTag.content}`);
		}
	}

	if (shouldIncludeItem(seoData.technical.language.status, options)) {
		lines.push(
			`  ${getStatusSymbol(seoData.technical.language.status)} Language: ${seoData.technical.language.name || seoData.technical.language.code || "Not specified"}`,
		);
	}

	if (seoData.technical.author.content) {
		lines.push(`  • Author: ${seoData.technical.author.content}`);
	}

	if (seoData.technical.xRobotsTag.content) {
		lines.push(`  • X-Robots-Tag: ${seoData.technical.xRobotsTag.content}`);
	}
	lines.push("");

	// Additional Information
	lines.push("───────────────────────────");
	lines.push("ADDITIONAL INFORMATION");
	lines.push("───────────────────────────");
	if (seoData.technical.robotsTxtUrl) {
		lines.push(`  Robots.txt: ${seoData.technical.robotsTxtUrl}`);
	}
	if (seoData.technical.sitemapUrl) {
		lines.push(`  Sitemap: ${seoData.technical.sitemapUrl}`);
	}
	lines.push("");

	lines.push("═══════════════════════════");
	lines.push("Generated by WebClarity.ai");
	lines.push("═══════════════════════════");

	return lines.join("\n");
}

/**
 * Generate filename for export
 */
export function generateExportFilename(): string {
	const date = new Date().toISOString().split("T")[0];
	return `quick-seo-analysis-${date}.txt`;
}
