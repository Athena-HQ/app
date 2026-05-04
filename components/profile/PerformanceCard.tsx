import type { EmployeeProfile } from "@/types/employee";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star, Sparkles } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface PerformanceCardProps {
    performance: EmployeeProfile['performance'];
}

export function PerformanceCard({ performance }: PerformanceCardProps) {
    const { feedbackDistribution, totalFeedbackCount } = performance;

    return (
        <Card className="h-full border-none shadow-card bg-card/80 backdrop-blur-sm">
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between text-lg">
                    <div className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-purple-500" />
                        Feedback Distribution
                    </div>
                    <span className="text-sm font-normal text-muted-foreground">
                        {totalFeedbackCount} review{totalFeedbackCount !== 1 ? "s" : ""}
                    </span>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                {[5, 4, 3, 2, 1].map((rating) => {
                    const count = feedbackDistribution[rating.toString()] || 0;
                    const percentage = totalFeedbackCount > 0 ? (count / totalFeedbackCount) * 100 : 0;

                    return (
                        <div key={rating} className="flex items-center gap-3 text-sm">
                            <div className="flex items-center gap-1 w-12 font-medium">
                                {rating} <Star className="w-3 h-3 text-muted-foreground" />
                            </div>
                            <Progress value={percentage} className="h-2 flex-1" indicatorClassName={rating >= 4 ? "bg-purple-500" : "bg-muted-foreground/30"} />
                            <div className="w-8 text-right text-muted-foreground text-xs">{count}</div>
                        </div>
                    );
                })}
            </CardContent>
        </Card>
    );
}
