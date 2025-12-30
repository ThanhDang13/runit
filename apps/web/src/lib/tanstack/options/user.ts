import type {
  CreateUserRequestBodyDto,
  GetUserByIdRequestParamsDto,
  UserResponseDto,
  GetUsersRequestQueryDto,
  GetUsersResponseDto,
  UpdateUserRequestBodyDto,
  UpdateUserRequestParamsDto
} from "@api/app/modules/user/dtos/user.dtos";
import { axiosInstance } from "@web/lib/axios";
import {
  InfiniteData,
  UseInfiniteQueryOptions,
  UseMutationOptions,
  UseQueryOptions
} from "@tanstack/react-query";
import type { OffsetPaginated } from "@api/app/common/types/pagination";

async function fetchUsers(query: GetUsersRequestQueryDto): Promise<GetUsersResponseDto> {
  const params = new URLSearchParams({
    type: query.type,
    page: query.page.toString(),
    limit: query.limit.toString(),
    order: query.order
  });

  if (query.sort) params.append("sort", query.sort);
  if (query.keyword) params.append("keyword", query.keyword);

  const res = await axiosInstance.get<GetUsersResponseDto>(`/users?${params.toString()}`);
  return res.data;
}

export type UsersPage = GetUsersResponseDto;

const DEFAULT_LIMIT = 10;

export const createGetUsersInfiniteQueryOptions = ({
  limit,
  sort,
  order,
  keyword,
  page
}: Omit<GetUsersRequestQueryDto, "type"> & { type: "offset" | "cursor" }): UseInfiniteQueryOptions<
  UsersPage,
  Error,
  InfiniteData<UsersPage>,
  unknown[],
  number | undefined
> => ({
  queryKey: ["users", { limit }, { sort, order }, keyword],

  queryFn: ({ pageParam = 1 }) => {
    const paging = pageParam ? { page: pageParam, limit: limit ?? DEFAULT_LIMIT } : { page, limit };
    return fetchUsers({
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
});

async function fetchUserById({ id }: GetUserByIdRequestParamsDto) {
  const res = await axiosInstance.get<UserResponseDto>(`/users/${id}`);
  return res.data;
}

export const createGetUserByIdQueryOptions = (
  params: GetUserByIdRequestParamsDto
): UseQueryOptions<UserResponseDto, Error> => ({
  queryKey: ["user", params.id],
  queryFn: () => fetchUserById(params),
  enabled: !!params.id
});

async function updateUserById({ id }: UpdateUserRequestParamsDto, body: UpdateUserRequestBodyDto) {
  const res = await axiosInstance.put<UserResponseDto>(`/users/${id}`, body);
  return res.data;
}

export const createUpdateUserMutationOptions = ({
  id
}: UpdateUserRequestParamsDto): UseMutationOptions<
  UserResponseDto,
  Error,
  UpdateUserRequestBodyDto
> => ({
  mutationFn: (data) => updateUserById({ id }, data)
});

export async function createUser(body: CreateUserRequestBodyDto) {
  const res = await axiosInstance.post<UserResponseDto>("/users", body);
  return res.data;
}

export const createCreateUserMutationOptions = (): UseMutationOptions<
  UserResponseDto,
  Error,
  CreateUserRequestBodyDto
> => ({
  mutationFn: (data) => createUser(data)
});

export async function deleteUser({ id }: GetUserByIdRequestParamsDto) {
  const res = await axiosInstance.delete<{ id: string }>(`/users/${id}`);
  return res.data;
}

export const createDeleteUserMutationOptions = (): UseMutationOptions<
  { id: string },
  Error,
  GetUserByIdRequestParamsDto
> => ({
  mutationFn: (data) => deleteUser(data)
});

export type { UserResponseDto, UpdateUserRequestBodyDto, CreateUserRequestBodyDto };
