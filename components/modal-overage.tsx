"use client";

import { Button } from "@/components/ui/button";
import { useAppContext } from "@/components/app-context";
import { XIcon, ClockIcon, AlertTriangleIcon } from "lucide-react";
import React from "react";

const overageLogs = [
	{ id: "O1", member: "Alvaro Designer", project: "Apex Portal", hours: 12, cost: 1200, reason: "Excessive revision rounds on branding styles" },
	{ id: "O2", member: "Shaban Haider", project: "Nova API Integration", hours: 8, cost: 800, reason: "Custom webhook config request outside SLA" },
	{ id: "O3", member: "Alvaro Designer", project: "Vortex Branding", hours: 6, cost: 600, reason: "Extra landing page variants mockups" },
	{ id: "O4", member: "Lucía García", project: "Google Ads campaign", hours: 4, cost: 400, reason: "Ad copy translations requested last-minute" },
];

export function ModalOverage() {
	const { overageLogOpen, setOverageLogOpen } = useAppContext();

	if (!overageLogOpen) return null;

	return (
		<div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-xs flex items-center justify-center p-4">
			<div className="bg-popover border rounded-xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col justify-between animate-in zoom-in-95 duration-200">
				{/* Header */}
				<div className="flex items-center justify-between border-b p-4 bg-muted/20">
					<span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
						<ClockIcon className="size-4 text-violet-500" />
						Timesheet Overage Logs
					</span>
					<button
						onClick={() => setOverageLogOpen(false)}
						className="rounded-md p-1 hover:bg-muted text-muted-foreground hover:text-foreground transition-all"
					>
						<XIcon className="size-4" />
					</button>
				</div>

				{/* Body Content */}
				<div className="p-6 bg-background flex flex-col gap-4 text-xs">
					<div className="flex items-start gap-2.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 p-3 rounded-lg border border-amber-500/20 leading-relaxed">
						<AlertTriangleIcon className="size-5 shrink-0 mt-0.5" />
						<p>
							These records show billable hours registered by resources that exceed monthly client retainer agreements.
							They serve as backing evidence for AI-drafted recovery invoice submissions.
						</p>
					</div>

					<div className="border rounded-lg overflow-hidden">
						<table className="w-full text-left border-collapse text-[11px]">
							<thead>
								<tr className="border-b bg-muted/30 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">
									<th className="px-4 py-2.5">Member</th>
									<th className="px-4 py-2.5">Project</th>
									<th className="px-4 py-2.5 text-center">Hours</th>
									<th className="px-4 py-2.5 text-end">Est. Cost</th>
									<th className="px-4 py-2.5">Reason / Trigger</th>
								</tr>
							</thead>
							<tbody className="divide-y">
								{overageLogs.map((log) => (
									<tr key={log.id} className="hover:bg-muted/10 transition-all">
										<td className="px-4 py-3 font-semibold text-foreground">
											{log.member}
										</td>
										<td className="px-4 py-3 text-muted-foreground font-medium">
											{log.project}
										</td>
										<td className="px-4 py-3 text-center font-mono font-bold">
											{log.hours}h
										</td>
										<td className="px-4 py-3 text-end font-mono text-rose-500 font-bold">
											${log.cost.toLocaleString()}
										</td>
										<td className="px-4 py-3 text-muted-foreground italic">
											{log.reason}
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</div>

				{/* Footer Actions */}
				<div className="border-t p-4 bg-muted/20 flex items-center justify-end">
					<Button
						variant="outline"
						size="sm"
						onClick={() => setOverageLogOpen(false)}
						className="h-9"
					>
						Close Log
					</Button>
				</div>
			</div>
		</div>
	);
}
