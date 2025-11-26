import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { InviteForm } from "@/components/invitation/invite_form";
import { PendingInvitations } from "@/components/invitation/pending_invitations";
import { fadeInVariants } from "@/lib/animations-settings";

export const Route = createFileRoute("/_main/invite")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="min-h-screen bg-background p-8">
      <motion.div
        variants={fadeInVariants}
        initial="initial"
        animate="animate"
        className="max-w-7xl mx-auto"
      >
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Invite New Team Member</h1>
          <p className="text-muted-foreground">
            Add new people to your team and manage pending invitations.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-2">
            <InviteForm />
          </div>

          <div className="lg:col-span-3">
            <PendingInvitations />
          </div>
        </div>
      </motion.div>
    </div>
  );
}
