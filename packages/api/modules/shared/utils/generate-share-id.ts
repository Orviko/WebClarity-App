import { db } from "@repo/database/prisma/client";
import { customAlphabet } from "nanoid";

/**
 * Generates a cryptographically secure 12-digit alphanumeric share ID
 * Uses nanoid for better randomness distribution than modulo operation
 * Ensures uniqueness by checking against the unified Share table
 */
const ALPHANUMERIC_ALPHABET =
	"0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
const generateNanoid = customAlphabet(ALPHANUMERIC_ALPHABET, 12);

export async function generateShareId(): Promise<string> {
	const MAX_RETRIES = 10;

	for (let i = 0; i < MAX_RETRIES; i++) {
		const shareId = generateNanoid();

		// Check if ID already exists in unified Share table
		const existing = await db.share.findUnique({
			where: { shareId },
		});

		if (!existing) {
			return shareId;
		}
	}

	// Fallback: if we can't generate a unique ID after max attempts, throw error
	throw new Error("Failed to generate unique share ID after multiple attempts");
}

