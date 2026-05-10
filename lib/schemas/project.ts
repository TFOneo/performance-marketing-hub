import { z } from "zod";
import { ProjectStatusEnum } from "./enums";

const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format");

export const projectInputSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  owner: z.string().max(100).optional().nullable(),
  status: ProjectStatusEnum.default("not_started"),
  progress_pct: z.coerce.number().int().min(0).max(100).default(0),
  due_date: isoDate.optional().nullable(),
  notes_markdown: z.string().max(20000).optional().nullable(),
  linked_campaign_ids: z.array(z.string().uuid()).default([]),
});

export const projectUpdateSchema = projectInputSchema.partial().extend({
  id: z.string().uuid(),
});

export const projectStatusUpdateSchema = z.object({
  id: z.string().uuid(),
  status: ProjectStatusEnum,
});

export type ProjectInput = z.infer<typeof projectInputSchema>;
export type ProjectUpdate = z.infer<typeof projectUpdateSchema>;
