"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAppContext, ClientNameType } from "@/components/app-context";
import { XIcon, PlayIcon, RefreshCwIcon, SlidersIcon, PlusIcon } from "lucide-react";
import React, { useState } from "react";

const clientList: ClientNameType[] = [
	"Apex Digital",
	"Helix Corp",
	"Nova Soft",
	"Nexus Tech",
	"Orion Labs",
	"Vortex Tech",
	"Starlight Co",
];

const mockLeakNames = [
	"Creative Scope Creep",
	"Unbilled Integration Addon",
	"Overhours Development",
	"Extra Marketing Campaign",
	"Out-of-scope Slack Support",
	"Graphic Revision Overrun",
];

const mockChurnTags = [
	"Slack Sentiment Crash",
	"Low Platform Activity",
	"Late Invoice Payment",
	"Support Ticket Delay",
	"Executive Sponsor Departure",
	"Missed Weekly Sync",
];

export function PanelSimulator() {
	const {
		simulatorOpen,
		setSimulatorOpen,
		clientProfiles,
		setClientProfiles,
		leaks,
		setLeaks,
		churnAlerts,
		setChurnAlerts,
		addLog,
	} = useAppContext();

	const [targetClient, setTargetClient] = useState<ClientNameType>("Apex Digital");
	const [leakInput, setLeakInput] = useState<string>("");
	const [leakNameInput, setLeakNameInput] = useState<string>("");
	const [churnInput, setChurnInput] = useState<string>("");
	const [churnTagInput, setChurnTagInput] = useState<string>("");
	const [retainerInput, setRetainerInput] = useState<string>("");

	// Stats counts of active simulations
	const clientLeaksCount = leaks.filter(l => l.client === targetClient && l.id.startsWith("L_SIM_")).length;
	const clientChurnCount = churnAlerts.filter(c => c.client === targetClient && c.id.startsWith("C_SIM_")).length;

	if (!simulatorOpen) return null;

	// 1. Update Retainer budget
	const handleUpdateRetainer = () => {
		if (retainerInput.trim() !== "") {
			const value = parseFloat(retainerInput);
			if (!isNaN(value)) {
				setClientProfiles((prev) => {
					const current = prev[targetClient];
					if (!current) return prev;
					return {
						...prev,
						[targetClient]: {
							...current,
							income: value,
						},
					};
				});
				addLog(`Simulator: Retainer for ${targetClient} updated to $${value.toLocaleString()}`, "info");
				setRetainerInput("");
			}
		}
	};

	// 2. Inject Revenue Leak (Appends to list, keeps modal open)
	const handleInjectLeak = () => {
		let leakAmt = parseFloat(leakInput);
		if (leakInput.trim() === "") {
			// Auto-generate random leak amount between $1,000 and $4,500
			leakAmt = Math.floor(Math.random() * 3500) + 1000;
		}

		if (!isNaN(leakAmt)) {
			let typeLabel = leakNameInput.trim();
			if (typeLabel === "") {
				// Pick a random mock leak name
				typeLabel = mockLeakNames[Math.floor(Math.random() * mockLeakNames.length)];
			}

			const randCode = `SRV-SIM-${Math.floor(Math.random() * 900) + 100}`;
			const uniqueId = `L_SIM_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

			setLeaks((prev) => [
				...prev,
				{
					id: uniqueId,
					client: targetClient,
					code: randCode,
					type: typeLabel,
					amount: leakAmt,
					status: "Leak" as const,
				},
			]);

			addLog(`Simulator: Injected new leak $${leakAmt} ("${typeLabel}") for ${targetClient}`, "warning");
			
			// Clear only leak inputs
			setLeakInput("");
			setLeakNameInput("");
		}
	};

	// 3. Inject Churn Alert (Appends to list, keeps modal open)
	const handleInjectChurn = () => {
		let churnProb = parseFloat(churnInput);
		if (churnInput.trim() === "") {
			// Auto-generate random probability between 30% and 98%
			churnProb = Math.floor(Math.random() * 68) + 30;
		}

		if (!isNaN(churnProb)) {
			let tagLabel = churnTagInput.trim();
			if (tagLabel === "") {
				// Pick a random mock churn tag
				tagLabel = mockChurnTags[Math.floor(Math.random() * mockChurnTags.length)];
			}

			const uniqueId = `C_SIM_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

			setChurnAlerts((prev) => [
				...prev,
				{
					id: uniqueId,
					client: targetClient,
					probability: churnProb,
					tags: [tagLabel, "Injected via Simulator"],
					severity: churnProb > 70 ? ("critical" as const) : ("warning" as const),
					status: "active" as const,
				},
			]);

			addLog(`Simulator: Injected Churn alert ${churnProb}% ("${tagLabel}") for ${targetClient}`, "error");

			// Clear only churn inputs
			setChurnInput("");
			setChurnTagInput("");
		}
	};

	const handleClearClient = () => {
		// Clear simulator items for target client
		setLeaks((prev) => prev.filter((l) => !(l.client === targetClient && l.id.startsWith("L_SIM_"))));
		setChurnAlerts((prev) => prev.filter((c) => !(c.client === targetClient && c.id.startsWith("C_SIM_"))));
		
		// Restore default retainer budget
		const defaults = {
			"Apex Digital": 5000,
			"Helix Corp": 12000,
			"Nova Soft": 15000,
			"Nexus Tech": 8000,
			"Orion Labs": 6000,
			"Vortex Tech": 7000,
			"Starlight Co": 5000,
		};
		const defaultIncome = defaults[targetClient as keyof typeof defaults] || 5000;

		setClientProfiles((prev) => {
			const current = prev[targetClient];
			if (!current) return prev;
			return {
				...prev,
				[targetClient]: {
					...current,
					income: defaultIncome,
				},
			};
		});

		addLog(`Simulator: Restored default base telemetry for ${targetClient}`, "success");
	};

	return (
		<div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
			<div className="bg-popover border border-border rounded-xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col justify-between animate-in zoom-in-95 duration-200">
				{/* Header */}
				<div className="flex items-center justify-between border-b p-4 bg-muted/20">
					<div className="flex items-center gap-2">
						<SlidersIcon className="size-4.5 text-primary animate-pulse" />
						<div className="flex flex-col">
							<span className="font-bold text-sm text-foreground">
								Portfolio Simulator Console
							</span>
							<span className="text-[9px] text-muted-foreground uppercase font-semibold mt-0.5">
								Stack multiple events consecutively
							</span>
						</div>
					</div>
					<button
						onClick={() => setSimulatorOpen(false)}
						className="rounded-md p-1 hover:bg-muted text-muted-foreground hover:text-foreground transition-all"
					>
						<XIcon className="size-4" />
					</button>
				</div>

				{/* Body */}
				<div className="p-5 flex flex-col gap-4 text-xs overflow-y-auto max-h-[75vh]">
					{/* Target Client Dropdown */}
					<div className="flex flex-col gap-1.5 border-b pb-3">
						<div className="flex items-center justify-between">
							<label className="font-bold text-foreground uppercase text-[10px] tracking-wider">
								Active Target Client
							</label>
							<span className="text-[10px] text-muted-foreground font-semibold">
								Simulated: {clientLeaksCount} Leaks | {clientChurnCount} Churns
							</span>
						</div>
						<select
							value={targetClient}
							onChange={(e) => setTargetClient(e.target.value as ClientNameType)}
							className="w-full bg-background border rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
						>
							{clientList.map((client) => (
								<option key={client} value={client}>
									{client}
								</option>
							))}
						</select>
					</div>

					{/* Custom Retainer Input */}
					<div className="flex flex-col gap-1.5 border-b pb-3">
						<label className="font-bold text-foreground uppercase text-[10px] tracking-wider">
							Override Monthly Retainer Budget ($)
						</label>
						<div className="flex gap-2">
							<input
								type="number"
								value={retainerInput}
								onChange={(e) => setRetainerInput(e.target.value)}
								placeholder={`Current Retainer: $${(clientProfiles[targetClient]?.income || 0).toLocaleString()} / mo`}
								className="flex-1 bg-background border rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary text-foreground placeholder:text-muted-foreground/45"
							/>
							<Button
								type="button"
								onClick={handleUpdateRetainer}
								className="h-8 text-xs font-semibold px-3"
							>
								Update
							</Button>
						</div>
					</div>

					{/* Revenue Leak Input Group */}
					<div className="border p-3 rounded-lg flex flex-col gap-2 bg-muted/10">
						<span className="font-bold text-[10px] uppercase text-amber-500 tracking-wider">
							+ Stack New Revenue Leak
						</span>
						<div className="flex gap-2 items-center">
							<input
								type="text"
								value={leakNameInput}
								onChange={(e) => setLeakNameInput(e.target.value)}
								placeholder="Leak Label (Leave blank for random)"
								className="flex-1 bg-background border rounded-lg px-2.5 py-1.5 text-[11px] focus:outline-none focus:ring-1 focus:ring-primary text-foreground placeholder:text-muted-foreground/45"
							/>
							<input
								type="number"
								value={leakInput}
								onChange={(e) => setLeakInput(e.target.value)}
								placeholder="Amount (Random)"
								className="w-28 bg-background border rounded-lg px-2.5 py-1.5 text-[11px] focus:outline-none focus:ring-1 focus:ring-primary text-foreground placeholder:text-muted-foreground/45"
							/>
						</div>
						<Button
							type="button"
							variant="outline"
							onClick={handleInjectLeak}
							className="mt-1 border-amber-500/20 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10 text-xs font-semibold flex items-center gap-1 w-full"
						>
							<PlusIcon className="size-3.5" />
							Inject Leak Node
						</Button>
					</div>

					{/* Churn Alert Input Group */}
					<div className="border p-3 rounded-lg flex flex-col gap-2 bg-muted/10">
						<span className="font-bold text-[10px] uppercase text-rose-500 tracking-wider">
							+ Stack New Churn Alert
						</span>
						<div className="flex gap-2 items-center">
							<input
								type="text"
								value={churnTagInput}
								onChange={(e) => setChurnTagInput(e.target.value)}
								placeholder="Alert Tag (Leave blank for random)"
								className="flex-1 bg-background border rounded-lg px-2.5 py-1.5 text-[11px] focus:outline-none focus:ring-1 focus:ring-primary text-foreground placeholder:text-muted-foreground/45"
							/>
							<input
								type="number"
								value={churnInput}
								onChange={(e) => setChurnInput(e.target.value)}
								min="0"
								max="100"
								placeholder="Risk % (Random)"
								className="w-28 bg-background border rounded-lg px-2.5 py-1.5 text-[11px] focus:outline-none focus:ring-1 focus:ring-primary text-foreground placeholder:text-muted-foreground/45"
							/>
						</div>
						<Button
							type="button"
							variant="outline"
							onClick={handleInjectChurn}
							className="mt-1 border-rose-500/20 text-rose-600 dark:text-rose-450 hover:bg-rose-500/10 text-xs font-semibold flex items-center gap-1 w-full"
						>
							<PlusIcon className="size-3.5" />
							Inject Churn Risk
						</Button>
					</div>

					{/* Bottom Actions */}
					<div className="flex gap-2.5 mt-3 border-t pt-4">
						<Button
							type="button"
							variant="outline"
							onClick={handleClearClient}
							className="flex-1 gap-1 text-xs text-muted-foreground hover:text-foreground"
						>
							<RefreshCwIcon className="size-3.5" />
							Reset Client Baseline
						</Button>
						<Button
							type="button"
							onClick={() => setSimulatorOpen(false)}
							className="flex-1 gap-1 text-xs bg-primary hover:bg-primary/95 text-white"
						>
							Done / Close
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
}
