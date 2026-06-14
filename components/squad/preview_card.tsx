"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { getEmployees } from "@/services/company";

interface SquadPreviewProps {
  values: {
    squadName: string;
    techStack: string[];
    squadLeader: string;
    roles: Record<string, number>;
  };
  roleColors: Record<string, string>;
}

export function SquadPreview({ values, roleColors }: SquadPreviewProps) {
  const { squadName, techStack, roles } = values;

  // Resolve the selected squad leader to a real employee (shares the
  // ["employees"] cache populated by UserSelect, so this is instant).
  const { data: employees = [], isLoading: leaderLoading } = useQuery({
    queryKey: ["employees"],
    queryFn: getEmployees,
  });
  const leader = values.squadLeader
    ? employees.find((e) => String(e.id) === values.squadLeader)
    : undefined;
  const leaderName = leader
    ? [leader.first_name, leader.last_name].filter(Boolean).join(" ").trim() ||
      leader.email
    : "";
  const leaderInitial = (leaderName || "L").charAt(0).toUpperCase();

  const totalMembers = Object.values(roles).reduce((a, b) => a + b, 0) + (values.squadLeader ? 1 : 0);

  // Prepare chart data
  const chartData = Object.entries(roles).map(([name, value]) => ({
    name,
    value,
    color: roleColors[name] || "#ccc"
  }));

  if (values.squadLeader) {
    chartData.push({ name: "Lead", value: 1, color: "#FFD666" }); // Accent color for lead
  }

  const hasData = totalMembers > 0;

  return (
    <div className="space-y-6 sticky top-[120px]">
      <Card className="border-none shadow-card overflow-hidden bg-card/80 backdrop-blur-sm">
        <CardHeader className="bg-muted/30 pb-4">
          <CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground flex justify-between items-center h-8">
            <span className="flex items-center">Squad Preview</span>
            <Badge variant="secondary" className="bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20">Live Update</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          {/* Header Info */}
          <div>
            <h3 className="text-2xl font-bold text-primary leading-tight">
              {squadName || <span className="text-muted-foreground/30 italic">Untitled Squad</span>}
            </h3>

            <div className="flex flex-wrap gap-2 mt-3 min-h-[32px]">
              {techStack.length > 0 ? (
                techStack.map(tech => (
                  <Badge key={tech} variant="outline" className="bg-background border-accent/40 shadow-sm">
                    {tech}
                  </Badge>
                ))
              ) : (
                <div className="text-sm text-muted-foreground/40 italic">No tech stack selected</div>
              )}
            </div>
          </div>

          <Separator />

          {/* Composition Chart */}
          <div className="flex items-center gap-4 h-[120px]">
            {hasData ? (
              <>
                <div className="h-[120px] w-[120px] flex-shrink-0 relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={35}
                        outerRadius={55}
                        paddingAngle={2}
                        dataKey="value"
                        stroke="none"
                      >
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                        itemStyle={{ fontSize: '12px', fontWeight: 500 }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
                    <span className="text-2xl font-bold text-foreground">{totalMembers}</span>
                  </div>
                </div>

                <div className="flex-1 space-y-1.5 overflow-y-auto max-h-[120px] pr-2 scrollbar-thin">
                  {chartData.map((item) => (
                    <div key={item.name} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="text-foreground/80">{item.name}</span>
                      </div>
                      <span className="font-medium">{item.value}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-foreground/50 text-sm italic border-2 border-dashed border-muted rounded-xl">
                Add members to see composition
              </div>
            )}
          </div>

          {/* Leader Preview */}
          {values.squadLeader && (
            <div className="bg-muted/30 p-3 rounded-xl flex items-center gap-3 border border-border/50">
              <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
                {leader?.profile?.avatar_url && (
                  <AvatarImage src={leader.profile.avatar_url} alt={leaderName} />
                )}
                <AvatarFallback>{leaderInitial}</AvatarFallback>
              </Avatar>
              <div>
                <div className="text-xs text-foreground/70 uppercase font-semibold tracking-wide">Squad Lead</div>
                <div className="font-medium text-foreground">
                  {leaderName || (
                    <span className="text-muted-foreground/50 italic">
                      {leaderLoading ? "Loading…" : "Selected lead"}
                    </span>
                  )}
                </div>
                {leader?.role && (
                  <div className="text-xs text-muted-foreground capitalize">{leader.role}</div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

    </div>
  );
}
