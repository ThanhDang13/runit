import { useMutation } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { ArrowLeft, Loader2, Mail } from "lucide-react";
import { toast } from "sonner";

import { createForgotPasswordMutationOptions } from "@web/lib/tanstack/options/auth";

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
import { Label } from "@web/components/ui/label";
import { useState } from "react";
import z from "zod";

export const Route = createFileRoute("/_auth/forgot-password")({
  component: ForgotPasswordPage
});

type FormValues = {
  email: string;
};

const ForgotPasswordRequestBodySchema = z.object({
  email: z.email()
});

export function ForgotPasswordPage() {
  const [isSuccess, setIsSuccess] = useState(false);
  const navigate = useNavigate();

  const form = useForm<FormValues>({
    resolver: zodResolver(ForgotPasswordRequestBodySchema),
    defaultValues: {
      email: ""
    }
  });

  const mutation = useMutation({
    ...createForgotPasswordMutationOptions(),
    onSuccess: () => {
      toast.success("If the email exists, a PIN has been sent");
      setIsSuccess(true);
    },
    onError: () => {
      toast.error("Something went wrong");
    }
  });

  const onSubmit = (values: FormValues) => {
    mutation.mutate(values);
  };

  const email = form.watch("email");

  if (isSuccess) {
    return (
      <div className="from-background to-muted/20 flex min-h-screen items-center justify-center bg-linear-to-br p-4">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="space-y-2 text-center">
            <div className="mx-auto mb-2 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10">
              <Mail className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl font-bold">Check Your Email</CardTitle>
            <CardDescription className="text-base">
              If an account exists with{" "}
              <span className="text-foreground font-semibold">{email}</span>, you will receive a PIN
              to reset your password.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <div className="border-border bg-muted/50 rounded-lg border p-4">
              <p className="text-muted-foreground text-sm">
                Didn't receive the email? Check your spam folder or try again in a few minutes.
              </p>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-2">
            <Button variant="outline" className="w-full" onClick={() => setIsSuccess(false)}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>

            <Button
              className="w-full"
              onClick={() =>
                navigate({
                  to: "/reset-password",
                  search: { email }
                })
              }
            >
              Continue to Reset Password
            </Button>

            <Button variant="link" className="w-full" onClick={() => navigate({ to: "/login" })}>
              Return to Login
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="from-background to-muted/20 flex min-h-screen items-center justify-center bg-linear-to-br p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-2">
          <div className="text-muted-foreground flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => navigate({ to: "/login" })}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm">Back to Login</span>
          </div>

          <CardTitle className="text-2xl font-bold">Forgot Password?</CardTitle>
          <CardDescription>
            Enter your email address and we'll send you a PIN to reset your password.
          </CardDescription>
        </CardHeader>

        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="text-muted-foreground absolute top-3 left-3 h-4 w-4" />
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  className="pl-10"
                  disabled={mutation.isPending}
                  {...form.register("email")}
                />
              </div>
              {form.formState.errors.email && (
                <p className="text-sm text-red-500">{form.formState.errors.email.message}</p>
              )}
            </div>

            <div className="border-border bg-muted/50 rounded-lg border p-3">
              <p className="text-muted-foreground text-sm">
                For security reasons, we won't confirm whether this email is registered.
              </p>
            </div>
          </CardContent>

          <CardFooter className="pt-4">
            <Button type="submit" className="w-full" disabled={mutation.isPending}>
              {mutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending PIN...
                </>
              ) : (
                <>
                  <Mail className="mr-2 h-4 w-4" />
                  Send Reset PIN
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
