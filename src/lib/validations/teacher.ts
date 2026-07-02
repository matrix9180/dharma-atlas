import { z } from "zod";

export const bookSchema = z.object({
  title: z.string().min(1, "Book title is required"),
  year: z.coerce.number().int(),
  publisher: z.string().min(1, "Publisher is required"),
  url: z.string().optional(),
});

export const retreatSchema = z.object({
  title: z.string().min(1, "Retreat title is required"),
  dates: z.string().min(1, "Dates are required"),
  location: z.string().min(1, "Location is required"),
  price: z.string().optional(),
});

export const socialSchema = z.object({
  label: z.string().min(1, "Social label is required"),
  url: z.string().url(),
});

export const relationSchema = z.object({
  slug: z.string().optional(),
  name: z.string().min(1, "Name is required"),
  role: z.string().min(1, "Role is required"),
  note: z.string().optional(),
  type: z.enum(["teacher", "peer", "student"]),
});

export const teacherInputSchema = z.object({
  slug: z.string().min(1, "Slug is required"),
  name: z.string().min(1, "Name is required"),
  tradition: z.string().min(1, "Tradition is required"),
  lineage: z.string().min(1, "Lineage is required"),
  location: z.string().min(1, "Location is required"),
  base: z.string().optional(),
  yearsTeaching: z.coerce.number().int().min(0),
  birthYear: z.coerce.number().int().optional().nullable(),
  deathYear: z.coerce.number().int().optional().nullable(),
  languages: z.array(z.string()),
  shortBio: z.string(),
  biography: z.array(z.string()),
  topics: z.array(z.string()),
  photo: z.string(),
  heroPhoto: z.string().optional(),
  website: z.string().optional(),
  socials: z.array(socialSchema),
  bibliography: z.array(bookSchema),
  retreats: z.array(retreatSchema),
  relations: z.array(relationSchema),
  isDraft: z.boolean().default(false),
});

export type TeacherInput = z.infer<typeof teacherInputSchema>;
