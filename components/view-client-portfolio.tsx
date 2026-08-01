"use client";

import { cn } from "@/lib/utils";
import { RevenueLeak } from "@/components/revenue-leak";
import { ChurnShield } from "@/components/online-now";
import { FinancialBreakdown } from "@/components/visitors-chart";
import { OmnichannelPerformance } from "@/components/omnichannel-performance";
import { useAppContext } from "@/components/app-context";
import {
	Card,
} from "@/components/ui/card";
import {
	ResponsiveContainer,
	Area,
	AreaChart,
} from "recharts";
import {
	CoinsIcon,
	TrendingUpIcon,
	TrendingDownIcon,
	ActivityIcon,
	FlameIcon,
	FolderIcon,
	ChevronRightIcon,
} from "lucide-react";
import React from "react";

// Mock sparkline data base
const baseEfficiencySparkline = [
	{ val: 78 },
	{ val: 72 },
	{ val: 89 },
	{ val: 75 },
	{ val: 91 },
	{ val: 84.5 },
];

export function ViewClientPortfolio() {
	const { illusionOfMargin, systemStatus, leaks, selectedClient, clientProfiles } = useAppContext();

	// Default profile if none matches
	const activeProfile = clientProfiles[selectedClient] || {
		name: selectedClient,
		margin: 64.5,
		securedMargin: 64.5,
		burnRate: 50,
		efficiency: 85.0,
		target: 65.0,
		priorQuarter: 58.0,
		income: 5000,
	};

	// Compute client Net Margin dynamically based on its unbilled leaks state
	let currentMargin = activeProfile.margin;
	const isL1Secured = leaks.find((l) => l.id === "L1")?.status === "Secured";
	const isL2Secured = leaks.find((l) => l.id === "L2")?.status === "Secured";
	const isL3Secured = leaks.find((l) => l.id === "L3")?.status === "Secured";

	if (selectedClient === "Apex Digital" && isL1Secured) currentMargin = activeProfile.securedMargin;
	if (selectedClient === "Helix Corp" && isL2Secured) currentMargin = activeProfile.securedMargin;
	if (selectedClient === "Nova Soft" && isL3Secured) currentMargin = activeProfile.securedMargin;

	if (systemStatus === "api-failure") {
		currentMargin = parseFloat((currentMargin - 10).toFixed(1));
	}

	const marginDiff = parseFloat((currentMargin - activeProfile.priorQuarter).toFixed(1));

	// Calculate dynamic operational efficiency penalizing for active leaks
	const clientLeak = leaks.find((l) => l.client === selectedClient && l.status === "Leak");
	const currentEfficiency = clientLeak ? parseFloat((activeProfile.efficiency - 10).toFixed(1)) : activeProfile.efficiency;

	const dynamicMarginSparkline = [
		{ val: 50 },
		{ val: 56 },
		{ val: 42 },
		{ val: 62 },
		{ val: 48 },
		{ val: currentMargin },
	];

	return (
		<div className="flex flex-col gap-6 w-full animate-in fade-in duration-300">


			{/* Row 1: Client Specific Micro-Contract Metrics */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
				{/* Card 1: Client Net Margin */}
				<Card className="dark:bg-transparent p-4 h-fit border transition-all duration-300 hover:shadow-md hover:border-primary/20 hover:-translate-y-0.5">
					<div className="flex items-center gap-6 justify-between w-full">
						<div className="flex flex-col gap-0.5 shrink-0">
							<span className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider flex items-center gap-1.5">
								<CoinsIcon className="size-3.5 text-emerald-500" />
								Client Net Margin
							</span>
							<h3 className="font-mono text-2xl font-bold text-foreground mt-0.5">
								{currentMargin}%
							</h3>
							<div className="flex items-center gap-1.5 text-[10px] mt-0.5">
								<span
									className={cn(
										"inline-flex items-center gap-0.5 font-bold",
										marginDiff >= 0
											? "text-emerald-500"
											: "text-rose-500"
									)}
								>
									{marginDiff >= 0 ? (
										<TrendingUpIcon className="size-3" />
									) : (
										<TrendingDownIcon className="size-3" />
									)}
									{marginDiff >= 0 ? "+" : ""}
									{marginDiff}%
								</span>
								<span className="text-muted-foreground">vs prior quarter</span>
							</div>
						</div>

						{/* Mini Sparkline Chart */}
						<div className="flex-1 h-12 min-w-0">
							<ResponsiveContainer width="100%" height="100%">
								<AreaChart data={dynamicMarginSparkline} margin={{ top: 2, right: 2, bottom: 2, left: 2 }}>
									<Area
										type="monotone"
										dataKey="val"
										stroke={marginDiff >= 0 ? "var(--chart-2)" : "var(--chart-1)"}
										fill={marginDiff >= 0 ? "var(--chart-2)" : "var(--chart-1)"}
										fillOpacity={0.08}
										strokeWidth={2.5}
										dot={false}
									/>
								</AreaChart>
							</ResponsiveContainer>
						</div>
					</div>
				</Card>

				{/* Card 2: Burn Rate of Retainer */}
				<Card className="dark:bg-transparent p-4 h-fit border transition-all duration-300 hover:shadow-md hover:border-primary/20 hover:-translate-y-0.5">
					<div className="flex items-center gap-6 justify-between w-full">
						<div className="flex flex-col gap-0.5 shrink-0">
							<span className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider flex items-center gap-1.5">
								<FlameIcon className="size-3.5 text-amber-500 animate-pulse" />
								Burn Rate of Retainer
							</span>
							<h3 className="font-mono text-2xl font-bold text-foreground mt-0.5">
								{activeProfile.burnRate}%
							</h3>
							<div className="flex items-center gap-1.5 text-[10px] mt-0.5">
								<span className="text-muted-foreground font-semibold">
									Retainer Consumed on Day 12
								</span>
							</div>
						</div>

						{/* Progress Pill indicator */}
						<div className="flex-1 flex flex-col justify-center px-1">
							<div className="relative w-full h-2 bg-secondary rounded-full overflow-hidden">
								<div
									className={cn(
										"h-full rounded-full transition-all duration-500 ease-out",
										activeProfile.burnRate > 80 ? "bg-rose-500 animate-pulse" : "bg-amber-500"
									)}
									style={{ width: `${activeProfile.burnRate}%` }}
								/>
							</div>
							{activeProfile.burnRate > 80 && (
								<span className="text-[8px] text-rose-500 font-bold uppercase tracking-wider mt-1.5 block">
									High Burn: Working free soon!
								</span>
							)}
						</div>
					</div>
				</Card>

				{/* Card 3: Local Operational Efficiency */}
				<Card className="dark:bg-transparent p-4 h-fit border transition-all duration-300 hover:shadow-md hover:border-primary/20 hover:-translate-y-0.5">
					<div className="flex items-center gap-6 justify-between w-full">
						<div className="flex flex-col gap-0.5 shrink-0">
							<span className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider flex items-center gap-1.5">
								<ActivityIcon className="size-3.5 text-violet-500" />
								Local Operational Efficiency
							</span>
							<h3 className="font-mono text-2xl font-bold text-foreground mt-0.5">
								{currentEfficiency}%
							</h3>
							<div className="flex items-center gap-1.5 text-[10px] mt-0.5">
								<span className="inline-flex items-center gap-0.5 font-bold text-emerald-500">
									<TrendingUpIcon className="size-3" />
									+8.2%
								</span>
								<span className="text-muted-foreground">vs prior quarter</span>
							</div>
						</div>

						{/* Mini Sparkline Chart */}
						<div className="flex-1 h-12 min-w-0">
							<ResponsiveContainer width="100%" height="100%">
								<AreaChart data={baseEfficiencySparkline} margin={{ top: 2, right: 2, bottom: 2, left: 2 }}>
									<Area
										type="monotone"
										dataKey="val"
										stroke="var(--chart-4)"
										fill="var(--chart-4)"
										fillOpacity={0.08}
										strokeWidth={2.5}
										dot={false}
									/>
								</AreaChart>
							</ResponsiveContainer>
						</div>
					</div>
				</Card>
			</div>

			{/* Row 2: Charts and Omnichannel (Dropdown selection hidden on Omnichannel Spends) */}
			<div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
				<div className="lg:col-span-3">
					<FinancialBreakdown />
				</div>
				<div className="lg:col-span-1">
					<OmnichannelPerformance hideSelector={true} />
				</div>
			</div>

			{/* Row 3: Leaks and Churn Risks (Filtered exclusively for selected client) */}
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
				<div className="lg:col-span-2">
					<RevenueLeak />
				</div>
				<div className="lg:col-span-1">
					<ChurnShield />
				</div>
			</div>
		</div>
	);
}
