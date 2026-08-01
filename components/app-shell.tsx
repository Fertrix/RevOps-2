"use client";

import { cn } from "@/lib/utils";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { CustomTrigger } from "@/components/custom-trigger";
import { Separator } from "@/components/ui/separator";
import {
	Breadcrumb,
	BreadcrumbList,
	BreadcrumbItem,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { AppSidebar } from "@/components/app-sidebar";
import { AppContextProvider, useAppContext } from "@/components/app-context";
import { ViewBilling } from "@/components/view-billing";
import { ViewSettings } from "@/components/view-settings";
import { ViewClientPortfolio } from "@/components/view-client-portfolio";
import { ModalZoom } from "@/components/modal-zoom";
import { ModalRecovery } from "@/components/modal-recovery";
import { ModalOverage } from "@/components/modal-overage";
import { GodModePanel } from "@/components/panel-god-mode";
import { SentinelTerminal } from "@/components/sentinel-terminal";
import { PanelSimulator } from "@/components/panel-simulator";
import { Button } from "@/components/ui/button";
import { AlertTriangleIcon } from "lucide-react";
import React from "react";

function AppShellContent({ children }: { children: React.ReactNode }) {
	const {
		activeView,
		godModeOpen,
		zoomOpen,
		recoveryDraftOpen,
		overageLogOpen,
		simulatorOpen,
		systemStatus,
		runIntegrityAudit,
		selectedClient,
		agencyName,
	} = useAppContext();

	const renderContent = () => {
		switch (activeView) {
			case "command-center":
				return children;
			case "billing":
				return <ViewBilling />;
			case "settings":
				return <ViewSettings />;
			case "client-portfolio":
				return <ViewClientPortfolio />;
			default:
				return children;
		}
	};

	return (
		<SidebarProvider
			className={cn(
				"[--app-wrapper-max-width:80rem]",
				"[--app-header-height:3.5rem]"
			)}
		>
			<AppSidebar />
			<SidebarInset className="bg-muted/30 dark:bg-background flex flex-col">
				{/* Top Blinking Alert Banner in API Outage */}
				{systemStatus === "api-failure" && (
					<div className="w-full bg-amber-600/90 text-white font-bold text-center py-2.5 px-4 text-xs animate-pulse tracking-wide select-none flex items-center justify-center gap-2 border-b border-amber-700/50 shrink-0">
						<AlertTriangleIcon className="size-4 animate-bounce" />
						<span>[CRITICAL STRIPE STREAM FAILURE] API OFFLINE - SYSTEM RETENTION STREAM FALLBACK ACTIVE</span>
					</div>
				)}

				<div
					className={cn(
						"flex flex-1 flex-col p-4 md:p-6 pb-24", // extra padding at bottom to avoid overlapping with floating terminal
						"w-full"
					)}
				>
					{/* Floating trigger inline with page content */}
					<div className="mb-4 shrink-0 flex items-center justify-between gap-4">
						<div className="flex items-center gap-2">
							<CustomTrigger place="navbar" />
							{activeView === "client-portfolio" && (
								<Breadcrumb>
										<BreadcrumbList>
											<BreadcrumbItem className="hidden md:block">
												<span className="text-xs text-muted-foreground">Client Directory</span>
											</BreadcrumbItem>
											<BreadcrumbSeparator className="hidden md:block" />
											<BreadcrumbItem>
												<BreadcrumbPage className="text-xs font-semibold text-foreground bg-muted/60 border px-2.5 py-0.5 rounded-md leading-none flex items-center justify-center font-sans select-none">
													{selectedClient}
												</BreadcrumbPage>
											</BreadcrumbItem>
										</BreadcrumbList>
									</Breadcrumb>
							)}
							{activeView === "command-center" && (
								<Breadcrumb>
										<BreadcrumbList>
											<BreadcrumbItem className="hidden md:block">
												<span className="text-xs text-muted-foreground">Command Center</span>
											</BreadcrumbItem>
											<BreadcrumbSeparator className="hidden md:block" />
											<BreadcrumbItem>
												<BreadcrumbPage className="text-xs font-semibold text-foreground bg-muted/60 border px-2.5 py-0.5 rounded-md leading-none flex items-center justify-center font-sans select-none">
													{agencyName}
												</BreadcrumbPage>
											</BreadcrumbItem>
										</BreadcrumbList>
									</Breadcrumb>
							)}
						</div>
						
						{/* Reconnect pipeline action in Header */}
						{systemStatus === "api-failure" && (
							<Button
								onClick={runIntegrityAudit}
								className="bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 shadow-sm transition-all"
							>
								RUN INTEGRITY AUDIT
							</Button>
						)}
					</div>
					{renderContent()}
				</div>
			</SidebarInset>

			{/* Global Widgets & Modals */}
			<SentinelTerminal />
			{godModeOpen && <GodModePanel />}
			{simulatorOpen && <PanelSimulator />}
			{zoomOpen && <ModalZoom />}
			{recoveryDraftOpen && <ModalRecovery />}
			{overageLogOpen && <ModalOverage />}
		</SidebarProvider>
	);
}

export function AppShell({ children }: { children: React.ReactNode }) {
	return (
		<AppContextProvider>
			<AppShellContent>{children}</AppShellContent>
		</AppContextProvider>
	);
}
