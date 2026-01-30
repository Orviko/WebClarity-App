import { ORPCError } from "@orpc/server";

const MAX_PAYLOAD_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_JSON_DEPTH = 20; // Maximum nesting depth for JSON structures
const MAX_ARRAY_LENGTH = 10000; // Maximum array length
const MAX_STRING_LENGTH = 100000; // Maximum string length in JSON

export interface ShareDataInput {
	socialData: unknown;
	exportOptions: unknown;
	websiteUrl: unknown;
}

/**
 * Validates JSON structure depth and prevents deeply nested objects
 */
function validateJsonDepth(obj: unknown, depth: number = 0): void {
	if (depth > MAX_JSON_DEPTH) {
		throw new ORPCError("BAD_REQUEST");
	}

	if (obj === null || obj === undefined) {
		return;
	}

	if (Array.isArray(obj)) {
		if (obj.length > MAX_ARRAY_LENGTH) {
			throw new ORPCError("BAD_REQUEST");
		}
		for (const item of obj) {
			validateJsonDepth(item, depth + 1);
		}
	} else if (typeof obj === "object") {
		const keys = Object.keys(obj);
		if (keys.length > 1000) {
			throw new ORPCError("BAD_REQUEST");
		}
		for (const value of Object.values(obj)) {
			validateJsonDepth(value, depth + 1);
		}
	} else if (typeof obj === "string") {
		if (obj.length > MAX_STRING_LENGTH) {
			throw new ORPCError("BAD_REQUEST");
		}
	}
}

/**
 * Validates image URLs to ensure they are safe
 */
function validateImageUrl(url: string | null): void {
	if (!url) return;

	// Block data URLs and blob URLs for security
	if (url.startsWith("data:") || url.startsWith("blob:")) {
		throw new ORPCError("BAD_REQUEST");
	}

	// Ensure reasonable length
	if (url.length > 2048) {
		throw new ORPCError("BAD_REQUEST");
	}

	// Basic URL validation
	if (
		!url.startsWith("http://") &&
		!url.startsWith("https://") &&
		!url.startsWith("/")
	) {
		throw new ORPCError("BAD_REQUEST");
	}
}

/**
 * Validates the incoming Social View share data
 */
export function validateShareData(data: ShareDataInput): {
	socialData: unknown;
	exportOptions: unknown;
	websiteUrl: string;
} {
	// Check payload size
	const payloadSize = JSON.stringify(data).length;
	if (payloadSize > MAX_PAYLOAD_SIZE) {
		throw new ORPCError("BAD_REQUEST");
	}

	// Validate websiteUrl
	if (
		typeof data.websiteUrl !== "string" ||
		data.websiteUrl.trim().length === 0
	) {
		throw new ORPCError("BAD_REQUEST");
	}

	// Sanitize and validate website URL
	let websiteUrl = data.websiteUrl.trim();

	// Remove protocol and trailing slashes
	websiteUrl = websiteUrl.replace(/^https?:\/\//i, "");
	websiteUrl = websiteUrl.replace(/\/+$/, "");

	// Remove any path, query, or fragment (only keep domain)
	const domainMatch = websiteUrl.match(/^([^\/?#]+)/);
	if (domainMatch) {
		websiteUrl = domainMatch[1];
	}

	// Validate domain format
	const domainRegex =
		/^([a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?\.)*[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?$|^localhost$|^(\d{1,3}\.){3}\d{1,3}$/;
	if (!domainRegex.test(websiteUrl)) {
		throw new ORPCError("BAD_REQUEST");
	}

	// Basic validation - ensure URL is reasonable length
	if (websiteUrl.length > 255) {
		throw new ORPCError("BAD_REQUEST");
	}

	// Security: Prevent common injection patterns
	const dangerousPatterns = [
		/[\x00-\x1F\x7F]/, // Control characters
		/[<>"']/, // HTML/script injection characters
		/javascript:/i, // JavaScript protocol
		/data:/i, // Data URI
	];

	for (const pattern of dangerousPatterns) {
		if (pattern.test(websiteUrl)) {
			throw new ORPCError("BAD_REQUEST");
		}
	}

	// Validate socialData structure
	if (!data.socialData || typeof data.socialData !== "object") {
		throw new ORPCError("BAD_REQUEST");
	}

	const socialDataObj = data.socialData as Record<string, unknown>;

	// Validate required sections exist
	if (!socialDataObj.openGraph || !socialDataObj.twitter) {
		throw new ORPCError("BAD_REQUEST");
	}

	// Validate image URLs if present
	const openGraph = socialDataObj.openGraph as Record<string, unknown>;
	const twitter = socialDataObj.twitter as Record<string, unknown>;

	if (typeof openGraph.image === "string") {
		validateImageUrl(openGraph.image);
	}
	if (typeof twitter.image === "string") {
		validateImageUrl(twitter.image);
	}

	// Validate exportOptions structure
	if (!data.exportOptions || typeof data.exportOptions !== "object") {
		throw new ORPCError("BAD_REQUEST");
	}

	// Validate JSON structure depth
	try {
		validateJsonDepth(data.socialData);
		validateJsonDepth(data.exportOptions);
	} catch (error) {
		// Re-throw validation errors
		if (error instanceof ORPCError) {
			throw error;
		}
		throw new ORPCError("BAD_REQUEST");
	}

	return {
		socialData: data.socialData,
		exportOptions: data.exportOptions,
		websiteUrl,
	};
}
