// Social Media Preview Components
import { SocialData } from "../share-social-view-page";

interface PreviewProps {
	data: SocialData;
}

export function FacebookPreview({ data }: PreviewProps) {
	const { openGraph, twitter } = data;
	const title = openGraph?.title || twitter?.title || "No title available";
	const description =
		openGraph?.description ||
		twitter?.description ||
		"No description available";
	const image = openGraph?.image || twitter?.image || "";
	const url = openGraph?.url || "";

	// Extract domain from URL
	let domain = "";
	try {
		if (url) {
			const urlObj = new URL(url);
			domain = urlObj.hostname.toLowerCase().replace(/^www\./, "");
		}
	} catch {
		domain = "example.com";
	}

	return (
		<div className="rounded-lg border bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow">
			{/* Platform Header */}
			<div className="flex items-center gap-2 px-4 py-3 border-b bg-gray-50">
				<svg
					width="16"
					height="16"
					viewBox="0 0 24 24"
					fill="#1877F2"
					xmlns="http://www.w3.org/2000/svg"
				>
					<path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
				</svg>
				<span className="font-semibold text-sm">Facebook</span>
			</div>

			{/* Image Section */}
			{image ? (
				<div
					className="relative bg-gray-100"
					style={{ aspectRatio: "1.91/1" }}
				>
					<img
						src={image}
						alt="Preview"
						className="w-full h-full object-cover"
						onError={(e) => {
							e.currentTarget.parentElement!.innerHTML = `
								<div class="w-full h-full flex flex-col items-center justify-center text-gray-400">
									<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
										<rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
										<circle cx="8.5" cy="8.5" r="1.5"></circle>
										<polyline points="21 15 16 10 5 21"></polyline>
									</svg>
									<span class="text-sm mt-2">No image</span>
								</div>
							`;
						}}
					/>
				</div>
			) : (
				<div
					className="w-full bg-gray-100 flex flex-col items-center justify-center text-gray-400"
					style={{ aspectRatio: "1.91/1" }}
				>
					<svg
						width="48"
						height="48"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="1"
					>
						<rect
							x="3"
							y="3"
							width="18"
							height="18"
							rx="2"
							ry="2"
						></rect>
						<circle cx="8.5" cy="8.5" r="1.5"></circle>
						<polyline points="21 15 16 10 5 21"></polyline>
					</svg>
					<span className="text-sm mt-2">No image</span>
				</div>
			)}

			{/* Content Section */}
			<div className="px-4 py-3 bg-gray-50 border-t">
				<div className="text-xs text-gray-500 uppercase mb-1">
					{domain}
				</div>
				<div className="font-semibold text-sm text-gray-900 line-clamp-2 mb-1">
					{title}
				</div>
				<div className="text-xs text-gray-600 line-clamp-2">
					{description}
				</div>
			</div>
		</div>
	);
}

export function WhatsAppPreview({ data }: PreviewProps) {
	const { openGraph, twitter } = data;
	const title = openGraph?.title || twitter?.title || "No title available";
	const description =
		openGraph?.description ||
		twitter?.description ||
		"No description available";
	const image = openGraph?.image || twitter?.image || "";
	const url = openGraph?.url || "";

	// Extract domain from URL
	let domain = "";
	try {
		if (url) {
			const urlObj = new URL(url);
			domain = urlObj.hostname.toLowerCase().replace(/^www\./, "");
		}
	} catch {
		domain = "example.com";
	}

	return (
		<div className="rounded-lg border bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow">
			{/* Platform Header */}
			<div className="flex items-center gap-2 px-4 py-3 border-b bg-gray-50">
				<svg
					width="16"
					height="16"
					viewBox="0 0 24 24"
					fill="#25D366"
					xmlns="http://www.w3.org/2000/svg"
				>
					<path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
				</svg>
				<span className="font-semibold text-sm">WhatsApp</span>
			</div>

			{/* Image Section */}
			{image ? (
				<div
					className="relative bg-gray-100"
					style={{ aspectRatio: "1.91/1" }}
				>
					<img
						src={image}
						alt="Preview"
						className="w-full h-full object-cover"
						onError={(e) => {
							e.currentTarget.parentElement!.innerHTML = `
								<div class="w-full h-full flex flex-col items-center justify-center text-gray-400">
									<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
										<rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
										<circle cx="8.5" cy="8.5" r="1.5"></circle>
										<polyline points="21 15 16 10 5 21"></polyline>
									</svg>
									<span class="text-sm mt-2">No image</span>
								</div>
							`;
						}}
					/>
				</div>
			) : (
				<div
					className="w-full bg-gray-100 flex flex-col items-center justify-center text-gray-400"
					style={{ aspectRatio: "1.91/1" }}
				>
					<svg
						width="48"
						height="48"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="1"
					>
						<rect
							x="3"
							y="3"
							width="18"
							height="18"
							rx="2"
							ry="2"
						></rect>
						<circle cx="8.5" cy="8.5" r="1.5"></circle>
						<polyline points="21 15 16 10 5 21"></polyline>
					</svg>
					<span className="text-sm mt-2">No image</span>
				</div>
			)}

			{/* Content Section */}
			<div className="px-4 py-3 bg-gray-50 border-t">
				<div className="text-xs text-gray-500 uppercase mb-1">
					{domain}
				</div>
				<div className="font-semibold text-sm text-gray-900 line-clamp-2 mb-1">
					{title}
				</div>
				<div className="text-xs text-gray-600 line-clamp-2">
					{description}
				</div>
			</div>
		</div>
	);
}

export function XPreview({ data }: PreviewProps) {
	const { openGraph, twitter } = data;
	const title = twitter?.title || openGraph?.title || "No title available";
	const image = twitter?.image || openGraph?.image || "";
	const url = openGraph?.url || "";

	// Extract domain from URL
	let domain = "";
	try {
		if (url) {
			const urlObj = new URL(url);
			domain = urlObj.hostname.toLowerCase().replace(/^www\./, "");
		}
	} catch {
		domain = "example.com";
	}

	return (
		<div className="rounded-lg border bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow">
			{/* Platform Header */}
			<div className="flex items-center gap-2 px-4 py-3 border-b bg-gray-50">
				<svg
					width="16"
					height="16"
					viewBox="0 0 24 24"
					fill="#000000"
					xmlns="http://www.w3.org/2000/svg"
				>
					<path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
				</svg>
				<span className="font-semibold text-sm">X (Twitter)</span>
			</div>

			{/* Main Content */}
			<div className="p-4">
				{image ? (
					<div>
						<div
							className="relative bg-gray-100 rounded-lg overflow-hidden mb-2"
							style={{ aspectRatio: "1.91/1" }}
						>
							<img
								src={image}
								alt="Preview"
								className="w-full h-full object-cover"
								onError={(e) => {
									e.currentTarget.parentElement!.innerHTML = `
										<div class="w-full h-full flex flex-col items-center justify-center text-gray-400">
											<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
												<rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
												<circle cx="8.5" cy="8.5" r="1.5"></circle>
												<polyline points="21 15 16 10 5 21"></polyline>
											</svg>
											<span class="text-sm mt-2">No image</span>
										</div>
									`;
								}}
							/>
						</div>
						<div className="font-medium text-sm text-gray-900 line-clamp-1">
							{title}
						</div>
					</div>
				) : (
					<div
						className="w-full bg-gray-100 rounded-lg flex flex-col items-center justify-center text-gray-400 mb-2"
						style={{ aspectRatio: "1.91/1" }}
					>
						<svg
							width="48"
							height="48"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="1"
						>
							<rect
								x="3"
								y="3"
								width="18"
								height="18"
								rx="2"
								ry="2"
							></rect>
							<circle cx="8.5" cy="8.5" r="1.5"></circle>
							<polyline points="21 15 16 10 5 21"></polyline>
						</svg>
						<span className="text-sm mt-2">No image</span>
					</div>
				)}
				<div className="text-xs text-gray-500 mt-2">From {domain}</div>
			</div>
		</div>
	);
}

export function LinkedInPreview({ data }: PreviewProps) {
	const { openGraph, twitter } = data;
	const title = openGraph?.title || twitter?.title || "No title available";
	const description =
		openGraph?.description ||
		twitter?.description ||
		"No description available";
	const image = openGraph?.image || twitter?.image || "";
	const url = openGraph?.url || "";

	// Extract domain from URL
	let domain = "";
	try {
		if (url) {
			const urlObj = new URL(url);
			domain = urlObj.hostname.toLowerCase().replace(/^www\./, "");
		}
	} catch {
		domain = "example.com";
	}

	return (
		<div className="rounded-lg border bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow">
			{/* Platform Header */}
			<div className="flex items-center gap-2 px-4 py-3 border-b bg-gray-50">
				<svg
					width="16"
					height="16"
					viewBox="0 0 24 24"
					fill="#0A66C2"
					xmlns="http://www.w3.org/2000/svg"
				>
					<path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
				</svg>
				<span className="font-semibold text-sm">LinkedIn</span>
			</div>

			{/* Image Section */}
			{image ? (
				<div
					className="relative bg-gray-100"
					style={{ aspectRatio: "1.91/1" }}
				>
					<img
						src={image}
						alt="Preview"
						className="w-full h-full object-cover"
						onError={(e) => {
							e.currentTarget.parentElement!.innerHTML = `
								<div class="w-full h-full flex flex-col items-center justify-center text-gray-400">
									<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
										<rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
										<circle cx="8.5" cy="8.5" r="1.5"></circle>
										<polyline points="21 15 16 10 5 21"></polyline>
									</svg>
									<span class="text-sm mt-2">No image</span>
								</div>
							`;
						}}
					/>
				</div>
			) : (
				<div
					className="w-full bg-gray-100 flex flex-col items-center justify-center text-gray-400"
					style={{ aspectRatio: "1.91/1" }}
				>
					<svg
						width="48"
						height="48"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="1"
					>
						<rect
							x="3"
							y="3"
							width="18"
							height="18"
							rx="2"
							ry="2"
						></rect>
						<circle cx="8.5" cy="8.5" r="1.5"></circle>
						<polyline points="21 15 16 10 5 21"></polyline>
					</svg>
					<span className="text-sm mt-2">No image</span>
				</div>
			)}

			{/* Content Section */}
			<div className="px-4 py-3 bg-gray-50 border-t">
				<div className="font-semibold text-sm text-gray-900 line-clamp-2 mb-1">
					{title}
				</div>
				<div className="text-xs text-gray-500">{domain}</div>
			</div>
		</div>
	);
}

export function DiscordPreview({ data }: PreviewProps) {
	const { openGraph, twitter } = data;
	const title = openGraph?.title || twitter?.title || "No title available";
	const description =
		openGraph?.description ||
		twitter?.description ||
		"No description available";
	const image = openGraph?.image || twitter?.image || "";
	const url = openGraph?.url || "";

	// Extract domain from URL
	let domain = "";
	try {
		if (url) {
			const urlObj = new URL(url);
			domain = urlObj.hostname.toLowerCase().replace(/^www\./, "");
		}
	} catch {
		domain = "example.com";
	}

	return (
		<div className="rounded-lg border bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow">
			{/* Platform Header */}
			<div className="flex items-center gap-2 px-4 py-3 border-b bg-gray-50">
				<svg
					width="16"
					height="16"
					viewBox="0 0 24 24"
					fill="#5865F2"
					xmlns="http://www.w3.org/2000/svg"
				>
					<path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
				</svg>
				<span className="font-semibold text-sm">Discord</span>
			</div>

			{/* Content with Left Border */}
			<div className="p-4 border-l-4 border-blue-600 bg-[#2f3136] text-white">
				<div className="font-semibold text-sm mb-1">{title}</div>
				<div className="text-xs text-gray-300 line-clamp-3 mb-3">
					{description}
				</div>

				{/* Image Section */}
				{image ? (
					<div className="relative bg-gray-800 rounded overflow-hidden max-w-md">
						<img
							src={image}
							alt="Preview"
							className="w-full h-auto object-cover"
							onError={(e) => {
								e.currentTarget.parentElement!.innerHTML = `
									<div class="w-full flex flex-col items-center justify-center text-gray-500 py-8">
										<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
											<rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
											<circle cx="8.5" cy="8.5" r="1.5"></circle>
											<polyline points="21 15 16 10 5 21"></polyline>
										</svg>
										<span class="text-sm mt-2">No image</span>
									</div>
								`;
							}}
						/>
					</div>
				) : (
					<div className="w-full bg-gray-800 rounded flex flex-col items-center justify-center text-gray-500 py-8 max-w-md">
						<svg
							width="48"
							height="48"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="1"
						>
							<rect
								x="3"
								y="3"
								width="18"
								height="18"
								rx="2"
								ry="2"
							></rect>
							<circle cx="8.5" cy="8.5" r="1.5"></circle>
							<polyline points="21 15 16 10 5 21"></polyline>
						</svg>
						<span className="text-sm mt-2">No image</span>
					</div>
				)}

				<div className="text-xs text-gray-400 mt-2">{domain}</div>
			</div>
		</div>
	);
}
