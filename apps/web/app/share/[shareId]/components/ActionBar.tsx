"use client";

import { useTranslations } from "next-intl";
import { Button } from "@ui/components/button";
import {
	ChevronDownIcon,
	ChevronUpIcon,
	DownloadIcon,
	SparklesIcon,
} from "lucide-react";

interface ActionBarProps {
	onExpandCollapseAll: () => void;
	isAllExpanded: boolean;
	onExport: () => void;
	onFixWithAI: () => void;
	hasIssues: boolean;
}

export function ActionBar({
	onExpandCollapseAll,
	isAllExpanded,
	onExport,
	onFixWithAI,
	hasIssues,
}: ActionBarProps) {
	const t = useTranslations();

	return (
		<div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 border-b py-3 mb-6">
			<div className="flex items-center gap-3 flex-wrap">
				<Button
					onClick={onExpandCollapseAll}
					variant="outline"
					size="sm"
				>
					{isAllExpanded ? (
						<>
							<ChevronUpIcon className="size-4 mr-2" />
							{t("share.headingStructure.controls.collapseAll")}
						</>
					) : (
						<>
							<ChevronDownIcon className="size-4 mr-2" />
							{t("share.headingStructure.controls.expandAll")}
						</>
					)}
				</Button>

				<Button onClick={onExport} variant="outline" size="sm">
					<DownloadIcon className="size-4 mr-2" />
					{t("share.headingStructure.controls.export")}
				</Button>

				<Button
					onClick={onFixWithAI}
					variant="default"
					size="sm"
					disabled={!hasIssues}
				>
					<SparklesIcon className="size-4 mr-2" />
					{t("share.headingStructure.controls.fixAll")}
				</Button>
			</div>
		</div>
	);
}
