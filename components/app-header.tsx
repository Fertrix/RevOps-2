"use client";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { CustomTrigger } from "@/components/custom-trigger";
import { NavUser } from "@/components/nav-user";
import { useAppContext } from "@/components/app-context";
import { BellIcon, RefreshCwIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function AppHeader() {
	return (
		<header className="sticky top-0 z-50 flex h-(--app-header-height) w-full shrink-0 items-center justify-between gap-2 border-b bg-background px-4 md:px-6">
			<div className="flex items-center gap-3">
				<CustomTrigger place="navbar" />
			</div>
		</header>
	);
}
