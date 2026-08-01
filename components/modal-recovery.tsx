"use client";

import { Button } from "@/components/ui/button";
import { useAppContext, LeakItem } from "@/components/app-context";
import {
	XIcon,
	FileTextIcon,
	SendIcon,
	CheckCircle2Icon,
	AlertCircleIcon,
	UserIcon,
	CoinsIcon,
	SearchIcon,
	Edit2Icon,
	BoldIcon,
	ItalicIcon,
	UnderlineIcon,
	LinkIcon,
	CodeIcon,
	TerminalIcon,
	BotIcon,
	Trash2Icon,
	RotateCcwIcon,
} from "lucide-react";
import React, { useState, useEffect, useMemo } from "react";
import { cn } from "@/lib/utils";
import { AnimatedCheck } from "@/components/ui/custom-checkbox";

const getDraftEmail = (id: string, client: string, amount: number, type: string, agencyName: string = "Your Agency", firstName: string = "Jack Sterling") => {
	if (id.startsWith("L_SIM")) {
		return `Dear ${client} Team,

Our billing audit parser has identified several unbilled engineering deliverables associated with "${type}". These items were executed outside the agreed contract retainer scope.

We have prepared a draft invoice of $${amount.toLocaleString()}. You can review and authorize the payment here: https://stripe.com/pay/inv_sim_${id.toLowerCase()}

Best regards,
${firstName}
CEO, ${agencyName}`;
	}

	switch (id) {
		case "L1":
		default:
			return `Dear Apex Digital Team,

We have processed the telemetry audit for June's creative deliverables. Our tracking system detected Asana tasks ID #9943 and #9949 (creative layout adjustments and feedback loops iteration #4) executed outside of the retainer cap, requested on Slack. 

We have prepared a draft invoice of $${amount.toLocaleString()}. You can review and authorize the transaction at: https://stripe.com/pay/inv_apex_9943

Best regards,
${firstName}
CEO, ${agencyName}`;
		case "L2":
			return `Dear Helix Corp Team,

Our system detected custom Figma high-fidelity icon sets (Figma ID #4812) requested via email on June 18. This deviation required 10 hours of design time (8 hours above the billable retainer cap of 2 hours), incurring an unbilled balance of $${amount.toLocaleString()}.

We have appended the invoice draft below for your review. Transaction link: https://stripe.com/pay/inv_helix_4812

Best regards,
${firstName}
CEO, ${agencyName}`;
		case "L3":
			return `Dear Nova Soft Team,

We have processed the integration log audit. As requested via Slack, our development team deployed the Stripe webhook parser (Commit #a81c), which took 8.5 hours of unbilled custom engineering time. The associated leakage is $${amount.toLocaleString()}.

Review and approve invoice draft at: https://stripe.com/pay/inv_nova_a81c

Best regards,
${firstName}
CEO, ${agencyName}`;
	}
};

const getAiAnalysis = (id: string) => {
	if (id.startsWith("L_SIM")) {
		return {
			happening: "A simulated revenue leak was injected via the God Mode panel to test telemetry detection pipelines.",
			risk: "Simulated deviations will distort financial tracking summaries and understate active contract net margins.",
			recommendation: "Generate a simulated Stripe checkout draft to conciliate this test item and restore the telemetry balance.",
		};
	}

	switch (id) {
		case "L1":
			return {
				happening: "The creative design team has logged 24 hours of additional revision cycles on the marketing landing page beyond the 3 iterations approved in the Retainer contract.",
				risk: "Unbilled creative hours will exhaust design resources for other clients, reducing net margin on Apex Digital to less than 50% this month.",
				recommendation: "Generate a Stripe draft invoice for the 24 additional hours at the standard $100/hr design rate and dispatch the diplomatic reconciliation email to their director of branding.",
			};
		case "L2":
			return {
				happening: "Product engineering logged 12.5 extra developer hours on custom interactive animations for the core webapp dashboard that were not included in the original feature scope.",
				risk: "The project has exceeded the monthly cap by $1,250. Continuing to support custom designs without billing will set a precedent for free scope additions.",
				recommendation: "Invoice the overdesign deviation of $1,250 immediately to sync our Toggl tracks with Stripe and send the pre-written reconciliation email to Helix's product lead.",
			};
		case "L3":
			return {
				happening: "The technical team implemented a custom OAuth SSO integration addon for Nova Soft that required 8.5 engineering hours, but it has not been registered under any Stripe payment tier.",
				risk: "Nova Soft is receiving premium enterprise features on a standard subscription plan, leading to a direct revenue leakage of $850.",
				recommendation: "Draft a one-off invoice of $850 for the SSO configuration and send a polite note explaining the subscription adjustment.",
			};
		case "API_LEAK":
			return {
				happening: "A Stripe webhook sync failure caused a discrepancy between the retainers logged in the database and the actual billing plans active on Stripe. Unprocessed billing events total 48 hours.",
				risk: "Stripe plans are undercharging the client compared to actual contract usage, leading to a critical revenue leak of $4,800.",
				recommendation: "Run a manual database reconciliation and dispatch this Stripe draft invoice to sync the active retainers.",
			};
		default:
			return {
				happening: "A deviation from the contracted retainer hours has been detected via integration tracker audit. Extra work has been logged without active Stripe invoicing.",
				risk: "Unbilled developer hours will lead to a direct margin compression and loss of billable time.",
				recommendation: "Generate and submit a reconciliation invoice to align active retainer metrics on Stripe.",
			};
	}
};

export function ModalRecovery() {
	const {
		recoveryDraftOpen,
		setRecoveryDraftOpen,
		activeRecoveryLeak,
		setActiveRecoveryLeak,
		selectedClient,
		leaks,
		setLeaks,
		recoveryHighlightSubmit,
		addLog,
		recoveryShowAllLeaksOverride,
		setRecoveryShowAllLeaksOverride,
		agencyName,
		firstName,
	} = useAppContext();

	const [searchOpen, setSearchOpen] = useState(false);
	const [modalSearchQuery, setModalSearchQuery] = useState("");
	const [isEditing, setIsEditing] = useState(false);
	const [editedEmail, setEditedEmail] = useState("");
	const [sidebarTab, setSidebarTab] = useState<"active" | "logs">("active");
	const [logsSubFilter, setLogsSubFilter] = useState<"all" | "secured" | "deleted">("all");
	const [isEditingAudit, setIsEditingAudit] = useState(false);
	const [editRate, setEditRate] = useState("100");
	const [editHours, setEditHours] = useState("0");

	// Force default active tab on open and reset override on close
	useEffect(() => {
		if (recoveryDraftOpen) {
			setSidebarTab("active");
			setLogsSubFilter("all");
			setIsEditingAudit(false);
		} else {
			setRecoveryShowAllLeaksOverride(false);
		}
	}, [recoveryDraftOpen, setRecoveryShowAllLeaksOverride]);

	// Filter leaks to match current view context (All Accounts vs specific Client Portfolio, unless overridden by chatbot)
	const filteredLeaks = useMemo(() => {
		if (recoveryShowAllLeaksOverride) {
			return leaks;
		}
		return leaks.filter(
			(l) => selectedClient === "All Accounts" || l.client === selectedClient
		);
	}, [leaks, selectedClient, recoveryShowAllLeaksOverride]);

	// Compute valid active leak showing to avoid opening a leak of another client when selected client has none
	const activeLeakToShow = useMemo(() => {
		if (activeRecoveryLeak && (recoveryShowAllLeaksOverride || selectedClient === "All Accounts" || activeRecoveryLeak.client === selectedClient)) {
			return activeRecoveryLeak;
		}
		// Fallback to current filtered context first leak
		const matches = filteredLeaks.filter(l => {
			if (sidebarTab === "active") return l.status === "Leak";
			if (logsSubFilter === "all") return l.status === "Secured" || l.status === "Deleted";
			if (logsSubFilter === "secured") return l.status === "Secured";
			if (logsSubFilter === "deleted") return l.status === "Deleted";
			return false;
		});
		if (matches.length > 0) return matches[0];
		if (filteredLeaks.length > 0) return filteredLeaks[0];
		return null;
	}, [activeRecoveryLeak, selectedClient, filteredLeaks, sidebarTab, logsSubFilter, recoveryShowAllLeaksOverride]);

	// Initialize email content and editing state whenever the active leak changes
	useEffect(() => {
		if (activeLeakToShow) {
			setEditedEmail(
				getDraftEmail(
					activeLeakToShow.id,
					activeLeakToShow.client,
					activeLeakToShow.amount,
					activeLeakToShow.type,
					agencyName,
					firstName
				)
			);
			setIsEditing(false);
			
			// Initialize audit edit states when active leak changes
			const rate = activeLeakToShow.hourlyRate ?? 100;
			const hours = activeLeakToShow.hoursLogged ?? Math.ceil(activeLeakToShow.amount / rate);
			setEditRate(rate.toString());
			setEditHours(hours.toString());
			setIsEditingAudit(false);
		}
	}, [activeLeakToShow, agencyName]);


	if (!recoveryDraftOpen) return null;

	const activeLeaksCount = filteredLeaks.filter((l) => l.status === "Leak").length;
	const securedLeaksCount = filteredLeaks.filter((l) => l.status === "Secured").length;
	const deletedLeaksCount = filteredLeaks.filter((l) => l.status === "Deleted").length;
	const logsLeaksCount = securedLeaksCount + deletedLeaksCount;

	// Check if all leaks are secured or deleted in this view
	const allSecured = filteredLeaks.length > 0 && filteredLeaks.every((l) => l.status === "Secured" || l.status === "Deleted");

	// Total recovered value
	const totalRecoveredValue = filteredLeaks
		.filter((l) => l.status === "Secured")
		.reduce((sum, l) => sum + l.amount, 0);

	// Filter active/logs list based on selected sidebar tab & sub-filter
	const listLeaks = useMemo(() => {
		if (sidebarTab === "active") {
			return filteredLeaks.filter((l) => l.status === "Leak");
		} else {
			return filteredLeaks.filter((l) => {
				if (logsSubFilter === "all") return l.status === "Secured" || l.status === "Deleted";
				if (logsSubFilter === "secured") return l.status === "Secured";
				if (logsSubFilter === "deleted") return l.status === "Deleted";
				return false;
			});
		}
	}, [filteredLeaks, sidebarTab, logsSubFilter]);

	// Apply search query filter to the active list
	const searchedLeaks = useMemo(() => {
		if (!modalSearchQuery.trim()) return listLeaks;
		const query = modalSearchQuery.toLowerCase();
		return listLeaks.filter(
			(l) =>
				l.client.toLowerCase().includes(query) ||
				l.type.toLowerCase().includes(query) ||
				l.code.toLowerCase().includes(query)
		);
	}, [listLeaks, modalSearchQuery]);

	const handleSendToStripe = (leak: LeakItem) => {
		// Mark specific leak as secured
		setLeaks((prev) =>
			prev.map((l) =>
				l.id === leak.id
					? { ...l, status: "Secured" as const }
					: l
			)
		);
		addLog(
			`Stripe Invoice created for ${leak.client}. Amount: $${leak.amount.toLocaleString()}. Status: SENT.`,
			"success"
		);

		// Update active in-view leak reference to reflect the update
		setActiveRecoveryLeak({ ...leak, status: "Secured" });
	};

	const handleDeleteLeak = (leak: LeakItem) => {
		setLeaks((prev) =>
			prev.map((l) =>
				l.id === leak.id
					? { ...l, status: "Deleted" as const }
					: l
			)
		);
		addLog(
			`Moved leak ${leak.code} (${leak.client}) directly to logs as Deleted.`,
			"warning"
		);

		if (activeRecoveryLeak && activeRecoveryLeak.id === leak.id) {
			setActiveRecoveryLeak({ ...leak, status: "Deleted" });
		}
	};

	const handleRestoreLeak = (leak: LeakItem) => {
		setLeaks((prev) =>
			prev.map((l) =>
				l.id === leak.id
					? { ...l, status: "Leak" as const }
					: l
			)
		);
		addLog(
			`Restored leak ${leak.code} (${leak.client}) back to Active Leaks.`,
			"success"
		);

		setActiveRecoveryLeak({ ...leak, status: "Leak" });
	};

	const handleSaveAuditValues = () => {
		if (!activeLeakToShow) return;
		const rate = parseFloat(editRate) || 0;
		const hours = parseFloat(editHours) || 0;
		const newAmount = rate * hours;

		setLeaks((prev) =>
			prev.map((l) =>
				l.id === activeLeakToShow.id
					? { ...l, amount: newAmount, hourlyRate: rate, hoursLogged: hours }
					: l
			)
		);

		addLog(
			`Updated audit details for ${activeLeakToShow.client} leak (${activeLeakToShow.code}): ${hours} hrs @ $${rate}/hr (Total: $${newAmount.toLocaleString()}).`,
			"success"
		);

		setActiveRecoveryLeak({ ...activeLeakToShow, amount: newAmount, hourlyRate: rate, hoursLogged: hours });
		setIsEditingAudit(false);
	};

	// Format text inside textarea at cursor selection
	const handleFormat = (style: string) => {
		const textarea = document.getElementById("email-textarea") as HTMLTextAreaElement;
		if (!textarea) return;

		const start = textarea.selectionStart;
		const end = textarea.selectionEnd;
		const text = textarea.value;
		const selected = text.substring(start, end);

		let replacement = "";
		if (style === "bold") replacement = `**${selected}**`;
		else if (style === "italic") replacement = `*${selected}*`;
		else if (style === "underline") replacement = `<u>${selected}</u>`;
		else if (style === "link") replacement = `[${selected || "link"}](url)`;
		else if (style === "code") replacement = `\`${selected}\``;

		const newText = text.substring(0, start) + replacement + text.substring(end);
		setEditedEmail(newText);

		// Refocus textarea after action and set selection bounds
		setTimeout(() => {
			textarea.focus();
			textarea.setSelectionRange(start + 2, start + 2 + selected.length);
		}, 50);
	};

	const hourlyRate = 100;
	const computedHours = activeLeakToShow ? Math.ceil(activeLeakToShow.amount / hourlyRate) : 0;

	return (
		<div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
			<div className="bg-popover border border-border rounded-xl shadow-2xl w-full max-w-4xl h-[85vh] overflow-hidden flex flex-col justify-between animate-in zoom-in-95 duration-200">
				
				{/* Modal Top Header */}
				<div className="flex items-center justify-between border-b p-4 bg-muted/20 shrink-0">
					<div className="flex items-center gap-2">
						<FileTextIcon className="size-4.5 text-primary" />
						<div className="flex flex-col">
							<span className="font-bold text-sm text-foreground">
								Recovery Hub
							</span>
							<span className="text-[9px] text-muted-foreground uppercase font-semibold mt-0.5">
								{selectedClient === "All Accounts" 
									? "Global Revenue Leakage Audit Ledger" 
									: `Revenue Leakage Ledger: ${selectedClient}`}
							</span>
						</div>
					</div>
					<button
						onClick={() => setRecoveryDraftOpen(false)}
						className="rounded-md p-1 hover:bg-muted text-muted-foreground hover:text-foreground transition-all"
					>
						<XIcon className="size-4" />
					</button>
				</div>

				{/* Modal Main Split Layout */}
				<div className="flex-1 flex min-h-0 bg-background">
					
					{/* Left Sidebar: Master leaks list + tab selector */}
					<div className="w-1/3 border-r flex flex-col min-h-0 shrink-0 bg-muted/10">
						
						{/* Animated Search Header */}
						<div className="p-3 border-b bg-muted/25 flex items-center justify-between min-h-[38px] relative overflow-hidden shrink-0">
							{!searchOpen ? (
								<>
									<span className="font-semibold text-[10px] text-muted-foreground uppercase tracking-wider animate-in fade-in duration-200">
										Billing Audit Ledger
									</span>
									<button
										onClick={() => setSearchOpen(true)}
										className="rounded p-1 hover:bg-muted text-muted-foreground hover:text-foreground transition-all ml-auto animate-in zoom-in duration-200"
										title="Search leaks"
									>
										<SearchIcon className="size-3.5" />
									</button>
								</>
							) : (
								<div className="flex items-center gap-1.5 w-full animate-in slide-in-from-right-3 duration-250">
									<SearchIcon className="size-3.5 text-primary shrink-0" />
									<input
										type="text"
										value={modalSearchQuery}
										onChange={(e) => setModalSearchQuery(e.target.value)}
										placeholder="Search client or type..."
										className="flex-1 bg-transparent border-none text-[11px] p-0 focus:outline-none focus:ring-0 text-foreground placeholder:text-muted-foreground/45"
										autoFocus
									/>
									<button
										onClick={() => {
											setSearchOpen(false);
											setModalSearchQuery("");
										}}
										className="rounded p-0.5 hover:bg-muted text-muted-foreground hover:text-foreground"
									>
										<XIcon className="size-3.5" />
									</button>
								</div>
							)}
						</div>

						{/* Left Sidebar Tab Selector */}
						<div className="flex border-b bg-muted/30 p-1 shrink-0 gap-1 select-none">
							<button
								onClick={() => setSidebarTab("active")}
								className={cn(
									"flex-1 text-center py-1 text-[10px] font-bold rounded-md transition-all flex items-center justify-center gap-1.5 h-7",
									sidebarTab === "active"
										? "bg-background text-foreground shadow-2xs border border-border"
										: "text-muted-foreground hover:text-foreground hover:bg-muted/30"
								)}
							>
								Active Leaks
								<span className={cn(
									"text-[9px] px-1.5 rounded-full",
									sidebarTab === "active" ? "bg-rose-500/10 text-rose-500" : "bg-muted text-muted-foreground"
								)}>
									{activeLeaksCount}
								</span>
							</button>
							<button
								onClick={() => setSidebarTab("logs")}
								className={cn(
									"flex-1 text-center py-1 text-[10px] font-bold rounded-md transition-all flex items-center justify-center gap-1.5 h-7",
									sidebarTab === "logs"
										? "bg-background text-foreground shadow-2xs border border-border"
										: "text-muted-foreground hover:text-foreground hover:bg-muted/30"
								)}
							>
								Logs
								<span className={cn(
									"text-[9px] px-1.5 rounded-full",
									sidebarTab === "logs" ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-muted text-muted-foreground"
								)}>
									{logsLeaksCount}
								</span>
							</button>
						</div>

						{/* Logs Category Sub-Filters */}
						{sidebarTab === "logs" && (
							<div className="flex border-b bg-muted/15 p-1 shrink-0 gap-1 select-none text-[9px] font-semibold text-muted-foreground items-center justify-center min-h-[28px]">
								<span>Show:</span>
								<button
									onClick={() => setLogsSubFilter("all")}
									className={cn(
										"px-1.5 py-0.5 rounded-sm transition-all",
										logsSubFilter === "all" ? "bg-muted text-foreground font-bold" : "hover:text-foreground"
									)}
								>
									All ({logsLeaksCount})
								</button>
								<span className="opacity-30">|</span>
								<button
									onClick={() => setLogsSubFilter("secured")}
									className={cn(
										"px-1.5 py-0.5 rounded-sm transition-all",
										logsSubFilter === "secured" ? "bg-muted text-emerald-500 font-bold" : "hover:text-foreground"
									)}
								>
									Secured ({securedLeaksCount})
								</button>
								<span className="opacity-30">|</span>
								<button
									onClick={() => setLogsSubFilter("deleted")}
									className={cn(
										"px-1.5 py-0.5 rounded-sm transition-all",
										logsSubFilter === "deleted" ? "bg-muted text-rose-500 font-bold" : "hover:text-foreground"
									)}
								>
									Deleted ({deletedLeaksCount})
								</button>
							</div>
						)}

						{/* Scrollable List */}
						<div className="flex-1 overflow-y-auto p-2 flex flex-col gap-1.5">
							{searchedLeaks.map((leak) => {
								const isSelected = activeLeakToShow && activeLeakToShow.id === leak.id;
								return (
									<div
										key={leak.id}
										onClick={() => setActiveRecoveryLeak(leak)}
										className={cn(
											"p-3 rounded-lg border transition-all duration-200 cursor-pointer select-none flex flex-col gap-1.5",
											isSelected
												? "bg-primary/10 border-primary/25 shadow-xs"
												: "border-transparent hover:bg-muted/30"
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
														{leak.client}
													</span>
												</div>
												<span className="font-mono text-[9px] text-muted-foreground mt-0.5 block">
													{leak.code}
												</span>
											</div>
											<div className="flex items-center gap-1.5 shrink-0 select-none">
												<span className="font-mono font-bold text-[11px] text-foreground">
													${leak.amount.toLocaleString()}
												</span>
												{sidebarTab === "active" && (
													<button
														type="button"
														onClick={(e) => {
															e.stopPropagation();
															handleDeleteLeak(leak);
														}}
														className="text-muted-foreground hover:text-rose-500 rounded p-1 hover:bg-muted/80 transition-all shrink-0"
														title="Move directly to Logs"
													>
														<Trash2Icon className="size-3.5" />
													</button>
												)}
											</div>
										</div>

										<div className="flex items-center justify-between gap-2 mt-0.5">
											<span className="text-[10px] text-muted-foreground truncate max-w-[130px]">
												{leak.type}
											</span>
											<span className={cn(
												"text-[8px] font-bold px-1.5 py-0.5 rounded-sm uppercase tracking-wider",
												leak.status === "Secured"
													? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
													: leak.status === "Deleted"
														? "bg-amber-500/10 text-amber-500"
														: "bg-rose-500/10 text-rose-500"
											)}>
												{leak.status}
											</span>
										</div>
									</div>
								);
							})}

							{searchedLeaks.length === 0 && (
								<p className="text-center text-[11px] text-muted-foreground py-8">
									No matches found in {sidebarTab} list
								</p>
							)}
						</div>
					</div>

					{/* Right Detail Pane (Switches to success screen when allSecured) */}
					<div className="flex-1 flex flex-col min-h-0 bg-background">
						
						{!activeLeakToShow ? (
							/* Empty State Screen when no leak is active/available for current client */
							<div className="flex-1 flex flex-col justify-center items-center p-8 text-center bg-background select-none animate-in fade-in duration-300">
								<div className="size-14 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-500 mb-4 animate-bounce">
									<AnimatedCheck size={32} strokeWidth={2.5} className="text-emerald-500" />
								</div>
								<h3 className="text-base font-bold text-foreground mb-1">
									All Systems Secured
								</h3>
								<p className="text-xs text-muted-foreground max-w-xs leading-relaxed mb-6">
									There are no unbilled contract deviations or overages detected for {selectedClient === "All Accounts" ? "any client accounts" : selectedClient}.
								</p>
								<Button
									variant="default"
									size="sm"
									onClick={() => setRecoveryDraftOpen(false)}
									className="h-9 px-4 font-bold text-xs"
								>
									Close Panel
								</Button>
							</div>
						) : allSecured && sidebarTab === "active" ? (
							/* Reconciliation Success Screen */
							<div className="flex-1 flex flex-col justify-center items-center p-8 text-center bg-background select-none animate-in fade-in duration-300">
								<div className="size-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-500 mb-4 animate-bounce">
									<AnimatedCheck size={36} strokeWidth={2.5} className="text-emerald-500" />
								</div>
								
								<h3 className="text-base font-bold text-foreground mb-1">
									All Contract Deviations Conciliated
								</h3>
								<p className="text-xs text-muted-foreground max-w-sm leading-relaxed mb-6">
									Stripe billing drafts generated and processed. Total revenue leakage has been successfully secured to 0%.
								</p>
								
								<div className="border border-border/80 rounded-xl p-5 w-full max-w-sm bg-muted/5 flex flex-col gap-3.5 mb-6">
									<div className="flex justify-between items-center text-xs">
										<span className="text-muted-foreground">Scope Audit Status</span>
										<span className="font-bold text-emerald-500 uppercase tracking-wider text-[10px] bg-emerald-500/10 px-2 py-0.5 rounded-sm border border-emerald-500/20">
											100% Secured
										</span>
									</div>
									<div className="h-px bg-border/50" />
									<div className="flex justify-between items-center">
										<span className="text-xs text-muted-foreground">Total Recovered Balance</span>
										<span className="font-mono text-sm font-extrabold text-foreground">
											${totalRecoveredValue.toLocaleString()}.00
										</span>
									</div>
								</div>
								
								<div className="flex items-center gap-3">
									<Button
										variant="outline"
										size="sm"
										onClick={() => setSidebarTab("logs")}
										className="h-9 px-4 font-semibold text-xs flex items-center gap-1.5"
									>
										<TerminalIcon className="size-3.5" />
										View Leak Logs
									</Button>
									<Button
										variant="default"
										size="sm"
										onClick={() => setRecoveryDraftOpen(false)}
										className="h-9 px-4 font-bold text-xs"
									>
										Close Panel
									</Button>
								</div>
							</div>
						) : (
							/* Standard Active/Secured Leak Detail View */
							<>
								<div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
									
									{/* Client Meta Info Card */}
									<div className="flex items-center justify-between border-b pb-4">
										<div className="flex flex-col gap-1.5">
											<span className="text-[9px] text-muted-foreground uppercase tracking-wider font-semibold flex items-center gap-1">
												<UserIcon className="size-3 text-muted-foreground/60" />
												Client Billing Entity
											</span>
											<span className="text-base font-bold text-foreground">
												{activeLeakToShow.client}
											</span>
										</div>
										<div className="text-end flex flex-col gap-1.5">
											<span className="text-[9px] text-muted-foreground uppercase tracking-wider font-semibold flex items-center gap-1 justify-end">
												<CoinsIcon className="size-3 text-muted-foreground/60" />
												Audit Deviation Code
											</span>
											<span className="font-mono text-sm font-bold text-foreground bg-muted/65 border px-2 py-0.5 rounded-md">
												{activeLeakToShow.code}
											</span>
										</div>
									</div>

									{/* Reconciliation Email Draft Card with Editor Toolbar */}
									<div className="flex flex-col gap-2.5">
										<div className="flex items-center justify-between">
											<h4 className="font-bold text-foreground uppercase text-[10px] tracking-wider">
												Diplomatic Reconciliation Email Draft
											</h4>
											{activeLeakToShow.status === "Leak" && (
												<Button
													type="button"
													variant="ghost"
													size="xs"
													onClick={() => setIsEditing(!isEditing)}
													className="h-6 text-[10px] font-bold text-primary hover:bg-primary/10 gap-1 rounded-md"
												>
													<Edit2Icon className="size-3" />
													{isEditing ? "View Mode" : "Edit Draft"}
												</Button>
											)}
										</div>

										{isEditing && activeLeakToShow.status === "Leak" ? (
											<div className="flex flex-col border rounded-xl overflow-hidden shadow-xs bg-background focus-within:ring-1 focus-within:ring-primary focus-within:border-primary">
												
												{/* Rich Text Format Bar */}
												<div className="flex items-center gap-0.5 p-1 bg-muted/30 border-b shrink-0 select-none">
													<button
														type="button"
														className="p-1.5 hover:bg-muted rounded text-muted-foreground hover:text-foreground transition-all"
														onClick={() => handleFormat("bold")}
														title="Bold"
													>
														<BoldIcon className="size-3.5" />
													</button>
													<button
														type="button"
														className="p-1.5 hover:bg-muted rounded text-muted-foreground hover:text-foreground transition-all"
														onClick={() => handleFormat("italic")}
														title="Italic"
													>
														<ItalicIcon className="size-3.5" />
													</button>
													<button
														type="button"
														className="p-1.5 hover:bg-muted rounded text-muted-foreground hover:text-foreground transition-all"
														onClick={() => handleFormat("underline")}
														title="Underline"
													>
														<UnderlineIcon className="size-3.5" />
													</button>
													<div className="w-px h-5 bg-border mx-1" />
													<button
														type="button"
														className="p-1.5 hover:bg-muted rounded text-muted-foreground hover:text-foreground transition-all"
														onClick={() => handleFormat("link")}
														title="Insert Link"
													>
														<LinkIcon className="size-3.5" />
													</button>
													<button
														type="button"
														className="p-1.5 hover:bg-muted rounded text-muted-foreground hover:text-foreground transition-all"
														onClick={() => handleFormat("code")}
														title="Code Block"
													>
														<CodeIcon className="size-3.5" />
													</button>
												</div>

												{/* Editable textarea editor */}
												<textarea
													id="email-textarea"
													value={editedEmail}
													onChange={(e) => setEditedEmail(e.target.value)}
													rows={8}
													className="w-full bg-transparent border-none text-[11.5px] p-4 text-foreground focus:outline-none focus:ring-0 leading-relaxed font-mono resize-none"
												/>
											</div>
										) : (
											/* Read-only Draft render */
											<div className="border border-dashed border-border/80 rounded-xl p-4.5 bg-muted/15 font-mono text-[11.5px] text-muted-foreground leading-relaxed whitespace-pre-wrap select-text">
												{editedEmail}
											</div>
										)}
									</div>

									{/* Detailed Telemetry Audit Summary details */}
									<div className="flex flex-col gap-3">
										<div className="flex items-center justify-between">
											<h4 className="font-semibold text-foreground uppercase text-[10px] tracking-wider">
												Telemetry Audit Summary
											</h4>
											{activeLeakToShow.status === "Leak" && (
												<button
													type="button"
													onClick={() => {
														if (isEditingAudit) {
															setIsEditingAudit(false);
															const rate = activeLeakToShow.hourlyRate ?? 100;
															const hours = activeLeakToShow.hoursLogged ?? Math.ceil(activeLeakToShow.amount / rate);
															setEditRate(rate.toString());
															setEditHours(hours.toString());
														} else {
															setIsEditingAudit(true);
														}
													}}
													className="text-[9px] font-bold text-primary hover:bg-primary/10 gap-1 rounded-md p-1 px-2 transition-all flex items-center border border-primary/20 bg-primary/5 shrink-0"
												>
													{isEditingAudit ? (
														<>
															<XIcon className="size-3" />
															Cancel
														</>
													) : (
														<>
															<Edit2Icon className="size-3" />
															Edit Audit
														</>
													)}
												</button>
											)}
										</div>

										<div className="border rounded-xl divide-y bg-muted/5">
											{isEditingAudit ? (
												<>
													<div className="grid grid-cols-12 gap-4 px-4.5 py-3 text-xs items-center">
														<div className="col-span-4 font-semibold text-foreground">Deviation Category</div>
														<div className="col-span-8 truncate text-muted-foreground">{activeLeakToShow.type}</div>
													</div>
													<div className="grid grid-cols-12 gap-4 px-4.5 py-3 text-xs items-center">
														<div className="col-span-4 font-semibold text-foreground">Retainer Cap Leakage</div>
														<div className="col-span-8 font-mono text-rose-500 font-bold">
															${((parseFloat(editHours) || 0) * (parseFloat(editRate) || 0)).toLocaleString()}.00
															<span className="text-[9px] text-muted-foreground font-sans font-normal ml-1.5">(computed: hours × rate)</span>
														</div>
													</div>
													<div className="grid grid-cols-12 gap-4 px-4.5 py-3 text-xs items-center">
														<div className="col-span-4 font-semibold text-foreground">Billable Hours Logged</div>
														<div className="col-span-8 flex flex-col gap-2">
															<div className="flex items-center gap-2 flex-wrap">
																<div className="flex items-center gap-1 bg-muted/65 border rounded-md px-1.5 py-1">
																	<input
																		type="number"
																		min="1"
																		value={editHours}
																		onChange={(e) => setEditHours(e.target.value)}
																		className="w-12 bg-transparent text-xs font-mono font-bold text-foreground focus:outline-none border-none p-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
																	/>
																	<span className="text-[10px] text-muted-foreground">hrs</span>
																</div>
																<span className="text-muted-foreground text-[10px]">@</span>
																<div className="flex items-center gap-1 bg-muted/65 border rounded-md px-1.5 py-1">
																	<span className="text-[10px] text-muted-foreground">$</span>
																	<input
																		type="number"
																		min="1"
																		value={editRate}
																		onChange={(e) => setEditRate(e.target.value)}
																		className="w-12 bg-transparent text-xs font-mono font-bold text-foreground focus:outline-none border-none p-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
																	/>
																	<span className="text-[10px] text-muted-foreground">/hr</span>
																</div>
																<Button
																	type="button"
																	size="xs"
																	onClick={() => handleSaveAuditValues()}
																	className="font-bold text-[10px] h-7 px-3 bg-emerald-600 hover:bg-emerald-700 text-white shrink-0"
																>
																	Save
																</Button>
															</div>
														</div>
													</div>
												</>
											) : (
												<>
													<div className="grid grid-cols-12 gap-4 px-4.5 py-3 text-xs">
														<div className="col-span-4 font-semibold text-foreground">Deviation Category</div>
														<div className="col-span-8 truncate text-muted-foreground">{activeLeakToShow.type}</div>
													</div>
													<div className="grid grid-cols-12 gap-4 px-4.5 py-3 text-xs">
														<div className="col-span-4 font-semibold text-foreground">Retainer Cap Leakage</div>
														<div className="col-span-8 font-mono text-rose-500 font-bold">
															${activeLeakToShow.amount.toLocaleString()}.00
														</div>
													</div>
													<div className="grid grid-cols-12 gap-4 px-4.5 py-3 text-xs">
														<div className="col-span-4 font-semibold text-foreground">Billable Hours Logged</div>
														<div className="col-span-8 font-mono text-foreground font-semibold">
															{activeLeakToShow.hoursLogged ?? Math.ceil(activeLeakToShow.amount / (activeLeakToShow.hourlyRate ?? 100))} hrs @ ${activeLeakToShow.hourlyRate ?? 100}/hr
														</div>
													</div>
												</>
											)}
										</div>
									</div>

									{/* AI Telemetry Analysis & Summary */}
									<div className="flex flex-col gap-2 bg-muted/10 border border-dashed border-border rounded-xl p-4">
										<h4 className="font-semibold text-foreground uppercase text-[10px] tracking-wider flex items-center gap-1.5 select-none">
											<BotIcon className="size-4 text-muted-foreground animate-pulse" />
											AI Telemetry Analysis & Summary
										</h4>
										<div className="flex flex-col gap-3 mt-2 leading-relaxed text-[11px] text-muted-foreground">
											<div>
												<strong className="text-foreground block text-[11px] mb-0.5 font-sans">What is happening:</strong>
												<span className="font-light">{getAiAnalysis(activeLeakToShow.id).happening}</span>
											</div>
											<div>
												<strong className="text-foreground block text-[11px] mb-0.5 font-sans">Potential Risk:</strong>
												<span className="font-light">{getAiAnalysis(activeLeakToShow.id).risk}</span>
											</div>
											<div>
												<strong className="text-foreground block text-[11px] mb-0.5 font-sans">Mitigation Recommendation:</strong>
												<span className="font-semibold text-primary">{getAiAnalysis(activeLeakToShow.id).recommendation}</span>
											</div>
										</div>
									</div>
								</div>

								{/* Right detail Pane Footer */}
								<div className="border-t p-4 bg-muted/20 flex items-center justify-between shrink-0 select-none">
									<span className="text-[10px] text-muted-foreground flex items-center gap-1.5">
										{activeLeakToShow.status === "Secured" ? (
											<>
												<AnimatedCheck size={15} strokeWidth={3} className="text-emerald-500" />
												Stripe Invoice generated & paid
											</>
										) : activeLeakToShow.status === "Deleted" ? (
											<>
												<Trash2Icon className="size-4 text-rose-500" />
												Removed from active reconciliation list
											</>
										) : (
											<>
												<AlertCircleIcon className="size-4 text-rose-500" />
												Transmits invoice link to Stripe Checkout on confirm
											</>
										)}
									</span>

									<div className="flex items-center gap-2.5">
										<Button
											variant="outline"
											size="sm"
											onClick={() => setRecoveryDraftOpen(false)}
											className="h-9 font-semibold text-xs"
										>
											Close
										</Button>
										{activeLeakToShow.status === "Leak" ? (
											<Button
												size="sm"
												variant="default"
												className={cn(
													"bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-9 flex items-center gap-1.5 px-4 shadow-sm transition-all duration-300",
													recoveryHighlightSubmit && "ring-2 ring-emerald-500/80 shadow-[0_0_15px_rgba(16,185,129,0.75)] animate-pulse"
												)}
												onClick={() => handleSendToStripe(activeLeakToShow)}
											>
												<SendIcon className="size-3.5" />
												Submit to Stripe
											</Button>
										) : activeLeakToShow.status === "Deleted" ? (
											<Button
												size="sm"
												variant="default"
												className="bg-primary hover:bg-primary/95 text-primary-foreground font-bold h-9 flex items-center gap-1.5 px-4 shadow-sm transition-all duration-300"
												onClick={() => handleRestoreLeak(activeLeakToShow)}
											>
												<RotateCcwIcon className="size-3.5" />
												Restore to Active
											</Button>
										) : (
											<Button
												size="sm"
												variant="outline"
												disabled
												className="h-9 flex items-center gap-1.5 px-4 border-emerald-500/20 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400 font-semibold"
											>
												<AnimatedCheck size={14} strokeWidth={3} className="text-emerald-500" />
												Invoiced
											</Button>
										)}
									</div>
								</div>
							</>
						)}

					</div>

				</div>

			</div>
		</div>
	);
}
