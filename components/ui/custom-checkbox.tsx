"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface CustomCheckboxProps {
	checked: boolean;
	onChange: (checked: boolean) => void;
	className?: string;
}

export function CustomCheckbox({ checked, onChange, className }: CustomCheckboxProps) {
	return (
		<div
			onClick={(e) => {
				e.stopPropagation();
				onChange(!checked);
			}}
			className={cn(
				"size-4 rounded border transition-all duration-200 flex items-center justify-center cursor-pointer shrink-0 select-none",
				checked
					? "bg-primary border-primary text-primary-foreground shadow-xs shadow-primary/20 scale-102"
					: "border-border hover:border-primary/45 bg-muted/20 hover:bg-muted/40",
				className
			)}
		>
			{checked && (
				<svg className="size-3 text-primary-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4">
					<motion.path
						d="M4 12l6 6L20 6"
						initial={{ pathLength: 0 }}
						animate={{ pathLength: 1 }}
						transition={{ duration: 0.2, ease: "easeOut" }}
					/>
				</svg>
			)}
		</div>
	);
}

interface AnimatedCheckProps {
	className?: string;
	size?: number;
	strokeWidth?: number;
}

export function AnimatedCheck({ className, size = 16, strokeWidth = 3 }: AnimatedCheckProps) {
	return (
		<svg
			style={{ width: size, height: size }}
			className={cn("text-emerald-500", className)}
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth={strokeWidth}
			strokeLinecap="round"
			strokeLinejoin="round"
		>
			<motion.path
				d="M4 12l6 6L20 6"
				initial={{ pathLength: 0 }}
				animate={{ pathLength: 1 }}
				transition={{ duration: 0.4, ease: "easeInOut" }}
			/>
		</svg>
	);
}
