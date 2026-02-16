"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { getApiBaseUrl } from "@/lib/api/api-util";

export default function EmailConfirmationPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const key = searchParams.get("key");
  const [status, setStatus] = useState<"verifying" | "redirecting">("verifying");

  useEffect(() => {
    if (!key) {
      router.replace("/login?status=error&message=missing_key");
      return;
    }

    const verify = async () => {
      const base = getApiBaseUrl().replace(/\/$/, "");
      const url = `${base}/authentication/verify/?key=${encodeURIComponent(key)}`;
      try {
        const response = await fetch(url, {
          method: "GET",
          credentials: "include",
          redirect: "follow",
        });
        const finalUrl = response.url;
        const parsed = new URL(finalUrl);
        const params = parsed.searchParams;
        const statusParam = params.get("status");
        const verified = params.get("verified");
        const message = params.get("message");
        const email = params.get("email");

        if (verified === "true" || statusParam === "success") {
          const query = new URLSearchParams({ verified: "true" });
          if (email) query.set("email", email);
          router.replace(`/login?${query.toString()}`);
        } else {
          const query = new URLSearchParams({ status: "error" });
          if (message) query.set("message", message);
          router.replace(`/login?${query.toString()}`);
        }
      } catch {
        router.replace("/login?status=error&message=confirmation_error");
      } finally {
        setStatus("redirecting");
      }
    };

    verify();
  }, [key, router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
      <Loader2 className="w-8 h-8 animate-spin" />
      <p className="text-muted-foreground">
        {status === "verifying"
          ? "Verifying your email…"
          : "Redirecting to login…"}
      </p>
    </div>
  );
}
