"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { getSquad, type SquadResponse } from "@/services/squad";
import { feedbackService, type FeedbackResponse } from "@/services/feedback";
import { FeedbackCard } from "@/components/feedback/feedback_card";
import { Loader2, ArrowLeft, MessageSquare, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

export default function SquadFeedbackListPage({ params }: { params: Promise<{ squadId: string }> }) {
  const router = useRouter();
  const { squadId } = use(params);
  
  const [squad, setSquad] = useState<SquadResponse | null>(null);
  const [feedbacks, setFeedbacks] = useState<FeedbackResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const squadData = await getSquad(parseInt(squadId, 10));
        if (!squadData) {
          setError("Squad not found");
          setLoading(false);
          return;
        }
        setSquad(squadData);

        const feedbacksData = await feedbackService.listFeedbackForSquad(parseInt(squadId, 10));
        setFeedbacks(feedbacksData);
      } catch (err: any) {
        setError(err.message || "Failed to load squad details");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [squadId]);

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !squad) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center gap-4">
        <div className="text-red-500 font-medium">{error || "Squad not found"}</div>
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Go Back
        </Button>
      </div>
    );
  }

  const averageRating = feedbacks.length > 0 
    ? (feedbacks.reduce((acc, f) => acc + f.rating, 0) / (feedbacks.length * 5)).toFixed(1)
    : "0.0";

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 flex items-center justify-between flex-wrap gap-4"
      >
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold tracking-tight">{squad.name}</h1>
              <Badge variant="secondary" className="bg-info/10 text-info hover:bg-info/20 border-none px-3">
                Squad Feedback
              </Badge>
            </div>
            <p className="text-muted-foreground mt-1 text-sm">
              Viewing all reviews and ratings for this team.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6 bg-card border rounded-xl px-6 py-3 shadow-sm">
          <div className="text-center">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-1">Total Reviews</p>
            <div className="flex items-center justify-center gap-1.5">
              <MessageSquare className="h-4 w-4 text-primary" />
              <span className="text-xl font-bold">{feedbacks.length}</span>
            </div>
          </div>
          <div className="w-px h-10 bg-border" />
          <div className="text-center">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-1">Avg Rating</p>
            <div className="flex items-center justify-center gap-1.5">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              <span className="text-xl font-bold">{averageRating}</span>
              <span className="text-xs text-muted-foreground">/ 5</span>
            </div>
          </div>
        </div>
      </motion.div>

      {feedbacks.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl border-2 border-dashed p-16 text-center shadow-sm"
        >
          <div className="h-20 w-20 bg-muted/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageSquare className="h-10 w-10 text-muted-foreground/40" />
          </div>
          <h2 className="text-xl font-semibold mb-2">No feedback yet</h2>
          <p className="text-muted-foreground max-w-sm mx-auto">
            This squad hasn't received any feedback from completed tasks yet. 
            Once an assigner leaves a review, it will appear here.
          </p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {feedbacks.map((feedback, index) => (
            <motion.div
              key={feedback.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <FeedbackCard feedback={feedback} />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
