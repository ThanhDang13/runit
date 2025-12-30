/* eslint-disable @nx/enforce-module-boundaries */
import { MutationOptions } from "@tanstack/react-query";
import { axiosInstance } from "@web/lib/axios";
import type { UpdateProfileRequestBodyDto } from "@api/app/modules/user/dtos/profile.dtos";
import type { UserResponseDto } from "@api/app/modules/user/dtos/user.dtos";
import { UseQueryOptions } from "@tanstack/react-query";
import { useAuthStore } from "@web/stores/auth-store";
import type { ChangePasswordRequestBodyDto } from "@api/app/modules/user/dtos/change-password.dtos";

export const createProfileQueryOptions = (): UseQueryOptions<
  UserResponseDto,
  Error,
  UserResponseDto
> => {
  const token = useAuthStore.getState().token;

  return {
    queryKey: ["profile"],
    queryFn: async () => {
      const res = await axiosInstance.get<UserResponseDto>("/profile");
      return res.data;
    },
    enabled: !!token,
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    staleTime: 1000 * 60 * 5
  };
};

const updateProfile = async (data: UpdateProfileRequestBodyDto): Promise<UserResponseDto> => {
  const res = await axiosInstance.put<UserResponseDto>("/profile", {
    ...data
  });
  return res.data;
};

export const createUpdateProfileMutationOptions = (): MutationOptions<
  UserResponseDto,
  Error,
  UpdateProfileRequestBodyDto
> => {
  return {
    mutationKey: ["update-profile"],
    mutationFn: updateProfile
  };
};

const changePassword = async (data: ChangePasswordRequestBodyDto): Promise<{ success: true }> => {
  const res = await axiosInstance.post<{ success: true }>("/auth/change-password", {
    ...data
  });
  return res.data;
};

export const createChangePasswordMutationOptions = (): MutationOptions<
  { success: true },
  Error,
  ChangePasswordRequestBodyDto
> => {
  return {
    mutationKey: ["change-password"],
    mutationFn: changePassword
  };
};
