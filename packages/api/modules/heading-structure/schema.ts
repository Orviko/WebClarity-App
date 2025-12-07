import { z } from "zod";

/**
 * Schema for validating heading structure share data
 * Separated to avoid circular dependencies
 */

// Schema for HeadingNode structure
const headingNodeSchema: z.ZodType<any> = z.lazy(() =>
	z.object({
		level: z.number().int().min(1).max(6),
		content: z.string(),
		selector: z.string().optional(),
		children: z.array(headingNodeSchema),
		issues: z.array(
			z.enum([
				"skip",
				"orphan",
				"short",
				"long",
				"empty",
				"multiple-h1",
				"missing-h1",
			])
		),
		isExpanded: z.boolean().optional(),
		targetLevel: z.number().int().min(1).max(6).optional(),
	})
);

/**
 * Schema for validating heading structure share data
 */
export const shareDataSchema = z.object({
	treeData: z.object({
		tree: z.array(headingNodeSchema),
		totalHeadings: z.number().int().min(0),
		issuesCount: z.number().int().min(0),
		h1Count: z.number().int().min(0),
	}),
	exportOptions: z.object({
		includeIssues: z.boolean().optional().default(true),
		maxDepth: z.number().int().min(1).max(10).optional(),
		includeSelectors: z.boolean().optional().default(false),
		includeSummary: z.boolean().optional().default(true),
	}),
	websiteUrl: z.string(),
});

