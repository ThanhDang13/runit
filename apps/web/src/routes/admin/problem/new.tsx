import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@web/components/ui/tabs";
import { Textarea } from "@web/components/ui/textarea";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Checkbox } from "@web/components/ui/checkbox";
import z from "zod";

import { Editor } from "@web/components/blocks/editor-md/editor";
import {
  createProblem,
  createCreateProblemMutationOptions,
  CreateProblemRequestBodyDto
} from "@web/lib/tanstack/options/problem";

export const Route = createFileRoute("/admin/problem/new")({
  component: CreateProblemPage
});

const difficultyValues = ["easy", "medium", "hard"] as const;

// ---------------- Zod Schema ----------------
export const CreateProblemRequestBodySchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(6, "Description must be at least 6 characters"),
  difficulty: z
    .string()
    .refine(
      (val) =>
        val === undefined || difficultyValues.includes(val as (typeof difficultyValues)[number]),
      { message: "Please select a valid difficulty level" }
    ),
  testcases: z
    .array(
      z.object({
        input: z.string(),
        expectedOutput: z.string(),
        isSample: z.boolean()
      })
    )
    .optional()
});

function CreateProblemPage() {
  const queryClient = useQueryClient();
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<CreateProblemRequestBodyDto>({
    resolver: zodResolver(CreateProblemRequestBodySchema),
    defaultValues: {
      title: "",
      description: "",
      difficulty: "easy",
      testcases: []
    }
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "testcases"
  });

  const values = form.watch("testcases");

  const createMutation = useMutation({
    ...createCreateProblemMutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["problems"] });
      setIsSaving(false);
      form.reset();
    },
    onError: () => setIsSaving(false)
  });

  const onSubmit = async (data: CreateProblemRequestBodyDto) => {
    setIsSaving(true);
    await createMutation.mutateAsync(data);
  };

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

      <Card className="border-0 shadow-none">
        <CardHeader className="border-0">
          <CardTitle className="text-2xl font-semibold">Create Problem</CardTitle>
          <CardDescription>Fill in problem details and testcases below</CardDescription>
        </CardHeader>
        <CardContent className="py-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <Tabs className="w-full" defaultValue="details">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="details">Problem Details</TabsTrigger>
                  <TabsTrigger value="testcases">Testcases</TabsTrigger>
                </TabsList>

                {/* ---------------- Details Tab ---------------- */}
                <TabsContent value="details" className="space-y-4 pt-6">
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
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Editor
                            editorState={field.value ? JSON.parse(field.value) : undefined}
                            onChange={(value) => field.onChange(JSON.stringify(value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </TabsContent>

                {/* ---------------- Testcases Tab ---------------- */}
                <TabsContent value="testcases" className="space-y-6 pt-6">
                  <Accordion type="multiple" className="w-full">
                    {fields.map((field, index) => (
                      <AccordionItem
                        key={field.id}
                        value={field.id}
                        className="bg-card border-primary-500/30 mb-4 rounded-md border-l-4 shadow-sm"
                      >
                        <AccordionTrigger className="p-4 hover:no-underline">
                          <span className="font-medium">Testcase {index + 1}</span>
                          <span className="text-muted-foreground ml-2 text-sm">
                            Input: {values?.[index]?.input ?? "Empty"}
                          </span>
                        </AccordionTrigger>
                        <AccordionContent className="border-border space-y-4 border-t p-4">
                          <FormField
                            name={`testcases.${index}.input` as any}
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
                            name={`testcases.${index}.expectedOutput` as any}
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
                          <FormField
                            name={`testcases.${index}.isSample` as any}
                            render={({ field }) => (
                              <FormItem className="flex items-center space-x-2">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value}
                                    onCheckedChange={(value) => field.onChange(Boolean(value))}
                                  />
                                </FormControl>
                                <FormLabel className="text-sm font-medium">
                                  Sample Testcase
                                </FormLabel>
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
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => append({ input: "", expectedOutput: "", isSample: false })}
                  >
                    Add Testcase
                  </Button>
                </TabsContent>
              </Tabs>

              <div className="mt-8 flex justify-end gap-4">
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
                  {isSaving ? "Saving..." : "Create Problem"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
