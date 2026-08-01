"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type ViewType = "command-center" | "billing" | "settings" | "client-portfolio";
export type SystemStatusType = "connected" | "api-failure" | "auditing";
export type SeverityType = "all" | "critical" | "warning";
export type ClientNameType = "All Accounts" | "Apex Digital" | "Helix Corp" | "Nova Soft" | "Nexus Tech" | "Orion Labs" | "Vortex Tech" | "Starlight Co";

export interface LeakItem {
	id: string;
	client: string;
	code: string;
	type: string;
	amount: number;
	status: "Leak" | "Secured" | "Deleted";
	hourlyRate?: number;
	hoursLogged?: number;
}

export interface ChurnAlert {
	id: string;
	client: string;
	probability: number;
	tags: string[];
	severity: "critical" | "warning";
	status: "active" | "secured";
}

export interface TeamMember {
	id: string;
	name: string;
	role: string;
	occupancy: number;
	assignedProjects: string[];
	avatar: string;
}

export interface LogLine {
	timestamp: string;
	text: string;
	type: "info" | "success" | "warning" | "error";
}

export interface ClientProfile {
	name: string;
	margin: number;
	securedMargin: number;
	burnRate: number;
	efficiency: number;
	target: number;
	priorQuarter: number;
	income: number; // monthly retainer budget
}

interface AppContextProps {
	activeView: ViewType;
	setActiveView: (view: ViewType) => void;
	systemStatus: SystemStatusType;
	setSystemStatus: (status: SystemStatusType) => void;
	illusionOfMargin: boolean;
	setIllusionOfMargin: (val: boolean) => void;
	searchQuery: string;
	setSearchQuery: (query: string) => void;
	
	// Active client scope
	selectedClient: ClientNameType;
	setSelectedClient: (client: ClientNameType) => void;

	// Client profiles state for simulation
	clientProfiles: Record<string, ClientProfile>;
	setClientProfiles: React.Dispatch<React.SetStateAction<Record<string, ClientProfile>>>;

	leaks: LeakItem[];
	setLeaks: React.Dispatch<React.SetStateAction<LeakItem[]>>;
	churnAlerts: ChurnAlert[];
	setChurnAlerts: React.Dispatch<React.SetStateAction<ChurnAlert[]>>;
	team: TeamMember[];
	setTeam: React.Dispatch<React.SetStateAction<TeamMember[]>>;
	logs: LogLine[];
	addLog: (text: string, type?: LogLine["type"]) => void;
	clearLogs: () => void;

	// Modal States
	zoomOpen: boolean;
	setZoomOpen: (open: boolean) => void;
	recoveryDraftOpen: boolean;
	setRecoveryDraftOpen: (open: boolean) => void;
	activeRecoveryLeak: LeakItem | null;
	setActiveRecoveryLeak: (leak: LeakItem | null) => void;
	recoveryHighlightSubmit: boolean;
	setRecoveryHighlightSubmit: (val: boolean) => void;
	overageLogOpen: boolean;
	setOverageLogOpen: (open: boolean) => void;
	godModeOpen: boolean;
	setGodModeOpen: (open: boolean) => void;
	simulatorOpen: boolean;
	setSimulatorOpen: (open: boolean) => void;
	demoLinkModalOpen: boolean;
	setDemoLinkModalOpen: (open: boolean) => void;

	// Selection states for bulk actions
	selectedLeakIds: string[];
	setSelectedLeakIds: React.Dispatch<React.SetStateAction<string[]>>;
	selectedAlertIds: string[];
	setSelectedAlertIds: React.Dispatch<React.SetStateAction<string[]>>;

	// Severity Filter for Churn Shield
	activeAlertTab: SeverityType;
	setActiveAlertTab: (severity: SeverityType) => void;

	// Search widget highlighting
	highlightedWidget: string | null;
	triggerWidgetHighlight: (widgetName: string, view: ViewType) => void;

	// Collapsible layout state for empty space helper
	revenueLeaksCollapsed: boolean;
	setRevenueLeaksCollapsed: (val: boolean) => void;

	// Chatbot override for Recovery Hub sidebar
	recoveryShowAllLeaksOverride: boolean;
	setRecoveryShowAllLeaksOverride: React.Dispatch<React.SetStateAction<boolean>>;

	// Actions
	runIntegrityAudit: () => void;
	simulateTimesheetScan: () => void;
	runTelemetryScan: () => void;

	// URL Customization Parameters
	agencyName: string;
	agencyDomain: string;
	employeesCount: number;
	niche: "dev" | "design" | "marketing";
}

const AppContext = createContext<AppContextProps | undefined>(undefined);

export function AppContextProvider({ children }: { children: React.ReactNode }) {
	const [activeView, setActiveView] = useState<ViewType>("command-center");
	const [systemStatus, setSystemStatus] = useState<SystemStatusType>("connected");
	const [illusionOfMargin, setIllusionOfMargin] = useState<boolean>(false);
	const [searchQuery, setSearchQuery] = useState<string>("");
	
	// Active client scope state
	const [selectedClient, setSelectedClient] = useState<ClientNameType>("All Accounts");

	// Client profiles state for simulation
	const [clientProfiles, setClientProfiles] = useState<Record<string, ClientProfile>>({
		"Apex Digital": { name: "Apex Digital", margin: 32.1, securedMargin: 48.5, burnRate: 85, efficiency: 72.4, target: 65.0, priorQuarter: 38.0, income: 5000 },
		"Helix Corp": { name: "Helix Corp", margin: 45.0, securedMargin: 58.0, burnRate: 62, efficiency: 88.1, target: 65.0, priorQuarter: 48.0, income: 12000 },
		"Nova Soft": { name: "Nova Soft", margin: 48.2, securedMargin: 62.0, burnRate: 44, efficiency: 91.5, target: 65.0, priorQuarter: 50.0, income: 15000 },
		"Nexus Tech": { name: "Nexus Tech", margin: 61.5, securedMargin: 61.5, burnRate: 91, efficiency: 86.0, target: 65.0, priorQuarter: 60.0, income: 8000 },
		"Orion Labs": { name: "Orion Labs", margin: 55.0, securedMargin: 55.0, burnRate: 73, efficiency: 79.5, target: 65.0, priorQuarter: 54.0, income: 6000 },
		"Vortex Tech": { name: "Vortex Tech", margin: 38.0, securedMargin: 38.0, burnRate: 88, efficiency: 68.2, target: 65.0, priorQuarter: 40.0, income: 7000 },
		"Starlight Co": { name: "Starlight Co", margin: 44.0, securedMargin: 44.0, burnRate: 79, efficiency: 75.0, target: 65.0, priorQuarter: 46.0, income: 5000 },
	});

	// Modals
	const [zoomOpen, setZoomOpen] = useState(false);
	const [recoveryDraftOpen, setRecoveryDraftOpen] = useState(false);
	const [activeRecoveryLeak, setActiveRecoveryLeak] = useState<LeakItem | null>(null);
	const [recoveryHighlightSubmit, setRecoveryHighlightSubmit] = useState(false);
	const [recoveryShowAllLeaksOverride, setRecoveryShowAllLeaksOverride] = useState<boolean>(false);
	const [overageLogOpen, setOverageLogOpen] = useState(false);
	const [godModeOpen, setGodModeOpen] = useState(false);
	const [simulatorOpen, setSimulatorOpen] = useState(false);
	const [demoLinkModalOpen, setDemoLinkModalOpen] = useState(false);

	// Bulk selections
	const [selectedLeakIds, setSelectedLeakIds] = useState<string[]>([]);
	const [selectedAlertIds, setSelectedAlertIds] = useState<string[]>([]);

	// Severity Filter for Churn Shield
	const [activeAlertTab, setActiveAlertTab] = useState<SeverityType>("all");

	// Search widget highlighting state
	const [highlightedWidget, setHighlightedWidget] = useState<string | null>(null);

	// Revenue Leaks collapsed state
	const [revenueLeaksCollapsed, setRevenueLeaksCollapsed] = useState(false);

	// Initial mock logs
	const [logs, setLogs] = useState<LogLine[]>([
		{ timestamp: "21:44:12", text: "Sentinel AI active. System online.", type: "info" },
		{ timestamp: "21:44:15", text: "Stripe connection secured.", type: "success" },
		{ timestamp: "21:44:18", text: "Toggl DB sync complete. Checked 1,200 timesheet entries.", type: "success" },
	]);

	const addLog = (text: string, type: LogLine["type"] = "info") => {
		const time = new Date().toLocaleTimeString("en-GB", { hour12: false });
		setLogs((prev) => [...prev, { timestamp: time, text, type }]);
	};

	const clearLogs = () => setLogs([]);

	// Initial mock leaks
	const [leaks, setLeaks] = useState<LeakItem[]>([
		{ id: "L1", client: "Apex Digital", code: "SRV-CREEP-01", type: "Creative Scope Creep", amount: 2400, status: "Leak", hourlyRate: 100, hoursLogged: 24 },
		{ id: "L2", client: "Helix Corp", code: "SRV-DSGN-04", type: "Overdesign Deviation", amount: 1250, status: "Leak", hourlyRate: 100, hoursLogged: 13 },
		{ id: "L3", client: "Nova Soft", code: "SRV-API-09", type: "Unbilled Integration Addon", amount: 850, status: "Leak", hourlyRate: 100, hoursLogged: 9 },
	]);

	// Initial mock churn alerts
	const [churnAlerts, setChurnAlerts] = useState<ChurnAlert[]>([
		{ id: "C1", client: "Orion Labs", probability: 45, tags: ["Low platform activity", "Support ticket delay"], severity: "warning", status: "active" },
		{ id: "C2", client: "Vortex Tech", probability: 78, tags: ["Multiple support claims", "Late payment"], severity: "critical", status: "active" },
		{ id: "C3", client: "Starlight Co", probability: 60, tags: ["Retainer payment delay"], severity: "warning", status: "active" },
	]);

	// Initial team with profile photos
	const [team, setTeam] = useState<TeamMember[]>([
		{ id: "T1", name: "Shaban Haider", role: "Lead Engineer", occupancy: 85, assignedProjects: ["Stripe Integration", "Nova API"], avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&fit=crop&auto=format&q=80" },
		{ id: "T2", name: "Alvaro Designer", role: "Senior UX Designer", occupancy: 98, assignedProjects: ["Apex Portal", "Vortex Branding"], avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&fit=crop&auto=format&q=80" },
		{ id: "T3", name: "Lucía García", role: "Marketing Lead", occupancy: 45, assignedProjects: ["Google Ads campaign"], avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&fit=crop&auto=format&q=80" },
		{ id: "T4", name: "David Miller", role: "Sales Dev", occupancy: 30, assignedProjects: ["Outreach pipeline"], avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&fit=crop&auto=format&q=80" },
	]);

	// URL params customization states
	const [agencyName, setAgencyName] = useState<string>("Your Agency");
	const [agencyDomain, setAgencyDomain] = useState<string>("");
	const [employeesCount, setEmployeesCount] = useState<number>(25);
	const [niche, setNiche] = useState<"dev" | "design" | "marketing">("marketing");

	useEffect(() => {
		if (typeof window !== "undefined") {
			const params = new URLSearchParams(window.location.search);
			
			const agencyParam = params.get("agency");
			if (agencyParam) {
				setAgencyName(agencyParam.trim());
			}

			const domainParam = params.get("domain");
			if (domainParam) {
				setAgencyDomain(domainParam.trim());
			}

			const employeesParam = params.get("employees");
			if (employeesParam) {
				const val = parseInt(employeesParam, 10);
				if (!isNaN(val) && val > 0) {
					setEmployeesCount(val);
				}
			}

			const nicheParam = params.get("niche");
			const activeNiche = (nicheParam === "dev" || nicheParam === "design" || nicheParam === "marketing")
				? nicheParam
				: "marketing";
			
			setNiche(activeNiche);

			setLeaks((prev) =>
				prev.map((l) => {
					if (l.id === "L1") {
						const type = activeNiche === "dev"
							? "Unbilled SSO & API Addons"
							: activeNiche === "design"
							? "Unbilled Figma Revisions"
							: "Unbilled Minor Slack Requests";
						return { ...l, type };
					}
					if (l.id === "L2") {
						const type = activeNiche === "dev"
							? "Custom Webhook Integrations"
							: activeNiche === "design"
							? "Extra Asset Formatting"
							: "Out-of-scope Ad Variations";
						return { ...l, type };
					}
					return l;
				})
			);
		}
	}, []);

	// Trigger logs on Ctrl+Shift+D God Mode open and Ctrl+Shift+S Simulator open
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.ctrlKey && e.shiftKey && e.key === "D") {
				e.preventDefault();
				setGodModeOpen((prev) => {
					const newState = !prev;
					addLog(newState ? "God Mode Override Panel opened." : "God Mode Override Panel closed.", "warning");
					return newState;
				});
			}
			if (e.ctrlKey && e.shiftKey && e.key === "S") {
				e.preventDefault();
				setSimulatorOpen((prev) => {
					const newState = !prev;
					addLog(newState ? "Portfolio Simulator Console opened." : "Portfolio Simulator Console closed.", "info");
					return newState;
				});
			}
		};
		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, []);

	// Handle Stripe pipeline failure injection from God Mode
	useEffect(() => {
		if (systemStatus === "api-failure") {
			setChurnAlerts((prev) => {
				if (prev.some((a) => a.id === "API_FAIL")) return prev;
				return [
					{ id: "API_FAIL", client: "Stripe Connection Pipeline", probability: 99, tags: ["API connection lost", "Webhook sync failing"], severity: "critical", status: "active" },
					...prev,
				];
			});
			setLeaks((prev) => {
				if (prev.some((l) => l.id === "API_LEAK")) return prev;
				return [
					{ id: "API_LEAK", client: "Stripe Retainer Sync", code: "SRV-STRP-99", type: "Stripe Webhook Mismatch", amount: 4800, status: "Leak", hourlyRate: 100, hoursLogged: 48 },
					...prev,
				];
			});
			addLog("CRITICAL: Stripe API pipeline failure detected. Invoices mismatch.", "error");
		} else if (systemStatus === "connected") {
			setChurnAlerts((prev) => prev.filter((a) => a.id !== "API_FAIL"));
			setLeaks((prev) => prev.filter((l) => l.id !== "API_LEAK"));
		}
	}, [systemStatus]);

	const triggerWidgetHighlight = (widgetName: string, view: ViewType) => {
		setActiveView(view);
		setHighlightedWidget(widgetName);
		addLog(`Searching: Navigating to ${widgetName}...`, "info");
		setTimeout(() => {
			const el = document.getElementById(widgetName);
			if (el) {
				el.scrollIntoView({ behavior: "smooth", block: "center" });
			}
		}, 100);
		setTimeout(() => {
			setHighlightedWidget(null);
		}, 3000);
	};

	// Actions
	const runIntegrityAudit = () => {
		setSystemStatus("auditing");
		addLog("System Integrity Audit initiated...", "info");
		setTimeout(() => {
			setSystemStatus("connected");
			addLog("Stripe API integration audit: PASSED.", "success");
			addLog("Toggl Timesheet sync checks: 100% matched.", "success");
			addLog("System integrity restored: All systems nominal.", "success");
		}, 2000);
	};

	const simulateTimesheetScan = () => {
		addLog("Simulating full Timesheet scan...", "info");
		setTimeout(() => {
			const l1Type = niche === "dev"
				? "Unbilled SSO & API Addons"
				: niche === "design"
				? "Unbilled Figma Revisions"
				: "Unbilled Minor Slack Requests";
			const l2Type = niche === "dev"
				? "Custom Webhook Integrations"
				: niche === "design"
				? "Extra Asset Formatting"
				: "Out-of-scope Ad Variations";

			setLeaks([
				{ id: "L1", client: "Apex Digital", code: "SRV-CREEP-01", type: l1Type, amount: 2400, status: "Leak", hourlyRate: 100, hoursLogged: 24 },
				{ id: "L2", client: "Helix Corp", code: "SRV-DSGN-04", type: l2Type, amount: 1250, status: "Leak", hourlyRate: 100, hoursLogged: 13 },
				{ id: "L3", client: "Nova Soft", code: "SRV-API-09", type: "Unbilled Integration Addon", amount: 850, status: "Leak", hourlyRate: 100, hoursLogged: 9 },
			]);
			addLog("Scan complete: 3 new unbilled deviations detected.", "warning");
		}, 1500);
	};

	const runTelemetryScan = () => {
		addLog("Running Telemetry telemetry scan...", "info");
		setTimeout(() => {
			setChurnAlerts([
				{ id: "C1", client: "Orion Labs", probability: 45, tags: ["Low platform activity", "Support ticket delay"], severity: "warning", status: "active" },
				{ id: "C2", client: "Vortex Tech", probability: 78, tags: ["Multiple support claims", "Late payment"], severity: "critical", status: "active" },
				{ id: "C3", client: "Starlight Co", probability: 60, tags: ["Retainer payment delay"], severity: "warning", status: "active" },
			]);
			addLog("Telemetry scan complete: Checked 4 client telemetry clusters. Status healthy.", "success");
		}, 1500);
	};

	return (
		<AppContext.Provider
			value={{
				activeView,
				setActiveView,
				systemStatus,
				setSystemStatus,
				illusionOfMargin,
				setIllusionOfMargin,
				searchQuery,
				setSearchQuery,
				selectedClient,
				setSelectedClient,
				clientProfiles,
				setClientProfiles,
				leaks,
				setLeaks,
				churnAlerts,
				setChurnAlerts,
				team,
				setTeam,
				logs,
				addLog,
				clearLogs,
				zoomOpen,
				setZoomOpen,
				recoveryDraftOpen,
				setRecoveryDraftOpen,
				activeRecoveryLeak,
				setActiveRecoveryLeak,
				recoveryHighlightSubmit,
				setRecoveryHighlightSubmit,
				recoveryShowAllLeaksOverride,
				setRecoveryShowAllLeaksOverride,
				overageLogOpen,
				setOverageLogOpen,
				godModeOpen,
				setGodModeOpen,
				simulatorOpen,
				setSimulatorOpen,
				demoLinkModalOpen,
				setDemoLinkModalOpen,
				selectedLeakIds,
				setSelectedLeakIds,
				selectedAlertIds,
				setSelectedAlertIds,
				activeAlertTab,
				setActiveAlertTab,
				highlightedWidget,
				triggerWidgetHighlight,
				revenueLeaksCollapsed,
				setRevenueLeaksCollapsed,
				runIntegrityAudit,
				simulateTimesheetScan,
				runTelemetryScan,
				agencyName,
				agencyDomain,
				employeesCount,
				niche,
			}}
		>
			{children}
		</AppContext.Provider>
	);
}

export function useAppContext() {
	const context = useContext(AppContext);
	if (!context) {
		throw new Error("useAppContext must be used within an AppContextProvider");
	}
	return context;
}
