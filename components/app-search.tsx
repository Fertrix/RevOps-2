"use client";

import React, { useRef, useState } from "react";
import { useKeypress } from "@/hooks/use-keypress";
import {
	InputGroup,
	InputGroupAddon,
	InputGroupInput,
} from "@/components/ui/input-group";
import { Kbd, KbdGroup } from "@/components/ui/kbd";
import { useSidebar } from "@/components/ui/sidebar";
import { useAppContext, ViewType, ClientNameType } from "@/components/app-context";
import { SearchIcon, ArrowRightIcon, FolderIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchTarget {
	name: string;
	keywords: string[];
	widget?: string;
	view?: ViewType;
	description: string;
	type: "widget" | "client";
	clientName?: ClientNameType;
}

const SEARCH_TARGETS = [
	{
		name: "Financial Breakdown",
		keywords: ["chart", "financial", "breakdown", "mrr", "income", "cost", "revenue", "analytics", "profits"],
		widget: "financial-breakdown",
		view: "command-center" as ViewType,
		description: "Agency profitability chart & historical MRR / ARPU / LTV analysis",
	},
	{
		name: "Revenue Leaks Audit",
		keywords: ["revenue", "leaks", "scope", "creep", "apex", "nova", "helix", "deviations", "unbilled", "hours"],
		widget: "revenue-leak",
		view: "command-center" as ViewType,
		description: "Scope creep tracker & unbilled developer deviations",
	},
	{
		name: "Churn Shield Telemetry",
		keywords: ["churn", "shield", "risk", "telemetry", "orion", "vortex", "starlight", "retention", "latency"],
		widget: "churn-shield",
		view: "command-center" as ViewType,
		description: "Client telemetry tracking & predictive retention alerts",
	},
	{
		name: "Omnichannel Spends",
		keywords: ["omnichannel", "marketing", "ads", "google", "meta", "linkedin", "campaign", "roas", "budget"],
		widget: "omnichannel",
		view: "command-center" as ViewType,
		description: "Acquisition channels spends, thresholds, and live ROAS",
	},
	{
		name: "Billing & Retainers Logs",
		keywords: ["stripe", "billing", "invoice", "retainer", "payment", "logs", "stripe invoices"],
		widget: "billing-section",
		view: "billing" as ViewType,
		description: "Invoiced billing summaries and active agency retainers",
	},
	{
		name: "Agency Settings",
		keywords: ["settings", "configs", "tokens", "api", "keys", "integrations", "stripe key"],
		widget: "settings-section",
		view: "settings" as ViewType,
		description: "Stripe/Toggl API token integrations and configurations",
	},
];

const directoryClients: ClientNameType[] = [
	"Apex Digital",
	"Helix Corp",
	"Nova Soft",
	"Nexus Tech",
	"Orion Labs",
	"Vortex Tech",
	"Starlight Co",
];

export function AppSearch() {
	const groupRef = useRef<HTMLDivElement>(null);
	const { setOpen } = useSidebar();
	const {
		searchQuery,
		setSearchQuery,
		triggerWidgetHighlight,
		setSelectedClient,
		setActiveView,
		addLog,
	} = useAppContext();
	const [focused, setFocused] = useState(false);
	const [scannedTargets, setScannedTargets] = useState<{ name: string; widget: string; description: string }[]>([]);

	useKeypress({
		combo: ["meta+k", "ctrl+k"],
		callback: () => {
			const input = groupRef.current?.querySelector<HTMLInputElement>(
				"[data-slot=input-group-control]"
			);
			input?.focus({ preventScroll: true });
			setOpen(true);
		},
	});

	// Dynamic DOM scan on focus to find active headings dynamically
	const handleFocus = () => {
		setFocused(true);
		
		const headings = Array.from(document.querySelectorAll("h1, h2, h3, [data-slot=card-title]"));
		const dynamicTargets = headings
			.map((el) => {
				const text = el.textContent?.trim() || "";
				if (!text || text.length < 3 || text.length > 40) return null;
				
				const id = el.closest("[id]")?.id;
				if (!id) return null;
				return {
					name: text,
					widget: id,
					description: `Navigate to ${text} on dashboard`,
				};
			})
			.filter(Boolean) as { name: string; widget: string; description: string }[];

		// Deduplicate matches
		const seen = new Set();
		const uniqueTargets = dynamicTargets.filter((t) => {
			const key = t.name.toLowerCase();
			if (seen.has(key)) return false;
			seen.add(key);
			return true;
		});

		setScannedTargets(uniqueTargets);
	};

	// Convert base configs, dynamic scanned segments and client accounts into searchable nodes
	const clientTargets: SearchTarget[] = directoryClients.map((client) => ({
		name: client,
		keywords: [client.toLowerCase(), "client", "portfolio", "account", "directory"],
		description: `Select and open ${client}'s contract profile`,
		type: "client",
		clientName: client,
	}));

	const baseWidgetTargets: SearchTarget[] = SEARCH_TARGETS.map((t) => ({ ...t, type: "widget" }));

	const scannedWidgetTargets: SearchTarget[] = scannedTargets
		.filter((t) => !SEARCH_TARGETS.some((base) => base.widget === t.widget))
		.map((t) => ({
			name: t.name,
			keywords: [t.name.toLowerCase(), "section", "heading", "card"],
			widget: t.widget,
			view: "command-center",
			description: t.description,
			type: "widget",
		}));

	const allTargets = [...baseWidgetTargets, ...scannedWidgetTargets, ...clientTargets];

	// Filter targets based on search query
	const query = searchQuery.trim().toLowerCase();
	const matchedTargets = query
		? allTargets.filter(
				(t) =>
					t.name.toLowerCase().includes(query) ||
					t.description.toLowerCase().includes(query) ||
					t.keywords.some((k) => k.toLowerCase().includes(query))
		  )
		: [];

	const handleItemClick = (target: SearchTarget) => {
		if (target.type === "client" && target.clientName) {
			setSelectedClient(target.clientName);
			setActiveView("client-portfolio");
			addLog(`Search: Navigated to client contract profile: ${target.clientName}`, "success");
		} else if (target.widget && target.view) {
			// For all search targets that are not clients, ensure they open in Command Center (All Accounts)
			setSelectedClient("All Accounts");
			const finalView = (target.view === "command-center" || target.widget === "financial-breakdown" || target.widget === "revenue-leak" || target.widget === "churn-shield" || target.widget === "omnichannel")
				? "command-center" as ViewType
				: target.view;
			triggerWidgetHighlight(target.widget, finalView);
		}

		setSearchQuery("");
		setFocused(false);
		
		// Blur input
		const input = groupRef.current?.querySelector<HTMLInputElement>(
			"[data-slot=input-group-control]"
		);
		input?.blur();
	};

	return (
		<div className="relative w-full flex flex-col">
			<InputGroup ref={groupRef}>
				<InputGroupAddon align="inline-start" className="pl-1.75">
					<SearchIcon className="size-4" />
				</InputGroupAddon>
				<InputGroupInput
					aria-label="Search"
					name="q"
					placeholder="Search features..."
					type="search"
					value={searchQuery}
					onChange={(e) => setSearchQuery(e.target.value)}
					onFocus={handleFocus}
					onBlur={() => setTimeout(() => setFocused(false), 250)} // delay to allow clicks
				/>
				<InputGroupAddon align="inline-end">
					<KbdGroup>
						<Kbd>⌘</Kbd>
						<Kbd>K</Kbd>
					</KbdGroup>
				</InputGroupAddon>
			</InputGroup>

			{/* Search Results Dropdown Overlay */}
			{focused && matchedTargets.length > 0 && (
				<div className="absolute top-11 left-0 right-0 z-50 bg-stone-950 border border-stone-900 rounded-lg shadow-2xl overflow-hidden flex flex-col p-1.5 gap-1 max-h-64 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-150">
					<div className="text-[9px] font-bold text-muted-foreground uppercase px-2 py-1 tracking-widest border-b border-stone-900 mb-1">
						Search Matches & Accounts
					</div>
					{matchedTargets.map((item, idx) => (
						<button
							key={`${item.name}-${idx}`}
							onClick={() => handleItemClick(item)}
							className="w-full text-start flex items-center justify-between p-2 rounded-md hover:bg-stone-900 transition-all text-xs outline-none focus:bg-stone-900 group"
						>
							<div className="flex flex-col gap-0.5 min-w-0">
								<span className="font-semibold text-foreground flex items-center gap-1.5">
									{item.type === "client" && <FolderIcon className="size-3 text-amber-500 shrink-0" />}
									{item.name}
								</span>
								<span className="text-[10px] text-muted-foreground truncate">
									{item.description}
								</span>
							</div>
							<ArrowRightIcon className="size-3 text-stone-500 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
						</button>
					))}
				</div>
			)}
		</div>
	);
}
