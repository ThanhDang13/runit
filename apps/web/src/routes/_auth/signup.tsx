import { createFileRoute, Link } from "@tanstack/react-router";
import { SignupForm } from "@web/components/auth/signup-form";
import { ScrollArea } from "@web/components/ui/scroll-area";
import { GalleryVerticalEnd } from "lucide-react";

export const Route = createFileRoute("/_auth/signup")({
  component: SignupPage
});

function SignupPage() {
  return (
    <ScrollArea className="h-full">
      <div className="grid min-h-full lg:grid-cols-2">
        <div className="flex flex-col gap-4 p-6 md:p-10">
          <div className="flex justify-center gap-2 md:justify-start">
            <Link to="/" className="flex items-center gap-2 font-medium">
              <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
                <GalleryVerticalEnd className="size-4" />
              </div>
              RunIT
            </Link>
          </div>

          <div className="flex flex-1 items-center justify-center">
            <div className="w-full max-w-xs">
              <SignupForm />
            </div>
          </div>
        </div>

        <div className="bg-muted relative hidden lg:block">
          <img
            src="https://images.unsplash.com/photo-1518770660439-4636190af475"
            alt="Developer working illustration"
            className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.3] dark:grayscale"
          />
        </div>
      </div>
    </ScrollArea>
  );
}
