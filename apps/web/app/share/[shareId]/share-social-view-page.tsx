"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@ui/components/card";
import { Badge } from "@ui/components/badge";
import { Tabs, TabsList, TabsTrigger } from "@ui/components/tabs";
import { CheckIcon, XIcon, AlertTriangleIcon } from "lucide-react";
import { cn } from "@ui/lib";
import { FloatingActionBar } from "./components/FloatingActionBar";
import { SocialViewAIFixModal } from "./components/SocialViewAIFixModal";
import { SocialViewExportModal } from "./components/SocialViewExportModal";
import {
	FacebookPreview,
	WhatsAppPreview,
	XPreview,
	LinkedInPreview,
	DiscordPreview,
} from "./components/SocialPreviewCards";

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

export type { SocialData };

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
		<div className="min-h-screen bg-background py-8 px-4 sm:px-6 lg:px-8 pb-24">
			<div className="max-w-7xl mx-auto">
				{/* Header */}
				<div className="mb-8">
					<div className="mb-4">
						<h1 className="text-3xl font-bold tracking-tight">
							Social Media Preview
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
							<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
								<div>
									<div className="text-sm text-muted-foreground mb-1">
										Passing
									</div>
									<div className="text-2xl font-bold text-green-600">
										{summary.passing}
									</div>
								</div>
								<div>
									<div className="text-sm text-muted-foreground mb-1">
										Warnings
									</div>
									<div className="text-2xl font-bold text-yellow-600">
										{summary.warnings}
									</div>
								</div>
								<div>
									<div className="text-sm text-muted-foreground mb-1">
										Failures
									</div>
									<div className="text-2xl font-bold text-red-600">
										{summary.failures}
									</div>
								</div>
							</div>
						</CardContent>
					</Card>
				)}

				{/* Tabs */}
				<Card className="mb-8">
					<CardHeader>
						<Tabs
							value={activeTab}
							onValueChange={(v) =>
								setActiveTab(v as "details" | "preview")
							}
						>
							<TabsList>
								<TabsTrigger value="details">
									Details
								</TabsTrigger>
								<TabsTrigger value="preview">
									Preview
								</TabsTrigger>
							</TabsList>
						</Tabs>
					</CardHeader>
					<CardContent>
						{/* Details Tab */}
						{activeTab === "details" && (
							<div className="space-y-6">
								{/* Open Graph Section */}
								{exportOptions.includeOpenGraph !== false && (
									<div>
										<h3 className="text-lg font-semibold mb-4">
											Open Graph Meta Tags
										</h3>
										<div className="space-y-4">
											<div className="flex items-start gap-3">
												{getStatusIcon(
													openGraph.status.hasTitle,
												)}
												<div className="flex-1">
													<p className="font-medium text-sm">
														Title
													</p>
													<p className="text-sm text-muted-foreground">
														{openGraph.title || (
															<span className="text-destructive">
																Not set
															</span>
														)}
													</p>
												</div>
											</div>
											<div className="flex items-start gap-3">
												{getStatusIcon(
													openGraph.status
														.hasDescription,
												)}
												<div className="flex-1">
													<p className="font-medium text-sm">
														Description
													</p>
													<p className="text-sm text-muted-foreground">
														{openGraph.description || (
															<span className="text-destructive">
																Not set
															</span>
														)}
													</p>
												</div>
											</div>
											<div className="flex items-start gap-3">
												{getStatusIcon(
													openGraph.status.hasImage &&
														openGraph.status
															.imageValid,
												)}
												<div className="flex-1">
													<p className="font-medium text-sm">
														Image
													</p>
													{openGraph.image ? (
														<div>
															<img
																src={
																	openGraph.image
																}
																alt="Open Graph preview"
																className="mt-2 rounded-lg border max-w-md"
																onError={(
																	e,
																) => {
																	e.currentTarget.style.display =
																		"none";
																}}
															/>
															<p className="text-xs text-muted-foreground mt-1 font-mono">
																{
																	openGraph.image
																}
															</p>
															{openGraph.imageWidth &&
																openGraph.imageHeight && (
																	<p className="text-xs text-muted-foreground">
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
														<span className="text-destructive text-sm">
															Not set
														</span>
													)}
												</div>
											</div>
											{openGraph.url && (
												<div className="flex items-start gap-3">
													<CheckIcon className="w-4 h-4 text-green-600" />
													<div className="flex-1">
														<p className="font-medium text-sm">
															URL
														</p>
														<p className="text-sm text-muted-foreground">
															{openGraph.url}
														</p>
													</div>
												</div>
											)}
											{openGraph.type && (
												<div className="flex items-start gap-3">
													<CheckIcon className="w-4 h-4 text-green-600" />
													<div className="flex-1">
														<p className="font-medium text-sm">
															Type
														</p>
														<p className="text-sm text-muted-foreground">
															{openGraph.type}
														</p>
													</div>
												</div>
											)}
											{openGraph.siteName && (
												<div className="flex items-start gap-3">
													<CheckIcon className="w-4 h-4 text-green-600" />
													<div className="flex-1">
														<p className="font-medium text-sm">
															Site Name
														</p>
														<p className="text-sm text-muted-foreground">
															{openGraph.siteName}
														</p>
													</div>
												</div>
											)}
										</div>
									</div>
								)}

								{/* Divider */}
								{exportOptions.includeOpenGraph !== false &&
									exportOptions.includeTwitter !== false && (
										<div className="border-t border-border my-6" />
									)}

								{/* Twitter Section */}
								{exportOptions.includeTwitter !== false && (
									<div>
										<h3 className="text-lg font-semibold mb-4">
											Twitter Card Meta Tags
										</h3>
										<div className="space-y-4">
											<div className="flex items-start gap-3">
												{getStatusIcon(
													twitter.status.hasCard &&
														twitter.status
															.cardValid,
												)}
												<div className="flex-1">
													<p className="font-medium text-sm">
														Card Type
													</p>
													<p className="text-sm text-muted-foreground">
														{twitter.card || (
															<span className="text-destructive">
																Not set
															</span>
														)}
													</p>
												</div>
											</div>
											<div className="flex items-start gap-3">
												{getStatusIcon(
													twitter.status.hasTitle,
												)}
												<div className="flex-1">
													<p className="font-medium text-sm">
														Title
													</p>
													<p className="text-sm text-muted-foreground">
														{twitter.title ||
															openGraph.title || (
																<span className="text-destructive">
																	Not set
																</span>
															)}
														{!twitter.title &&
															openGraph.title && (
																<span className="text-muted-foreground text-xs ml-2">
																	(Fallback
																	from OG)
																</span>
															)}
													</p>
												</div>
											</div>
											<div className="flex items-start gap-3">
												{getStatusIcon(
													twitter.status
														.hasDescription,
												)}
												<div className="flex-1">
													<p className="font-medium text-sm">
														Description
													</p>
													<p className="text-sm text-muted-foreground">
														{twitter.description ||
															openGraph.description || (
																<span className="text-destructive">
																	Not set
																</span>
															)}
														{!twitter.description &&
															openGraph.description && (
																<span className="text-muted-foreground text-xs ml-2">
																	(Fallback
																	from OG)
																</span>
															)}
													</p>
												</div>
											</div>
											<div className="flex items-start gap-3">
												{getStatusIcon(
													twitter.status.hasImage,
												)}
												<div className="flex-1">
													<p className="font-medium text-sm">
														Image
													</p>
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
																onError={(
																	e,
																) => {
																	e.currentTarget.style.display =
																		"none";
																}}
															/>
															<p className="text-xs text-muted-foreground mt-1 font-mono">
																{twitter.image ||
																	openGraph.image}
															</p>
															{!twitter.image &&
																openGraph.image && (
																	<span className="text-muted-foreground text-xs">
																		(Fallback
																		from OG)
																	</span>
																)}
														</div>
													) : (
														<span className="text-destructive text-sm">
															Not set
														</span>
													)}
												</div>
											</div>
											{twitter.site && (
												<div className="flex items-start gap-3">
													<CheckIcon className="w-4 h-4 text-green-600" />
													<div className="flex-1">
														<p className="font-medium text-sm">
															Site Handle
														</p>
														<p className="text-sm text-muted-foreground">
															{twitter.site}
														</p>
													</div>
												</div>
											)}
											{twitter.creator && (
												<div className="flex items-start gap-3">
													<CheckIcon className="w-4 h-4 text-green-600" />
													<div className="flex-1">
														<p className="font-medium text-sm">
															Creator Handle
														</p>
														<p className="text-sm text-muted-foreground">
															{twitter.creator}
														</p>
													</div>
												</div>
											)}
										</div>
									</div>
								)}
							</div>
						)}

						{/* Preview Tab */}
						{activeTab === "preview" &&
							exportOptions.includePreview !== false && (
								<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
									<FacebookPreview data={socialData} />
									<WhatsAppPreview data={socialData} />
									<XPreview data={socialData} />
									<LinkedInPreview data={socialData} />
									<DiscordPreview data={socialData} />
								</div>
							)}
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
				hasIssues={summary.failures > 0 || summary.warnings > 0}
			/>

			{/* Modals */}
			<SocialViewAIFixModal
				open={showAIFixModal}
				onOpenChange={setShowAIFixModal}
				data={data}
			/>
			<SocialViewExportModal
				open={showExportModal}
				onOpenChange={setShowExportModal}
				data={data}
			/>
		</div>
	);
}
