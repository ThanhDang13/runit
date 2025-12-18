import { createZodDto } from "nestjs-zod";
import z from "zod";
import { UserSchema } from "@api/app/modules/auth/dtos/auth.dtos";
import { OffsetPaginatedSchema, OffsetPagingDTOSchema } from "@api/app/common/types/pagination";

export const CreateUserRequestBodySchema = UserSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true
}).extend({
  password: z.string().min(8)
});

export class CreateUserRequestBodyDto extends createZodDto(CreateUserRequestBodySchema) {}

export const UpdateUserRequestParamsSchema = z.object({
  id: z.uuid()
});

export class UpdateUserRequestParamsDto extends createZodDto(UpdateUserRequestParamsSchema) {}

export const UpdateUserRequestBodySchema = UserSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true
})
  .partial()
  .extend({
    password: z.string().min(8).optional()
  });

export class UpdateUserRequestBodyDto extends createZodDto(UpdateUserRequestBodySchema) {}

export const GetUserByIdRequestParamsSchema = z.object({
  id: z.uuid()
});

export class GetUserByIdRequestParamsDto extends createZodDto(GetUserByIdRequestParamsSchema) {}

export const GetUsersRequestQuerySchema = z
  .object({
    keyword: z.string().optional()
  })
  .extend(OffsetPagingDTOSchema.shape);

export class GetUsersRequestQueryDto extends createZodDto(GetUsersRequestQuerySchema) {}

export const UserResponseSchema = UserSchema;

export class UserResponseDto extends createZodDto(UserResponseSchema) {}

export const GetUsersResponseSchema = OffsetPaginatedSchema(UserResponseSchema);

export class GetUsersResponseDto extends createZodDto(GetUsersResponseSchema) {}
