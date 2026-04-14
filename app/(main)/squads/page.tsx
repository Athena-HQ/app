"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, Plus, Edit, Users } from "lucide-react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { listSquads, type SquadListResponse } from "@/services/squad";

function filterSquads(
  squads: SquadListResponse[],
  searchQuery: string
) {
  return squads.filter((squad) => {
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch =
      squad.name.toLowerCase().includes(searchLower) ||
      (squad.stack ?? "").toLowerCase().includes(searchLower);
    return matchesSearch;
  });
}

export default function SquadsPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const { data: squads = [], isLoading } = useQuery({
    queryKey: ["squads"],
    queryFn: listSquads,
  });

  const filteredSquads = filterSquads(squads, searchQuery);

  return (
    <div className="min-h-screen pb-24 bg-transparent animate-in fade-in duration-500">
      <main className="container mx-auto px-4 py-8 space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Squads
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage your cross-functional teams and track progress.
            </p>
          </div>

          <Link href="/squads/create">
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:scale-[1.02]">
              <Plus className="w-4 h-4 mr-2" />
              Create New Squad
            </Button>
          </Link>
        </div>

        <div className="flex flex-col md:flex-row gap-4 items-center bg-card/60 backdrop-blur-sm p-4 rounded-xl border border-border shadow-sm">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search squads..."
              className="pl-9 bg-background border-border/60 focus:border-accent h-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {isLoading ? (
          <div className="text-muted-foreground py-8">Loading squads...</div>
        ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSquads.map((squad, index) => {
            const techStack = squad.stack
              ? squad.stack.split(",").map((s) => s.trim()).filter(Boolean)
              : [];
            const leaderName = squad.leader_name ?? "—";
            return (
            <Link
              key={squad.id}
              href={`/squads/${squad.id}`}
              className="block h-full"
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{
                  scale: 1.03,
                  transition: { duration: 0.2 },
                }}
                transition={{ delay: index * 0.05 }}
                className="h-full"
              >
                <Card className="h-full border-none shadow-card hover:shadow-xl transition-all duration-300 bg-card/80 backdrop-blur-sm group cursor-pointer overflow-hidden relative">
                  <div className="absolute inset-0 bg-accent/0 group-hover:bg-accent/5 transition-colors duration-300 z-0" />

                  <CardHeader className="pb-3 relative z-10">
                    <div className="flex justify-end items-start mb-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 -mr-2 text-muted-foreground hover:text-foreground"
                        asChild
                        onClick={(e) => {
                          e.stopPropagation();
                        }}
                      >
                        <Link href={`/squads/${squad.id}/edit`}>
                          <Edit className="w-4 h-4" />
                        </Link>
                      </Button>
                    </div>

                    <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors line-clamp-1 min-h-[40px]">
                      {squad.name}
                    </h3>
                  </CardHeader>

                  <CardContent className="pb-3 space-y-4 relative z-10">
                    <div className="flex flex-wrap gap-1.5">
                      {techStack.slice(0, 3).map((tech) => (
                        <span
                          key={tech}
                          className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-muted text-foreground/80 border border-border/50 group-hover:border-accent/30 transition-colors"
                        >
                          {tech}
                        </span>
                      ))}
                      {techStack.length > 3 && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-muted text-foreground/80 border border-border/50">
                          +{techStack.length - 3}
                        </span>
                      )}
                    </div>
                  </CardContent>

                  <CardFooter className="pt-3 border-t border-border/40 flex justify-between items-center bg-background/40 relative z-10">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6 border border-background shadow-sm">
                        <AvatarFallback>
                          {leaderName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-xs font-medium text-foreground/80">
                        Lead:{" "}
                        <span className="text-foreground">
                          {leaderName.split(" ")[0] || "—"}
                        </span>
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                      <Users className="w-3.5 h-3.5" />
                      <span>{squad.member_count}</span>
                    </div>
                  </CardFooter>
                </Card>
              </motion.div>
            </Link>
            );
          })}

          <Link href="/squads/create" className="block h-full">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{
                scale: 1.03,
                transition: { duration: 0.2 },
              }}
              transition={{ delay: 0.3 }}
              className="h-full min-h-[300px] rounded-xl border-2 border-dashed border-muted-foreground/20 hover:border-accent hover:bg-accent/5 transition-all duration-300 cursor-pointer flex flex-col items-center justify-center text-center p-6 group bg-card/30"
            >
              <div className="w-12 h-12 rounded-full bg-muted group-hover:bg-accent/20 flex items-center justify-center mb-4 transition-colors">
                <Plus className="w-6 h-6 text-muted-foreground group-hover:text-accent-foreground" />
              </div>
              <h3 className="font-semibold text-lg text-foreground group-hover:text-accent-foreground mb-1">
                Create New Squad
              </h3>
              <p className="text-sm text-foreground/70 max-w-[200px]">
                Start a new cross-functional team for your next initiative.
              </p>
            </motion.div>
          </Link>
        </div>
        )}
      </main>
    </div>
  );
}
