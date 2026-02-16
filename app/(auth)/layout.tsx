"use client";

import { useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import { fadeInUpVariants, fadeInVariants } from "@/lib/animations-settings";
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
    <div className="flex w-full min-h-screen p-2">
      <motion.div
        variants={fadeInVariants}
        initial="initial"
        animate="animate"
        className="relative hidden items-center justify-center overflow-hidden rounded-none sm:rounded-2xl lg:flex lg:w-[40%] flex-col "
      >
        <Image
          src="/VERT_athena.avif"
          alt="background"
          width={600}
          height={800}
          className="inset-0 object-contain w-[60%] scale-150"
          priority
        />

        <motion.div
          variants={fadeInUpVariants}
          initial="initial"
          animate="animate"
          transition={{ delay: 0.3 }}
          className="absolute left-1/2 -translate-x-1/2 top-20"
        >
          <h1 className="font-sans mb-2 text-4xl font-medium text-primary-foreground text-center leading-relaxed">
            Welcome to{"   "}
            <span className="font-serif italic text-6xl ml-1">Athena</span>
          </h1>
        </motion.div>
      </motion.div>

      <main className="w-full flex flex-col gap-4 items-center justify-center lg:w-[60%] rounded-r-2xl">
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
      </main>
    </div>
  );
}
