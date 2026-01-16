import type { ContestDetails } from "@api/app/modules/contest/dtos/common";
import type {
  CreateContestRequestDto,
  CreateContestResponseDto
} from "@api/app/modules/contest/dtos/create-contest.dtos";
import type {
  GetContestSubmissionsRequestQueryDto,
  GetContestSubmissionsResponseDto
} from "@api/app/modules/contest/dtos/get-contest-submissions.dtos";
import type {
  GetContestResponseDto,
  GetContestsRequestQueryDto,
  GetContestsResponseDto
} from "@api/app/modules/contest/dtos/get-contests.dtos";
import type { JoinContestResponseDto } from "@api/app/modules/contest/dtos/join-contest.dtos";
import type {
  AddProblemToContestRequestDto,
  AddProblemToContestResponseDto,
  RemoveProblemFromContestResponseDto
} from "@api/app/modules/contest/dtos/contest-problem.dtos";
import type {
  UpdateContestRequestDto,
  UpdateContestResponseDto
} from "@api/app/modules/contest/dtos/update-contest.dtos";

import {
  InfiniteData,
  UseInfiniteQueryOptions,
  UseMutationOptions,
  UseQueryOptions
} from "@tanstack/react-query";
import { axiosInstance } from "@web/lib/axios";
import { ExecuteRequest, ExecuteResult, ExecutionSummary } from "@web/lib/tanstack/options/execute";

const DEFAULT_LIMIT = 10;

async function fetchContests(query: GetContestsRequestQueryDto): Promise<GetContestsResponseDto> {
  const params = new URLSearchParams({
    type: "offset",
    page: query.page.toString(),
    limit: query.limit.toString(),
    order: query.order
  });

  if (query.sort) params.append("sort", query.sort);
  if (query.keyword) params.append("keyword", query.keyword);

  const res = await axiosInstance.get<GetContestsResponseDto>(`/contests?${params.toString()}`);
  return res.data;
}

export const createGetContestsInfiniteQueryOptions = ({
  limit,
  sort,
  order,
  page,
  keyword
}: Omit<GetContestsRequestQueryDto, "type">): UseInfiniteQueryOptions<
  GetContestsResponseDto,
  Error,
  InfiniteData<GetContestsResponseDto>,
  unknown[],
  number | undefined
> => ({
  queryKey: ["contests", { limit }, { sort, order, page }, keyword],
  queryFn: ({ pageParam = 1 }) => {
    const paging = { page: pageParam, limit: limit ?? DEFAULT_LIMIT };
    return fetchContests({
      type: "offset",
      page: paging.page,
      limit: paging.limit,
      sort,
      order,
      keyword
    });
  },
  getNextPageParam: (lastPage) => {
    const totalPages = Math.ceil(lastPage.total / (limit ?? DEFAULT_LIMIT));
    const nextPage = lastPage.paging.page + 1;
    return nextPage <= totalPages ? nextPage : undefined;
  },
  initialPageParam: page ?? 1
});

async function fetchContestById(id: string): Promise<GetContestResponseDto> {
  const res = await axiosInstance.get<GetContestResponseDto>(`/contests/${id}`);
  return res.data;
}

export const createGetContestByIdQueryOptions = (
  id: string
): UseQueryOptions<GetContestResponseDto, Error> => ({
  queryKey: ["contest", id],
  queryFn: () => fetchContestById(id),
  enabled: !!id
});

async function fetchContestSubmissions(
  contestId: string,
  query: GetContestSubmissionsRequestQueryDto
): Promise<GetContestSubmissionsResponseDto> {
  const res = await axiosInstance.get<GetContestSubmissionsResponseDto>(
    `/contests/${contestId}/submissions`,
    { params: query }
  );
  return res.data;
}

export const createGetContestSubmissionsInfiniteQueryOptions = (
  contestId: string,
  query: Omit<GetContestSubmissionsRequestQueryDto, "type" | "page">
): UseInfiniteQueryOptions<
  GetContestSubmissionsResponseDto,
  Error,
  InfiniteData<GetContestSubmissionsResponseDto>,
  unknown[],
  number | undefined
> => {
  const DEFAULT_LIMIT = 50;

  return {
    queryKey: ["contest-submissions", contestId, query],

    queryFn: ({ pageParam = 1 }) => {
      const paging = { page: pageParam, limit: query.limit ?? DEFAULT_LIMIT };

      return fetchContestSubmissions(contestId, {
        ...query,
        type: "offset",
        page: paging.page,
        limit: paging.limit
      });
    },

    getNextPageParam: (lastPage) => {
      const totalPages = Math.ceil(lastPage.total / (query.limit ?? DEFAULT_LIMIT));
      const nextPage = lastPage.paging.page + 1;
      return nextPage <= totalPages ? nextPage : undefined;
    },

    initialPageParam: 1,
    enabled: !!contestId
  };
};

export async function joinContest(contestId: string): Promise<JoinContestResponseDto> {
  const res = await axiosInstance.post<JoinContestResponseDto>(`/contests/${contestId}/join`);
  return res.data;
}

export const createJoinContestMutationOptions = (): UseMutationOptions<
  JoinContestResponseDto,
  Error,
  string
> => ({
  mutationFn: joinContest
});

export async function submitCode(
  contestId: string,
  body: ExecuteRequest
): Promise<ExecutionSummary> {
  const res = await axiosInstance.post<ExecutionSummary>(`/contests/${contestId}/submit`, body);
  return res.data;
}

export const createSubmitCodeMutationOptions = (
  contestId: string
): UseMutationOptions<ExecutionSummary, Error, ExecuteRequest> => ({
  mutationFn: (data) => submitCode(contestId, data)
});

async function updateContestById({ id }: { id: string }, body: UpdateContestRequestDto) {
  const res = await axiosInstance.patch<UpdateContestResponseDto>(`/contests/${id}`, body);
  return res.data;
}

export const createUpdateContestMutationOptions = ({
  id
}: {
  id: string;
}): UseMutationOptions<UpdateContestResponseDto, Error, UpdateContestRequestDto> => ({
  mutationFn: (data) => updateContestById({ id }, data)
});

export async function addProblemToContest(
  contestId: string,
  body: AddProblemToContestRequestDto
): Promise<AddProblemToContestResponseDto> {
  const res = await axiosInstance.post<AddProblemToContestResponseDto>(
    `/contests/${contestId}/problems`,
    body
  );
  return res.data;
}

export const createAddProblemToContestMutationOptions = (
  contestId: string
): UseMutationOptions<AddProblemToContestResponseDto, Error, AddProblemToContestRequestDto> => ({
  mutationFn: (data) => addProblemToContest(contestId, data)
});

export async function removeProblemFromContest(
  contestId: string,
  problemId: string
): Promise<RemoveProblemFromContestResponseDto> {
  const res = await axiosInstance.delete<RemoveProblemFromContestResponseDto>(
    `/contests/${contestId}/problems/${problemId}`
  );
  return res.data;
}

export const createRemoveProblemFromContestMutationOptions = (
  contestId: string
): UseMutationOptions<RemoveProblemFromContestResponseDto, Error, string> => ({
  mutationFn: (problemId: string) => removeProblemFromContest(contestId, problemId)
});

export async function createContest(
  body: CreateContestRequestDto
): Promise<CreateContestResponseDto> {
  const res = await axiosInstance.post<CreateContestResponseDto>("/contests", body);
  return res.data;
}

export const createCreateContestMutationOptions = (): UseMutationOptions<
  CreateContestResponseDto,
  Error,
  CreateContestRequestDto
> => ({
  mutationFn: (data) => createContest(data)
});

export async function deleteContest({ id }: { id: string }) {
  const res = await axiosInstance.delete<{ id: string }>(`/contests/${id}`);
  return res.data;
}

export const createDeleteContestMutationOptions = (): UseMutationOptions<
  { id: string },
  Error,
  { id: string }
> => ({
  mutationFn: (data) => deleteContest(data)
});

export type {
  ContestDetails,
  GetContestsRequestQueryDto,
  GetContestsResponseDto,
  GetContestResponseDto,
  GetContestSubmissionsRequestQueryDto,
  GetContestSubmissionsResponseDto,
  JoinContestResponseDto,
  UpdateContestRequestDto,
  UpdateContestResponseDto,
  AddProblemToContestRequestDto,
  AddProblemToContestResponseDto,
  RemoveProblemFromContestResponseDto,
  CreateContestRequestDto,
  CreateContestResponseDto
};
