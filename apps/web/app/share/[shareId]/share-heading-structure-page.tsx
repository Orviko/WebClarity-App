"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@ui/components/card";
import { Badge } from "@ui/components/badge";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@ui/components/accordion";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@ui/components/collapsible";
import {
	Dialog,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@ui/components/dialog";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@ui/components/dropdown-menu";
import { Button } from "@ui/components/button";
import { ChevronRightIcon, CheckIcon, XIcon, FilterIcon } from "lucide-react";
import { cn } from "@ui/lib";
import { AIFixModal } from "./components/AIFixModal";
import { ExportModal } from "./components/ExportModal";
import { FloatingActionBar } from "./components/FloatingActionBar";

interface HeadingNode {
	level: number;
	content: string;
	selector?: string;
	children: HeadingNode[];
	issues: Array<
		| "skip"
		| "orphan"
		| "short"
		| "long"
		| "empty"
		| "multiple-h1"
		| "missing-h1"
	>;
	targetLevel?: number;
}

interface HeadingStructureTreeData {
	tree: HeadingNode[];
	totalHeadings: number;
	issuesCount: number;
	h1Count: number;
}

export interface HeadingStructureShareData {
	treeData: HeadingStructureTreeData;
	exportOptions: {
		includeIssues?: boolean;
		maxDepth?: number;
		includeSelectors?: boolean;
		includeSummary?: boolean;
	};
	websiteUrl: string;
	shareOgImageUrl?: string | null;
	createdAt: string;
	expiresAt: string;
}

interface ShareHeadingStructurePageProps {
	data: HeadingStructureShareData;
}

type HeadingFilterType =
	| "all"
	| "empty"
	| "short"
	| "long"
	| "skip"
	| "orphan"
	| "multiple-h1";

// Helper functions for issue handling
function getIssueTypeNumber(issue: HeadingNode["issues"][number]): number {
	const issueNumberMap: Record<HeadingNode["issues"][number], number> = {
		empty: 1,
		short: 2,
		long: 3,
		skip: 4,
		orphan: 5,
		"multiple-h1": 6,
		"missing-h1": 0,
	};
	return issueNumberMap[issue] || 0;
}

function getPrimaryIssue(
	issues: HeadingNode["issues"],
): HeadingNode["issues"][number] | null {
	if (issues.length === 0) return null;

	const errorIssues = issues.filter((i) =>
		["empty", "skip", "multiple-h1", "missing-h1"].includes(i),
	);
	const warningIssues = issues.filter((i) =>
		["orphan", "short", "long"].includes(i),
	);

	if (errorIssues.length > 0) {
		return errorIssues.sort(
			(a, b) => getIssueTypeNumber(a) - getIssueTypeNumber(b),
		)[0];
	}

	if (warningIssues.length > 0) {
		return warningIssues.sort(
			(a, b) => getIssueTypeNumber(a) - getIssueTypeNumber(b),
		)[0];
	}

	return issues[0];
}

function getIssueLabel(
	issue: string,
	t: ReturnType<typeof useTranslations>,
): string {
	const labels: Record<string, string> = {
		skip: t("share.headingStructure.issues.labels.skip"),
		orphan: t("share.headingStructure.issues.labels.orphan"),
		short: t("share.headingStructure.issues.labels.short"),
		long: t("share.headingStructure.issues.labels.long"),
		empty: t("share.headingStructure.issues.labels.empty"),
		"multiple-h1": t("share.headingStructure.issues.labels.multipleH1"),
		"missing-h1": t("share.headingStructure.issues.labels.missingH1"),
	};
	return labels[issue] || issue;
}

function SelectorCollapsible({
	selector,
	t,
}: {
	selector: string;
	t: ReturnType<typeof useTranslations>;
}) {
	const [isOpen, setIsOpen] = useState(false);

	return (
		<Collapsible open={isOpen} onOpenChange={setIsOpen}>
			<CollapsibleTrigger className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer font-medium">
				<ChevronRightIcon
					className={cn(
						"size-3 transition-transform duration-200",
						isOpen && "rotate-90",
					)}
				/>
				<span>
					{t("share.headingStructure.hierarchy.viewCssSelector")}
				</span>
			</CollapsibleTrigger>
			<CollapsibleContent className="mt-2">
				<div className="text-xs text-muted-foreground font-mono bg-muted/50 p-3 rounded border break-all">
					{selector}
				</div>
			</CollapsibleContent>
		</Collapsible>
	);
}

function StatusBadge({
	issues,
	onClick,
	t,
}: {
	issues: HeadingNode["issues"];
	onClick: () => void;
	t: ReturnType<typeof useTranslations>;
}) {
	const noIssuesTitle = t("share.headingStructure.issues.noIssues");

	if (issues.length === 0) {
		return (
			<button
				type="button"
				onClick={onClick}
				className={cn(
					"flex items-center justify-center w-8 h-8 rounded-md",
					"bg-green-500/10 text-green-600 border border-green-500/20",
					"hover:bg-green-500/20 transition-colors cursor-pointer",
					"shrink-0",
				)}
				title={noIssuesTitle}
			>
				<CheckIcon className="size-4" />
			</button>
		);
	}

	const primaryIssue = getPrimaryIssue(issues);
	if (!primaryIssue) {
		return (
			<button
				type="button"
				onClick={onClick}
				className={cn(
					"flex items-center justify-center w-8 h-8 rounded-md",
					"bg-green-500/10 text-green-600 border border-green-500/20",
					"hover:bg-green-500/20 transition-colors cursor-pointer",
					"shrink-0",
				)}
				title={noIssuesTitle}
			>
				<CheckIcon className="size-4" />
			</button>
		);
	}

	const issueNumber = getIssueTypeNumber(primaryIssue);
	const hasErrors = ["skip", "multiple-h1", "empty", "missing-h1"].includes(
		primaryIssue,
	);
	const issueLabels = issues
		.map((issue) => getIssueLabel(issue, t))
		.join(", ");
	const badgeContent = issueNumber === 0 ? "!" : issueNumber;

	return (
		<button
			type="button"
			onClick={onClick}
			className={cn(
				"flex items-center justify-center w-8 h-8 rounded-md text-xs font-semibold",
				"border transition-colors cursor-pointer shrink-0",
				hasErrors
					? "bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/20"
					: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20 hover:bg-yellow-500/20",
			)}
			title={issueLabels}
		>
			{badgeContent}
		</button>
	);
}

// Custom DialogContent with fade-only animation
function FadeOnlyDialogContent({
	className,
	children,
	...props
}: React.ComponentProps<typeof DialogPrimitive.Content>) {
	return (
		<DialogPrimitive.Portal>
			<DialogPrimitive.Overlay className="data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-background/80 backdrop-blur-xs data-[state=closed]:animate-out data-[state=open]:animate-in" />
			<DialogPrimitive.Content
				className={cn(
					"data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed top-[50%] left-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 bg-background p-6 shadow-2xl duration-200 data-[state=closed]:animate-out data-[state=open]:animate-in rounded-xl border-none ring-4 ring-neutral-200/80 dark:bg-neutral-900 dark:ring-neutral-800",
					className,
				)}
				{...props}
			>
				{children}
				<DialogPrimitive.Close className="absolute top-4 right-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-hidden focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
					<XIcon className="size-4" />
					<span className="sr-only">Close</span>
				</DialogPrimitive.Close>
			</DialogPrimitive.Content>
		</DialogPrimitive.Portal>
	);
}

function HeadingIssuesInfoModal({
	open,
	onOpenChange,
	t,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	t: ReturnType<typeof useTranslations>;
}) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<FadeOnlyDialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>
						{t("share.headingStructure.infoModal.title")}
					</DialogTitle>
					<DialogDescription>
						{t("share.headingStructure.infoModal.subtitle")}
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-6 mt-4">
					{/* Color Guide */}
					<Card>
						<CardHeader>
							<CardTitle className="text-base">
								{t(
									"share.headingStructure.infoModal.colorGuide.title",
								)}
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-3">
							<div className="flex items-center gap-3">
								<div className="w-3 h-3 rounded-full bg-destructive shrink-0" />
								<div className="text-sm">
									<strong>
										{t(
											"share.headingStructure.infoModal.colorGuide.red",
										)}
										:
									</strong>{" "}
									{t(
										"share.headingStructure.infoModal.colorGuide.redDescription",
									)}
								</div>
							</div>
							<div className="flex items-center gap-3">
								<div className="w-3 h-3 rounded-full bg-yellow-500 shrink-0" />
								<div className="text-sm">
									<strong>
										{t(
											"share.headingStructure.infoModal.colorGuide.orange",
										)}
										:
									</strong>{" "}
									{t(
										"share.headingStructure.infoModal.colorGuide.orangeDescription",
									)}
								</div>
							</div>
							<div className="flex items-center gap-3">
								<div className="w-3 h-3 rounded-full bg-green-500 shrink-0" />
								<div className="text-sm">
									<strong>
										{t(
											"share.headingStructure.infoModal.colorGuide.green",
										)}
										:
									</strong>{" "}
									{t(
										"share.headingStructure.infoModal.colorGuide.greenDescription",
									)}
								</div>
							</div>
						</CardContent>
					</Card>

					{/* Issue Types */}
					<Card>
						<CardHeader>
							<CardTitle className="text-base">
								{t(
									"share.headingStructure.infoModal.commonIssues.title",
								)}
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-6">
							{/* Issue 1: Empty */}
							<div>
								<div className="flex items-center gap-2 mb-2">
									<div
										className={cn(
											"flex items-center justify-center w-8 h-8 rounded-md text-xs font-semibold",
											"bg-destructive/10 text-destructive border border-destructive/20",
										)}
									>
										1
									</div>
									<h5 className="font-semibold text-sm">
										{t(
											"share.headingStructure.infoModal.commonIssues.empty.title",
										)}
									</h5>
								</div>
								<p className="text-sm text-muted-foreground ml-8 mb-1">
									{t(
										"share.headingStructure.infoModal.commonIssues.empty.description",
									)}
								</p>
								<p className="text-xs text-muted-foreground ml-8">
									<strong>
										{t(
											"share.headingStructure.infoModal.commonIssues.fix",
										)}
										:
									</strong>{" "}
									{t(
										"share.headingStructure.infoModal.commonIssues.empty.fix",
									)}
								</p>
							</div>

							{/* Issue 2: Short */}
							<div>
								<div className="flex items-center gap-2 mb-2">
									<div
										className={cn(
											"flex items-center justify-center w-8 h-8 rounded-md text-xs font-semibold",
											"bg-yellow-500/10 text-yellow-600 border border-yellow-500/20",
										)}
									>
										2
									</div>
									<h5 className="font-semibold text-sm">
										{t(
											"share.headingStructure.infoModal.commonIssues.short.title",
										)}
									</h5>
								</div>
								<p className="text-sm text-muted-foreground ml-8 mb-1">
									{t(
										"share.headingStructure.infoModal.commonIssues.short.description",
									)}
								</p>
								<p className="text-xs text-muted-foreground ml-8">
									<strong>
										{t(
											"share.headingStructure.infoModal.commonIssues.fix",
										)}
										:
									</strong>{" "}
									{t(
										"share.headingStructure.infoModal.commonIssues.short.fix",
									)}
								</p>
							</div>

							{/* Issue 3: Long */}
							<div>
								<div className="flex items-center gap-2 mb-2">
									<div
										className={cn(
											"flex items-center justify-center w-8 h-8 rounded-md text-xs font-semibold",
											"bg-yellow-500/10 text-yellow-600 border border-yellow-500/20",
										)}
									>
										3
									</div>
									<h5 className="font-semibold text-sm">
										{t(
											"share.headingStructure.infoModal.commonIssues.long.title",
										)}
									</h5>
								</div>
								<p className="text-sm text-muted-foreground ml-8 mb-1">
									{t(
										"share.headingStructure.infoModal.commonIssues.long.description",
									)}
								</p>
								<p className="text-xs text-muted-foreground ml-8">
									<strong>
										{t(
											"share.headingStructure.infoModal.commonIssues.fix",
										)}
										:
									</strong>{" "}
									{t(
										"share.headingStructure.infoModal.commonIssues.long.fix",
									)}
								</p>
							</div>

							{/* Issue 4: Skip */}
							<div>
								<div className="flex items-center gap-2 mb-2">
									<div
										className={cn(
											"flex items-center justify-center w-8 h-8 rounded-md text-xs font-semibold",
											"bg-destructive/10 text-destructive border border-destructive/20",
										)}
									>
										4
									</div>
									<h5 className="font-semibold text-sm">
										{t(
											"share.headingStructure.infoModal.commonIssues.skip.title",
										)}
									</h5>
								</div>
								<p className="text-sm text-muted-foreground ml-8 mb-1">
									{t(
										"share.headingStructure.infoModal.commonIssues.skip.description",
									)}
								</p>
								<p className="text-xs text-muted-foreground ml-8">
									<strong>
										{t(
											"share.headingStructure.infoModal.commonIssues.fix",
										)}
										:
									</strong>{" "}
									{t(
										"share.headingStructure.infoModal.commonIssues.skip.fix",
									)}
								</p>
							</div>

							{/* Issue 5: Orphan */}
							<div>
								<div className="flex items-center gap-2 mb-2">
									<div
										className={cn(
											"flex items-center justify-center w-8 h-8 rounded-md text-xs font-semibold",
											"bg-yellow-500/10 text-yellow-600 border border-yellow-500/20",
										)}
									>
										5
									</div>
									<h5 className="font-semibold text-sm">
										{t(
											"share.headingStructure.infoModal.commonIssues.orphan.title",
										)}
									</h5>
								</div>
								<p className="text-sm text-muted-foreground ml-8 mb-1">
									{t(
										"share.headingStructure.infoModal.commonIssues.orphan.description",
									)}
								</p>
								<p className="text-xs text-muted-foreground ml-8">
									<strong>
										{t(
											"share.headingStructure.infoModal.commonIssues.fix",
										)}
										:
									</strong>{" "}
									{t(
										"share.headingStructure.infoModal.commonIssues.orphan.fix",
									)}
								</p>
							</div>

							{/* Issue 6: Multiple H1 */}
							<div>
								<div className="flex items-center gap-2 mb-2">
									<div
										className={cn(
											"flex items-center justify-center w-8 h-8 rounded-md text-xs font-semibold",
											"bg-destructive/10 text-destructive border border-destructive/20",
										)}
									>
										6
									</div>
									<h5 className="font-semibold text-sm">
										{t(
											"share.headingStructure.infoModal.commonIssues.multipleH1.title",
										)}
									</h5>
								</div>
								<p className="text-sm text-muted-foreground ml-8 mb-1">
									{t(
										"share.headingStructure.infoModal.commonIssues.multipleH1.description",
									)}
								</p>
								<p className="text-xs text-muted-foreground ml-8">
									<strong>
										{t(
											"share.headingStructure.infoModal.commonIssues.fix",
										)}
										:
									</strong>{" "}
									{t(
										"share.headingStructure.infoModal.commonIssues.multipleH1.fix",
									)}
								</p>
							</div>
						</CardContent>
					</Card>

					{/* Best Practices */}
					<Card>
						<CardHeader>
							<CardTitle className="text-base">
								{t(
									"share.headingStructure.infoModal.bestPractices.title",
								)}
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-3">
							<div className="flex items-start gap-3">
								<div className="flex items-center justify-center min-w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs font-semibold shrink-0">
									1
								</div>
								<p className="text-sm">
									{t(
										"share.headingStructure.infoModal.bestPractices.item1",
									)}
								</p>
							</div>
							<div className="flex items-start gap-3">
								<div className="flex items-center justify-center min-w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs font-semibold shrink-0">
									2
								</div>
								<p className="text-sm">
									{t(
										"share.headingStructure.infoModal.bestPractices.item2",
									)}
								</p>
							</div>
							<div className="flex items-start gap-3">
								<div className="flex items-center justify-center min-w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs font-semibold shrink-0">
									3
								</div>
								<p className="text-sm">
									{t(
										"share.headingStructure.infoModal.bestPractices.item3",
									)}
								</p>
							</div>
							<div className="flex items-start gap-3">
								<div className="flex items-center justify-center min-w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs font-semibold shrink-0">
									4
								</div>
								<p className="text-sm">
									{t(
										"share.headingStructure.infoModal.bestPractices.item4",
									)}
								</p>
							</div>
						</CardContent>
					</Card>
				</div>
			</FadeOnlyDialogContent>
		</Dialog>
	);
}

export function ShareHeadingStructurePage({
	data,
}: ShareHeadingStructurePageProps) {
	const t = useTranslations();
	const [modalOpen, setModalOpen] = useState(false);
	const [aiFixModalOpen, setAiFixModalOpen] = useState(false);
	const [exportModalOpen, setExportModalOpen] = useState(false);
	const [activeFilter, setActiveFilter] = useState<HeadingFilterType>("all");

	const calculateIssueCounts = (
		tree: HeadingNode[],
	): {
		critical: number;
		warnings: number;
		noIssues: number;
	} => {
		let critical = 0;
		let warnings = 0;
		let noIssues = 0;

		const traverse = (nodes: HeadingNode[]) => {
			for (const node of nodes) {
				if (node.issues.length === 0) {
					noIssues++;
				} else {
					const hasCritical = node.issues.some((i) =>
						["skip", "empty", "multiple-h1", "missing-h1"].includes(
							i,
						),
					);
					if (hasCritical) {
						critical++;
					} else {
						warnings++;
					}
				}
				if (node.children.length > 0) {
					traverse(node.children);
				}
			}
		};

		traverse(tree);
		return { critical, warnings, noIssues };
	};

	// Calculate filter issue counts
	const calculateFilterIssueCounts = () => {
		const counts = {
			empty: 0,
			short: 0,
			long: 0,
			skip: 0,
			orphan: 0,
			multipleH1: 0,
		};

		const countInNode = (node: HeadingNode) => {
			if (node.issues) {
				if (node.issues.includes("empty")) counts.empty++;
				if (node.issues.includes("short")) counts.short++;
				if (node.issues.includes("long")) counts.long++;
				if (node.issues.includes("skip")) counts.skip++;
				if (node.issues.includes("orphan")) counts.orphan++;
				if (node.issues.includes("multiple-h1")) counts.multipleH1++;
			}
			if (node.children) {
				node.children.forEach(countInNode);
			}
		};

		data.treeData.tree.forEach(countInNode);
		return counts;
	};

	// Get filtered headings based on active filter
	const getFilteredHeadings = (tree: HeadingNode[]): HeadingNode[] => {
		if (activeFilter === "all") {
			return tree;
		}

		const filterNodes = (nodes: HeadingNode[]): HeadingNode[] => {
			return nodes
				.map((node) => {
					const matches =
						node.issues && node.issues.includes(activeFilter);
					const filteredChildren = node.children
						? filterNodes(node.children)
						: [];

					if (matches || filteredChildren.length > 0) {
						return {
							...node,
							children:
								filteredChildren.length > 0
									? filteredChildren
									: node.children,
						};
					}

					return null;
				})
				.filter((node): node is HeadingNode => node !== null);
		};

		return filterNodes(tree);
	};

	const filteredTree = useMemo(
		() => getFilteredHeadings(data.treeData.tree),
		[activeFilter, data.treeData.tree],
	);

	const filterCounts = useMemo(
		() => calculateFilterIssueCounts(),
		[data.treeData.tree],
	);

	const renderTree = (
		nodes: HeadingNode[],
		depth: number = 0,
		maxDepth?: number,
	): React.ReactNode => {
		if (maxDepth !== undefined && depth >= maxDepth) {
			return null;
		}

		return (
			<div className="space-y-0">
				{nodes.map((node, index) => {
					const hasIssues = node.issues.length > 0;
					const hasChildren = node.children.length > 0;
					const isLast = index === nodes.length - 1;
					const issueLabels = node.issues
						.map((issue) => getIssueLabel(issue, t))
						.join(", ");
					const isCritical = node.issues.some((i) =>
						["skip", "empty", "multiple-h1", "missing-h1"].includes(
							i,
						),
					);
					const isWarning = hasIssues && !isCritical;

					return (
						<div
							key={index}
							className={cn(
								"relative",
								depth === 0 && "ml-0",
								depth > 0 && "ml-8",
							)}
						>
							{/* Vertical connector line - extends to match card height */}
							{depth > 0 && (
								<div
									className={cn(
										"absolute -left-6 w-0.5 bg-border",
										isLast
											? "-top-2 h-8"
											: "-top-2 bottom-0",
									)}
								/>
							)}
							{/* Horizontal connector line - connects at card center */}
							{depth > 0 && (
								<div className="absolute -left-6 top-6 w-8 h-0.5 bg-border" />
							)}

							{/* Node content card */}
							<div
								className={cn(
									"relative flex items-center gap-3 p-4 rounded-lg border transition-all min-h-12 mb-2",
									"bg-card hover:bg-muted/50 hover:shadow-sm",
									isCritical
										? "border-l-4 border-l-destructive"
										: isWarning
											? "border-l-4 border-l-yellow-500"
											: "border-l-4 border-l-green-500",
								)}
							>
								<div className="flex flex-col gap-2 flex-1 min-w-0">
									<div className="flex items-center gap-3 flex-wrap">
										<span
											className={cn(
												"font-mono text-sm font-semibold px-2 py-1 rounded shrink-0",
												isCritical
													? "bg-destructive/10 text-destructive"
													: isWarning
														? "bg-yellow-500/10 text-yellow-600"
														: "bg-green-500/10 text-green-600",
											)}
										>
											{node.targetLevel &&
											node.targetLevel !== node.level
												? `H${node.level} → H${node.targetLevel}`
												: `H${node.level}`}
										</span>
										<span className="font-medium text-base wrap-break-word flex-1">
											{node.content || (
												<span className="text-muted-foreground italic">
													{t(
														"share.headingStructure.hierarchy.emptyHeading",
													)}
												</span>
											)}
										</span>
										{hasIssues &&
											data.exportOptions.includeIssues !==
												false && (
												<Badge
													status={
														isCritical
															? "error"
															: "warning"
													}
													className="text-xs shrink-0"
												>
													{issueLabels}
												</Badge>
											)}
										<StatusBadge
											issues={node.issues}
											onClick={() => setModalOpen(true)}
											t={t}
										/>
									</div>
									{data.exportOptions.includeSelectors &&
										node.selector && (
											<SelectorCollapsible
												selector={node.selector}
												t={t}
											/>
										)}
								</div>
							</div>

							{/* Children */}
							{hasChildren && (
								<div className="mt-2">
									{renderTree(
										node.children,
										depth + 1,
										maxDepth,
									)}
								</div>
							)}
						</div>
					);
				})}
			</div>
		);
	};

	const counts = calculateIssueCounts(data.treeData.tree);
	const { tree, totalHeadings } = data.treeData;

	// Separate orphaned headings from proper H1 trees - use filtered tree
	const orphanedHeadings = filteredTree.filter((node) => node.level !== 1);
	const h1Trees = filteredTree.filter((node) => node.level === 1);

	const hasIssues = counts.critical > 0 || counts.warnings > 0;

	return (
		<div className="min-h-screen bg-background py-8 px-4 sm:px-6 lg:px-8 pb-24">
			<div className="max-w-7xl mx-auto">
				{/* Header */}
				<div className="mb-8">
					<div className="mb-4">
						<h1 className="text-3xl font-bold tracking-tight">
							{t("share.headingStructure.title")}
						</h1>
						<p className="text-muted-foreground mt-1">
							{t("share.headingStructure.sharedFrom")}{" "}
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
					<div className="flex items-center gap-2 text-sm text-muted-foreground">
						<Badge status="info">
							{t("share.headingStructure.expires")}{" "}
							{new Date(data.expiresAt).toLocaleDateString()}
						</Badge>
					</div>
				</div>

				{/* Summary */}
				{data.exportOptions.includeSummary !== false && (
					<Card className="mb-8">
						<CardHeader>
							<CardTitle>
								{t("share.headingStructure.summary.title")}
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
								<div>
									<div className="text-sm text-muted-foreground mb-1">
										{t(
											"share.headingStructure.summary.totalHeadings",
										)}
									</div>
									<div className="text-2xl font-bold">
										{totalHeadings}
									</div>
								</div>
								<div>
									<div className="text-sm text-muted-foreground mb-1">
										{t(
											"share.headingStructure.summary.criticalIssues",
										)}
									</div>
									<div className="text-2xl font-bold text-destructive">
										{counts.critical}
									</div>
								</div>
								<div>
									<div className="text-sm text-muted-foreground mb-1">
										{t(
											"share.headingStructure.summary.warnings",
										)}
									</div>
									<div className="text-2xl font-bold text-yellow-600">
										{counts.warnings}
									</div>
								</div>
								<div>
									<div className="text-sm text-muted-foreground mb-1">
										{t(
											"share.headingStructure.summary.noIssues",
										)}
									</div>
									<div className="text-2xl font-bold text-green-600">
										{counts.noIssues}
									</div>
								</div>
							</div>
						</CardContent>
					</Card>
				)}

				{/* Heading Tree */}
				<Card className="mb-8">
					<CardHeader>
						<div className="flex items-center justify-between">
							<CardTitle>
								{t("share.headingStructure.hierarchy.title")} (
								{filteredTree.length})
							</CardTitle>
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button variant="outline" size="sm">
										<FilterIcon className="size-4 mr-2" />
										{activeFilter === "all"
											? t(
													"share.headingStructure.filters.all",
												)
											: t(
													`share.headingStructure.filters.${activeFilter}`,
												)}
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent align="end">
									<DropdownMenuItem
										onClick={() => setActiveFilter("all")}
									>
										{t(
											"share.headingStructure.filters.all",
										)}{" "}
										({data.treeData.totalHeadings})
									</DropdownMenuItem>
									<DropdownMenuItem
										onClick={() => setActiveFilter("empty")}
										disabled={filterCounts.empty === 0}
									>
										{t(
											"share.headingStructure.filters.empty",
										)}{" "}
										({filterCounts.empty})
									</DropdownMenuItem>
									<DropdownMenuItem
										onClick={() => setActiveFilter("short")}
										disabled={filterCounts.short === 0}
									>
										{t(
											"share.headingStructure.filters.short",
										)}{" "}
										({filterCounts.short})
									</DropdownMenuItem>
									<DropdownMenuItem
										onClick={() => setActiveFilter("long")}
										disabled={filterCounts.long === 0}
									>
										{t(
											"share.headingStructure.filters.long",
										)}{" "}
										({filterCounts.long})
									</DropdownMenuItem>
									<DropdownMenuItem
										onClick={() => setActiveFilter("skip")}
										disabled={filterCounts.skip === 0}
									>
										{t(
											"share.headingStructure.filters.skip",
										)}{" "}
										({filterCounts.skip})
									</DropdownMenuItem>
									<DropdownMenuItem
										onClick={() =>
											setActiveFilter("orphan")
										}
										disabled={filterCounts.orphan === 0}
									>
										{t(
											"share.headingStructure.filters.orphan",
										)}{" "}
										({filterCounts.orphan})
									</DropdownMenuItem>
									<DropdownMenuItem
										onClick={() =>
											setActiveFilter("multiple-h1")
										}
										disabled={filterCounts.multipleH1 === 0}
									>
										{t(
											"share.headingStructure.filters.multipleH1",
										)}{" "}
										({filterCounts.multipleH1})
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>
						</div>
					</CardHeader>
					<CardContent className="space-y-4">
						{orphanedHeadings.length > 0 && (
							<Accordion
								type="single"
								collapsible
								className="w-full"
							>
								<AccordionItem
									value="orphaned"
									className="border border-yellow-500/30 rounded-lg bg-yellow-50/50 dark:bg-yellow-950/20 overflow-hidden"
								>
									<AccordionTrigger className="py-3 px-4 hover:no-underline transition-colors cursor-pointer [&[data-state=open]>div>svg]:rotate-180">
										<div className="flex items-center gap-2 w-full">
											<span className="text-yellow-600 dark:text-yellow-500 text-lg">
												⚠️
											</span>
											<span className="font-semibold text-base flex-1 text-left">
												{t(
													"share.headingStructure.hierarchy.orphanedHeadings",
												)}{" "}
												(
												{t(
													"share.headingStructure.hierarchy.orphanedHeadingsFound",
													{
														count: orphanedHeadings.length,
													},
												)}
												)
											</span>
										</div>
									</AccordionTrigger>
									<AccordionContent className="px-4 pt-0">
										<div className="pt-4 space-y-4">
											{/* Solution Info Section */}
											<div className="bg-background/50 dark:bg-background/30 border border-yellow-500/30 rounded-lg p-4">
												<div className="flex items-start gap-2">
													<span className="text-yellow-600 dark:text-yellow-500 text-base">
														💡
													</span>
													<div className="flex-1">
														<h4 className="text-sm font-semibold text-yellow-900 dark:text-yellow-100 mb-1">
															{t(
																"share.headingStructure.infoModal.commonIssues.orphan.solution.title",
															)}
														</h4>
														<p className="text-xs text-yellow-800 dark:text-yellow-200 mb-3">
															{t(
																"share.headingStructure.infoModal.commonIssues.orphan.solution.description",
															)}
														</p>
														<div className="text-xs font-semibold text-yellow-900 dark:text-yellow-100 mb-2">
															{t(
																"share.headingStructure.infoModal.commonIssues.orphan.solution.recommendedLabel",
															)}
														</div>
														<div className="flex flex-wrap gap-2 mb-3">
															<span className="px-2 py-1 bg-background border border-yellow-500/30 rounded text-xs font-mono text-yellow-900 dark:text-yellow-100">
																&lt;h2-h6&gt; →
																&lt;div&gt;
															</span>
															<span className="px-2 py-1 bg-background border border-yellow-500/30 rounded text-xs font-mono text-yellow-900 dark:text-yellow-100">
																&lt;h2-h6&gt; →
																&lt;p&gt;
															</span>
															<span className="px-2 py-1 bg-background border border-yellow-500/30 rounded text-xs font-mono text-yellow-900 dark:text-yellow-100">
																&lt;h2-h6&gt; →
																&lt;span&gt;
															</span>
														</div>
														<p className="text-xs text-yellow-800 dark:text-yellow-200">
															<strong>
																{t(
																	"share.headingStructure.infoModal.commonIssues.orphan.solution.stylingNote",
																)}
															</strong>
														</p>
													</div>
												</div>
											</div>

											{/* Orphaned Headings Tree */}
											<div>
												{renderTree(
													orphanedHeadings,
													0,
													data.exportOptions.maxDepth,
												)}
											</div>
										</div>
									</AccordionContent>
								</AccordionItem>
							</Accordion>
						)}
						{h1Trees.length > 0 ? (
							<div>
								{orphanedHeadings.length > 0 && (
									<div className="mb-4 text-sm font-semibold text-muted-foreground">
										{t(
											"share.headingStructure.hierarchy.mainContentStructure",
										)}
									</div>
								)}
								{renderTree(
									h1Trees,
									0,
									data.exportOptions.maxDepth,
								)}
							</div>
						) : orphanedHeadings.length === 0 ? (
							<div className="text-muted-foreground text-center py-8">
								{activeFilter === "all" ? (
									<div>
										<CheckIcon className="size-12 mx-auto mb-3 text-green-500" />
										<p>
											{t(
												"share.headingStructure.hierarchy.noHeadingsFound",
											)}
										</p>
									</div>
								) : (
									<div>
										<CheckIcon className="size-12 mx-auto mb-3 text-green-500" />
										<p className="font-medium">
											{t(
												"share.headingStructure.filters.noIssuesFound",
											)}
										</p>
										<p className="text-sm mt-1">
											{t(
												"share.headingStructure.filters.noIssuesDescription",
											)}
										</p>
									</div>
								)}
							</div>
						) : null}
					</CardContent>
				</Card>

				{/* Issue Legend */}
				{data.exportOptions.includeIssues !== false && (
					<Card className="mb-8">
						<CardHeader>
							<CardTitle>
								{t("share.headingStructure.legend.title")}
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
								<div>
									<div className="font-semibold mb-2">
										{t(
											"share.headingStructure.legend.criticalIssues.title",
										)}
									</div>
									<ul className="space-y-1 text-muted-foreground">
										<li>
											•{" "}
											{t(
												"share.headingStructure.legend.criticalIssues.levelSkip",
											)}
										</li>
										<li>
											•{" "}
											{t(
												"share.headingStructure.legend.criticalIssues.orphaned",
											)}
										</li>
										<li>
											•{" "}
											{t(
												"share.headingStructure.legend.criticalIssues.empty",
											)}
										</li>
										<li>
											•{" "}
											{t(
												"share.headingStructure.legend.criticalIssues.multipleH1",
											)}
										</li>
										<li>
											•{" "}
											{t(
												"share.headingStructure.legend.criticalIssues.missingH1",
											)}
										</li>
									</ul>
								</div>
								<div>
									<div className="font-semibold mb-2">
										{t(
											"share.headingStructure.legend.warnings.title",
										)}
									</div>
									<ul className="space-y-1 text-muted-foreground">
										<li>
											•{" "}
											{t(
												"share.headingStructure.legend.warnings.tooShort",
											)}
										</li>
										<li>
											•{" "}
											{t(
												"share.headingStructure.legend.warnings.tooLong",
											)}
										</li>
									</ul>
								</div>
							</div>
						</CardContent>
					</Card>
				)}

				{/* Footer */}
				<div className="mt-12 pt-8 border-t border-border">
					<div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
						<div>
							{t("share.headingStructure.footer.copyright", {
								year: new Date().getFullYear(),
							})}
						</div>
						<a
							href="https://webclarity.ai"
							target="_blank"
							rel="noopener noreferrer"
							className="hover:text-foreground transition-colors font-medium"
						>
							{t("share.headingStructure.footer.website")}
						</a>
					</div>
				</div>
			</div>

			{/* Heading Issues Info Modal */}
			<HeadingIssuesInfoModal
				open={modalOpen}
				onOpenChange={setModalOpen}
				t={t}
			/>

			{/* AI Fix Modal */}
			<AIFixModal
				open={aiFixModalOpen}
				onOpenChange={setAiFixModalOpen}
				tree={data.treeData.tree}
				totalHeadings={data.treeData.totalHeadings}
				h1Count={data.treeData.h1Count}
				pageUrl={data.websiteUrl}
			/>

			{/* Export Modal */}
			<ExportModal
				open={exportModalOpen}
				onOpenChange={setExportModalOpen}
				tree={data.treeData.tree}
				totalHeadings={data.treeData.totalHeadings}
				issuesCount={data.treeData.issuesCount}
				h1Count={data.treeData.h1Count}
				pageUrl={data.websiteUrl}
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
