"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@ui/components/card";
import { Badge } from "@ui/components/badge";
import {
	AlertTriangleIcon,
	CheckIcon,
	ImageIcon,
	XIcon,
	FilterIcon,
} from "lucide-react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@ui/components/dropdown-menu";
import { Button } from "@ui/components/button";
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
					<Badge className="shrink-0 flex items-center gap-1 bg-green-50 text-green-700 border-green-200">
						<CheckIcon className="h-3 w-3" />
						Has Alt Text
					</Badge>
				);
			case "missing-alt":
				return (
					<Badge className="shrink-0 flex items-center gap-1 bg-red-50 text-red-700 border-red-200">
						<XIcon className="h-3 w-3" />
						Missing Alt
					</Badge>
				);
			case "empty-alt":
				return (
					<Badge className="shrink-0 flex items-center gap-1 bg-yellow-50 text-yellow-700 border-yellow-200">
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
		<div className="min-h-screen bg-background py-8 px-4 sm:px-6 lg:px-8 pb-24">
			<div className="max-w-7xl mx-auto">
				{/* Header */}
				<div className="mb-8">
					<div className="mb-4">
						<h1 className="text-3xl font-bold tracking-tight">
							Image Alt Report
						</h1>
						<p className="text-muted-foreground mt-1">
							Shared from{" "}
							<a
								href={`https://${websiteUrl}`}
								target="_blank"
								rel="noopener noreferrer"
								className="text-primary hover:underline font-medium"
							>
								{websiteUrl}
							</a>
						</p>
					</div>
					<div className="flex items-center gap-2 text-sm text-muted-foreground">
						<Badge status="info">
							Expires{" "}
							{new Date(data.expiresAt).toLocaleDateString()}
						</Badge>
					</div>
				</div>

				{/* Summary Cards */}
				{exportOptions.includeSummary !== false && (
					<Card className="mb-8">
						<CardHeader>
							<CardTitle>Summary</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
								<div>
									<div className="text-sm text-muted-foreground mb-1">
										Total Images
									</div>
									<div className="text-2xl font-bold">
										{summary.total}
									</div>
								</div>
								<div>
									<div className="text-sm text-muted-foreground mb-1">
										With Alt Text
									</div>
									<div className="text-2xl font-bold text-green-600">
										{summary.withAlt}
									</div>
								</div>
								<div>
									<div className="text-sm text-muted-foreground mb-1">
										Missing Alt
									</div>
									<div className="text-2xl font-bold text-red-600">
										{summary.missingAlt}
									</div>
								</div>
								<div>
									<div className="text-sm text-muted-foreground mb-1">
										Empty Alt
									</div>
									<div className="text-2xl font-bold text-yellow-600">
										{summary.emptyAlt}
									</div>
								</div>
							</div>
						</CardContent>
					</Card>
				)}

				{/* Images List with Filter */}
				<Card className="mb-8">
					<CardHeader>
						<div className="flex items-center justify-between">
							<CardTitle>
								Images ({filteredImages.length})
							</CardTitle>
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button variant="outline" size="sm">
										<FilterIcon className="size-4 mr-2" />
										{filterStatus === "all"
											? "All Images"
											: filterStatus === "with-alt"
												? "With Alt"
												: filterStatus === "missing-alt"
													? "Missing Alt"
													: "Empty Alt"}
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent align="end">
									<DropdownMenuItem
										onClick={() => setFilterStatus("all")}
									>
										All Images ({summary.total})
									</DropdownMenuItem>
									<DropdownMenuItem
										onClick={() =>
											setFilterStatus("with-alt")
										}
										disabled={summary.withAlt === 0}
									>
										With Alt ({summary.withAlt})
									</DropdownMenuItem>
									<DropdownMenuItem
										onClick={() =>
											setFilterStatus("missing-alt")
										}
										disabled={summary.missingAlt === 0}
									>
										Missing Alt ({summary.missingAlt})
									</DropdownMenuItem>
									<DropdownMenuItem
										onClick={() =>
											setFilterStatus("empty-alt")
										}
										disabled={summary.emptyAlt === 0}
									>
										Empty Alt ({summary.emptyAlt})
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>
						</div>
					</CardHeader>
					<CardContent>
						<div className="space-y-4">
							{filteredImages.map((image, index) => (
								<div
									key={index}
									className={cn(
										"p-4 rounded-lg border-2 transition-all",
										image.status === "with-alt"
											? "border-l-4 border-l-green-500 bg-card"
											: image.status === "missing-alt"
												? "border-l-4 border-l-red-500 bg-card"
												: "border-l-4 border-l-yellow-500 bg-card",
									)}
								>
									<div className="flex gap-4">
										{/* Image Thumbnail */}
										<div className="shrink-0 w-24 h-24 bg-muted rounded-lg overflow-hidden flex items-center justify-center border">
											{image.url ? (
												<img
													src={image.url}
													alt={image.alt || ""}
													className="max-w-full max-h-full object-contain"
													onError={(e) => {
														e.currentTarget.style.display =
															"none";
														const parent =
															e.currentTarget
																.parentElement;
														if (parent) {
															parent.innerHTML = `
															<div class="text-muted-foreground flex items-center justify-center w-full h-full">
																<svg class="w-12 h-12" fill="currentColor" viewBox="0 0 24 24">
																	<path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
																</svg>
															</div>
														`;
														}
													}}
												/>
											) : (
												<ImageIcon className="w-12 h-12 text-muted-foreground" />
											)}
										</div>

										{/* Image Details */}
										<div className="flex-1 min-w-0">
											<div className="flex items-start justify-between gap-2 mb-2">
												<div className="flex-1 min-w-0">
													<p className="text-sm font-medium truncate">
														{image.url}
													</p>
												</div>
												{getStatusBadge(image.status)}
											</div>

											{/* Alt Text */}
											<div className="mb-2">
												<p className="text-xs text-muted-foreground mb-1">
													Alt Text:
												</p>
												{image.alt ? (
													<p className="text-sm">
														{image.alt}
													</p>
												) : (
													<p className="text-sm text-destructive italic">
														No alt text provided
													</p>
												)}
											</div>

											{/* Dimensions */}
											{exportOptions.includeDimensions &&
												(image.width ||
													image.height) && (
													<div className="mb-2">
														<p className="text-xs text-muted-foreground">
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
														<summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground">
															CSS Selector
														</summary>
														<code className="text-xs bg-muted p-2 rounded block mt-1 overflow-x-auto font-mono">
															{image.selector}
														</code>
													</details>
												)}
										</div>
									</div>
								</div>
							))}

							{filteredImages.length === 0 && (
								<div className="text-center py-12 text-muted-foreground">
									<CheckIcon className="size-12 mx-auto mb-3 text-green-500" />
									<p className="font-medium">
										No images found with this filter
									</p>
									<p className="text-sm mt-1">
										Try selecting a different filter option
									</p>
								</div>
							)}
						</div>
					</CardContent>
				</Card>

				{/* Footer */}
				<div className="mt-12 pt-8 border-t border-border">
					<div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
						<div>© {new Date().getFullYear()} WebClarity</div>
						<a
							href="https://webclarity.ai"
							target="_blank"
							rel="noopener noreferrer"
							className="hover:text-foreground transition-colors font-medium"
						>
							webclarity.ai
						</a>
					</div>
				</div>
			</div>

			{/* Floating Action Bar */}
			<FloatingActionBar
				onFixWithAI={() => setShowAIFixModal(true)}
				onExport={() => setShowExportModal(true)}
				hasIssues={summary.missingAlt > 0 || summary.emptyAlt > 0}
			/>

			{/* Modals */}
			<ImagesAltAIFixModal
				open={showAIFixModal}
				onOpenChange={setShowAIFixModal}
				data={data}
			/>
			<ImagesAltExportModal
				open={showExportModal}
				onOpenChange={setShowExportModal}
				data={data}
			/>
		</div>
	);
}
