"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { PlusIcon } from "lucide-react";
import { InviteForm } from "@/components/invitation/invite_form";
import { PendingInvitations } from "@/components/invitation/pending_invitations";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { fadeInVariants } from "@/lib/animations-settings";
import { useCurrentUserRole } from "@/hooks/useCurrentUserRole";

export default function InvitePage() {
  const router = useRouter();
  const [isInviteDrawerOpen, setInviteDrawerOpen] = useState(false);
  const { canInviteEmployees, isLoading } = useCurrentUserRole();

  useEffect(() => {
    if (!isLoading && !canInviteEmployees) {
      router.replace("/dashboard");
    }
  }, [canInviteEmployees, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px] text-muted-foreground">
        Loading...
      </div>
    );
  }

  if (!canInviteEmployees) {
    return null;
  }

  return (
    <motion.div
      variants={fadeInVariants}
      initial="initial"
      animate="animate"
      className="flex flex-col gap-6 w-full"
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold mb-2">Invite New Team Member</h1>
          <p className="text-muted-foreground">
            Add new people to your team and manage pending invitations.
          </p>
        </div>
        <Button onClick={() => setInviteDrawerOpen(true)}>
          <PlusIcon className="h-4 w-4 mr-2" />
          Send Invite
        </Button>
      </div>

      <PendingInvitations />

      <Sheet open={isInviteDrawerOpen} onOpenChange={setInviteDrawerOpen}>
        <SheetContent side="right" className="w-full sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Send Invite</SheetTitle>
            <SheetDescription>
              Invite a new teammate by email and role.
            </SheetDescription>
          </SheetHeader>
          <InviteForm onSuccess={() => setInviteDrawerOpen(false)} />
        </SheetContent>
      </Sheet>
    </motion.div>
  );
}
