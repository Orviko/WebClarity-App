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
import { CopyIcon } from "lucide-react";
import { toast } from "sonner";
import {
	generateQuickSEOPlatformPrompt,
	generateQuickSEOIDEPrompt,
	type QuickSEOPromptContext,
} from "../../../../lib/prompts/quick-seo";
import type { QuickSEOShareData } from "../share-quick-seo-page";

interface QuickSEOAIFixModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	data: QuickSEOShareData;
}

export function QuickSEOAIFixModal({
	open,
	onOpenChange,
	data,
}: QuickSEOAIFixModalProps) {
	const t = useTranslations();
	const [includeFailures, setIncludeFailures] = useState(true);
	const [includeWarnings, setIncludeWarnings] = useState(true);

	const handleCopyPrompt = async (promptType: "platform" | "ide") => {
		try {
			const context: QuickSEOPromptContext = {
				pageUrl: data.websiteUrl,
				seoData: data.seoData,
				includeFailures,
				includeWarnings,
			};

			const prompt =
				promptType === "ide"
					? generateQuickSEOIDEPrompt(context)
					: generateQuickSEOPlatformPrompt(context);

			await navigator.clipboard.writeText(prompt);

			// Close dialog first, then show toast
			onOpenChange(false);

			setTimeout(() => {
				toast.success(
					promptType === "ide"
						? "IDE prompt copied to clipboard!"
						: "Prompt copied to clipboard!",
				);
			}, 100);
		} catch (error) {
			console.error("Failed to copy prompt:", error);
			toast.error("Failed to copy prompt");
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>Fix SEO Issues with AI</DialogTitle>
					<DialogDescription>
						Generate an AI prompt to fix the SEO issues detected on
						your page. Copy and paste it into ChatGPT, Claude, or
						your IDE's AI assistant.
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-6 mt-4">
					{/* Fix Options Section */}
					<div>
						<h4 className="text-sm font-semibold mb-3">
							Issues to Include
						</h4>
						<div className="space-y-3">
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
									Critical Failures (Must Fix)
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
									Warnings (Recommended)
								</Label>
							</div>
						</div>
					</div>

					{/* How it works Section */}
					<div>
						<h4 className="text-sm font-semibold mb-3">
							How It Works
						</h4>
						<div className="space-y-3">
							<div className="flex items-start gap-3">
								<div className="flex items-center justify-center min-w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-semibold shrink-0">
									1
								</div>
								<p className="text-sm text-muted-foreground">
									Choose which issues you want to fix
									(failures and/or warnings)
								</p>
							</div>
							<div className="flex items-start gap-3">
								<div className="flex items-center justify-center min-w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-semibold shrink-0">
									2
								</div>
								<p className="text-sm text-muted-foreground">
									Copy the generated prompt for your preferred
									AI assistant or IDE
								</p>
							</div>
							<div className="flex items-start gap-3">
								<div className="flex items-center justify-center min-w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-semibold shrink-0">
									3
								</div>
								<p className="text-sm text-muted-foreground">
									Paste the prompt into ChatGPT, Claude, or
									your IDE (VS Code, Cursor, etc.)
								</p>
							</div>
							<div className="flex items-start gap-3">
								<div className="flex items-center justify-center min-w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-semibold shrink-0">
									4
								</div>
								<p className="text-sm text-muted-foreground">
									Review and apply the AI's recommendations to
									fix your SEO issues
								</p>
							</div>
						</div>
					</div>
				</div>

				{/* Actions */}
				<div className="flex gap-3 pt-4 border-t">
					<Button
						onClick={() => handleCopyPrompt("platform")}
						className="flex-1"
					>
						<CopyIcon className="size-4 mr-2" />
						Copy for ChatGPT/Claude
					</Button>
					<Button
						onClick={() => handleCopyPrompt("ide")}
						variant="outline"
						className="flex-1"
					>
						<CopyIcon className="size-4 mr-2" />
						Copy for IDE
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
}
