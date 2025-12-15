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

interface RenewShareDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	shareId: string;
	shareTitle: string;
	onSuccess?: () => void;
}

export function RenewShareDialog({
	open,
	onOpenChange,
	shareId,
	shareTitle,
	onSuccess,
}: RenewShareDialogProps) {
	const t = useTranslations();
	const queryClient = useQueryClient();

	const mutation = useMutation({
		mutationFn: () => sharesApi.renewShare(shareId),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["shares"] });
			onSuccess?.();
			onOpenChange(false);
		},
	});

	const handleRenew = () => {
		mutation.mutate();
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>{t("shares.renew")}</DialogTitle>
					<DialogDescription>
						{t("shares.renewDescription")}
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
						onClick={handleRenew}
						loading={mutation.isPending}
					>
						{t("shares.renew")}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

