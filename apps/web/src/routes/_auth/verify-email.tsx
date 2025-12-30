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

  const [message, setMessage] = useState("Verifying your email...");
  const [resendEmail, setResendEmail] = useState(urlEmail || "");
  const [emailError, setEmailError] = useState("");

  const verifyEmailMutation = useMutation(createVerifyEmailMutationOptions());
  const resendVerificationMutation = useMutation(createResendVerificationMutationOptions());

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

    resendVerificationMutation.mutate(
      { email: resendEmail },
      {
        onSuccess: (data) => {
          setMessage(data.message || "Verification email sent! Please check your inbox.");
        },
        onError: (err) => {
          setMessage("Failed to resend verification email.");
        }
      }
    );
  };

  useEffect(() => {
    if (!token) {
      setMessage("Invalid verification link. Please request a new verification email.");
      return;
    }

    if (hasVerifiedRef.current) return;
    hasVerifiedRef.current = true;

    verifyEmailMutation.mutate(
      { token },
      {
        onSuccess: (data) => {
          setMessage(data.message || "Your email has been successfully verified!");
        },
        onError: (err) => {
          setMessage("Verification failed. The link may have expired.");
        }
      }
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const hasInvalidToken = !token;
  const isError =
    verifyEmailMutation.isError || resendVerificationMutation.isError || hasInvalidToken;

  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      {/* Left side - Branding/Info (optional) */}
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

      {/* Right side - Verification Form */}
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex flex-1 items-center justify-center">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="bg-muted mx-auto mb-4 flex size-16 items-center justify-center rounded-full">
                {verifyEmailMutation.isPending && (
                  <Loader2 className="text-primary size-8 animate-spin" />
                )}

                {(verifyEmailMutation.isSuccess || resendVerificationMutation.isSuccess) && (
                  <CheckCircle2 className="size-8 text-green-600" />
                )}

                {isError &&
                  !verifyEmailMutation.isPending &&
                  !verifyEmailMutation.isSuccess &&
                  !resendVerificationMutation.isSuccess && (
                    <XCircle className="text-destructive size-8" />
                  )}
              </div>

              <CardTitle className="text-2xl">
                {verifyEmailMutation.isPending && "Verifying Email"}
                {verifyEmailMutation.isSuccess && "Email Verified!"}
                {resendVerificationMutation.isSuccess && "Verification Email Sent!"}
                {isError &&
                  !verifyEmailMutation.isPending &&
                  !verifyEmailMutation.isSuccess &&
                  !resendVerificationMutation.isSuccess &&
                  "Verification Failed"}
              </CardTitle>

              <CardDescription>
                {verifyEmailMutation.isPending && "Please wait while we verify your email address"}
                {verifyEmailMutation.isSuccess && "Your email has been successfully verified"}
                {resendVerificationMutation.isSuccess &&
                  "Check your inbox for the verification link"}
                {isError &&
                  !verifyEmailMutation.isPending &&
                  !verifyEmailMutation.isSuccess &&
                  !resendVerificationMutation.isSuccess &&
                  "We couldn't verify your email address"}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Status Alert */}
              <Alert
                variant={
                  isError && !verifyEmailMutation.isSuccess && !resendVerificationMutation.isSuccess
                    ? "destructive"
                    : "default"
                }
              >
                {isError &&
                !verifyEmailMutation.isSuccess &&
                !resendVerificationMutation.isSuccess ? (
                  <AlertCircle className="size-4" />
                ) : (
                  <Mail className="size-4" />
                )}
                <AlertDescription>{message}</AlertDescription>
              </Alert>

              {/* Resend Form - Show when verification failed */}
              {isError &&
                !verifyEmailMutation.isPending &&
                !verifyEmailMutation.isSuccess &&
                !resendVerificationMutation.isSuccess && (
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
                        disabled={resendVerificationMutation.isPending}
                        className={emailError ? "border-destructive" : ""}
                      />
                      {emailError && <p className="text-destructive text-sm">{emailError}</p>}
                    </div>

                    <Button
                      variant="outline"
                      className="w-full"
                      size="lg"
                      onClick={handleResend}
                      disabled={resendVerificationMutation.isPending || !resendEmail}
                    >
                      {resendVerificationMutation.isPending ? (
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

              {/* Action Buttons */}
              {!verifyEmailMutation.isPending && (
                <div className="space-y-2 pt-2">
                  <Link to="/login" className="block">
                    <Button
                      className="w-full"
                      size="lg"
                      variant={
                        verifyEmailMutation.isSuccess || resendVerificationMutation.isSuccess
                          ? "default"
                          : "outline"
                      }
                    >
                      {verifyEmailMutation.isSuccess || resendVerificationMutation.isSuccess
                        ? "Continue to Login"
                        : "Go to Login"}
                    </Button>
                  </Link>

                  {(verifyEmailMutation.isSuccess || resendVerificationMutation.isSuccess) && (
                    <p className="text-muted-foreground text-center text-sm">
                      You can now sign in with your verified email
                    </p>
                  )}
                </div>
              )}

              {/* Help Text */}
              {(isError || resendVerificationMutation.isSuccess) && (
                <div className="border-t pt-4">
                  <p className="text-muted-foreground text-center text-sm">
                    Need help? Please contact us.
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
