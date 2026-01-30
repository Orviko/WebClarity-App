import { z } from "zod";

/**
 * Schema for validating Images Alt share data
 * Separated to avoid circular dependencies
 */

// Image status enum
const imageAltStatusSchema = z.enum(["with-alt", "missing-alt", "empty-alt"]);

// Individual image node schema
const imageNodeSchema = z.object({
	url: z.string(),
	alt: z.string().nullable(),
	status: imageAltStatusSchema,
	width: z.number().optional(),
	height: z.number().optional(),
	selector: z.string().optional(),
});

// Images alt summary schema
const imagesAltSummarySchema = z.object({
	total: z.number(),
	withAlt: z.number(),
	emptyAlt: z.number(),
	missingAlt: z.number(),
});

// Main images alt data schema
const imagesAltDataSchema = z.object({
	summary: imagesAltSummarySchema,
	images: z.array(imageNodeSchema),
});

// Export options schema
const imagesAltShareOptionsSchema = z.object({
	includeWithAlt: z.boolean().optional().default(false),
	includeWithoutAlt: z.boolean().optional().default(true),
	includeDimensions: z.boolean().optional().default(false),
	includeSelectors: z.boolean().optional().default(false),
	includeSummary: z.boolean().optional().default(true),
});

/**
 * Schema for validating Images Alt share data
 */
export const shareDataSchema = z.object({
	imagesData: imagesAltDataSchema,
	exportOptions: imagesAltShareOptionsSchema,
	websiteUrl: z.string(),
	userId: z.string().optional(),
	organizationId: z.string().optional(),
});
