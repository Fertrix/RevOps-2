"use client";

import React, { useState, useEffect } from "react";
import { useAppContext } from "@/components/app-context";
import { Button } from "@/components/ui/button";
import {
	XIcon,
	LinkIcon,
	CopyIcon,
	CheckIcon,
	ExternalLinkIcon,
	GlobeIcon,
	Building2Icon,
	UsersIcon,
	BriefcaseIcon,
	SparklesIcon,
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function ModalDemoLink() {
	const {
		demoLinkModalOpen,
		setDemoLinkModalOpen,
		agencyName,
		agencyDomain,
		employeesCount,
		niche,
		addLog,
	} = useAppContext();

	const [inputAgency, setInputAgency] = useState("");
	const [inputDomain, setInputDomain] = useState("");
	const [inputEmployees, setInputEmployees] = useState(25);
	const [inputNiche, setInputNiche] = useState<"dev" | "design" | "marketing">("marketing");
	const [useObfuscatedToken, setUseObfuscatedToken] = useState(true);
	const [copied, setCopied] = useState(false);

	// Sync local form state when modal opens
	useEffect(() => {
		if (demoLinkModalOpen) {
			setInputAgency(agencyName !== "Your Agency" ? agencyName : "Apex Marketing");
			setInputDomain(agencyDomain || "apexmarketing.com");
			setInputEmployees(employeesCount || 25);
			setInputNiche(niche || "marketing");
			setCopied(false);
		}
	}, [demoLinkModalOpen, agencyName, agencyDomain, employeesCount, niche]);

	if (!demoLinkModalOpen) return null;

	const cleanDom = inputDomain.trim().replace(/^https?:\/\//, "").replace(/\/.*$/, "");
	const origin = typeof window !== "undefined" ? window.location.origin : "https://sentinel-revops.vercel.app";
	const pathname = typeof window !== "undefined" ? window.location.pathname : "/";

	let fullDemoUrl = "";
	if (useObfuscatedToken) {
		const rawToken = `${inputAgency.trim()}|${cleanDom}|${inputEmployees}|${inputNiche}`;
		const token = btoa(encodeURIComponent(rawToken)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
		fullDemoUrl = `${origin}${pathname}?demo=${token}`;
	} else {
		const params = new URLSearchParams();
		if (inputAgency.trim()) params.set("agency", inputAgency.trim());
		if (cleanDom) params.set("domain", cleanDom);
		if (inputEmployees && inputEmployees !== 25) params.set("employees", inputEmployees.toString());
		if (inputNiche && inputNiche !== "marketing") params.set("niche", inputNiche);
		const queryString = params.toString();
		fullDemoUrl = `${origin}${pathname}${queryString ? `?${queryString}` : ""}`;
	}

	const handleCopy = () => {
		navigator.clipboard.writeText(fullDemoUrl);
		setCopied(true);
		addLog("Copied customized demo URL to clipboard!", "success");
		setTimeout(() => setCopied(false), 2500);
	};

	const handleLaunch = () => {
		addLog(`Launching customized demo environment for "${inputAgency || "Demo Agency"}"...`, "info");
		setDemoLinkModalOpen(false);
		window.location.href = fullDemoUrl;
	};

	// Recalculate preview leakage projections
	const previewLeakage = (inputEmployees * 950).toLocaleString();
	const previewHours = (inputEmployees * 3.8).toFixed(1);

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
			<motion.div
				initial={{ scale: 0.95, opacity: 0 }}
				animate={{ scale: 1, opacity: 1 }}
				exit={{ scale: 0.95, opacity: 0 }}
				className="w-full max-w-lg bg-popover border rounded-xl shadow-2xl overflow-hidden font-sans text-xs flex flex-col"
			>
				{/* Modal Header */}
				<div className="bg-muted/30 border-b p-4 flex items-center justify-between">
					<div className="flex items-center gap-2.5">
						<div className="p-2 rounded-lg bg-primary/10 text-primary">
							<LinkIcon className="size-4" />
						</div>
						<div className="flex flex-col">
							<span className="font-bold text-foreground text-sm uppercase tracking-wider flex items-center gap-1.5">
								Demo URL Link Generator
								<span className="text-[9px] font-semibold text-primary bg-primary/10 px-1.5 py-0.5 rounded border border-primary/20">
									God Mode Tool
								</span>
							</span>
							<span className="text-[10px] text-muted-foreground mt-0.5">
								Personalize real-time agency parameters via URL query parameters
							</span>
						</div>
					</div>
					<button
						onClick={() => setDemoLinkModalOpen(false)}
						className="rounded-md p-1 hover:bg-muted text-muted-foreground hover:text-foreground transition-all"
					>
						<XIcon className="size-4" />
					</button>
				</div>

				{/* Form Body */}
				<div className="p-5 flex flex-col gap-4 overflow-y-auto max-h-[75vh]">
					{/* Input 1: Agency Name */}
					<div className="flex flex-col gap-1.5">
						<label className="text-[11px] font-semibold text-foreground flex items-center gap-1.5">
							<Building2Icon className="size-3.5 text-primary" />
							Agency / Company Name (`agency`)
						</label>
						<input
							type="text"
							value={inputAgency}
							onChange={(e) => setInputAgency(e.target.value)}
							placeholder="e.g. Apex Marketing, DevLabs"
							className="w-full px-3 py-2 bg-muted/30 border rounded-md text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
						/>
						<span className="text-[10px] text-muted-foreground">
							Replaces company names in header breadcrumb, sidebar, and summary cards.
						</span>
					</div>

					{/* Input 2: Domain Logo */}
					<div className="flex flex-col gap-1.5">
						<label className="text-[11px] font-semibold text-foreground flex items-center gap-1.5">
							<GlobeIcon className="size-3.5 text-indigo-500" />
							Corporate Domain for Logo (`domain`)
						</label>
						<input
							type="text"
							value={inputDomain}
							onChange={(e) => setInputDomain(e.target.value)}
							placeholder="e.g. apexmarketing.com, esmtheagency.com"
							className="w-full px-3 py-2 bg-muted/30 border rounded-md text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
						/>
						<span className="text-[10px] text-muted-foreground">
							Extracts favicon/logo dynamically with automatic fallback to dashboard mark.
						</span>
					</div>

					{/* Input 3: Employee Scale */}
					<div className="flex flex-col gap-1.5">
						<div className="flex items-center justify-between">
							<label className="text-[11px] font-semibold text-foreground flex items-center gap-1.5">
								<UsersIcon className="size-3.5 text-amber-500" />
								Employee Scale (`employees`)
							</label>
							<span className="font-mono text-xs font-bold text-amber-500">
								{inputEmployees} employees
							</span>
						</div>
						<input
							type="range"
							min="5"
							max="150"
							step="5"
							value={inputEmployees}
							onChange={(e) => setInputEmployees(parseInt(e.target.value))}
							className="w-full accent-primary cursor-pointer"
						/>
						<div className="flex items-center justify-between text-[10px] text-muted-foreground bg-muted/20 px-2.5 py-1.5 rounded border">
							<span>Est. Leakage: <strong className="text-foreground">${previewLeakage}</strong>/yr</span>
							<span>Est. Unbilled: <strong className="text-foreground">{previewHours} hrs</strong>/wk</span>
						</div>
					</div>

					{/* Input 4: Niche / Sector */}
					<div className="flex flex-col gap-1.5">
						<label className="text-[11px] font-semibold text-foreground flex items-center gap-1.5">
							<BriefcaseIcon className="size-3.5 text-emerald-500" />
							Industry Sector / Niche (`niche`)
						</label>
						<div className="grid grid-cols-3 gap-2">
							<button
								type="button"
								onClick={() => setInputNiche("marketing")}
								className={cn(
									"py-2 px-2.5 rounded-md border text-center transition-all flex flex-col items-center justify-center gap-1",
									inputNiche === "marketing"
										? "bg-primary/15 border-primary text-primary font-bold"
										: "bg-muted/30 border-transparent text-muted-foreground hover:bg-muted/50"
								)}
							>
								<SparklesIcon className="size-3.5" />
								<span>Marketing</span>
							</button>

							<button
								type="button"
								onClick={() => setInputNiche("dev")}
								className={cn(
									"py-2 px-2.5 rounded-md border text-center transition-all flex flex-col items-center justify-center gap-1",
									inputNiche === "dev"
										? "bg-primary/15 border-primary text-primary font-bold"
										: "bg-muted/30 border-transparent text-muted-foreground hover:bg-muted/50"
								)}
							>
								<span className="font-mono text-xs font-bold">&lt;/&gt;</span>
								<span>Software Dev</span>
							</button>

							<button
								type="button"
								onClick={() => setInputNiche("design")}
								className={cn(
									"py-2 px-2.5 rounded-md border text-center transition-all flex flex-col items-center justify-center gap-1",
									inputNiche === "design"
										? "bg-primary/15 border-primary text-primary font-bold"
										: "bg-muted/30 border-transparent text-muted-foreground hover:bg-muted/50"
								)}
							>
								<span className="font-serif italic font-bold">🎨</span>
								<span>Creative Design</span>
							</button>
						</div>
					</div>

					{/* URL Mode Toggle: Encrypted Token vs Raw Params */}
					<div className="flex items-center justify-between p-2.5 bg-muted/20 border rounded-lg mt-1">
						<div className="flex flex-col">
							<span className="font-semibold text-foreground text-[11px]">
								{useObfuscatedToken ? "🛡️ Encrypted Demo Token (?demo=...)" : "📄 Raw Parameters (?agency=...)"}
							</span>
							<span className="text-[10px] text-muted-foreground">
								{useObfuscatedToken ? "Obfuscates agency details into a clean token & clears address bar on load." : "Visible readable parameter keys."}
							</span>
						</div>
						<Button
							type="button"
							size="sm"
							variant="outline"
							onClick={() => setUseObfuscatedToken(!useObfuscatedToken)}
							className="h-7 text-[10px] font-semibold px-2.5"
						>
							{useObfuscatedToken ? "Show Raw" : "Encrypt Token"}
						</Button>
					</div>

					{/* Live URL Output Preview Box */}
					<div className="flex flex-col gap-1.5 mt-1">
						<span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
							Generated Demo URL Preview
						</span>
						<div className="p-3 bg-black/40 border border-border/80 rounded-lg flex items-center justify-between gap-2 overflow-hidden font-mono text-[11px] text-emerald-400">
							<span className="truncate select-all">{fullDemoUrl}</span>
							<Button
								size="sm"
								variant="ghost"
								onClick={handleCopy}
								className="shrink-0 h-7 px-2 text-xs hover:bg-white/10 text-emerald-400"
							>
								{copied ? <CheckIcon className="size-3.5 text-emerald-400" /> : <CopyIcon className="size-3.5" />}
							</Button>
						</div>
					</div>
				</div>

				{/* Modal Footer Actions */}
				<div className="bg-muted/20 p-4 border-t flex items-center justify-end gap-2">
					<Button
						variant="outline"
						size="sm"
						onClick={handleCopy}
						className="gap-1.5 text-xs font-semibold"
					>
						{copied ? <CheckIcon className="size-3.5 text-emerald-500" /> : <CopyIcon className="size-3.5" />}
						{copied ? "Copied to Clipboard!" : "Copy Shareable Link"}
					</Button>

					<Button
						size="sm"
						onClick={handleLaunch}
						className="gap-1.5 text-xs font-bold bg-primary hover:bg-primary/90 text-white"
					>
						<ExternalLinkIcon className="size-3.5" />
						Launch & Apply Demo URL
					</Button>
				</div>
			</motion.div>
		</div>
	);
}
