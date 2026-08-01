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
import { UsersIcon, HistoryIcon, ArrowRightIcon } from "lucide-react";
import React, { useState } from "react";

export function TeamUtilization() {
	const { team, setTeam, setOverageLogOpen, addLog, highlightedWidget } = useAppContext();

	// Drag and Drop States
	const [draggedProject, setDraggedProject] = useState<{ memberId: string; project: string } | null>(null);
	const [hoveredColumnId, setHoveredColumnId] = useState<string | null>(null);

	const handleReassignProject = (
		memberId: string,
		project: string,
		targetMemberId: string
	) => {
		if (!targetMemberId || targetMemberId === memberId) return;

		const sourceMember = team.find((m) => m.id === memberId);
		const targetMember = team.find((m) => m.id === targetMemberId);

		if (!sourceMember || !targetMember) return;

		setTeam((prev) =>
			prev.map((m) => {
				if (m.id === memberId) {
					// Remove project, reduce occupancy by 15%
					return {
						...m,
						assignedProjects: m.assignedProjects.filter((p) => p !== project),
						occupancy: Math.max(0, m.occupancy - 15),
					};
				}
				if (m.id === targetMemberId) {
					// Add project, increase occupancy by 15%
					return {
						...m,
						assignedProjects: [...m.assignedProjects, project],
						occupancy: Math.min(100, m.occupancy + 15),
					};
				}
				return m;
			})
		);

		addLog(
			`Reallocated project "${project}" from ${sourceMember.name} to ${targetMember.name}. Workload recalculated.`,
			"info"
		);
	};

	// Drag operations
	const handleDragStart = (e: React.DragEvent, memberId: string, project: string) => {
		setDraggedProject({ memberId, project });
		e.dataTransfer.effectAllowed = "move";
		e.dataTransfer.setData("text/plain", project);
	};

	const handleDragEnd = () => {
		setDraggedProject(null);
		setHoveredColumnId(null);
	};

	const handleDragOver = (e: React.DragEvent, memberId: string) => {
		e.preventDefault();
		if (draggedProject && draggedProject.memberId !== memberId) {
			e.dataTransfer.dropEffect = "move";
		}
	};

	const handleDragEnter = (e: React.DragEvent, memberId: string) => {
		e.preventDefault();
		if (draggedProject && draggedProject.memberId !== memberId) {
			setHoveredColumnId(memberId);
		}
	};

	const handleDragLeave = (memberId: string) => {
		if (hoveredColumnId === memberId) {
			setHoveredColumnId(null);
		}
	};

	const handleDrop = (e: React.DragEvent, targetMemberId: string) => {
		e.preventDefault();
		setHoveredColumnId(null);
		if (draggedProject) {
			handleReassignProject(draggedProject.memberId, draggedProject.project, targetMemberId);
			setDraggedProject(null);
		}
	};

	const isHighlighted = highlightedWidget === "team-utilization";

	return (
		<Card
			id="team-utilization"
			className={cn(
				"md:col-span-2 lg:col-span-4 dark:bg-transparent relative transition-all duration-300",
				isHighlighted && "ring-2 ring-primary ring-offset-2 shadow-2xl animate-pulse border-primary"
			)}
		>
			{/* Inject inline wiggle keyframe styles */}
			<style>{`
				@keyframes drag-wiggle {
					0% { transform: rotate(-2deg) scale(1.04); }
					50% { transform: rotate(2deg) scale(1.04); }
					100% { transform: rotate(-2deg) scale(1.04); }
				}
			`}</style>

			<CardHeader className="flex flex-row items-center justify-between border-b pb-3">
				<div className="flex items-center gap-3">
					<div className="rounded-full bg-violet-500/10 p-2 text-violet-500">
						<UsersIcon className="size-5" />
					</div>
					<div>
						<CardTitle className="text-base font-semibold">
							Team Workload & Projects Kanban
						</CardTitle>
						<CardDescription className="text-xs">
							Drag and drop project cards between employees to optimize workloads, balance capacities, and prevent burnout.
						</CardDescription>
					</div>
				</div>

				<Button
					size="sm"
					variant="outline"
					onClick={() => setOverageLogOpen(true)}
					className="text-xs flex items-center gap-1.5"
				>
					<HistoryIcon className="size-3.5" />
					Simulate Overage Log
				</Button>
			</CardHeader>

			<CardContent className="p-4 bg-muted/5">
				{/* Kanban Board Container */}
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-stretch select-none">
					{team.map((member) => {
						const isOverloaded = member.occupancy >= 90;
						const isUnderloaded = member.occupancy <= 40;
						const isHovered = hoveredColumnId === member.id;

						return (
							<div
								key={member.id}
								onDragOver={(e) => handleDragOver(e, member.id)}
								onDragEnter={(e) => handleDragEnter(e, member.id)}
								onDragLeave={() => handleDragLeave(member.id)}
								onDrop={(e) => handleDrop(e, member.id)}
								className={cn(
									"bg-stone-900/20 dark:bg-stone-950/40 border border-stone-850 rounded-xl p-4 flex flex-col gap-4 transition-all duration-300 relative",
									isOverloaded && "border-rose-500/15 bg-rose-500/2",
									isHovered && "border-violet-500/40 bg-violet-500/5 shadow-inner scale-[1.01]"
								)}
							>
								{/* Column / Member Header */}
								<div className="flex items-center gap-3">
									<img
										src={member.avatar}
										alt={member.name}
										className="size-11 rounded-full object-cover border border-muted"
									/>
									<div className="min-w-0">
										<h4 className="font-semibold text-xs text-foreground truncate">
											{member.name}
										</h4>
										<p className="text-[10px] text-muted-foreground truncate">
											{member.role}
										</p>
									</div>
								</div>

								{/* Occupancy Indicator */}
								<div className="flex flex-col gap-1.5">
									<div className="flex items-center justify-between text-[10px]">
										<span className="text-muted-foreground uppercase font-semibold">
											Workload
										</span>
										<span
											className={cn(
												"font-mono font-bold",
												isOverloaded
													? "text-rose-500 animate-pulse"
													: isUnderloaded
													? "text-emerald-500"
													: "text-amber-500"
											)}
										>
											{member.occupancy}%
										</span>
									</div>
									<div className="relative w-full h-1.5 bg-secondary rounded-full overflow-hidden">
										<div
											className={cn(
												"h-full rounded-full transition-all duration-500",
												isOverloaded
													? "bg-rose-500"
													: isUnderloaded
													? "bg-emerald-500"
													: "bg-amber-500"
											)}
											style={{ width: `${member.occupancy}%` }}
										/>
									</div>
								</div>

								{/* Assigned Project Cards (Kanban Cards) */}
								<div className="flex-1 flex flex-col gap-2 min-h-[140px] rounded-lg border border-dashed border-stone-900/60 p-2 bg-stone-950/20">
									<span className="text-[9px] uppercase font-bold text-muted-foreground/60 px-1">
										Assigned Projects
									</span>
									{member.assignedProjects.map((proj) => {
										const isDraggingThis = draggedProject?.memberId === member.id && draggedProject?.project === proj;
										
										return (
											<div
												key={proj}
												draggable
												onDragStart={(e) => handleDragStart(e, member.id, proj)}
												onDragEnd={handleDragEnd}
												className={cn(
													"bg-background border rounded-lg p-2.5 shadow-sm hover:border-violet-500/35 transition-all duration-200 flex flex-col gap-2 cursor-grab active:cursor-grabbing",
													isDraggingThis && "opacity-45 border-dashed border-violet-500 shadow-2xl scale-102"
												)}
												style={isDraggingThis ? { animation: "drag-wiggle 0.3s infinite ease-in-out" } : {}}
											>
												<div className="flex items-center justify-between">
													<span className="text-[10px] font-semibold text-foreground truncate max-w-[120px]">
														{proj}
													</span>
													<ArrowRightIcon className="size-3 text-muted-foreground" />
												</div>

												{/* Dropdown Fallback selector */}
												<select
													onChange={(e) =>
														handleReassignProject(
															member.id,
															proj,
															e.target.value
														)
													}
													value=""
													className="text-[9px] bg-muted/65 hover:bg-muted border rounded px-1.5 py-0.5 w-full focus:outline-none focus:ring-1 focus:ring-violet-500 text-muted-foreground cursor-pointer"
												>
													<option value="" disabled>
														Reassign project...
													</option>
													{team
														.filter((m) => m.id !== member.id)
														.map((m) => (
															<option key={m.id} value={m.id}>
																Transfer to {m.name.split(" ")[0]} ({m.occupancy}%)
															</option>
														))}
												</select>
											</div>
										);
									})}

									{member.assignedProjects.length === 0 && (
										<div className="flex-1 flex flex-col items-center justify-center p-3 text-center border border-dashed border-stone-900 rounded-lg">
											<span className="text-[10px] text-muted-foreground/40 italic">
												Available Capacity
											</span>
										</div>
									)}
								</div>
							</div>
						);
					})}
				</div>
			</CardContent>
		</Card>
	);
}
