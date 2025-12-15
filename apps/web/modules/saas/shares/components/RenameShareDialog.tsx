"use client";

import { Button } from "@ui/components/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@ui/components/dialog";
import { Input } from "@ui/components/input";
import { Label } from "@ui/components/label";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { sharesApi } from "../lib/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface RenameShareDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	shareId: string;
	currentTitle: string;
	onSuccess?: () => void;
}

export function RenameShareDialog({
	open,
	onOpenChange,
	shareId,
	currentTitle,
	onSuccess,
}: RenameShareDialogProps) {
	const t = useTranslations();
	const queryClient = useQueryClient();
	const [title, setTitle] = useState(currentTitle);

	const mutation = useMutation({
		mutationFn: (newTitle: string) => sharesApi.updateShareTitle(shareId, newTitle),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["shares"] });
			onSuccess?.();
			onOpenChange(false);
		},
	});

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (title.trim()) {
			mutation.mutate(title.trim());
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<form onSubmit={handleSubmit}>
					<DialogHeader>
						<DialogTitle>{t("shares.rename")}</DialogTitle>
						<DialogDescription>{t("shares.renameDescription")}</DialogDescription>
					</DialogHeader>
					<div className="py-4">
						<Label htmlFor="title">{t("shares.title")}</Label>
						<Input
							id="title"
							value={title}
							onChange={(e) => setTitle(e.target.value)}
							placeholder={t("shares.titlePlaceholder")}
							className="mt-2"
							maxLength={200}
							required
						/>
					</div>
					<DialogFooter>
						<Button
							type="button"
							variant="outline"
							onClick={() => onOpenChange(false)}
						>
							{t("common.cancel")}
						</Button>
						<Button type="submit" loading={mutation.isPending}>
							{t("common.save")}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}

