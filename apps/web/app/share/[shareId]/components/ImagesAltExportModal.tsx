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
} from "../../../../lib/export/images-alt";
import { ImagesAltShareData } from "../share-images-alt-page";

interface Props {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	data: ImagesAltShareData;
}

export function ImagesAltExportModal({ open, onOpenChange, data }: Props) {
	const t = useTranslations();
	const [includeWithAlt, setIncludeWithAlt] = useState(false);
	const [includeWithoutAlt, setIncludeWithoutAlt] = useState(true);
	const [includeDimensions, setIncludeDimensions] = useState(false);
	const [includeSelectors, setIncludeSelectors] = useState(false);
	const [includeSummary, setIncludeSummary] = useState(true);

	const generateReport = () => {
		const options: ExportOptions = {
			includeWithAlt,
			includeWithoutAlt,
			includeDimensions,
			includeSelectors,
			includeSummary,
		};

		return generateFullReport({
			images: data.imagesData.images,
			summary: data.imagesData.summary,
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
					<DialogTitle>Export Image Alt Report</DialogTitle>
					<DialogDescription>
						Export your image alt text analysis as a text file for
						easy sharing and documentation.
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
									id="include-with-alt"
									checked={includeWithAlt}
									onCheckedChange={(checked) =>
										setIncludeWithAlt(checked === true)
									}
								/>
								<Label
									htmlFor="include-with-alt"
									className="text-sm font-normal cursor-pointer"
								>
									Include Images With Alt Text
								</Label>
							</div>
							<div className="flex items-center space-x-2">
								<Checkbox
									id="include-without-alt"
									checked={includeWithoutAlt}
									onCheckedChange={(checked) =>
										setIncludeWithoutAlt(checked === true)
									}
								/>
								<Label
									htmlFor="include-without-alt"
									className="text-sm font-normal cursor-pointer"
								>
									Include Images Without Alt Text
								</Label>
							</div>
							<div className="flex items-center space-x-2">
								<Checkbox
									id="include-dimensions"
									checked={includeDimensions}
									onCheckedChange={(checked) =>
										setIncludeDimensions(checked === true)
									}
								/>
								<Label
									htmlFor="include-dimensions"
									className="text-sm font-normal cursor-pointer"
								>
									Include Image Dimensions
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
									Include CSS Selectors
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
