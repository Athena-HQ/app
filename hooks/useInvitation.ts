import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  invitationService,
  invitationResponseToInvitation,
  type InvitationFormData,
  type Invitation,
  type InvitationStatus,
  type InvitationRole,
} from "@/services/invitation";
import { getCompanies } from "@/services/company";
import {
  invitationFormSchema,
  type InvitationFormValues,
} from "@/lib/validations/invitation";
import type { QueryClient } from "@tanstack/react-query";

async function resolveCompanyId(queryClient: QueryClient): Promise<number> {
  const invitations = await queryClient.fetchQuery({
    queryKey: ["invitations"],
    queryFn: () => invitationService.getInvitations(),
  });
  const fromInvitation = invitations[0]?.company;
  if (fromInvitation != null) return fromInvitation;
  const companies = await getCompanies();
  const firstCompany = companies[0];
  if (firstCompany == null) {
    throw new Error("Company not found. Please complete company setup first.");
  }
  return firstCompany.id;
}

export const useInvitations = () => {
  const { data: raw = [], isLoading } = useQuery({
    queryKey: ["invitations"],
    queryFn: () => invitationService.getInvitations(),
  });
  const invitations = raw.map(invitationResponseToInvitation);

  return { invitations, isLoading };
};

export const useInvitationForm = () => {
  const queryClient = useQueryClient();

  const sendInvitationMutation = useMutation({
    mutationFn: async (data: InvitationFormData) => {
      const companyId = await resolveCompanyId(queryClient);
      return invitationService.sendInvitation(data, companyId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invitations"] });
      toast.success("Invitation sent successfully");
    },
    onError: () => {
      toast.error("Failed to send invitation");
    },
  });

  const form = useForm<InvitationFormValues>({
    resolver: zodResolver(invitationFormSchema),
    defaultValues: {
      email: "",
      role: "" as InvitationRole,
    },
  });

  const onSubmit = async (data: InvitationFormValues) => {
    await sendInvitationMutation.mutateAsync({
      email: data.email,
      role: data.role as InvitationRole,
    });
    form.reset();
  };

  return {
    form,
    onSubmit,
    isSubmitting: sendInvitationMutation.isPending,
  };
};

export const useInvitationActions = () => {
  const queryClient = useQueryClient();

  const resendMutation = useMutation({
    mutationFn: (id: string) => invitationService.resendInvitation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invitations"] });
      toast.success("Invitation resent successfully");
    },
    onError: () => {
      toast.error("Failed to resend invitation");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => invitationService.deleteInvitation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invitations"] });
      toast.success("Invitation deleted successfully");
    },
    onError: () => {
      toast.error("Failed to delete invitation");
    },
  });

  const bulkInviteMutation = useMutation({
    mutationFn: async (invitations: InvitationFormData[]) => {
      const companyId = await resolveCompanyId(queryClient);
      return invitationService.bulkInvite(invitations, companyId);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["invitations"] });
      toast.success(`${data.length} invitations sent successfully`);
    },
    onError: () => {
      toast.error("Failed to send bulk invitations");
    },
  });

  return {
    resendInvitation: resendMutation.mutate,
    deleteInvitation: deleteMutation.mutate,
    bulkInvite: bulkInviteMutation.mutateAsync,
    isResending: resendMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isBulkInviting: bulkInviteMutation.isPending,
  };
};

export const useInvitationFilters = (invitations: Invitation[]) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<InvitationRole | "all">("all");
  const [statusFilter, setStatusFilter] = useState<InvitationStatus | "all">(
    "all"
  );

  const filteredInvitations = invitations.filter((invitation) => {
    const matchesSearch = invitation.email
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesRole =
      roleFilter === "all" || invitation.role === roleFilter;
    const matchesStatus =
      statusFilter === "all" || invitation.status === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  return {
    searchQuery,
    setSearchQuery,
    roleFilter,
    setRoleFilter,
    statusFilter,
    setStatusFilter,
    filteredInvitations,
  };
};
