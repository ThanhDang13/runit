import { createFileRoute, Link, useSearch } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Button } from "@web/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@web/components/ui/card";
import { Alert, AlertDescription } from "@web/components/ui/alert";
import {
  createResendVerificationMutationOptions,
  createVerifyEmailMutationOptions
} from "@web/lib/tanstack/options/auth";
import { useMutation } from "@tanstack/react-query";
import { CheckCircle2, XCircle, Loader2, Mail, AlertCircle } from "lucide-react";
import z from "zod";
import { Label } from "@web/components/ui/label";
import { Input } from "@web/components/ui/input";

export const Route = createFileRoute("/_auth/verify-email")({
  component: VerifyEmailPage,
  validateSearch: (search) =>
    z
      .object({
        token: z.string().optional(),
        email: z.email().optional()
      })
      .parse(search)
});

export default function VerifyEmailPage() {
  const search = useSearch({ from: "/_auth/verify-email" });
  const token = search.token;
  const urlEmail = search.email;
  const hasVerifiedRef = useRef(false);

  // Form State
  const [resendEmail, setResendEmail] = useState(urlEmail || "");
  const [emailError, setEmailError] = useState("");

  // Mutations
  const verifyEmailMutation = useMutation(createVerifyEmailMutationOptions());
  const resendVerificationMutation = useMutation(createResendVerificationMutationOptions());

  // Derived UI States
  const isVerifying = verifyEmailMutation.isPending;
  const isResending = resendVerificationMutation.isPending;
  const isSuccess = verifyEmailMutation.isSuccess || resendVerificationMutation.isSuccess;

  // A token is invalid if it's missing or if the verification request explicitly failed
  const hasError = !token || verifyEmailMutation.isError || resendVerificationMutation.isError;

  // Derive the display message based on mutation states
  const statusMessage = (() => {
    if (isVerifying) return "Verifying your email address...";
    if (isResending) return "Sending a new verification link...";
    if (verifyEmailMutation.isSuccess)
      return verifyEmailMutation.data?.message || "Your email has been successfully verified!";
    if (resendVerificationMutation.isSuccess)
      return (
        resendVerificationMutation.data?.message ||
        "Verification email sent! Please check your inbox."
      );
    if (!token) return "Invalid or missing verification link. Please request a new one.";
    if (verifyEmailMutation.isError)
      return "Verification failed. The link may have expired or is already used.";
    if (resendVerificationMutation.isError)
      return "Failed to resend verification email. Please try again later.";
    return "Ready to verify";
  })();

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      setEmailError("Email is required");
      return false;
    }
    if (!emailRegex.test(email)) {
      setEmailError("Please enter a valid email address");
      return false;
    }
    setEmailError("");
    return true;
  };

  const handleResend = () => {
    if (!validateEmail(resendEmail)) return;
    resendVerificationMutation.mutate({ email: resendEmail });
  };

  useEffect(() => {
    if (!token || hasVerifiedRef.current) return;

    hasVerifiedRef.current = true;
    verifyEmailMutation.mutate({ token });
  }, [token, verifyEmailMutation]);

  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      {/* Left side - Branding/Info */}
      <div className="bg-muted hidden flex-col gap-4 p-10 lg:flex">
        <div className="flex flex-1 items-center justify-center">
          <div className="max-w-md space-y-6 text-center">
            <Mail className="text-primary mx-auto size-16" />
            <div className="space-y-2">
              <h1 className="text-3xl font-bold">Email Verification</h1>
              <p className="text-muted-foreground">
                We're verifying your email address to ensure the security of your account and enable
                all features.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Verification Content */}
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex flex-1 items-center justify-center">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="bg-muted mx-auto mb-4 flex size-16 items-center justify-center rounded-full">
                {isVerifying && <Loader2 className="text-primary size-8 animate-spin" />}

                {isSuccess && !isVerifying && <CheckCircle2 className="size-8 text-green-600" />}

                {hasError && !isVerifying && !isSuccess && (
                  <XCircle className="text-destructive size-8" />
                )}
              </div>

              <CardTitle className="text-2xl">
                {isVerifying && "Verifying Email"}
                {verifyEmailMutation.isSuccess && "Email Verified!"}
                {resendVerificationMutation.isSuccess && "Verification Sent"}
                {hasError && !isVerifying && !isSuccess && "Verification Failed"}
              </CardTitle>

              <CardDescription>
                {isVerifying && "Please wait while we confirm your details"}
                {verifyEmailMutation.isSuccess && "You can now access all platform features"}
                {resendVerificationMutation.isSuccess && "We've sent a new link to your inbox"}
                {hasError &&
                  !isVerifying &&
                  !isSuccess &&
                  "The verification link is invalid or expired"}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Dynamic Status Alert */}
              <Alert variant={hasError && !isSuccess ? "destructive" : "default"}>
                {hasError && !isSuccess ? (
                  <AlertCircle className="size-4" />
                ) : (
                  <Mail className="size-4" />
                )}
                <AlertDescription>{statusMessage}</AlertDescription>
              </Alert>

              {/* Resend Form - Only show on Error and when not currently loading */}
              {hasError && !isVerifying && !isSuccess && (
                <div className="space-y-3 pt-2">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={resendEmail}
                      onChange={(e) => {
                        setResendEmail(e.target.value);
                        setEmailError("");
                      }}
                      disabled={isResending}
                      className={emailError ? "border-destructive" : ""}
                    />
                    {emailError && <p className="text-destructive text-sm">{emailError}</p>}
                  </div>

                  <Button
                    variant="outline"
                    className="w-full"
                    size="lg"
                    onClick={handleResend}
                    disabled={isResending || !resendEmail}
                  >
                    {isResending ? (
                      <>
                        <Loader2 className="mr-2 size-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      "Resend Verification Email"
                    )}
                  </Button>
                </div>
              )}

              {/* Primary Action Button */}
              {!isVerifying && (
                <div className="space-y-2 pt-2">
                  <Link to="/login" className="block">
                    <Button
                      className="w-full"
                      size="lg"
                      variant={isSuccess ? "default" : "outline"}
                    >
                      {isSuccess ? "Continue to Login" : "Go to Login"}
                    </Button>
                  </Link>
                </div>
              )}

              {/* Help Text */}
              {(hasError || resendVerificationMutation.isSuccess) && (
                <div className="border-t pt-4">
                  <p className="text-muted-foreground text-center text-sm">
                    Still having trouble? Please contact support.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
