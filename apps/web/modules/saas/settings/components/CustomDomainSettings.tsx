"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { domainConfig } from "@repo/config/domains";
import { useActiveOrganization } from "@saas/organizations/hooks/use-active-organization";
import { SettingsItem } from "@saas/shared/components/SettingsItem";
import { orpc } from "@shared/lib/orpc-query-utils";
import { Button } from "@ui/components/button";
import { Input } from "@ui/components/input";
import { Switch } from "@ui/components/switch";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import {
	AlertCircleIcon,
	CheckCircle2Icon,
	CopyIcon,
	ExternalLinkIcon,
	Loader2Icon,
	Trash2Icon,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";

const domainSchema = z.object({
	domain: z
		.string()
		.min(1, "Domain is required")
		.regex(
			/^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/,
			"Invalid domain format",
		)
		.refine(
			(domain) =>
				!domain.startsWith("http://") && !domain.startsWith("https://"),
			"Domain should not include protocol",
		),
});

type DomainFormValues = z.infer<typeof domainSchema>;

interface CustomDomainSettingsProps {
	organization: {
		id: string;
		customDomain: string | null;
		customDomainEnabled: boolean;
	};
	hasAccess: boolean;
}

export function CustomDomainSettings({
	organization,
	hasAccess,
}: CustomDomainSettingsProps) {
	const t = useTranslations();
	const queryClient = useQueryClient();
	const { activeOrganization } = useActiveOrganization();
	const [copied, setCopied] = useState(false);

	// Fetch domain status
	const { data: domainStatus, isLoading: isLoadingStatus } = useQuery(
		orpc.domains.getCustomDomainStatus.queryOptions({
			input: {
				organizationId: organization.id,
			},
		}),
	);

	const form = useForm<DomainFormValues>({
		resolver: zodResolver(domainSchema),
		defaultValues: {
			domain: organization.customDomain || "",
		},
	});

	const connectDomainMutation = useMutation(
		orpc.domains.connectCustomDomain.mutationOptions(),
	);
	const removeDomainMutation = useMutation(
		orpc.domains.removeCustomDomain.mutationOptions(),
	);
	const toggleDomainMutation = useMutation(
		orpc.domains.toggleCustomDomain.mutationOptions(),
	);
	const verifyDomainMutation = useMutation(
		orpc.domains.verifyCustomDomain.mutationOptions(),
	);

	const onSubmit = form.handleSubmit(async ({ domain }) => {
		if (!hasAccess) {
			toast.error("Custom domain requires Pro, Lifetime, or Enterprise plan");
			return;
		}

		try {
			await connectDomainMutation.mutateAsync({
				organizationId: organization.id,
				domain,
			});

		toast.success("Domain connected successfully");
		queryClient.invalidateQueries({
			queryKey: orpc.domains.getCustomDomainStatus.key({
				input: {
					organizationId: organization.id,
				},
			}),
		});
		form.reset({ domain });
		} catch (error: any) {
			toast.error(error?.message || "Failed to connect domain");
		}
	});

	const handleRemoveDomain = async () => {
		if (!confirm("Are you sure you want to remove this domain?")) {
			return;
		}

		try {
			await removeDomainMutation.mutateAsync({
				organizationId: organization.id,
			});

		toast.success("Domain removed successfully");
		queryClient.invalidateQueries({
			queryKey: orpc.domains.getCustomDomainStatus.key({
				input: {
					organizationId: organization.id,
				},
			}),
		});
		form.reset({ domain: "" });
		} catch (error: any) {
			toast.error(error?.message || "Failed to remove domain");
		}
	};

	const handleToggleDomain = async (enabled: boolean) => {
		try {
			await toggleDomainMutation.mutateAsync({
				organizationId: organization.id,
				enabled,
			});

		toast.success(
			enabled ? "Domain enabled successfully" : "Domain disabled successfully",
		);
		queryClient.invalidateQueries({
			queryKey: orpc.domains.getCustomDomainStatus.key({
				input: {
					organizationId: organization.id,
				},
			}),
		});
		} catch (error: any) {
			toast.error(error?.message || "Failed to toggle domain");
		}
	};

	const handleVerifyDomain = async () => {
		try {
			await verifyDomainMutation.mutateAsync({
				organizationId: organization.id,
			});

		toast.success("Domain verified successfully");
		queryClient.invalidateQueries({
			queryKey: orpc.domains.getCustomDomainStatus.key({
				input: {
					organizationId: organization.id,
				},
			}),
		});
		} catch (error: any) {
			toast.error(error?.message || "Failed to verify domain");
		}
	};

	const copyCnameTarget = () => {
		navigator.clipboard.writeText(domainConfig.cnameTarget);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
		toast.success("CNAME target copied to clipboard");
	};

	if (!hasAccess) {
		return (
			<SettingsItem
				title="Custom Domain"
				description="Connect your own domain to access shares via your domain"
			>
				<div className="space-y-4">
					<div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4">
						<p className="text-sm text-foreground/80">
							Custom domain is available for Pro, Lifetime, and Enterprise
							plans.
						</p>
						<Link href={`/${activeOrganization?.slug}/settings/billing`}>
							<Button variant="outline" size="sm" className="mt-2">
								Upgrade Plan
							</Button>
						</Link>
					</div>
				</div>
			</SettingsItem>
		);
	}

	const hasDomain = !!domainStatus?.domain;
	const isVerified = domainStatus?.verified ?? false;
	const isEnabled = domainStatus?.enabled ?? false;

	return (
		<SettingsItem
			title="Custom Domain"
			description="Connect your own domain to access shares via your domain"
		>
			<div className="space-y-6">
				{!hasDomain ? (
					<form onSubmit={onSubmit} className="space-y-4">
						<div>
							<label className="mb-2 block text-sm font-medium">
								Domain
							</label>
							<Input
								{...form.register("domain")}
								placeholder="app.example.com"
								disabled={connectDomainMutation.isPending}
							/>
							{form.formState.errors.domain && (
								<p className="mt-1 text-sm text-destructive">
									{form.formState.errors.domain.message}
								</p>
							)}
						</div>

						<div className="rounded-lg border bg-muted/50 p-4">
							<h4 className="mb-2 text-sm font-medium">
								DNS Configuration
							</h4>
							<p className="mb-3 text-sm text-foreground/70">
								Add a CNAME record pointing to:
							</p>
							<div className="flex items-center gap-2">
								<code className="flex-1 rounded bg-background px-3 py-2 text-sm">
									{domainConfig.cnameTarget}
								</code>
								<Button
									type="button"
									variant="outline"
									size="sm"
									onClick={copyCnameTarget}
								>
									<CopyIcon className="size-4" />
								</Button>
							</div>
						</div>

						<Button
							type="submit"
							disabled={connectDomainMutation.isPending}
							loading={connectDomainMutation.isPending}
						>
							Connect Domain
						</Button>
					</form>
				) : (
					<div className="space-y-4">
						<div className="flex items-center justify-between rounded-lg border bg-muted/50 p-4">
							<div>
								<div className="flex items-center gap-2">
									<span className="font-medium">{domainStatus.domain}</span>
									{isVerified ? (
										<CheckCircle2Icon className="size-4 text-green-500" />
									) : (
										<AlertCircleIcon className="size-4 text-yellow-500" />
									)}
								</div>
								<p className="mt-1 text-sm text-foreground/60">
									{isVerified
										? "Domain is verified and configured"
										: "Domain needs verification"}
								</p>
							</div>
						</div>

						{!isVerified && (
							<div className="rounded-lg border border-yellow-500/20 bg-yellow-500/5 p-4">
								<div className="mb-3 flex items-start gap-2">
									<AlertCircleIcon className="mt-0.5 size-4 text-yellow-500" />
									<div className="flex-1">
										<h4 className="text-sm font-medium">
											Verification Required
										</h4>
										<p className="mt-1 text-sm text-foreground/70">
											Make sure your CNAME record is configured correctly:
										</p>
									</div>
								</div>
								<div className="mb-3 flex items-center gap-2">
									<code className="flex-1 rounded bg-background px-3 py-2 text-sm">
										{domainConfig.cnameTarget}
									</code>
									<Button
										type="button"
										variant="outline"
										size="sm"
										onClick={copyCnameTarget}
									>
										<CopyIcon className="size-4" />
									</Button>
								</div>
								<Button
									variant="outline"
									size="sm"
									onClick={handleVerifyDomain}
									disabled={verifyDomainMutation.isPending}
									loading={verifyDomainMutation.isPending}
								>
									Verify Domain
								</Button>
							</div>
						)}

						{isVerified && (
							<div className="flex items-center justify-between rounded-lg border p-4">
								<div>
									<label className="text-sm font-medium">
										Enable Custom Domain
									</label>
									<p className="mt-1 text-sm text-foreground/60">
										Redirect shares to your custom domain
									</p>
								</div>
								<Switch
									checked={isEnabled}
									onCheckedChange={handleToggleDomain}
									disabled={toggleDomainMutation.isPending}
								/>
							</div>
						)}

						<div className="flex gap-2">
							<Button
								variant="destructive"
								size="sm"
								onClick={handleRemoveDomain}
								disabled={removeDomainMutation.isPending}
								loading={removeDomainMutation.isPending}
							>
								<Trash2Icon className="mr-2 size-4" />
								Remove Domain
							</Button>
						</div>
					</div>
				)}
			</div>
		</SettingsItem>
	);
}

