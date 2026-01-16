import {
  type GetSubmissionsResponseDto,
  type GetSubmissionsRequestQueryDto
} from "@api/app/modules/submission/dtos/get-submissions.dtos";
import { InfiniteData, UseInfiniteQueryOptions, UseMutationOptions } from "@tanstack/react-query";
import { axiosInstance } from "@web/lib/axios";
import type { Prettify } from "@api/app/common/types/common";
import type { SubmissionStatus, Submission } from "@api/app/modules/submission/dtos/common.dtos";

async function fetchSubmissions({
  type,
  page,
  limit,
  sort,
  order,
  userId,
  problemId,
  language,
  status
}: GetSubmissionsRequestQueryDto): Promise<GetSubmissionsResponseDto> {
  const params = new URLSearchParams({
    type,
    page: page.toString(),
    limit: limit.toString(),
    order
  });

  if (sort) {
    params.append("sort", sort);
  }
  if (userId) {
    params.append("userId", userId);
  }
  if (problemId) {
    params.append("problemId", problemId);
  }
  if (language) {
    params.append("language", language);
  }
  if (status) {
    params.append("status", status);
  }

  const res = await axiosInstance.get<GetSubmissionsResponseDto>(
    `/submissions?${params.toString()}`
  );

  return res.data;
}

export type SubmissionsPage = Prettify<GetSubmissionsResponseDto>;

const DEFAULT_LIMIT = 10;

export const createGetSubmissionsInfiniteQueryOptions = ({
  limit,
  sort,
  order,
  userId,
  problemId,
  language,
  status,
  page
}: Omit<GetSubmissionsRequestQueryDto, "type">): UseInfiniteQueryOptions<
  SubmissionsPage,
  Error,
  InfiniteData<SubmissionsPage>,
  unknown[],
  number | undefined
> => {
  return {
    queryKey: ["submissions", { limit, sort, order, page, userId, problemId, language, status }],

    queryFn: ({ pageParam = 1 }) => {
      const paging = pageParam
        ? { page: pageParam, limit: limit ?? DEFAULT_LIMIT }
        : { page, limit };

      return fetchSubmissions({
        type: "offset",
        page: paging.page,
        limit: paging.limit,
        sort,
        order,
        userId,
        problemId,
        language,
        status
      });
    },

    getNextPageParam: (lastPage) => {
      const totalPages = Math.ceil(lastPage.total / (limit ?? DEFAULT_LIMIT));
      const nextPage = lastPage.paging.page + 1;

      return nextPage <= totalPages ? nextPage : undefined;
    },

    initialPageParam: page ?? 1
  };
};

export async function deleteSubmission({ id }: { id: string }) {
  const res = await axiosInstance.delete<{ id: string }>(`/submissions/${id}`);
  return res.data;
}

export const createDeleteSubmissionMutationOptions = (): UseMutationOptions<
  { id: string },
  Error,
  { id: string }
> => ({
  mutationFn: (data) => deleteSubmission(data)
});

export type {
  GetSubmissionsRequestQueryDto,
  GetSubmissionsResponseDto,
  Submission,
  SubmissionStatus
};
