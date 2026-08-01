"use client";

import { cn } from "@/lib/utils";
import { LogoIcon } from "@/components/logo";
import { Button } from "@/components/ui/button";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupLabel,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarRail,
} from "@/components/ui/sidebar";
import { AppSearch } from "@/components/app-search";
import { CustomTrigger } from "@/components/custom-trigger";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { useAppContext } from "@/components/app-context";
import {
	LayoutDashboardIcon,
	CreditCardIcon,
	SettingsIcon,
	TargetIcon,
	TrendingUpIcon,
	FolderIcon,
	ChevronRightIcon,
	SearchIcon,
	XIcon,
} from "lucide-react";
import React, { useState } from "react";

const directoryClients = [
	{ name: "Apex Digital", sector: "Creative Agency", status: "Active" },
	{ name: "Helix Corp", sector: "Biotech Retainer", status: "Active" },
	{ name: "Nova Soft", sector: "SaaS Dev Contract", status: "Active" },
	{ name: "Nexus Tech", sector: "AI Hardware Portal", status: "At Risk" },
	{ name: "Orion Labs", sector: "R&D Telemetry", status: "Warning" },
	{ name: "Vortex Tech", sector: "AdTech Platform", status: "At Risk" },
	{ name: "Starlight Co", sector: "Retainer Campaign", status: "Warning" },
];

function AgencyLogo({ agencyName, agencyDomain }: { agencyName: string; agencyDomain: string }) {
	const [imageError, setImageError] = useState(false);

	const cleanDomain = agencyDomain
		? agencyDomain.replace(/^https?:\/\//, "").replace(/\/.*$/, "").trim()
		: "";

	if (cleanDomain && !imageError) {
		return (
			<img
				src={`https://unavatar.io/${cleanDomain}?fallback=false`}
				alt={`${agencyName} Logo`}
				onError={(e) => {
					const img = e.currentTarget;
					if (!img.dataset.triedGoogle) {
						img.dataset.triedGoogle = "true";
						img.src = `https://www.google.com/s2/favicons?sz=128&domain=${cleanDomain}`;
					} else {
						setImageError(true);
					}
				}}
				className="size-5 rounded-md object-contain shrink-0 border border-stone-800 bg-muted/40"
			/>
		);
	}

	return <LogoIcon className="size-5 shrink-0" />;
}

export function AppSidebar() {
	const {
		activeView,
		setActiveView,
		searchQuery,
		illusionOfMargin,
		systemStatus,
		leaks,
		selectedClient,
		setSelectedClient,
		agencyName,
		agencyDomain,
	} = useAppContext();

	const [clientsFlyoutOpen, setClientsFlyoutOpen] = useState(false);
	const [clientSearch, setClientSearch] = useState("");

	// Search filter checks
	const showCommandCenter = "command center".includes(searchQuery.toLowerCase());
	const showBilling = "billing & retainers logs billing and retainers logs".includes(searchQuery.toLowerCase());

	// Filter client directory list
	const filteredClients = directoryClients.filter((c) =>
		c.name.toLowerCase().includes(clientSearch.toLowerCase()) ||
		c.sector.toLowerCase().includes(clientSearch.toLowerCase())
	);

	// Dynamically compute current margin based on God Mode "Illusion of Margin" and Stripe Pipeline failure
	const targetMargin = 65.0;
	let currentMargin = 54.2;

	if (illusionOfMargin) {
		currentMargin = 68.5; // Skewed high
	} else {
		if (selectedClient === "All Accounts") {
			const activeLeaksValue = leaks.filter((l) => l.status === "Leak").reduce((sum, l) => sum + l.amount, 0);
			const penalty = activeLeaksValue / 450;
			currentMargin = parseFloat((64.5 - penalty - (systemStatus === "api-failure" ? 10 : 0)).toFixed(1));
		} else {
			if (selectedClient === "Apex Digital") {
				const isSecured = leaks.find((l) => l.id === "L1")?.status === "Secured";
				currentMargin = isSecured ? 48.5 : 32.1;
			} else if (selectedClient === "Helix Corp") {
				const isSecured = leaks.find((l) => l.id === "L2")?.status === "Secured";
				currentMargin = isSecured ? 58.0 : 45.0;
			} else if (selectedClient === "Nova Soft") {
				const isSecured = leaks.find((l) => l.id === "L3")?.status === "Secured";
				currentMargin = isSecured ? 62.0 : 48.2;
			} else if (selectedClient === "Nexus Tech") {
				currentMargin = 61.5;
			} else if (selectedClient === "Orion Labs") {
				currentMargin = 55.0;
			} else if (selectedClient === "Vortex Tech") {
				currentMargin = 38.0;
			} else if (selectedClient === "Starlight Co") {
				currentMargin = 44.0;
			}
			if (systemStatus === "api-failure") {
				currentMargin = parseFloat((currentMargin - 10).toFixed(1));
			}
		}
	}

	return (
		<Sidebar
			className={cn(
				"*:data-[slot=sidebar-inner]:bg-background",
				"transition-[left,right,top,width] group-data-[collapsible=offcanvas]:top-[calc(var(--app-header-height)*0.5)]"
			)}
			collapsible="offcanvas"
			variant="sidebar"
		>
			<SidebarHeader className="h-(--app-header-height,3rem) flex-row items-center justify-between">
				<Button
					variant="ghost"
					onClick={() => {
						setSelectedClient("All Accounts");
						setActiveView("command-center");
					}}
					className="flex items-center gap-2 px-2 hover:bg-transparent"
				>
					<AgencyLogo agencyName={agencyName} agencyDomain={agencyDomain} />
					<span className="font-semibold text-sm tracking-tight text-foreground truncate max-w-[130px]">
						{agencyName}
					</span>
				</Button>
				<CustomTrigger place="sidebar" />
			</SidebarHeader>

			<SidebarContent>
				<SidebarGroup>
					<AppSearch />
				</SidebarGroup>

				{/* Primary Menu (Command Center) */}
				{showCommandCenter && (
					<SidebarGroup>
						<SidebarGroupLabel className="group-data-[collapsible=icon]:pointer-events-none">
							Main View
						</SidebarGroupLabel>
						<SidebarMenu>
							<SidebarMenuItem>
								<SidebarMenuButton
									isActive={activeView === "command-center"}
									tooltip="Command Center"
									onClick={() => {
										setSelectedClient("All Accounts");
										setActiveView("command-center");
										setClientsFlyoutOpen(false);
									}}
								>
									<LayoutDashboardIcon />
									<span>Command Center</span>
								</SidebarMenuButton>
							</SidebarMenuItem>
						</SidebarMenu>
					</SidebarGroup>
				)}

				{/* Separator line */}
				<div className="px-3 py-1">
					<hr className="border-stone-200/10 dark:border-stone-850" />
				</div>

				{/* Client Directory Menu with Folder Icon & Toggle button */}
				<SidebarGroup>
					<SidebarGroupLabel className="group-data-[collapsible=icon]:pointer-events-none">
						Portfolio
					</SidebarGroupLabel>
					<SidebarMenu>
						<SidebarMenuItem>
							<SidebarMenuButton
								isActive={activeView === "client-portfolio" || clientsFlyoutOpen}
								tooltip="Client Directory"
								onClick={() => setClientsFlyoutOpen(!clientsFlyoutOpen)}
								className="flex items-center justify-between"
							>
								<div className="flex items-center gap-2">
									<FolderIcon className="size-4" />
									<span>Client Directory</span>
								</div>
								<ChevronRightIcon className={cn("size-3.5 transition-transform duration-200", clientsFlyoutOpen && "rotate-90")} />
							</SidebarMenuButton>
						</SidebarMenuItem>
					</SidebarMenu>
				</SidebarGroup>

				{/* Separator line */}
				<div className="px-3 py-1">
					<hr className="border-stone-200/10 dark:border-stone-850" />
				</div>

				{/* Secondary Menu (Billing & Retainers Logs) positioned lower */}
				{showBilling && (
					<SidebarGroup>
						<SidebarGroupLabel className="group-data-[collapsible=icon]:pointer-events-none">
							Finance Logs
						</SidebarGroupLabel>
						<SidebarMenu>
							<SidebarMenuItem>
								<SidebarMenuButton
									isActive={activeView === "billing"}
									tooltip="Billing & Retainers Logs"
									onClick={() => {
										setActiveView("billing");
										setClientsFlyoutOpen(false);
									}}
								>
									<CreditCardIcon />
									<span>Billing & Retainers Logs</span>
								</SidebarMenuButton>
							</SidebarMenuItem>
						</SidebarMenu>
					</SidebarGroup>
				)}

				{!showCommandCenter && !showBilling && (
					<p className="text-xs text-muted-foreground text-center py-4">
						No sections found
					</p>
				)}
			</SidebarContent>

			<SidebarFooter className="px-4 gap-4 pb-4">
				{/* Separator line above Data Integrity */}
				<div className="px-1 py-1 group-data-[collapsible=icon]:hidden">
					<hr className="border-stone-200/10 dark:border-stone-850" />
				</div>

				{/* Read-only Data Integrity Telemetry Block (Reactive to System Status) */}
				<div className="flex flex-col gap-1.5 group-data-[collapsible=icon]:hidden">
					<span className="text-[10px] font-semibold tracking-wider text-muted-foreground/60 uppercase px-0.5">
						DATA INTEGRITY
					</span>
					<div className="flex flex-col gap-1">
						{/* Row 1 */}
						<div className="flex items-center justify-between px-3 py-1.5 bg-zinc-100/10 dark:bg-zinc-900/40 border border-black/5 dark:border-white/5 rounded-md text-[10px]">
							<span className="text-zinc-650 dark:text-zinc-400">Stripe Gateway</span>
							<span className={cn(
								"font-semibold",
								systemStatus === "api-failure" ? "text-rose-500" : "text-emerald-500 dark:text-emerald-400"
							)}>
								{systemStatus === "api-failure" ? "DISCONNECTED" : "CONNECTED"}
							</span>
						</div>
						{/* Row 2 */}
						<div className="flex items-center justify-between px-3 py-1.5 bg-zinc-100/10 dark:bg-zinc-900/40 border border-black/5 dark:border-white/5 rounded-md text-[10px]">
							<span className="text-zinc-650 dark:text-zinc-400">API Ingestion Latency</span>
							<span className={cn(
								"font-medium",
								systemStatus === "api-failure" ? "text-amber-500 font-bold animate-pulse" : "text-zinc-550 dark:text-zinc-400"
							)}>
								{systemStatus === "api-failure" ? "1,420ms" : "14ms"}
							</span>
						</div>
						{/* Row 3 */}
						<div className="flex items-center justify-between px-3 py-1.5 bg-zinc-100/10 dark:bg-zinc-900/40 border border-black/5 dark:border-white/5 rounded-md text-[10px]">
							<span className="text-zinc-650 dark:text-zinc-400">Supabase Cluster</span>
							<span className={cn(
								"font-medium",
								systemStatus === "api-failure" ? "text-amber-500 font-semibold" : "text-zinc-550 dark:text-zinc-400"
							)}>
								{systemStatus === "api-failure" ? "DEGRADED (92.4%)" : "99.9% UPTIME"}
							</span>
						</div>
					</div>
				</div>

				{/* Margin Summary Stats Card at Sidebar Footer */}
				<div className="rounded-lg border bg-muted/40 p-3 flex flex-col gap-2 group-data-[collapsible=icon]:hidden">
					<div className="flex items-center justify-between">
						<span className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider flex items-center gap-1.5">
							<TargetIcon className="size-3.5 text-primary" /> Target Margin
						</span>
						<span className="font-mono text-xs font-semibold text-foreground">
							{targetMargin}%
						</span>
					</div>

					<div className="flex items-center justify-between">
						<span className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider flex items-center gap-1.5">
							<TrendingUpIcon
								className={cn(
									"size-3.5",
									currentMargin >= targetMargin
										? "text-emerald-500"
										: "text-amber-500"
								)}
							/>{" "}
							Current Margin
						</span>
						<span
							className={cn(
								"font-mono text-xs font-bold",
								currentMargin >= targetMargin
									? "text-emerald-600 dark:text-emerald-400"
									: "text-amber-600 dark:text-amber-400"
							)}
						>
							{currentMargin}%
						</span>
					</div>

					{/* Loading/Progress Bar */}
					<div className="relative w-full h-1.5 bg-secondary rounded-full overflow-hidden mt-1">
						{/* Target marker line */}
						<div
							className="absolute top-0 bottom-0 w-0.5 bg-foreground/30 z-20"
							style={{ left: `${targetMargin}%` }}
							title="Target Margin Threshold"
						/>
						{/* Progress fill */}
						<div
							className={cn(
								"h-full rounded-full transition-all duration-500 ease-out z-10",
								currentMargin >= targetMargin
									? "bg-emerald-500"
									: "bg-amber-500"
							)}
							style={{ width: `${Math.min(100, currentMargin)}%` }}
						/>
					</div>
				</div>

				<div className="flex items-center justify-between border-t pt-3 w-full gap-2 overflow-hidden">
					<div className="shrink-0">
						<ThemeSwitcher />
					</div>
					
					{/* Vertical Line 1 */}
					<div className="h-8 w-px bg-stone-200/10 dark:bg-stone-850 shrink-0 group-data-[collapsible=icon]:hidden" />
					
					{/* CEO User Profile Details */}
					<div className="flex items-center gap-2 min-w-0 flex-1 group-data-[collapsible=icon]:hidden animate-in fade-in duration-200">
						<img
							src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&fit=crop&auto=format&q=80"
							alt="Jack Sterling"
							className="size-8 rounded-full object-cover border border-stone-800"
						/>
						<div className="flex flex-col text-[10px] min-w-0 leading-tight">
							<span className="font-semibold text-foreground truncate">
								Jack Sterling
							</span>
							<span className="text-muted-foreground font-medium text-[9px] truncate mt-0.5">
								CEO
							</span>
							<span className="text-muted-foreground/60 text-[8px] truncate mt-0.5">
								ceo@artificiallyhub.com
							</span>
						</div>
					</div>
					
					{/* Vertical Line 2 */}
					<div className="h-8 w-px bg-stone-200/10 dark:bg-stone-850 shrink-0 group-data-[collapsible=icon]:hidden" />
					
					<div className="shrink-0">
						<Button
							className="text-muted-foreground"
							size="icon-sm"
							variant="ghost"
							onClick={() => {
								setActiveView("settings");
								setClientsFlyoutOpen(false);
							}}
						>
							<SettingsIcon />
						</Button>
					</div>
				</div>
			</SidebarFooter>
			<SidebarRail />

			{/* Flyout Client Directory Drawer (Full Height Layer next to Sidebar Container) */}
			<div
				className={cn(
					"absolute top-0 bottom-0 left-[100%] w-64 bg-background border-r border-l shadow-2xl transition-all duration-300 ease-out flex flex-col z-50 font-sans select-none h-screen",
					clientsFlyoutOpen
						? "translate-x-0 opacity-100 pointer-events-auto"
						: "-translate-x-4 opacity-0 pointer-events-none"
				)}
			>
				{/* Header matching main sidebar header height */}
				<div className="h-[3.5rem] flex items-center justify-between px-4 border-b bg-muted/10 shrink-0">
					<div className="flex flex-col">
						<span className="font-bold text-xs text-foreground uppercase tracking-wide">
							Client Directory
						</span>
						<span className="text-[9px] text-muted-foreground uppercase font-semibold mt-0.5">
							Accounts Portfolio
						</span>
					</div>
					<Button
						variant="ghost"
						size="icon-xs"
						onClick={() => setClientsFlyoutOpen(false)}
						className="rounded-md p-1 hover:bg-muted text-muted-foreground hover:text-foreground transition-all"
					>
						<XIcon className="size-4" />
					</Button>
				</div>

				{/* Mini Search Bar */}
				<div className="p-3 border-b bg-muted/10 shrink-0">
					<div className="relative">
						<input
							type="text"
							value={clientSearch}
							onChange={(e) => setClientSearch(e.target.value)}
							placeholder="Search clients..."
							className="w-full bg-background border rounded-lg pl-8 pr-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground/60 text-foreground"
						/>
						<SearchIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground/60" />
						{clientSearch && (
							<button
								type="button"
								onClick={() => setClientSearch("")}
								className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground/60 hover:text-foreground"
							>
								<XIcon className="size-3" />
							</button>
						)}
					</div>
				</div>

				{/* Scrollable List */}
				<div className="flex-1 overflow-y-auto bg-background p-2 flex flex-col gap-1">
					{filteredClients.map((client) => (
						<div
							key={client.name}
							onClick={() => {
								setSelectedClient(client.name as any);
								setActiveView("client-portfolio");
								setClientsFlyoutOpen(false);
							}}
							className={cn(
								"p-3 rounded-lg transition-all duration-200 cursor-pointer flex flex-col gap-1 select-none border",
								selectedClient === client.name
									? "bg-primary/10 border-primary/20 shadow-sm"
									: "border-transparent hover:bg-muted/30"
							)}
						>
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-1.5 min-w-0">
									{selectedClient === client.name && (
										<span className="size-1.5 rounded-full bg-primary animate-pulse shrink-0" />
									)}
									<span className={cn(
										"font-semibold text-xs truncate transition-colors",
										selectedClient === client.name ? "text-primary font-bold" : "text-foreground"
									)}>
										{client.name}
									</span>
								</div>
								<span
									className={cn(
										"text-[8px] font-bold px-1.5 py-0.5 rounded-sm uppercase tracking-wider shrink-0",
										client.status === "Active" && "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
										client.status === "Warning" && "bg-amber-500/10 text-amber-600 dark:text-amber-400",
										client.status === "At Risk" && "bg-rose-500/10 text-rose-600 dark:text-rose-450"
									)}
								>
									{client.status}
								</span>
							</div>
							<span className="text-[10px] text-muted-foreground pl-3">
								{client.sector}
							</span>
						</div>
					))}
					{filteredClients.length === 0 && (
						<p className="text-center text-xs text-muted-foreground py-6">
							No clients found
						</p>
					)}
				</div>

				{/* Footer matching main sidebar footer height */}
				<div className="h-[3.5rem] border-t bg-muted/10 flex items-center px-4 justify-between text-[10px] text-muted-foreground shrink-0">
					<span>Total: {directoryClients.length} Accounts</span>
					<span className="flex items-center gap-1 font-semibold text-emerald-500">
						<span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
						Nominal
					</span>
				</div>
			</div>
		</Sidebar>
	);
}
