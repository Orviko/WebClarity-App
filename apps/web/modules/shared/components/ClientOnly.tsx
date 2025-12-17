"use client";

import { useEffect, useState, type PropsWithChildren } from "react";

/**
 * ClientOnly component that only renders its children on the client side.
 * This prevents hydration mismatches for components that generate dynamic IDs
 * or rely on browser-only APIs.
 *
 * @example
 * ```tsx
 * <ClientOnly>
 *   <ComponentWithRadixUI />
 * </ClientOnly>
 * ```
 */
export function ClientOnly({ children }: PropsWithChildren) {
	const [hasMounted, setHasMounted] = useState(false);

	useEffect(() => {
		setHasMounted(true);
	}, []);

	if (!hasMounted) {
		return null;
	}

	return <>{children}</>;
}
