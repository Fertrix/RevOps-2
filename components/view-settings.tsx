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
import { useAppContext } from "@/components/app-context";
import {
	SettingsIcon,
	ShieldCheckIcon,
	PlugIcon,
	DatabaseIcon,
	RefreshCwIcon,
} from "lucide-react";
import React from "react";

const connectors = [
	{ name: "Stripe", syncFrequency: "Real-time webhook", type: "Billing Platform", latency: "142ms" },
	{ name: "Toggl Track", syncFrequency: "Every 15 minutes", type: "Timesheet DB", latency: "5s" },
	{ name: "Meta Ads API", syncFrequency: "Hourly sync", type: "Marketing Spend", latency: "1.2s" },
	{ name: "Google Ads API", syncFrequency: "Hourly sync", type: "Marketing Spend", latency: "800ms" },
];

export function ViewSettings() {
	const { systemStatus, runIntegrityAudit } = useAppContext();

	return (
		<div className="flex flex-col gap-6 w-full max-w-4xl mx-auto" id="settings-section">
			{/* Header */}
			<div className="flex flex-col gap-1.5">
				<h2 className="text-xl font-bold tracking-tight text-foreground">
					Agency Settings
				</h2>
				<p className="text-xs text-muted-foreground">
					Configure target multipliers, client spend limits, and monitor active third-party integrations.
				</p>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				{/* Configuration Rules (Left column) */}
				<Card className="dark:bg-transparent h-fit">
					<CardHeader className="flex flex-row items-center gap-3 border-b pb-3">
						<div className="rounded-full bg-primary/10 p-2 text-primary">
							<SettingsIcon className="size-5" />
						</div>
						<div>
							<CardTitle className="text-sm font-semibold">
								RevOps Rule Settings
							</CardTitle>
							<CardDescription className="text-xs">
								Global thresholds applied to scope creep audits.
							</CardDescription>
						</div>
					</CardHeader>
					<CardContent className="p-5 flex flex-col gap-4 text-xs">
						{/* Monthly Client Spend Limit */}
						<div className="flex flex-col gap-1 border-b pb-3">
							<span className="font-semibold text-muted-foreground uppercase text-[10px] tracking-wider">
								Standard Client Spend Limit
							</span>
							<span className="font-mono text-base font-bold text-foreground mt-0.5">
								$15,000 / mo
							</span>
							<span className="text-[10px] text-muted-foreground font-light">
								Max standard un-invoiced credit cap before billing blocks are triggered. (Read-only)
							</span>
						</div>

						{/* Multiplier of Gross Target */}
						<div className="flex flex-col gap-1">
							<span className="font-semibold text-muted-foreground uppercase text-[10px] tracking-wider">
								Target Gross Margin Multiplier
							</span>
							<span className="font-mono text-base font-bold text-foreground mt-0.5">
								2.5x
							</span>
							<span className="text-[10px] text-muted-foreground font-light">
								Target billing rate multiplier computed over resource delivery costs. (Read-only)
							</span>
						</div>
					</CardContent>
				</Card>

				{/* Integration Connector Status (Right column) */}
				<Card className="dark:bg-transparent flex flex-col justify-between overflow-hidden">
					<CardHeader className="flex flex-row items-center gap-3 border-b pb-3">
						<div className="rounded-full bg-violet-500/10 p-2 text-violet-500">
							<PlugIcon className="size-5" />
						</div>
						<div>
							<CardTitle className="text-sm font-semibold">
								Database Integration Connectors
							</CardTitle>
							<CardDescription className="text-xs">
								Active sync connections with Stripe, Toggl, and marketing endpoints.
							</CardDescription>
						</div>
					</CardHeader>
					<CardContent className="p-0">
						<div className="divide-y text-xs">
							{connectors.map((c) => {
								const isStripeFail = c.name === "Stripe" && systemStatus === "api-failure";

								return (
									<div
										key={c.name}
										className="flex items-center justify-between px-5 py-4 hover:bg-muted/10 transition-all"
									>
										<div className="flex items-start gap-3 min-w-0">
											<div className="rounded-md bg-muted p-1.5 text-muted-foreground mt-0.5">
												<DatabaseIcon className="size-4" />
											</div>
											<div className="min-w-0">
												<span className="font-semibold text-foreground truncate block">
													{c.name}
												</span>
												<span className="text-[10px] text-muted-foreground font-light block mt-0.5">
													{c.type} • {c.syncFrequency}
												</span>
											</div>
										</div>

										<div className="text-end">
											<span
												className={cn(
													"inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold capitalize",
													isStripeFail
														? "bg-rose-500/10 text-rose-600 dark:text-rose-400"
														: systemStatus === "auditing"
														? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
														: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
												)}
											>
												<span
													className={cn(
														"size-1.5 rounded-full",
														isStripeFail
															? "bg-rose-500 animate-pulse"
															: systemStatus === "auditing"
															? "bg-amber-500 animate-spin border border-t-transparent"
															: "bg-emerald-500"
													)}
												/>
												{isStripeFail
													? "API Failed"
													: systemStatus === "auditing"
													? "Auditing..."
													: "Active"}
											</span>
											<span className="font-mono text-[10px] text-muted-foreground block mt-1">
												Lat: {isStripeFail ? "—" : c.latency}
											</span>
										</div>
									</div>
								);
							})}
						</div>
					</CardContent>

					{/* System Audit Action Bar at bottom of card */}
					<div className="border-t p-4 bg-muted/15 flex items-center justify-between gap-4">
						<div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
							<ShieldCheckIcon className="size-4 text-emerald-500" />
							<span>System integrity state nominal.</span>
						</div>
						<Button
							size="sm"
							variant="outline"
							disabled={systemStatus === "auditing"}
							onClick={runIntegrityAudit}
							className="text-xs gap-1.5"
						>
							<RefreshCwIcon className={cn("size-3.5", systemStatus === "auditing" && "animate-spin")} />
							Run Integrity Audit
						</Button>
					</div>
				</Card>
			</div>
		</div>
	);
}
