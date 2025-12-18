/* eslint-disable @nx/enforce-module-boundaries */
import { Problem, ProblemWithTestcases } from "@api/app/modules/problem/dtos/common";
import type {
  GetProblemsRequestQueryDto,
  GetProblemsResponseDto
} from "@api/app/modules/problem/dtos/get-problems.dtos";
import type {
  GetProblemByIdResponseDto,
  GetProblemByIdRequestParamsDto
} from "@api/app/modules/problem/dtos/get-problem-by-id.dtos";
import type {
  UpdateProblemRequestBodyDto,
  UpdateProblemRequestParamsDto,
  UpdateProblemResponseDto
} from "@api/app/modules/problem/dtos/update-problem.dtos";
import type {
  CreateProblemRequestBodyDto,
  CreateProblemResponseDto
} from "@api/app/modules/problem/dtos/create-problem.dtos";

import {
  InfiniteData,
  UseInfiniteQueryOptions,
  UseMutationOptions,
  UseQueryOptions
} from "@tanstack/react-query";
import { axiosInstance } from "@web/lib/axios";

async function fetchProblems({
  type,
  page,
  limit,
  sort,
  order,
  keyword
}: GetProblemsRequestQueryDto): Promise<GetProblemsResponseDto> {
  const params = new URLSearchParams({
    type,
    page: page.toString(),
    limit: limit.toString(),
    order
  });

  if (sort) {
    params.append("sort", sort);
  }

  if (keyword) {
    params.append("keyword", keyword);
  }

  const res = await axiosInstance.get<GetProblemsResponseDto>(`/problems?${params.toString()}`);

  return res.data;
}

export type ProblemsPage = GetProblemsResponseDto;

const DEFAULT_LIMIT = 10;

export const createGetProblemsInfiniteQueryOptions = ({
  limit,
  sort,
  order,
  keyword,
  page
}: Omit<GetProblemsRequestQueryDto, "type">): UseInfiniteQueryOptions<
  ProblemsPage,
  Error,
  InfiniteData<ProblemsPage>,
  unknown[],
  number | undefined
> => {
  return {
    queryKey: ["problems", { limit }, { sort, order }, keyword],

    queryFn: ({ pageParam = 1 }) => {
      const paging = pageParam
        ? { page: pageParam, limit: limit ?? DEFAULT_LIMIT }
        : { page, limit };

      return fetchProblems({
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

    initialPageParam: 1
  };
};

async function fetchProblemById({ id }: GetProblemByIdRequestParamsDto) {
  const res = await axiosInstance.get<GetProblemByIdResponseDto>(`/problems/${id}`);
  return res.data;
}

export const createGetProblemByIdQueryOptions = (
  params: GetProblemByIdRequestParamsDto
): UseQueryOptions<GetProblemByIdResponseDto, Error> => ({
  queryKey: ["problem", params.id],
  queryFn: () => fetchProblemById(params),
  enabled: !!params.id
});

async function updateProblemById(
  { id }: UpdateProblemRequestParamsDto,
  body: UpdateProblemRequestBodyDto
) {
  const res = await axiosInstance.put<UpdateProblemResponseDto>(`/problems/${id}`, body);

  return res.data;
}

export const createUpdateProblemMutationOptions = ({
  id
}: UpdateProblemRequestParamsDto): UseMutationOptions<
  UpdateProblemResponseDto,
  Error,
  UpdateProblemRequestBodyDto
> => ({
  mutationFn: async (data) => {
    return updateProblemById({ id }, data);
  }
});

export async function createProblem(body: CreateProblemRequestBodyDto) {
  const res = await axiosInstance.post<CreateProblemResponseDto>("/problems", body);
  return res.data;
}

export const createCreateProblemMutationOptions = (): UseMutationOptions<
  CreateProblemResponseDto,
  Error,
  CreateProblemRequestBodyDto
> => ({
  mutationFn: (data) => createProblem(data)
});

export type {
  Problem,
  ProblemWithTestcases,
  UpdateProblemRequestBodyDto,
  CreateProblemRequestBodyDto
};
