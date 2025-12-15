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
import { useTranslations } from "next-intl";
import { sharesApi } from "../lib/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface DeleteShareDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	shareId: string;
	shareTitle: string;
	onSuccess?: () => void;
}

export function DeleteShareDialog({
	open,
	onOpenChange,
	shareId,
	shareTitle,
	onSuccess,
}: DeleteShareDialogProps) {
	const t = useTranslations();
	const queryClient = useQueryClient();

	const mutation = useMutation({
		mutationFn: () => sharesApi.deleteShare(shareId),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["shares"] });
			onSuccess?.();
			onOpenChange(false);
		},
	});

	const handleDelete = () => {
		mutation.mutate();
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>{t("shares.delete")}</DialogTitle>
					<DialogDescription>
						{t("shares.confirmDelete", { title: shareTitle })}
					</DialogDescription>
				</DialogHeader>
				<DialogFooter>
					<Button
						type="button"
						variant="outline"
						onClick={() => onOpenChange(false)}
					>
						{t("common.cancel")}
					</Button>
					<Button
						type="button"
						variant="destructive"
						onClick={handleDelete}
						loading={mutation.isPending}
					>
						{t("common.delete")}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

