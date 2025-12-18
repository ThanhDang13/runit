import z from "zod";

export const OffsetPagingDTOSchema = z.object({
  type: z.literal("offset").optional().default("offset"),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  sort: z.string().optional(),
  order: z.enum(["asc", "desc"]).optional().default("desc")
});

export type OffsetPagingDTO = z.infer<typeof OffsetPagingDTOSchema>;

export const OffsetPaginatedSchema = <T extends z.ZodTypeAny>(itemSchema: T) =>
  z.object({
    type: z.literal("offset").optional().default("offset"),
    data: z.array(itemSchema),
    total: z.coerce.number(),
    paging: OffsetPagingDTOSchema
  });

export type OffsetPaginated<E> = z.infer<ReturnType<typeof OffsetPaginatedSchema<z.ZodType<E>>>>;

export const CursorPagingDTOSchema = z.object({
  type: z.literal("cursor").optional().default("cursor"),
  limit: z.coerce.number().optional().default(20),
  cursor: z.iso.datetime().optional()
});

export type CursorPagingDTO = z.infer<typeof CursorPagingDTOSchema>;

export const CursorPaginatedSchema = <T extends z.ZodTypeAny>(itemSchema: T) =>
  z.object({
    type: z.literal("cursor").optional().default("cursor"),
    data: z.array(itemSchema),
    hasNextPage: z.boolean().default(false),
    paging: CursorPagingDTOSchema,
    nextCursor: z.iso.datetime().optional()
    // prevCursor: z.string().nullable().optional()
  });

export type CursorPaginated<E> = z.infer<ReturnType<typeof CursorPaginatedSchema<z.ZodType<E>>>>;

export type PagingDTO = OffsetPagingDTO | CursorPagingDTO;
export type Paginated<E> = OffsetPaginated<E> | CursorPaginated<E>;
