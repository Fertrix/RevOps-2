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

export function Dashboard() {
	const {
		illusionOfMargin,
		systemStatus,
		leaks,
		selectedClient,
		clientProfiles,
		agencyName,
		employeesCount,
	} = useAppContext();

	// Reactive Net Margin values
	const targetMargin = 65.0;
	let currentMargin = 54.2;
	let priorQuarter = 58.0;

	if (illusionOfMargin) {
		currentMargin = 68.5; // Skewed high
		priorQuarter = 65.0;
	} else {
		if (selectedClient === "All Accounts") {
			const activeLeaksValue = leaks.filter((l) => l.status === "Leak").reduce((sum, l) => sum + l.amount, 0);
			const penalty = activeLeaksValue / 450;
			currentMargin = parseFloat((64.5 - penalty - (systemStatus === "api-failure" ? 10 : 0)).toFixed(1));
			priorQuarter = 58.0;
		} else {
			const profile = clientProfiles[selectedClient] || { margin: 64.5, securedMargin: 64.5, priorQuarter: 58.0 };
			const isL1Secured = leaks.find((l) => l.id === "L1")?.status === "Secured";
			const isL2Secured = leaks.find((l) => l.id === "L2")?.status === "Secured";
			const isL3Secured = leaks.find((l) => l.id === "L3")?.status === "Secured";

			let baseMargin = profile.margin;
			if (selectedClient === "Apex Digital" && isL1Secured) baseMargin = profile.securedMargin;
			if (selectedClient === "Helix Corp" && isL2Secured) baseMargin = profile.securedMargin;
			if (selectedClient === "Nova Soft" && isL3Secured) baseMargin = profile.securedMargin;

			currentMargin = systemStatus === "api-failure" ? parseFloat((baseMargin - 10).toFixed(1)) : baseMargin;
			priorQuarter = profile.priorQuarter;
		}
	}

	const marginDiff = parseFloat((currentMargin - priorQuarter).toFixed(1));

	// Make sparkline dynamic as well (last value tracks current margin)
	const dynamicMarginSparkline = [
		{ val: 50 },
		{ val: 56 },
		{ val: 42 },
		{ val: 62 },
		{ val: 48 },
		{ val: currentMargin },
	];

	const activeProfile = selectedClient !== "All Accounts" ? clientProfiles[selectedClient] : null;

	// Calculate active leak ratio to connect projection with actual database leaks
	const activeLeaksCount = leaks.filter((l) => l.status === "Leak").length;
	const totalLeaksCount = leaks.filter((l) => l.status !== "Deleted").length;
	const activeRatio = totalLeaksCount > 0 ? activeLeaksCount / totalLeaksCount : 0;

	const projectedLeakAmount = Math.round(employeesCount * 950 * activeRatio);
	const projectedUnbilledHours = parseFloat((employeesCount * 3.8 * activeRatio).toFixed(1));

	// Calculate dynamic operational efficiency based on client profiles and active leaks
	let currentEfficiency = 84.5;
	if (selectedClient === "All Accounts") {
		currentEfficiency = parseFloat((84.5 - activeLeaksCount * 2.0).toFixed(1));
	} else if (activeProfile) {
		const clientLeak = leaks.find((l) => l.client === selectedClient && l.status === "Leak");
		currentEfficiency = clientLeak ? parseFloat((activeProfile.efficiency - 10).toFixed(1)) : activeProfile.efficiency;
	}

	return (
		<div className="flex flex-col gap-6 w-full animate-in fade-in duration-300">
			{/* Row 1: Quick Metric Cards (Consistent 3 columns layout) */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
				{/* Card 1: Net Margin Summary Card */}
				<Card className="dark:bg-transparent p-4 h-fit border transition-all duration-300 hover:shadow-md hover:border-primary/20 hover:-translate-y-0.5">
					<div className="flex items-center gap-6 justify-between w-full">
						<div className="flex flex-col gap-0.5 shrink-0">
							<span className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider flex items-center gap-1.5">
								<CoinsIcon className="size-3.5 text-emerald-500" />
								{selectedClient === "All Accounts" ? `Financial Summary (${agencyName})` : "Client Net Margin"}
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

						{/* Mini Sparkline Chart stretching horizontally */}
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

				{/* Card 2 (Client Mode): Burn Rate of Retainer */}
				{selectedClient !== "All Accounts" && activeProfile && (
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
				)}

				{/* Card 2 (Global Mode): Agency Leakage Projection */}
				{selectedClient === "All Accounts" && (
					<Card className="dark:bg-transparent p-4 h-fit border transition-all duration-300 hover:shadow-md hover:border-primary/20 hover:-translate-y-0.5">
						<div className="flex items-center gap-6 justify-between w-full">
							<div className="flex flex-col gap-0.5 shrink-0">
								<span className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider flex items-center gap-1.5">
									<FlameIcon className="size-3.5 text-rose-500 animate-pulse" />
									Agency Leakage Projection
								</span>
								<h3 className="font-mono text-2xl font-bold text-foreground mt-0.5">
									${projectedLeakAmount.toLocaleString()}
								</h3>
								<div className="flex items-center gap-1.5 text-[10px] mt-0.5">
									<span className="font-bold text-rose-500">
										{projectedUnbilledHours} hrs/wk
									</span>
									<span className="text-muted-foreground">unbilled (scale: {employeesCount} employees)</span>
								</div>
							</div>

							{/* Progress Pill indicator */}
							<div className="flex-1 flex flex-col justify-center px-1">
								<div className="relative w-full h-2 bg-secondary rounded-full overflow-hidden">
									<div
										className="h-full rounded-full transition-all duration-500 ease-out bg-rose-500 animate-pulse"
										style={{ width: `${Math.min(100, projectedUnbilledHours)}%` }}
									/>
								</div>
								<span className="text-[8px] text-rose-500 font-bold uppercase tracking-wider mt-1.5 block">
									Loss rate projection
								</span>
							</div>
						</div>
					</Card>
				)}

				{/* Card 3: Operational Efficiency (Global / Local) */}
				<Card className="dark:bg-transparent p-4 h-fit border transition-all duration-300 hover:shadow-md hover:border-primary/20 hover:-translate-y-0.5">
					<div className="flex items-center gap-6 justify-between w-full">
						<div className="flex flex-col gap-0.5 shrink-0">
							<span className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider flex items-center gap-1.5">
								<ActivityIcon className="size-3.5 text-violet-500" />
								{selectedClient === "All Accounts" ? `Operational Efficiency (${agencyName})` : "Local Operational Efficiency"}
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

						{/* Mini Sparkline Chart stretching horizontally */}
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

			{/* Row 2: Charts and Omnichannel */}
			<div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
				<div className="lg:col-span-3">
					<FinancialBreakdown />
				</div>
				<div className="lg:col-span-1">
					<OmnichannelPerformance />
				</div>
			</div>

			{/* Row 3: Leaks and Churn Risks */}
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
