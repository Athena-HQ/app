import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Play,
  User,
  Users,
  ArrowRight,
} from "lucide-react";
import { useAssignableUsers } from "@/hooks/useCurrentAppUser";

interface CTAButtonProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
  search?: Record<string, string>;
  variant?: "default" | "secondary" | "outline";
  delay?: number;
}

function CTAButton({
  title,
  description,
  icon,
  href,
  search,
  variant = "default",
  delay = 0,
}: CTAButtonProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay }}
    >
      <Link href={search ? `${href}?${new URLSearchParams(search).toString()}` : href} className="block h-full">
        <Card className="h-full border-2 hover:border-primary/50 transition-all cursor-pointer group min-h-[160px]">
          <CardContent className="p-6 h-full flex flex-col justify-between">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
                  {title}
                </h3>
                <p className="text-sm text-muted-foreground">{description}</p>
              </div>
              <div
                className={`p-3 rounded-full ${
                  variant === "default"
                    ? "bg-primary/10 text-primary"
                    : variant === "secondary"
                    ? "bg-secondary"
                    : "bg-muted"
                } group-hover:scale-110 transition-transform`}
              >
                {icon}
              </div>
            </div>
            <Button
              variant={variant}
              className="mt-4 w-full group-hover:gap-2 transition-all"
              asChild
            >
              <span className="flex items-center justify-center gap-2">
                {title}
                <ArrowRight className="h-4 w-4" />
              </span>
            </Button>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
}

interface CTASectionProps {
  hasAssignedTasks: boolean;
  hasSquad: boolean;
  needsReviewCount: number;
}

export function CTASection({
  hasAssignedTasks,
  hasSquad,
  needsReviewCount,
}: CTASectionProps) {
  const { assignableUsers } = useAssignableUsers();
  const isManager = assignableUsers.length > 1;

  const ctas: CTAButtonProps[] = [];

  if (hasAssignedTasks) {
    ctas.push({
      title: "Start Next Task",
      description: "Continue your work and make progress",
      icon: <Play className="h-6 w-6" />,
      href: "/tasks",
      search: { status: "assigned" },
      variant: "default",
      delay: 0.1,
    });
  }

  ctas.push({
    title: "View My Profile",
    description: "See your stats, badges, and achievements",
    icon: <User className="h-6 w-6" />,
    href: "/profile",
    variant: "secondary",
    delay: 0.2,
  });

  if (hasSquad) {
    ctas.push({
      title: "View My Squad",
      description: "Check your squad's progress and collaborate",
      icon: <Users className="h-6 w-6" />,
      href: "/squads",
      variant: "outline",
      delay: 0.3,
    });
  }

  if (isManager && needsReviewCount > 0) {
    ctas.push({
      title: `Review Tasks (${needsReviewCount})`,
      description: `${needsReviewCount} task${
        needsReviewCount !== 1 ? "s" : ""
      } awaiting your review`,
      icon: <ArrowRight className="h-6 w-6" />,
      href: "/tasks",
      search: { status: "completed" },
      variant: "default",
      delay: 0.4,
    });
  }

  if (ctas.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-4">
      {ctas.map((cta, index) => (
        <CTAButton key={cta.title} {...cta} delay={cta.delay ?? index * 0.1} />
      ))}
    </div>
  );
}
