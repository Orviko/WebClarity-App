"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@ui/components/dialog";
import {
	Command,
	CommandInput,
	CommandList,
	CommandEmpty,
	CommandGroup,
	CommandItem,
} from "@ui/components/command";
import { ArrowRightIcon } from "lucide-react";
import { cn } from "@ui/lib";

interface SearchModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function SearchModal({ open, onOpenChange }: SearchModalProps) {
	const t = useTranslations();

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogHeader className="sr-only">
				<DialogTitle>Search documentation...</DialogTitle>
				<DialogDescription>
					Search for a command to run...
				</DialogDescription>
			</DialogHeader>
			<DialogContent
				className={cn(
					"overflow-hidden p-2 max-w-2xl sm:max-w-lg [&>button]:hidden",
				)}
			>
				<Command className="[&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group]]:px-1 [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-input-wrapper]_svg]:h-4 [&_[cmdk-input-wrapper]_svg]:w-4 [&_[cmdk-item]]:px-3 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5">
					<CommandInput placeholder="Search documentation..." />
					<CommandList>
						<CommandEmpty>No results found.</CommandEmpty>
						<CommandGroup heading="Pages">
							<CommandItem>
								<ArrowRightIcon className="size-4" />
								<span>Docs</span>
							</CommandItem>
							<CommandItem>
								<ArrowRightIcon className="size-4" />
								<span>Components</span>
							</CommandItem>
							<CommandItem>
								<ArrowRightIcon className="size-4" />
								<span>Blocks</span>
							</CommandItem>
							<CommandItem>
								<ArrowRightIcon className="size-4" />
								<span>Charts</span>
							</CommandItem>
							<CommandItem>
								<ArrowRightIcon className="size-4" />
								<span>Directory</span>
							</CommandItem>
							<CommandItem>
								<ArrowRightIcon className="size-4" />
								<span>Create</span>
							</CommandItem>
						</CommandGroup>
						<CommandGroup heading="Get Started">
							<CommandItem>
								<ArrowRightIcon className="size-4" />
								<span>Introduction</span>
							</CommandItem>
						</CommandGroup>
					</CommandList>
				</Command>
			</DialogContent>
		</Dialog>
	);
}
