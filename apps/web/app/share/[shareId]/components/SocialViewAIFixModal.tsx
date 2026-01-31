"use client";

import { useState } from "react";
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
import { SocialViewShareData, SocialData } from "../share-social-view-page";
import {
	generateSocialViewPlatformPrompt,
	generateSocialViewIDEPrompt,
} from "../../../../lib/prompts/social-view";
import { useTranslations } from "next-intl";

interface SocialViewPromptContext {
	pageUrl: string;
	socialData: SocialData;
	includeFailures: boolean;
	includeWarnings: boolean;
}

interface Props {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	data: SocialViewShareData;
}

export function SocialViewAIFixModal({ open, onOpenChange, data }: Props) {
	const t = useTranslations("Shares.SocialView");
	const [includeFailures, setIncludeFailures] = useState(true);
	const [includeWarnings, setIncludeWarnings] = useState(true);

	const handleCopyPrompt = async (promptType: "platform" | "ide") => {
		try {
			const context: SocialViewPromptContext = {
				pageUrl: data.websiteUrl,
				socialData: data.socialData,
				includeFailures,
				includeWarnings,
			};

			const prompt =
				promptType === "ide"
					? generateSocialViewIDEPrompt(context)
					: generateSocialViewPlatformPrompt(context);

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
			<DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>
						Fix Social Media Meta Tags with AI
					</DialogTitle>
					<DialogDescription>
						Select which issues to include in the AI prompt
					</DialogDescription>
				</DialogHeader>

				{/* Selection Options */}
				<div className="space-y-4 py-4">
					<div className="flex items-start space-x-3">
						<Checkbox
							id="failures"
							checked={includeFailures}
							onCheckedChange={(checked) =>
								setIncludeFailures(checked as boolean)
							}
						/>
						<div className="space-y-1 leading-none">
							<Label
								htmlFor="failures"
								className="text-sm font-medium cursor-pointer"
							>
								Critical Failures (Must Fix)
							</Label>
							<p className="text-sm text-muted-foreground">
								Missing og:title, og:description, og:image, or
								invalid Twitter card
							</p>
						</div>
					</div>

					<div className="flex items-start space-x-3">
						<Checkbox
							id="warnings"
							checked={includeWarnings}
							onCheckedChange={(checked) =>
								setIncludeWarnings(checked as boolean)
							}
						/>
						<div className="space-y-1 leading-none">
							<Label
								htmlFor="warnings"
								className="text-sm font-medium cursor-pointer"
							>
								Warnings (Recommended)
							</Label>
							<p className="text-sm text-muted-foreground">
								Sub-optimal image dimensions, missing og:url,
								og:type, or Twitter-specific tags
							</p>
						</div>
					</div>
				</div>

				{/* Instructions */}
				<div className="rounded-lg bg-muted p-4 space-y-2">
					<p className="text-sm font-medium">How It Works:</p>
					<ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
						<li>
							Select which issues you want to fix (failures and/or
							warnings)
						</li>
						<li>
							Choose your AI tool:
							<ul className="ml-6 mt-1 space-y-1 list-disc list-inside">
								<li>
									<strong>Copy for AI:</strong> For ChatGPT,
									Claude, or other AI chat tools
								</li>
								<li>
									<strong>Copy for IDE:</strong> For Cursor,
									VS Code Copilot, or IDE assistants
								</li>
							</ul>
						</li>
						<li>
							Paste the copied prompt into your chosen AI tool
						</li>
						<li>The AI will generate recommended meta tags</li>
						<li>
							Review and apply the suggestions to your website
						</li>
					</ol>
				</div>

				{/* Actions */}
				<div className="flex gap-3 pt-4 border-t">
					<Button
						onClick={() => handleCopyPrompt("platform")}
						className="flex-1"
					>
						<CopyIcon className="size-4 mr-2" />
						Copy for AI
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
