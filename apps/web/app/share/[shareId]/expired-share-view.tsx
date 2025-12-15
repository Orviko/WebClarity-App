"use client";

import { Button } from "@ui/components/button";
import { Alert, AlertDescription, AlertTitle } from "@ui/components/alert";
import { AlertCircleIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { RenewShareDialog } from "@saas/shares/components/RenewShareDialog";
import { useState } from "react";
// Simple date formatting without date-fns dependency
function formatDate(date: Date): string {
	return new Intl.DateTimeFormat("en-US", {
		year: "numeric",
		month: "long",
		day: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	}).format(date);
}

interface ExpiredShareViewProps {
	shareId: string;
	shareDetails: {
		isExpired: boolean;
		expiresAt: Date;
		organizationId: string | null;
		canManage: boolean;
		title: string | null;
		websiteUrl: string;
	};
}

export function ExpiredShareView({ shareId, shareDetails }: ExpiredShareViewProps) {
	const t = useTranslations();
	const [isRenewOpen, setIsRenewOpen] = useState(false);

	return (
		<>
			<div className="container mx-auto py-12 px-4 max-w-2xl">
				<Alert variant="error">
					<AlertCircleIcon className="h-4 w-4" />
					<AlertTitle>{t("shares.expired")}</AlertTitle>
					<AlertDescription className="mt-4">
						<p className="mb-4">
							{t("shares.expiredMessage", {
								date: formatDate(new Date(shareDetails.expiresAt)),
							})}
						</p>
						{shareDetails.canManage && shareDetails.organizationId ? (
							<div className="mt-4">
								<Button onClick={() => setIsRenewOpen(true)}>
									{t("shares.renew")}
								</Button>
								<p className="text-sm text-muted-foreground mt-2">
									{t("shares.renewDescription")}
								</p>
							</div>
						) : (
							<p className="text-sm text-muted-foreground">
								{t("shares.expiredAction")}
							</p>
						)}
					</AlertDescription>
				</Alert>
			</div>

			{shareDetails.canManage && (
				<RenewShareDialog
					open={isRenewOpen}
					onOpenChange={setIsRenewOpen}
					shareId={shareId}
					shareTitle={shareDetails.title || shareDetails.websiteUrl}
					onSuccess={() => {
						// Reload page after renewal
						window.location.reload();
					}}
				/>
			)}
		</>
	);
}

