import { MutationOptions } from "@tanstack/react-query";
import { axiosInstance } from "@web/lib/axios";
import {
  type LoginRequestBodyDto,
  type SignupRequestBodyDto,
  type AuthResponseDto,
  type TokenPayloadResponseDto,
  type ForgotPasswordRequestBodyDto,
  type ResetPasswordRequestBodyDto,
  type VerifyEmailRequestBodyDto,
  ResendVerificationRequestBodyDto
} from "@api/app/modules/auth/dtos/auth.dtos";

import type { UseQueryOptions } from "@tanstack/react-query";
import { useAuthStore } from "@web/stores/auth-store";
import { MessageResponseDto } from "@api/app/common/types/common";

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
  const response = await axiosInstance.post<MessageResponseDto>("auth/signup", {
    ...data
  });
  return response.data;
};

export const createSignupMutationOptions = (): MutationOptions<
  MessageResponseDto,
  Error,
  SignupRequestBodyDto
> => {
  return {
    mutationKey: ["signup"],
    mutationFn: signup
  };
};

const verifyEmail = async ({ token }: VerifyEmailRequestBodyDto) => {
  const response = await axiosInstance.post<MessageResponseDto>("auth/verify-email", {
    token
  });
  return response.data;
};

export const createVerifyEmailMutationOptions = (): MutationOptions<
  MessageResponseDto,
  Error,
  VerifyEmailRequestBodyDto
> => {
  return {
    mutationKey: ["verify-email"],
    mutationFn: verifyEmail
  };
};

export const resendVerification = async ({ email }: ResendVerificationRequestBodyDto) => {
  const response = await axiosInstance.post<MessageResponseDto>("/auth/resend-verification", {
    email
  });
  return response.data;
};

export const createResendVerificationMutationOptions = (): MutationOptions<
  MessageResponseDto,
  Error,
  ResendVerificationRequestBodyDto
> => {
  return {
    mutationKey: ["resend-verification"],
    mutationFn: resendVerification
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

const forgotPassword = async (data: ForgotPasswordRequestBodyDto): Promise<void> => {
  await axiosInstance.post("auth/forgot-password", {
    ...data
  });
};

export const createForgotPasswordMutationOptions = (): MutationOptions<
  void,
  Error,
  ForgotPasswordRequestBodyDto
> => {
  return {
    mutationKey: ["forgot-password"],
    mutationFn: forgotPassword
  };
};

const resetPassword = async (data: ResetPasswordRequestBodyDto): Promise<void> => {
  await axiosInstance.post("auth/reset-password", {
    ...data
  });
};

export const createResetPasswordMutationOptions = (): MutationOptions<
  void,
  Error,
  ResetPasswordRequestBodyDto
> => {
  return {
    mutationKey: ["reset-password"],
    mutationFn: resetPassword
  };
};

export type {
  LoginRequestBodyDto,
  SignupRequestBodyDto,
  AuthResponseDto,
  TokenPayloadResponseDto,
  ForgotPasswordRequestBodyDto,
  ResetPasswordRequestBodyDto
};
