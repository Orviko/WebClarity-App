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
	generateHeadingStructurePlatformPrompt,
	generateHeadingStructureIDEPrompt,
	type HeadingStructurePromptContext,
} from "../../../../lib/prompts/heading-structure";

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

interface AIFixModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	tree: HeadingNode[];
	totalHeadings: number;
	h1Count: number;
	pageUrl: string;
}

export function AIFixModal({
	open,
	onOpenChange,
	tree,
	totalHeadings,
	h1Count,
	pageUrl,
}: AIFixModalProps) {
	const t = useTranslations();
	const [includeEmpty, setIncludeEmpty] = useState(true);
	const [includeShort, setIncludeShort] = useState(true);
	const [includeLong, setIncludeLong] = useState(true);
	const [includeSkip, setIncludeSkip] = useState(true);
	const [includeOrphan, setIncludeOrphan] = useState(true);
	const [includeMultipleH1, setIncludeMultipleH1] = useState(true);

	const handleCopyPrompt = async (promptType: "platform" | "ide") => {
		try {
			const context: HeadingStructurePromptContext = {
				pageUrl,
				tree,
				totalHeadings,
				h1Count,
				includeEmpty,
				includeShort,
				includeLong,
				includeSkip,
				includeOrphan,
				includeMultipleH1,
			};

			const prompt =
				promptType === "ide"
					? generateHeadingStructureIDEPrompt(context)
					: generateHeadingStructurePlatformPrompt(context);

			await navigator.clipboard.writeText(prompt);

			const successKey =
				promptType === "ide"
					? "share.headingStructure.aifix.promptCopiedIDE"
					: "share.headingStructure.aifix.promptCopied";

			// Close dialog first, then show toast to avoid duplicate
			onOpenChange(false);

			// Small delay to ensure clean state transition
			setTimeout(() => {
				toast.success(t(successKey));
			}, 100);
		} catch (error) {
			console.error("Failed to copy prompt:", error);
			toast.error(t("share.headingStructure.aifix.failed"));
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>
						{t("share.headingStructure.aifix.title")}
					</DialogTitle>
					<DialogDescription>
						{t("share.headingStructure.aifix.description")}
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-6 mt-4">
					{/* Fix Options Section */}
					<div>
						<h4 className="text-sm font-semibold mb-3">
							{t("share.headingStructure.aifix.fixOptions")}
						</h4>
						<div className="space-y-3">
							{/* Critical Issues */}
							<div className="space-y-2">
								<div className="flex items-center space-x-2">
									<Checkbox
										id="include-empty"
										checked={includeEmpty}
										onCheckedChange={(checked) =>
											setIncludeEmpty(checked === true)
										}
									/>
									<Label
										htmlFor="include-empty"
										className="text-sm font-normal cursor-pointer"
									>
										{t(
											"share.headingStructure.aifix.includeEmpty",
										)}
									</Label>
								</div>
								<div className="flex items-center space-x-2">
									<Checkbox
										id="include-skip"
										checked={includeSkip}
										onCheckedChange={(checked) =>
											setIncludeSkip(checked === true)
										}
									/>
									<Label
										htmlFor="include-skip"
										className="text-sm font-normal cursor-pointer"
									>
										{t(
											"share.headingStructure.aifix.includeSkip",
										)}
									</Label>
								</div>
								<div className="flex items-center space-x-2">
									<Checkbox
										id="include-multiple-h1"
										checked={includeMultipleH1}
										onCheckedChange={(checked) =>
											setIncludeMultipleH1(
												checked === true,
											)
										}
									/>
									<Label
										htmlFor="include-multiple-h1"
										className="text-sm font-normal cursor-pointer"
									>
										{t(
											"share.headingStructure.aifix.includeMultipleH1",
										)}
									</Label>
								</div>
							</div>

							{/* Warning Issues */}
							<div className="space-y-2 pt-2 border-t">
								<div className="flex items-center space-x-2">
									<Checkbox
										id="include-short"
										checked={includeShort}
										onCheckedChange={(checked) =>
											setIncludeShort(checked === true)
										}
									/>
									<Label
										htmlFor="include-short"
										className="text-sm font-normal cursor-pointer"
									>
										{t(
											"share.headingStructure.aifix.includeShort",
										)}
									</Label>
								</div>
								<div className="flex items-center space-x-2">
									<Checkbox
										id="include-long"
										checked={includeLong}
										onCheckedChange={(checked) =>
											setIncludeLong(checked === true)
										}
									/>
									<Label
										htmlFor="include-long"
										className="text-sm font-normal cursor-pointer"
									>
										{t(
											"share.headingStructure.aifix.includeLong",
										)}
									</Label>
								</div>
								<div className="flex items-center space-x-2">
									<Checkbox
										id="include-orphan"
										checked={includeOrphan}
										onCheckedChange={(checked) =>
											setIncludeOrphan(checked === true)
										}
									/>
									<Label
										htmlFor="include-orphan"
										className="text-sm font-normal cursor-pointer"
									>
										{t(
											"share.headingStructure.aifix.includeOrphan",
										)}
									</Label>
								</div>
							</div>
						</div>
					</div>

					{/* How it works Section */}
					<div>
						<h4 className="text-sm font-semibold mb-3">
							{t("share.headingStructure.aifix.howItWorks")}
						</h4>
						<div className="space-y-3">
							<div className="flex items-start gap-3">
								<div className="flex items-center justify-center min-w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-semibold shrink-0">
									1
								</div>
								<p className="text-sm text-muted-foreground">
									{t("share.headingStructure.aifix.step1")}
								</p>
							</div>
							<div className="flex items-start gap-3">
								<div className="flex items-center justify-center min-w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-semibold shrink-0">
									2
								</div>
								<p className="text-sm text-muted-foreground">
									{t("share.headingStructure.aifix.step2")}
								</p>
							</div>
							<div className="flex items-start gap-3">
								<div className="flex items-center justify-center min-w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-semibold shrink-0">
									3
								</div>
								<p className="text-sm text-muted-foreground">
									{t("share.headingStructure.aifix.step3")}
								</p>
							</div>
							<div className="flex items-start gap-3">
								<div className="flex items-center justify-center min-w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-semibold shrink-0">
									4
								</div>
								<p className="text-sm text-muted-foreground">
									{t("share.headingStructure.aifix.step4")}
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
						{t("share.headingStructure.aifix.copy")}
					</Button>
					<Button
						onClick={() => handleCopyPrompt("ide")}
						variant="outline"
						className="flex-1"
					>
						<CopyIcon className="size-4 mr-2" />
						{t("share.headingStructure.aifix.copyForIDE")}
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
}
