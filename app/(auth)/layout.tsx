"use client";

import { useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import { fadeInVariants } from "@/lib/animations-settings";
import { useAuth } from "@/contexts/auth-context";

const guardsDisabled =
  process.env.NEXT_PUBLIC_DISABLE_AUTH_GUARDS === "true";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    if (!guardsDisabled && user) {
      router.push("/dashboard");
    }
  }, [user, router]);

  return (
    <div className="flex w-full min-h-screen items-center justify-center p-2">
      <motion.main
        variants={fadeInVariants}
        initial="initial"
        animate="animate"
        className="w-full flex flex-col gap-4 items-center justify-center max-w-md"
      >
        <div>
          <Image
            src="/athena.avif"
            alt="athena hq"
            width={160}
            height={160}
            className="w-40 h-40 object-cover"
            priority
          />
        </div>
        <Suspense fallback={null}>
          {children}
        </Suspense>
      </motion.main>
    </div>
  );
}
