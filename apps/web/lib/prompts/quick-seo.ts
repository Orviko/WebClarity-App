// Quick SEO Prompt Generator for Web App

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

export interface QuickSEOPromptContext {
	pageUrl: string;
	seoData: QuickSEOData;
	includeFailures: boolean;
	includeWarnings: boolean;
}

interface SEOIssue {
	category: string;
	name: string;
	status: SEOStatus;
	details: string;
	recommendation?: string;
}

/**
 * Get issues filtered by status
 */
function getIssuesByStatus(
	data: QuickSEOData,
	includeFailures: boolean,
	includeWarnings: boolean,
): SEOIssue[] {
	const issues: SEOIssue[] = [];

	// Meta Information Issues
	const meta = data.meta;

	if (
		(includeFailures && meta.title.status === "fail") ||
		(includeWarnings && meta.title.status === "warning")
	) {
		issues.push({
			category: "Meta Information",
			name: "Title",
			status: meta.title.status,
			details: meta.title.content
				? `Current: "${meta.title.content}" (${meta.title.length} characters)`
				: "Missing title tag",
			recommendation:
				meta.title.length === 0
					? "Add a title tag with 30-60 characters"
					: meta.title.length < 30
						? "Increase title length to 30-60 characters"
						: meta.title.length > 60
							? "Reduce title length to 30-60 characters"
							: undefined,
		});
	}

	if (
		(includeFailures && meta.description.status === "fail") ||
		(includeWarnings && meta.description.status === "warning")
	) {
		issues.push({
			category: "Meta Information",
			name: "Description",
			status: meta.description.status,
			details: meta.description.content
				? `Current: "${meta.description.content}" (${meta.description.length} characters)`
				: "Missing meta description",
			recommendation:
				meta.description.length === 0
					? "Add meta description tag with 70-155 characters"
					: meta.description.length < 70
						? "Increase description length to 70-155 characters"
						: meta.description.length > 155
							? "Reduce description length to 70-155 characters"
							: undefined,
		});
	}

	if (
		(includeFailures && meta.canonical.status === "fail") ||
		(includeWarnings && meta.canonical.status === "warning")
	) {
		issues.push({
			category: "Meta Information",
			name: "Canonical URL",
			status: meta.canonical.status,
			details: meta.canonical.url
				? `Current: ${meta.canonical.url}${!meta.canonical.matchesCurrentUrl ? " (doesn't match current URL)" : ""}`
				: "Missing canonical tag",
			recommendation: meta.canonical.url
				? "Ensure canonical URL matches the current page URL"
				: "Add a canonical link tag to prevent duplicate content issues",
		});
	}

	// Open Graph Issues
	const og = data.openGraph;
	if (
		(!og.hasImage && includeWarnings) ||
		(og.hasImage &&
			og.imageDimensionStatus !== "pass" &&
			((includeFailures && og.imageDimensionStatus === "fail") ||
				(includeWarnings && og.imageDimensionStatus === "warning")))
	) {
		issues.push({
			category: "Open Graph",
			name: "OG Image",
			status: !og.hasImage ? "warning" : og.imageDimensionStatus,
			details: !og.hasImage
				? "Missing Open Graph image"
				: og.imageWidth && og.imageHeight
					? `Current dimensions: ${og.imageWidth}×${og.imageHeight}px`
					: "Image dimensions not specified",
			recommendation: !og.hasImage
				? "Add og:image meta tag with image URL"
				: "Use image dimensions of 1200×630px (minimum 600×315px)",
		});
	}

	// Content Issues
	if (
		(includeFailures && data.content.wordCountStatus === "fail") ||
		(includeWarnings && data.content.wordCountStatus === "warning")
	) {
		issues.push({
			category: "Content",
			name: "Word Count",
			status: data.content.wordCountStatus,
			details: `Current: ${data.content.wordCount} words`,
			recommendation:
				data.content.wordCount < 300
					? "Add more content to reach at least 300 words for better SEO"
					: "Consider expanding content for more comprehensive coverage",
		});
	}

	// Technical Issues
	if (
		(includeFailures && data.technical.robotsTag.status === "fail") ||
		(includeWarnings && data.technical.robotsTag.status === "warning")
	) {
		issues.push({
			category: "Technical SEO",
			name: "Robots Meta Tag",
			status: data.technical.robotsTag.status,
			details: data.technical.robotsTag.isIndexable
				? `Indexable (${data.technical.robotsTag.content})`
				: `Not indexable (${data.technical.robotsTag.content})`,
			recommendation: !data.technical.robotsTag.isIndexable
				? "Remove noindex directive if you want this page to be indexed by search engines"
				: undefined,
		});
	}

	if (
		(includeFailures && data.technical.language.status === "fail") ||
		(includeWarnings && data.technical.language.status === "warning")
	) {
		issues.push({
			category: "Technical SEO",
			name: "Language",
			status: data.technical.language.status,
			details: data.technical.language.name
				? `${data.technical.language.name} (${data.technical.language.code})`
				: "Language not specified",
			recommendation: !data.technical.language.code
				? 'Add lang attribute to <html> tag (e.g., <html lang="en">)'
				: undefined,
		});
	}

	return issues;
}

/**
 * Format summary for prompt
 */
function formatQuickSEOSummary(data: QuickSEOData): string {
	const counts = {
		total: 0,
		passing: 0,
		warnings: 0,
		failures: 0,
	};

	// Count all checks
	const items: SEOStatus[] = [
		data.meta.title.status,
		data.meta.description.status,
		data.meta.canonical.status,
		data.openGraph.hasImage
			? data.openGraph.imageDimensionStatus
			: "warning",
		data.content.wordCountStatus,
		data.technical.robotsTag.status,
		data.technical.language.status,
	];

	items.forEach((status) => {
		counts.total++;
		if (status === "pass") {
			counts.passing++;
		} else if (status === "warning" || status === "info") {
			counts.warnings++;
		} else if (status === "fail") {
			counts.failures++;
		}
	});

	return `- Total Checks: ${counts.total}
- Passing: ${counts.passing}
- Warnings: ${counts.warnings}
- Failures: ${counts.failures}`;
}

/**
 * Format issues for prompt
 */
function formatQuickSEOIssues(context: QuickSEOPromptContext): string {
	const issues = getIssuesByStatus(
		context.seoData,
		context.includeFailures,
		context.includeWarnings,
	);

	if (issues.length === 0) {
		return "\n**No issues found matching your criteria.**";
	}

	let result = "\n**Issues to Fix:**\n";
	let currentCategory = "";

	issues.forEach((issue, index) => {
		if (issue.category !== currentCategory) {
			if (currentCategory !== "") {
				result += "\n";
			}
			result += `\n**${issue.category}**\n`;
			currentCategory = issue.category;
		}

		const statusIcon =
			issue.status === "fail"
				? "✗"
				: issue.status === "warning"
					? "⚠"
					: "✓";
		result += `\n${index + 1}. ${statusIcon} **${issue.name}** [${issue.status}]\n`;
		result += `   ${issue.details}\n`;
		if (issue.recommendation) {
			result += `   Recommendation: ${issue.recommendation}\n`;
		}
	});

	return result;
}

/**
 * Format issues for IDE prompt (includes HTML tags)
 */
function formatIssuesForIDE(context: QuickSEOPromptContext): string {
	const issues = getIssuesByStatus(
		context.seoData,
		context.includeFailures,
		context.includeWarnings,
	);

	if (issues.length === 0) {
		return "\n**No issues found matching your criteria.**";
	}

	let result = "\n**Issues to Fix:**\n";
	let currentCategory = "";

	issues.forEach((issue, index) => {
		if (issue.category !== currentCategory) {
			if (currentCategory !== "") {
				result += "\n";
			}
			result += `\n**${issue.category}**\n`;
			currentCategory = issue.category;
		}

		result += `\n${index + 1}. **${issue.name}** [${issue.status}]\n`;
		result += `   ${issue.details}\n`;

		// Add specific HTML tag information for IDE
		if (issue.name === "Title") {
			result += `   Tag: <title>...</title>\n`;
			if (context.seoData.meta.title.content) {
				result += `   Current: <title>${context.seoData.meta.title.content}</title>\n`;
			}
		} else if (issue.name === "Description") {
			result += `   Tag: <meta name="description" content="...">\n`;
			if (context.seoData.meta.description.content) {
				result += `   Current: <meta name="description" content="${context.seoData.meta.description.content}">\n`;
			}
		} else if (issue.name === "Canonical URL") {
			result += `   Tag: <link rel="canonical" href="...">\n`;
			if (context.seoData.meta.canonical.url) {
				result += `   Current: <link rel="canonical" href="${context.seoData.meta.canonical.url}">\n`;
			}
		} else if (issue.name === "OG Image") {
			result += `   Tag: <meta property="og:image" content="...">\n`;
		} else if (issue.name === "Language") {
			result += `   Tag: <html lang="...">\n`;
			if (context.seoData.technical.language.code) {
				result += `   Current: <html lang="${context.seoData.technical.language.code}">\n`;
			}
		}

		if (issue.recommendation) {
			result += `   Fix: ${issue.recommendation}\n`;
		}
	});

	return result;
}

/**
 * Generate platform prompt (for ChatGPT, Claude, etc.)
 */
export function generateQuickSEOPlatformPrompt(
	context: QuickSEOPromptContext,
): string {
	const issues = getIssuesByStatus(
		context.seoData,
		context.includeFailures,
		context.includeWarnings,
	);

	if (issues.length === 0) {
		return `You are an SEO expert. I need help fixing SEO issues on my website.

**Website URL**: ${context.pageUrl}

**Current Status**:
${formatQuickSEOSummary(context.seoData)}

**No issues found matching your criteria.** All SEO checks are passing!

═══════════════════════════════════════
Generated by webclarity.ai
═══════════════════════════════════════`;
	}

	return `You are an SEO expert. I need help fixing SEO issues on my website.

**Website URL**: ${context.pageUrl}

**Current Status**:
${formatQuickSEOSummary(context.seoData)}

${formatQuickSEOIssues(context)}

**Instructions**:
- Review each issue listed above
- Provide specific, actionable recommendations for fixing each issue
- For meta tags, provide the exact HTML code needed
- Consider SEO best practices and current standards
- Prioritize critical failures over warnings

**Expected Response Format**:

For each issue, provide:
1. **Issue Name**: [Name]
2. **Current Status**: [fail/warning]
3. **Recommended Fix**: [Specific action or code]
4. **HTML Code** (if applicable):
   \`\`\`html
   [Exact HTML code to add/modify]
   \`\`\`

IMPORTANT: After providing all fixes, you MUST end your response with the following footer (include the dividers):

═══════════════════════════════════════
Generated by webclarity.ai
═══════════════════════════════════════`;
}

/**
 * Generate IDE prompt (for VS Code, Cursor, etc.)
 */
export function generateQuickSEOIDEPrompt(
	context: QuickSEOPromptContext,
): string {
	const issues = getIssuesByStatus(
		context.seoData,
		context.includeFailures,
		context.includeWarnings,
	);

	if (issues.length === 0) {
		return `You are an AI coding assistant. I need you to fix SEO issues in my project files.

**CRITICAL INSTRUCTIONS:**
- DO NOT create any new files (no .md, no README, no documentation files)
- ONLY modify existing HTML/template files to fix SEO meta tags
- After making all changes, provide a CHAT RESPONSE summarizing what was fixed

**Website URL**: ${context.pageUrl}

**Current Status**:
${formatQuickSEOSummary(context.seoData)}

**No issues found matching your criteria.** All SEO checks are passing!

═══════════════════════════════════════
Generated by webclarity.ai
═══════════════════════════════════════`;
	}

	return `You are an AI coding assistant. I need you to fix SEO issues in my project files.

**CRITICAL INSTRUCTIONS:**
- DO NOT create any new files (no .md, no README, no documentation files)
- ONLY modify existing HTML/template files to fix SEO meta tags
- After making all changes, provide a CHAT RESPONSE summarizing what was fixed

**Website URL**: ${context.pageUrl}

**Current Status**:
${formatQuickSEOSummary(context.seoData)}

${formatIssuesForIDE(context)}

═══════════════════════════════════════

**YOUR TASK:**
1. For each issue listed above, find the corresponding HTML tag in the codebase
2. Add missing tags or update existing tags with the recommended values
3. Ensure all changes follow SEO best practices
4. DO NOT create any new files

**AFTER COMPLETING ALL FIXES, provide a chat summary using this EXACT format:**

**Summary of SEO Fixes**

Total Issues Fixed: [number]

**Fixes Applied:**

1. **[Issue Name]**: [What was fixed]
2. **[Issue Name]**: [What was fixed]
(continue for ALL issues in strict numerical order)

**Files Modified:**
- [file path]
- [file path]

**IMPORTANT:** Include this footer ONLY in your chat summary response, NOT in any code changes:
═══════════════════════════════════════
Generated by webclarity.ai
═══════════════════════════════════════`;
}
