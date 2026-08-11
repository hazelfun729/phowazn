import { pgTable, serial, timestamp, varchar, date, index } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const healthCheck = pgTable("health_check", {
	id: serial().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
});

export const deceasedRecords = pgTable(
  "deceased_records",
  {
    id: serial().primaryKey(),
    name: varchar("name", { length: 50 }).notNull(),
    category: varchar("category", { length: 20 }).notNull(), // 'deceased' | 'infants' | 'animals'
    death_date: date("death_date").notNull(),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("deceased_records_category_idx").on(table.category),
    index("deceased_records_death_date_idx").on(table.death_date),
    index("deceased_records_created_at_idx").on(table.created_at),
  ]
);
