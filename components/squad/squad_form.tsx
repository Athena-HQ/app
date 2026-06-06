import Link from "next/link";
import {
  Users,
  Crown,
  Puzzle,
  ArrowLeft,
  Check,
  Loader2,
  Trash2,
} from "lucide-react";
import { Controller } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { FormError } from "@/components/form_error";
import { RoleBuilder } from "@/components/squad/role_builder";
import type { RoleDefinition } from "@/components/squad/role_builder";
import { TechStackSelect } from "@/components/squad/tech_stack_select";
import { UserSelect } from "@/components/squad/user_select";
import { MemberAllocator } from "@/components/squad/member_allocator";
import { SquadPreview } from "@/components/squad/preview_card";
import type { UseFormReturn } from "react-hook-form";
import type { SquadFormValues } from "@/hooks/useSquadCreate";

interface SquadFormProps {
  form: UseFormReturn<SquadFormValues>;
  onSubmit: (data: SquadFormValues) => void;
  isSubmitting: boolean;
  isEditing: boolean;
  roleDefinitions: readonly RoleDefinition[];
  roleColors: Record<string, string>;
}

export type { SquadFormProps };

export function SquadForm({
  form,
  onSubmit,
  isSubmitting,
  isEditing,
  roleDefinitions,
  roleColors,
}: SquadFormProps) {
  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = form;
  const values = watch();

  return (
    <div className="min-h-screen pb-24">
      <header className="bg-background/50 backdrop-blur-md border-b border-border sticky top-0 z-40">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-foreground/60">
            <Link
              href="/dashboard"
              className="hover:text-foreground cursor-pointer"
            >
              Dashboard
            </Link>
            <span>/</span>
            <Link
              href="/squads"
              className="hover:text-foreground cursor-pointer"
            >
              Squads
            </Link>
            <span>/</span>
            <span className="text-foreground font-medium">
              {isEditing ? "Edit Squad" : "Create Squad"}
            </span>
          </div>

          {isEditing && (
            <Button
              variant="ghost"
              size="sm"
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Squad
            </Button>
          )}
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            {isEditing ? "Edit Squad" : "Create New Squad"}
          </h1>
          <p className="text-muted-foreground mt-2">
            {isEditing
              ? "Update team details, roles, and composition."
              : "Build a cross-functional team for your next big project."}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7 space-y-8">
            <form
              id="squad-form"
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-8"
            >
              <section className="space-y-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2">
                    <Users className="w-5 h-5 text-primary" />
                  </div>
                  <h2 className="text-xl font-semibold text-foreground">
                    Squad Basics
                  </h2>
                </div>

                <Card className="border-none shadow-card bg-card/80 backdrop-blur-sm">
                  <CardContent className="pt-6">
                    <div className="grid gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="squadName">Squad Name</Label>
                        <Input
                          id="squadName"
                          placeholder="e.g., Mobile App Alpha Team"
                          className="h-12 bg-background/50"
                          aria-invalid={Boolean(errors.squadName)}
                          {...register("squadName")}
                        />
                        <FormError message={errors.squadName?.message} />
                      </div>

                      <Controller
                        name="techStack"
                        control={control}
                        render={({ field }) => (
                          <div className="space-y-2">
                            <Label>Project / Technology Stack</Label>
                            <TechStackSelect
                              value={field.value}
                              onChange={field.onChange}
                            />
                            <FormError message={errors.techStack?.message} />
                          </div>
                        )}
                      />

                      <div className="space-y-2">
                        <Label htmlFor="squadDescription">Squad Mission</Label>
                        <Textarea
                          id="squadDescription"
                          placeholder="Describe the squad's goals and objectives..."
                          className="min-h-[120px] resize-none bg-background/50"
                          {...register("squadDescription")}
                        />
                        <p className="text-xs text-foreground/70 text-right">
                          {values.squadDescription?.length || 0}/500 characters
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </section>

              <section className="space-y-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2">
                    <Crown className="w-5 h-5 text-primary" />
                  </div>
                  <h2 className="text-xl font-semibold text-foreground">
                    Squad Leadership
                  </h2>
                </div>

                <Card className="border-none shadow-card bg-card/80 backdrop-blur-sm">
                  <CardContent className="pt-6">
                    <Controller
                      name="squadLeader"
                      control={control}
                      render={({ field }) => (
                        <div className="space-y-2">
                          <Label>Squad Lead / Tech Lead</Label>
                          <UserSelect
                            value={field.value}
                            onChange={field.onChange}
                          />
                          <FormError message={errors.squadLeader?.message} />
                        </div>
                      )}
                    />
                  </CardContent>
                </Card>
              </section>

              <section className="space-y-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2">
                    <Puzzle className="w-5 h-5 text-primary" />
                  </div>
                  <h2 className="text-xl font-semibold text-foreground">
                    Team Composition
                  </h2>
                </div>

                <Card className="border-none shadow-card bg-card/80 backdrop-blur-sm">
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <Label>Required Roles</Label>
                      <p className="text-sm text-foreground/70 mb-4">
                        Define the structure of your squad by adding role slots.
                      </p>

                      <Controller
                        name="roles"
                        control={control}
                        render={({ field }) => (
                          <RoleBuilder
                            value={field.value}
                            onChange={field.onChange}
                            roleDefinitions={roleDefinitions}
                          />
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>
              </section>

              <section className="space-y-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2">
                    <Users className="w-5 h-5 text-primary" />
                  </div>
                  <h2 className="text-xl font-semibold text-foreground">
                    Allocate Members
                  </h2>
                </div>

                <Card className="border-none shadow-card bg-card/80 backdrop-blur-sm">
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <Label>Staff the Squad (Manual Allocation)</Label>
                      <p className="text-sm text-foreground/70 mb-4">
                        Manually select members to fill the roles you&apos;ve defined.
                      </p>

                      <Controller
                        name="members"
                        control={control}
                        render={({ field }) => (
                          <MemberAllocator
                            roles={values.roles}
                            members={field.value}
                            onChange={field.onChange}
                            techStack={values.techStack}
                            squadDescription={values.squadDescription}
                          />
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>
              </section>


            </form>
          </div>

          <div className="hidden lg:block lg:col-span-5">
            <SquadPreview values={values} roleColors={roleColors} />
          </div>
        </div>
      </main>

      <div className="fixed bottom-0 left-0 right-0 bg-card/80 backdrop-blur-xl border-t border-border z-50 py-4 shadow-lg">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <Button
            variant="ghost"
            className="text-muted-foreground hover:text-foreground"
            asChild
          >
            <Link href="/dashboard">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Cancel
            </Link>
          </Button>

          <div className="flex items-center gap-3">
            <Button
              type="submit"
              form="squad-form"
              disabled={isSubmitting}
              className="bg-primary hover:bg-primary/90 text-primary-foreground min-w-[140px]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {isEditing ? "Updating..." : "Creating..."}
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  {isEditing ? "Update Squad" : "Create Squad"}
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
