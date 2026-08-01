"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { useAppContext, ChurnAlert } from "@/components/app-context";
import {
	CheckIcon,
	ShieldCheckIcon,
	RadioIcon,
	XIcon,
	CheckCircle2Icon,
	XCircleIcon,
	TrendingDownIcon,
	BotIcon,
	RotateCcwIcon,
	SearchIcon,
	UserIcon,
	ActivityIcon,
	AlertCircleIcon,
} from "lucide-react";
import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CustomCheckbox, AnimatedCheck } from "@/components/ui/custom-checkbox";
import {
	ResponsiveContainer,
	AreaChart,
	Area,
	CartesianGrid,
	XAxis,
	YAxis,
	Tooltip as RechartsTooltip,
} from "recharts";

const getChurnTelemetry = (id: string) => {
	switch (id) {
		case "C4": // Nexus Tech injected scenario
			return {
				latencyData: [
					{ day: "14 days", value: 45 },
					{ day: "10 days", value: 45 },
					{ day: "7 days", value: 90 },
					{ day: "5 days", value: 240 },
					{ day: "3 days", value: 720 },
					{ day: "Yesterday", value: 1440 }, // 24 hours
				],
				sentiment: {
					historical: 90,
					current: 35,
					redFlags: [
						"Slack sentiment analysis for Nexus Tech dropped by 40% this week.",
						"We need to discuss terms...",
						"Disappointed with response time"
					]
				},
				health: [
					{ check: false, label: "Communication Rate", status: "Critical Slowdown (-140%)" },
					{ check: true, label: "Payment Punctuality", status: "Stable (0 days delay)" },
					{ check: false, label: "Deliverable Interaction", status: "Low activity (Client hasn't opened project dashboards)" }
				],
				summary: {
					happening: "The primary project sponsor left the company last week. The new point of contact has been using colder, more transactional language on Slack, resulting in a 40% drop in interaction warmth.",
					risk: "The new sponsor might want to bring in their own preferred external vendors, ending our retainer partnership suddenly.",
					recommendation: "Arrange an introductory introduction meeting with the new executive sponsor this week to showcase our Q2 achievements and align on their upcoming roadmap goals."
				}
			};
		case "C1":
		default:
			return {
				latencyData: [
					{ day: "14 days", value: 45 },
					{ day: "10 days", value: 45 },
					{ day: "7 days", value: 120 },
					{ day: "5 days", value: 360 },
					{ day: "3 days", value: 900 },
					{ day: "Yesterday", value: 2160 }, // 36 hours
				],
				sentiment: {
					historical: 92,
					current: 41,
					redFlags: [
						"As per our contract...",
						"We need to review the scope...",
						"Disappointed with the speed..."
					]
				},
				health: [
					{ check: false, label: "Communication Rate", status: "Critical Slowdown (-180%)" },
					{ check: true, label: "Payment Punctuality", status: "Stable (0 days delay)" },
					{ check: false, label: "Deliverable Interaction", status: "Low activity (Client hasn't opened project dashboards)" }
				],
				summary: {
					happening: "The client hasn't logged into the project dashboard for 2 weeks, and their last support request has been pending response for over 3 days.",
					risk: "They might feel neglected and look for alternative agencies, leading to a contract cancellation next month.",
					recommendation: "Schedule a quick 10-minute check-in call with their Product Manager and ensure the pending support ticket is resolved today."
				}
			};
		case "C2":
			return {
				latencyData: [
					{ day: "14 days", value: 60 },
					{ day: "10 days", value: 120 },
					{ day: "7 days", value: 480 },
					{ day: "5 days", value: 1440 }, // 24 hours
					{ day: "3 days", value: 2160 }, // 36 hours
					{ day: "Yesterday", value: 2880 }, // 48 hours
				],
				sentiment: {
					historical: 94,
					current: 31,
					redFlags: [
						"As per our contract...",
						"We are holding payment",
						"Disappointed with the speed..."
					]
				},
				health: [
					{ check: false, label: "Communication Rate", status: "Critical Slowdown (-240%)" },
					{ check: false, label: "Payment Punctuality", status: "Critical Delay (12 days late)" },
					{ check: false, label: "Deliverable Interaction", status: "Low activity (Client has not accessed the portal in 18 days)" }
				],
				summary: {
					happening: "Vortex Tech is experiencing friction with our recent software deployments, resulting in 4 support claims this week. Additionally, their last retainer payment is 12 days overdue.",
					risk: "They might hold back future payments entirely and put the partnership on pause.",
					recommendation: "Alert the Finance team to follow up on the invoice, and coordinate with the Lead Engineer to resolve the open technical claims immediately."
				}
			};
		case "C3":
			return {
				latencyData: [
					{ day: "14 days", value: 40 },
					{ day: "10 days", value: 40 },
					{ day: "7 days", value: 90 },
					{ day: "5 days", value: 240 },
					{ day: "3 days", value: 720 },
					{ day: "Yesterday", value: 1440 }, // 24 hours
				],
				sentiment: {
					historical: 90,
					current: 48,
					redFlags: [
						"Need invoices itemized...",
						"This pricing seems high",
						"We need a meeting asap"
					]
				},
				health: [
					{ check: false, label: "Communication Rate", status: "Warning Drift (-65%)" },
					{ check: false, label: "Payment Punctuality", status: "Warning Delay (7 days late)" },
					{ check: true, label: "Deliverable Interaction", status: "Stable (Last opened 2 days ago)" }
				],
				summary: {
					happening: "Their monthly retainer invoice is 7 days late. Communication response times have drifted from 40 minutes to over 24 hours.",
					risk: "This usually indicates budget reallocation discussions on their end, risking a sudden pause in services.",
					recommendation: "Send a friendly invoice reminder email and coordinate with the Account Manager to check in on their Q3 roadmap."
				}
			};
	}
};

export function ChurnShield() {
	const {
		churnAlerts,
		setChurnAlerts,
		selectedAlertIds,
		setSelectedAlertIds,
		activeAlertTab,
		setActiveAlertTab,
		runTelemetryScan,
		addLog,
		highlightedWidget,
		selectedClient,
		setSelectedClient,
		setActiveView,
	} = useAppContext();

	// State for Churn Slide-over Panel
	const [selectedAlertForPanel, setSelectedAlertForPanel] = useState<ChurnAlert | null>(null);
	const [panelTab, setPanelTab] = useState<"active" | "secured">("active");
	const [panelSearchOpen, setPanelSearchOpen] = useState(false);
	const [panelSearchQuery, setPanelSearchQuery] = useState("");

	const [panelOpen, setPanelOpen] = useState(false);

	// Lock body scroll when slide-over is open and force default active tab
	React.useEffect(() => {
		if (panelOpen) {
			document.body.style.overflow = "hidden";
			setPanelTab("active");
		} else {
			document.body.style.overflow = "";
		}
		return () => {
			document.body.style.overflow = "";
		};
	}, [panelOpen]);

	// Filter alerts for slide-over sidebar
	const filteredAlertsForSidebar = useMemo(() => {
		const clientScoped = churnAlerts.filter(
			(a) => selectedClient === "All Accounts" || a.client === selectedClient
		);
		const tabScoped = clientScoped.filter(
			(a) => a.status === (panelTab === "active" ? "active" : "secured")
		);
		if (!panelSearchQuery.trim()) return tabScoped;
		const query = panelSearchQuery.toLowerCase();
		return tabScoped.filter(
			(a) =>
				a.client.toLowerCase().includes(query) ||
				a.tags.some((t) => t.toLowerCase().includes(query)) ||
				a.severity.toLowerCase().includes(query)
		);
	}, [churnAlerts, selectedClient, panelTab, panelSearchQuery]);


	// Filter based on active severity tab and selected client
	const filteredAlerts = churnAlerts.filter((alert) => {
		if (alert.status !== "active") return false;
		if (selectedClient !== "All Accounts" && alert.client !== selectedClient) return false;
		if (activeAlertTab === "all") return true;
		return alert.severity === activeAlertTab;
	});

	// Checkboxes logic
	const isAllSelected =
		filteredAlerts.length > 0 &&
		filteredAlerts.every((a) => selectedAlertIds.includes(a.id));

	const handleSelectAll = (checked: boolean) => {
		if (checked) {
			const idsToSelect = filteredAlerts.map((a) => a.id);
			setSelectedAlertIds((prev) => {
				const uniqueIds = new Set([...prev, ...idsToSelect]);
				return Array.from(uniqueIds);
			});
		} else {
			const idsToRemove = filteredAlerts.map((a) => a.id);
			setSelectedAlertIds((prev) =>
				prev.filter((id) => !idsToRemove.includes(id))
			);
		}
	};

	const handleSelectOne = (id: string, checked: boolean) => {
		if (checked) {
			setSelectedAlertIds((prev) => [...prev, id]);
		} else {
			setSelectedAlertIds((prev) => prev.filter((item) => item !== id));
		}
	};

	// Resolve quick actions
	const handleResolveOne = (id: string, clientName: string) => {
		setChurnAlerts((prev) =>
			prev.map((alert) =>
				alert.id === id ? { ...alert, status: "secured" as const } : alert
			)
		);
		setSelectedAlertIds((prev) => prev.filter((item) => item !== id));
		addLog(`Churn Risk mitigated for client: ${clientName}. System telemetry stable.`, "success");
	};

	const handleResolveBulk = () => {
		setChurnAlerts((prev) =>
			prev.map((alert) =>
				selectedAlertIds.includes(alert.id)
					? { ...alert, status: "secured" as const }
					: alert
			)
		);
		addLog(`Mitigated ${selectedAlertIds.length} bulk selected churn risks.`, "success");
		setSelectedAlertIds([]);
	};

	// Filter alerts to match current view context (All Accounts vs specific Client Portfolio)
	const clientScopedAlerts = useMemo(() => {
		return churnAlerts.filter(
			(a) => selectedClient === "All Accounts" || a.client === selectedClient
		);
	}, [churnAlerts, selectedClient]);

	// Compute valid active alert showing
	const activeAlertToShow = useMemo(() => {
		if (selectedAlertForPanel && (selectedClient === "All Accounts" || selectedAlertForPanel.client === selectedClient)) {
			return selectedAlertForPanel;
		}
		// Fallback to first alert of current status tab
		const matches = clientScopedAlerts.filter(a => a.status === (panelTab === "active" ? "active" : "secured"));
		if (matches.length > 0) return matches[0];
		if (clientScopedAlerts.length > 0) return clientScopedAlerts[0];
		return null;
	}, [selectedAlertForPanel, selectedClient, clientScopedAlerts, panelTab]);

	// Active Churn alerts count filtered by selected client
	const activeAlertsCount = churnAlerts.filter(
		(a) =>
			a.status === "active" &&
			(selectedClient === "All Accounts" || a.client === selectedClient)
	).length;

	// Telemetry stats for active selected sheet client
	const activeTelemetry = activeAlertToShow ? getChurnTelemetry(activeAlertToShow.id) : null;

	return (
		<Card
			id="churn-shield"
			className={cn(
				"flex flex-col md:col-span-2 lg:col-span-1 dark:bg-transparent relative transition-all duration-300",
				highlightedWidget === "churn-shield" && !panelOpen && "ring-2 ring-primary ring-offset-2 shadow-2xl animate-pulse border-primary"
			)}
		>
			<CardHeader className="flex flex-row items-center justify-between border-b pb-3 gap-3">
				<div className="flex items-center gap-3">
					<div className="rounded-full bg-rose-500/10 p-2 text-rose-500">
						<RadioIcon className="size-5 animate-pulse" />
					</div>
					<div>
						<CardTitle className="text-sm font-semibold">
							Churn Shield
						</CardTitle>
						<CardDescription className="text-xs">
							Client telemetry tracking & churn risk indicators. Click any row to inspect radar.
						</CardDescription>
					</div>
				</div>

				<div className="flex items-center gap-2">
					<div className="text-end">
						<div className="font-mono text-sm font-bold text-rose-600 dark:text-rose-400">
							142ms
						</div>
						<div className="text-[10px] text-muted-foreground uppercase">
							Latency
						</div>
					</div>
					<div className="h-8 w-px bg-border mx-1" />
					<div className="text-end">
						<div className="font-mono text-sm font-bold text-rose-500">
							{activeAlertsCount}
						</div>
						<div className="text-[10px] text-muted-foreground uppercase">
							Risks
						</div>
					</div>
				</div>
			</CardHeader>

			{/* Severity Tabs/Filters */}
			<div className="flex items-center border-b bg-muted/20 px-3 py-1.5 gap-1.5">
				{(["all", "critical", "warning"] as const).map((tab) => (
					<button
						key={tab}
						onClick={() => setActiveAlertTab(tab)}
						className={cn(
							"rounded-md px-2.5 py-1 text-xs font-medium capitalize transition-all",
							activeAlertTab === tab
								? "bg-background text-foreground shadow-xs border"
								: "text-muted-foreground hover:bg-muted/50"
						)}
					>
						{tab}
					</button>
				))}
			</div>

			<CardContent className="flex-1 p-0 flex flex-col justify-between min-h-[300px]">
				{filteredAlerts.length > 0 ? (
					<div className="flex-1 flex flex-col">
						{/* Table Header with Master Checkbox */}
						<div className="flex items-center justify-between border-b px-4 py-2 bg-muted/10">
							<div className="flex items-center gap-2.5">
										<CustomCheckbox
											checked={isAllSelected}
											onChange={handleSelectAll}
										/>
								<span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
									Client / Risk Vector
								</span>
							</div>
							<span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider pr-1">
								Action
							</span>
						</div>

						{/* Alert List */}
						<div className="divide-y flex-1 overflow-y-auto max-h-[350px]">
							{filteredAlerts.map((alert) => (
								<div
									key={alert.id}
									onClick={(e) => {
										const target = e.target as HTMLElement;
										if (target.tagName !== "INPUT" && !target.closest("button")) {
											setSelectedAlertForPanel(alert);
											setPanelOpen(true);
										}
									}}
									className={cn(
										"flex items-start justify-between px-4 py-3 hover:bg-muted/10 transition-all cursor-pointer select-none",
										selectedAlertIds.includes(alert.id) && "bg-primary/5",
										selectedAlertForPanel?.id === alert.id && "bg-muted/15"
									)}
								>
									<div className="flex items-start gap-2.5 min-w-0">
										<CustomCheckbox
											checked={selectedAlertIds.includes(alert.id)}
											onChange={(checked) => handleSelectOne(alert.id, checked)}
											className="mt-0.5"
										/>
										<div className="min-w-0">
											<div className="flex items-center gap-1.5">
												<span className="font-semibold text-xs text-foreground truncate">
													{alert.client}
												</span>
												<span
													className={cn(
														"font-mono text-[10px] font-semibold px-1 rounded-sm",
														alert.severity === "critical"
															? "bg-rose-500/10 text-rose-600 dark:text-rose-400"
															: "bg-amber-500/10 text-amber-600 dark:text-amber-400"
													)}
												>
													{alert.probability}%
												</span>
											</div>
											<div className="flex flex-wrap gap-1 mt-1">
												{alert.tags.map((tag, idx) => (
													<span
														key={idx}
														className="text-[9px] bg-secondary text-muted-foreground px-1 py-px rounded-xs font-light"
													>
														{tag}
													</span>
												))}
											</div>
										</div>
									</div>

									<Button
										onClick={() => handleResolveOne(alert.id, alert.client)}
										size="icon-xs"
										variant="ghost"
										className="text-emerald-500 hover:text-emerald-600 hover:bg-emerald-500/10 size-7 animate-in fade-in duration-200"
										title="Secure Risk"
									>
										<CheckIcon className="size-4" />
									</Button>
								</div>
							))}
						</div>
					</div>
				) : (
					/* Active Empty State */
					<div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
						<div className="rounded-full bg-emerald-500/10 p-3 mb-3 text-emerald-500">
							<AnimatedCheck size={32} strokeWidth={2.5} className="text-emerald-500 animate-pulse" />
						</div>
						<h4 className="font-semibold text-sm text-foreground mb-1">
							All Risks secured
						</h4>
						<p className="text-xs text-muted-foreground max-w-[200px] mb-4">
							Telemetry client clusters are clean. No churn indicators active.
						</p>
						<div className="flex items-center gap-2">
							<Button size="sm" variant="outline" onClick={runTelemetryScan}>
								Simulate Telemetric Scan
							</Button>
							<Button
								size="sm"
								variant="default"
								onClick={() => {
									const defaultAlert = churnAlerts.find(a => selectedClient === "All Accounts" || a.client === selectedClient) || null;
									setSelectedAlertForPanel(defaultAlert);
									setPanelOpen(true);
								}}
								className="bg-violet-600 hover:bg-violet-750 text-white font-semibold text-xs"
							>
								Open Churn Hub
							</Button>
						</div>
					</div>
				)}

				{/* Floating Bulk Action Bar */}
				{selectedAlertIds.length > 0 && (
					<div className="border-t bg-muted/40 p-3 flex items-center justify-between gap-2 z-30 animate-in fade-in slide-in-from-bottom-2 duration-200">
						<span className="text-xs text-muted-foreground">
							<strong className="text-foreground">
								{selectedAlertIds.length}
							</strong>{" "}
							risks selected
						</span>
						<Button
							size="sm"
							variant="default"
							className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium"
							onClick={handleResolveBulk}
						>
							Secure Selected Risks
						</Button>
					</div>
				)}
			</CardContent>

			{/* Slide-over / Sheet Panel (inspecting account risks) */}
			<AnimatePresence>
				{panelOpen && (
					<>
						{/* Backdrop overlay */}
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 0.5 }}
							exit={{ opacity: 0 }}
							onClick={() => {
								setSelectedAlertForPanel(null);
								setPanelOpen(false);
							}}
							className="fixed inset-0 bg-black/60 z-40 cursor-pointer"
						/>

						{/* Sliding Sheet Panel */}
						<motion.div
							initial={{ x: "100%" }}
							animate={{ x: 0 }}
							exit={{ x: "100%" }}
							transition={{ type: "spring", damping: 28, stiffness: 220 }}
							className="fixed inset-y-0 right-0 z-50 w-[720px] max-w-[95vw] bg-background border-l shadow-2xl flex flex-row select-text overflow-hidden"
						>
							{/* LEFT SIDEBAR: Ledger list */}
							<div className="w-[250px] border-r border-border/40 flex flex-col min-h-0 bg-background shrink-0 select-none">
								
								{/* Search widget header */}
								<div className="p-3.5 border-b border-border/40 bg-muted/20 flex items-center h-[68px] shrink-0">
									<div className="flex items-center gap-2 w-full bg-stone-900/40 border border-border/40 rounded-lg px-2.5 py-1.5">
										<SearchIcon className="size-3.5 text-muted-foreground shrink-0" />
										<input
											type="text"
											value={panelSearchQuery}
											onChange={(e) => setPanelSearchQuery(e.target.value)}
											placeholder="Search client..."
											className="flex-1 bg-transparent border-none text-[11px] p-0 focus:outline-none focus:ring-0 text-foreground placeholder:text-muted-foreground/45 font-sans"
										/>
										{panelSearchQuery && (
											<button
												onClick={() => setPanelSearchQuery("")}
												className="rounded p-0.5 hover:bg-stone-800 text-muted-foreground hover:text-foreground transition-all"
											>
												<XIcon className="size-3" />
											</button>
										)}
									</div>
								</div>

								{/* Tab selector */}
								<div className="flex border-b border-border/40 bg-muted/20 p-2 shrink-0 gap-2 select-none">
									<button
										onClick={() => setPanelTab("active")}
										className={cn(
											"flex-1 text-center py-1 text-[10px] font-bold rounded-full transition-all flex items-center justify-center gap-1.5 h-8 font-sans",
											panelTab === "active"
												? "bg-muted text-foreground border border-border/50 shadow-2xs"
												: "text-muted-foreground hover:text-foreground border border-transparent"
										)}
									>
										Active
										<span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold bg-rose-500/10 text-rose-500">
											{churnAlerts.filter(a => (selectedClient === "All Accounts" || a.client === selectedClient) && a.status === "active").length}
										</span>
									</button>
									<button
										onClick={() => setPanelTab("secured")}
										className={cn(
											"flex-1 text-center py-1 text-[10px] font-bold rounded-full transition-all flex items-center justify-center gap-1.5 h-8 font-sans",
											panelTab === "secured"
												? "bg-muted text-foreground border border-border/50 shadow-2xs"
												: "text-muted-foreground hover:text-foreground border border-transparent"
										)}
									>
										Secured
										<span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold bg-emerald-500/10 text-emerald-550">
											{churnAlerts.filter(a => (selectedClient === "All Accounts" || a.client === selectedClient) && a.status === "secured").length}
										</span>
									</button>
								</div>

								{/* Scrollable list */}
								<div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2 bg-background">
									{filteredAlertsForSidebar.map((alert: ChurnAlert) => {
										const isSelected = activeAlertToShow && activeAlertToShow.id === alert.id;
										return (
											<div
												key={alert.id}
												onClick={() => {
													setSelectedAlertForPanel(alert);
													setPanelOpen(true);
												}}
												className={cn(
													"p-3 rounded-lg border transition-all duration-200 cursor-pointer select-none flex flex-col gap-1.5 font-sans",
													isSelected
														? "bg-primary/10 border-primary/25 shadow-xs"
														: "border-transparent bg-transparent hover:bg-muted/30"
												)}
											>
												<div className="flex items-start justify-between gap-1.5 min-w-0">
													<div className="min-w-0">
														<div className="flex items-center gap-1.5">
															{isSelected && (
																<span className="size-1.5 rounded-full bg-primary animate-pulse shrink-0" />
															)}
															<span className={cn(
																"font-bold text-[11px] truncate",
																isSelected ? "text-primary font-extrabold" : "text-foreground"
															)}>
																{alert.client}
															</span>
														</div>
														<span className="font-mono text-[9px] text-muted-foreground mt-0.5 block">
															CHURN-SEV-{alert.severity.toUpperCase().slice(0, 3)}-{alert.id.slice(-2).toUpperCase()}
														</span>
													</div>
													<span className="font-mono font-bold text-[11px] text-foreground shrink-0">
														{alert.probability}% Threat
													</span>
												</div>

												<div className="flex items-center justify-between gap-2 mt-0.5">
													<span className="text-[10px] text-muted-foreground truncate max-w-[130px]">
														{alert.tags.map(t => t.charAt(0).toUpperCase() + t.slice(1)).join(" / ")}
													</span>
													<span className={cn(
														"text-[8px] font-bold px-1.5 py-0.5 rounded-sm uppercase tracking-wider",
														alert.status === "secured"
															? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
															: "bg-rose-500/10 text-rose-500"
													)}>
														{alert.status === "secured" ? "Secured" : "Active"}
													</span>
												</div>
											</div>
										);
									})}
									{filteredAlertsForSidebar.length === 0 && (
										<p className="text-center text-[10px] text-muted-foreground py-8 font-sans">
											No matches found
										</p>
									)}
								</div>
							</div>

							{/* RIGHT DETAILS PANEL */}
							<div className="flex-1 flex flex-col min-h-0 bg-background">
								{!activeAlertToShow ? (
									/* Empty State Screen when no alert is active/available for current client */
									<div className="flex-1 flex flex-col justify-center items-center p-8 text-center bg-background select-none animate-in fade-in duration-300">
										<div className="size-14 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-500 mb-4 animate-bounce">
											<AnimatedCheck size={32} strokeWidth={2.5} className="text-emerald-500" />
										</div>
										<h3 className="text-sm font-bold text-foreground mb-1">
											All Client Risks Mitigated
										</h3>
										<p className="text-xs text-muted-foreground max-w-xs leading-relaxed mb-6">
											Telemetry metrics show active connection grids are stable. Customer success indicators are at optimal retention rates.
										</p>
										<Button
											variant="default"
											size="sm"
											onClick={() => {
												setPanelOpen(false);
												setSelectedAlertForPanel(null);
											}}
											className="h-9 px-4 font-bold text-xs"
										>
											Close Panel
										</Button>
									</div>
								) : panelTab === "active" && !churnAlerts.filter(a => (selectedClient === "All Accounts" || a.client === selectedClient)).some(a => a.status === "active") ? (
									/* Success Screen */
									<div className="flex-1 flex flex-col justify-center items-center p-8 text-center bg-background select-none animate-in fade-in duration-300">
										<div className="size-14 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-500 mb-4 animate-bounce">
											<AnimatedCheck size={32} strokeWidth={2.5} className="text-emerald-500" />
										</div>
										<h3 className="text-sm font-bold text-foreground mb-1">
											All Client Risks Mitigated
										</h3>
										<p className="text-xs text-muted-foreground max-w-xs leading-relaxed mb-6">
											Telemetry metrics show active connection grids are stable. Customer success indicators are at optimal retention rates.
										</p>
										<div className="flex items-center gap-3">
											<Button
												variant="outline"
												size="sm"
												onClick={() => setPanelTab("secured")}
												className="h-8 px-3 font-semibold text-xs flex items-center gap-1.5"
											>
												<ActivityIcon className="size-3" />
												View Secured Logs
											</Button>
											<Button
												variant="default"
												size="sm"
												onClick={() => {
													setPanelOpen(false);
													setSelectedAlertForPanel(null);
												}}
												className="h-9 px-4 font-bold text-xs"
											>
												Close Panel
											</Button>
										</div>
									</div>
								) : (
									/* Detail View contents */
									<>
										{/* Panel Header */}
										<div className="flex items-center justify-between border-b px-4 bg-muted/20 h-[68px] shrink-0">
											<div>
												<div className="flex items-center gap-2">
													<h3 className="font-bold text-sm text-foreground">
														{activeAlertToShow.client}
													</h3>
													<span
														className={cn(
															"text-[10px] font-bold px-1.5 py-0.5 rounded-sm uppercase tracking-wider border",
															activeAlertToShow.severity === "critical"
																? "bg-rose-500/10 text-rose-600 dark:text-rose-455 border-rose-500/20"
																: "bg-amber-500/10 text-amber-600 dark:text-amber-455 border-amber-500/20"
														)}
													>
														{activeAlertToShow.probability}% Threat
													</span>
												</div>
												<p className="text-[10px] text-muted-foreground mt-0.5 uppercase tracking-wider font-semibold">
													Account Telemetry Audit
												</p>
											</div>
											<button
												onClick={() => {
													setSelectedAlertForPanel(null);
													setPanelOpen(false);
												}}
												className="rounded-md p-1.5 hover:bg-muted text-muted-foreground hover:text-foreground transition-all"
											>
												<XIcon className="size-4" />
											</button>
										</div>

										{/* Scrollable details */}
										<div className="flex-1 p-5 flex flex-col gap-5 overflow-y-auto text-sm bg-background">
											
											{/* AI summary block */}
											<div className="flex flex-col gap-2 bg-violet-500/5 border border-dashed border-violet-500/20 rounded-xl p-3.5">
												<h4 className="font-semibold text-foreground uppercase text-[10px] tracking-wider flex items-center gap-1.5">
													<BotIcon className="size-4 text-violet-500 animate-pulse" />
													AI Telemetry Analysis & Summary
												</h4>
												<div className="flex flex-col gap-3 mt-2 leading-relaxed text-[11px] text-muted-foreground">
													<div>
														<strong className="text-foreground block text-[11px] mb-0.5">What is happening:</strong>
														<span className="font-light">{activeTelemetry?.summary?.happening}</span>
													</div>
													<div>
														<strong className="text-foreground block text-[11px] mb-0.5">Potential Risk:</strong>
														<span className="font-light">{activeTelemetry?.summary?.risk}</span>
													</div>
													<div>
														<strong className="text-foreground block text-[11px] mb-0.5">Mitigation Recommendation:</strong>
														<span className="font-semibold text-primary">{activeTelemetry?.summary?.recommendation}</span>
													</div>
												</div>
											</div>

											{/* Latency chart */}
											<div className="flex flex-col gap-2.5">
												<h4 className="font-semibold text-foreground uppercase text-[10px] tracking-wider">
													Communication Friction (Thermal Latency)
												</h4>
												<div className="bg-muted/30 border rounded-lg p-3 flex flex-col gap-1.5">
													<ResponsiveContainer width="100%" height={100}>
														<AreaChart data={activeTelemetry?.latencyData || []} margin={{ top: 10, right: 15, bottom: 0, left: 15 }}>
															<defs>
																<linearGradient id="colorLatency" x1="0" y1="0" x2="0" y2="1">
																	<stop offset="5%" stopColor="var(--chart-2)" stopOpacity={0.2} />
																	<stop offset="95%" stopColor="var(--chart-2)" stopOpacity={0} />
																</linearGradient>
															</defs>
															<CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.15} />
															<XAxis dataKey="day" tickLine={false} axisLine={false} style={{ fontSize: 8, fill: "var(--muted-foreground)" }} />
															<YAxis hide={true} />
															<RechartsTooltip
																formatter={(value) => [`${Math.round(Number(value) / 60)} hrs delay`, "Latency"]}
																contentStyle={{ background: "hsl(var(--popover))", borderRadius: 8, borderColor: "hsl(var(--border))", fontSize: 10 }}
															/>
															<Area type="monotone" dataKey="value" stroke="var(--chart-2)" fillOpacity={1} fill="url(#colorLatency)" strokeWidth={2} />
														</AreaChart>
													</ResponsiveContainer>
													<div className="flex items-center justify-between text-[10px] font-semibold text-muted-foreground mt-1 border-t pt-2">
														<span className="text-emerald-600 dark:text-emerald-400">2 weeks ago: 45 min delay</span>
														<span className="text-rose-600 dark:text-rose-400 font-bold">Yesterday: 36 hrs delay</span>
													</div>
												</div>
											</div>

											{/* Sentiment tone matrix */}
											<div className="flex flex-col gap-2.5">
												<h4 className="font-semibold text-foreground uppercase text-[10px] tracking-wider">
													Sentiment Tone Matrix
												</h4>
												<div className="grid grid-cols-2 gap-3">
													<div className="bg-muted/30 border rounded-lg p-2.5">
														<span className="text-[8.5px] uppercase font-semibold text-muted-foreground tracking-wider block">Historical Tone</span>
														<span className="text-sm font-bold text-emerald-500 mt-0.5 block">{activeTelemetry?.sentiment?.historical}%</span>
													</div>
													<div className="bg-muted/30 border rounded-lg p-2.5 border-rose-500/10">
														<span className="text-[8.5px] uppercase font-semibold text-muted-foreground tracking-wider block">14-Day Tone</span>
														<span className="text-sm font-bold text-rose-500 mt-0.5 block flex items-center gap-1">
															{activeTelemetry?.sentiment?.current}%
															<TrendingDownIcon className="size-3.5 text-rose-500 animate-pulse" />
														</span>
													</div>
												</div>
											</div>

											{/* Red Flag Phrases */}
											<div className="flex flex-col gap-2 bg-muted/30 border rounded-lg p-3">
												<span className="text-[9px] uppercase font-semibold text-muted-foreground tracking-wider">
													Analyzed Red Flag Phrases (Recent)
												</span>
												<div className="flex flex-col gap-2 mt-0.5">
													{activeTelemetry?.sentiment?.redFlags?.map((phrase, phidx) => (
														<div key={phidx} className="bg-background border px-3 py-2 rounded-lg text-xs text-foreground font-medium">
															"{phrase}"
														</div>
													))}
												</div>
											</div>

											{/* Health Score Breakdown */}
											<div className="flex flex-col gap-2.5">
												<h4 className="font-semibold text-foreground uppercase text-[10px] tracking-wider">
													Health Indicators
												</h4>
												<div className="flex flex-col gap-2">
													{activeTelemetry?.health?.map((item, hidx) => (
														<div key={hidx} className="flex items-start gap-2.5 p-2.5 bg-muted/30 border rounded-lg">
															{item.check ? (
																<AnimatedCheck size={18} strokeWidth={2.5} className="mt-0.5 shrink-0 text-emerald-500" />
															) : (
																<XCircleIcon className="size-4.5 text-rose-500 mt-0.5 shrink-0" />
															)}
															<div className="flex flex-col gap-0.5 leading-none">
																<span className="font-semibold text-foreground text-xs">{item.label}</span>
																<span className={cn(
																	"text-[11px] font-semibold mt-1",
																	item.check ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-455"
																)}>{item.status}</span>
															</div>
														</div>
													))}
												</div>
											</div>
										</div>

										{/* Panel Footer Actions */}
										<div className="border-t p-4 bg-muted/20 flex items-center justify-between shrink-0 select-none">
											<span className="text-[10px] text-muted-foreground flex items-center gap-1.5">
												{activeAlertToShow.status === "secured" ? (
													<>
														<AnimatedCheck size={14} strokeWidth={3} className="text-emerald-500" />
														Mitigated & Marked Safe
													</>
												) : (
													<>
														<AlertCircleIcon className="size-3.5 text-amber-500 animate-pulse" />
														Marking as secured resolves alert
													</>
												)}
											</span>

											<div className="flex items-center gap-2">
												{activeAlertToShow.status === "active" ? (
													<Button
														size="sm"
														variant="default"
														className="bg-violet-600 hover:bg-violet-700 text-white font-bold h-8 px-3.5 flex items-center gap-1 text-xs shadow-xs"
														onClick={() => {
															setChurnAlerts((prev) =>
																prev.map((a) => (a.id === activeAlertToShow.id ? { ...a, status: "secured" as const } : a))
															);
															addLog(`Churn Risk mitigated for client: ${activeAlertToShow.client}.`, "success");
															setSelectedAlertForPanel({ ...activeAlertToShow, status: "secured" });
														}}
													>
														<ShieldCheckIcon className="size-3" />
														Mitigate Churn
													</Button>
												) : (
													<Button
														size="sm"
														variant="outline"
														className="border-amber-500/20 bg-amber-550/5 text-amber-600 dark:text-amber-455 font-semibold h-8 px-3 flex items-center gap-1 text-xs hover:bg-amber-500/10"
														onClick={() => {
															setChurnAlerts((prev) =>
																prev.map((a) => (a.id === activeAlertToShow.id ? { ...a, status: "active" as const } : a))
															);
															addLog(`Restored churn risk warning for client: ${activeAlertToShow.client} back to active list.`, "warning");
															setSelectedAlertForPanel({ ...activeAlertToShow, status: "active" });
														}}
													>
														<RotateCcwIcon className="size-3" />
														Restore to Active
													</Button>
												)}
											</div>
										</div>
									</>
								)}
							</div>
						</motion.div>
					</>
				)}
			</AnimatePresence>
		</Card>
	);
}
