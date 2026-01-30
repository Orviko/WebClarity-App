"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@ui/components/card";
import { Badge } from "@ui/components/badge";
import { CheckIcon, XIcon, AlertTriangleIcon } from "lucide-react";
import { cn } from "@ui/lib";
import { FloatingActionBar } from "./components/FloatingActionBar";
import { SocialViewAIFixModal } from "./components/SocialViewAIFixModal";
import { SocialViewExportModal } from "./components/SocialViewExportModal";

type SEOStatus = "pass" | "warning" | "fail" | "info";

interface OpenGraphStatus {
	hasTitle: boolean;
	hasDescription: boolean;
	hasImage: boolean;
	imageValid: boolean;
	imageDimensionStatus: SEOStatus;
}

interface TwitterStatus {
	hasCard: boolean;
	hasTitle: boolean;
	hasDescription: boolean;
	hasImage: boolean;
	cardValid: boolean;
}

interface OpenGraphData {
	title: string | null;
	description: string | null;
	image: string | null;
	url: string | null;
	type: string | null;
	siteName: string | null;
	imageWidth: number | null;
	imageHeight: number | null;
	status: OpenGraphStatus;
}

interface TwitterData {
	card: string | null;
	title: string | null;
	description: string | null;
	image: string | null;
	site: string | null;
	creator: string | null;
	status: TwitterStatus;
}

interface SocialData {
	openGraph: OpenGraphData;
	twitter: TwitterData;
}

export interface SocialViewShareData {
	socialData: SocialData;
	exportOptions: {
		includeOpenGraph?: boolean;
		includeTwitter?: boolean;
		includePreview?: boolean;
		includeSummary?: boolean;
	};
	websiteUrl: string;
	expiresAt: string;
	createdAt: string;
}

interface Props {
	data: SocialViewShareData;
}

export function ShareSocialViewPage({ data }: Props) {
	const t = useTranslations();
	const [activeTab, setActiveTab] = useState<"details" | "preview">(
		"details",
	);
	const [showAIFixModal, setShowAIFixModal] = useState(false);
	const [showExportModal, setShowExportModal] = useState(false);

	const { socialData, exportOptions, websiteUrl } = data;
	const { openGraph, twitter } = socialData;

	// Calculate summary counts
	const calculateSummary = () => {
		let passing = 0;
		let warnings = 0;
		let failures = 0;

		// Open Graph checks
		if (openGraph.status.hasTitle) passing++;
		else failures++;
		if (openGraph.status.hasDescription) passing++;
		else failures++;
		if (openGraph.status.hasImage && openGraph.status.imageValid) passing++;
		else if (openGraph.status.hasImage) warnings++;
		else failures++;

		// Twitter checks
		if (twitter.status.hasCard && twitter.status.cardValid) passing++;
		else if (twitter.status.hasCard) warnings++;
		else failures++;
		if (twitter.status.hasTitle) passing++;
		else failures++;
		if (twitter.status.hasDescription) passing++;
		else failures++;

		return { passing, warnings, failures };
	};

	const summary = calculateSummary();

	const getStatusIcon = (passed: boolean) => {
		if (passed) {
			return <CheckIcon className="w-4 h-4 text-green-600" />;
		}
		return <XIcon className="w-4 h-4 text-red-600" />;
	};

	return (
		<div className="min-h-screen bg-gray-50">
			<div className="container mx-auto px-4 py-8 max-w-6xl">
				{/* Header */}
				<div className="mb-6">
					<div className="flex items-center justify-between mb-2">
						<h1 className="text-3xl font-bold">
							Social Media Preview Report
						</h1>
						<Badge status="info">{websiteUrl}</Badge>
					</div>
					<p className="text-gray-600">
						Open Graph and Twitter Card validation for social media
						optimization
					</p>
				</div>

				{/* Summary Cards */}
				{exportOptions.includeSummary !== false && (
					<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
						<Card>
							<CardContent className="pt-6">
								<div className="text-center">
									<div className="text-3xl font-bold text-green-600">
										{summary.passing}
									</div>
									<div className="text-sm text-gray-600 mt-1">
										Passing
									</div>
								</div>
							</CardContent>
						</Card>
						<Card>
							<CardContent className="pt-6">
								<div className="text-center">
									<div className="text-3xl font-bold text-yellow-600">
										{summary.warnings}
									</div>
									<div className="text-sm text-gray-600 mt-1">
										Warnings
									</div>
								</div>
							</CardContent>
						</Card>
						<Card>
							<CardContent className="pt-6">
								<div className="text-center">
									<div className="text-3xl font-bold text-red-600">
										{summary.failures}
									</div>
									<div className="text-sm text-gray-600 mt-1">
										Failures
									</div>
								</div>
							</CardContent>
						</Card>
					</div>
				)}

				{/* Tabs */}
				<div className="mb-6 border-b">
					<div className="flex gap-4">
						<button
							onClick={() => setActiveTab("details")}
							className={cn(
								"px-4 py-2 font-medium transition-colors border-b-2",
								activeTab === "details"
									? "border-blue-600 text-blue-600"
									: "border-transparent text-gray-600 hover:text-gray-900",
							)}
						>
							Details
						</button>
						<button
							onClick={() => setActiveTab("preview")}
							className={cn(
								"px-4 py-2 font-medium transition-colors border-b-2",
								activeTab === "preview"
									? "border-blue-600 text-blue-600"
									: "border-transparent text-gray-600 hover:text-gray-900",
							)}
						>
							Preview
						</button>
					</div>
				</div>

				{/* Details Tab */}
				{activeTab === "details" && (
					<div className="space-y-6">
						{/* Open Graph Section */}
						{exportOptions.includeOpenGraph !== false && (
							<Card>
								<CardHeader>
									<CardTitle>Open Graph Meta Tags</CardTitle>
								</CardHeader>
								<CardContent className="space-y-4">
									<div className="flex items-start gap-3">
										{getStatusIcon(
											openGraph.status.hasTitle,
										)}
										<div className="flex-1">
											<p className="font-medium">Title</p>
											<p className="text-sm text-gray-600">
												{openGraph.title || (
													<span className="text-red-600">
														Not set
													</span>
												)}
											</p>
										</div>
									</div>
									<div className="flex items-start gap-3">
										{getStatusIcon(
											openGraph.status.hasDescription,
										)}
										<div className="flex-1">
											<p className="font-medium">
												Description
											</p>
											<p className="text-sm text-gray-600">
												{openGraph.description || (
													<span className="text-red-600">
														Not set
													</span>
												)}
											</p>
										</div>
									</div>
									<div className="flex items-start gap-3">
										{getStatusIcon(
											openGraph.status.hasImage &&
												openGraph.status.imageValid,
										)}
										<div className="flex-1">
											<p className="font-medium">Image</p>
											{openGraph.image ? (
												<div>
													<img
														src={openGraph.image}
														alt="Open Graph preview"
														className="mt-2 rounded-lg border max-w-md"
														onError={(e) => {
															e.currentTarget.style.display =
																"none";
														}}
													/>
													<p className="text-xs text-gray-500 mt-1">
														{openGraph.image}
													</p>
													{openGraph.imageWidth &&
														openGraph.imageHeight && (
															<p className="text-xs text-gray-500">
																Dimensions:{" "}
																{
																	openGraph.imageWidth
																}
																×
																{
																	openGraph.imageHeight
																}
																{openGraph
																	.status
																	.imageDimensionStatus ===
																	"warning" && (
																	<span className="text-yellow-600 ml-2">
																		(Recommended:
																		1200×630)
																	</span>
																)}
															</p>
														)}
												</div>
											) : (
												<span className="text-red-600 text-sm">
													Not set
												</span>
											)}
										</div>
									</div>
									{openGraph.url && (
										<div className="flex items-start gap-3">
											<CheckIcon className="w-4 h-4 text-green-600" />
											<div className="flex-1">
												<p className="font-medium">
													URL
												</p>
												<p className="text-sm text-gray-600">
													{openGraph.url}
												</p>
											</div>
										</div>
									)}
									{openGraph.type && (
										<div className="flex items-start gap-3">
											<CheckIcon className="w-4 h-4 text-green-600" />
											<div className="flex-1">
												<p className="font-medium">
													Type
												</p>
												<p className="text-sm text-gray-600">
													{openGraph.type}
												</p>
											</div>
										</div>
									)}
									{openGraph.siteName && (
										<div className="flex items-start gap-3">
											<CheckIcon className="w-4 h-4 text-green-600" />
											<div className="flex-1">
												<p className="font-medium">
													Site Name
												</p>
												<p className="text-sm text-gray-600">
													{openGraph.siteName}
												</p>
											</div>
										</div>
									)}
								</CardContent>
							</Card>
						)}

						{/* Twitter Section */}
						{exportOptions.includeTwitter !== false && (
							<Card>
								<CardHeader>
									<CardTitle>
										Twitter Card Meta Tags
									</CardTitle>
								</CardHeader>
								<CardContent className="space-y-4">
									<div className="flex items-start gap-3">
										{getStatusIcon(
											twitter.status.hasCard &&
												twitter.status.cardValid,
										)}
										<div className="flex-1">
											<p className="font-medium">
												Card Type
											</p>
											<p className="text-sm text-gray-600">
												{twitter.card || (
													<span className="text-red-600">
														Not set
													</span>
												)}
											</p>
										</div>
									</div>
									<div className="flex items-start gap-3">
										{getStatusIcon(twitter.status.hasTitle)}
										<div className="flex-1">
											<p className="font-medium">Title</p>
											<p className="text-sm text-gray-600">
												{twitter.title ||
													openGraph.title || (
														<span className="text-red-600">
															Not set
														</span>
													)}
												{!twitter.title &&
													openGraph.title && (
														<span className="text-gray-500 text-xs ml-2">
															(Fallback from OG)
														</span>
													)}
											</p>
										</div>
									</div>
									<div className="flex items-start gap-3">
										{getStatusIcon(
											twitter.status.hasDescription,
										)}
										<div className="flex-1">
											<p className="font-medium">
												Description
											</p>
											<p className="text-sm text-gray-600">
												{twitter.description ||
													openGraph.description || (
														<span className="text-red-600">
															Not set
														</span>
													)}
												{!twitter.description &&
													openGraph.description && (
														<span className="text-gray-500 text-xs ml-2">
															(Fallback from OG)
														</span>
													)}
											</p>
										</div>
									</div>
									<div className="flex items-start gap-3">
										{getStatusIcon(twitter.status.hasImage)}
										<div className="flex-1">
											<p className="font-medium">Image</p>
											{twitter.image ||
											openGraph.image ? (
												<div>
													<img
														src={
															twitter.image ||
															openGraph.image ||
															""
														}
														alt="Twitter Card preview"
														className="mt-2 rounded-lg border max-w-md"
														onError={(e) => {
															e.currentTarget.style.display =
																"none";
														}}
													/>
													<p className="text-xs text-gray-500 mt-1">
														{twitter.image ||
															openGraph.image}
													</p>
													{!twitter.image &&
														openGraph.image && (
															<span className="text-gray-500 text-xs">
																(Fallback from
																OG)
															</span>
														)}
												</div>
											) : (
												<span className="text-red-600 text-sm">
													Not set
												</span>
											)}
										</div>
									</div>
									{twitter.site && (
										<div className="flex items-start gap-3">
											<CheckIcon className="w-4 h-4 text-green-600" />
											<div className="flex-1">
												<p className="font-medium">
													Site Handle
												</p>
												<p className="text-sm text-gray-600">
													{twitter.site}
												</p>
											</div>
										</div>
									)}
									{twitter.creator && (
										<div className="flex items-start gap-3">
											<CheckIcon className="w-4 h-4 text-green-600" />
											<div className="flex-1">
												<p className="font-medium">
													Creator Handle
												</p>
												<p className="text-sm text-gray-600">
													{twitter.creator}
												</p>
											</div>
										</div>
									)}
								</CardContent>
							</Card>
						)}
					</div>
				)}

				{/* Preview Tab */}
				{activeTab === "preview" &&
					exportOptions.includePreview !== false && (
						<Card>
							<CardHeader>
								<CardTitle>Social Media Previews</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="space-y-6">
									{/* Note: Preview components would be rendered here */}
									<div className="text-center py-12 text-gray-500">
										<p>
											Platform preview components coming
											soon
										</p>
										<p className="text-sm mt-2">
											Facebook, WhatsApp, Twitter/X,
											LinkedIn, and Discord previews
										</p>
									</div>
								</div>
							</CardContent>
						</Card>
					)}

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
				hasIssues={summary.failures > 0 || summary.warnings > 0}
			/>

			{/* Modals */}
			{showAIFixModal && (
				<SocialViewAIFixModal
					onClose={() => setShowAIFixModal(false)}
					data={data}
				/>
			)}
			{showExportModal && (
				<SocialViewExportModal
					onClose={() => setShowExportModal(false)}
					data={data}
				/>
			)}
		</div>
	);
}
