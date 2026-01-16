import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage
} from "@web/components/ui/form";
import { Input } from "@web/components/ui/input";
import { Textarea } from "@web/components/ui/textarea";
import { Button } from "@web/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@web/components/ui/card";

import { createCreateContestMutationOptions } from "@web/lib/tanstack/options/contest";
import { DateTimePickerField } from "@web/components/datetime-picker-field";
import z from "zod";

export const Route = createFileRoute("/admin/contest/new")({
  component: RouteComponent
});

const ContestFormSchema = z
  .object({
    title: z.string().min(1, { message: "Title is required" }),
    description: z.string().optional(),
    startTime: z.date({
      error: "Start time is required"
    }),
    endTime: z.date({
      error: "End time is required"
    })
  })
  .superRefine((data, ctx) => {
    if (data.endTime <= data.startTime) {
      ctx.addIssue({
        path: ["endTime"],
        code: z.ZodIssueCode.custom,
        message: "End time must be after start time"
      });
    }
  });

type ContestFormValues = z.infer<typeof ContestFormSchema>;

function RouteComponent() {
  const navigate = useNavigate();

  const form = useForm<ContestFormValues>({
    resolver: zodResolver(ContestFormSchema),
    defaultValues: {
      title: "",
      description: "",
      startTime: undefined,
      endTime: undefined
    }
  });

  const createMutation = useMutation({
    ...createCreateContestMutationOptions(),
    onSuccess: (data) => {
      navigate({ to: "/admin/contest/$id", params: { id: data.id } });
    }
  });

  const onSubmit = (values: ContestFormValues) => {
    createMutation.mutate({
      title: values.title,
      description: values.description ?? null,
      startTime: values.startTime.toISOString(),
      endTime: values.endTime.toISOString()
    });
  };

  return (
    <div className="container mx-auto max-w-3xl p-6">
      <Card>
        <CardHeader>
          <CardTitle>Create Contest</CardTitle>
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input {...field} autoComplete="off" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea {...field} rows={4} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <DateTimePickerField control={form.control} name="startTime" label="Start Time" />
                <DateTimePickerField control={form.control} name="endTime" label="End Time" />
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => navigate({ to: "/admin/contest" })}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? "Creating..." : "Create Contest"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
