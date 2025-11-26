import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useTopPerformers } from "@/hooks/useDashboard";
import { fadeInUpVariants } from "@/lib/animations-settings";
import { TrophyIcon } from "lucide-react";

export function TopPerformers() {
  const { data: performers, isLoading } = useTopPerformers();

  if (isLoading) {
    return (
      <Card className="p-6">
        <Skeleton className="h-6 w-40 mb-4" />
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="flex-1">
                <Skeleton className="h-4 w-32 mb-2" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  return (
    <motion.div
      variants={fadeInUpVariants}
      initial="initial"
      animate="animate"
      transition={{ delay: 0.7 }}
    >
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Top Performers</h3>
        <div className="space-y-4">
          {performers?.map((performer, index) => (
            <motion.div
              key={performer.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent/50 transition-colors"
            >
              <div className="relative">
                <img
                  src={performer.avatar}
                  alt={performer.name}
                  className="w-12 h-12 rounded-full"
                />
                {performer.rank === 1 && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-500 rounded-full flex items-center justify-center">
                    <TrophyIcon className="h-3 w-3 text-white" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{performer.name}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-muted-foreground">
                    {performer.xp.toLocaleString()} XP
                  </span>
                  <span className="text-xs text-muted-foreground">•</span>
                  <span className="text-xs text-muted-foreground">
                    {performer.tasks} tasks
                  </span>
                </div>
              </div>
              <Badge variant="secondary">#{performer.rank}</Badge>
            </motion.div>
          ))}
        </div>
      </Card>
    </motion.div>
  );
}
