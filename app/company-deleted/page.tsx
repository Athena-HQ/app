import Link from "next/link";
import { Trash2 } from "lucide-react";

export default function CompanyDeletedPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 text-center">
      <div className="flex flex-col items-center gap-6 max-w-md">
        <div className="p-4 rounded-full bg-destructive/10 text-destructive">
          <Trash2 size={40} />
        </div>

        <div className="flex flex-col gap-2">
          <h1 className="font-serif text-4xl font-semibold tracking-tight">
            Company deleted
          </h1>
          <p className="text-muted-foreground text-base leading-relaxed">
            Your company and all associated squads, employees, and tasks have been
            permanently deleted. This action cannot be undone.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mt-2">
          <Link
            href="/login"
            className="inline-flex items-center justify-center h-10 px-6 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            Back to login
          </Link>
          <Link
            href="/join"
            className="inline-flex items-center justify-center h-10 px-6 rounded-md border border-border bg-background text-sm font-medium hover:bg-muted transition-colors"
          >
            Create a new company
          </Link>
        </div>
      </div>
    </div>
  );
}
