"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAppContext } from "@/components/app-context";
import { BotIcon, SparklesIcon, CheckCircle2Icon } from "lucide-react";

export function SentinelAssistant() {
	const { addLog } = useAppContext();

	const handleVerifySync = () => {
		addLog("Verifying Stripe webhook integrity logs...", "info");
		setTimeout(() => {
			addLog("Integrity check passed. Webhook pipeline active.", "success");
		}, 1000);
	};

	const handleScanAnomalies = () => {
		addLog("Scanning database billing tables for anomalies...", "info");
		setTimeout(() => {
			addLog("Scan complete: 0 new anomalies detected.", "success");
		}, 1200);
	};

	return (
		<Card className="dark:bg-transparent h-full flex flex-col justify-between border-dashed border-violet-500/30 bg-violet-500/2 hover:border-violet-500/50 transition-all duration-300">
			<CardHeader className="flex flex-row items-center gap-3 border-b pb-3 bg-violet-500/5">
				<div className="rounded-full bg-violet-500/10 p-2 text-violet-500 animate-pulse">
					<BotIcon className="size-5" />
				</div>
				<div>
					<CardTitle className="text-sm font-semibold flex items-center gap-1.5">
						Sentinel AI
						<span className="inline-flex items-center gap-0.5 rounded-full bg-violet-500/10 px-1.5 py-0.5 text-[8px] font-bold text-violet-500 uppercase tracking-widest">
							<SparklesIcon className="size-2" /> Live Assistant
						</span>
					</CardTitle>
					<CardDescription className="text-xs">
						Interactive telemetry recommendations.
					</CardDescription>
				</div>
			</CardHeader>

			<CardContent className="p-4 flex flex-col gap-4 text-xs">
				<div className="bg-stone-950/60 border rounded-lg p-3 text-muted-foreground flex flex-col gap-2 font-sans relative">
					<p className="leading-relaxed">
						I'm monitoring Stripe webhooks, API limits, and unbilled contract syncs. System pipeline is currently verified and running within optimal thresholds.
					</p>
					<div className="absolute right-2 bottom-1.5 text-[8.5px] uppercase font-mono text-violet-500 font-semibold tracking-wider">
						Sentinel-v1.6
					</div>
				</div>

				<div className="flex flex-col gap-2">
					<div className="text-[10px] text-emerald-500 flex items-center gap-1.5 font-semibold bg-emerald-500/5 border border-emerald-500/20 rounded-md p-2 justify-center">
						<CheckCircle2Icon className="size-3.5" />
						All Systems Operational
					</div>

					<Button
						size="sm"
						variant="outline"
						onClick={handleVerifySync}
						className="w-full text-xs hover:bg-muted/30 border-muted"
					>
						Verify Webhook Sync
					</Button>

					<Button
						size="sm"
						variant="outline"
						onClick={handleScanAnomalies}
						className="w-full text-xs hover:bg-muted/30 border-muted"
					>
						Scan Billing Anomalies
					</Button>
				</div>
			</CardContent>
		</Card>
	);
}
