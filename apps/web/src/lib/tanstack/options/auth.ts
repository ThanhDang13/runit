/* eslint-disable @nx/enforce-module-boundaries */
import { MutationOptions } from "@tanstack/react-query";
import { axiosInstance } from "@web/lib/axios";
import {
  type LoginRequestBodyDto,
  type SignupRequestBodyDto,
  type AuthResponseDto,
  type TokenPayloadResponseDto
} from "@api/app/modules/auth/dtos/auth.dtos";

import type { UseQueryOptions } from "@tanstack/react-query";
import { useAuthStore } from "@web/stores/auth-store";

const login = async (data: LoginRequestBodyDto) => {
  const response = await axiosInstance.post<AuthResponseDto>("auth/login", {
    ...data
  });
  return response.data;
};

export const createLoginMutationOptions = (): MutationOptions<
  AuthResponseDto,
  Error,
  LoginRequestBodyDto
> => {
  return {
    mutationKey: ["login"],
    mutationFn: login
  };
};

const signup = async (data: SignupRequestBodyDto) => {
  const response = await axiosInstance.post<AuthResponseDto>("auth/signup", {
    ...data
  });
  return response.data;
};

export const createSignupMutationOptions = (): MutationOptions<
  AuthResponseDto,
  Error,
  SignupRequestBodyDto
> => {
  return {
    mutationKey: ["signup"],
    mutationFn: signup
  };
};

export const createMeQueryOptions = (): UseQueryOptions<TokenPayloadResponseDto, Error> => {
  const token = useAuthStore.getState().token;

  return {
    queryKey: ["me"],
    queryFn: async () => {
      const res = await axiosInstance.get("/auth/me");
      return res.data;
    },
    enabled: !!token,
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    staleTime: 1000 * 60 * 5
  };
};

export type { LoginRequestBodyDto, SignupRequestBodyDto, AuthResponseDto, TokenPayloadResponseDto };
