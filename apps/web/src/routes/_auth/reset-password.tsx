import { useMutation } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { createResetPasswordMutationOptions } from "@web/lib/tanstack/options/auth";
import { toast } from "sonner";
import z from "zod";
import { Checkbox } from "@web/components/ui/checkbox";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, KeyRound, Loader2, Lock } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@web/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@web/components/ui/card";
import { Input } from "@web/components/ui/input";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@web/components/ui/input-otp";
import { Label } from "@web/components/ui/label";

export const Route = createFileRoute("/_auth/reset-password")({
  validateSearch: z.object({
    email: z.email()
  }),
  component: ResetPasswordPage
});

const ResetPasswordFormSchema = z
  .object({
    email: z.email(),
    pin: z.string().length(6, "PIN must be 6 digits"),
    newPassword: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string()
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"]
  });

type ResetPasswordFormValues = z.infer<typeof ResetPasswordFormSchema>;

function ResetPasswordPage() {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const { email } = Route.useSearch();

  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(ResetPasswordFormSchema),
    defaultValues: {
      email,
      pin: "",
      newPassword: "",
      confirmPassword: ""
    }
  });

  const mutation = useMutation({
    ...createResetPasswordMutationOptions(),
    onSuccess: () => {
      toast.success("Password reset successfully");
      navigate({ to: "/login" });
    },
    onError: () => {
      toast.error("Invalid PIN or expired");
    }
  });

  const onSubmit = (values: ResetPasswordFormValues) => {
    mutation.mutate({
      email: values.email,
      pin: values.pin,
      newPassword: values.newPassword
    });
  };

  const { pin, newPassword, confirmPassword } = form.watch();

  const isPasswordValid = newPassword.length >= 8;
  const passwordsMatch = newPassword === confirmPassword;

  return (
    <div className="from-background to-muted/20 flex min-h-screen items-center justify-center bg-linear-to-br p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-2">
          <div className="text-muted-foreground flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => navigate({ to: "/forgot-password" })}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm">Back</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-primary/10 flex h-12 w-12 items-center justify-center rounded-full">
              <KeyRound className="text-primary h-6 w-6" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold">Reset Password</CardTitle>
              <CardDescription>Enter the PIN from your email</CardDescription>
            </div>
          </div>
        </CardHeader>

        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            {/* PIN */}
            <div className="space-y-2">
              <Label>Verification PIN</Label>
              <div className="flex justify-center">
                <InputOTP
                  maxLength={6}
                  value={pin}
                  onChange={(value) => form.setValue("pin", value)}
                >
                  <InputOTPGroup>
                    {Array.from({ length: 6 }).map((_, i) => (
                      <InputOTPSlot key={i} index={i} />
                    ))}
                  </InputOTPGroup>
                </InputOTP>
              </div>
              {form.formState.errors.pin && (
                <p className="text-center text-xs text-red-600">
                  {form.formState.errors.pin.message}
                </p>
              )}
            </div>

            {/* New Password */}
            <div className="space-y-2">
              <Label>New Password</Label>
              <div className="relative">
                <Lock className="text-muted-foreground absolute top-3 left-3 h-4 w-4" />
                <Input
                  type={showPassword ? "text" : "password"}
                  className="pl-10"
                  {...form.register("newPassword")}
                />
              </div>
              {form.formState.errors.newPassword && (
                <p className="text-xs text-red-600">{form.formState.errors.newPassword.message}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <Label>Confirm Password</Label>
              <div className="relative">
                <Lock className="text-muted-foreground absolute top-3 left-3 h-4 w-4" />
                <Input
                  type={showPassword ? "text" : "password"}
                  className="pl-10"
                  {...form.register("confirmPassword")}
                />
              </div>
              {form.formState.errors.confirmPassword && (
                <p className="text-xs text-red-600">
                  {form.formState.errors.confirmPassword.message}
                </p>
              )}
            </div>

            {/* Show Password */}
            <div className="flex items-center space-x-2">
              <Checkbox
                checked={showPassword}
                onCheckedChange={(checked) => setShowPassword(checked === true)}
              />
              <span className="text-muted-foreground text-sm">Show passwords</span>
            </div>

            {/* Requirements */}
            <div className="bg-muted/50 rounded-lg border p-3 text-xs">
              <ul className="list-inside list-disc space-y-1">
                <li className={isPasswordValid ? "text-green-600" : ""}>At least 8 characters</li>
                <li className={passwordsMatch ? "text-green-600" : ""}>Passwords match</li>
              </ul>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-2 pt-4">
            <Button type="submit" className="w-full" disabled={mutation.isPending}>
              {mutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Resetting Password...
                </>
              ) : (
                <>
                  <Lock className="mr-2 h-4 w-4" />
                  Reset Password
                </>
              )}
            </Button>

            <Button
              variant="link"
              className="text-sm"
              onClick={() => navigate({ to: "/forgot-password" })}
            >
              Didn’t receive the PIN? Request new one
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
