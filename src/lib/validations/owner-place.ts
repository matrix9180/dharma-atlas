import { z } from "zod";
import { faiths, placeTypes } from "@/lib/validations/place";

export const ownerPlaceEditSchema = z.object({
  name: z.string().min(1, "Place name is required"),
  address: z.string(),
  phone: z.string().optional().nullable(),
  website: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
});

export type OwnerPlaceEditInput = z.infer<typeof ownerPlaceEditSchema>;

export const memberCreatePlaceSchema = z.object({
  name: z.string().min(1, "Place name is required"),
  type: z.enum(placeTypes),
  faith: z.enum(faiths).default("Buddhist"),
  tradition: z.string().min(1, "Tradition is required").default("Buddhist"),
  address: z.string().min(1, "Street address is required"),
  city: z.string().min(1, "City or region is required"),
  website: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
});

export type MemberCreatePlaceInput = z.infer<typeof memberCreatePlaceSchema>;
