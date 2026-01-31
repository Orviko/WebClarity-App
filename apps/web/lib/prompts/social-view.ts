// Social View Prompt Generator for Web App - Matching Extension Format
import type { SocialData } from "../../app/share/[shareId]/share-social-view-page";

// Re-export for external use
export interface SocialViewPromptContext {
	pageUrl: string;
	socialData: SocialData;
	includeFailures: boolean;
	includeWarnings: boolean;
}

type OpenGraphData = SocialData["openGraph"];
type TwitterData = SocialData["twitter"];
type OpenGraphStatus = OpenGraphData["status"];
type TwitterStatus = TwitterData["status"];

/**
 * Get all Open Graph issues
 */
function getOpenGraphIssues(og: OpenGraphData): Array<{
	name: string;
	tag: string;
	status: "pass" | "warning" | "fail";
	current: string | null;
	recommendation: string;
	htmlCode: string;
}> {
	const issues: Array<{
		name: string;
		tag: string;
		status: "pass" | "warning" | "fail";
		current: string | null;
		recommendation: string;
		htmlCode: string;
	}> = [];

	// OG Title
	if (!og.status.hasTitle) {
		issues.push({
			name: "Open Graph Title",
			tag: "og:title",
			status: "fail",
			current: null,
			recommendation:
				"Add og:title tag. This should be a concise, compelling title (55-60 characters recommended). It appears as the main headline when your page is shared on social media.",
			htmlCode: `<meta property="og:title" content="Your Page Title Here" />`,
		});
	}

	// OG Description
	if (!og.status.hasDescription) {
		issues.push({
			name: "Open Graph Description",
			tag: "og:description",
			status: "fail",
			current: null,
			recommendation:
				"Add og:description tag. This should be a brief summary (up to 200 characters) that entices users to click. It appears below the title when shared on social media.",
			htmlCode: `<meta property="og:description" content="A compelling description of your page content" />`,
		});
	}

	// OG Image
	if (!og.status.hasImage) {
		issues.push({
			name: "Open Graph Image",
			tag: "og:image",
			status: "fail",
			current: null,
			recommendation:
				"Add og:image tag. Images should be at least 1200×630 pixels (1.91:1 ratio) for best display. This is the preview image that appears when your page is shared.",
			htmlCode: `<meta property="og:image" content="Open Graph image URL" />`,
		});
	} else if (og.status.imageDimensionStatus !== "pass") {
		const dimensions =
			og.imageWidth && og.imageHeight
				? `${og.imageWidth}×${og.imageHeight}px`
				: "not specified";

		// Only suggest adding dimension tags if dimensions are not specified at all
		const shouldAddDimensionTags = !og.imageWidth || !og.imageHeight;

		issues.push({
			name: "Open Graph Image Dimensions",
			tag: "og:image:width/height",
			status:
				og.status.imageDimensionStatus === "fail" ? "fail" : "warning",
			current: dimensions,
			recommendation:
				og.status.imageDimensionStatus === "fail"
					? shouldAddDimensionTags
						? "Image dimensions are below minimum (600×315px) or not specified. Use images at least 1200×630px for optimal display across all platforms. Consider adding og:image:width and og:image:height meta tags."
						: "Current image dimensions are below the recommended size. For better social media display, use an image that is at least 1200×630px (1.91:1 ratio). Update your image file rather than just changing the dimension meta tags."
					: shouldAddDimensionTags
						? "Image dimensions are not specified. Consider adding og:image:width and og:image:height meta tags with values of at least 1200×630px."
						: "Current image dimensions could be improved. For better display quality on high-resolution screens, use an image that is 1200×630px or larger.",
			htmlCode: shouldAddDimensionTags
				? `<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />`
				: `<!-- Use a properly sized OG image (1200×630px recommended) instead of adjusting dimension tags -->`,
		});
	}

	// OG URL (optional but recommended)
	if (!og.url) {
		issues.push({
			name: "Open Graph URL",
			tag: "og:url",
			status: "warning",
			current: null,
			recommendation:
				"Add og:url tag with the canonical URL of your page. This helps ensure the correct URL is displayed when shared.",
			htmlCode: `<meta property="og:url" content="${og.url || "Your page URL"}" />`,
		});
	}

	// OG Type (optional but recommended)
	if (!og.type) {
		issues.push({
			name: "Open Graph Type",
			tag: "og:type",
			status: "warning",
			current: null,
			recommendation:
				"Add og:type tag. Common values: 'website' (default), 'article' (for blog posts), 'product' (for e-commerce).",
			htmlCode: `<meta property="og:type" content="website" />`,
		});
	}

	return issues;
}

/**
 * Get all Twitter Card issues
 */
function getTwitterCardIssues(
	tw: TwitterData,
	og: OpenGraphData,
): Array<{
	name: string;
	tag: string;
	status: "pass" | "warning" | "fail" | "info";
	current: string | null;
	fallback: string | null;
	recommendation: string;
	htmlCode: string;
}> {
	const issues: Array<{
		name: string;
		tag: string;
		status: "pass" | "warning" | "fail" | "info";
		current: string | null;
		fallback: string | null;
		recommendation: string;
		htmlCode: string;
	}> = [];

	// Twitter Card Type
	if (!tw.status.hasCard || !tw.status.cardValid) {
		issues.push({
			name: "Twitter Card Type",
			tag: "twitter:card",
			status: "warning",
			current: tw.card,
			fallback: null,
			recommendation: `Add twitter:card tag. Valid values: "summary" (small image), "summary_large_image" (large image), "app" (mobile app), "player" (video/audio).`,
			htmlCode: `<meta name="twitter:card" content="summary_large_image" />`,
		});
	}

	// Twitter Title
	if (!tw.title) {
		if (og.title) {
			issues.push({
				name: "Twitter Title",
				tag: "twitter:title",
				status: "info",
				current: null,
				fallback: og.title,
				recommendation:
					"Using og:title as fallback. Consider adding twitter:title if you want a different title for Twitter/X.",
				htmlCode: `<meta name="twitter:title" content="Your Twitter-specific Title" />`,
			});
		} else {
			issues.push({
				name: "Twitter Title",
				tag: "twitter:title",
				status: "warning",
				current: null,
				fallback: null,
				recommendation:
					"Add twitter:title tag or og:title (which Twitter uses as fallback).",
				htmlCode: `<meta name="twitter:title" content="Your Page Title" />`,
			});
		}
	}

	// Twitter Description
	if (!tw.description) {
		if (og.description) {
			issues.push({
				name: "Twitter Description",
				tag: "twitter:description",
				status: "info",
				current: null,
				fallback: og.description,
				recommendation:
					"Using og:description as fallback. Consider adding twitter:description if you want different text for Twitter/X.",
				htmlCode: `<meta name="twitter:description" content="Your Twitter-specific description" />`,
			});
		} else {
			issues.push({
				name: "Twitter Description",
				tag: "twitter:description",
				status: "warning",
				current: null,
				fallback: null,
				recommendation:
					"Add twitter:description tag or og:description (which Twitter uses as fallback).",
				htmlCode: `<meta name="twitter:description" content="A compelling description for Twitter" />`,
			});
		}
	}

	// Twitter Image
	if (!tw.image) {
		if (og.image) {
			issues.push({
				name: "Twitter Image",
				tag: "twitter:image",
				status: "info",
				current: null,
				fallback: og.image,
				recommendation:
					"Using og:image as fallback. Consider adding twitter:image if you want a different image for Twitter/X (recommended: 1200×675px for summary_large_image).",
				htmlCode: `<meta name="twitter:image" content="Twitter preview image URL" />`,
			});
		} else {
			issues.push({
				name: "Twitter Image",
				tag: "twitter:image",
				status: "warning",
				current: null,
				fallback: null,
				recommendation:
					"Add twitter:image tag or og:image (which Twitter uses as fallback).",
				htmlCode: `<meta name="twitter:image" content="Twitter preview image URL" />`,
			});
		}
	}

	// Twitter Site (optional)
	if (!tw.site) {
		issues.push({
			name: "Twitter Site",
			tag: "twitter:site",
			status: "info",
			current: null,
			fallback: null,
			recommendation:
				"Optional: Add twitter:site with your brand's Twitter handle (e.g., @YourBrand). This adds attribution when your content is shared.",
			htmlCode: `<meta name="twitter:site" content="@YourBrand" />`,
		});
	}

	// Twitter Creator (optional)
	if (!tw.creator) {
		issues.push({
			name: "Twitter Creator",
			tag: "twitter:creator",
			status: "info",
			current: null,
			fallback: null,
			recommendation:
				"Optional: Add twitter:creator with the author's Twitter handle. Useful for articles and content attribution.",
			htmlCode: `<meta name="twitter:creator" content="@AuthorHandle" />`,
		});
	}

	return issues;
}

/**
 * Get issues filtered by status
 */
function getIssuesByStatus(
	socialData: SocialData,
	includeFailures: boolean,
	includeWarnings: boolean,
): Array<{
	category: string;
	name: string;
	tag: string;
	status: "fail" | "warning";
	current: string | null;
	recommendation: string;
	htmlCode: string;
}> {
	const issues: Array<{
		category: string;
		name: string;
		tag: string;
		status: "fail" | "warning";
		current: string | null;
		recommendation: string;
		htmlCode: string;
	}> = [];

	const og = socialData.openGraph;
	const tw = socialData.twitter;

	// Get Open Graph issues
	const ogIssues = getOpenGraphIssues(og);
	ogIssues.forEach((issue) => {
		if (
			(includeFailures && issue.status === "fail") ||
			(includeWarnings && issue.status === "warning")
		) {
			issues.push({
				category: "Open Graph",
				name: issue.name,
				tag: issue.tag,
				status: issue.status,
				current: issue.current,
				recommendation: issue.recommendation,
				htmlCode: issue.htmlCode,
			});
		}
	});

	// Get Twitter Card issues
	const twIssues = getTwitterCardIssues(tw, og);
	twIssues.forEach((issue) => {
		if (
			(includeFailures && issue.status === "fail") ||
			(includeWarnings && issue.status === "warning")
		) {
			issues.push({
				category: "Twitter Card",
				name: issue.name,
				tag: issue.tag,
				status: issue.status as "fail" | "warning",
				current: issue.current,
				recommendation: issue.recommendation,
				htmlCode: issue.htmlCode,
			});
		}
	});

	return issues;
}

/**
 * Format summary for prompt
 */
function formatSocialSummary(data: SocialData): string {
	const og = data.openGraph;
	const tw = data.twitter;

	let passing = 0;
	let warnings = 0;
	let failures = 0;

	// Count OG issues
	if (og.status.hasTitle) passing++;
	else failures++;
	if (og.status.hasDescription) passing++;
	else failures++;
	if (og.status.hasImage) {
		passing++;
		if (og.status.imageDimensionStatus !== "pass") warnings++;
	} else {
		failures++;
	}

	// Count Twitter issues
	if (tw.status.hasCard && tw.status.cardValid) passing++;
	else warnings++;

	// Twitter title/description/image - only count if no OG fallback
	if (tw.title) passing++;
	else if (!og.title) warnings++;
	if (tw.description) passing++;
	else if (!og.description) warnings++;
	if (tw.image) passing++;
	else if (!og.image) warnings++;

	return `- Passing: ${passing}
- Warnings: ${warnings}
- Failures: ${failures}`;
}

/**
 * Format issues for prompt
 */
function formatSocialIssues(context: SocialViewPromptContext): string {
	const issues = getIssuesByStatus(
		context.socialData,
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

		const statusIcon = issue.status === "fail" ? "✗" : "⚠";
		result += `\n${index + 1}. ${statusIcon} **${issue.name}** [${issue.status}]\n`;
		if (issue.current) {
			result += `   Current: ${issue.current}\n`;
		}
		result += `   Recommendation: ${issue.recommendation}\n`;
		result += `   HTML Code:\n   \`\`\`html\n   ${issue.htmlCode}\n   \`\`\`\n`;
	});

	return result;
}

/**
 * Generate platform prompt (for ChatGPT, Claude, etc.) - EXACT EXTENSION FORMAT
 */
export function generateSocialViewPlatformPrompt(
	context: SocialViewPromptContext,
): string {
	const issues = getIssuesByStatus(
		context.socialData,
		context.includeFailures,
		context.includeWarnings,
	);

	if (issues.length === 0) {
		return `You are a social media SEO expert. I need help fixing social media meta tag issues on my website.

**Website URL**: ${context.pageUrl}

**Current Status**:
${formatSocialSummary(context.socialData)}

**No issues found matching your criteria.** All social media meta tags are properly configured!

═══════════════════════════════════════
Generated by webclarity.ai
═══════════════════════════════════════`;
	}

	return `You are a social media SEO expert. I need help fixing social media meta tag issues on my website.

**Website URL**: ${context.pageUrl}

**Current Status**:
${formatSocialSummary(context.socialData)}

${formatSocialIssues(context)}

**Background Information:**

**What are Open Graph tags?**
Open Graph (OG) tags are HTML meta tags that control how your website appears when shared on social media platforms like Facebook, LinkedIn, WhatsApp, and Discord. They define the title, description, and image that appear in the social media preview card.

**What are Twitter Cards?**
Twitter Cards are similar meta tags specifically for Twitter/X. Twitter will use Open Graph tags as fallbacks if Twitter-specific tags are not present.

**Instructions:**
- Review each issue listed above
- Provide specific, actionable recommendations for fixing each issue
- For meta tags, provide the exact HTML code needed
- Consider SEO best practices and current standards
- Prioritize critical failures over warnings

**Expected Response Format:**

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
 * Generate IDE prompt (for VS Code, Cursor, etc.) - EXACT EXTENSION FORMAT
 */
export function generateSocialViewIDEPrompt(
	context: SocialViewPromptContext,
): string {
	const issues = getIssuesByStatus(
		context.socialData,
		context.includeFailures,
		context.includeWarnings,
	);

	if (issues.length === 0) {
		return `You are an AI coding assistant. I need you to fix social media meta tag issues in my project files.

**CRITICAL INSTRUCTIONS:**
- DO NOT create any new files (no .md, no README, no documentation files)
- ONLY modify existing HTML/template files to fix social media meta tags
- After making all changes, provide a CHAT RESPONSE summarizing what was fixed

**Website URL**: ${context.pageUrl}

**Current Status**:
${formatSocialSummary(context.socialData)}

**No issues found matching your criteria.** All social media meta tags are properly configured!

═══════════════════════════════════════
Generated by webclarity.ai
═══════════════════════════════════════`;
	}

	let issuesList = "\n**Issues to Fix:**\n";
	let currentCategory = "";

	issues.forEach((issue, index) => {
		if (issue.category !== currentCategory) {
			if (currentCategory !== "") {
				issuesList += "\n";
			}
			issuesList += `\n**${issue.category}**\n`;
			currentCategory = issue.category;
		}

		issuesList += `\n${index + 1}. **${issue.name}** [${issue.status}]\n`;
		issuesList += `   Tag: ${issue.tag}\n`;
		if (issue.current) {
			issuesList += `   Current: ${issue.current}\n`;
		}
		issuesList += `   Fix: ${issue.recommendation}\n`;
		issuesList += `   Add: ${issue.htmlCode}\n`;
	});

	// Generate complete meta tags block
	let completeMetaTags = "";
	const ogIssues = issues.filter((i) => i.category === "Open Graph");
	const twIssues = issues.filter((i) => i.category === "Twitter Card");

	if (ogIssues.length > 0) {
		completeMetaTags += "<!-- Open Graph Meta Tags -->\n";
		ogIssues.forEach((issue) => {
			completeMetaTags += `${issue.htmlCode}\n`;
		});
	}
	if (twIssues.length > 0) {
		if (ogIssues.length > 0) completeMetaTags += "\n";
		completeMetaTags += "<!-- Twitter Card Meta Tags -->\n";
		twIssues.forEach((issue) => {
			completeMetaTags += `${issue.htmlCode}\n`;
		});
	}

	return `You are an AI coding assistant. I need you to fix social media meta tag issues in my project files.

**CRITICAL INSTRUCTIONS:**
- DO NOT create any new files (no .md, no README, no documentation files)
- ONLY modify existing HTML/template files to fix social media meta tags
- After making all changes, provide a CHAT RESPONSE summarizing what was fixed

**Website URL**: ${context.pageUrl}

**Current Status**:
${formatSocialSummary(context.socialData)}

${issuesList}

**Complete Meta Tags Block to Add:**
\`\`\`html
${completeMetaTags}\`\`\`

═══════════════════════════════════════

**YOUR TASK:**
1. For each issue listed above, find the corresponding HTML tag in the codebase
2. Add missing tags or update existing tags with the recommended values
3. Ensure all changes follow SEO best practices
4. DO NOT create any new files

**AFTER COMPLETING ALL FIXES, provide a chat summary using this EXACT format:**

**Summary of Social Media Fixes**

Total Issues Fixed: [number]

**Fixes Applied:**

1. **[Issue Name]**: [What was fixed]
2. **[Issue Name]**: [What was fixed]
3. **[Issue Name]**: [What was fixed]
(continue for ALL issues in strict numerical order)

**Files Modified:**
- [file path]
- [file path]

**IMPORTANT:** Include this footer ONLY in your chat summary response, NOT in any code changes:
═══════════════════════════════════════
Generated by webclarity.ai
═══════════════════════════════════════`;
}
