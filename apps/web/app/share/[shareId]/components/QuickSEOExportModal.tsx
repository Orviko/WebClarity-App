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
} from "../../../../lib/export/quick-seo";
import type { QuickSEOShareData } from "../share-quick-seo-page";

interface QuickSEOExportModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	data: QuickSEOShareData;
}

export function QuickSEOExportModal({
	open,
	onOpenChange,
	data,
}: QuickSEOExportModalProps) {
	const t = useTranslations();
	const [includePassing, setIncludePassing] = useState(true);
	const [includeWarnings, setIncludeWarnings] = useState(true);
	const [includeFailures, setIncludeFailures] = useState(true);
	const [includeSummary, setIncludeSummary] = useState(true);

	const generateReport = () => {
		const options: ExportOptions = {
			includePassing,
			includeWarnings,
			includeFailures,
			includeSummary,
		};

		return generateFullReport({
			seoData: data.seoData,
			pageUrl: data.websiteUrl,
			options,
		});
	};

	const handleCopyToClipboard = async () => {
		try {
			const report = generateReport();
			await navigator.clipboard.writeText(report);

			// Close dialog first, then show toast
			onOpenChange(false);

			setTimeout(() => {
				toast.success("Report copied to clipboard!");
			}, 100);
		} catch (error) {
			console.error("Failed to copy to clipboard:", error);
			toast.error("Failed to copy report");
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

			// Close dialog first, then show toast
			onOpenChange(false);

			setTimeout(() => {
				toast.success("Report downloaded successfully!");
			}, 100);
		} catch (error) {
			console.error("Failed to download:", error);
			toast.error("Failed to download report");
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-md">
				<DialogHeader>
					<DialogTitle>Export SEO Analysis</DialogTitle>
					<DialogDescription>
						Export your Quick SEO analysis as a text file for easy
						sharing and documentation.
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-4 mt-4">
					{/* Export Options */}
					<div>
						<h4 className="text-sm font-semibold mb-3">
							Export Options
						</h4>
						<div className="space-y-3">
							<div className="flex items-center space-x-2">
								<Checkbox
									id="include-passing"
									checked={includePassing}
									onCheckedChange={(checked) =>
										setIncludePassing(checked === true)
									}
								/>
								<Label
									htmlFor="include-passing"
									className="text-sm font-normal cursor-pointer"
								>
									Include Passing Checks
								</Label>
							</div>
							<div className="flex items-center space-x-2">
								<Checkbox
									id="include-warnings"
									checked={includeWarnings}
									onCheckedChange={(checked) =>
										setIncludeWarnings(checked === true)
									}
								/>
								<Label
									htmlFor="include-warnings"
									className="text-sm font-normal cursor-pointer"
								>
									Include Warnings
								</Label>
							</div>
							<div className="flex items-center space-x-2">
								<Checkbox
									id="include-failures"
									checked={includeFailures}
									onCheckedChange={(checked) =>
										setIncludeFailures(checked === true)
									}
								/>
								<Label
									htmlFor="include-failures"
									className="text-sm font-normal cursor-pointer"
								>
									Include Failures
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
									Include Summary Statistics
								</Label>
							</div>
						</div>
					</div>
				</div>

				{/* Actions */}
				<div className="flex gap-3 pt-4 border-t">
					<Button onClick={handleCopyToClipboard} className="flex-1">
						<CopyIcon className="size-4 mr-2" />
						Copy to Clipboard
					</Button>
					<Button
						onClick={handleDownload}
						variant="outline"
						className="flex-1"
					>
						<DownloadIcon className="size-4 mr-2" />
						Download
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
}
