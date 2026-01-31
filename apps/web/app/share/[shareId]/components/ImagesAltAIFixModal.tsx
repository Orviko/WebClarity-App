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
	generateImagesAltPlatformPrompt,
	generateImagesAltIDEPrompt,
	type ImagesAltPromptContext,
} from "../../../../lib/prompts/images-alt";
import { ImagesAltShareData } from "../share-images-alt-page";

interface Props {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	data: ImagesAltShareData;
}

export function ImagesAltAIFixModal({ open, onOpenChange, data }: Props) {
	const t = useTranslations();
	const [includeWithAlt, setIncludeWithAlt] = useState(false);
	const [includeMissingAlt, setIncludeMissingAlt] = useState(true);
	const [includeEmptyAlt, setIncludeEmptyAlt] = useState(true);

	const handleCopyPrompt = async (promptType: "platform" | "ide") => {
		try {
			const context: ImagesAltPromptContext = {
				pageUrl: data.websiteUrl,
				images: data.imagesData.images,
				summary: data.imagesData.summary,
				includeWithAlt,
				includeMissingAlt,
				includeEmptyAlt,
				includeDimensions: true,
				includeSelectors: promptType === "ide",
			};

			const prompt =
				promptType === "ide"
					? generateImagesAltIDEPrompt(context)
					: generateImagesAltPlatformPrompt(context);

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
					<DialogTitle>Fix Image Alt Text with AI</DialogTitle>
					<DialogDescription>
						Generate an AI prompt to fix image alt text issues on
						your page. Copy and paste it into ChatGPT, Claude, or
						your IDE's AI assistant.
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-6 mt-4">
					{/* Fix Options Section */}
					<div>
						<h4 className="text-sm font-semibold mb-3">
							Images to Include
						</h4>
						<div className="space-y-3">
							<div className="flex items-center space-x-2">
								<Checkbox
									id="include-missing-alt"
									checked={includeMissingAlt}
									onCheckedChange={(checked) =>
										setIncludeMissingAlt(checked === true)
									}
								/>
								<Label
									htmlFor="include-missing-alt"
									className="text-sm font-normal cursor-pointer"
								>
									Missing Alt Text (Must Fix)
								</Label>
							</div>
							<div className="flex items-center space-x-2">
								<Checkbox
									id="include-empty-alt"
									checked={includeEmptyAlt}
									onCheckedChange={(checked) =>
										setIncludeEmptyAlt(checked === true)
									}
								/>
								<Label
									htmlFor="include-empty-alt"
									className="text-sm font-normal cursor-pointer"
								>
									Empty Alt Text (Review Needed)
								</Label>
							</div>
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
									Has Alt Text (Optional - for
									review/improvement)
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
									Choose which images you want to fix (missing
									alt, empty alt, or all images)
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
									add or improve alt text
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
