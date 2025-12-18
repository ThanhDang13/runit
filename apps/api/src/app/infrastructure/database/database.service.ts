import * as schema from "@api/app/infrastructure/database/schema";
import * as relations from "@api/app/infrastructure/database/relations";
import { DrizzlePGConfig } from "@knaadh/nestjs-drizzle-pg";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import { env } from "@api/app/infrastructure/config/env.config";

const db = { ...schema, ...relations };
export type PGDatabase = NodePgDatabase<typeof db>;

export class PGDatabaseConfigService {
  create = (): DrizzlePGConfig => {
    return {
      pg: {
        connection: "pool" as const,
        config: {
          connectionString: env.DATABASE_URL
        }
      },
      config: { schema: db }
    };
  };
}
