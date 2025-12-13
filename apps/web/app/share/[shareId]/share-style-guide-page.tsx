"use client";

import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@ui/components/card";
import { Badge } from "@ui/components/badge";
import { ColorModeToggle } from "@shared/components/ColorModeToggle";

interface FontFamily {
	name: string;
	weights: number[];
	totalInstances: number;
}

interface FontSizeGroup {
	category: "display" | "heading" | "body" | "button";
	fontSize: string;
	fontWeight: string;
	fontFamily: string;
	lineHeight: string;
	letterSpacing: string;
	colors: string[];
	instanceCount: number;
	htmlTag?: string;
	label?: string;
}

interface StyleGateTypographyData {
	fontFamilies: FontFamily[];
	fontSizes: {
		display: FontSizeGroup[];
		heading: FontSizeGroup[];
		body: FontSizeGroup[];
		button: FontSizeGroup[];
	};
}

interface ColorToken {
	hex: string;
	rgb: string;
	colorName: string;
	category: "background" | "text" | "border" | "icon";
	usageCount: number;
}

interface StyleGateColorsData {
	brandColors: unknown[];
	colorTokens: {
		background: ColorToken[];
		text: ColorToken[];
		border: ColorToken[];
		icon: ColorToken[];
	};
}

export interface ShareData {
	typographyData: StyleGateTypographyData | null;
	colorsData: StyleGateColorsData | null;
	exportOptions: {
		typography: {
			all: boolean;
			fontFamily: boolean;
			display: boolean;
			heading: boolean;
			body: boolean;
			button: boolean;
		};
		colors: {
			all: boolean;
			backgrounds: boolean;
			text: boolean;
			borders: boolean;
			icons: boolean;
		};
		exportUnit: "px" | "rem";
	};
	websiteUrl: string;
	shareOgImageUrl?: string | null;
	createdAt: string;
	expiresAt: string;
}

interface ShareStyleGuidePageProps {
	data: ShareData;
}

export function ShareStyleGuidePage({ data }: ShareStyleGuidePageProps) {
	const t = useTranslations();
	const hasTypography =
		data.typographyData &&
		(data.exportOptions.typography.all ||
			data.exportOptions.typography.fontFamily ||
			data.exportOptions.typography.display ||
			data.exportOptions.typography.heading ||
			data.exportOptions.typography.body ||
			data.exportOptions.typography.button);

	const hasColors =
		data.colorsData &&
		(data.exportOptions.colors.all ||
			data.exportOptions.colors.backgrounds ||
			data.exportOptions.colors.text ||
			data.exportOptions.colors.borders ||
			data.exportOptions.colors.icons);

	const pageTitle =
		hasTypography && hasColors
			? t("share.styleGuide.title")
			: hasTypography
				? t("share.styleGuide.typography")
				: t("share.styleGuide.colors");

	return (
		<div className="min-h-screen bg-background py-8 px-4 sm:px-6 lg:px-8">
			<div className="max-w-7xl mx-auto">
				{/* Header */}
				<div className="mb-8">
					<div className="flex items-center justify-between mb-4">
						<div>
							<h1 className="text-3xl font-bold tracking-tight">
								{pageTitle}
							</h1>
							<p className="text-muted-foreground mt-1">
								{t("share.styleGuide.sharedFrom")}{" "}
								<a
									href={`https://${data.websiteUrl}`}
									target="_blank"
									rel="noopener noreferrer"
									className="text-primary hover:underline font-medium"
								>
									{data.websiteUrl}
								</a>
							</p>
						</div>
						<ColorModeToggle />
					</div>
					<div className="flex items-center gap-2 text-sm text-muted-foreground">
						<Badge status="info">
							{t("share.styleGuide.expires")}{" "}
							{new Date(data.expiresAt).toLocaleDateString()}
						</Badge>
					</div>
				</div>

				{/* Typography Section */}
				{hasTypography && data.typographyData && (
					<div className="space-y-6 mb-8">
						{/* Font Families */}
						{(data.exportOptions.typography.all ||
							data.exportOptions.typography.fontFamily) &&
							data.typographyData?.fontFamilies &&
							data.typographyData.fontFamilies.length > 0 && (
								<Card>
									<CardHeader>
										<CardTitle>{t("share.styleGuide.typographySection.fontFamily")}</CardTitle>
									</CardHeader>
									<CardContent>
										<div className="space-y-4">
											{data.typographyData.fontFamilies.map(
												(font, index, array) => (
													<div
														key={index}
														className={
															index <
															array.length - 1
																? "pb-4 border-b border-border"
																: ""
														}
													>
														<h3 className="font-semibold text-base mb-1">
															{font.name}
														</h3>
														<p className="text-sm text-muted-foreground">
															{formatWeights(
																font.weights,
																t,
															)}
														</p>
													</div>
												),
											)}
										</div>
									</CardContent>
								</Card>
							)}

						{/* Font Sizes */}
						{(data.exportOptions.typography.all ||
							data.exportOptions.typography.display ||
							data.exportOptions.typography.heading ||
							data.exportOptions.typography.body ||
							data.exportOptions.typography.button) &&
							data.typographyData.fontSizes && (
								<Card>
									<CardHeader>
										<CardTitle>{t("share.styleGuide.typographySection.fontSizes")}</CardTitle>
									</CardHeader>
									<CardContent>
										<div className="space-y-4">
											{[
												...(data.exportOptions
													.typography.all ||
												data.exportOptions.typography
													.display
													? data.typographyData
															.fontSizes
															.display || []
													: []),
												...(data.exportOptions
													.typography.all ||
												data.exportOptions.typography
													.heading
													? data.typographyData
															.fontSizes
															.heading || []
													: []),
												...(data.exportOptions
													.typography.all ||
												data.exportOptions.typography
													.body
													? data.typographyData
															.fontSizes.body ||
														[]
													: []),
												...(data.exportOptions
													.typography.all ||
												data.exportOptions.typography
													.button
													? data.typographyData
															.fontSizes.button ||
														[]
													: []),
											].map((group, index) => (
												<div
													key={index}
													className="p-4 bg-muted/50 rounded-lg border border-border"
												>
													{group.label && (
														<div className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wide">
															{group.label}
														</div>
													)}
													<div
														style={{
															fontFamily:
																group.fontFamily,
															fontSize:
																group.fontSize,
															fontWeight:
																group.fontWeight,
															lineHeight:
																group.lineHeight,
															letterSpacing:
																group.letterSpacing,
														}}
														className="mb-3 text-foreground"
													>
														{group.fontFamily} -{" "}
														{group.fontSize} -{" "}
														{getWeightName(
															group.fontWeight,
															t,
														)}
													</div>
													<div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
														<span className="flex items-center gap-1">
															<span className="font-medium">
																{t("share.styleGuide.typographySection.lineHeight")}
															</span>
															{group.lineHeight}
														</span>
														<span className="flex items-center gap-1">
															<span className="font-medium">
																{t("share.styleGuide.typographySection.letterSpacing")}
															</span>
															{
																group.letterSpacing
															}
														</span>
													</div>
												</div>
											))}
										</div>
									</CardContent>
								</Card>
							)}
					</div>
				)}

				{/* Colors Section */}
				{hasColors && data.colorsData && (
					<div className="space-y-6 mb-8">
						{[
							{
								key: "background" as const,
								label: t("share.styleGuide.colorsSection.backgrounds"),
								optionKey: "backgrounds" as const,
							},
							{
								key: "text" as const,
								label: t("share.styleGuide.colorsSection.typography"),
								optionKey: "text" as const,
							},
							{
								key: "border" as const,
								label: t("share.styleGuide.colorsSection.border"),
								optionKey: "borders" as const,
							},
							{
								key: "icon" as const,
								label: t("share.styleGuide.colorsSection.icon"),
								optionKey: "icons" as const,
							},
						]
							.filter(
								({ optionKey }) =>
									data.exportOptions.colors.all ||
									data.exportOptions.colors[optionKey],
							)
							.map(({ key, label }) => {
								const tokens =
									data.colorsData?.colorTokens?.[key] || [];
								if (tokens.length === 0) return null;

								return (
									<Card key={key}>
										<CardHeader>
											<CardTitle>{label}</CardTitle>
										</CardHeader>
										<CardContent>
											<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
												{tokens.map((token, index) => (
													<div
														key={index}
														className="flex flex-col items-center gap-2 group"
													>
														<div
															className="w-full aspect-square rounded-lg border-2 border-border shadow-sm transition-all group-hover:scale-105 group-hover:shadow-md cursor-pointer"
															style={{
																backgroundColor:
																	token.hex,
															}}
															title={
																token.colorName ||
																token.hex
															}
														/>
														<div className="text-xs text-center text-muted-foreground font-mono">
															{token.hex}
														</div>
														{token.colorName && (
															<div className="text-xs text-center text-muted-foreground">
																{
																	token.colorName
																}
															</div>
														)}
													</div>
												))}
											</div>
										</CardContent>
									</Card>
								);
							})}
					</div>
				)}

				{/* Footer */}
				<div className="mt-12 pt-8 border-t border-border">
					<div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
						<div>
							{t("share.styleGuide.footer.copyright", {
								year: new Date().getFullYear(),
							})}
						</div>
						<a
							href="https://webclarity.ai"
							target="_blank"
							rel="noopener noreferrer"
							className="hover:text-foreground transition-colors font-medium"
						>
							{t("share.styleGuide.footer.website")}
						</a>
					</div>
				</div>
			</div>
		</div>
	);
}

function formatWeights(
	weights: number[],
	t: ReturnType<typeof useTranslations>,
): string {
	const weightMap: Record<string, string> = {
		"100": t("share.styleGuide.fontWeights.100"),
		"200": t("share.styleGuide.fontWeights.200"),
		"300": t("share.styleGuide.fontWeights.300"),
		"400": t("share.styleGuide.fontWeights.400"),
		"500": t("share.styleGuide.fontWeights.500"),
		"600": t("share.styleGuide.fontWeights.600"),
		"700": t("share.styleGuide.fontWeights.700"),
		"800": t("share.styleGuide.fontWeights.800"),
		"900": t("share.styleGuide.fontWeights.900"),
	};
	return weights
		.map((w) => weightMap[String(w)] || String(w))
		.join(", ");
}

function getWeightName(
	weight: string | number,
	t: ReturnType<typeof useTranslations>,
): string {
	const weightMap: Record<string, string> = {
		"100": t("share.styleGuide.fontWeights.100"),
		"200": t("share.styleGuide.fontWeights.200"),
		"300": t("share.styleGuide.fontWeights.300"),
		"400": t("share.styleGuide.fontWeights.400"),
		"500": t("share.styleGuide.fontWeights.500"),
		"600": t("share.styleGuide.fontWeights.600"),
		"700": t("share.styleGuide.fontWeights.700"),
		"800": t("share.styleGuide.fontWeights.800"),
		"900": t("share.styleGuide.fontWeights.900"),
	};
	return weightMap[String(weight)] || String(weight);
}
