"use client";

import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@ui/components/dialog";
import { Button } from "@ui/components/button";
import { Input } from "@ui/components/input";
import { Label } from "@ui/components/label";
import { useTranslations } from "next-intl";
import { useState, useEffect } from "react";

interface CreateProjectDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function CreateProjectDialog({
	open,
	onOpenChange,
}: CreateProjectDialogProps) {
	const t = useTranslations();
	const [projectName, setProjectName] = useState("");
	const [hasMounted, setHasMounted] = useState(false);

	// Only render Dialog after mount to prevent hydration mismatch
	useEffect(() => {
		setHasMounted(true);
	}, []);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		// TODO: Implement project creation logic
		console.log("Creating project:", projectName);
		setProjectName("");
		onOpenChange(false);
	};

	// Don't render Dialog until mounted to prevent hydration mismatch
	if (!hasMounted) {
		return null;
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>{t("app.menu.createProject")}</DialogTitle>
					<DialogDescription>
						Create a new project to organize your work.
					</DialogDescription>
				</DialogHeader>
				<form onSubmit={handleSubmit}>
					<div className="grid gap-4 py-4">
						<div className="grid gap-2">
							<Label htmlFor="project-name">Project Name</Label>
							<Input
								id="project-name"
								value={projectName}
								onChange={(e) => setProjectName(e.target.value)}
								placeholder="Enter project name"
								required
							/>
						</div>
					</div>
					<DialogFooter>
						<Button
							type="button"
							variant="outline"
							onClick={() => onOpenChange(false)}
						>
							Cancel
						</Button>
						<Button type="submit">Create</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
