import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useCurrentAppUser } from "@/hooks/useCurrentAppUser";
import {
  Trophy,
  TrendingUp,
  Target,
  Clock,
  Flame,
  CheckCircle2,
} from "lucide-react";

interface HeroStatCardProps {
  xp: number;
  level: number;
  completionRate: number;
  averageCompletionTime: number;
  currentStreak: number;
  needsReviewCount: number;
  isManager?: boolean;
}

export function HeroStatCard({
  xp,
  level,
  completionRate,
  averageCompletionTime,
  currentStreak,
  needsReviewCount,
  isManager = false,
}: HeroStatCardProps) {
  const { appUser } = useCurrentAppUser();
  const userName = appUser?.name ?? "Athena User";
  const userRole = appUser?.role ?? "Employee";
  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="h-full"
    >
      <Card className="relative overflow-hidden border-2 bg-gradient-to-br from-primary/10 via-background to-primary/5 h-full">
        <CardContent className="relative p-8">
          <div className="flex items-start justify-between gap-6">
            <div className="flex items-start gap-6 flex-1">
              <Avatar className="h-24 w-24 border-4 border-primary/20 shadow-lg">
                <AvatarFallback className="text-3xl font-bold bg-gradient-to-br from-primary to-primary/60 text-primary-foreground">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col gap-2">
                <div>
                  <h2 className="text-4xl font-bold mb-1">
                    {userName}
                  </h2>
                  <p className="text-lg text-muted-foreground">
                    {userRole}
                  </p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full border border-primary/20 mt-2 w-fit">
                  <Trophy className="h-5 w-5 text-primary" />
                  <span className="text-2xl font-bold">Level {level}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-6 pt-6 border-t border-border/50">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 rounded-lg bg-primary/10 border border-primary/30">
                <div className="flex items-center justify-between mb-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  <span className="text-xs text-muted-foreground">XP</span>
                </div>
                <p className="text-2xl font-bold">{xp.toLocaleString()}</p>
              </div>
              <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/30">
                <div className="flex items-center justify-between mb-2">
                  <Target className="h-4 w-4 text-blue-600" />
                  <span className="text-xs text-muted-foreground">
                    Completion
                  </span>
                </div>
                <p className="text-2xl font-bold">{completionRate}%</p>
              </div>
              <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/30">
                <div className="flex items-center justify-between mb-2">
                  <Clock className="h-4 w-4 text-purple-600" />
                  <span className="text-xs text-muted-foreground">
                    Avg Time
                  </span>
                </div>
                <p className="text-2xl font-bold">
                  {averageCompletionTime.toFixed(1)}d
                </p>
              </div>
              <div className="p-3 rounded-lg bg-orange-500/10 border border-orange-500/30">
                <div className="flex items-center justify-between mb-2">
                  <Flame className="h-4 w-4 text-orange-600" />
                  <span className="text-xs text-muted-foreground">Streak</span>
                </div>
                <p className="text-2xl font-bold">{currentStreak}d</p>
              </div>
              {isManager && needsReviewCount > 0 && (
                <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
                  <div className="flex items-center justify-between mb-2">
                    <CheckCircle2 className="h-4 w-4 text-amber-600" />
                    <span className="text-xs text-muted-foreground">
                      Review
                    </span>
                  </div>
                  <p className="text-2xl font-bold">{needsReviewCount}</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
