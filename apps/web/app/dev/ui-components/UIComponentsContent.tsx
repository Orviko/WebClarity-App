"use client";

// This component is imported dynamically with SSR disabled to avoid
// hydration mismatches caused by browser extensions (e.g., password managers)
// that inject attributes into input fields after server rendering.

import { useState } from "react";
import {
	AlertCircle,
	AlertTriangle,
	CheckCircle,
	ChevronDown,
	Copy,
	Info,
	Mail,
	Menu,
	Plus,
	Search,
	Settings,
	Star,
	Trash2,
	User,
	X,
} from "lucide-react";

// UI Components
import { Button } from "@ui/components/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@ui/components/card";
import { Input } from "@ui/components/input";
import { Badge } from "@ui/components/badge";
import { Label } from "@ui/components/label";
import { Separator } from "@ui/components/separator";
import { Skeleton } from "@ui/components/skeleton";
import { Switch } from "@ui/components/switch";
import { Textarea } from "@ui/components/textarea";
import { Progress } from "@ui/components/progress";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@ui/components/accordion";
import { Alert, AlertDescription, AlertTitle } from "@ui/components/alert";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@ui/components/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@ui/components/avatar";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@ui/components/dialog";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@ui/components/dropdown-menu";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@ui/components/select";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@ui/components/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@ui/components/tabs";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@ui/components/tooltip";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@ui/components/table";
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@ui/components/breadcrumb";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@ui/components/collapsible";
import { ShimmerButton } from "@ui/components/shimmer-button";
import { cn } from "@ui/lib";

function ComponentSection({
	title,
	description,
	children,
	id,
}: {
	title: string;
	description: string;
	children: React.ReactNode;
	id: string;
}) {
	return (
		<section id={id} className="scroll-mt-24">
			<Card className="overflow-hidden transition-all hover:shadow-lg">
				<CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 border-b">
					<CardTitle className="flex items-center gap-2 text-lg">
						<div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
						{title}
					</CardTitle>
					<CardDescription>{description}</CardDescription>
				</CardHeader>
				<CardContent className="p-6 space-y-6">{children}</CardContent>
			</Card>
		</section>
	);
}

function ComponentRow({
	label,
	children,
}: {
	label: string;
	children: React.ReactNode;
}) {
	return (
		<div className="space-y-2">
			<p className="text-sm font-medium text-muted-foreground">{label}</p>
			<div className="flex flex-wrap items-center gap-3">{children}</div>
		</div>
	);
}

const componentCategories = [
	{ id: "buttons", label: "Buttons" },
	{ id: "inputs", label: "Inputs & Forms" },
	{ id: "feedback", label: "Feedback" },
	{ id: "layout", label: "Layout" },
	{ id: "overlays", label: "Overlays & Dialogs" },
	{ id: "navigation", label: "Navigation" },
	{ id: "data", label: "Data Display" },
];

export default function UIComponentsPage() {
	const [switchValue, setSwitchValue] = useState(false);
	const [selectValue, setSelectValue] = useState("");
	const [isCollapsibleOpen, setIsCollapsibleOpen] = useState(false);
	const [activeCategory, setActiveCategory] = useState("buttons");

	return (
		<TooltipProvider>
			<div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
				{/* Header */}
				<header className="sticky top-0 z-50 backdrop-blur-xl bg-background/80 border-b">
					<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
						<div className="flex items-center justify-between">
							<div>
								<div className="flex items-center gap-3">
									<div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
										<svg
											className="h-5 w-5 text-primary-foreground"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"
											/>
										</svg>
									</div>
									<div>
										<h1 className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
											UI Components
										</h1>
										<p className="text-sm text-muted-foreground">
											Development Mode Only •{" "}
											{componentCategories.length}{" "}
											Categories • 30+ Components
										</p>
									</div>
								</div>
							</div>
							<Badge status="warning">DEV ONLY</Badge>
						</div>

						{/* Category Navigation */}
						<nav className="mt-4 flex flex-wrap gap-2">
							{componentCategories.map((category) => (
								<a
									key={category.id}
									href={`#${category.id}`}
									onClick={() =>
										setActiveCategory(category.id)
									}
									className={cn(
										"px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200",
										activeCategory === category.id
											? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
											: "bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground",
									)}
								>
									{category.label}
								</a>
							))}
						</nav>
					</div>
				</header>

				{/* Main Content */}
				<main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
					<div className="space-y-8">
						{/* Buttons Section */}
						<ComponentSection
							id="buttons"
							title="Buttons"
							description="Interactive button styles for actions and navigation."
						>
							<ComponentRow label="Variants">
								<Button variant="default">Default</Button>
								<Button variant="secondary">Secondary</Button>
								<Button variant="outline">Outline</Button>
								<Button variant="ghost">Ghost</Button>
								<Button variant="link">Link</Button>
								<Button variant="destructive">
									Destructive
								</Button>
							</ComponentRow>

							<ComponentRow label="Sizes">
								<Button size="sm">Small</Button>
								<Button size="default">Default</Button>
								<Button size="lg">Large</Button>
							</ComponentRow>

							<ComponentRow label="With Icons">
								<Button>
									<Plus className="h-4 w-4" />
									Add New
								</Button>
								<Button variant="outline">
									<Settings className="h-4 w-4" />
									Settings
								</Button>
								<Button variant="destructive">
									<Trash2 className="h-4 w-4" />
									Delete
								</Button>
							</ComponentRow>

							<ComponentRow label="States">
								<Button disabled>Disabled</Button>
								<Button loading>Loading</Button>
								<Button size="icon">
									<Star className="h-4 w-4" />
								</Button>
								<Button size="icon-sm" variant="outline">
									<X className="h-3 w-3" />
								</Button>
							</ComponentRow>

							<ComponentRow label="Shimmer Button (Animated Gradient Border)">
								<ShimmerButton>Get Started</ShimmerButton>
								<ShimmerButton>
									<Star className="h-4 w-4" />
									Upgrade to Pro
								</ShimmerButton>
								<ShimmerButton className="rounded-full">
									<Plus className="h-4 w-4" />
									Create New
								</ShimmerButton>
							</ComponentRow>
						</ComponentSection>

						{/* Inputs & Forms Section */}
						<ComponentSection
							id="inputs"
							title="Inputs & Forms"
							description="Form elements for collecting user input."
						>
							<ComponentRow label="Text Input">
								<Input
									placeholder="Enter your email..."
									type="email"
								/>
								<Input placeholder="Disabled input" disabled />
							</ComponentRow>

							<ComponentRow label="With Label">
								<div className="space-y-2 w-full max-w-sm">
									<Label htmlFor="name">Full Name</Label>
									<Input id="name" placeholder="John Doe" />
								</div>
							</ComponentRow>

							<ComponentRow label="Textarea">
								<Textarea
									placeholder="Write your message here..."
									className="w-full max-w-lg"
								/>
							</ComponentRow>

							<ComponentRow label="Select">
								<Select
									value={selectValue}
									onValueChange={setSelectValue}
								>
									<SelectTrigger className="w-[200px]">
										<SelectValue placeholder="Select a plan" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="free">
											Free
										</SelectItem>
										<SelectItem value="pro">Pro</SelectItem>
										<SelectItem value="enterprise">
											Enterprise
										</SelectItem>
									</SelectContent>
								</Select>
							</ComponentRow>

							<ComponentRow label="Switch">
								<div className="flex items-center gap-3">
									<Switch
										id="switch-demo"
										checked={switchValue}
										onCheckedChange={setSwitchValue}
									/>
									<Label htmlFor="switch-demo">
										{switchValue ? "Enabled" : "Disabled"}
									</Label>
								</div>
							</ComponentRow>
						</ComponentSection>

						{/* Feedback Section */}
						<ComponentSection
							id="feedback"
							title="Feedback"
							description="Components for user feedback and status indicators."
						>
							<ComponentRow label="Badges">
								<Badge status="success">Success</Badge>
								<Badge status="info">Info</Badge>
								<Badge status="warning">Warning</Badge>
								<Badge status="error">Error</Badge>
							</ComponentRow>

							<ComponentRow label="Progress">
								<div className="w-full max-w-md space-y-2">
									<Progress value={33} />
									<Progress value={66} />
									<Progress value={100} />
								</div>
							</ComponentRow>

							<ComponentRow label="Skeleton">
								<div className="space-y-2">
									<Skeleton className="h-4 w-[250px]" />
									<Skeleton className="h-4 w-[200px]" />
									<Skeleton className="h-10 w-[100px] rounded-md" />
								</div>
								<div className="flex items-center gap-3">
									<Skeleton className="h-12 w-12 rounded-full" />
									<div className="space-y-2">
										<Skeleton className="h-4 w-[150px]" />
										<Skeleton className="h-3 w-[100px]" />
									</div>
								</div>
							</ComponentRow>

							<ComponentRow label="Alerts">
								<div className="w-full space-y-3">
									<Alert>
										<Info className="h-4 w-4" />
										<AlertTitle>Information</AlertTitle>
										<AlertDescription>
											This is an informational alert
											message.
										</AlertDescription>
									</Alert>
									<Alert variant="error">
										<AlertCircle className="h-4 w-4" />
										<AlertTitle>Error</AlertTitle>
										<AlertDescription>
											Something went wrong. Please try
											again.
										</AlertDescription>
									</Alert>
								</div>
							</ComponentRow>
						</ComponentSection>

						{/* Layout Section */}
						<ComponentSection
							id="layout"
							title="Layout"
							description="Components for content organization and structure."
						>
							<ComponentRow label="Cards">
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
									<Card>
										<CardHeader>
											<CardTitle>Feature Card</CardTitle>
											<CardDescription>
												A brief description of this
												feature.
											</CardDescription>
										</CardHeader>
										<CardContent>
											<p className="text-sm text-muted-foreground">
												Card content goes here with
												additional details.
											</p>
										</CardContent>
										<CardFooter>
											<Button size="sm">
												Learn More
											</Button>
										</CardFooter>
									</Card>
									<Card className="bg-primary text-primary-foreground">
										<CardHeader>
											<CardTitle>
												Highlighted Card
											</CardTitle>
											<CardDescription className="text-primary-foreground/70">
												This card stands out.
											</CardDescription>
										</CardHeader>
										<CardContent>
											<p className="text-sm text-primary-foreground/80">
												Use for premium features or
												CTAs.
											</p>
										</CardContent>
									</Card>
								</div>
							</ComponentRow>

							<ComponentRow label="Separator">
								<div className="w-full max-w-md space-y-4">
									<div>Content above separator</div>
									<Separator />
									<div>Content below separator</div>
								</div>
							</ComponentRow>

							<ComponentRow label="Accordion">
								<Accordion
									type="single"
									collapsible
									className="w-full max-w-md"
								>
									<AccordionItem value="item-1">
										<AccordionTrigger>
											What is WebClarity?
										</AccordionTrigger>
										<AccordionContent>
											WebClarity is a modern SaaS platform
											for website analysis and
											optimization insights.
										</AccordionContent>
									</AccordionItem>
									<AccordionItem value="item-2">
										<AccordionTrigger>
											How do I get started?
										</AccordionTrigger>
										<AccordionContent>
											Sign up for an account, create a
											workspace, and add your first
											website to analyze.
										</AccordionContent>
									</AccordionItem>
									<AccordionItem value="item-3">
										<AccordionTrigger>
											Is there a free plan?
										</AccordionTrigger>
										<AccordionContent>
											Yes! We offer a free tier with
											limited features to help you get
											started.
										</AccordionContent>
									</AccordionItem>
								</Accordion>
							</ComponentRow>

							<ComponentRow label="Collapsible">
								<Collapsible
									open={isCollapsibleOpen}
									onOpenChange={setIsCollapsibleOpen}
									className="w-full max-w-md space-y-2"
								>
									<div className="flex items-center justify-between">
										<h4 className="text-sm font-semibold">
											@peduarte starred 3 repositories
										</h4>
										<CollapsibleTrigger asChild>
											<Button variant="ghost" size="sm">
												<ChevronDown
													className={cn(
														"h-4 w-4 transition-transform",
														isCollapsibleOpen &&
															"rotate-180",
													)}
												/>
												<span className="sr-only">
													Toggle
												</span>
											</Button>
										</CollapsibleTrigger>
									</div>
									<div className="rounded-md border px-4 py-3 font-mono text-sm">
										@radix-ui/primitives
									</div>
									<CollapsibleContent className="space-y-2">
										<div className="rounded-md border px-4 py-3 font-mono text-sm">
											@radix-ui/colors
										</div>
										<div className="rounded-md border px-4 py-3 font-mono text-sm">
											@stitches/react
										</div>
									</CollapsibleContent>
								</Collapsible>
							</ComponentRow>

							<ComponentRow label="Tabs">
								<Tabs
									defaultValue="overview"
									className="w-full max-w-md"
								>
									<TabsList>
										<TabsTrigger value="overview">
											Overview
										</TabsTrigger>
										<TabsTrigger value="analytics">
											Analytics
										</TabsTrigger>
										<TabsTrigger value="settings">
											Settings
										</TabsTrigger>
									</TabsList>
									<TabsContent
										value="overview"
										className="mt-4 p-4 border rounded-lg"
									>
										<p className="text-sm text-muted-foreground">
											Overview content goes here.
										</p>
									</TabsContent>
									<TabsContent
										value="analytics"
										className="mt-4 p-4 border rounded-lg"
									>
										<p className="text-sm text-muted-foreground">
											Analytics dashboard content.
										</p>
									</TabsContent>
									<TabsContent
										value="settings"
										className="mt-4 p-4 border rounded-lg"
									>
										<p className="text-sm text-muted-foreground">
											Settings panel content.
										</p>
									</TabsContent>
								</Tabs>
							</ComponentRow>

							<ComponentRow label="Avatar">
								<Avatar>
									<AvatarImage
										src="https://avatars.githubusercontent.com/u/1?v=4"
										alt="User"
									/>
									<AvatarFallback>JD</AvatarFallback>
								</Avatar>
								<Avatar>
									<AvatarFallback>AB</AvatarFallback>
								</Avatar>
								<Avatar className="h-16 w-16">
									<AvatarImage
										src="https://avatars.githubusercontent.com/u/2?v=4"
										alt="User"
									/>
									<AvatarFallback>LG</AvatarFallback>
								</Avatar>
							</ComponentRow>
						</ComponentSection>

						{/* Overlays Section */}
						<ComponentSection
							id="overlays"
							title="Overlays & Dialogs"
							description="Modal dialogs, sheets, and overlay components."
						>
							<ComponentRow label="Dialog">
								<Dialog>
									<DialogTrigger asChild>
										<Button variant="outline">
											Open Dialog
										</Button>
									</DialogTrigger>
									<DialogContent>
										<DialogHeader>
											<DialogTitle>
												Edit Profile
											</DialogTitle>
											<DialogDescription>
												Make changes to your profile
												here. Click save when you're
												done.
											</DialogDescription>
										</DialogHeader>
										<div className="space-y-4 py-4">
											<div className="space-y-2">
												<Label htmlFor="dialog-name">
													Name
												</Label>
												<Input
													id="dialog-name"
													placeholder="John Doe"
												/>
											</div>
											<div className="space-y-2">
												<Label htmlFor="dialog-email">
													Email
												</Label>
												<Input
													id="dialog-email"
													type="email"
													placeholder="john@example.com"
												/>
											</div>
										</div>
										<DialogFooter>
											<Button type="submit">
												Save changes
											</Button>
										</DialogFooter>
									</DialogContent>
								</Dialog>
							</ComponentRow>

							<ComponentRow label="Alert Dialog">
								<AlertDialog>
									<AlertDialogTrigger asChild>
										<Button variant="destructive">
											Delete Account
										</Button>
									</AlertDialogTrigger>
									<AlertDialogContent>
										<AlertDialogHeader>
											<AlertDialogTitle>
												Are you absolutely sure?
											</AlertDialogTitle>
											<AlertDialogDescription>
												This action cannot be undone.
												This will permanently delete
												your account and remove your
												data from our servers.
											</AlertDialogDescription>
										</AlertDialogHeader>
										<AlertDialogFooter>
											<AlertDialogCancel>
												Cancel
											</AlertDialogCancel>
											<AlertDialogAction>
												Continue
											</AlertDialogAction>
										</AlertDialogFooter>
									</AlertDialogContent>
								</AlertDialog>
							</ComponentRow>

							<ComponentRow label="Sheet">
								<Sheet>
									<SheetTrigger asChild>
										<Button variant="outline">
											<Menu className="h-4 w-4 mr-2" />
											Open Sheet
										</Button>
									</SheetTrigger>
									<SheetContent>
										<SheetHeader>
											<SheetTitle>
												Navigation Menu
											</SheetTitle>
											<SheetDescription>
												Browse through the sections of
												the application.
											</SheetDescription>
										</SheetHeader>
										<div className="mt-6 space-y-4">
											<Button
												variant="ghost"
												className="w-full justify-start"
											>
												<User className="h-4 w-4 mr-2" />
												Profile
											</Button>
											<Button
												variant="ghost"
												className="w-full justify-start"
											>
												<Settings className="h-4 w-4 mr-2" />
												Settings
											</Button>
											<Button
												variant="ghost"
												className="w-full justify-start"
											>
												<Mail className="h-4 w-4 mr-2" />
												Messages
											</Button>
										</div>
									</SheetContent>
								</Sheet>
							</ComponentRow>

							<ComponentRow label="Dropdown Menu">
								<DropdownMenu>
									<DropdownMenuTrigger asChild>
										<Button variant="outline">
											Options
											<ChevronDown className="ml-2 h-4 w-4" />
										</Button>
									</DropdownMenuTrigger>
									<DropdownMenuContent align="start">
										<DropdownMenuLabel>
											My Account
										</DropdownMenuLabel>
										<DropdownMenuSeparator />
										<DropdownMenuItem>
											<User className="mr-2 h-4 w-4" />
											Profile
										</DropdownMenuItem>
										<DropdownMenuItem>
											<Settings className="mr-2 h-4 w-4" />
											Settings
										</DropdownMenuItem>
										<DropdownMenuSeparator />
										<DropdownMenuItem className="text-destructive">
											<Trash2 className="mr-2 h-4 w-4" />
											Delete
										</DropdownMenuItem>
									</DropdownMenuContent>
								</DropdownMenu>
							</ComponentRow>

							<ComponentRow label="Tooltip">
								<Tooltip>
									<TooltipTrigger asChild>
										<Button variant="outline" size="icon">
											<Info className="h-4 w-4" />
										</Button>
									</TooltipTrigger>
									<TooltipContent>
										<p>Helpful information here</p>
									</TooltipContent>
								</Tooltip>
								<Tooltip>
									<TooltipTrigger asChild>
										<Button variant="outline">
											<Copy className="h-4 w-4 mr-2" />
											Copy
										</Button>
									</TooltipTrigger>
									<TooltipContent>
										<p>Copy to clipboard</p>
									</TooltipContent>
								</Tooltip>
							</ComponentRow>
						</ComponentSection>

						{/* Navigation Section */}
						<ComponentSection
							id="navigation"
							title="Navigation"
							description="Components for user navigation and wayfinding."
						>
							<ComponentRow label="Breadcrumb">
								<Breadcrumb>
									<BreadcrumbList>
										<BreadcrumbItem>
											<BreadcrumbLink href="#">
												Home
											</BreadcrumbLink>
										</BreadcrumbItem>
										<BreadcrumbSeparator />
										<BreadcrumbItem>
											<BreadcrumbLink href="#">
												Dashboard
											</BreadcrumbLink>
										</BreadcrumbItem>
										<BreadcrumbSeparator />
										<BreadcrumbItem>
											<BreadcrumbPage>
												Settings
											</BreadcrumbPage>
										</BreadcrumbItem>
									</BreadcrumbList>
								</Breadcrumb>
							</ComponentRow>
						</ComponentSection>

						{/* Data Display Section */}
						<ComponentSection
							id="data"
							title="Data Display"
							description="Components for displaying structured information."
						>
							<ComponentRow label="Table">
								<div className="w-full border rounded-lg overflow-hidden">
									<Table>
										<TableHeader>
											<TableRow>
												<TableHead className="w-[100px]">
													ID
												</TableHead>
												<TableHead>Website</TableHead>
												<TableHead>Status</TableHead>
												<TableHead className="text-right">
													Score
												</TableHead>
											</TableRow>
										</TableHeader>
										<TableBody>
											<TableRow>
												<TableCell className="font-medium">
													001
												</TableCell>
												<TableCell>
													example.com
												</TableCell>
												<TableCell>
													<Badge status="success">
														Active
													</Badge>
												</TableCell>
												<TableCell className="text-right">
													95
												</TableCell>
											</TableRow>
											<TableRow>
												<TableCell className="font-medium">
													002
												</TableCell>
												<TableCell>mysite.io</TableCell>
												<TableCell>
													<Badge status="warning">
														Pending
													</Badge>
												</TableCell>
												<TableCell className="text-right">
													72
												</TableCell>
											</TableRow>
											<TableRow>
												<TableCell className="font-medium">
													003
												</TableCell>
												<TableCell>
													webapp.dev
												</TableCell>
												<TableCell>
													<Badge status="error">
														Inactive
													</Badge>
												</TableCell>
												<TableCell className="text-right">
													—
												</TableCell>
											</TableRow>
										</TableBody>
									</Table>
								</div>
							</ComponentRow>
						</ComponentSection>

						{/* Component List */}
						<Card className="overflow-hidden">
							<CardHeader className="bg-gradient-to-r from-emerald-500/5 to-emerald-500/10 border-b">
								<CardTitle className="flex items-center gap-2 text-lg">
									<CheckCircle className="h-5 w-5 text-emerald-500" />
									All Available Components
								</CardTitle>
								<CardDescription>
									Complete list of UI components in this
									project
								</CardDescription>
							</CardHeader>
							<CardContent className="p-6">
								<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
									{[
										"Accordion",
										"Alert",
										"AlertDialog",
										"Avatar",
										"Badge",
										"Breadcrumb",
										"Button",
										"Card",
										"Collapsible",
										"Command",
										"Dialog",
										"DropdownMenu",
										"Form",
										"Input",
										"InputOTP",
										"Label",
										"PasswordInput",
										"Progress",
										"Select",
										"Separator",
										"Sheet",
										"ShimmerButton",
										"Sidebar",
										"Skeleton",
										"Switch",
										"Table",
										"Tabs",
										"Textarea",
										"Toast",
										"Tooltip",
									].map((component) => (
										<div
											key={component}
											className="px-3 py-2 rounded-lg bg-secondary/50 text-sm font-medium text-center transition-colors hover:bg-secondary"
										>
											{component}
										</div>
									))}
								</div>
							</CardContent>
						</Card>
					</div>
				</main>

				{/* Footer */}
				<footer className="border-t mt-12">
					<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
						<p className="text-center text-sm text-muted-foreground">
							This page is only available in development mode. It
							will not be accessible in production.
						</p>
					</div>
				</footer>
			</div>
		</TooltipProvider>
	);
}
