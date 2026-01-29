// Heading Structure Prompt Generator for Web App

interface HeadingNode {
	level: number;
	content: string;
	selector?: string;
	children: HeadingNode[];
	issues: Array<
		| "skip"
		| "orphan"
		| "short"
		| "long"
		| "empty"
		| "multiple-h1"
		| "missing-h1"
	>;
	targetLevel?: number;
}

export interface HeadingStructurePromptContext {
	pageUrl: string;
	tree: HeadingNode[];
	totalHeadings: number;
	h1Count: number;
	includeEmpty: boolean;
	includeShort: boolean;
	includeLong: boolean;
	includeSkip: boolean;
	includeOrphan: boolean;
	includeMultipleH1: boolean;
}

interface HeadingIssue {
	level: number;
	content: string;
	selector?: string;
	issueType: string;
	issueLabel: string;
	recommendation: string;
	targetLevel?: number;
}

/**
 * Get issue label for display
 */
function getIssueLabel(issueType: string): string {
	const labels: Record<string, string> = {
		empty: "Empty Heading",
		short: "Short Heading",
		long: "Long Heading",
		skip: "Skipped Level",
		orphan: "Orphaned Heading",
		"multiple-h1": "Multiple H1 Tags",
		"missing-h1": "Missing H1 Tag",
	};
	return labels[issueType] || issueType;
}

/**
 * Get recommendation for an issue type
 */
function getRecommendation(issueType: string, node: HeadingNode): string {
	switch (issueType) {
		case "empty":
			return `Add descriptive text to the H${node.level} heading or remove it if unnecessary.`;
		case "short":
			return `Expand the H${node.level} heading content to be more descriptive (at least 10 characters).`;
		case "long":
			return `Shorten the H${node.level} heading to be more concise (under 70 characters recommended).`;
		case "skip":
			return node.targetLevel
				? `Change from H${node.level} to H${node.targetLevel} to maintain proper heading hierarchy.`
				: `Adjust the heading level to maintain proper hierarchy (don't skip levels).`;
		case "orphan":
			return `This heading appears before any H1. Either add an H1 above it, or convert this to a non-heading element (like <p> or <div> with CSS styling).`;
		case "multiple-h1":
			return `Consider changing this H1 to H2 or another appropriate level. Each page should have only one H1.`;
		case "missing-h1":
			return `Add an H1 heading to the page. Every page should have exactly one H1.`;
		default:
			return "Review and fix this heading issue.";
	}
}

/**
 * Check if an issue type should be included based on context options
 */
function shouldIncludeIssue(
	issueType: string,
	context: HeadingStructurePromptContext,
): boolean {
	switch (issueType) {
		case "empty":
			return context.includeEmpty;
		case "short":
			return context.includeShort;
		case "long":
			return context.includeLong;
		case "skip":
			return context.includeSkip;
		case "orphan":
			return context.includeOrphan;
		case "multiple-h1":
			return context.includeMultipleH1;
		default:
			return false;
	}
}

/**
 * Collect all issues from the heading tree
 */
function collectIssues(
	context: HeadingStructurePromptContext,
): HeadingIssue[] {
	const issues: HeadingIssue[] = [];

	const traverse = (nodes: HeadingNode[]) => {
		for (const node of nodes) {
			for (const issueType of node.issues) {
				if (shouldIncludeIssue(issueType, context)) {
					issues.push({
						level: node.level,
						content: node.content || "(empty)",
						selector: node.selector,
						issueType,
						issueLabel: getIssueLabel(issueType),
						recommendation: getRecommendation(issueType, node),
						targetLevel: node.targetLevel,
					});
				}
			}
			if (node.children.length > 0) {
				traverse(node.children);
			}
		}
	};

	traverse(context.tree);
	return issues;
}

/**
 * Format summary statistics
 */
function formatSummary(context: HeadingStructurePromptContext): string {
	const issues = collectIssues(context);

	// Count by issue type
	const counts: Record<string, number> = {};
	for (const issue of issues) {
		counts[issue.issueType] = (counts[issue.issueType] || 0) + 1;
	}

	let summary = `- Total Headings: ${context.totalHeadings}
- H1 Count: ${context.h1Count}
- Total Issues: ${issues.length}`;

	if (issues.length > 0) {
		summary += "\n- Issue Breakdown:";
		for (const [type, count] of Object.entries(counts)) {
			summary += `\n  - ${getIssueLabel(type)}: ${count}`;
		}
	}

	return summary;
}

/**
 * Format issues for platform prompt
 */
function formatIssuesForPlatform(
	context: HeadingStructurePromptContext,
): string {
	const issues = collectIssues(context);

	if (issues.length === 0) {
		return "\n**No issues found matching your criteria.**";
	}

	let result = "\n**Heading Issues to Fix:**\n";

	issues.forEach((issue, index) => {
		const isCritical = ["empty", "skip", "multiple-h1"].includes(
			issue.issueType,
		);
		const statusIcon = isCritical ? "!" : "?";

		result += `\n${index + 1}. [${statusIcon}] **H${issue.level}**: "${issue.content}"\n`;
		result += `   Issue: ${issue.issueLabel}\n`;
		result += `   Recommendation: ${issue.recommendation}\n`;
	});

	return result;
}

/**
 * Format issues for IDE prompt (includes selectors)
 */
function formatIssuesForIDE(context: HeadingStructurePromptContext): string {
	const issues = collectIssues(context);

	if (issues.length === 0) {
		return "\n**No issues found matching your criteria.**";
	}

	let result = "\n**Heading Issues to Fix:**\n";

	issues.forEach((issue, index) => {
		result += `\n${index + 1}. **H${issue.level}**: "${issue.content}"\n`;
		result += `   Issue: ${issue.issueLabel}\n`;
		result += `   Tag: <h${issue.level}>...</h${issue.level}>\n`;
		if (issue.selector) {
			result += `   Selector: ${issue.selector}\n`;
		}
		if (issue.targetLevel) {
			result += `   Change to: <h${issue.targetLevel}>...</h${issue.targetLevel}>\n`;
		}
		result += `   Fix: ${issue.recommendation}\n`;
	});

	return result;
}

/**
 * Generate platform prompt (for ChatGPT, Claude, etc.)
 */
export function generateHeadingStructurePlatformPrompt(
	context: HeadingStructurePromptContext,
): string {
	const issues = collectIssues(context);

	if (issues.length === 0) {
		return `You are an SEO and accessibility expert. I need help fixing heading structure issues on my website.

**Website URL**: ${context.pageUrl}

**Current Status**:
${formatSummary(context)}

**No issues found matching your criteria.** Your heading structure is looking good!

═══════════════════════════════════════
Generated by webclarity.ai
═══════════════════════════════════════`;
	}

	return `You are an SEO and accessibility expert. I need help fixing heading structure issues on my website.

**Website URL**: ${context.pageUrl}

**Current Status**:
${formatSummary(context)}

${formatIssuesForPlatform(context)}

**Instructions**:
- Review each heading issue listed above
- Provide specific, actionable recommendations for fixing each issue
- For heading level changes, explain the proper hierarchy
- For empty/short headings, suggest appropriate content
- For long headings, suggest how to shorten while preserving meaning
- Consider both SEO and accessibility best practices

**Expected Response Format**:

For each issue, provide:
1. **Heading**: [Current heading text]
2. **Issue**: [Issue type]
3. **Recommended Fix**: [Specific action]
4. **Example Code** (if applicable):
   \`\`\`html
   [Corrected HTML code]
   \`\`\`

**Heading Structure Best Practices**:
- Each page should have exactly one H1 tag
- Heading levels should not skip (H1 → H2 → H3, not H1 → H3)
- Headings should be descriptive and meaningful (10-70 characters)
- Headings should not be empty or used purely for styling

IMPORTANT: After providing all fixes, you MUST end your response with the following footer (include the dividers):

═══════════════════════════════════════
Generated by webclarity.ai
═══════════════════════════════════════`;
}

/**
 * Generate IDE prompt (for VS Code, Cursor, etc.)
 */
export function generateHeadingStructureIDEPrompt(
	context: HeadingStructurePromptContext,
): string {
	const issues = collectIssues(context);

	if (issues.length === 0) {
		return `You are an AI coding assistant. I need you to fix heading structure issues in my project files.

**CRITICAL INSTRUCTIONS:**
- DO NOT create any new files (no .md, no README, no documentation files)
- ONLY modify existing HTML/template files to fix heading tags
- After making all changes, provide a CHAT RESPONSE summarizing what was fixed

**Website URL**: ${context.pageUrl}

**Current Status**:
${formatSummary(context)}

**No issues found matching your criteria.** Your heading structure is looking good!

═══════════════════════════════════════
Generated by webclarity.ai
═══════════════════════════════════════`;
	}

	return `You are an AI coding assistant. I need you to fix heading structure issues in my project files.

**CRITICAL INSTRUCTIONS:**
- DO NOT create any new files (no .md, no README, no documentation files)
- ONLY modify existing HTML/template files to fix heading tags
- After making all changes, provide a CHAT RESPONSE summarizing what was fixed

**Website URL**: ${context.pageUrl}

**Current Status**:
${formatSummary(context)}

${formatIssuesForIDE(context)}

═══════════════════════════════════════

**YOUR TASK:**
1. For each heading issue listed above, find the corresponding element in the codebase using the provided selector or content
2. Fix the issue according to the recommendation:
   - For empty headings: Add descriptive text or remove the element
   - For short headings: Expand the content to be more descriptive
   - For long headings: Shorten while preserving meaning
   - For skipped levels: Change the heading tag to the correct level
   - For orphaned headings: Either add an H1 above or convert to non-heading element
   - For multiple H1: Change to H2 or appropriate level
3. Ensure all changes follow heading hierarchy best practices
4. DO NOT create any new files

**AFTER COMPLETING ALL FIXES, provide a chat summary using this EXACT format:**

**Summary of Heading Structure Fixes**

Total Issues Fixed: [number]

**Fixes Applied:**

1. **[Issue Type]**: [What was fixed] (H[level]: "[content]")
2. **[Issue Type]**: [What was fixed] (H[level]: "[content]")
(continue for ALL issues in strict numerical order)

**Files Modified:**
- [file path]
- [file path]

**IMPORTANT:** Include this footer ONLY in your chat summary response, NOT in any code changes:
═══════════════════════════════════════
Generated by webclarity.ai
═══════════════════════════════════════`;
}
