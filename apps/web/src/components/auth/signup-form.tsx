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
import { createSignupMutationOptions } from "@web/lib/tanstack/options/auth";
import { Link, useNavigate } from "@tanstack/react-router";
import { useAuthStore } from "@web/stores/auth-store";
import { toast } from "sonner";

const formSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters."),
    email: z.email("Enter a valid email address."),
    password: z.string().min(8, "Password must be at least 8 characters."),
    confirmPassword: z.string().min(8, "Password must be at least 8 characters.")
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"]
  });

export function SignupForm({ className, ...props }: React.ComponentProps<"form">) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: ""
    }
  });
  const navigate = useNavigate();

  const mutation = useMutation({
    ...createSignupMutationOptions(),
    onSuccess: (data) => {
      navigate({ to: "/" });

      toast.success(
        data.message || "Signup successful! Please check your email to verify your account."
      );
    },
    onError: (error) => {
      toast.error(error?.message ?? "Signup failed");
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
        {/* Header */}
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">Create your account</h1>
          <p className="text-muted-foreground text-sm text-balance">
            Fill in the form below to create your account
          </p>
        </div>

        {/* Full Name */}
        <Field>
          <FieldLabel htmlFor="name">Full Name</FieldLabel>
          <Input id="name" placeholder="John Doe" {...form.register("name")} />
          <p className="text-sm text-red-500">{form.formState.errors.name?.message}</p>
        </Field>

        {/* Email */}
        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input id="email" type="email" placeholder="m@example.com" {...form.register("email")} />
          <FieldDescription>
            We&apos;ll use this to contact you. We will not share your email with anyone else.
          </FieldDescription>

          <p className="text-sm text-red-500">{form.formState.errors.email?.message}</p>
        </Field>

        {/* Password */}
        <Field>
          <FieldLabel htmlFor="password">Password</FieldLabel>
          <Input id="password" type="password" {...form.register("password")} />
          <FieldDescription>Must be at least 8 characters long.</FieldDescription>

          <p className="text-sm text-red-500">{form.formState.errors.password?.message}</p>
        </Field>

        {/* Confirm Password */}
        <Field>
          <FieldLabel htmlFor="confirm-password">Confirm Password</FieldLabel>
          <Input id="confirm-password" type="password" {...form.register("confirmPassword")} />
          <FieldDescription>Please confirm your password.</FieldDescription>

          <p className="text-sm text-red-500">{form.formState.errors.confirmPassword?.message}</p>
        </Field>

        {/* Submit */}
        <Field>
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? "Creating Account..." : "Create Account"}
          </Button>
        </Field>

        {/* Divider */}
        {/* <FieldSeparator>Or continue with</FieldSeparator> */}

        {/* GitHub */}
        <Field>
          {/* <Button variant="outline" type="button">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <path
                d="M12 .297c-6.63 0-12 5.373-12 12 0 
                5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 
                0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61 
                C4.422 18.07 3.633 17.7 3.633 17.7 
                c-1.087-.744.084-.729.084-.729 
                1.205.084 1.838 1.236 1.838 1.236 
                1.07 1.835 2.809 1.305 3.495.998 
                .108-.776.417-1.305.76-1.605 
                -2.665-.3-5.466-1.332-5.466-5.93 
                0-1.31.465-2.38 1.235-3.22 
                -.135-.303-.54-1.523.105-3.176 
                0 0 1.005-.322 3.3 1.23 
                .96-.267 1.98-.399 3-.405 
                1.02.006 2.04.138 3 .405 
                2.28-1.552 3.285-1.23 3.285-1.23 
                .645 1.653.24 2.873.12 3.176 
                .765.84 1.23 1.91 1.23 3.22 
                0 4.61-2.805 5.625-5.475 5.92 
                .42.36.81 1.096.81 2.22 
                0 1.606-.015 2.896-.015 3.286 
                0 .315.21.69.825.57 
                C20.565 22.092 24 17.592 24 12.297 
                c0-6.627-5.373-12-12-12"
                fill="currentColor"
              />
            </svg>
            Sign up with GitHub
          </Button> */}

          <FieldDescription className="px-6 text-center">
            Already have an account? <Link to="/login">Sign in</Link>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  );
}
