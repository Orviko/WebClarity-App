"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@ui/components/dialog";
import { Button } from "@ui/components/button";
import { Checkbox } from "@ui/components/checkbox";
import { Label } from "@ui/components/label";
import { CopyIcon, DownloadIcon } from "lucide-react";
import { toast } from "sonner";
import {
	generateFullReport,
	generateExportFilename,
	type ExportOptions,
} from "../../../../lib/export/heading-structure";

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

interface ExportModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	tree: HeadingNode[];
	totalHeadings: number;
	issuesCount: number;
	h1Count: number;
	pageUrl: string;
}

export function ExportModal({
	open,
	onOpenChange,
	tree,
	totalHeadings,
	issuesCount,
	h1Count,
	pageUrl,
}: ExportModalProps) {
	const t = useTranslations();
	const [includeIssues, setIncludeIssues] = useState(true);
	const [includeSelectors, setIncludeSelectors] = useState(false);
	const [includeSummary, setIncludeSummary] = useState(true);

	const generateReport = () => {
		const options: ExportOptions = {
			includeIssues,
			includeSelectors,
			includeSummary,
		};

		return generateFullReport({
			tree,
			totalHeadings,
			issuesCount,
			h1Count,
			pageUrl,
			options,
		});
	};

	const handleCopyToClipboard = async () => {
		try {
			const report = generateReport();
			await navigator.clipboard.writeText(report);

			// Close dialog first, then show toast to avoid duplicate
			onOpenChange(false);

			setTimeout(() => {
				toast.success(t("share.headingStructure.export.copied"));
			}, 100);
		} catch (error) {
			console.error("Failed to copy to clipboard:", error);
			toast.error(t("share.headingStructure.export.copyFailed"));
		}
	};

	const handleDownload = () => {
		try {
			const report = generateReport();
			const blob = new Blob([report], { type: "text/plain" });
			const url = URL.createObjectURL(blob);
			const link = document.createElement("a");
			link.href = url;
			link.download = generateExportFilename();
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
			URL.revokeObjectURL(url);

			// Close dialog first, then show toast to avoid duplicate
			onOpenChange(false);

			setTimeout(() => {
				toast.success(t("share.headingStructure.export.exported"));
			}, 100);
		} catch (error) {
			console.error("Failed to download:", error);
			toast.error(t("share.headingStructure.export.downloadFailed"));
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-md">
				<DialogHeader>
					<DialogTitle>
						{t("share.headingStructure.export.title")}
					</DialogTitle>
					<DialogDescription>
						{t("share.headingStructure.export.description")}
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-4 mt-4">
					{/* Export Options */}
					<div>
						<h4 className="text-sm font-semibold mb-3">
							{t("share.headingStructure.export.options")}
						</h4>
						<div className="space-y-3">
							<div className="flex items-center space-x-2">
								<Checkbox
									id="include-issues"
									checked={includeIssues}
									onCheckedChange={(checked) =>
										setIncludeIssues(checked === true)
									}
								/>
								<Label
									htmlFor="include-issues"
									className="text-sm font-normal cursor-pointer"
								>
									{t(
										"share.headingStructure.export.includeIssues",
									)}
								</Label>
							</div>
							<div className="flex items-center space-x-2">
								<Checkbox
									id="include-selectors"
									checked={includeSelectors}
									onCheckedChange={(checked) =>
										setIncludeSelectors(checked === true)
									}
								/>
								<Label
									htmlFor="include-selectors"
									className="text-sm font-normal cursor-pointer"
								>
									{t(
										"share.headingStructure.export.includeSelectors",
									)}
								</Label>
							</div>
							<div className="flex items-center space-x-2">
								<Checkbox
									id="include-summary"
									checked={includeSummary}
									onCheckedChange={(checked) =>
										setIncludeSummary(checked === true)
									}
								/>
								<Label
									htmlFor="include-summary"
									className="text-sm font-normal cursor-pointer"
								>
									{t(
										"share.headingStructure.export.includeSummary",
									)}
								</Label>
							</div>
						</div>
					</div>
				</div>

				{/* Actions */}
				<div className="flex gap-3 pt-4 border-t">
					<Button onClick={handleCopyToClipboard} className="flex-1">
						<CopyIcon className="size-4 mr-2" />
						{t("share.headingStructure.export.copyToClipboard")}
					</Button>
					<Button
						onClick={handleDownload}
						variant="outline"
						className="flex-1"
					>
						<DownloadIcon className="size-4 mr-2" />
						{t("share.headingStructure.export.download")}
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
}
