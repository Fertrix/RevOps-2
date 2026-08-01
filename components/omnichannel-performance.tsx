"use client";

import { cn } from "@/lib/utils";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { MegaphoneIcon, ChevronDownIcon } from "lucide-react";
import React, { useState } from "react";
import { useAppContext } from "@/components/app-context";

const clientLabels = {
	all: "All Accounts",
	apex: "Apex Digital",
	helix: "Helix Corp",
	nova: "Nova Soft",
	nexus: "Nexus Tech",
	orion: "Orion Labs",
	vortex: "Vortex Tech",
	starlight: "Starlight Co",
};

const clientKeyMap = {
	"All Accounts": "all",
	"Apex Digital": "apex",
	"Helix Corp": "helix",
	"Nova Soft": "nova",
	"Nexus Tech": "nexus",
	"Orion Labs": "orion",
	"Vortex Tech": "vortex",
	"Starlight Co": "starlight",
} as const;

const clientData = {
	all: [
		{ name: "Meta Ads campaigns", spend: 36000, roas: 2.7, budget: 50000 },
		{ name: "Google Ads (Search)", spend: 27900, roas: 3.3, budget: 37500 },
		{ name: "LinkedIn Outreach", spend: 13605, roas: 1.8, budget: 18000 },
		{ name: "TikTok Ads campaigns", spend: 10400, roas: 2.4, budget: 15000 },
		{ name: "YouTube Ads branding", spend: 18600, roas: 3.0, budget: 26000 },
	],
	apex: [
		{ name: "Meta Ads campaigns", spend: 4500, roas: 2.8, budget: 6000 },
		{ name: "Google Ads (Search)", spend: 3200, roas: 3.4, budget: 5000 },
		{ name: "LinkedIn Outreach", spend: 1800, roas: 1.9, budget: 2000 },
		{ name: "TikTok Ads campaigns", spend: 1200, roas: 2.2, budget: 2000 },
		{ name: "YouTube Ads branding", spend: 2500, roas: 3.0, budget: 4000 },
	],
	helix: [
		{ name: "Meta Ads campaigns", spend: 8200, roas: 3.1, budget: 12000 },
		{ name: "Google Ads (Search)", spend: 6500, roas: 3.6, budget: 8000 },
		{ name: "LinkedIn Outreach", spend: 3400, roas: 1.7, budget: 4500 },
		{ name: "TikTok Ads campaigns", spend: 2100, roas: 2.5, budget: 3000 },
		{ name: "YouTube Ads branding", spend: 4200, roas: 3.2, budget: 6000 },
	],
	nova: [
		{ name: "Meta Ads campaigns", spend: 11800, roas: 2.8, budget: 17000 },
		{ name: "Google Ads (Search)", spend: 8500, roas: 3.5, budget: 12000 },
		{ name: "LinkedIn Outreach", spend: 4205, roas: 1.8, budget: 5500 },
		{ name: "TikTok Ads campaigns", spend: 3900, roas: 2.5, budget: 5000 },
		{ name: "YouTube Ads branding", spend: 6100, roas: 3.1, budget: 8000 },
	],
	nexus: [
		{ name: "Meta Ads campaigns", spend: 3400, roas: 2.5, budget: 4500 },
		{ name: "Google Ads (Search)", spend: 2800, roas: 3.0, budget: 3500 },
		{ name: "LinkedIn Outreach", spend: 1200, roas: 1.5, budget: 2000 },
		{ name: "TikTok Ads campaigns", spend: 900, roas: 2.0, budget: 1500 },
		{ name: "YouTube Ads branding", spend: 1500, roas: 2.8, budget: 2000 },
	],
	orion: [
		{ name: "Meta Ads campaigns", spend: 2100, roas: 2.4, budget: 3000 },
		{ name: "Google Ads (Search)", spend: 1900, roas: 2.9, budget: 2500 },
		{ name: "LinkedIn Outreach", spend: 800, roas: 1.4, budget: 1000 },
		{ name: "TikTok Ads campaigns", spend: 600, roas: 1.8, budget: 1000 },
		{ name: "YouTube Ads branding", spend: 1000, roas: 2.5, budget: 1500 },
	],
	vortex: [
		{ name: "Meta Ads campaigns", spend: 4100, roas: 2.1, budget: 5000 },
		{ name: "Google Ads (Search)", spend: 3500, roas: 2.6, budget: 4500 },
		{ name: "LinkedIn Outreach", spend: 1500, roas: 1.3, budget: 2000 },
		{ name: "TikTok Ads campaigns", spend: 1100, roas: 1.9, budget: 1500 },
		{ name: "YouTube Ads branding", spend: 2200, roas: 2.4, budget: 3000 },
	],
	starlight: [
		{ name: "Meta Ads campaigns", spend: 1900, roas: 2.7, budget: 2500 },
		{ name: "Google Ads (Search)", spend: 1500, roas: 3.2, budget: 2000 },
		{ name: "LinkedIn Outreach", spend: 700, roas: 1.6, budget: 1000 },
		{ name: "TikTok Ads campaigns", spend: 600, roas: 2.3, budget: 1000 },
		{ name: "YouTube Ads branding", spend: 1100, roas: 2.9, budget: 1500 },
	],
};

interface OmnichannelPerformanceProps {
	hideSelector?: boolean;
}

export function OmnichannelPerformance({ hideSelector = false }: OmnichannelPerformanceProps) {
	const { highlightedWidget, selectedClient: globalSelectedClient } = useAppContext();
	const isHighlighted = highlightedWidget === "omnichannel";

	const [selectedClient, setSelectedClient] = useState<keyof typeof clientLabels>("all");
	const [dropdownOpen, setDropdownOpen] = useState(false);

	React.useEffect(() => {
		setSelectedClient(clientKeyMap[globalSelectedClient] || "all");
	}, [globalSelectedClient]);

	const activeClientKey = hideSelector
		? (clientKeyMap[globalSelectedClient] || "all")
		: selectedClient;

	const activeChannels = clientData[activeClientKey] || clientData.all;

	return (
		<Card
			id="omnichannel"
			className={cn(
				"dark:bg-transparent h-full flex flex-col justify-between transition-all duration-300 relative",
				isHighlighted && "ring-2 ring-primary ring-offset-2 shadow-2xl animate-pulse border-primary"
			)}
		>
			<CardHeader className="flex flex-row items-center justify-between border-b pb-3.5 gap-3">
				<div className="flex items-center gap-2.5 min-w-0">
					<div className="rounded-full bg-indigo-500/10 p-2 text-indigo-500 shrink-0">
						<MegaphoneIcon className="size-5" />
					</div>
					<div className="min-w-0">
						<CardTitle className="text-sm font-semibold truncate">
							Omnichannel Performance
						</CardTitle>
						<CardDescription className="text-xs truncate">
							Acquisition budget monitoring and ROAS tracking.
						</CardDescription>
					</div>
				</div>

				{/* Custom Dropdown Selector */}
				{!hideSelector && (
					<div className="relative shrink-0">
						<button
							onClick={() => setDropdownOpen(!dropdownOpen)}
							className="flex items-center gap-1.5 px-2.5 py-1.5 bg-muted/65 hover:bg-muted/90 border rounded-lg text-xs font-semibold text-foreground transition-all"
						>
							<span className="truncate max-w-[90px]">{clientLabels[selectedClient]}</span>
							<ChevronDownIcon className={cn("size-3.5 transition-transform", dropdownOpen && "rotate-180")} />
						</button>

						{dropdownOpen && (
							<>
								<div className="fixed inset-0 z-30" onClick={() => setDropdownOpen(false)} />
								<div className="absolute right-0 mt-1.5 w-44 bg-popover border rounded-lg shadow-lg py-1.5 z-40 animate-in fade-in slide-in-from-top-1 duration-150">
									{(Object.keys(clientLabels) as (keyof typeof clientLabels)[]).map((key) => (
										<button
											key={key}
											onClick={() => {
												setSelectedClient(key);
												setDropdownOpen(false);
											}}
											className={cn(
												"w-full text-left px-3 py-2 text-xs hover:bg-muted font-medium transition-all text-foreground",
												selectedClient === key && "bg-primary/5 font-semibold text-primary"
											)}
										>
											{clientLabels[key]}
										</button>
									))}
								</div>
							</>
						)}
					</div>
				)}
			</CardHeader>

			<CardContent className="p-0 flex-1 flex flex-col justify-between">
				<div className="divide-y text-xs flex-1 flex flex-col justify-between">
					{activeChannels.map((chan) => {
						const progressPercent = Math.min(
							100,
							(chan.spend / chan.budget) * 100
						);

						return (
							<div
								key={chan.name}
								className="p-3.5 flex flex-col gap-2 hover:bg-muted/10 transition-all flex-1 justify-center"
							>
								<div className="flex items-center justify-between font-semibold text-foreground">
									<span>{chan.name}</span>
									<span className="font-mono text-indigo-600 dark:text-indigo-400">
										{chan.roas}x ROAS
									</span>
								</div>

								<div className="flex items-center justify-between text-muted-foreground text-[10px]">
									<span>
										Spend: <strong>${chan.spend.toLocaleString()}</strong> / $
										{chan.budget.toLocaleString()}
									</span>
									<span>{progressPercent.toFixed(0)}% consumed</span>
								</div>

								{/* Progress Bar */}
								<div className="relative w-full h-1.5 bg-secondary rounded-full overflow-hidden">
									<div
										className="h-full rounded-full bg-indigo-500 transition-all duration-300"
										style={{ width: `${progressPercent}%` }}
									/>
								</div>
							</div>
						);
					})}
				</div>
			</CardContent>
		</Card>
	);
}
