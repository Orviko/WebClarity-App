"use client";

import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@ui/components/dialog";
import { Button } from "@ui/components/button";
import { DownloadIcon } from "lucide-react";
import { toast } from "sonner";
import { SocialViewShareData } from "../share-social-view-page";

interface Props {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	data: SocialViewShareData;
}

export function SocialViewExportModal({ open, onOpenChange, data }: Props) {
	const handleExport = () => {
		try {
			const content = JSON.stringify(data, null, 2);
			const blob = new Blob([content], { type: "application/json" });
			const url = URL.createObjectURL(blob);
			const a = document.createElement("a");
			a.href = url;
			a.download = `social-view-report-${data.websiteUrl}.json`;
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);
			URL.revokeObjectURL(url);

			// Close dialog first, then show toast
			onOpenChange(false);

			setTimeout(() => {
				toast.success("Report downloaded successfully!");
			}, 100);
		} catch (error) {
			console.error("Failed to export:", error);
			toast.error("Failed to export report");
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-md">
				<DialogHeader>
					<DialogTitle>Export Report</DialogTitle>
					<DialogDescription>
						Download this report as a JSON file for your records.
					</DialogDescription>
				</DialogHeader>

				<div className="flex gap-3 pt-4">
					<Button
						onClick={() => onOpenChange(false)}
						variant="outline"
						className="flex-1"
					>
						Cancel
					</Button>
					<Button onClick={handleExport} className="flex-1">
						<DownloadIcon className="size-4 mr-2" />
						Export JSON
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
}
