import { ORPCError } from "@orpc/server";
import { auth } from "@repo/auth";
import { logger } from "@repo/logs";
import { webhookHandler as paymentsWebhookHandler } from "@repo/payments";
import { getBaseUrl } from "@repo/utils";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger as honoLogger } from "hono/logger";
import { openApiHandler, rpcHandler } from "./orpc/handler";

export const app = new Hono()
	.basePath("/api")
	// Logger middleware
	.use(honoLogger((message, ...rest) => logger.log(message, ...rest)))
	// Cors middleware
	.use(
		cors({
			origin: (origin) => {
				// If no origin (same-origin request), allow it
				if (!origin) {
					return origin;
				}

				// Allow requests from the web app
				const baseUrl = getBaseUrl();
				if (origin === baseUrl) {
					return origin;
				}

				// Allow localhost for development
				if (
					origin.startsWith("http://localhost:") ||
					origin.startsWith("http://127.0.0.1:")
				) {
					return origin;
				}

				// Allow browser extension origins (chrome-extension://, moz-extension://, etc.)
				if (origin.startsWith("chrome-extension://")) {
					return origin;
				}
				if (origin.startsWith("moz-extension://")) {
					return origin;
				}
				if (origin.startsWith("safari-extension://")) {
					return origin;
				}

				// For public API endpoints (like style-guide share), allow any origin
				// Security is provided by:
				// 1. Rate limiting (10 requests per hour per IP)
				// 2. Input validation and sanitization
				// 3. Payload size limits (5MB max)
				// 4. Automatic expiration (24 hours)
				// Note: In production, consider restricting to known extension IDs if possible
				return origin;
			},
			allowHeaders: ["Content-Type", "Authorization"],
			allowMethods: ["POST", "GET", "OPTIONS"],
			exposeHeaders: ["Content-Length"],
			maxAge: 600,
			credentials: true,
		}),
	)
	// Auth handler
	.on(["POST", "GET"], "/auth/**", (c) => auth.handler(c.req.raw))
	// Payments webhook handler
	.post("/webhooks/payments", (c) => paymentsWebhookHandler(c.req.raw))
	// Health check
	.get("/health", (c) => c.text("OK"))
	// Style guide share endpoint (direct route for extension compatibility)
	.post("/rpc/style-guide/create-share", async (c) => {
		try {
			const body = await c.req.json();

			// Import schema from separate file to avoid circular dependencies
			const { shareDataSchema } =
				await import("./modules/style-guide/schema");

			// Import handler separately
			const { createShareHandler } =
				await import("./modules/style-guide/procedures/create-share");

			// Validate input using the schema
			const parsed = shareDataSchema.parse(body);

			// Call handler
			const result = await createShareHandler(parsed);

			return c.json(result);
		} catch (error: any) {
			logger.error("Error creating style guide share:", error);

			// Handle Zod validation errors
			if (error?.issues) {
				return c.json(
					{
						json: {
							defined: false,
							code: "BAD_REQUEST",
							status: 400,
							message: "Input validation failed",
							data: { issues: error.issues },
						},
					},
					400,
				);
			}

			// Handle ORPCError - it may have nested structure
			let errorCode: string;
			let errorMessage: string;
			let statusCode = 500;

			if (error?.code) {
				// Check if code is nested (object) or direct (string)
				if (typeof error.code === "object" && error.code.code) {
					errorCode = error.code.code;
					errorMessage = error.code.message || String(errorCode);
				} else if (typeof error.code === "string") {
					errorCode = error.code;
					errorMessage = error.message || String(errorCode);
				} else {
					errorCode = "BAD_REQUEST";
					errorMessage = error.message || "Bad request";
				}

				// Map error codes to HTTP status codes
				if (errorCode === "BAD_REQUEST") {
					statusCode = 400;
				} else if (errorCode === "NOT_FOUND") {
					statusCode = 404;
				} else if (errorCode === "UNAUTHORIZED") {
					statusCode = 401;
				} else if (errorCode === "FORBIDDEN") {
					statusCode = 403;
				} else if (errorCode === "TOO_MANY_REQUESTS") {
					statusCode = 429;
				}
			} else if (error instanceof Error) {
				errorCode = "INTERNAL_SERVER_ERROR";
				errorMessage = error.message || "Internal server error";
			} else {
				errorCode = "INTERNAL_SERVER_ERROR";
				errorMessage = String(error) || "Internal server error";
			}

			return c.json(
				{
					json: {
						defined: false,
						code: errorCode,
						status: statusCode,
						message: errorMessage,
					},
				},
				statusCode as any,
			);
		}
	})
	// Heading structure share endpoint (direct route for extension compatibility)
	.post("/rpc/heading-structure/create-share", async (c) => {
		try {
			const body = await c.req.json();

			// Import schema from separate file to avoid circular dependencies
			const { shareDataSchema } =
				await import("./modules/heading-structure/schema");

			// Import handler separately
			const { createShareHandler } =
				await import("./modules/heading-structure/procedures/create-share");

			// Validate input using the schema
			const parsed = shareDataSchema.parse(body);

			// Call handler
			const result = await createShareHandler(parsed);

			return c.json(result);
		} catch (error: any) {
			logger.error("Error creating heading structure share:", error);

			// Handle Zod validation errors
			if (error?.issues) {
				return c.json(
					{
						json: {
							defined: false,
							code: "BAD_REQUEST",
							status: 400,
							message: "Input validation failed",
							data: { issues: error.issues },
						},
					},
					400,
				);
			}

			// Handle ORPCError - it may have nested structure
			let errorCode: string;
			let errorMessage: string;
			let statusCode = 500;

			if (error?.code) {
				// Check if code is nested (object) or direct (string)
				if (typeof error.code === "object" && error.code.code) {
					errorCode = error.code.code;
					errorMessage = error.code.message || String(errorCode);
				} else if (typeof error.code === "string") {
					errorCode = error.code;
					errorMessage = error.message || String(errorCode);
				} else {
					errorCode = "BAD_REQUEST";
					errorMessage = error.message || "Bad request";
				}

				// Map error codes to HTTP status codes
				if (errorCode === "BAD_REQUEST") {
					statusCode = 400;
				} else if (errorCode === "NOT_FOUND") {
					statusCode = 404;
				} else if (errorCode === "UNAUTHORIZED") {
					statusCode = 401;
				} else if (errorCode === "FORBIDDEN") {
					statusCode = 403;
				} else if (errorCode === "TOO_MANY_REQUESTS") {
					statusCode = 429;
				}
			} else if (error instanceof Error) {
				errorCode = "INTERNAL_SERVER_ERROR";
				errorMessage = error.message || "Internal server error";
			} else {
				errorCode = "INTERNAL_SERVER_ERROR";
				errorMessage = String(error) || "Internal server error";
			}

			return c.json(
				{
					json: {
						defined: false,
						code: errorCode,
						status: statusCode,
						message: errorMessage,
					},
				},
				statusCode as any,
			);
		}
	})
	// Quick SEO share endpoint (direct route for extension compatibility)
	.post("/rpc/quick-seo/create-share", async (c) => {
		try {
			const body = await c.req.json();

			// Import schema from separate file to avoid circular dependencies
			const { shareDataSchema } =
				await import("./modules/quick-seo/schema");

			// Import handler separately
			const { createShareHandler } =
				await import("./modules/quick-seo/procedures/create-share");

			// Validate input using the schema
			const parsed = shareDataSchema.parse(body);

			// Call handler
			const result = await createShareHandler(parsed);

			return c.json(result);
		} catch (error: any) {
			logger.error("Error creating Quick SEO share:", error);

			// Handle Zod validation errors
			if (error?.issues) {
				return c.json(
					{
						json: {
							defined: false,
							code: "BAD_REQUEST",
							status: 400,
							message: "Input validation failed",
							data: { issues: error.issues },
						},
					},
					400,
				);
			}

			// Handle ORPCError - it may have nested structure
			let errorCode: string;
			let errorMessage: string;
			let statusCode = 500;

			if (error?.code) {
				// Check if code is nested (object) or direct (string)
				if (typeof error.code === "object" && error.code.code) {
					errorCode = error.code.code;
					errorMessage = error.code.message || String(errorCode);
				} else if (typeof error.code === "string") {
					errorCode = error.code;
					errorMessage = error.message || String(errorCode);
				} else {
					errorCode = "BAD_REQUEST";
					errorMessage = error.message || "Bad request";
				}

				// Map error codes to HTTP status codes
				if (errorCode === "BAD_REQUEST") {
					statusCode = 400;
				} else if (errorCode === "NOT_FOUND") {
					statusCode = 404;
				} else if (errorCode === "UNAUTHORIZED") {
					statusCode = 401;
				} else if (errorCode === "FORBIDDEN") {
					statusCode = 403;
				} else if (errorCode === "TOO_MANY_REQUESTS") {
					statusCode = 429;
				}
			} else if (error instanceof Error) {
				errorCode = "INTERNAL_SERVER_ERROR";
				errorMessage = error.message || "Internal server error";
			} else {
				errorCode = "INTERNAL_SERVER_ERROR";
				errorMessage = String(error) || "Internal server error";
			}

			return c.json(
				{
					json: {
						defined: false,
						code: errorCode,
						status: statusCode,
						message: errorMessage,
					},
				},
				statusCode as any,
			);
		}
	})
	// Images Alt share endpoint (direct route for extension compatibility)
	.post("/rpc/images-alt/create-share", async (c) => {
		try {
			const body = await c.req.json();

			// Import schema from separate file to avoid circular dependencies
			const { shareDataSchema } =
				await import("./modules/images-alt/schema");

			// Import handler separately
			const { createShareHandler } =
				await import("./modules/images-alt/procedures/create-share");

			// Validate input using the schema
			const parsed = shareDataSchema.parse(body);

			// Call handler
			const result = await createShareHandler(parsed);

			return c.json(result);
		} catch (error: any) {
			logger.error("Error creating Images Alt share:", error);

			// Handle Zod validation errors
			if (error?.issues) {
				return c.json(
					{
						json: {
							defined: false,
							code: "BAD_REQUEST",
							status: 400,
							message: "Input validation failed",
							data: { issues: error.issues },
						},
					},
					400,
				);
			}

			// Handle ORPCError - it may have nested structure
			let errorCode: string;
			let errorMessage: string;
			let statusCode = 500;

			if (error?.code) {
				// Check if code is nested (object) or direct (string)
				if (typeof error.code === "object" && error.code.code) {
					errorCode = error.code.code;
					errorMessage = error.code.message || String(errorCode);
				} else if (typeof error.code === "string") {
					errorCode = error.code;
					errorMessage = error.message || String(errorCode);
				} else {
					errorCode = "BAD_REQUEST";
					errorMessage = error.message || "Bad request";
				}

				// Map error codes to HTTP status codes
				if (errorCode === "BAD_REQUEST") {
					statusCode = 400;
				} else if (errorCode === "NOT_FOUND") {
					statusCode = 404;
				} else if (errorCode === "UNAUTHORIZED") {
					statusCode = 401;
				} else if (errorCode === "FORBIDDEN") {
					statusCode = 403;
				} else if (errorCode === "TOO_MANY_REQUESTS") {
					statusCode = 429;
				}
			} else if (error instanceof Error) {
				errorCode = "INTERNAL_SERVER_ERROR";
				errorMessage = error.message || "Internal server error";
			} else {
				errorCode = "INTERNAL_SERVER_ERROR";
				errorMessage = String(error) || "Internal server error";
			}

			return c.json(
				{
					json: {
						defined: false,
						code: errorCode,
						status: statusCode,
						message: errorMessage,
					},
				},
				statusCode as any,
			);
		}
	})
	// Social View share endpoint (direct route for extension compatibility)
	.post("/rpc/social-view/create-share", async (c) => {
		try {
			const body = await c.req.json();

			// Import schema from separate file to avoid circular dependencies
			const { shareDataSchema } =
				await import("./modules/social-view/schema");

			// Import handler separately
			const { createShareHandler } =
				await import("./modules/social-view/procedures/create-share");

			// Validate input using the schema
			const parsed = shareDataSchema.parse(body);

			// Call handler
			const result = await createShareHandler(parsed);

			return c.json(result);
		} catch (error: any) {
			logger.error("Error creating Social View share:", error);

			// Handle Zod validation errors
			if (error?.issues) {
				return c.json(
					{
						json: {
							defined: false,
							code: "BAD_REQUEST",
							status: 400,
							message: "Input validation failed",
							data: { issues: error.issues },
						},
					},
					400,
				);
			}

			// Handle ORPCError - it may have nested structure
			let errorCode: string;
			let errorMessage: string;
			let statusCode = 500;

			if (error?.code) {
				// Check if code is nested (object) or direct (string)
				if (typeof error.code === "object" && error.code.code) {
					errorCode = error.code.code;
					errorMessage = error.code.message || String(errorCode);
				} else if (typeof error.code === "string") {
					errorCode = error.code;
					errorMessage = error.message || String(errorCode);
				} else {
					errorCode = "BAD_REQUEST";
					errorMessage = error.message || "Bad request";
				}

				// Map error codes to HTTP status codes
				if (errorCode === "BAD_REQUEST") {
					statusCode = 400;
				} else if (errorCode === "NOT_FOUND") {
					statusCode = 404;
				} else if (errorCode === "UNAUTHORIZED") {
					statusCode = 401;
				} else if (errorCode === "FORBIDDEN") {
					statusCode = 403;
				} else if (errorCode === "TOO_MANY_REQUESTS") {
					statusCode = 429;
				}
			} else if (error instanceof Error) {
				errorCode = "INTERNAL_SERVER_ERROR";
				errorMessage = error.message || "Internal server error";
			} else {
				errorCode = "INTERNAL_SERVER_ERROR";
				errorMessage = String(error) || "Internal server error";
			}

			return c.json(
				{
					json: {
						defined: false,
						code: errorCode,
						status: statusCode,
						message: errorMessage,
					},
				},
				statusCode as any,
			);
		}
	})
	// oRPC handlers (for RPC and OpenAPI)
	.use("*", async (c, next) => {
		try {
			const context = {
				headers: c.req.raw.headers,
			};

			const isRpc = c.req.path.includes("/rpc/");

			const handler = isRpc ? rpcHandler : openApiHandler;

			const prefix = isRpc ? "/api/rpc" : "/api";

			const { matched, response } = await handler.handle(c.req.raw, {
				prefix,
				context,
			});

			if (matched) {
				return c.newResponse(response.body, response);
			}

			await next();
		} catch (error: any) {
			logger.error("Error in RPC handler:", error);

			// Handle ORPCError instances
			if (error instanceof ORPCError || error?.code) {
				const errorCode =
					error instanceof ORPCError
						? error.code
						: typeof error.code === "string"
							? error.code
							: error.code.code || "INTERNAL_SERVER_ERROR";
				const errorMessage = error.message || String(errorCode);
				const statusCode =
					errorCode === "UNAUTHORIZED"
						? 401
						: errorCode === "FORBIDDEN"
							? 403
							: errorCode === "BAD_REQUEST"
								? 400
								: errorCode === "NOT_FOUND"
									? 404
									: errorCode === "TOO_MANY_REQUESTS"
										? 429
										: 500;

				return c.json(
					{
						json: {
							defined: false,
							code: errorCode,
							status: statusCode,
							message: errorMessage,
						},
					},
					statusCode as any,
				);
			}

			// Handle generic errors
			return c.json(
				{
					json: {
						defined: false,
						code: "INTERNAL_SERVER_ERROR",
						status: 500,
						message:
							error instanceof Error
								? error.message
								: "Internal server error",
					},
				},
				500,
			);
		}
	});
