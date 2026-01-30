import { z } from "zod";

/**
 * Schema for validating Social View share data
 * Separated to avoid circular dependencies
 */

// SEO Status enum (reused from Quick SEO)
const seoStatusSchema = z.enum(["pass", "warning", "fail", "info"]);

// Open Graph status schema
const openGraphStatusSchema = z.object({
	hasTitle: z.boolean(),
	hasDescription: z.boolean(),
	hasImage: z.boolean(),
	imageValid: z.boolean(),
	imageDimensionStatus: seoStatusSchema,
});

// Twitter status schema
const twitterStatusSchema = z.object({
	hasCard: z.boolean(),
	hasTitle: z.boolean(),
	hasDescription: z.boolean(),
	hasImage: z.boolean(),
	cardValid: z.boolean(),
});

// Open Graph data schema
const openGraphSchema = z.object({
	title: z.string().nullable(),
	description: z.string().nullable(),
	image: z.string().nullable(),
	url: z.string().nullable(),
	type: z.string().nullable(),
	siteName: z.string().nullable(),
	imageWidth: z.number().nullable(),
	imageHeight: z.number().nullable(),
	status: openGraphStatusSchema,
});

// Twitter data schema
const twitterSchema = z.object({
	card: z.string().nullable(),
	title: z.string().nullable(),
	description: z.string().nullable(),
	image: z.string().nullable(),
	site: z.string().nullable(),
	creator: z.string().nullable(),
	status: twitterStatusSchema,
});

// Main social view data schema
const socialViewDataSchema = z.object({
	openGraph: openGraphSchema,
	twitter: twitterSchema,
});

// Export options schema
const socialViewShareOptionsSchema = z.object({
	includeOpenGraph: z.boolean().optional().default(true),
	includeTwitter: z.boolean().optional().default(true),
	includePreview: z.boolean().optional().default(true),
	includeSummary: z.boolean().optional().default(true),
});

/**
 * Schema for validating Social View share data
 */
export const shareDataSchema = z.object({
	socialData: socialViewDataSchema,
	exportOptions: socialViewShareOptionsSchema,
	websiteUrl: z.string(),
	userId: z.string().optional(),
	organizationId: z.string().optional(),
});
