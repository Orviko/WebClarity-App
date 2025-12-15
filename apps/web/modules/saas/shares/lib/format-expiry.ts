/**
 * Format expiry date/time for display
 */
export function formatExpiry(expiresAt: Date): string {
	const now = new Date();
	const diff = expiresAt.getTime() - now.getTime();

	if (diff < 0) {
		return "Expired";
	}

	const days = Math.floor(diff / (1000 * 60 * 60 * 24));
	const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
	const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

	if (days > 0) {
		return `${days} ${days === 1 ? "day" : "days"}`;
	}

	if (hours > 0) {
		return `${hours} ${hours === 1 ? "hour" : "hours"}`;
	}

	if (minutes > 0) {
		return `${minutes} ${minutes === 1 ? "minute" : "minutes"}`;
	}

	return "Expiring soon";
}

