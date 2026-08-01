"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAppContext } from "@/components/app-context";
import {
	XIcon,
	ZoomInIcon,
	ZoomOutIcon,
	RotateCcwIcon,
	CalendarIcon,
	AlertTriangleIcon,
} from "lucide-react";
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
import React, { useState, useMemo, useRef, useEffect } from "react";
import { motion, useMotionValue } from "framer-motion";
import { incomeCostData, mrrArpuLtvData, clientChartData } from "@/components/visitors-chart";

// Mock Years Data for Year View
const incomeCostYearData = [
	{ month: "2022", Income: 242000, Cost: 142000 },
	{ month: "2023", Income: 288000, Cost: 168000 },
	{ month: "2024", Income: 341000, Cost: 196000 },
	{ month: "2025", Income: 425000, Cost: 232000 },
	{ month: "2026", Income: 495000, Cost: 271000 },
];

const mrrArpuYearData = [
	{ month: "2022", MRR: 21000, ARPU: 290, LTV: 6800 },
	{ month: "2023", MRR: 24500, ARPU: 320, LTV: 7300 },
	{ month: "2024", MRR: 29000, ARPU: 370, LTV: 8500 },
	{ month: "2025", MRR: 36000, ARPU: 415, LTV: 9800 },
	{ month: "2026", MRR: 44200, ARPU: 465, LTV: 11200 },
];

export function ModalZoom() {
	const { leaks, systemStatus, setZoomOpen, selectedClient, clientProfiles } = useAppContext();
	const [activeTab, setActiveTab] = useState<"income-cost" | "mrr-metrics">("income-cost");
	const [timeRange, setTimeRange] = useState<"day" | "month" | "year">("month");
	const [zoom, setZoom] = useState(0);
	
	// Legend visibility
	const [visibleSeries, setVisibleSeries] = useState({
		Income: true,
		Cost: true,
		MRR: true,
		ARPU: true,
		LTV: true,
	});

	// Compute dynamic leaks values filtered by selectedClient
	const activeLeaksValue = useMemo(() => {
		return leaks
			.filter((l) => l.status === "Leak" && (selectedClient === "All Accounts" || l.client === selectedClient))
			.reduce((sum, l) => sum + l.amount, 0);
	}, [leaks, selectedClient]);

	const securedLeaksValue = useMemo(() => {
		return leaks
			.filter((l) => l.status === "Secured" && (selectedClient === "All Accounts" || l.client === selectedClient))
			.reduce((sum, l) => sum + l.amount, 0);
	}, [leaks, selectedClient]);

	const isClientMode = selectedClient !== "All Accounts";

	useEffect(() => {
		if (isClientMode) {
			setActiveTab("income-cost");
		}
	}, [isClientMode]);

	// Dynamically compute monthly datasets based on context values
	const dynamicIncomeCostData = useMemo(() => {
		return incomeCostData.map((data, idx) => {
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
	}, [leaks, activeLeaksValue, securedLeaksValue, systemStatus, selectedClient, isClientMode, clientProfiles]);

	const dynamicMrrArpuLtvData = useMemo(() => {
		return mrrArpuLtvData.map((data, idx) => {
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

					const factor = 1 + (idx - 6) * 0.02;
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
	}, [leaks, activeLeaksValue, securedLeaksValue, selectedClient, isClientMode, clientProfiles]);

	// Dynamically compute yearly datasets based on context values
	const dynamicIncomeCostYearData = useMemo(() => {
		return incomeCostYearData.map((data) => {
			if (isClientMode) {
				const config = clientChartData[selectedClient];
				if (config) {
					let income = (clientProfiles[selectedClient]?.income ?? config.income) * 12;
					let cost = config.costs.reduce((sum: number, val: number) => sum + val, 0);

					if (data.month === "2026") {
						income = income - activeLeaksValue + securedLeaksValue;
						if (systemStatus === "api-failure") {
							cost = parseFloat((cost * 1.1).toFixed(0));
							income = parseFloat((income * 0.8).toFixed(0));
						}
					} else {
						const scale = 1 - (2026 - parseInt(data.month)) * 0.08;
						income = parseFloat((income * scale).toFixed(0));
						cost = parseFloat((cost * scale).toFixed(0));
					}
					return { month: data.month, Income: income, Cost: cost };
				}
			}

			if (data.month === "2026") {
				let income = 495000 - activeLeaksValue + securedLeaksValue;
				let cost = 271000;
				if (systemStatus === "api-failure") {
					cost += 3500 * 12;
				}
				return { ...data, Income: income, Cost: cost };
			}
			return data;
		});
	}, [leaks, activeLeaksValue, securedLeaksValue, systemStatus, selectedClient, isClientMode, clientProfiles]);

	const dynamicMrrArpuYearData = useMemo(() => {
		return mrrArpuYearData.map((data) => {
			if (isClientMode) {
				const config = clientChartData[selectedClient];
				if (config) {
					let mrr = clientProfiles[selectedClient]?.income ?? config.mrr;
					let arpu = config.arpu;
					let ltv = config.ltv;

					if (data.month === "2026") {
						mrr = mrr - activeLeaksValue + securedLeaksValue;
						if (systemStatus === "api-failure") {
							mrr = parseFloat((mrr * 0.8).toFixed(0));
						}
					} else {
						const scale = 1 - (2026 - parseInt(data.month)) * 0.08;
						mrr = parseFloat((mrr * scale).toFixed(0));
						arpu = parseFloat((arpu * scale).toFixed(0));
						ltv = parseFloat((ltv * scale).toFixed(0));
					}
					return { month: data.month, MRR: mrr, ARPU: arpu, LTV: ltv };
				}
			}

			if (data.month === "2026") {
				let mrr = 44200 - activeLeaksValue + securedLeaksValue;
				return { ...data, MRR: mrr };
			}
			return data;
		});
	}, [leaks, activeLeaksValue, securedLeaksValue, selectedClient, isClientMode, clientProfiles]);

	// Select base data based on selected view (Month vs Year)
	const baseIncomeData = useMemo(() => {
		return timeRange === "year" ? dynamicIncomeCostYearData : dynamicIncomeCostData;
	}, [timeRange, dynamicIncomeCostYearData, dynamicIncomeCostData]);

	const baseMrrData = useMemo(() => {
		return timeRange === "year" ? dynamicMrrArpuYearData : dynamicMrrArpuLtvData;
	}, [timeRange, dynamicMrrArpuYearData, dynamicMrrArpuLtvData]);

	const maxVal = baseIncomeData.length - 1; // 11 for month, 4 for year

	// Double handle range values (continuous floats between 0 and maxVal)
	const [startVal, setStartVal] = useState<number>(0);
	const [endVal, setEndVal] = useState<number>(timeRange === "year" ? 4 : 11);
	const [dragging, setDragging] = useState<"start" | "end" | null>(null);

	const trackRef = useRef<HTMLDivElement>(null);

	// Reset slider ranges when the time scale changes
	useEffect(() => {
		setStartVal(0);
		setEndVal(timeRange === "year" ? 4 : 11);
	}, [timeRange]);

	const toggleSeries = (key: keyof typeof visibleSeries) => {
		setVisibleSeries((prev) => ({ ...prev, [key]: !prev[key] }));
	};

	// Clamping state inputs inside render to prevent switch array out-of-bounds error
	const safeStartVal = Math.max(0, Math.min(maxVal - 0.5, startVal));
	const safeEndVal = Math.max(safeStartVal + 0.5, Math.min(maxVal, endVal));
	const itemsToShowCount = Math.max(2, Math.round(safeEndVal - safeStartVal) + 1);

	// Zoom In/Out/Reset working in tandem with the double slider range
	const handleZoomIn = () => {
		const mid = (safeStartVal + safeEndVal) / 2;
		setStartVal(Math.max(0, Math.min(mid - 0.5, safeStartVal + 1)));
		setEndVal(Math.min(maxVal, Math.max(mid + 0.5, safeEndVal - 1)));
	};

	const handleZoomOut = () => {
		setStartVal(Math.max(0, safeStartVal - 1));
		setEndVal(Math.min(maxVal, safeEndVal + 1));
	};

	const handleReset = () => {
		setStartVal(0);
		setEndVal(maxVal);
	};

	// Mouse Drag and range click operations
	const handleMouseDown = (e: React.MouseEvent) => {
		if (systemStatus === "api-failure" || !trackRef.current) return;
		const rect = trackRef.current.getBoundingClientRect();
		const clientX = e.clientX;
		const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
		const val = ratio * maxVal;

		// Find closer handle
		const distToStart = Math.abs(val - safeStartVal);
		const distToEnd = Math.abs(val - safeEndVal);

		if (distToStart < distToEnd) {
			setStartVal(Math.min(safeEndVal - 0.5, val));
			setDragging("start");
		} else {
			setEndVal(Math.max(safeStartVal + 0.5, val));
			setDragging("end");
		}
	};

	useEffect(() => {
		const handleMouseMove = (e: MouseEvent) => {
			if (!dragging || !trackRef.current) return;
			const rect = trackRef.current.getBoundingClientRect();
			const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
			const val = ratio * maxVal;

			if (dragging === "start") {
				// Prevent overlapping with endVal (min gap of 0.5 unit)
				setStartVal(Math.min(safeEndVal - 0.5, val));
			} else {
				// Prevent overlapping with startVal (min gap of 0.5 unit)
				setEndVal(Math.max(safeStartVal + 0.5, val));
			}
		};

		const handleMouseUp = () => {
			setDragging(null);
		};

		if (dragging) {
			window.addEventListener("mousemove", handleMouseMove);
			window.addEventListener("mouseup", handleMouseUp);
		}

		return () => {
			window.removeEventListener("mousemove", handleMouseMove);
			window.removeEventListener("mouseup", handleMouseUp);
		};
	}, [dragging, safeStartVal, safeEndVal, maxVal]);

	// Sliced data computation (Interpolated smoothly using safe clamped handles)
	const activeIncomeData = useMemo(() => {
		const result = [];
		const step = (safeEndVal - safeStartVal) / (itemsToShowCount - 1);

		for (let k = 0; k < itemsToShowCount; k++) {
			const t = safeStartVal + k * step;
			const t0 = Math.floor(t);
			const t1 = Math.min(maxVal, t0 + 1);
			const f = t - t0;

			const row0 = baseIncomeData[t0];
			const row1 = baseIncomeData[t1] || row0;

			const interpolatedIncome = row0.Income * (1 - f) + row1.Income * f;
			const interpolatedCost = row0.Cost * (1 - f) + row1.Cost * f;

			// Closest month for X-axis label
			const closestRow = baseIncomeData[Math.round(t)] || row0;

			result.push({
				month: closestRow.month,
				Income: Math.round(interpolatedIncome),
				Cost: Math.round(interpolatedCost),
			});
		}
		return result;
	}, [safeStartVal, safeEndVal, itemsToShowCount, baseIncomeData, maxVal]);

	const activeMrrData = useMemo(() => {
		const result = [];
		const step = (safeEndVal - safeStartVal) / (itemsToShowCount - 1);

		for (let k = 0; k < itemsToShowCount; k++) {
			const t = safeStartVal + k * step;
			const t0 = Math.floor(t);
			const t1 = Math.min(maxVal, t0 + 1);
			const f = t - t0;

			const row0 = baseMrrData[t0];
			const row1 = baseMrrData[t1] || row0;

			const interpolatedMrr = row0.MRR * (1 - f) + row1.MRR * f;
			const interpolatedArpu = row0.ARPU * (1 - f) + row1.ARPU * f;
			const interpolatedLtv = row0.LTV * (1 - f) + row1.LTV * f;

			const closestRow = baseMrrData[Math.round(t)] || row0;

			result.push({
				month: closestRow.month,
				MRR: Math.round(interpolatedMrr),
				ARPU: Math.round(interpolatedArpu),
				LTV: Math.round(interpolatedLtv),
			});
		}
		return result;
	}, [safeStartVal, safeEndVal, itemsToShowCount, baseMrrData, maxVal]);



	const formatCurrency = (val: number) => `$${val.toLocaleString()}`;

	const startMonthLabel = baseIncomeData[Math.round(safeStartVal)]?.month || "Start";
	const endMonthLabel = baseIncomeData[Math.round(safeEndVal)]?.month || "End";

	return (
		<div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-xs flex items-center justify-center p-4">
			<div className="bg-popover border rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col justify-between animate-in zoom-in-95 duration-200">
				{/* Modal Header */}
				<div className="flex items-center justify-between border-b p-5 bg-muted/20">
					<div>
						<h3 className="text-base font-bold text-foreground flex items-center gap-2 flex-wrap">
							<CalendarIcon className="size-4 text-primary" />
							<span>Advanced Financial Analytics</span>
							{selectedClient !== "All Accounts" && (
								<span className="text-[10px] bg-primary/15 text-primary border border-primary/20 rounded-md px-2 py-0.5 font-bold uppercase tracking-wider animate-in fade-in duration-200">
									Client: {selectedClient}
								</span>
							)}
						</h3>
						<p className="text-xs text-muted-foreground">
							{selectedClient !== "All Accounts"
								? `Detailed contract-level analysis curves for ${selectedClient}.`
								: "Interactive deep dive of unbilled leaks and subscription pipelines."}
						</p>
					</div>
					<button
						onClick={() => setZoomOpen(false)}
						className="rounded-md p-1.5 hover:bg-muted text-muted-foreground hover:text-foreground transition-all"
					>
						<XIcon className="size-4" />
					</button>
				</div>

				{/* Controls Bar */}
				<div className="flex flex-wrap items-center justify-between gap-4 p-4 border-b bg-muted/10 text-xs">
					{/* Toggle Chart Type */}
					{!isClientMode && (
						<div className="flex items-center gap-3">
							<span className="text-[10px] text-muted-foreground uppercase font-semibold">
								Data Set:
							</span>
							<div className="flex rounded-md bg-muted p-0.5 border">
								<button
									onClick={() => setActiveTab("income-cost")}
									disabled={systemStatus === "api-failure"}
									className={cn(
										"rounded-sm px-3 py-1 font-medium transition-all",
										activeTab === "income-cost"
											? "bg-background text-foreground shadow-xs"
											: "text-muted-foreground hover:text-foreground"
									)}
								>
									Income vs Cost
								</button>
								<button
									onClick={() => setActiveTab("mrr-metrics")}
									disabled={systemStatus === "api-failure"}
									className={cn(
										"rounded-sm px-3 py-1 font-medium transition-all",
										activeTab === "mrr-metrics"
											? "bg-background text-foreground shadow-xs"
											: "text-muted-foreground hover:text-foreground"
									)}
								>
									MRR/ARPU/LTV
								</button>
							</div>
						</div>
					)}

					{/* Time Range Filters */}
					<div className="flex items-center gap-3">
						<span className="text-[10px] text-muted-foreground uppercase font-semibold">
							Time range:
						</span>
						<div className="flex rounded-md bg-muted p-0.5 border">
							<button
								disabled
								className="rounded-sm px-3 py-1 font-medium text-muted-foreground/35 cursor-not-allowed"
								title="Day view currently disabled"
							>
								Day
							</button>
							<button
								onClick={() => setTimeRange("month")}
								disabled={systemStatus === "api-failure"}
								className={cn(
									"rounded-sm px-3 py-1 font-medium transition-all",
									timeRange === "month"
										? "bg-background text-foreground shadow-xs"
										: "text-muted-foreground hover:text-foreground"
								)}
							>
								Month
							</button>
							<button
								onClick={() => setTimeRange("year")}
								disabled={systemStatus === "api-failure"}
								className={cn(
									"rounded-sm px-3 py-1 font-medium transition-all",
									timeRange === "year"
										? "bg-background text-foreground shadow-xs"
										: "text-muted-foreground hover:text-foreground"
								)}
							>
								Year
							</button>
						</div>
					</div>

					{/* Zoom Controls */}
					<div className="flex items-center gap-2">
						<span className="text-[10px] text-muted-foreground uppercase font-semibold mr-1">
							Zoom:
						</span>
						<Button
							size="sm"
							variant="outline"
							disabled={systemStatus === "api-failure" || safeEndVal - safeStartVal <= 1}
							onClick={handleZoomIn}
							className="h-8 gap-1"
						>
							<ZoomInIcon className="size-3.5" />
							In
						</Button>
						<Button
							size="sm"
							variant="outline"
							disabled={systemStatus === "api-failure" || (safeStartVal === 0 && safeEndVal === maxVal)}
							onClick={handleZoomOut}
							className="h-8 gap-1"
						>
							<ZoomOutIcon className="size-3.5" />
							Out
						</Button>
						<Button
							size="sm"
							variant="outline"
							disabled={systemStatus === "api-failure"}
							onClick={handleReset}
							className="h-8 gap-1"
						>
							<RotateCcwIcon className="size-3.5" />
							Reset
						</Button>
					</div>
				</div>

				{/* Legends */}
				<div className="flex flex-wrap items-center bg-muted/5 px-5 py-2 border-b gap-3 text-xs">
					<span className="text-[10px] text-muted-foreground uppercase font-semibold">
						Legend Filter:
					</span>
					{activeTab === "income-cost" ? (
						<>
							<button
								onClick={() => toggleSeries("Income")}
								disabled={systemStatus === "api-failure"}
								className={cn(
									"flex items-center gap-1.5 px-3 py-1 rounded-full border transition-all",
									visibleSeries.Income
										? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
										: "opacity-40 border-transparent text-muted-foreground"
								)}
							>
								<span className="size-2 rounded-full bg-emerald-500" />
								Income (Stripe)
							</button>
							<button
								onClick={() => toggleSeries("Cost")}
								disabled={systemStatus === "api-failure"}
								className={cn(
									"flex items-center gap-1.5 px-3 py-1 rounded-full border transition-all",
									visibleSeries.Cost
										? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20"
										: "opacity-40 border-transparent text-muted-foreground"
								)}
							>
								<span className="size-2 rounded-full bg-rose-500" />
								Cost (Delivery + Ads)
							</button>
						</>
					) : (
						<>
							<button
								onClick={() => toggleSeries("MRR")}
								disabled={systemStatus === "api-failure"}
								className={cn(
									"flex items-center gap-1.5 px-3 py-1 rounded-full border transition-all",
									visibleSeries.MRR
										? "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20"
										: "opacity-40 border-transparent text-muted-foreground"
								)}
							>
								<span className="size-2 rounded-full bg-sky-500" />
								MRR
							</button>
							<button
								onClick={() => toggleSeries("ARPU")}
								disabled={systemStatus === "api-failure"}
								className={cn(
									"flex items-center gap-1.5 px-3 py-1 rounded-full border transition-all",
									visibleSeries.ARPU
										? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
										: "opacity-40 border-transparent text-muted-foreground"
								)}
							>
								<span className="size-2 rounded-full bg-amber-500" />
								ARPU
							</button>
							<button
								onClick={() => toggleSeries("LTV")}
								disabled={systemStatus === "api-failure"}
								className={cn(
									"flex items-center gap-1.5 px-3 py-1 rounded-full border transition-all",
									visibleSeries.LTV
										? "bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20"
										: "opacity-40 border-transparent text-muted-foreground"
								)}
							>
								<span className="size-2 rounded-full bg-violet-500" />
								LTV
							</button>
						</>
					)}
				</div>

				{/* Big Chart Container */}
				<div className="p-6 bg-background flex-1 min-h-[350px]">
					{systemStatus === "api-failure" ? (
						<div className="flex flex-col md:flex-row gap-5 items-center justify-between p-5 bg-amber-500/5 border border-dashed border-amber-500/20 rounded-xl min-h-[320px] animate-in fade-in duration-300">
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
									System has automatically entered cache-retention mode. Detailed chart analysis is unavailable while connection stream is interrupted.
								</p>
							</div>

							{/* Technical Info Panel detailing Stripe sync logs */}
							<div className="w-full md:w-80 bg-muted/40 border rounded-lg p-4 flex flex-col gap-3 font-sans text-xs shrink-0 select-text">
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
						<ResponsiveContainer width="100%" height={320}>
							{activeTab === "income-cost" ? (
								<AreaChart data={activeIncomeData}>
									<defs>
										<linearGradient id="colorIncomeZoom" x1="0" y1="0" x2="0" y2="1">
											<stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
											<stop offset="95%" stopColor="#10b981" stopOpacity={0} />
										</linearGradient>
										<linearGradient id="colorCostZoom" x1="0" y1="0" x2="0" y2="1">
											<stop offset="5%" stopColor="#f43f5e" stopOpacity={0.2} />
											<stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
										</linearGradient>
									</defs>
									<CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
									<XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} style={{ fontSize: 10 }} />
									<YAxis tickLine={false} axisLine={false} tickFormatter={formatCurrency} style={{ fontSize: 10 }} />
									<RechartsTooltip 
										formatter={(value: any) => formatCurrency(Number(value))}
										contentStyle={{ background: "hsl(var(--popover))", borderRadius: 8, borderColor: "hsl(var(--border))" }}
										itemSorter={(item) => typeof item.value === 'number' ? -item.value : 0}
									/>
									{visibleSeries.Income && (
										<Area
											type="monotone"
											dataKey="Income"
											stroke="#10b981"
											fillOpacity={1}
											fill="url(#colorIncomeZoom)"
											strokeWidth={2.5}
											dot={{ r: 4 }}
											isAnimationActive={false}
										/>
									)}
									{visibleSeries.Cost && (
										<Area
											type="monotone"
											dataKey="Cost"
											stroke="#f43f5e"
											fillOpacity={1}
											fill="url(#colorCostZoom)"
											strokeWidth={2.5}
											dot={{ r: 4 }}
											isAnimationActive={false}
										/>
									)}
								</AreaChart>
							) : (
								<LineChart data={activeMrrData}>
									<CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
									<XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} style={{ fontSize: 10 }} />
									<YAxis yAxisId="left" tickLine={false} axisLine={false} tickFormatter={formatCurrency} style={{ fontSize: 10 }} />
									<YAxis yAxisId="right" orientation="right" tickLine={false} axisLine={false} tickFormatter={formatCurrency} style={{ fontSize: 10 }} />
									<RechartsTooltip 
										formatter={(value: any) => formatCurrency(Number(value))}
										contentStyle={{ background: "hsl(var(--popover))", borderRadius: 8, borderColor: "hsl(var(--border))" }}
										itemSorter={(item) => typeof item.value === 'number' ? -item.value : 0}
									/>
									{visibleSeries.MRR && (
										<Line
											yAxisId="left"
											type="monotone"
											dataKey="MRR"
											stroke="var(--chart-3)"
											strokeWidth={2.5}
											dot={{ r: 4 }}
											isAnimationActive={false}
										/>
									)}
									{visibleSeries.ARPU && (
										<Line
											yAxisId="right"
											type="monotone"
											dataKey="ARPU"
											stroke="var(--chart-4)"
											strokeWidth={2.5}
											dot={{ r: 4 }}
											isAnimationActive={false}
										/>
									)}
									{visibleSeries.LTV && (
										<Line
											yAxisId="right"
											type="monotone"
											dataKey="LTV"
											stroke="var(--chart-5)"
											strokeWidth={2.5}
											dot={{ r: 4 }}
											isAnimationActive={false}
										/>
									)}
								</LineChart>
							)}
						</ResponsiveContainer>
					)}
				</div>

				{/* Custom Double-Handle Range Slider Minimap */}
				{systemStatus !== "api-failure" && (
					<div className="border-t p-5 bg-muted/20 flex flex-col gap-2 select-none animate-in fade-in duration-300">
						<div className="flex items-center justify-between text-xs text-muted-foreground">
							<span>Historical Range Selector</span>
							<span>
								Showing: <strong>{startMonthLabel}</strong> to <strong>{endMonthLabel}</strong>
							</span>
						</div>

						<div className="relative py-4 px-2">
							{/* Slider Track */}
							<div
								ref={trackRef}
								onMouseDown={handleMouseDown}
								className="relative w-full h-2 bg-secondary rounded-full cursor-pointer"
							>
								{/* Selected Highlight Bar */}
								<div
									className="absolute top-0 bottom-0 bg-primary/20 rounded-full"
									style={{
										left: `${(safeStartVal / maxVal) * 100}%`,
										width: `${((safeEndVal - safeStartVal) / maxVal) * 100}%`,
									}}
								/>

								{/* Handle 1 (Start Value) */}
								<div
									className={cn(
										"absolute top-1/2 -translate-y-1/2 -ml-2.5 size-5 rounded-full border-2 bg-background shadow-md cursor-grab flex items-center justify-center",
										dragging === "start" ? "scale-110 cursor-grabbing border-primary" : "hover:border-primary/50",
										dragging === null && "transition-all duration-200"
									)}
									style={{ left: `${(safeStartVal / maxVal) * 100}%` }}
								/>

								{/* Handle 2 (End Value) */}
								<div
									className={cn(
										"absolute top-1/2 -translate-y-1/2 -ml-2.5 size-5 rounded-full border-2 bg-background shadow-md cursor-grab flex items-center justify-center",
										dragging === "end" ? "scale-110 cursor-grabbing border-primary" : "hover:border-primary/50",
										dragging === null && "transition-all duration-200"
									)}
									style={{ left: `${(safeEndVal / maxVal) * 100}%` }}
								/>
							</div>

							{/* Static Labels aligned underneath */}
							<div className="flex justify-between text-[10px] text-muted-foreground uppercase font-mono mt-3 px-0.5">
								{baseIncomeData.map((d, i) => (
									<span key={i} className="w-6 text-center select-none">
										{d.month.slice(0, 4)}
									</span>
								))}
							</div>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
