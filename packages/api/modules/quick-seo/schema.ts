import { z } from "zod";

/**
 * Schema for validating Quick SEO share data
 * Separated to avoid circular dependencies
 */

// SEO Status enum
const seoStatusSchema = z.enum(["pass", "warning", "fail", "info"]);

// Open Graph schema
const quickSeoOpenGraphSchema = z.object({
	hasImage: z.boolean(),
	imageUrl: z.string(),
	imageWidth: z.number().nullable(),
	imageHeight: z.number().nullable(),
	imageDimensionStatus: seoStatusSchema,
});

// Meta schema
const quickSeoMetaSchema = z.object({
	title: z.object({
		content: z.string(),
		length: z.number(),
		status: seoStatusSchema,
	}),
	description: z.object({
		content: z.string(),
		length: z.number(),
		status: seoStatusSchema,
	}),
	keywords: z.object({
		content: z.string(),
		count: z.number(),
	}),
	url: z.string(),
	canonical: z.object({
		url: z.string(),
		matchesCurrentUrl: z.boolean(),
		status: seoStatusSchema,
	}),
});

// Content schema
const quickSeoContentSchema = z.object({
	wordCount: z.number(),
	wordCountStatus: seoStatusSchema,
	headingsCount: z.object({
		total: z.number(),
		h1: z.number(),
		h2: z.number(),
		h3: z.number(),
		h4: z.number(),
		h5: z.number(),
		h6: z.number(),
	}),
	imagesCount: z.number(),
	imagesWithAlt: z.number(),
	imagesWithoutAlt: z.number(),
	linksCount: z.object({
		total: z.number(),
		internal: z.number(),
		external: z.number(),
	}),
});

// Technical schema
const quickSeoTechnicalSchema = z.object({
	robotsTag: z.object({
		content: z.string(),
		isIndexable: z.boolean(),
		status: seoStatusSchema,
	}),
	xRobotsTag: z.object({
		content: z.string(),
		status: seoStatusSchema,
	}),
	language: z.object({
		code: z.string(),
		name: z.string(),
		status: seoStatusSchema,
	}),
	author: z.object({
		content: z.string(),
	}),
	robotsTxtUrl: z.string(),
	sitemapUrl: z.string(),
});

// Main SEO data schema
const quickSeoDataSchema = z.object({
	openGraph: quickSeoOpenGraphSchema,
	meta: quickSeoMetaSchema,
	content: quickSeoContentSchema,
	technical: quickSeoTechnicalSchema,
});

// Export options schema
const quickSeoShareOptionsSchema = z.object({
	includePassing: z.boolean().optional().default(true),
	includeWarnings: z.boolean().optional().default(true),
	includeFailures: z.boolean().optional().default(true),
	includeSummary: z.boolean().optional().default(true),
	includeDetails: z.boolean().optional().default(true),
	includeOtherItems: z.boolean().optional().default(false),
});

/**
 * Schema for validating Quick SEO share data
 */
export const shareDataSchema = z.object({
	seoData: quickSeoDataSchema,
	exportOptions: quickSeoShareOptionsSchema,
	websiteUrl: z.string(),
	userId: z.string().optional(),
	organizationId: z.string().optional(),
});
