import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import {
  createChangePasswordMutationOptions,
  createProfileQueryOptions,
  createUpdateProfileMutationOptions
} from "@web/lib/tanstack/options/profile";
import { toast } from "sonner";
import z from "zod";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  User,
  Mail,
  Shield,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  CheckCircle2,
  AlertCircle
} from "lucide-react";

import { Button } from "@web/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@web/components/ui/card";
import { Input } from "@web/components/ui/input";
import { Label } from "@web/components/ui/label";
import { Separator } from "@web/components/ui/separator";
import { Badge } from "@web/components/ui/badge";
import { Alert, AlertDescription } from "@web/components/ui/alert";
import { ScrollArea } from "@web/components/ui/scroll-area";
import { AxiosError } from "axios";
import { Checkbox } from "@web/components/ui/checkbox";
import { useState } from "react";

export const Route = createFileRoute("/_u/profile")({
  component: ProfilePage
});

/* ---------------- schemas ---------------- */

const updateProfileSchema = z.object({
  name: z.string().min(1, "Name is required")
});

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(8),
    newPassword: z.string().min(8),
    confirmPassword: z.string().min(8)
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match"
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: "New password must be different from current password",
    path: ["newPassword"]
  });

/* ---------------- page ---------------- */

function ProfilePage() {
  const queryClient = useQueryClient();

  const profileQuery = useQuery(createProfileQueryOptions());
  const [showPassword, setShowPassword] = useState(false);

  const updateProfile = useMutation({
    ...createUpdateProfileMutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      toast.success("Profile updated");
    }
  });

  const changePassword = useMutation({
    ...createChangePasswordMutationOptions(),
    onSuccess: () => {
      toast.success("Password changed successfully");
      passwordForm.reset();
    },
    onError: (error) => {
      toast.error("Failed to change password");
      toast.error(error.message);
    }
  });

  const profileForm = useForm<z.infer<typeof updateProfileSchema>>({
    resolver: zodResolver(updateProfileSchema),
    values: { name: profileQuery.data?.name ?? "" }
  });

  const passwordForm = useForm<z.infer<typeof changePasswordSchema>>({
    resolver: zodResolver(changePasswordSchema)
  });

  if (profileQuery.isLoading) return <div className="p-6">Loading…</div>;
  if (profileQuery.isError) return <div className="p-6 text-red-500">Failed to load</div>;

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const profile = profileQuery.data!;
  const roleColor =
    profile.role === "admin"
      ? "bg-purple-500/10 text-purple-700 border-purple-500/20"
      : "bg-blue-500/10 text-blue-700 border-blue-500/20";

  return (
    <div className="from-background to-muted/20 h-full bg-linear-to-br px-4 py-10">
      <ScrollArea className="h-full">
        <div className="mx-auto max-w-4xl space-y-8">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Profile Settings</h1>
            <p className="text-muted-foreground">Manage your account settings and security</p>
          </div>

          {/* Profile Card */}
          <Card className="border-border/40 shadow-lg">
            <CardHeader className="flex flex-row items-center gap-3">
              <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-full">
                <User className="text-primary h-5 w-5" />
              </div>
              <div>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Update your personal details</CardDescription>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <Label className="text-muted-foreground text-xs uppercase">Email</Label>
                  <div className="bg-muted/30 mt-1 flex items-center gap-2 rounded-lg border p-3">
                    <Mail className="h-4 w-4" />
                    <span className="text-sm font-medium">{profile.email}</span>
                  </div>
                </div>

                <div>
                  <Label className="text-muted-foreground text-xs uppercase">Role</Label>
                  <div className="bg-muted/30 mt-1 flex items-center gap-2 rounded-lg border p-3">
                    <Shield className="h-4 w-4" />
                    <Badge variant="outline" className={roleColor}>
                      {profile.role.toUpperCase()}
                    </Badge>
                  </div>
                </div>
              </div>

              <Separator />

              <form
                onSubmit={profileForm.handleSubmit((v) => updateProfile.mutate(v))}
                className="space-y-4"
              >
                <div>
                  <Label>Full Name</Label>
                  <Input
                    {...profileForm.register("name", {
                      onChange: () => profileForm.clearErrors("name")
                    })}
                    className="h-11"
                  />
                  <p className="text-sm text-red-500">
                    {profileForm.formState.errors.name?.message}
                  </p>
                </div>

                <Button disabled={updateProfile.isPending}>
                  {updateProfile.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving…
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Change Password */}
          <Card className="border-border/40 shadow-lg">
            <CardHeader className="flex flex-row items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-500/10">
                <Lock className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <CardTitle>Change Password</CardTitle>
                <CardDescription>Keep your account secure</CardDescription>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              <form
                onSubmit={passwordForm.handleSubmit((v) =>
                  changePassword.mutate({
                    currentPassword: v.currentPassword,
                    newPassword: v.newPassword
                  })
                )}
                className="space-y-4"
              >
                {(["currentPassword", "newPassword", "confirmPassword"] as const).map((field) => (
                  <div key={field}>
                    <Label className="capitalize">{field.replace("Password", " Password")}</Label>
                    <Input
                      type={showPassword ? "text" : "password"}
                      className="h-11"
                      {...passwordForm.register(field, {
                        onChange: () => passwordForm.clearErrors(field)
                      })}
                    />
                    <p className="text-sm text-red-500">
                      {passwordForm.formState.errors[field]?.message}
                    </p>
                  </div>
                ))}

                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={showPassword}
                    onCheckedChange={(checked) => setShowPassword(checked === true)}
                  />
                  <span className="text-muted-foreground text-sm">Show passwords</span>
                </div>

                <Button disabled={changePassword.isPending}>
                  {changePassword.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Changing…
                    </>
                  ) : (
                    <>
                      <Lock className="mr-2 h-4 w-4" />
                      Change Password
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Security Tip */}
          <Alert className="border-blue-500/20 bg-blue-500/10">
            <AlertCircle className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-700">
              <strong>Security tip:</strong> Use a strong, unique password.
            </AlertDescription>
          </Alert>
        </div>
      </ScrollArea>
    </div>
  );
}
