import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const registrations = sqliteTable("registrations", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  reference: text("reference").notNull().unique(),
  fullName: text("full_name").notNull(),
  email: text("email").notNull(),
  degree: text("degree").notNull(),
  institution: text("institution").notNull(),
  department: text("department").notNull().default(""),
  paperTitle: text("paper_title").notNull().default(""),
  topics: text("topics", { mode: "json" }).$type<string[]>().notNull(),
  participation: text("participation").notNull(),
  visaSupport: text("visa_support").notNull(),
  notes: text("notes").notNull().default(""),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});
