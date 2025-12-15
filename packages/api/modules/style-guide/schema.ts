import { z } from "zod";

/**
 * Schema for validating style guide share data
 * Separated to avoid circular dependencies
 */
export const shareDataSchema = z.object({
	typographyData: z.unknown().nullable(),
	colorsData: z.unknown().nullable(),
	exportOptions: z.record(z.string(), z.any()),
	websiteUrl: z.string(),
	userId: z.string().optional(),
	organizationId: z.string().optional(),
});
