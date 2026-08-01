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
	CheckCircle2Icon,
	AlertCircleIcon,
	ClockIcon,
	CreditCardIcon,
	ChevronRightIcon,
	HistoryIcon,
} from "lucide-react";
import React from "react";

const invoiceLogs = [
	{ id: "INV-1042", client: "Apex Digital", status: "paid", amount: 5000, date: "2026-07-01" },
	{ id: "INV-1041", client: "Helix Corp", status: "paid", amount: 3500, date: "2026-06-28" },
	{ id: "INV-1040", client: "Nova Soft", status: "paid", amount: 4200, date: "2026-06-25" },
	{ id: "INV-1039", client: "Orion Labs", status: "paid", amount: 2800, date: "2026-06-15" },
	{ id: "INV-1038", client: "Starlight Co", status: "pending", amount: 3200, date: "2026-06-10" },
	{ id: "INV-1037", client: "Vortex Tech", status: "failed", amount: 1500, date: "2026-06-05" },
];

export function ViewBilling() {
	const { setActiveView } = useAppContext();

	return (
		<div className="flex flex-col gap-6 w-full max-w-6xl mx-auto">
			{/* Header */}
			<div className="flex flex-col gap-1.5">
				<h2 className="text-xl font-bold tracking-tight text-foreground">
					Billing & Retainers
				</h2>
				<p className="text-xs text-muted-foreground">
					Review Stripe invoicing logs, invoice histories, and audit pending retainer contracts.
				</p>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
				{/* Invoiced Historical Logs (Left 2 columns) */}
				<Card className="md:col-span-2 dark:bg-transparent flex flex-col justify-between">
					<CardHeader className="flex flex-row items-center gap-3 border-b pb-3">
						<div className="rounded-full bg-primary/10 p-2 text-primary">
							<HistoryIcon className="size-5" />
						</div>
						<div>
							<CardTitle className="text-sm font-semibold">
								Invoiced Historical Logs
							</CardTitle>
							<CardDescription className="text-xs">
								Recent Stripe invoice operations and payment status sync logs.
							</CardDescription>
						</div>
					</CardHeader>
					<CardContent className="p-0">
						<div className="overflow-x-auto">
							<table className="w-full text-left border-collapse text-xs">
								<thead>
									<tr className="border-b bg-muted/10 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
										<th className="px-6 py-3">Invoice</th>
										<th className="px-6 py-3">Client</th>
										<th className="px-6 py-3">Date</th>
										<th className="px-6 py-3">Status</th>
										<th className="px-6 py-3 text-end">Amount</th>
									</tr>
								</thead>
								<tbody className="divide-y">
									{invoiceLogs.map((invoice) => (
										<tr
											key={invoice.id}
											className="hover:bg-muted/10 transition-all"
										>
											<td className="px-6 py-4 font-mono font-medium text-foreground">
												{invoice.id}
											</td>
											<td className="px-6 py-4 font-semibold text-foreground">
												{invoice.client}
											</td>
											<td className="px-6 py-4 text-muted-foreground">
												{invoice.date}
											</td>
											<td className="px-6 py-4">
												<span
													className={cn(
														"inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold capitalize",
														invoice.status === "paid" &&
															"bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
														invoice.status === "pending" &&
															"bg-amber-500/10 text-amber-600 dark:text-amber-400",
														invoice.status === "failed" &&
															"bg-rose-500/10 text-rose-600 dark:text-rose-400"
													)}
												>
													{invoice.status === "paid" && (
														<CheckCircle2Icon className="size-3" />
													)}
													{invoice.status === "pending" && (
														<ClockIcon className="size-3" />
													)}
													{invoice.status === "failed" && (
														<AlertCircleIcon className="size-3" />
													)}
													{invoice.status}
												</span>
											</td>
											<td className="px-6 py-4 text-end font-mono font-bold text-foreground">
												${invoice.amount.toLocaleString()}
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					</CardContent>
				</Card>

				{/* Pending Retainer Pipeline (Right 1 column) */}
				<Card className="dark:bg-transparent flex flex-col justify-between h-fit">
					<CardHeader className="flex flex-row items-center gap-3 border-b pb-3">
						<div className="rounded-full bg-amber-500/10 p-2 text-amber-500">
							<CreditCardIcon className="size-5" />
						</div>
						<div>
							<CardTitle className="text-sm font-semibold">
								Retainer Pipeline
							</CardTitle>
							<CardDescription className="text-xs">
								Active contract approvals.
							</CardDescription>
						</div>
					</CardHeader>
					<CardContent className="p-5 flex flex-col gap-4 text-xs">
						<div className="rounded-lg bg-muted/40 p-4 border border-dashed flex flex-col gap-3">
							<h4 className="font-semibold text-foreground">
								How Retainer Auditing works:
							</h4>
							<p className="text-muted-foreground leading-relaxed">
								The Autonomous RevOps system connects to your Toggl timesheet registries
								and matches them with active Stripe subscription tiers.
							</p>
							<p className="text-muted-foreground leading-relaxed">
								If any creative or technical overages are detected (Creative Scope Creep),
								they will be queued as leaks in the Command Center.
							</p>
						</div>

						<Button
							className="w-full flex items-center justify-center gap-1.5 font-medium mt-2"
							onClick={() => setActiveView("command-center")}
						>
							Go to Command Center
							<ChevronRightIcon className="size-4" />
						</Button>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
