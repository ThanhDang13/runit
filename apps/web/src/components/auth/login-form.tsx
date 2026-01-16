import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";

import { cn } from "@web/lib/utils";
import { Button } from "@web/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator
} from "@web/components/ui/field";
import { Input } from "@web/components/ui/input";

import { Link, useNavigate } from "@tanstack/react-router";
import { createLoginMutationOptions } from "@web/lib/tanstack/options/auth";
import { useAuthStore } from "@web/stores/auth-store";
import { toast } from "sonner";

const formSchema = z.object({
  email: z.email("Enter a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters.")
});

export function LoginForm({ className, ...props }: React.ComponentProps<"form">) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: ""
    }
  });

  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);

  const mutation = useMutation({
    ...createLoginMutationOptions(),
    onSuccess: (data) => {
      login({
        token: data.accessToken
      });
      if (data.isAdmin) {
        navigate({ to: "/admin" });
        toast.success("Welcome Admin!");
        return;
      }
      navigate({ to: "/" });
      toast.success("Login successful!");
    },
    onError: (error) => {
      const message = "Login failed. Please try again.";

      toast.error(message);
    }
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    mutation.mutate(values);
  }

  return (
    <form
      className={cn("flex flex-col gap-6", className)}
      onSubmit={form.handleSubmit(onSubmit)}
      {...props}
    >
      <FieldGroup>
        {/* Title */}
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">Login to your account</h1>
          <p className="text-muted-foreground text-sm text-balance">
            Enter your email below to login to your account
          </p>
        </div>

        {/* Email */}
        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input
            id="email"
            type="email"
            placeholder="m@example.com"
            required
            {...form.register("email")}
          />
          <p className="text-sm text-red-500">{form.formState.errors.email?.message}</p>
        </Field>

        {/* Password */}
        <Field>
          <div className="flex items-center">
            <FieldLabel htmlFor="password">Password</FieldLabel>
            <Link
              to="/forgot-password"
              className="ml-auto text-sm underline-offset-4 hover:underline"
            >
              Forgot your password?
            </Link>
          </div>

          <Input id="password" type="password" required {...form.register("password")} />
          <p className="text-sm text-red-500">{form.formState.errors.password?.message}</p>
        </Field>

        <Field>
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? "Logging in..." : "Login"}
          </Button>
        </Field>

        {/* <FieldSeparator>Or continue with</FieldSeparator> */}

        <Field>
          <FieldDescription className="text-center">
            Don&apos;t have an account?{" "}
            <Link to="/signup" className="underline underline-offset-4">
              Sign up
            </Link>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  );
}
