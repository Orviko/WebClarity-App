import { Document } from "@shared/components/Document";
import { getLocale } from "next-intl/server";
import type { PropsWithChildren } from "react";

/**
 * Layout for public share pages
 * Provides HTML structure without requiring authentication
 */
export default async function ShareLayout({ children }: PropsWithChildren) {
	const locale = await getLocale();

	return <Document locale={locale}>{children}</Document>;
}
