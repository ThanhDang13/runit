import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import {
  createGetContestByIdQueryOptions,
  createUpdateContestMutationOptions,
  GetContestResponseDto,
  UpdateContestRequestDto
} from "@web/lib/tanstack/options/contest";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@web/components/ui/card";
import { Badge } from "@web/components/ui/badge";
import { Skeleton } from "@web/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@web/components/ui/table";
import {
  Clock,
  Users,
  Trophy,
  CheckCircle2,
  Calendar,
  Trash2,
  Loader2,
  Plus,
  ArrowLeft
} from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createAddProblemToContestMutationOptions,
  createRemoveProblemFromContestMutationOptions
} from "@web/lib/tanstack/options/contest";
import { Input } from "@web/components/ui/input";
import { Button } from "@web/components/ui/button";
import { NumberInput } from "@web/components/number-input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@web/components/ui/form";
import { Textarea } from "@web/components/ui/textarea";
import { useState } from "react";
import { DateTimePickerField } from "@web/components/datetime-picker-field";

const addProblemSchema = z.object({
  problemId: z.string().min(1, "Problem ID is required"),
  order: z.number().int().min(0)
});

const ContestFormSchema = z
  .object({
    title: z.string().min(1),
    description: z.string().optional(),
    startTime: z.date().optional(),
    endTime: z.date().optional()
  })
  .superRefine((data, ctx) => {
    if (data.startTime && data.endTime && data.endTime <= data.startTime) {
      ctx.addIssue({
        path: ["endTime"],
        code: z.ZodIssueCode.custom,
        message: "End time must be after start time"
      });
    }
  });

type ContestFormValues = z.infer<typeof ContestFormSchema>;

type AddProblemFormValues = z.infer<typeof addProblemSchema>;

/* ---------- Route ---------- */

export const Route = createFileRoute("/admin/contest/$id")({
  component: RouteComponent
});

function RouteComponent() {
  const { id } = useParams({ from: "/admin/contest/$id" });
  const { data: contest, isLoading } = useQuery(createGetContestByIdQueryOptions(id));

  const queryClient = useQueryClient();

  const updateContestMutation = useMutation({
    ...createUpdateContestMutationOptions({ id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contest", id] });
    }
  });

  const addProblemMutation = useMutation({
    ...createAddProblemToContestMutationOptions(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contest", id] });
    }
  });

  const removeProblemMutation = useMutation({
    ...createRemoveProblemFromContestMutationOptions(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contest", id] });
    }
  });

  if (isLoading) return <LoadingSkeleton />;
  if (!contest) return <NotFound />;

  const status = getContestStatus(contest.startTime, contest.endTime);

  return (
    <div className="container mx-auto space-y-6 p-6">
      <Link to="/admin/contest">
        <Button variant="ghost" className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
      </Link>
      <Header
        contest={contest}
        status={status}
        onUpdate={(data) => updateContestMutation.mutate(data)}
        isUpdating={updateContestMutation.isPending}
      />
      <Stats contest={contest} />
      <Timeline contest={contest} />
      <AddProblemForm onSubmit={(data) => addProblemMutation.mutate(data)} />
      <ProblemsTable
        problems={contest.problems}
        onRemove={(problemId) => removeProblemMutation.mutate(problemId)}
      />
      <Leaderboard participants={contest.participants} />
    </div>
  );
}

/* ---------- Components ---------- */

type HeaderProps = {
  contest: GetContestResponseDto;
  status: ContestStatus;
  onUpdate: (data: UpdateContestRequestDto) => void;
  isUpdating: boolean;
};

export function Header({ contest, status, onUpdate, isUpdating }: HeaderProps) {
  const [isEditing, setIsEditing] = useState(false);

  const form = useForm<ContestFormValues>({
    resolver: zodResolver(ContestFormSchema),
    defaultValues: {
      title: contest.title,
      description: contest.description ?? "",
      startTime: contest.startTime ? new Date(contest.startTime) : undefined,
      endTime: contest.endTime ? new Date(contest.endTime) : undefined
    }
  });

  const onSubmit = (values: ContestFormValues) => {
    onUpdate({
      title: values.title,
      description: values.description || null,
      startTime: values.startTime?.toISOString(),
      endTime: values.endTime?.toISOString()
    });
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 space-y-3">
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
                      <Textarea {...field} rows={3} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <DateTimePickerField control={form.control} name="startTime" label="Start Time" />

                <DateTimePickerField control={form.control} name="endTime" label="End Time" />
              </div>
            </div>

            <div className="flex flex-col gap-2 pt-7">
              <Button type="submit" disabled={isUpdating}>
                Save
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  form.reset();
                  setIsEditing(false);
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </form>
      </Form>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{contest.title}</h1>
          {contest.description && (
            <p className="text-muted-foreground mt-1">{contest.description}</p>
          )}
        </div>

        <div className="flex items-center gap-3">
          <Badge variant={status.variant}>{status.label}</Badge>
          <Button size="sm" variant="outline" onClick={() => setIsEditing(true)}>
            Edit
          </Button>
        </div>
      </div>
    </div>
  );
}

function Stats({ contest }: { contest: GetContestResponseDto }) {
  const durationDays =
    Math.ceil(
      (new Date(contest.endTime).getTime() - new Date(contest.startTime).getTime()) /
        (1000 * 60 * 60 * 24)
    ) || 0;

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <StatCard
        title="Total Problems"
        value={contest.problems.length}
        icon={<Trophy className="h-4 w-4" />}
      />
      <StatCard
        title="Participants"
        value={contest.participants.length}
        icon={<Users className="h-4 w-4" />}
      />
      <StatCard
        title="Duration"
        value={`${durationDays} days`}
        icon={<Clock className="h-4 w-4" />}
      />
    </div>
  );
}

function Timeline({ contest }: { contest: GetContestResponseDto }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" /> Contest Timeline
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <Row label="Start Time" value={formatDate(contest.startTime)} />
        <Row label="End Time" value={formatDate(contest.endTime)} />
      </CardContent>
    </Card>
  );
}

function AddProblemForm({ onSubmit }: { onSubmit: (values: AddProblemFormValues) => void }) {
  const form = useForm<AddProblemFormValues>({
    resolver: zodResolver(addProblemSchema),
    defaultValues: {
      problemId: "",
      order: 0
    }
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add Problem</CardTitle>
        <CardDescription>Attach a problem to this contest</CardDescription>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="grid grid-cols-1 gap-4 md:grid-cols-2"
        >
          <div>
            <Input placeholder="Problem ID" autoComplete="off" {...form.register("problemId")} />
            {form.formState.errors.problemId && (
              <p className="text-sm text-red-500">{form.formState.errors.problemId.message}</p>
            )}
          </div>

          <div>
            <Controller
              name="order"
              control={form.control}
              render={({ field }) => <NumberInput value={field.value} onChange={field.onChange} />}
            />
          </div>

          <div className="md:col-span-3">
            <Button
              type="submit"
              size="icon"
              disabled={form.formState.isSubmitting}
              aria-label="Add problem"
            >
              {form.formState.isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

function ProblemsTable({
  problems,
  onRemove
}: {
  problems: GetContestResponseDto["problems"];
  onRemove: (problemId: string) => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Problems</CardTitle>
        <CardDescription>Problems in this contest</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>#</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>ID</TableHead>
                <TableHead className="text-right">Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {problems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-muted-foreground text-center">
                    No problems yet
                  </TableCell>
                </TableRow>
              ) : (
                problems.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>{p.order + 1}</TableCell>
                    <TableCell>{p.title}</TableCell>
                    <TableCell className="text-muted-foreground font-mono text-xs">
                      {p.problemId}
                    </TableCell>
                    <TableCell className="text-right">
                      {p.status === "solved" ? (
                        <Badge className="gap-1">
                          <CheckCircle2 className="h-3 w-3" />
                          Solved
                        </Badge>
                      ) : (
                        <Badge variant="secondary">Unsolved</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => onRemove(p.problemId)}
                        aria-label="Remove problem"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

function Leaderboard({ participants }: { participants: GetContestResponseDto["participants"] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Leaderboard</CardTitle>
        <CardDescription>Current standings</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Rank</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>User ID</TableHead>
                <TableHead className="text-center">Solved</TableHead>
                <TableHead className="text-center">Penalty</TableHead>
                <TableHead className="text-right">Joined</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {participants.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-muted-foreground text-center">
                    No participants
                  </TableCell>
                </TableRow>
              ) : (
                participants.map((p, i) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-bold">{i + 1}</TableCell>
                    <TableCell>{p.name}</TableCell>
                    <TableCell className="text-muted-foreground font-mono text-xs">
                      {p.userId}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline">{p.solved}</Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-center">{p.penalty}</TableCell>
                    <TableCell className="text-muted-foreground text-right">
                      {formatDate(p.joinedAt)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

/* ---------- Helpers ---------- */

type ContestStatus = {
  label: "Upcoming" | "Running" | "Ended";
  variant: "secondary" | "default" | "destructive";
};

function formatDate(date: string) {
  return new Date(date).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" });
}

function getContestStatus(start: string, end: string): ContestStatus {
  const now = new Date();
  if (now < new Date(start)) return { label: "Upcoming", variant: "secondary" };
  if (now > new Date(end)) return { label: "Ended", variant: "destructive" };
  return { label: "Running", variant: "default" };
}

/* ---------- Small UI ---------- */

function StatCard({
  title,
  value,
  icon
}: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b py-2">
      <span className="text-sm font-medium">{label}</span>
      <span className="text-muted-foreground text-sm">{value}</span>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="container mx-auto space-y-6 p-6">
      <Skeleton className="h-12 w-1/2" />
      <Skeleton className="h-32" />
      <Skeleton className="h-64" />
    </div>
  );
}

function NotFound() {
  return (
    <div className="text-muted-foreground container mx-auto p-6 text-center">Contest not found</div>
  );
}
