"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Building2,
  Globe,
  MapPin,
  ShieldCheck,
  AlertTriangle,
  Copy,
  Check,
  Pencil,
  ChevronRight,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { updateCompany, type CompanyResponse, type AppUserResponse } from "@/services/company";
import {
  transferOwnership,
  archiveCompany,
  deleteCompany,
} from "@/services/settings";
import { SaveBar } from "./SaveBar";

// ─── Schema ──────────────────────────────────────────────────────────────────

const companySchema = z.object({
  name: z.string().min(1, "Company name is required"),
  domain: z.string().optional(),
  phone: z.string().optional(),
  postalCode: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  size: z.string().optional(),
});

type CompanyFormValues = z.infer<typeof companySchema>;

// ─── Shared sub-components ────────────────────────────────────────────────────

function SectionHeader({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType;
  title: string;
  description?: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
        <Icon size={18} />
      </div>
      <div className="flex flex-col gap-0.5">
        <h2 className="text-base font-semibold leading-tight">{title}</h2>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
      </div>
    </div>
  );
}

function FieldRow({
  label,
  hint,
  required,
  children,
  htmlFor,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
  htmlFor?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={htmlFor}
        className="text-xs uppercase tracking-wide text-muted-foreground font-medium"
      >
        {label}
        {required && <span className="text-destructive ml-0.5">*</span>}
      </label>
      {children}
      {hint && <p className="text-[11px] text-muted-foreground leading-snug">{hint}</p>}
    </div>
  );
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface CompanyInfoTabProps {
  company: CompanyResponse;
  employees: AppUserResponse[];
}

// ─── Component ────────────────────────────────────────────────────────────────

export function CompanyInfoTab({ company, employees }: CompanyInfoTabProps) {
  const queryClient = useQueryClient();
  const router = useRouter();

  const [copied, setCopied] = useState(false);
  const [transferOpen, setTransferOpen] = useState(false);
  const [archiveOpen, setArchiveOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [selectedTransferEmployee, setSelectedTransferEmployee] =
    useState<AppUserResponse | null>(null);

  const managerObj =
    company.company_manager ??
    employees.find((e) => e.role?.toLowerCase() === "company manager");

  const managerName = managerObj
    ? `${managerObj.first_name ?? ""} ${managerObj.last_name ?? ""}`.trim() ||
      managerObj.email
    : null;
  const managerInitials = managerObj
    ? (
        (managerObj.first_name?.[0] ?? "") + (managerObj.last_name?.[0] ?? "")
      ).toUpperCase() || "?"
    : "?";

  const {
    register,
    handleSubmit,
    reset,
    formState: { isDirty, isSubmitting, errors },
  } = useForm<CompanyFormValues>({
    resolver: zodResolver(companySchema),
    defaultValues: {
      name: company.name ?? "",
      domain: company.domain ?? "",
      phone: company.phone_number ?? "",
      postalCode: company.postal_code ?? "",
      city: company.city ?? "",
      country: company.country ?? "",
      size: company.company_size ?? "",
    },
  });

  const { mutateAsync: save } = useMutation({
    mutationFn: (values: CompanyFormValues) =>
      updateCompany(company.id, {
        name: values.name,
        company_size: values.size,
        phone_number: values.phone,
        country: values.country,
        city: values.city,
        postal_code: values.postalCode,
        domain: values.domain,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["company"] });
      toast.success("Company info saved");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to save company info");
    },
  });

  const { mutateAsync: doTransfer, isPending: transferring } = useMutation({
    mutationFn: (newManagerId: number) =>
      transferOwnership(company.id, newManagerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["company"] });
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      toast.success("Ownership transferred successfully");
      setTransferOpen(false);
      setSelectedTransferEmployee(null);
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to transfer ownership");
    },
  });

  const { mutateAsync: doArchive, isPending: archiving } = useMutation({
    mutationFn: () => archiveCompany(company.id),
    onSuccess: () => {
      toast.success("Company archived");
      setArchiveOpen(false);
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to archive company");
    },
  });

  const { mutateAsync: doDelete, isPending: deleting } = useMutation({
    mutationFn: () => deleteCompany(company.id),
    onSuccess: () => {
      setDeleteOpen(false);
      router.push("/company-deleted");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to delete company");
    },
  });

  const onSubmit = async (values: CompanyFormValues) => {
    await save(values);
    reset(values);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(company.identifier ?? "");
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const nonManagerEmployees = employees.filter(
    (e) => e.role?.toLowerCase() !== "company manager"
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6 w-full">
      {/* Identity */}
      <Card>
        <CardHeader>
          <SectionHeader
            icon={Building2}
            title="Company Identity"
            description="Public-facing company information, visible on employee invites and the Company overview."
          />
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FieldRow label="Company name" required htmlFor="c-name">
              <Input
                id="c-name"
                {...register("name")}
                className={cn(errors.name && "border-destructive")}
              />
              {errors.name && (
                <p className="text-[11px] text-destructive">{errors.name.message}</p>
              )}
            </FieldRow>

            <FieldRow label="Company ID" hint="Auto-generated — read only">
              <div className="flex gap-2 items-center">
                <Input
                  readOnly
                  value={company.identifier ?? ""}
                  className="font-mono text-xs bg-muted/40"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={handleCopy}
                  className="shrink-0"
                  aria-label="Copy company ID"
                >
                  {copied ? (
                    <Check size={14} className="text-primary" />
                  ) : (
                    <Copy size={14} />
                  )}
                </Button>
              </div>
            </FieldRow>
          </div>
        </CardContent>
      </Card>

      {/* Web & Contact */}
      <Card>
        <CardHeader>
          <SectionHeader
            icon={Globe}
            title="Web & contact"
            description="How the outside world reaches you."
          />
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FieldRow label="Domain">
            <div className="flex rounded-md overflow-hidden border border-input shadow-xs">
              <span className="flex items-center px-3 text-xs text-muted-foreground bg-muted/60 border-r border-input font-mono">
                www.
              </span>
              <input
                {...register("domain")}
                className="flex-1 px-3 text-sm bg-transparent outline-none h-9"
                placeholder="athenalabs.co"
              />
            </div>
          </FieldRow>

          <FieldRow label="Phone">
            <Input
              {...register("phone")}
              className="font-mono"
              placeholder="+1 (415) 555-0119"
            />
          </FieldRow>
        </CardContent>
      </Card>

      {/* Location & Size */}
      <Card>
        <CardHeader>
          <SectionHeader
            icon={MapPin}
            title="Location & size"
            description="Where the company is registered and how many people work here."
          />
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-6 gap-4">
          <div className="sm:col-span-2">
            <FieldRow label="Postal code">
              <Input {...register("postalCode")} className="font-mono" />
            </FieldRow>
          </div>
          <div className="sm:col-span-2">
            <FieldRow label="City">
              <Input {...register("city")} />
            </FieldRow>
          </div>
          <div className="sm:col-span-2">
            <FieldRow label="Country">
              <Input {...register("country")} />
            </FieldRow>
          </div>
          <div className="sm:col-span-2">
            <FieldRow label="Company size">
              <select
                {...register("size")}
                className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-xs"
              >
                <option value="2-10">2-10</option>
                <option value="11-50">11-50</option>
                <option value="51-200">51-200</option>
                <option value="201-500">201-500</option>
              </select>
            </FieldRow>
          </div>
        </CardContent>
      </Card>

      {/* Manager card */}
      <Card className="bg-primary/5 border-primary/20">
        <CardHeader>
          <SectionHeader
            icon={ShieldCheck}
            title="Company manager"
            description="Primary admin with full control over company settings, billing and invitations."
          />
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-4">
              <Avatar className="h-14 w-14 border-2 border-primary/20 bg-background">
                <AvatarFallback className="text-lg font-semibold text-primary">
                  {managerInitials}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col min-w-0">
                <p className="font-serif text-lg leading-none font-medium">
                  {managerName ?? "No manager assigned"}
                </p>
                {managerObj?.email && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {managerObj.email}
                  </p>
                )}
                <div className="flex items-center gap-2 mt-2">
                  <Badge
                    variant="outline"
                    className="border-primary/30 text-primary bg-primary/5"
                  >
                    Company Manager
                  </Badge>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              {managerObj?.id && (
                <Link href={`/employees/${managerObj.id}`}>
                  <Button type="button" variant="outline" size="sm">
                    <Pencil size={14} /> View profile
                  </Button>
                </Link>
              )}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setTransferOpen(true)}
              >
                Transfer ownership
                <ChevronRight size={14} />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Danger zone */}
      <Card className="border-destructive/30">
        <CardHeader>
          <SectionHeader
            icon={AlertTriangle}
            title="Danger zone"
            description="Irreversible and destructive actions."
          />
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-4 p-4 rounded-lg border border-destructive/30 bg-destructive/5">
            <div>
              <p className="text-sm font-semibold">Archive company</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Pause all access and invitations. Tasks are preserved and can be restored.
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive"
              onClick={() => setArchiveOpen(true)}
            >
              Archive
            </Button>
          </div>

          <div className="flex items-center justify-between gap-4 p-4 rounded-lg border border-destructive/40 bg-destructive/5">
            <div>
              <p className="text-sm font-semibold text-destructive">Delete company</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Permanently remove the company, all squads, employees and tasks. This cannot
                be undone.
              </p>
            </div>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={() => setDeleteOpen(true)}
            >
              <Trash2 size={14} /> Delete
            </Button>
          </div>
        </CardContent>
      </Card>

      <SaveBar
        isDirty={isDirty}
        isSubmitting={isSubmitting}
        onDiscard={() => reset()}
      />

      {/* Transfer ownership dialog */}
      <Dialog
        open={transferOpen}
        onOpenChange={(open) => {
          setTransferOpen(open);
          if (!open) setSelectedTransferEmployee(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Transfer ownership</DialogTitle>
            <DialogDescription>
              Select an employee to become the new Company Manager. You will lose manager
              access immediately after confirming.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-2 max-h-60 overflow-y-auto py-1">
            {nonManagerEmployees.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No other employees to transfer to.
              </p>
            ) : (
              nonManagerEmployees.map((emp) => (
                <button
                  key={emp.id}
                  type="button"
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-lg border text-left transition-colors",
                    selectedTransferEmployee?.id === emp.id
                      ? "border-primary/40 bg-primary/5"
                      : "border-border hover:bg-muted/40"
                  )}
                  onClick={() => setSelectedTransferEmployee(emp)}
                >
                  <Avatar className="h-9 w-9 shrink-0">
                    <AvatarFallback className="text-sm font-semibold">
                      {(
                        emp.first_name?.[0] ?? emp.email?.[0] ?? "?"
                      ).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">
                      {`${emp.first_name ?? ""} ${emp.last_name ?? ""}`.trim() ||
                        emp.email}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {emp.role ?? emp.email}
                    </p>
                  </div>
                  {selectedTransferEmployee?.id === emp.id && (
                    <Check size={14} className="text-primary ml-auto shrink-0" />
                  )}
                </button>
              ))
            )}
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" size="sm">
                Cancel
              </Button>
            </DialogClose>
            <Button
              type="button"
              size="sm"
              disabled={!selectedTransferEmployee || transferring}
              onClick={() =>
                selectedTransferEmployee &&
                doTransfer(selectedTransferEmployee.id)
              }
            >
              {transferring ? "Transferring…" : "Confirm transfer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Archive dialog */}
      <Dialog open={archiveOpen} onOpenChange={setArchiveOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Archive company?</DialogTitle>
            <DialogDescription>
              This will pause all access and invitations. Tasks are preserved and the company
              can be restored by contacting support.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" size="sm">
                Cancel
              </Button>
            </DialogClose>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={archiving}
              className="border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive"
              onClick={() => doArchive()}
            >
              {archiving ? "Archiving…" : "Archive"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete dialog */}
      <Dialog
        open={deleteOpen}
        onOpenChange={(open) => {
          setDeleteOpen(open);
          if (!open) setDeleteConfirm("");
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-destructive">Delete company?</DialogTitle>
            <DialogDescription>
              This is irreversible. All squads, employees, and tasks will be permanently
              deleted. Type <strong>{company.name}</strong> below to confirm.
            </DialogDescription>
          </DialogHeader>
          <input
            className="placeholder:text-muted-foreground border-input w-full rounded-md border bg-transparent px-3 py-2 text-sm outline-none"
            placeholder={company.name}
            value={deleteConfirm}
            onChange={(e) => setDeleteConfirm(e.target.value)}
          />
          <DialogFooter>
            <DialogClose asChild>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setDeleteConfirm("")}
              >
                Cancel
              </Button>
            </DialogClose>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              disabled={deleteConfirm !== company.name || deleting}
              onClick={() => doDelete()}
            >
              <Trash2 size={14} />
              {deleting ? "Deleting…" : "Delete permanently"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </form>
  );
}
