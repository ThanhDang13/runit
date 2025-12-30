import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from "@web/components/ui/accordion";
import { Button } from "@web/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@web/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@web/components/ui/form";
import { Input } from "@web/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@web/components/ui/select";
import { Separator } from "@web/components/ui/separator";
import { Skeleton } from "@web/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@web/components/ui/tabs";
import { Textarea } from "@web/components/ui/textarea";
import { ArrowLeft, Loader2 } from "lucide-react";

import {
  createGetProblemByIdQueryOptions,
  createUpdateProblemMutationOptions
} from "@web/lib/tanstack/options/problem";

import { Checkbox } from "@web/components/ui/checkbox";
import type {
  ProblemWithTestcases,
  UpdateProblemRequestBodyDto
} from "@web/lib/tanstack/options/problem";
import z from "zod";
import { Editor } from "@web/components/blocks/editor-md/editor";

export const Route = createFileRoute("/admin/problem/$id")({
  parseParams: (params) => ({ id: String(params.id) }),
  component: RouteComponent
});

function RouteComponent() {
  const { id } = useParams({ from: "/admin/problem/$id" });
  const { data: problem, isLoading } = useQuery(createGetProblemByIdQueryOptions({ id }));

  if (isLoading) return <ProblemSkeleton />;

  if (!problem) return <div className="mt-10 text-center text-red-500">Problem not found</div>;

  return (
    <div className="mx-auto w-full space-y-8 py-8 md:max-w-4xl lg:max-w-5xl">
      <div>
        <Link to="/admin/problem">
          <Button variant="ghost" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </Link>
      </div>
      {/* ---------------- Header ---------------- */}
      <div className="border-border mb-6 border-b pb-6">
        <h1 className="text-foreground text-4xl font-bold">{problem.title}</h1>
        <p className="text-muted-foreground mt-2 text-sm">
          ID: {problem.id} • Last updated: {new Date(problem.updatedAt).toLocaleDateString()}
        </p>
      </div>

      {/* ---------------- Problem Info & Form ---------------- */}
      <Card className="border-0 shadow-none">
        <CardHeader className="border-border-200 border-0">
          <CardTitle className="text-2xl font-semibold">Edit Problem</CardTitle>
          <CardDescription>Update problem details and testcases below</CardDescription>
        </CardHeader>
        <CardContent className="py-6">
          <ProblemForm problem={problem} />
        </CardContent>
      </Card>
    </div>
  );
}

// ---------------- Skeleton ----------------
function ProblemSkeleton() {
  return (
    <div className="mx-auto max-w-4xl space-y-4 py-8">
      <Skeleton className="h-10 w-64" />
      <Card className="border-border shadow-lg">
        <CardHeader className="border-border-200 border-b">
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent className="space-y-4 p-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i}>
              <Skeleton className="mb-2 h-4 w-24" />
              <Skeleton className="h-10 w-full" />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

interface ProblemFormProps {
  problem: ProblemWithTestcases;
}

const difficultyValues = ["easy", "medium", "hard"] as const;

export const UpdateProblemRequestBodySchema = z.object({
  difficulty: z
    .string()
    .optional()
    .refine(
      (val) =>
        val === undefined || difficultyValues.includes(val as (typeof difficultyValues)[number]),
      { message: "Please select a valid difficulty level" }
    ),
  title: z.string().min(3, "Title must be at least 3 characters").optional(),
  description: z.string().min(6, "Description must be at least 6 characters").optional(),
  testcases: z
    .array(
      z.object({
        id: z.string().optional(),
        input: z.string().optional(),
        expectedOutput: z.string().optional(),
        isSample: z.boolean().optional()
      })
    )
    .optional()
});

function ProblemForm({ problem }: ProblemFormProps) {
  const queryClient = useQueryClient();
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<UpdateProblemRequestBodyDto>({
    resolver: zodResolver(UpdateProblemRequestBodySchema),
    defaultValues: {
      title: problem.title,
      description: problem.description,
      difficulty: problem.difficulty as "easy" | "medium" | "hard",
      testcases: problem.testcases.map((t) => ({ ...t }))
    }
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "testcases"
  });

  const values = form.watch("testcases");

  const updateMutation = useMutation({
    ...createUpdateProblemMutationOptions({ id: problem.id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["problem", problem.id] });
      setIsSaving(false);
    },
    onError: () => setIsSaving(false)
  });

  const onSubmit = async (data: UpdateProblemRequestBodyDto) => {
    setIsSaving(true);
    await updateMutation.mutateAsync(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Tabs className="mx-auto w-full" defaultValue="details">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="details">Problem Details</TabsTrigger>
            <TabsTrigger value="testcases">Testcases</TabsTrigger>
          </TabsList>
          <TabsContent value="details" className="w-full pt-6">
            <div className="space-y-4">
              <div className="w-full flex-1 space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="difficulty"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Difficulty</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select difficulty" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {difficultyValues.map((v) => (
                            <SelectItem key={v} value={v}>
                              {v}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Editor
                          editorSerializedState={field.value ? JSON.parse(field.value) : undefined}
                          onSerializedChange={(value) => field.onChange(JSON.stringify(value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </TabsContent>
          <TabsContent value="testcases" className="w-full pt-6">
            <div className="space-y-6">
              <h2 className="text-foreground text-xl font-semibold">Testcases</h2>
              <Accordion type="multiple" className="w-full">
                {fields.map((field, index: number) => (
                  <AccordionItem
                    key={field.id}
                    value={field.id}
                    className="border-primary-500/30 bg-card mb-4 rounded-md border-l-4 shadow-sm"
                  >
                    <AccordionTrigger className="p-4 hover:no-underline">
                      <span className="text-foreground font-medium">Testcase {index + 1}: </span>
                      <span className="text-muted-foreground ml-2 line-clamp-1 text-sm">
                        Input: {values?.[index]?.input ? values[index].input : "Empty"}
                      </span>
                    </AccordionTrigger>
                    <AccordionContent className="border-border space-y-4 border-t p-4">
                      <FormField
                        // control={field.control}
                        name={`testcases.${index}.input`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Input</FormLabel>
                            <FormControl>
                              <Textarea {...field} className="min-h-20" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        // control={field.control}
                        name={`testcases.${index}.expectedOutput`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Expected Output</FormLabel>
                            <FormControl>
                              <Textarea {...field} className="min-h-20" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="flex items-center justify-between">
                        <FormField
                          // control={field.control}
                          name={`testcases.${index}.isSample`}
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center space-x-2">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={(value) => field.onChange(Boolean(value))}
                                />
                              </FormControl>
                              <FormLabel className="text-sm font-medium">Sample Testcase</FormLabel>
                            </FormItem>
                          )}
                        />

                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => remove(index)}
                        >
                          Remove
                        </Button>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
              <Button
                type="button"
                variant="outline"
                onClick={() => append({ input: "", expectedOutput: "", isSample: false })}
                className="w-full"
              >
                Add Testcase
              </Button>
            </div>
          </TabsContent>
        </Tabs>
        <div className="mt-8">
          <Separator className="mb-4" />
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => form.reset()}
              disabled={!form.formState.isDirty}
            >
              Reset
            </Button>
            <Button type="submit" disabled={isSaving || !form.formState.isDirty}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}
