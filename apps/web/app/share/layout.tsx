import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import type { PropsWithChildren } from "react";

/**
 * Layout for public share pages
 * Provides i18n context without requiring authentication
 * Note: Does not need Document wrapper as it inherits from root layout
 */
export default async function ShareLayout({ children }: PropsWithChildren) {
	const locale = await getLocale();
	const messages = await getMessages();

	return (
		<NextIntlClientProvider messages={messages}>
			{children}
		</NextIntlClientProvider>
	);
}
