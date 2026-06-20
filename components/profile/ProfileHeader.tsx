import type { EmployeeProfile } from "@/types/employee";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Github, Linkedin, Twitter, Globe, Calendar, Mail } from "lucide-react";
import { resolvePlatformFromUrl } from "@/components/settings/platform-registry";

interface ProfileHeaderProps {
    employee: EmployeeProfile;
}

export function ProfileHeader({ employee }: ProfileHeaderProps) {
    const { fullName, role, avatarUrl, department, joinDate, socialLinks, gamification } = employee;

    const xpProgress = (gamification.currentXp / gamification.xpToNextLevel) * 100;

    return (
        <Card className="border-none shadow-card bg-card/60 backdrop-blur-sm overflow-hidden mb-6">
            {/* <div className="h-32 bg-gradient-to-r from-blue-600/20 via-purple-500/20 to-pink-500/20" /> */}
            <CardContent className="relative py-8 px-6 sm:px-10">
                <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
                    {/* Avatar & Level */}
                    <div className="flex flex-col items-center gap-3 shrink-0">
                        <div className="relative">
                            <Avatar className="w-32 h-32 border-2 border-border/50 shadow-md">
                                <AvatarImage src={avatarUrl} alt={fullName} />
                                <AvatarFallback className="text-3xl">{fullName.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="absolute -bottom-1 -right-1 z-10 bg-background p-1 rounded-full shadow-sm">
                                <Badge className="px-2 py-0.5 text-xs font-bold border-amber-200 bg-amber-100 text-amber-800 hover:bg-amber-100 shadow-none">
                                    Lvl {gamification.levelNumber}
                                </Badge>
                            </div>
                        </div>

                        <div className="w-32 space-y-1.5 text-center">
                            <div className="flex justify-between text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                                <span>XP</span>
                                <span>{gamification.currentXp}</span>
                            </div>
                            <Progress value={xpProgress} className="h-2 bg-muted" indicatorClassName="bg-gradient-to-r from-amber-400 to-orange-500" />
                            <div className="text-[10px] text-muted-foreground text-right">{gamification.xpToNextLevel} to go</div>
                        </div>
                    </div>

                    {/* Info Section */}
                    <div className="flex-1 space-y-4 w-full text-center md:text-left">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <h1 className="text-3xl font-bold text-foreground">{fullName}</h1>
                                <div className="flex items-center gap-2 text-muted-foreground mt-1">
                                    <span className="font-medium text-foreground/80">{role}</span>
                                    <span>•</span>
                                    <span>{department}</span>
                                </div>
                            </div>

                            <div className="flex gap-2">
                                {socialLinks?.github && (
                                    <Button variant="ghost" size="icon" className="h-10 w-10 hover:text-[#333]" asChild>
                                        <a href={socialLinks.github} target="_blank" rel="noreferrer"><Github className="w-6 h-6" /></a>
                                    </Button>
                                )}
                                {socialLinks?.linkedin && (
                                    <Button variant="ghost" size="icon" className="h-10 w-10 hover:text-[#0077b5]" asChild>
                                        <a href={socialLinks.linkedin} target="_blank" rel="noreferrer"><Linkedin className="w-6 h-6" /></a>
                                    </Button>
                                )}
                                {socialLinks?.twitter && (
                                    <Button variant="ghost" size="icon" className="h-10 w-10 hover:text-[#1DA1F2]" asChild>
                                        <a href={socialLinks.twitter} target="_blank" rel="noreferrer"><Twitter className="w-6 h-6" /></a>
                                    </Button>
                                )}
                                {socialLinks?.website && (
                                    <Button variant="ghost" size="icon" className="h-10 w-10 text-muted-foreground hover:text-foreground" asChild>
                                        <a href={socialLinks.website} target="_blank" rel="noreferrer"><Globe className="w-6 h-6" /></a>
                                    </Button>
                                )}
                                {socialLinks?.extra?.map((link, idx) => {
                                    const resolved = resolvePlatformFromUrl(link.url);
                                    const Icon = resolved.Icon;
                                    return (
                                        <Button key={idx} variant="ghost" size="icon" className={`h-10 w-10 ${resolved.accentClass}`} asChild>
                                            <a href={link.url} target="_blank" rel="noreferrer"><Icon className="w-6 h-6" /></a>
                                        </Button>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                                <Mail className="w-4 h-4" />
                                {employee.email || "N/A"}
                            </div>
                            <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                Joined {new Date(joinDate).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
                            </div>
                        </div>

                        {employee.bio && (
                            <p className="text-foreground/80 max-w-3xl leading-relaxed text-sm bg-muted/30 p-3 rounded-lg border border-border/50">
                                {employee.bio}
                            </p>
                        )}

                        {employee.skills && employee.skills.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {employee.skills.map((sk) => (
                                    <span
                                        key={sk}
                                        className="inline-flex items-center px-2.5 py-1 rounded-full bg-violet-500/15 text-violet-300 border border-violet-500/30 text-xs font-medium"
                                    >
                                        {sk}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
