import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { GetUsersQuery } from "@api/app/modules/user/queries/get-users.query";
import { GetUsersResponseDto } from "@api/app/modules/user/dtos/user.dtos";
import { Inject } from "@nestjs/common";
import { PGDatabase } from "@api/app/infrastructure/database/database.service";
import { users } from "@api/app/infrastructure/database/schema";
import { and, asc, desc, ilike, sql } from "drizzle-orm";
import { normalizeToIso } from "@api/app/common/helpers/common";

@QueryHandler(GetUsersQuery)
export class GetUsersHandler implements IQueryHandler<GetUsersQuery, GetUsersResponseDto> {
  constructor(@Inject("PG") private readonly db: PGDatabase) {}

  async execute(query: GetUsersQuery): Promise<GetUsersResponseDto> {
    const { paging, keyword } = query;
    const { type, page, limit, sort, order } = paging;

    const allowedSort = ["name", "email", "createdAt"];

    const sortColumnMap = {
      name: users.name,
      email: users.email,
      createdAt: users.createdAt
    };

    const safeSort = allowedSort.includes(sort) ? sortColumnMap[sort] : sortColumnMap["createdAt"];

    const orderExpression = order === "asc" ? asc(safeSort) : desc(safeSort);

    const filters = [];
    if (keyword) {
      filters.push(ilike(users.name, `%${keyword}%`));
      filters.push(ilike(users.email, `%${keyword}%`));
    }

    const whereClause = filters.length ? and(...filters) : undefined;

    const [{ count }] = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(users)
      .where(whereClause);

    const offset = (page - 1) * limit;

    const results = await this.db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
        role: users.role
      })
      .from(users)
      .where(whereClause)
      .orderBy(orderExpression)
      .limit(limit)
      .offset(offset);

    return {
      type,
      paging: paging,
      total: Number(count),
      data: results
    };
  }
}
