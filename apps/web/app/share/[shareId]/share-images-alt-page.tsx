"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@ui/components/card";
import { Badge } from "@ui/components/badge";
import { AlertTriangleIcon, CheckIcon, ImageIcon, XIcon } from "lucide-react";
import { cn } from "@ui/lib";
import { FloatingActionBar } from "./components/FloatingActionBar";
import { ImagesAltAIFixModal } from "./components/ImagesAltAIFixModal";
import { ImagesAltExportModal } from "./components/ImagesAltExportModal";

type ImageAltStatus = "with-alt" | "missing-alt" | "empty-alt";

interface ImageNode {
	url: string;
	alt: string | null;
	status: ImageAltStatus;
	width?: number;
	height?: number;
	selector?: string;
}

interface ImagesAltSummary {
	total: number;
	withAlt: number;
	emptyAlt: number;
	missingAlt: number;
}

interface ImagesAltData {
	summary: ImagesAltSummary;
	images: ImageNode[];
}

export interface ImagesAltShareData {
	imagesData: ImagesAltData;
	exportOptions: {
		includeWithAlt?: boolean;
		includeWithoutAlt?: boolean;
		includeDimensions?: boolean;
		includeSelectors?: boolean;
		includeSummary?: boolean;
	};
	websiteUrl: string;
	expiresAt: string;
	createdAt: string;
}

interface Props {
	data: ImagesAltShareData;
}

export function ShareImagesAltPage({ data }: Props) {
	const t = useTranslations();
	const [filterStatus, setFilterStatus] = useState<"all" | ImageAltStatus>(
		"all",
	);
	const [showAIFixModal, setShowAIFixModal] = useState(false);
	const [showExportModal, setShowExportModal] = useState(false);

	const { imagesData, exportOptions, websiteUrl } = data;
	const { summary, images } = imagesData;

	// Filter images based on selected status
	const filteredImages = useMemo(() => {
		if (filterStatus === "all") return images;
		return images.filter((img) => img.status === filterStatus);
	}, [images, filterStatus]);

	const getStatusBadge = (status: ImageAltStatus) => {
		switch (status) {
			case "with-alt":
				return (
					<Badge className="gap-1 bg-green-50 text-green-700 border-green-200">
						<CheckIcon className="h-3 w-3" />
						Has Alt Text
					</Badge>
				);
			case "missing-alt":
				return (
					<Badge className="gap-1 bg-red-50 text-red-700 border-red-200">
						<XIcon className="h-3 w-3" />
						Missing Alt
					</Badge>
				);
			case "empty-alt":
				return (
					<Badge className="gap-1 bg-yellow-50 text-yellow-700 border-yellow-200">
						<AlertTriangleIcon className="h-3 w-3" />
						Empty Alt
					</Badge>
				);
		}
	};

	const getStatusColor = (status: ImageAltStatus) => {
		switch (status) {
			case "with-alt":
				return "text-green-600 bg-green-50";
			case "missing-alt":
				return "text-red-600 bg-red-50";
			case "empty-alt":
				return "text-yellow-600 bg-yellow-50";
		}
	};

	return (
		<div className="min-h-screen bg-gray-50">
			<div className="container mx-auto px-4 py-8 max-w-6xl">
				{/* Header */}
				<div className="mb-6">
					<div className="flex items-center justify-between mb-2">
						<h1 className="text-3xl font-bold">
							Images Alt Report
						</h1>
						<Badge status="info">{websiteUrl}</Badge>
					</div>
					<p className="text-gray-600">
						Comprehensive analysis of image alt attributes for SEO
						and accessibility
					</p>
				</div>

				{/* Summary Cards */}
				{exportOptions.includeSummary !== false && (
					<div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
						<Card>
							<CardContent className="pt-6">
								<div className="text-center">
									<div className="text-3xl font-bold">
										{summary.total}
									</div>
									<div className="text-sm text-gray-600 mt-1">
										Total Images
									</div>
								</div>
							</CardContent>
						</Card>
						<Card>
							<CardContent className="pt-6">
								<div className="text-center">
									<div className="text-3xl font-bold text-green-600">
										{summary.withAlt}
									</div>
									<div className="text-sm text-gray-600 mt-1">
										With Alt Text
									</div>
								</div>
							</CardContent>
						</Card>
						<Card>
							<CardContent className="pt-6">
								<div className="text-center">
									<div className="text-3xl font-bold text-red-600">
										{summary.missingAlt}
									</div>
									<div className="text-sm text-gray-600 mt-1">
										Missing Alt
									</div>
								</div>
							</CardContent>
						</Card>
						<Card>
							<CardContent className="pt-6">
								<div className="text-center">
									<div className="text-3xl font-bold text-yellow-600">
										{summary.emptyAlt}
									</div>
									<div className="text-sm text-gray-600 mt-1">
										Empty Alt
									</div>
								</div>
							</CardContent>
						</Card>
					</div>
				)}

				{/* Filter */}
				<Card className="mb-6">
					<CardContent className="pt-6">
						<div className="flex gap-2 flex-wrap">
							<button
								onClick={() => setFilterStatus("all")}
								className={cn(
									"px-4 py-2 rounded-lg text-sm font-medium transition-colors",
									filterStatus === "all"
										? "bg-blue-600 text-white"
										: "bg-gray-100 text-gray-700 hover:bg-gray-200",
								)}
							>
								All ({images.length})
							</button>
							<button
								onClick={() => setFilterStatus("with-alt")}
								className={cn(
									"px-4 py-2 rounded-lg text-sm font-medium transition-colors",
									filterStatus === "with-alt"
										? "bg-green-600 text-white"
										: "bg-gray-100 text-gray-700 hover:bg-gray-200",
								)}
							>
								With Alt ({summary.withAlt})
							</button>
							<button
								onClick={() => setFilterStatus("missing-alt")}
								className={cn(
									"px-4 py-2 rounded-lg text-sm font-medium transition-colors",
									filterStatus === "missing-alt"
										? "bg-red-600 text-white"
										: "bg-gray-100 text-gray-700 hover:bg-gray-200",
								)}
							>
								Missing Alt ({summary.missingAlt})
							</button>
							<button
								onClick={() => setFilterStatus("empty-alt")}
								className={cn(
									"px-4 py-2 rounded-lg text-sm font-medium transition-colors",
									filterStatus === "empty-alt"
										? "bg-yellow-600 text-white"
										: "bg-gray-100 text-gray-700 hover:bg-gray-200",
								)}
							>
								Empty Alt ({summary.emptyAlt})
							</button>
						</div>
					</CardContent>
				</Card>

				{/* Images List */}
				<Card>
					<CardHeader>
						<CardTitle>
							{filterStatus === "all"
								? "All Images"
								: `${filterStatus} Images`}{" "}
							({filteredImages.length})
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="space-y-4">
							{filteredImages.map((image, index) => (
								<div
									key={index}
									className={cn(
										"p-4 rounded-lg border-2",
										getStatusColor(image.status),
									)}
								>
									<div className="flex gap-4">
										{/* Image Thumbnail */}
										<div className="flex-shrink-0 w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
											{image.url ? (
												<img
													src={image.url}
													alt={image.alt || ""}
													className="max-w-full max-h-full object-contain"
													onError={(e) => {
														e.currentTarget.style.display =
															"none";
														e.currentTarget.parentElement!.innerHTML = `
															<div class="text-gray-400">
																<svg class="w-12 h-12" fill="currentColor" viewBox="0 0 24 24">
																	<path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
																</svg>
															</div>
														`;
													}}
												/>
											) : (
												<ImageIcon className="w-12 h-12 text-gray-400" />
											)}
										</div>

										{/* Image Details */}
										<div className="flex-1 min-w-0">
											<div className="flex items-start justify-between gap-2 mb-2">
												<div className="flex-1 min-w-0">
													<p className="text-sm font-medium text-gray-900 truncate">
														{image.url}
													</p>
												</div>
												{getStatusBadge(image.status)}
											</div>

											{/* Alt Text */}
											<div className="mb-2">
												<p className="text-xs text-gray-500 mb-1">
													Alt Text:
												</p>
												{image.alt ? (
													<p className="text-sm text-gray-700">
														{image.alt}
													</p>
												) : (
													<p className="text-sm text-red-600 italic">
														No alt text provided
													</p>
												)}
											</div>

											{/* Dimensions */}
											{exportOptions.includeDimensions &&
												(image.width ||
													image.height) && (
													<div className="mb-2">
														<p className="text-xs text-gray-500">
															Dimensions:{" "}
															{image.width}×
															{image.height}
														</p>
													</div>
												)}

											{/* CSS Selector */}
											{exportOptions.includeSelectors &&
												image.selector && (
													<details className="mt-2">
														<summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-700">
															CSS Selector
														</summary>
														<code className="text-xs bg-gray-100 p-2 rounded block mt-1 overflow-x-auto">
															{image.selector}
														</code>
													</details>
												)}
										</div>
									</div>
								</div>
							))}

							{filteredImages.length === 0 && (
								<div className="text-center py-12 text-gray-500">
									No images found with {filterStatus} status
								</div>
							)}
						</div>
					</CardContent>
				</Card>

				{/* Footer */}
				<div className="mt-8 text-center text-sm text-gray-500">
					<p>
						Powered by <strong>WebClarity</strong> • Created:{" "}
						{new Date(data.createdAt).toLocaleDateString()}
					</p>
				</div>
			</div>

			{/* Floating Action Bar */}
			<FloatingActionBar
				onFixWithAI={() => setShowAIFixModal(true)}
				onExport={() => setShowExportModal(true)}
				hasIssues={summary.missingAlt > 0 || summary.emptyAlt > 0}
			/>

			{/* Modals */}
			{showAIFixModal && (
				<ImagesAltAIFixModal
					onClose={() => setShowAIFixModal(false)}
					data={data}
				/>
			)}
			{showExportModal && (
				<ImagesAltExportModal
					onClose={() => setShowExportModal(false)}
					data={data}
				/>
			)}
		</div>
	);
}
