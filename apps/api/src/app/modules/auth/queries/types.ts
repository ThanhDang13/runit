import { InferSelectModel } from "drizzle-orm";
import { users } from "@api/app/infrastructure/database/schema";

export type User = InferSelectModel<typeof users>;
