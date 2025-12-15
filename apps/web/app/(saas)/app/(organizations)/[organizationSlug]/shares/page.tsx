import { getActiveOrganization } from "@saas/auth/lib/server";
import { PageHeader } from "@saas/shared/components/PageHeader";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { SharesList } from "@saas/shares/components/SharesList";

export async function generateMetadata({
	params,
}: {
	params: Promise<{ organizationSlug: string }>;
}) {
	const { organizationSlug } = await params;
	const t = await getTranslations();

	const activeOrganization = await getActiveOrganization(
		organizationSlug as string,
	);

	return {
		title: `${t("shares.title")} - ${activeOrganization?.name}`,
	};
}

export default async function SharesPage({
	params,
}: {
	params: Promise<{ organizationSlug: string }>;
}) {
	const { organizationSlug } = await params;
	const t = await getTranslations();

	const activeOrganization = await getActiveOrganization(
		organizationSlug as string,
	);

	if (!activeOrganization) {
		redirect("/app");
	}

	return (
		<div>
			<PageHeader
				title={t("shares.title")}
				subtitle={t("shares.description")}
			/>

			<SharesList organizationId={activeOrganization.id} />
		</div>
	);
}
