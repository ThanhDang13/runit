import { sql } from "drizzle-orm";
import {
  pgTable,
  text,
  varchar,
  boolean,
  json,
  unique,
  customType,
  pgEnum,
  integer
} from "drizzle-orm/pg-core";

export const userRoleEnum = pgEnum("user_role", ["user", "admin"]);

// ------------------- ISO8601 TIMESTAMP -------------------
export const ISO8601Timestamp = customType<{
  data: string;
  driverData: string;
  config: { withTimezone?: boolean; precision?: number };
}>({
  dataType(config) {
    const precision = config?.precision !== undefined ? `(${config.precision})` : "";
    return `timestamp${precision}${config?.withTimezone ? " with time zone" : ""}`;
  },
  fromDriver(value: string): string {
    return new Date(value).toISOString();
  },
  toDriver(value: string | Date): string {
    return typeof value === "string" ? value : value.toISOString();
  }
});

const timestamp = {
  createdAt: ISO8601Timestamp("created_at", { withTimezone: true })
    .default(sql`now()`)
    .notNull(),
  updatedAt: ISO8601Timestamp("updated_at", { withTimezone: true })
    .default(sql`now()`)
    .notNull()
};

// ------------------- USERS -------------------
export const users = pgTable(
  "users",
  {
    id: text("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`)
      .notNull(),
    email: varchar("email", { length: 255 }).notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    role: userRoleEnum("role").notNull().default("user"),
    active: boolean("active").default(true).notNull(),
    passwordHash: text("password_hash").notNull(),
    ...timestamp
  },
  (table) => [unique("users_email_unique").on(table.email)]
);

// ------------------- PROBLEMS -------------------
export const problems = pgTable("problems", {
  id: text("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`)
    .notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  difficulty: varchar("difficulty", { length: 50 }).notNull(),
  ...timestamp
});

// ------------------- TESTCASES -------------------
export const testcases = pgTable("testcases", {
  id: text("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`)
    .notNull(),
  problemId: text("problem_id")
    .notNull()
    .references(() => problems.id, { onDelete: "cascade" }),
  input: text("input").notNull(),
  expectedOutput: text("expected_output").notNull(),
  isSample: boolean("is_sample").default(false).notNull(),
  ...timestamp
});

export const submissions = pgTable("submissions", {
  id: text("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`)
    .notNull(),
  problemId: text("problem_id")
    .notNull()
    .references(() => problems.id, { onDelete: "cascade" }),
  contestId: text("contest_id").references(() => contests.id, { onDelete: "set null" }),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  language: varchar("language", { length: 50 }).notNull(),
  code: text("code").notNull(),
  status: varchar("status", { length: 50 }).notNull(),
  summary: json("summary"),
  ...timestamp
});

// ------------------- CONTESTS -------------------

export const contests = pgTable("contests", {
  id: text("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`)
    .notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  startTime: ISO8601Timestamp("start_time", { withTimezone: true }).notNull(),
  endTime: ISO8601Timestamp("end_time", { withTimezone: true }).notNull(),
  ...timestamp
});

export const contestProblems = pgTable("contest_problems", {
  id: text("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`)
    .notNull(),
  contestId: text("contest_id")
    .notNull()
    .references(() => contests.id, { onDelete: "cascade" }),
  problemId: text("problem_id")
    .notNull()
    .references(() => problems.id, { onDelete: "cascade" }),
  order: integer("order").default(0).notNull(),
  ...timestamp
});

export const contestParticipants = pgTable("contest_participants", {
  id: text("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`)
    .notNull(),
  contestId: text("contest_id")
    .notNull()
    .references(() => contests.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  joinedAt: ISO8601Timestamp("joined_at", { withTimezone: true })
    .default(sql`now()`)
    .notNull(),
  ...timestamp
});

//TODO: Implement problems tagging feature

// ------------------- TAGS -------------------
export const tags = pgTable(
  "tags",
  {
    id: text("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`)
      .notNull(),
    name: varchar("name", { length: 100 }).notNull(),
    ...timestamp
  },
  (table) => [unique("tags_name_unique").on(table.name)]
);

// ------------------- PROBLEM_TAGS -------------------
export const problemTags = pgTable(
  "problem_tags",
  {
    problemId: text("problem_id")
      .notNull()
      .references(() => problems.id, { onDelete: "cascade" }),
    tagId: text("tag_id")
      .notNull()
      .references(() => tags.id, { onDelete: "cascade" }),
    createdAt: ISO8601Timestamp({ withTimezone: true })
      .default(sql`now()`)
      .notNull()
  },
  (table) => [unique("problem_tags_unique").on(table.problemId, table.tagId)]
);
