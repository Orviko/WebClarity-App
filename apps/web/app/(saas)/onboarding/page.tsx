import { config } from "@repo/config";
import { getOrganizationList, getSession } from "@saas/auth/lib/server";
import { OnboardingForm } from "@saas/onboarding/components/OnboardingForm";
import { AuthWrapper } from "@saas/shared/components/AuthWrapper";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function generateMetadata() {
	const t = await getTranslations();

	return {
		title: t("onboarding.title"),
	};
}

export default async function OnboardingPage() {
	const session = await getSession();

	if (!session) {
		redirect("/auth/login");
	}

	// Check if onboarding is enabled
	if (!config.users.enableOnboarding) {
		redirect("/app");
	}

	// If user completed onboarding AND has at least one workspace, redirect to app
	if (session.user.onboardingComplete) {
		const organizations = await getOrganizationList();

		// Only redirect if user has workspaces (prevents redirect loop)
		if (organizations.length > 0) {
			redirect("/app");
		}
		// If onboardingComplete is true but no workspaces, allow them to create one
	}

	return (
		<AuthWrapper>
			<OnboardingForm />
		</AuthWrapper>
	);
}
