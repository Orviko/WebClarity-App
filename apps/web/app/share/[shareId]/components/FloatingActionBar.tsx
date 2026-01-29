"use client";

import { Button } from "@ui/components/button";
import { ShimmerButton } from "@ui/components/shimmer-button";
import { SparklesIcon, DownloadIcon } from "lucide-react";
import { ColorModeToggle } from "@shared/components/ColorModeToggle";

interface FloatingActionBarProps {
	onFixWithAI: () => void;
	onExport: () => void;
	hasIssues: boolean;
}

export function FloatingActionBar({
	onFixWithAI,
	onExport,
	hasIssues,
}: FloatingActionBarProps) {
	return (
		<div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
			<div className="bg-background/95 backdrop-blur-md border border-border/50 rounded-2xl shadow-lg p-2 flex items-center gap-2">
				<Button variant="outline" size="sm" onClick={onExport}>
					<DownloadIcon className="size-4" />
					Export
				</Button>

				<ShimmerButton
					onClick={onFixWithAI}
					disabled={!hasIssues}
					className="h-9 rounded-md"
					innerClassName="px-3 py-0"
				>
					<SparklesIcon className="size-4" />
					Fix with AI
				</ShimmerButton>

				<div className="h-6 w-px bg-border/60" />

				<ColorModeToggle size="icon-sm" />
			</div>
		</div>
	);
}
