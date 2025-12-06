import { auth } from "@repo/auth";
import { redirect } from "next/navigation";

export default async function RootPage() {
	const session = await auth.api.getSession({
		headers: await Promise.resolve(new Headers()),
	});

	if (session) {
		redirect("/app");
	}

	redirect("/auth/login");
}

