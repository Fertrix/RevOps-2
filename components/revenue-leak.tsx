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
import { useAppContext, LeakItem } from "@/components/app-context";
import {
	ChevronDownIcon,
	ChevronUpIcon,
	FlameIcon,
	CheckSquareIcon,
	CodeIcon,
	MessageSquareIcon,
	RefreshCwIcon,
} from "lucide-react";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CustomCheckbox, AnimatedCheck } from "@/components/ui/custom-checkbox";

const getLeakEvidence = (id: string, niche: "dev" | "design" | "marketing" = "marketing") => {
	switch (id) {
		case "L1":
		default: {
			const desc1 = niche === "dev"
				? "Asana Task #9943: Unbilled SSO & API Addons"
				: niche === "design"
				? "Asana Task #9943: Unbilled Figma Revisions"
				: "Asana Task #9943: Unbilled Minor Slack Requests";

			const desc2 = niche === "dev"
				? "Asana Task #9949: Custom Webhook Integrations"
				: niche === "design"
				? "Asana Task #9949: Extra Asset Formatting"
				: "Asana Task #9949: Out-of-scope Ad Variations";

			const triggerMsg = niche === "dev"
				? 'Slack client instruction from Point of Contact: "Hey, can we also connect the SSO & API addons? Should be fast!"'
				: niche === "design"
				? 'Slack client instruction from Point of Contact: "Hey, can we quickly tweak the Figma layouts? Should be fast!"'
				: 'Slack client instruction from Point of Contact: "Hey, can we quickly tweak the layout before tomorrow? Should be fast!"';

			return {
				tasks: [
					{
						description: desc1,
						meta: "12.5 hours registered ( retainer cap exceeded )",
						amount: "$1,250 unbilled leak"
					},
					{
						description: desc2,
						meta: "11.5 hours registered ( retainer cap exceeded )",
						amount: "$1,150 unbilled leak"
					}
				],
				triggerMessage: triggerMsg
			};
		}
		case "L2": {
			const desc = niche === "dev"
				? "GitHub Commit #4812: Setup custom API webhook event endpoints"
				: niche === "design"
				? "Figma File #4812: Extra asset formats design iteration"
				: "Figma File #4812: High-fidelity custom icon sets design iteration";

			const triggerMsg = niche === "dev"
				? 'Email instruction from Engineering Lead: "We need custom webhook integrations set up. Please add more detail than standard API logs."'
				: niche === "design"
				? 'Email instruction from Design Lead: "We need these extra assets formatted in other dimensions. Please export them today."'
				: 'Email instruction from Engineering Lead: "We need these custom Figma icons to look extremely high-end. Please add more detail than the standard library."';

			return {
				tasks: [
					{
						description: desc,
						meta: "10.0 hours registered ( 2.0 billable hours retainer cap )",
						amount: "$1,250 unbilled leak"
					}
				],
				triggerMessage: triggerMsg
			};
		}
		case "L3":
			return {
				tasks: [
					{
						description: "GitHub Commit #a81c: Stripe webhook latency ingestion parser",
						meta: "8.5 custom engineering hours logged",
						amount: "$850 unbilled leak"
					}
				],
				triggerMessage: 'Slack client instruction from Lead Project Manager: "Can you guys also connect the Stripe latency webhook parser? We need it by Friday."'
			};
	}
};

export function RevenueLeak() {
	const {
		leaks,
		setLeaks,
		selectedLeakIds,
		setSelectedLeakIds,
		setRecoveryDraftOpen,
		recoveryDraftOpen,
		setActiveRecoveryLeak,
		setRecoveryHighlightSubmit,
		simulateTimesheetScan,
		addLog,
		highlightedWidget,
		revenueLeaksCollapsed,
		setRevenueLeaksCollapsed,
		selectedClient,
		setSelectedClient,
		clientProfiles,
		setActiveView,
		niche,
	} = useAppContext();

	const isCollapsed = revenueLeaksCollapsed;
	const setIsCollapsed = setRevenueLeaksCollapsed;

	const activeLeaks = leaks.filter(
		(l) =>
			l.status === "Leak" &&
			(selectedClient === "All Accounts" || l.client === selectedClient)
	);

	// State for expanded row ID
	const [expandedLeakId, setExpandedLeakId] = useState<string | null>(null);

	// Compute metrics
	const totalActiveLeakAmount = activeLeaks.reduce((sum, l) => sum + l.amount, 0);
	const pendingAmount = totalActiveLeakAmount;

	const getClientRetainer = (clientName: string) => {
		if (clientName === "Apex Digital") return 5000;
		if (clientName === "Helix Corp") return 12000;
		if (clientName === "Nova Soft") return 15000;
		return 38500; // Global retainer
	};
	const retainerBudget = selectedClient === "All Accounts"
		? Object.values(clientProfiles).reduce((sum, p) => sum + p.income, 0)
		: (clientProfiles[selectedClient]?.income ?? getClientRetainer(selectedClient));
	const unbilledRate = totalActiveLeakAmount > 0 ? parseFloat(((totalActiveLeakAmount / retainerBudget) * 100).toFixed(1)) : 0;

	// Checkboxes logic
	const isAllSelected =
		activeLeaks.length > 0 &&
		activeLeaks.every((l) => selectedLeakIds.includes(l.id));

	const handleSelectAll = (checked: boolean) => {
		if (checked) {
			setSelectedLeakIds(activeLeaks.map((l) => l.id));
		} else {
			setSelectedLeakIds([]);
		}
	};

	const handleSelectOne = (id: string, checked: boolean) => {
		if (checked) {
			setSelectedLeakIds((prev) => [...prev, id]);
		} else {
			setSelectedLeakIds((prev) => prev.filter((item) => item !== id));
		}
	};

	// Actions
	const handleRecoverOne = (leak: LeakItem) => {
		addLog(`Triggering AI recovery auditor for ${leak.client}...`, "info");
		setActiveRecoveryLeak(leak);
		setRecoveryHighlightSubmit(true);
		setRecoveryDraftOpen(true);
	};

	const handleResolveBulk = () => {
		setLeaks((prev) =>
			prev.map((leak) =>
				selectedLeakIds.includes(leak.id)
					? { ...leak, status: "Secured" as const }
					: leak
			)
		);
		addLog(`Resolved ${selectedLeakIds.length} bulk selected scope creep leaks. Generating Stripe draft invoices...`, "success");
		setSelectedLeakIds([]);
	};

	const isHighlighted = highlightedWidget === "revenue-leak" && !recoveryDraftOpen;

	return (
		<Card
			id="revenue-leak"
			className={cn(
				"md:col-span-2 dark:bg-transparent relative transition-all duration-300",
				isHighlighted && "ring-2 ring-primary ring-offset-2 shadow-2xl animate-pulse border-primary"
			)}
		>
			<CardHeader className="flex flex-row items-center justify-between border-b pb-3">
				<div className="flex items-center gap-3">
					<div className="rounded-full bg-rose-500/10 p-2 text-rose-500">
						<FlameIcon className="size-5" />
					</div>
					<div>
						<CardTitle className="text-base font-semibold">
							Revenue Leaks
						</CardTitle>
						<CardDescription className="text-xs">
							Scope creep audits and unbilled work deviations. Click any row to audit evidence.
						</CardDescription>
					</div>
				</div>

				<div className="flex items-center gap-2">
					<div className="text-end">
						<div className="font-mono text-sm font-bold text-rose-600 dark:text-rose-400">
							{unbilledRate}%
						</div>
						<div className="text-[10px] text-muted-foreground uppercase">
							Unbilled Rate
						</div>
					</div>
					<div className="h-8 w-px bg-border mx-1" />
					<div className="text-end">
						<div className="font-mono text-sm font-bold text-foreground">
							${pendingAmount.toLocaleString()}
						</div>
						<div className="text-[10px] text-muted-foreground uppercase">
							Pending Recovery
						</div>
					</div>

					<Button
						variant="ghost"
						size="icon-xs"
						onClick={() => setIsCollapsed(!isCollapsed)}
						className="ml-2"
					>
						{isCollapsed ? (
							<ChevronDownIcon className="size-4" />
						) : (
							<ChevronUpIcon className="size-4" />
						)}
					</Button>
				</div>
			</CardHeader>

			<div
				className={cn(
					"transition-all duration-355 ease-in-out overflow-hidden flex flex-col",
					isCollapsed ? "max-h-0 opacity-0" : "max-h-[850px] opacity-100"
				)}
			>
				<CardContent className="p-0 flex flex-col justify-between">
					<div className="flex-1 flex flex-col justify-between">
						{activeLeaks.length > 0 ? (
							<div className="flex-1 flex flex-col">
								{/* Table Header */}
								<div className="grid grid-cols-12 gap-2 border-b px-4 py-2 bg-muted/10 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider items-center">
									<div className="col-span-4 flex items-center gap-2.5">
										<CustomCheckbox
											checked={isAllSelected}
											onChange={handleSelectAll}
										/>
										<span>Client / Code</span>
									</div>
									<div className="col-span-4">Deviation Type</div>
									<div className="col-span-2 text-end">Leak</div>
									<div className="col-span-2 text-end">Action</div>
								</div>

								{/* Table Rows */}
								<div className="divide-y flex-1 overflow-y-auto max-h-[500px]">
									{activeLeaks.map((leak) => {
										const isExpanded = expandedLeakId === leak.id;
										const evidence = getLeakEvidence(leak.id, niche);

										return (
											<div key={leak.id} className="flex flex-col">
												{/* Row Header clickable */}
												<div
													onClick={(e) => {
														const target = e.target as HTMLElement;
														if (target.tagName !== "INPUT" && !target.closest("button")) {
															addLog(`Opening audit details for ${leak.client}...`, "info");
															setActiveRecoveryLeak(leak);
															setRecoveryHighlightSubmit(false);
															setRecoveryDraftOpen(true);
														}
													}}
													className={cn(
														"grid grid-cols-12 gap-2 px-4 py-3 items-center hover:bg-muted/5 transition-all text-xs cursor-pointer select-none",
														selectedLeakIds.includes(leak.id) && "bg-primary/5",
														isExpanded && "bg-muted/10"
													)}
												>
													<div className="col-span-4 flex items-center gap-2.5 min-w-0">
														<CustomCheckbox
															checked={selectedLeakIds.includes(leak.id)}
															onChange={(checked) => handleSelectOne(leak.id, checked)}
														/>
														<div className="truncate min-w-0">
															<span className="font-semibold text-foreground truncate block">
																{leak.client}
															</span>
															<span className="font-mono text-[9px] text-muted-foreground block mt-0.5">
																{leak.code}
															</span>
														</div>
													</div>

													<div className="col-span-4 text-muted-foreground truncate">
														{leak.type}
													</div>

													<div className="col-span-2 text-end font-mono font-semibold text-rose-550">
														${leak.amount.toLocaleString()}
													</div>

													<div className="col-span-2 text-end">
														<Button
															size="xs"
															variant="outline"
															className="text-[10px] text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 border-rose-500/20"
															onClick={() => handleRecoverOne(leak)}
														>
															Recover
														</Button>
													</div>
												</div>

												{/* Expanded Evidence Details with AnimatePresence */}
												<AnimatePresence initial={false}>
													{isExpanded && (
														<motion.div
															initial={{ height: 0, opacity: 0 }}
															animate={{ height: "auto", opacity: 1 }}
															exit={{ height: 0, opacity: 0 }}
															transition={{ duration: 0.25, ease: "easeInOut" }}
															className="overflow-hidden bg-muted/20 border-t p-5 text-sm select-text"
														>
															<div className="flex flex-col gap-4">
																{/* The Activity Log */}
																<div className="flex flex-col gap-2">
																	<span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider flex items-center gap-1.5">
																		<CodeIcon className="size-3.5 text-rose-500" />
																		Technical Evidence Log (Scraped Activities)
																	</span>
																	<div className="flex flex-col gap-2">
																		{evidence.tasks.map((task, idx) => (
																			<div
																				key={idx}
																				className="bg-background border rounded-lg px-4 py-3 flex flex-col md:flex-row md:justify-between md:items-center gap-2"
																			>
																				<div className="flex flex-col gap-0.5">
																					<span className="font-semibold text-foreground text-sm">{task.description}</span>
																					<span className="text-xs text-muted-foreground">{task.meta}</span>
																				</div>
																				<span className="text-xs font-semibold text-rose-600 dark:text-rose-450 bg-rose-500/10 px-2 py-1 rounded shrink-0 self-start md:self-auto">
																					{task.amount}
																				</span>
																			</div>
																		))}
																	</div>
																</div>

																{/* Slack/Email Interception */}
																<div className="flex flex-col gap-2">
																	<span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider flex items-center gap-1.5">
																		<MessageSquareIcon className="size-3.5 text-rose-500" />
																		Scope Creep Trigger (Communication Intercept)
																	</span>
																	<div className="bg-background border rounded-lg p-3.5 text-foreground leading-relaxed italic text-sm">
																		{evidence.triggerMessage}
																	</div>
																</div>

																{/* Recovery Action Bottom Bar */}
																<div className="flex items-center justify-between border-t pt-3.5 mt-1">
																	<span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wide flex items-center gap-1">
																		Billing Status: <strong className="text-rose-500">TELEMETRY UNBILLED</strong>
																	</span>
																	<Button
																		size="sm"
																		onClick={() => handleRecoverOne(leak)}
																		className="bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs flex items-center gap-1 shadow-sm px-4 py-1.5"
																	>
																		<RefreshCwIcon className="size-3.5" />
																		Review & Recover Draft
																	</Button>
																</div>
															</div>
														</motion.div>
													)}
												</AnimatePresence>
											</div>
										);
									})}
								</div>
							</div>
						) : (
							/* Empty State */
							<div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
								<div className="rounded-full bg-emerald-500/10 p-3 mb-3 text-emerald-500">
									<AnimatedCheck size={32} strokeWidth={2.5} className="text-emerald-500 animate-pulse" />
								</div>
								<h4 className="font-semibold text-sm text-foreground mb-1">
									No Revenue Leaks Detected
								</h4>
								<p className="text-xs text-muted-foreground max-w-sm mb-4">
									All client timesheets align with Stripe retainer limits. Unbilled rate is 0%.
								</p>
								<div className="flex items-center gap-2">
									<Button size="sm" variant="outline" onClick={simulateTimesheetScan}>
										Simulate Telemetric Scan
									</Button>
									<Button
										size="sm"
										variant="default"
										onClick={() => {
											const defaultLeak = leaks.find(l => selectedClient === "All Accounts" || l.client === selectedClient) || null;
											setActiveRecoveryLeak(defaultLeak);
											setRecoveryDraftOpen(true);
										}}
										className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs"
									>
										Open Recovery Hub
									</Button>
								</div>
							</div>
						)}

						{/* Floating Bulk Action Bar */}
						{selectedLeakIds.length > 0 && (
							<div className="p-3 border-t bg-muted/15 flex items-center justify-between text-xs gap-3">
								<span className="text-muted-foreground">
									Selected: <strong>{selectedLeakIds.length} leaks</strong> ($
									{activeLeaks
										.filter((l) => selectedLeakIds.includes(l.id))
										.reduce((sum, l) => sum + l.amount, 0)
										.toLocaleString()}
									)
								</span>
								<Button
									size="sm"
									className="text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white"
									onClick={handleResolveBulk}
								>
									Recover Selected
								</Button>
							</div>
						)}
					</div>
				</CardContent>
			</div>
		</Card>
	);
}
