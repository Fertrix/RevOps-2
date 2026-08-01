"use client";

import { cn } from "@/lib/utils";
import { useAppContext } from "@/components/app-context";
import {
	XIcon,
	SparklesIcon,
	SendIcon,
	ChevronDownIcon,
	Maximize2Icon,
	Minimize2Icon,
	ArrowRightIcon,
	CheckIcon,
} from "lucide-react";
import React, { useState, useRef, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { motion, useDragControls, useMotionValue, animate, AnimatePresence } from "framer-motion";

interface ChatAction {
	type: "go-to-client" | "trigger-audit" | "open-leak";
	clientName?: string;
	leakId?: string;
	label: string;
}

interface ChatCardItem {
	title: string;
	subtitle: string;
	value: string;
	details?: string;
	badge?: string;
	badgeColor?: string;
	action?: ChatAction;
}

interface ChatMessage {
	sender: "user" | "ai";
	text: string;
	time: string;
	cards?: ChatCardItem[];
}

export function SentinelTerminal() {
	const {
		leaks,
		churnAlerts,
		systemStatus,
		setSelectedClient,
		setActiveView,
		setActiveRecoveryLeak,
		setRecoveryDraftOpen,
		setRecoveryHighlightSubmit,
		addLog,
		runIntegrityAudit,
		triggerWidgetHighlight,
		setRecoveryShowAllLeaksOverride,
	} = useAppContext();

	const [isOpen, setIsOpen] = useState(false);
	const [isExpanded, setIsExpanded] = useState(false);
	const [input, setInput] = useState("");

	const [dimensions, setDimensions] = useState({ width: 1200, height: 800 });

	useEffect(() => {
		if (typeof window !== "undefined") {
			const handleResize = () => {
				setDimensions({ width: window.innerWidth, height: window.innerHeight });
			};
			handleResize();
			window.addEventListener("resize", handleResize);
			return () => window.removeEventListener("resize", handleResize);
		}
	}, []);

	const currentWidth = isExpanded ? 420 : 320;
	const currentHeight = isExpanded ? 560 : 384;

	// Calculate maximum negative offsets from default bottom-right anchoring
	const maxNegativeX = -(dimensions.width - currentWidth - 24 - 10);
	const maxNegativeY = -(dimensions.height - currentHeight - 24 - 10);
	const [messages, setMessages] = useState<ChatMessage[]>([
		{
			sender: "ai",
			text: "Hello! I am Sentinel AI, your real-time RevOps assistant. I analyze your timesheets, client sentiment, and billing gateway connections. What would you like to review today?",
			time: new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }),
		},
	]);

	const chatEndRef = useRef<HTMLDivElement>(null);
	const dragControls = useDragControls();
	const x = useMotionValue(0);
	const y = useMotionValue(0);

	// Detect if expanding would push the boundaries outside the viewport, and auto-adjust
	useEffect(() => {
		const currentY = y.get();
		const limitY = -(dimensions.height - currentHeight - 24 - 10);
		if (currentY < limitY) {
			animate(y, limitY, { type: "spring", stiffness: 200, damping: 25 });
		}

		const currentX = x.get();
		const limitX = -(dimensions.width - currentWidth - 24 - 10);
		if (currentX < limitX) {
			animate(x, limitX, { type: "spring", stiffness: 200, damping: 25 });
		}
	}, [isExpanded, dimensions.width, dimensions.height, currentWidth, currentHeight, x, y]);

	// Auto scroll to bottom when messages change
	useEffect(() => {
		if (chatEndRef.current) {
			chatEndRef.current.scrollIntoView({ behavior: "smooth" });
		}
	}, [messages, isOpen]);

	const handleActionClick = (action: ChatAction) => {
		if (action.type === "go-to-client") {
			if (action.clientName) {
				setSelectedClient(action.clientName as any);
				triggerWidgetHighlight("churn-shield", "client-portfolio");
			}
		} else if (action.type === "open-leak") {
			if (action.clientName && action.leakId) {
				const leak = leaks.find((l) => l.id === action.leakId);
				if (leak) {
					setRecoveryShowAllLeaksOverride(true);
					setActiveRecoveryLeak(leak);
					setRecoveryHighlightSubmit(true);
					setRecoveryDraftOpen(true);
					addLog(`Opening AI Recovery Auditor for ${action.clientName} via Sentinel AI...`, "info");
				}
			}
		} else if (action.type === "trigger-audit") {
			runIntegrityAudit();
		}
	};

	const handleSend = (e: React.FormEvent) => {
		e.preventDefault();
		if (!input.trim()) return;

		const userText = input.trim();
		const timeStr = new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });

		// Add user message
		setMessages((prev) => [...prev, { sender: "user", text: userText, time: timeStr }]);
		setInput("");

		// Generate dynamic AI responses based on live database state
		setTimeout(() => {
			const query = userText.toLowerCase();
			let aiReply = "";
			let dynamicCards: ChatCardItem[] = [];

			if (query.includes("leak") || query.includes("fuga") || query.includes("desviacion") || query.includes("perd") || query.includes("scope")) {
				const activeLeaks = leaks.filter((l) => l.status === "Leak");
				const totalLeakAmount = activeLeaks.reduce((sum, l) => sum + l.amount, 0);

				if (activeLeaks.length > 0) {
					aiReply = `I detected ${activeLeaks.length} active revenue leak${activeLeaks.length > 1 ? "s" : ""} totaling $${totalLeakAmount.toLocaleString()}. Here is the contract deviation breakdown:`;
					
					dynamicCards = activeLeaks.map((l) => ({
						title: l.client,
						subtitle: l.code,
						value: `$${l.amount.toLocaleString()}`,
						details: l.type,
						badge: "LEAK",
						badgeColor: "bg-rose-500/10 text-rose-500 border-rose-500/20",
						action: {
							type: "open-leak" as const,
							clientName: l.client,
							leakId: l.id,
							label: `Audit & Recover`,
						},
					}));
				} else {
					aiReply = "All identified revenue leaks have been successfully secured and billed. Net margin is running at its nominal target.";
				}
			} else if (query.includes("churn") || query.includes("riesgo") || query.includes("client") || query.includes("alerta") || query.includes("amenaza")) {
				const activeChurns = churnAlerts.filter((c) => c.status === "active");

				if (activeChurns.length > 0) {
					aiReply = `I am tracking ${activeChurns.length} active customer churn warnings. Here is the operational sentiment analysis:`;

					dynamicCards = activeChurns.map((c) => ({
						title: c.client,
						subtitle: c.severity === "critical" ? "Critical Risk" : "Moderate Risk",
						value: `${c.probability}%`,
						details: `Trigger: ${c.tags.join(", ")}`,
						badge: c.severity.toUpperCase(),
						badgeColor: c.severity === "critical" ? "bg-rose-500/10 text-rose-500 border-rose-500/20" : "bg-amber-500/10 text-amber-500 border-amber-500/20",
						action: {
							type: "go-to-client" as const,
							clientName: c.client,
							label: `Open ${c.client} Portfolio`,
						},
					}));
				} else {
					aiReply = "Operational databases and Slack sentiment scores are clear. No active churn threats detected.";
				}
			} else if (query.includes("stripe") || query.includes("status") || query.includes("api") || query.includes("offline") || query.includes("error") || query.includes("webhook")) {
				aiReply = "Stripe Gateway Integration Stream Audit:";
				
				if (systemStatus === "api-failure") {
					dynamicCards = [
						{
							title: "Webhook Gateway Node",
							subtitle: "Pipeline Offline",
							value: "ERROR",
							details: "Ingestion queue timed out. Local cache fallback active.",
							badge: "OFFLINE",
							badgeColor: "bg-rose-500/10 text-rose-500 border-rose-500/20",
							action: {
								type: "trigger-audit" as const,
								label: "Recover Stripe Webhook Stream",
							},
						},
					];
				} else {
					dynamicCards = [
						{
							title: "Webhook Gateway Node",
							subtitle: "Pipeline Stream Healthy",
							value: "ONLINE",
							details: "Ingestion latency at 14ms. Webhook event signatures verified.",
							badge: "HEALTHY",
							badgeColor: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
						},
					];
				}
			} else if (query.includes("hello") || query.includes("hi") || query.includes("hola") || query.includes("help") || query.includes("ayuda")) {
				aiReply = "I'm here to help you audit your agency's operations. Ask me about active leaks, churn threats, or integration health.";
			} else {
				aiReply = "I am auditing your operational databases. I can provide real-time status reports on active revenue leaks, customer churn indicators, or API gateway failures. Let me know what you'd like to inspect!";
			}

			setMessages((prev) => [
				...prev,
				{
					sender: "ai",
					text: aiReply,
					time: new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }),
					cards: dynamicCards.length > 0 ? dynamicCards : undefined,
				},
			]);
		}, 600);
	};

	return (
		<>
			{/* Protruding Tab on the Right Screen Edge */}
			{!isOpen && (
				<motion.div
					onClick={() => setIsOpen(true)}
					initial={{ x: 50, opacity: 0 }}
					animate={{ x: 0, opacity: 1 }}
					exit={{ x: 50, opacity: 0 }}
					whileHover={{ x: -2 }}
					className="fixed right-0 bottom-28 z-40 bg-stone-950 border border-r-0 border-violet-500/30 rounded-l-md p-2.5 cursor-pointer flex items-center justify-center text-violet-500/80 hover:text-violet-400 hover:bg-stone-900 transition-all select-none"
					title="Ask Sentinel AI Assistant"
				>
					<SparklesIcon className="size-3.5 text-violet-500/80" />
				</motion.div>
			)}

			<AnimatePresence>
				{/* Expanded Chat Assistant Panel */}
				{isOpen && (
					<motion.div
						drag
						dragControls={dragControls}
						dragListener={false}
						dragMomentum={false}
						dragElastic={0.1}
						style={{ x, y, transformOrigin: "right 85%" }}
						initial={{ opacity: 0, scale: 0.05 }}
						animate={{ opacity: 1, scale: 1 }}
						exit={{ opacity: 0, scale: 0.05 }}
						transition={{ type: "spring", stiffness: 240, damping: 25 }}
						dragConstraints={{
							top: maxNegativeY,
							bottom: 0,
							left: maxNegativeX,
							right: 0,
						}}
						className={cn(
							"bg-popover border border-border shadow-2xl flex flex-col justify-between overflow-hidden transition-[width,height,margin,border-radius] duration-500 ease-in-out select-text rounded-xl fixed bottom-6 right-6 z-40 touch-none",
							isExpanded ? "w-[420px] h-[560px]" : "w-80 h-96"
						)}
					>
						{/* Top Header wrapper incorporating Drag Handle Grip Bar */}
						<div className="flex flex-col border-b bg-muted/30 shrink-0 select-none">
							{/* Drag handle grip bar indicator */}
							<div
								onPointerDown={(e) => dragControls.start(e)}
								className="h-3.5 flex items-center justify-center cursor-grab active:cursor-grabbing hover:bg-muted/50 transition-all group shrink-0 border-b border-border/40"
								title="Drag from here to reposition"
							>
								<div className="flex gap-1 items-center justify-center">
									{/* Premium horizontal grip pill */}
									<div className="w-12 h-1 bg-muted-foreground/30 rounded-full group-hover:bg-muted-foreground/60 transition-all" />
								</div>
							</div>

							{/* Main Header Contents */}
							<div className="p-3 flex items-center justify-between font-sans">
								<div className="flex items-center gap-2">
									<div className="bg-violet-500/10 p-1.5 rounded-lg text-violet-500">
										<SparklesIcon className="size-4 text-violet-500" />
									</div>
									<div className="flex flex-col">
										<span className="font-bold text-xs text-foreground tracking-wide">
											Sentinel AI Assistant
										</span>
										<span className="text-[8.5px] text-emerald-500 font-semibold uppercase tracking-wider mt-px flex items-center gap-1">
											<span className="size-1.5 rounded-full bg-emerald-500 animate-ping" />
											Active Auditor
										</span>
									</div>
								</div>
								
								<div className="flex items-center">
									<button
										onClick={() => setIsExpanded(!isExpanded)}
										className="rounded-md p-1 hover:bg-muted text-muted-foreground hover:text-foreground transition-all mr-1.5"
										title={isExpanded ? "Reduce Panel" : "Expand Panel"}
									>
										{isExpanded ? (
											<Minimize2Icon className="size-3.5" />
										) : (
											<Maximize2Icon className="size-3.5" />
										)}
									</button>
									<button
										onClick={() => {
											setIsOpen(false);
											setIsExpanded(false);
											x.set(0);
											y.set(0);
										}}
										className="rounded-md p-1 hover:bg-muted text-muted-foreground hover:text-foreground transition-all"
										title="Close Panel"
									>
										<ChevronDownIcon className="size-4" />
									</button>
								</div>
							</div>
						</div>

						{/* Chat Messages Log */}
						<div className="flex-1 p-4 overflow-y-auto flex flex-col gap-4 bg-background font-sans text-xs min-h-0">
							{messages.map((msg, idx) => (
								<div
									key={idx}
									className={cn(
										"flex flex-col max-w-[85%]",
										msg.sender === "user" ? "ml-auto items-end" : "mr-auto items-start"
									)}
								>
									<div
										className={cn(
											"px-3 py-2 rounded-lg text-xs leading-relaxed select-text",
											msg.sender === "user"
												? "bg-violet-600 text-white rounded-br-none"
												: "bg-muted text-foreground rounded-bl-none border border-border/40"
										)}
									>
										{msg.text}
									</div>

									{/* Structured Auditor Cards list */}
									{msg.cards && msg.cards.length > 0 && (
										<div className="flex flex-col gap-2 mt-2 w-full max-w-[280px]">
											{msg.cards.map((card, cidx) => {
												// Dynamic database state checkups (no hardcoding)
												let isFixed = false;
												let displayBadge = card.badge;
												let displayBadgeColor = card.badgeColor;
												let displayValue = card.value;
												let displayActionLabel = card.action?.label;

												if (card.action?.type === "open-leak" && card.action.leakId) {
													const leak = leaks.find((l) => l.id === card.action?.leakId);
													if (leak && leak.status === "Secured") {
														isFixed = true;
														displayBadge = "FIXED";
														displayBadgeColor = "bg-stone-500/10 text-stone-500 border-stone-500/15 dark:text-stone-400";
														displayActionLabel = "Secured & Billed";
													}
												} else if (card.action?.type === "go-to-client") {
													const churn = churnAlerts.find((c) => c.client === card.title);
													if (churn && churn.status === "secured") {
														isFixed = true;
														displayBadge = "FIXED";
														displayBadgeColor = "bg-stone-500/10 text-stone-500 border-stone-500/15 dark:text-stone-400";
														displayActionLabel = "Mitigated & Secured";
													}
												} else if (card.title === "Webhook Gateway Node") {
													if (systemStatus === "connected") {
														isFixed = true;
														displayValue = "ONLINE";
														displayBadge = "HEALTHY";
														displayBadgeColor = "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
														displayActionLabel = "Node Online";
													}
												}

												return (
													<div
														key={cidx}
														className={cn(
															"bg-card border border-border/75 rounded-lg overflow-hidden shadow-xs transition-all select-none",
															isFixed
																? "opacity-60 grayscale bg-muted/30 border-border/40"
																: "hover:border-violet-500/35"
														)}
													>
														<div className="p-3 border-b border-border/45 flex items-center justify-between gap-1.5 bg-muted/10">
															<span className="font-bold text-[10.5px] text-foreground truncate">
																{card.title}
															</span>
															{displayBadge && (
																<span className={cn(
																	"text-[8px] font-bold px-1.5 py-0.5 rounded-sm uppercase tracking-wider border",
																	displayBadgeColor || "bg-violet-500/10 text-violet-500 border-violet-500/20"
																)}>
																	{displayBadge}
																</span>
															)}
														</div>
														<div className="p-3 flex flex-col gap-2 bg-background/25">
															<div className="flex items-center justify-between">
																<span className="text-[10px] text-muted-foreground font-light">
																	{card.subtitle}
																</span>
																<span className="font-mono font-bold text-[11px] text-foreground">
																	{displayValue}
																</span>
															</div>
															{card.details && (
																<p className="text-[9px] text-muted-foreground/80 leading-relaxed border-t border-border/30 pt-1.5 font-light">
																	{card.details}
																</p>
															)}
														</div>
														{card.action && (
															isFixed ? (
																<div className="w-full text-center py-2 bg-muted/40 border-t border-border/30 text-[9px] font-semibold text-muted-foreground select-none flex items-center justify-center gap-1">
																	<CheckIcon className="size-3 text-emerald-500" />
																	{displayActionLabel}
																</div>
															) : (
																<button
																	onClick={() => handleActionClick(card.action!)}
																	className="w-full text-center py-2 bg-muted/20 hover:bg-violet-600 hover:text-white border-t border-border/45 text-[9.5px] font-semibold text-violet-600 dark:text-violet-400 transition-all flex items-center justify-center gap-1"
																>
																	{displayActionLabel}
																	<ArrowRightIcon className="size-2.5" />
																</button>
															)
														)}
													</div>
												);
											})}
										</div>
									)}

									<span className="text-[8px] text-muted-foreground/60 mt-1 select-none font-sans px-1">
										{msg.time}
									</span>
								</div>
							))}
							<div ref={chatEndRef} />
						</div>

						{/* Form Command Area */}
						<form
							onSubmit={handleSend}
							className="border-t bg-muted/20 px-3 py-2.5 flex items-center gap-2 font-sans shrink-0 select-none"
						>
							<input
								type="text"
								value={input}
								onChange={(e) => setInput(e.target.value)}
								placeholder="Ask about leaks, churn, API status..."
								className="flex-1 bg-transparent text-foreground text-xs focus:outline-none placeholder:text-muted-foreground/45 px-1 py-1"
							/>
							<Button
								type="submit"
								size="icon-xs"
								className="bg-violet-600 hover:bg-violet-700 text-white rounded-lg size-7 shrink-0 shadow-sm"
							>
								<SendIcon className="size-3.5" />
							</Button>
						</form>
					</motion.div>
				)}
			</AnimatePresence>
		</>
	);
}
