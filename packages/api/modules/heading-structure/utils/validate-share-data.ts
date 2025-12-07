import { ORPCError } from "@orpc/server";

const MAX_PAYLOAD_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_JSON_DEPTH = 20; // Maximum nesting depth for JSON structures
const MAX_ARRAY_LENGTH = 10000; // Maximum array length
const MAX_STRING_LENGTH = 100000; // Maximum string length in JSON
const MAX_TREE_DEPTH = 10; // Maximum depth for heading tree

export interface ShareDataInput {
	treeData: unknown;
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
 * Validates heading tree structure recursively
 */
function validateHeadingTree(nodes: unknown[], depth: number = 0): void {
	if (depth > MAX_TREE_DEPTH) {
		throw new ORPCError("BAD_REQUEST");
	}

	if (!Array.isArray(nodes)) {
		throw new ORPCError("BAD_REQUEST");
	}

	if (nodes.length > MAX_ARRAY_LENGTH) {
		throw new ORPCError("BAD_REQUEST");
	}

	for (const node of nodes) {
		if (!node || typeof node !== "object") {
			throw new ORPCError("BAD_REQUEST");
		}

		const nodeObj = node as Record<string, unknown>;

		// Validate required fields
		if (
			typeof nodeObj.level !== "number" ||
			nodeObj.level < 1 ||
			nodeObj.level > 6
		) {
			throw new ORPCError("BAD_REQUEST");
		}

		if (typeof nodeObj.content !== "string") {
			throw new ORPCError("BAD_REQUEST");
		}

		if (nodeObj.content.length > MAX_STRING_LENGTH) {
			throw new ORPCError("BAD_REQUEST");
		}

		// Validate issues array
		if (!Array.isArray(nodeObj.issues)) {
			throw new ORPCError("BAD_REQUEST");
		}

		const validIssues = [
			"skip",
			"orphan",
			"short",
			"long",
			"empty",
			"multiple-h1",
			"missing-h1",
		];
		for (const issue of nodeObj.issues) {
			if (!validIssues.includes(issue as string)) {
				throw new ORPCError("BAD_REQUEST");
			}
		}

		// Validate children recursively
		if (nodeObj.children && Array.isArray(nodeObj.children)) {
			validateHeadingTree(nodeObj.children, depth + 1);
		}
	}
}

/**
 * Validates the incoming heading structure share data
 */
export function validateShareData(data: ShareDataInput): {
	treeData: unknown;
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

	// Validate domain format - must be a valid domain name
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

	// Validate treeData structure
	if (!data.treeData || typeof data.treeData !== "object") {
		throw new ORPCError("BAD_REQUEST");
	}

	const treeDataObj = data.treeData as Record<string, unknown>;

	// Validate tree structure
	if (!Array.isArray(treeDataObj.tree)) {
		throw new ORPCError("BAD_REQUEST");
	}

	// Validate heading tree recursively
	validateHeadingTree(treeDataObj.tree);

	// Validate summary fields
	if (
		typeof treeDataObj.totalHeadings !== "number" ||
		treeDataObj.totalHeadings < 0
	) {
		throw new ORPCError("BAD_REQUEST");
	}

	if (
		typeof treeDataObj.issuesCount !== "number" ||
		treeDataObj.issuesCount < 0
	) {
		throw new ORPCError("BAD_REQUEST");
	}

	if (typeof treeDataObj.h1Count !== "number" || treeDataObj.h1Count < 0) {
		throw new ORPCError("BAD_REQUEST");
	}

	// Validate exportOptions structure
	if (!data.exportOptions || typeof data.exportOptions !== "object") {
		throw new ORPCError("BAD_REQUEST");
	}

	// Validate JSON structure depth
	try {
		validateJsonDepth(data.treeData);
		validateJsonDepth(data.exportOptions);
	} catch (error) {
		// Re-throw validation errors
		if (error instanceof ORPCError) {
			throw error;
		}
		throw new ORPCError("BAD_REQUEST");
	}

	return {
		treeData: data.treeData,
		exportOptions: data.exportOptions,
		websiteUrl,
	};
}
