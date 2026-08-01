"use client";

import { cn } from "@/lib/utils";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
	Area,
	AreaChart,
	Line,
	LineChart,
	CartesianGrid,
	XAxis,
	YAxis,
	ResponsiveContainer,
	Tooltip as RechartsTooltip,
} from "recharts";
import { useAppContext } from "@/components/app-context";
import { Maximize2Icon, InfoIcon, AlertTriangleIcon } from "lucide-react";
import React, { useState, useEffect, useRef } from "react";
import { motion, useMotionValue } from "framer-motion";

// Mock Data
export const incomeCostData = [
	{ month: "Jan", Income: 28400, Cost: 16200 },
	{ month: "Feb", Income: 31200, Cost: 17800 },
	{ month: "Mar", Income: 29800, Cost: 18400 },
	{ month: "Apr", Income: 34100, Cost: 19100 },
	{ month: "May", Income: 35600, Cost: 20200 },
	{ month: "Jun", Income: 38200, Cost: 21500 },
	{ month: "Jul", Income: 36400, Cost: 20800 },
	{ month: "Aug", Income: 39500, Cost: 22100 },
	{ month: "Sep", Income: 41200, Cost: 23400 },
	{ month: "Oct", Income: 40500, Cost: 22800 },
	{ month: "Nov", Income: 42800, Cost: 24200 },
	{ month: "Dec", Income: 44500, Cost: 25100 },
];

export const mrrArpuLtvData = [
	{ month: "Jan", MRR: 30000, ARPU: 350, LTV: 8000 },
	{ month: "Feb", MRR: 31500, ARPU: 360, LTV: 8200 },
	{ month: "Mar", MRR: 31200, ARPU: 355, LTV: 8100 },
	{ month: "Apr", MRR: 33800, ARPU: 375, LTV: 8600 },
	{ month: "May", MRR: 34500, ARPU: 380, LTV: 8800 },
	{ month: "Jun", MRR: 36200, ARPU: 400, LTV: 9200 },
	{ month: "Jul", MRR: 35800, ARPU: 395, LTV: 9100 },
	{ month: "Aug", MRR: 38000, ARPU: 410, LTV: 9500 },
	{ month: "Sep", MRR: 39500, ARPU: 425, LTV: 9900 },
	{ month: "Oct", MRR: 39000, ARPU: 420, LTV: 9800 },
	{ month: "Nov", MRR: 41200, ARPU: 440, LTV: 10400 },
	{ month: "Dec", MRR: 43000, ARPU: 460, LTV: 11000 },
];

export const clientChartData: Record<string, { income: number; costs: number[]; mrr: number; arpu: number; ltv: number; leakId: string | null; leakAmt: number }> = {
	"Apex Digital": {
		income: 5000,
		costs: [2800, 3200, 4100, 5200, 5400, 4800, 4200, 4900, 5300, 5100, 4800, 4500],
		mrr: 5000, arpu: 150, ltv: 60000, leakId: "L1", leakAmt: 2400
	},
	"Helix Corp": {
		income: 12000,
		costs: [8200, 9500, 11400, 12600, 12200, 11800, 10500, 11100, 12300, 11900, 11500, 10800],
		mrr: 12000, arpu: 165, ltv: 144000, leakId: "L2", leakAmt: 1250
	},
	"Nova Soft": {
		income: 15000,
		costs: [11200, 12500, 14100, 15300, 15600, 14800, 13900, 14500, 15800, 15100, 14450, 13800],
		mrr: 15000, arpu: 175, ltv: 180000, leakId: "L3", leakAmt: 850
	},
	"Nexus Tech": {
		income: 8000,
		costs: [5200, 5800, 6400, 7100, 7500, 7300, 6800, 7200, 7900, 7650, 7100, 6800],
		mrr: 8000, arpu: 160, ltv: 96000, leakId: null, leakAmt: 0
	},
	"Orion Labs": {
		income: 6000,
		costs: [4200, 4600, 5100, 5800, 6200, 5900, 5400, 5800, 6300, 6100, 5600, 5200],
		mrr: 6000, arpu: 150, ltv: 72000, leakId: null, leakAmt: 0
	},
	"Vortex Tech": {
		income: 7000,
		costs: [5800, 6250, 6900, 7300, 7600, 7100, 6450, 6950, 7400, 7150, 6600, 6200],
		mrr: 7000, arpu: 140, ltv: 84000, leakId: null, leakAmt: 0
	},
	"Starlight Co": {
		income: 5000,
		costs: [3600, 3900, 4400, 5100, 5300, 4900, 4300, 4700, 5250, 5100, 4600, 4200],
		mrr: 5000, arpu: 135, ltv: 60000, leakId: null, leakAmt: 0
	}
};

export function FinancialBreakdown() {
	const { leaks, systemStatus, setZoomOpen, highlightedWidget, selectedClient, clientProfiles } = useAppContext();
	const [activeTab, setActiveTab] = useState<"income-cost" | "mrr-metrics">("income-cost");
	
	// Legend Toggles State
	const [visibleSeries, setVisibleSeries] = useState({
		Income: true,
		Cost: true,
		MRR: true,
		ARPU: true,
		LTV: true,
	});

	const toggleSeries = (key: keyof typeof visibleSeries) => {
		setVisibleSeries((prev) => ({ ...prev, [key]: !prev[key] }));
	};

	const formatCurrency = (val: number) => `$${val.toLocaleString()}`;

	const isHighlighted = highlightedWidget === "financial-breakdown";

	const isClientMode = selectedClient !== "All Accounts";

	useEffect(() => {
		if (isClientMode) {
			setActiveTab("income-cost");
		}
	}, [isClientMode]);
	const activeLeaksValue = leaks
		.filter((l) => l.status === "Leak" && (selectedClient === "All Accounts" || l.client === selectedClient))
		.reduce((sum, l) => sum + l.amount, 0);

	const securedLeaksValue = leaks
		.filter((l) => l.status === "Secured" && (selectedClient === "All Accounts" || l.client === selectedClient))
		.reduce((sum, l) => sum + l.amount, 0);

	const dynamicIncomeCostData = incomeCostData.map((data, idx) => {
		if (isClientMode) {
			const config = clientChartData[selectedClient];
			if (config) {
				let income = clientProfiles[selectedClient]?.income ?? config.income;
				let cost = config.costs[idx];

				// Adjust last month (December) with active and secured unbilled leaks
				if (idx === incomeCostData.length - 1) {
					income = income - activeLeaksValue + securedLeaksValue;
				}

				if (systemStatus === "api-failure") {
					cost = parseFloat((cost * 1.1).toFixed(0));
					income = parseFloat((income * 0.8).toFixed(0));
				}

				return { month: data.month, Income: income, Cost: cost };
			}
		}

		if (idx === incomeCostData.length - 1) { // December
			let income = 44500 - activeLeaksValue + securedLeaksValue;
			let cost = 25100;
			if (systemStatus === "api-failure") {
				cost += 3500;
			}
			return { ...data, Income: income, Cost: cost };
		}
		return data;
	});

	const dynamicMrrArpuLtvData = mrrArpuLtvData.map((data, idx) => {
		if (isClientMode) {
			const config = clientChartData[selectedClient];
			if (config) {
				let mrr = clientProfiles[selectedClient]?.income ?? config.mrr;
				let arpu = config.arpu;
				let ltv = config.ltv;

				// Adjust last month (December) with active and secured unbilled leaks
				if (idx === mrrArpuLtvData.length - 1) {
					mrr = mrr - activeLeaksValue + securedLeaksValue;
				}

				if (systemStatus === "api-failure") {
					mrr = parseFloat((mrr * 0.8).toFixed(0));
				}

				const factor = 1 + (idx - 6) * 0.02; // smooth trend
				arpu = parseFloat((arpu * factor).toFixed(0));
				ltv = parseFloat((ltv * factor).toFixed(0));

				return { month: data.month, MRR: mrr, ARPU: arpu, LTV: ltv };
			}
		}

		if (idx === mrrArpuLtvData.length - 1) { // December
			let mrr = 43000 - activeLeaksValue + securedLeaksValue;
			return { ...data, MRR: mrr };
		}
		return data;
	});

	return (
		<Card
			id="financial-breakdown"
			className={cn(
				"md:col-span-2 lg:col-span-3 dark:bg-transparent relative flex flex-col justify-between transition-all duration-300",
				isHighlighted && "ring-2 ring-primary ring-offset-2 shadow-2xl animate-pulse border-primary"
			)}
		>
			<CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b pb-3 gap-2">
				<div>
					<CardTitle className="text-base font-semibold">Financial Breakdown</CardTitle>
					<CardDescription className="text-xs">
						Agency profitability analysis and core revenue health.
					</CardDescription>
				</div>

				<div className="flex items-center gap-2">
					{/* Tab Buttons */}
					{!isClientMode && (
						<div className="flex rounded-lg bg-muted p-1">
							<button
								onClick={() => setActiveTab("income-cost")}
								className={cn(
									"rounded-md px-3 py-1 text-xs font-medium transition-all",
									activeTab === "income-cost"
										? "bg-background text-foreground shadow-xs border"
										: "text-muted-foreground hover:text-foreground"
								)}
								disabled={systemStatus === "api-failure"}
							>
								Income vs Cost
							</button>
							<button
								onClick={() => setActiveTab("mrr-metrics")}
								className={cn(
									"rounded-md px-3 py-1 text-xs font-medium transition-all",
									activeTab === "mrr-metrics"
										? "bg-background text-foreground shadow-xs border"
										: "text-muted-foreground hover:text-foreground"
								)}
								disabled={systemStatus === "api-failure"}
							>
								MRR / ARPU / LTV
							</button>
						</div>
					)}

					{/* Zoom trigger */}
					<Button
						variant="ghost"
						size="icon-xs"
						onClick={() => setZoomOpen(true)}
						title="Zoom Chart"
						disabled={systemStatus === "api-failure"}
					>
						<Maximize2Icon className="size-4" />
					</Button>
				</div>
			</CardHeader>

			{/* Custom Filters/Legends row */}
			<div className="flex items-center px-6 py-2.5 bg-muted/10 border-b text-[10px] gap-2 font-medium flex-wrap">
				<span className="text-muted-foreground uppercase font-bold tracking-wider mr-2 flex items-center gap-1">
					<InfoIcon className="size-3" /> Toggle Series:
				</span>

				{activeTab === "income-cost" ? (
					<>
						<button
							onClick={() => toggleSeries("Income")}
							className={cn(
								"flex items-center gap-1.5 px-2 py-0.5 rounded-full border transition-all",
								visibleSeries.Income
									? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
									: "opacity-40 border-transparent text-muted-foreground"
							)}
							disabled={systemStatus === "api-failure"}
						>
							<span className="size-2 rounded-full bg-emerald-500" />
							Income (Stripe)
						</button>
						<button
							onClick={() => toggleSeries("Cost")}
							className={cn(
								"flex items-center gap-1.5 px-2 py-0.5 rounded-full border transition-all",
								visibleSeries.Cost
									? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20"
									: "opacity-40 border-transparent text-muted-foreground"
							)}
							disabled={systemStatus === "api-failure"}
						>
							<span className="size-2 rounded-full bg-rose-500" />
							Cost (Delivery + Ads)
						</button>
					</>
				) : (
					<>
						<button
							onClick={() => toggleSeries("MRR")}
							className={cn(
								"flex items-center gap-1.5 px-2 py-0.5 rounded-full border transition-all",
								visibleSeries.MRR
									? "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20"
									: "opacity-40 border-transparent text-muted-foreground"
							)}
							disabled={systemStatus === "api-failure"}
						>
							<span className="size-2 rounded-full bg-sky-500" />
							MRR
						</button>
						<button
							onClick={() => toggleSeries("ARPU")}
							className={cn(
								"flex items-center gap-1.5 px-2 py-0.5 rounded-full border transition-all",
								visibleSeries.ARPU
									? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
									: "opacity-40 border-transparent text-muted-foreground"
							)}
							disabled={systemStatus === "api-failure"}
						>
							<span className="size-2 rounded-full bg-amber-500" />
							ARPU
						</button>
						<button
							onClick={() => toggleSeries("LTV")}
							className={cn(
								"flex items-center gap-1.5 px-2 py-0.5 rounded-full border transition-all",
								visibleSeries.LTV
									? "bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20"
									: "opacity-40 border-transparent text-muted-foreground"
							)}
							disabled={systemStatus === "api-failure"}
						>
							<span className="size-2 rounded-full bg-violet-500" />
							LTV
						</button>
					</>
				)}
			</div>

			{/* Chart Body */}
			<CardContent className="p-4 flex-1 flex flex-col justify-center min-h-[250px]">
				{systemStatus === "api-failure" ? (
					<div className="flex flex-col md:flex-row gap-5 items-center justify-between p-5 bg-amber-500/5 border border-dashed border-amber-500/20 rounded-xl min-h-[240px] animate-in fade-in duration-300">
						{/* Warning Message block */}
						<div className="flex-1 flex flex-col gap-2.5">
							<div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
								<AlertTriangleIcon className="size-5 animate-bounce" />
								<strong className="text-sm uppercase tracking-wider font-semibold">Stripe Pipeline Outage</strong>
							</div>
							<h3 className="text-base font-bold text-foreground leading-snug">
								API OFFLINE - Stripe and Paddle streams are currently unreachable.
							</h3>
							<p className="text-xs text-muted-foreground leading-relaxed">
								System has automatically entered cache-retention mode. All metrics shown are fallback values derived from local storage cache to ensure business continuity.
							</p>
						</div>

						{/* Technical Info Panel detailing Stripe sync logs */}
						<div className="w-full md:w-80 bg-muted/40 border rounded-lg p-4 flex flex-col gap-3 font-sans text-xs shrink-0">
							<span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider border-b pb-1.5">
								API Synchronizer Logs
							</span>
							<div className="flex flex-col gap-2 font-medium">
								<div className="flex justify-between border-b pb-1.5">
									<span className="text-muted-foreground">Error Code</span>
									<span className="font-semibold text-rose-500">ERR_STRIPE_CONN_TIMEOUT</span>
								</div>
								<div className="flex justify-between border-b pb-1.5">
									<span className="text-muted-foreground">Socket State</span>
									<span className="font-semibold text-amber-500">RETRY_BACKOFF (60s)</span>
								</div>
								<div className="flex justify-between border-b pb-1.5">
									<span className="text-muted-foreground">Last Successful Ping</span>
									<span className="text-foreground">4 minutes ago</span>
								</div>
								<div className="flex justify-between">
									<span className="text-muted-foreground">Cache Lifespan</span>
									<span className="text-emerald-500">92h remaining</span>
								</div>
							</div>
						</div>
					</div>
				) : (
					<div 
						onClick={() => setZoomOpen(true)}
						className="w-full h-64 cursor-pointer hover:bg-muted/10 transition-all border rounded-lg p-2 relative bg-background/5"
						title="Click to expand chart"
					>
						<ResponsiveContainer width="100%" height="100%">
							{activeTab === "income-cost" ? (
								<AreaChart data={dynamicIncomeCostData}>
									<defs>
										<linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
											<stop offset="5%" stopColor="#10b981" stopOpacity={0.25}/>
											<stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
										</linearGradient>
										<linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
											<stop offset="5%" stopColor="#f43f5e" stopOpacity={0.2}/>
											<stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
										</linearGradient>
									</defs>
									<CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
									<XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} style={{ fontSize: 10 }} />
									<YAxis tickLine={false} axisLine={false} tickMargin={8} tickFormatter={(v) => `$${(v/1000)}k`} style={{ fontSize: 10 }} />
									<RechartsTooltip 
										formatter={(value, name) => [`$${value ? Number(value).toLocaleString() : "0"}`, name]}
										contentStyle={{ background: "hsl(var(--popover))", borderColor: "hsl(var(--border))", borderRadius: 8, fontSize: 11 }}
										itemSorter={(item) => typeof item.value === 'number' ? -item.value : 0}
									/>
									{visibleSeries.Income && (
										<Area type="monotone" dataKey="Income" stroke="#10b981" fillOpacity={1} fill="url(#colorIncome)" strokeWidth={2} />
									)}
									{visibleSeries.Cost && (
										<Area type="monotone" dataKey="Cost" stroke="#f43f5e" fillOpacity={1} fill="url(#colorCost)" strokeWidth={2} />
									)}
								</AreaChart>
							) : (
								<LineChart data={dynamicMrrArpuLtvData}>
									<CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
									<XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} style={{ fontSize: 10 }} />
									<YAxis yAxisId="left" tickLine={false} axisLine={false} tickMargin={8} tickFormatter={(v) => `$${(v/1000)}k`} style={{ fontSize: 10 }} />
									<YAxis yAxisId="right" orientation="right" tickLine={false} axisLine={false} tickMargin={8} tickFormatter={(v) => `$${v}`} style={{ fontSize: 10 }} />
									<RechartsTooltip 
										formatter={(value, name) => [`$${value ? Number(value).toLocaleString() : "0"}`, name]}
										contentStyle={{ background: "hsl(var(--popover))", borderColor: "hsl(var(--border))", borderRadius: 8, fontSize: 11 }}
										itemSorter={(item) => typeof item.value === 'number' ? -item.value : 0}
									/>
									{visibleSeries.MRR && (
										<Line yAxisId="left" type="monotone" dataKey="MRR" stroke="var(--chart-3)" strokeWidth={2.5} dot={{ r: 4 }} isAnimationActive={false} />
									)}
									{visibleSeries.ARPU && (
										<Line yAxisId="right" type="monotone" dataKey="ARPU" stroke="var(--chart-4)" strokeWidth={2.5} dot={{ r: 4 }} isAnimationActive={false} />
									)}
									{visibleSeries.LTV && (
										<Line yAxisId="right" type="monotone" dataKey="LTV" stroke="var(--chart-5)" strokeWidth={2.5} dot={{ r: 4 }} isAnimationActive={false} />
									)}
								</LineChart>
							)}
						</ResponsiveContainer>
					</div>
				)}
			</CardContent>
			
			{/* Bottom mini statistics block */}
			<div className="flex items-center gap-4 px-6 pb-4 text-[10px] text-muted-foreground border-t pt-3">
				<span>Current Period Leakage Impact: <strong className={cn(activeLeaksValue > 0 ? "text-rose-500 font-semibold" : "text-emerald-500")}>-${activeLeaksValue.toLocaleString()} unbilled</strong></span>
				<span>•</span>
				<span>Stripe Pipeline Status: <strong className={systemStatus === "api-failure" ? "text-rose-550 font-bold" : "text-emerald-500 font-semibold"}>{systemStatus === "api-failure" ? "OUTAGE" : "NOMINAL"}</strong></span>
			</div>
		</Card>
	);
}
