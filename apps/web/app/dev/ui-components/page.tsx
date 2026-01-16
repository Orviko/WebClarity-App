"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@ui/components/skeleton";

// Dynamically import the UI components page with SSR disabled
// This prevents hydration mismatches caused by browser extensions
// (e.g., password managers like NordPass) that inject attributes
// into input fields after server rendering
const UIComponentsContent = dynamic(() => import("./UIComponentsContent"), {
	ssr: false,
	loading: () => (
		<div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-8">
			<div className="max-w-7xl mx-auto space-y-8">
				{/* Header skeleton */}
				<div className="space-y-4">
					<div className="flex items-center gap-3">
						<Skeleton className="h-10 w-10 rounded-xl" />
						<div className="space-y-2">
							<Skeleton className="h-6 w-48" />
							<Skeleton className="h-4 w-64" />
						</div>
					</div>
					<div className="flex gap-2">
						{Array.from({ length: 7 }).map((_, i) => (
							<Skeleton
								key={i}
								className="h-10 w-24 rounded-lg"
							/>
						))}
					</div>
				</div>

				{/* Content skeleton */}
				<div className="space-y-6">
					{Array.from({ length: 3 }).map((_, i) => (
						<div
							key={i}
							className="border rounded-2xl p-6 space-y-4"
						>
							<Skeleton className="h-6 w-32" />
							<Skeleton className="h-4 w-64" />
							<div className="flex gap-3">
								{Array.from({ length: 4 }).map((_, j) => (
									<Skeleton
										key={j}
										className="h-10 w-24 rounded-md"
									/>
								))}
							</div>
						</div>
					))}
				</div>
			</div>
		</div>
	),
});

export default function DevUIComponentsPage() {
	return <UIComponentsContent />;
}
