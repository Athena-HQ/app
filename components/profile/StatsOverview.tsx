import type { EmployeeProfile } from "@/types/employee";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, Trophy, Star, Target } from "lucide-react";

interface StatsOverviewProps {
    employee: EmployeeProfile;
}

export function StatsOverview({ employee }: StatsOverviewProps) {
    const { taskAnalytics, performance, gamification } = employee;

    const stats = [
        {
            label: "Tasks Completed",
            value: taskAnalytics.totalTasksCompleted,
            icon: CheckCircle2,
            color: "text-blue-500",
            bg: "bg-blue-500/10",
            subtext: `${taskAnalytics.completionRate}% Completion Rate`
        },
        {
            label: "Badges Earned",
            value: gamification.badges.length,
            icon: Trophy,
            color: "text-amber-500",
            bg: "bg-amber-500/10",
            subtext: gamification.badges.length > 0 ? "Keep it up!" : "Complete tasks to earn badges"
        },
        {
            label: "Avg. Rating",
            value: performance.overallRating > 0 ? `${performance.overallRating.toFixed(1)}` : "—",
            icon: Star,
            color: "text-purple-500",
            bg: "bg-purple-500/10",
            subtext: performance.overallRating > 0 ? `out of 5 · ${performance.totalFeedbackCount} reviews` : "No reviews yet"
        },
        {
            label: "Current Focus",
            value: taskAnalytics.tasksInProgress,
            icon: Target,
            color: "text-green-500",
            bg: "bg-green-500/10",
            subtext: "Active Tasks"
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                    <Card key={index} className="border-none shadow-sm hover:shadow-md transition-shadow bg-card/50">
                        <CardContent className="p-4 flex items-center gap-4">
                            <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                                <Icon className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-2xl font-bold text-foreground">{stat.value}</span>
                                </div>
                                <p className="text-xs text-muted-foreground mt-0.5">{stat.subtext}</p>
                            </div>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
}
