import { useMemo, useState } from "react";
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
import {
  invitationFormSchema,
  type InvitationFormValues,
} from "@/lib/validations/invitation";

import { useCurrentAppUser } from "./useCurrentAppUser";

export const useInvitations = () => {
  const { data: raw = [], isLoading } = useQuery({
    queryKey: ["invitations"],
    queryFn: () => invitationService.getInvitations(),
  });
  
  const invitations = useMemo(
    () => raw.map(invitationResponseToInvitation),
    [raw]
  );

  return { invitations, isLoading };
};

export const useInvitationForm = () => {
  const queryClient = useQueryClient();
  const { appUser } = useCurrentAppUser();

  const sendInvitationMutation = useMutation({
    mutationFn: async (data: InvitationFormData) => {
      const companyId = appUser?.raw?.company;
      if (!companyId) throw new Error("Company not found. Please complete company setup first.");
      return invitationService.sendInvitation(data, companyId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invitations"] });
      toast.success("Invitation sent successfully");
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Failed to send invitation");
    },
  });

  const form = useForm<InvitationFormValues>({
    resolver: zodResolver(invitationFormSchema),
    defaultValues: {
      email: "",
      role: "" as InvitationRole,
    },
  });

  const onSubmit = async (data: InvitationFormValues): Promise<boolean> => {
    try {
      await sendInvitationMutation.mutateAsync({
        email: data.email,
        role: data.role as InvitationRole,
      });
      form.reset();
      return true;
    } catch {
      return false;
    }
  };

  return {
    form,
    onSubmit,
    isSubmitting: sendInvitationMutation.isPending,
  };
};

export const useInvitationActions = () => {
  const queryClient = useQueryClient();
  const { appUser } = useCurrentAppUser();

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
      const companyId = appUser?.raw?.company;
      if (!companyId) throw new Error("Company not found. Please complete company setup first.");
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

  const filteredInvitations = useMemo(() => {
    return invitations.filter((invitation) => {
      const matchesSearch = invitation.email
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesRole =
        roleFilter === "all" || invitation.role === roleFilter;
      const matchesStatus =
        statusFilter === "all" || invitation.status === statusFilter;

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [invitations, searchQuery, roleFilter, statusFilter]);

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
