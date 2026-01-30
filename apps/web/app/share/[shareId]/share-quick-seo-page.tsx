"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@ui/components/card";
import { Badge } from "@ui/components/badge";
import { CheckIcon, XIcon, AlertTriangleIcon, InfoIcon } from "lucide-react";
import { cn } from "@ui/lib";
import { FloatingActionBar } from "./components/FloatingActionBar";
import { QuickSEOAIFixModal } from "./components/QuickSEOAIFixModal";
import { QuickSEOExportModal } from "./components/QuickSEOExportModal";

type SEOStatus = "pass" | "warning" | "fail" | "info";

interface QuickSEOOpenGraph {
	hasImage: boolean;
	imageUrl: string;
	imageWidth: number | null;
	imageHeight: number | null;
	imageDimensionStatus: SEOStatus;
}

interface QuickSEOMeta {
	title: {
		content: string;
		length: number;
		status: SEOStatus;
	};
	description: {
		content: string;
		length: number;
		status: SEOStatus;
	};
	keywords: {
		content: string;
		count: number;
	};
	url: string;
	canonical: {
		url: string;
		matchesCurrentUrl: boolean;
		status: SEOStatus;
	};
}

interface QuickSEOContent {
	wordCount: number;
	wordCountStatus: SEOStatus;
	headingsCount: {
		total: number;
		h1: number;
		h2: number;
		h3: number;
		h4: number;
		h5: number;
		h6: number;
	};
	imagesCount: number;
	imagesWithAlt: number;
	imagesWithoutAlt: number;
	linksCount: {
		total: number;
		internal: number;
		external: number;
	};
}

interface QuickSEOTechnical {
	robotsTag: {
		content: string;
		isIndexable: boolean;
		status: SEOStatus;
	};
	xRobotsTag: {
		content: string;
		status: SEOStatus;
	};
	language: {
		code: string;
		name: string;
		status: SEOStatus;
	};
	author: {
		content: string;
	};
	robotsTxtUrl: string;
	sitemapUrl: string;
}

interface QuickSEOData {
	openGraph: QuickSEOOpenGraph;
	meta: QuickSEOMeta;
	content: QuickSEOContent;
	technical: QuickSEOTechnical;
}

export interface QuickSEOShareData {
	seoData: QuickSEOData;
	exportOptions: {
		includePassing?: boolean;
		includeWarnings?: boolean;
		includeFailures?: boolean;
		includeSummary?: boolean;
		includeDetails?: boolean;
		includeOtherItems?: boolean;
	};
	websiteUrl: string;
	shareOgImageUrl?: string | null;
	createdAt: string;
	expiresAt: string;
}

interface ShareQuickSEOPageProps {
	data: QuickSEOShareData;
}

function StatusIcon({ status }: { status: SEOStatus }) {
	if (status === "pass") {
		return <CheckIcon className="h-4 w-4 text-green-500" />;
	}
	if (status === "warning") {
		return <AlertTriangleIcon className="h-4 w-4 text-yellow-500" />;
	}
	if (status === "fail") {
		return <XIcon className="h-4 w-4 text-red-500" />;
	}
	return <InfoIcon className="h-4 w-4 text-blue-500" />;
}

function StatusBadge({ status, label }: { status: SEOStatus; label: string }) {
	const colorMap = {
		pass: "bg-green-100 text-green-800",
		warning: "bg-yellow-100 text-yellow-800",
		fail: "bg-red-100 text-red-800",
		info: "bg-blue-100 text-blue-800",
	};

	return (
		<Badge status="info" className={cn("font-medium", colorMap[status])}>
			{label}
		</Badge>
	);
}

export function ShareQuickSEOPage({ data }: ShareQuickSEOPageProps) {
	const t = useTranslations();
	const { seoData, websiteUrl } = data;
	const [aiFixModalOpen, setAiFixModalOpen] = useState(false);
	const [exportModalOpen, setExportModalOpen] = useState(false);

	// Calculate summary counts
	const calculateStatusCounts = () => {
		let pass = 0;
		let warning = 0;
		let fail = 0;

		const checkStatus = (status: SEOStatus) => {
			if (status === "pass") pass++;
			else if (status === "warning") warning++;
			else if (status === "fail") fail++;
		};

		checkStatus(seoData.openGraph.imageDimensionStatus);
		checkStatus(seoData.meta.title.status);
		checkStatus(seoData.meta.description.status);
		checkStatus(seoData.meta.canonical.status);
		checkStatus(seoData.content.wordCountStatus);
		checkStatus(seoData.technical.robotsTag.status);
		checkStatus(seoData.technical.language.status);

		return { pass, warning, fail, total: pass + warning + fail };
	};

	const counts = calculateStatusCounts();
	const hasIssues = counts.warning > 0 || counts.fail > 0;

	return (
		<div className="min-h-screen bg-background py-8 px-4 sm:px-6 lg:px-8 pb-24">
			<div className="max-w-7xl mx-auto">
				{/* Header */}
				<div className="mb-8">
					<div className="mb-4">
						<h1 className="text-3xl font-bold tracking-tight">
							Quick SEO Analysis
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

				{/* Summary Card */}
				<Card className="mb-8">
					<CardHeader>
						<CardTitle>Summary</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
							<div>
								<div className="text-sm text-muted-foreground mb-1">
									Passing
								</div>
								<div className="text-2xl font-bold text-green-600">
									{counts.pass}
								</div>
							</div>
							<div>
								<div className="text-sm text-muted-foreground mb-1">
									Warnings
								</div>
								<div className="text-2xl font-bold text-yellow-600">
									{counts.warning}
								</div>
							</div>
							<div>
								<div className="text-sm text-muted-foreground mb-1">
									Failures
								</div>
								<div className="text-2xl font-bold text-red-600">
									{counts.fail}
								</div>
							</div>
							<div>
								<div className="text-sm text-muted-foreground mb-1">
									Total Checks
								</div>
								<div className="text-2xl font-bold">
									{counts.total}
								</div>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Open Graph Card */}
				<Card className="mb-8">
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<StatusIcon
								status={seoData.openGraph.imageDimensionStatus}
							/>
							Open Graph
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-3">
						<div className="flex items-center justify-between">
							<span className="text-sm font-medium">
								OG Image
							</span>
							<StatusBadge
								status={seoData.openGraph.imageDimensionStatus}
								label={
									seoData.openGraph.hasImage
										? "Present"
										: "Missing"
								}
							/>
						</div>
						{seoData.openGraph.hasImage &&
							seoData.openGraph.imageWidth &&
							seoData.openGraph.imageHeight && (
								<div className="flex items-center justify-between">
									<span className="text-sm font-medium">
										Dimensions
									</span>
									<span className="text-sm text-muted-foreground">
										{seoData.openGraph.imageWidth} ×{" "}
										{seoData.openGraph.imageHeight}
									</span>
								</div>
							)}
					</CardContent>
				</Card>

				{/* Meta Information Card */}
				<Card className="mb-8">
					<CardHeader>
						<CardTitle>Meta Information</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="space-y-2">
							<div className="flex items-center justify-between">
								<span className="text-sm font-medium flex items-center gap-2">
									<StatusIcon
										status={seoData.meta.title.status}
									/>
									Title
								</span>
								<StatusBadge
									status={seoData.meta.title.status}
									label={`${seoData.meta.title.length} chars`}
								/>
							</div>
							{seoData.meta.title.content && (
								<p className="text-sm text-muted-foreground pl-6">
									{seoData.meta.title.content}
								</p>
							)}
						</div>

						<div className="space-y-2">
							<div className="flex items-center justify-between">
								<span className="text-sm font-medium flex items-center gap-2">
									<StatusIcon
										status={seoData.meta.description.status}
									/>
									Description
								</span>
								<StatusBadge
									status={seoData.meta.description.status}
									label={`${seoData.meta.description.length} chars`}
								/>
							</div>
							{seoData.meta.description.content && (
								<p className="text-sm text-muted-foreground pl-6">
									{seoData.meta.description.content}
								</p>
							)}
						</div>

						<div className="flex items-center justify-between">
							<span className="text-sm font-medium">URL</span>
							<span className="text-sm text-muted-foreground truncate ml-4 max-w-md">
								{seoData.meta.url}
							</span>
						</div>
					</CardContent>
				</Card>

				{/* Content Analysis Card */}
				<Card className="mb-8">
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<StatusIcon
								status={seoData.content.wordCountStatus}
							/>
							Content Analysis
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="flex items-center justify-between">
							<span className="text-sm font-medium">
								Word Count
							</span>
							<StatusBadge
								status={seoData.content.wordCountStatus}
								label={`${seoData.content.wordCount} words`}
							/>
						</div>

						<div>
							<span className="text-sm font-medium mb-2 block">
								Headings
							</span>
							<div className="grid grid-cols-3 gap-2 text-sm text-muted-foreground">
								<div>
									H1: {seoData.content.headingsCount.h1}
								</div>
								<div>
									H2: {seoData.content.headingsCount.h2}
								</div>
								<div>
									H3: {seoData.content.headingsCount.h3}
								</div>
								<div>
									H4: {seoData.content.headingsCount.h4}
								</div>
								<div>
									H5: {seoData.content.headingsCount.h5}
								</div>
								<div>
									H6: {seoData.content.headingsCount.h6}
								</div>
							</div>
						</div>

						<div className="flex items-center justify-between">
							<span className="text-sm font-medium">Images</span>
							<span className="text-sm text-muted-foreground">
								{seoData.content.imagesWithAlt} with alt /{" "}
								{seoData.content.imagesCount} total
							</span>
						</div>

						<div className="flex items-center justify-between">
							<span className="text-sm font-medium">Links</span>
							<span className="text-sm text-muted-foreground">
								{seoData.content.linksCount.internal} internal,{" "}
								{seoData.content.linksCount.external} external
							</span>
						</div>
					</CardContent>
				</Card>

				{/* Technical SEO Card */}
				<Card className="mb-8">
					<CardHeader>
						<CardTitle>Technical SEO</CardTitle>
					</CardHeader>
					<CardContent className="space-y-3">
						<div className="flex items-center justify-between">
							<span className="text-sm font-medium flex items-center gap-2">
								<StatusIcon
									status={seoData.technical.robotsTag.status}
								/>
								Robots Meta
							</span>
							<StatusBadge
								status={seoData.technical.robotsTag.status}
								label={
									seoData.technical.robotsTag.isIndexable
										? "Indexable"
										: "Not Indexable"
								}
							/>
						</div>

						<div className="flex items-center justify-between">
							<span className="text-sm font-medium flex items-center gap-2">
								<StatusIcon
									status={seoData.technical.language.status}
								/>
								Language
							</span>
							<span className="text-sm text-muted-foreground">
								{seoData.technical.language.name ||
									seoData.technical.language.code ||
									"Not specified"}
							</span>
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

			{/* Modals */}
			<QuickSEOAIFixModal
				open={aiFixModalOpen}
				onOpenChange={setAiFixModalOpen}
				data={data}
			/>

			<QuickSEOExportModal
				open={exportModalOpen}
				onOpenChange={setExportModalOpen}
				data={data}
			/>

			{/* Floating Action Bar */}
			<FloatingActionBar
				onFixWithAI={() => setAiFixModalOpen(true)}
				onExport={() => setExportModalOpen(true)}
				hasIssues={hasIssues}
			/>
		</div>
	);
}
