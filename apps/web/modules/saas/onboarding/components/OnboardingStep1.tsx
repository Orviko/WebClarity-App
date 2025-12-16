"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { authClient } from "@repo/auth/client";
import { useSession } from "@saas/auth/hooks/use-session";
import { useCreateOrganizationMutation } from "@saas/organizations/lib/api";
import { useActiveOrganization } from "@saas/organizations/hooks/use-active-organization";
import { UserAvatarUpload } from "@saas/settings/components/UserAvatarUpload";
import { Button } from "@ui/components/button";
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
} from "@ui/components/form";
import { Input } from "@ui/components/input";
import { ArrowRightIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect } from "react";
import type { SubmitHandler } from "react-hook-form";
import { useForm } from "react-hook-form";
import { z } from "zod";

const formSchema = z.object({
	workspaceName: z.string().min(3).max(32),
	name: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function OnboardingStep1({ onCompleted }: { onCompleted: () => void }) {
	const t = useTranslations();
	const { user } = useSession();
	const { setActiveOrganization } = useActiveOrganization();
	const createOrganizationMutation = useCreateOrganizationMutation();
	const form = useForm<FormValues>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			workspaceName: "",
			name: user?.name ?? "",
		},
	});

	useEffect(() => {
		if (user) {
			form.setValue("name", user.name ?? "");
		}
	}, [user]);

	const onSubmit: SubmitHandler<FormValues> = async ({
		workspaceName,
		name,
	}) => {
		form.clearErrors("root");

		try {
			// Update user name if provided
			if (name && name !== user?.name) {
				await authClient.updateUser({
					name,
				});
			}

			// Create workspace
			const newOrganization =
				await createOrganizationMutation.mutateAsync({
					name: workspaceName,
				});

			if (!newOrganization) {
				throw new Error("Failed to create workspace");
			}

			// Set as active workspace
			await setActiveOrganization(newOrganization.slug);

			// Mark onboarding complete
			await authClient.updateUser({
				onboardingComplete: true,
			});

			onCompleted();
		} catch {
			form.setError("root", {
				type: "server",
				message: t("onboarding.notifications.accountSetupFailed"),
			});
		}
	};

	return (
		<div>
			<Form {...form}>
				<form
					className="flex flex-col items-stretch gap-8"
					onSubmit={form.handleSubmit(onSubmit)}
				>
					<FormField
						control={form.control}
						name="workspaceName"
						render={({ field }) => (
							<FormItem>
								<FormLabel>
									{t("onboarding.workspaceName")}
								</FormLabel>
								<FormControl>
									<Input
										{...field}
										placeholder={t(
											"onboarding.workspaceNamePlaceholder",
										)}
									/>
								</FormControl>
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="name"
						render={({ field }) => (
							<FormItem>
								<FormLabel>
									{t("onboarding.account.name")}
								</FormLabel>
								<FormControl>
									<Input {...field} />
								</FormControl>
							</FormItem>
						)}
					/>

					<FormItem className="flex items-center justify-between gap-4">
						<div>
							<FormLabel>
								{t("onboarding.account.avatar")}
							</FormLabel>

							<FormDescription>
								{t("onboarding.account.avatarDescription")}
							</FormDescription>
						</div>
						<FormControl>
							<UserAvatarUpload
								onSuccess={() => {
									return;
								}}
								onError={() => {
									return;
								}}
							/>
						</FormControl>
					</FormItem>

					<Button
						type="submit"
						loading={
							form.formState.isSubmitting ||
							createOrganizationMutation.isPending
						}
					>
						{t("onboarding.continue")}
						<ArrowRightIcon className="ml-2 size-4" />
					</Button>
				</form>
			</Form>
		</div>
	);
}
