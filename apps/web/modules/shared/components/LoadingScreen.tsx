import { Spinner } from "@shared/components/Spinner";
import { cn } from "@ui/lib";

interface LoadingScreenProps {
	/**
	 * Optional message to display below the spinner
	 */
	message?: string;
	/**
	 * Size of the spinner (Tailwind size classes)
	 * @default "size-8"
	 */
	spinnerSize?: string;
	/**
	 * Additional className for the container
	 */
	className?: string;
	/**
	 * Whether to take full screen height
	 * @default true
	 */
	fullScreen?: boolean;
}

export function LoadingScreen({
	message,
	spinnerSize = "size-8",
	className,
	fullScreen = true,
}: LoadingScreenProps) {
	return (
		<div
			className={cn(
				"w-full flex flex-col items-center justify-center bg-background",
				fullScreen ? "h-screen" : "h-full min-h-[400px]",
				className,
			)}
		>
			<div className="flex flex-col items-center gap-3">
				<Spinner className={spinnerSize} />
				{message && (
					<p className="text-sm text-muted-foreground animate-pulse">
						{message}
					</p>
				)}
			</div>
		</div>
	);
}
