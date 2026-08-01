"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAppContext } from "@/components/app-context";
import {
	XIcon,
	AlertTriangleIcon,
	ShieldAlertIcon,
	FileWarningIcon,
	DatabaseIcon,
	SlidersIcon,
} from "lucide-react";
import React from "react";

export function GodModePanel() {
	const {
		godModeOpen,
		setGodModeOpen,
		systemStatus,
		setSystemStatus,
		setIllusionOfMargin,
		setLeaks,
		setChurnAlerts,
		setSimulatorOpen,
		addLog,
		niche,
	} = useAppContext();

	if (!godModeOpen) return null;

	const handleScenario1 = () => {
		// Massive Scope Creep (Default Scenario)
		setSystemStatus("connected");
		setIllusionOfMargin(false);
		
		const l1Type = niche === "dev"
			? "Unbilled SSO & API Addons"
			: niche === "design"
			? "Unbilled Figma Revisions"
			: "Creative Scope Creep";
		const l2Type = niche === "dev"
			? "Custom Webhook Integrations"
			: niche === "design"
			? "Extra Asset Formatting"
			: "Overdesign Deviation";

		setLeaks([
			{ id: "L1", client: "Apex Digital", code: "SRV-CREEP-01", type: l1Type, amount: 14200, status: "Leak", hourlyRate: 100, hoursLogged: 142 },
			{ id: "L2", client: "Helix Corp", code: "SRV-DSGN-04", type: l2Type, amount: 8500, status: "Leak", hourlyRate: 100, hoursLogged: 85 },
			{ id: "L3", client: "Nova Soft", code: "SRV-API-09", type: "Unbilled Integration Addon", amount: 5800, status: "Leak", hourlyRate: 100, hoursLogged: 58 },
		]);

		setChurnAlerts([
			{ id: "C1", client: "Orion Labs", probability: 45, tags: ["Low platform activity", "Support ticket delay"], severity: "warning", status: "active" },
			{ id: "C2", client: "Vortex Tech", probability: 78, tags: ["Multiple support claims", "Late payment"], severity: "critical", status: "active" },
			{ id: "C3", client: "Starlight Co", probability: 60, tags: ["Retainer payment delay"], severity: "warning", status: "active" },
		]);

		addLog("SCENARIO ACTIVATED: Massive Scope Creep. 3 unbilled retainer leaks injected (Total: $28,500).", "warning");
	};

	const handleScenario2 = () => {
		// Silent Churn Threat
		setSystemStatus("connected");
		setIllusionOfMargin(false);
		
		// Secure/Release all leaks
		setLeaks((prev) => prev.map((l) => ({ ...l, status: "Secured" as const })));

		// Inject Nexus Tech critical churn alert
		setChurnAlerts([
			{
				id: "C4",
				client: "Nexus Tech",
				probability: 88,
				tags: ["Slack Sentiment Crash (-40%)", "Executive sponsor departure"],
				severity: "critical",
				status: "active"
			},
			{ id: "C1", client: "Orion Labs", probability: 45, tags: ["Low platform activity", "Support ticket delay"], severity: "warning", status: "active" },
			{ id: "C2", client: "Vortex Tech", probability: 78, tags: ["Multiple support claims", "Late payment"], severity: "critical", status: "active" },
			{ id: "C3", client: "Starlight Co", probability: 60, tags: ["Retainer payment delay"], severity: "warning", status: "active" },
		]);

		addLog("SCENARIO ACTIVATED: Silent Churn Threat. Revenue leaks reconciled to 0%. Critical Nexus Tech warning active.", "error");
	};

	const handleScenario3 = () => {
		// API Pipeline Failure
		setSystemStatus("api-failure");
		setIllusionOfMargin(false);
	};

	return (
		<div className="fixed bottom-6 left-6 z-50 w-96 bg-popover border rounded-xl shadow-2xl overflow-hidden font-sans text-xs animate-in slide-in-from-bottom-5 duration-200">
			{/* Header */}
			<div className="bg-muted/30 border-b p-4 flex items-center justify-between">
				<div className="flex flex-col">
					<span className="font-bold text-foreground text-sm uppercase tracking-wider">
						Demo Override Controller
					</span>
					<span className="text-[10px] text-muted-foreground uppercase font-semibold mt-0.5">
						Simulator Sandbox Panel
					</span>
				</div>
				<button
					onClick={() => setSystemStatus("connected")}
					className="hidden" // empty spacer to align
				/>
				<button
					onClick={() => setGodModeOpen(false)}
					className="rounded-md p-1 hover:bg-muted text-muted-foreground hover:text-foreground transition-all"
				>
					<XIcon className="size-4" />
				</button>
			</div>

			{/* Scenario Selectors List */}
			<div className="p-5 flex flex-col gap-4 overflow-y-auto max-h-[70vh]">
				{/* Scenario 1 */}
				<div className="flex flex-col gap-2 p-3.5 bg-muted/30 border rounded-lg hover:border-primary/20 transition-all">
					<div className="flex items-center justify-between">
						<span className="font-bold text-sm text-foreground flex items-center gap-1.5">
							<FileWarningIcon className="size-4 text-rose-500" />
							Massive Scope Creep
						</span>
						<span className="text-[9px] font-semibold text-muted-foreground uppercase bg-secondary px-1.5 py-0.5 rounded">
							Scenario 1
						</span>
					</div>
					<p className="text-xs text-muted-foreground leading-relaxed mt-0.5">
						Resets dashboard and injects 3 scope creep invoice leaks totaling <strong>$28,500</strong> with a 2.5% unbilled rate.
					</p>
					<Button
						size="sm"
						variant="outline"
						onClick={handleScenario1}
						className="mt-2 text-xs font-semibold w-full hover:bg-muted/40"
					>
						Inject Scope Creep Scenario
					</Button>
				</div>

				{/* Scenario 2 */}
				<div className="flex flex-col gap-2 p-3.5 bg-muted/30 border rounded-lg hover:border-primary/20 transition-all">
					<div className="flex items-center justify-between">
						<span className="font-bold text-sm text-foreground flex items-center gap-1.5">
							<ShieldAlertIcon className="size-4 text-amber-500" />
							Silent Churn Threat
						</span>
						<span className="text-[9px] font-semibold text-muted-foreground uppercase bg-secondary px-1.5 py-0.5 rounded">
							Scenario 2
						</span>
					</div>
					<p className="text-xs text-muted-foreground leading-relaxed mt-0.5">
						Reconciles all revenue leaks and introduces a critical sentiment drop alert for <strong>Nexus Tech</strong>.
					</p>
					<Button
						size="sm"
						variant="outline"
						onClick={handleScenario2}
						className="mt-2 text-xs font-semibold w-full hover:bg-muted/40"
					>
						Inject Churn Risk Scenario
					</Button>
				</div>

				{/* Scenario 3 */}
				<div className="flex flex-col gap-2 p-3.5 bg-muted/30 border rounded-lg hover:border-primary/20 transition-all">
					<div className="flex items-center justify-between">
						<span className="font-bold text-sm text-foreground flex items-center gap-1.5">
							<DatabaseIcon className="size-4 text-rose-500 animate-pulse" />
							API Pipeline Failure
						</span>
						<span className="text-[9px] font-semibold text-muted-foreground uppercase bg-secondary px-1.5 py-0.5 rounded">
							Scenario 3
						</span>
					</div>
					<p className="text-xs text-muted-foreground leading-relaxed mt-0.5">
						Simulates API stream disruption, triggers a global fallback alert banner, and locks the main finance chart.
					</p>
					<Button
						size="sm"
						variant="outline"
						onClick={handleScenario3}
						className={cn(
							"mt-2 text-xs font-semibold w-full",
							systemStatus === "api-failure"
								? "bg-rose-600 hover:bg-rose-700 text-white border-transparent"
								: "hover:bg-muted/40"
						)}
					>
						{systemStatus === "api-failure" ? "Pipeline Offline Active" : "Inject Webhook Pipeline Outage"}
					</Button>
				</div>
			</div>
			
			<div className="bg-muted/15 p-3.5 border-t flex flex-col gap-2">
				<Button
					onClick={() => {
						setSimulatorOpen(true);
						setGodModeOpen(false);
					}}
					className="w-full bg-primary hover:bg-primary/90 text-white font-bold text-xs gap-1.5 py-1.5"
				>
					<SlidersIcon className="size-3.5" />
					Open Client Portfolio Simulator
				</Button>
				<div className="text-[10px] text-muted-foreground text-center">
					Toggle scenarios or open custom simulator console to test client reactiveness.
				</div>
			</div>
		</div>
	);
}
