"use client";

import { useSession } from "@saas/auth/hooks/use-session";
import { authClient } from "@repo/auth/client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function RootPage() {
	const { user, loaded } = useSession();
	const router = useRouter();
	const [isRedirecting, setIsRedirecting] = useState(false);

	useEffect(() => {
		if (!loaded || isRedirecting) return;

		if (!user) {
			setIsRedirecting(true);
			router.replace("/auth/login");
			return;
		}

		// User is logged in, fetch organizations
		const redirectToWorkspace = async () => {
			try {
				setIsRedirecting(true);
				const { data: organizations, error } =
					await authClient.organization.list();

				if (error) {
					console.error("Failed to fetch organizations:", error);
					router.replace("/onboarding");
					return;
				}

				const firstOrg = organizations[0];

				if (firstOrg) {
					router.replace(`/${firstOrg.slug}`);
				} else {
					router.replace("/onboarding");
				}
			} catch (error) {
				console.error("Failed to fetch organizations:", error);
				router.replace("/onboarding");
			}
		};

		redirectToWorkspace();
	}, [user, loaded, router, isRedirecting]);

	return (
		<div className="flex min-h-screen items-center justify-center">
			<div className="text-center">
				<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
				<p className="mt-4 text-muted-foreground">Loading...</p>
			</div>
		</div>
	);
}
