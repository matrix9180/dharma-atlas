import { z } from "zod";

export const createClaimSchema = z.object({
  placeId: z.string().min(1).optional(),
  placeName: z.string().min(1, "Place name is required"),
  listingUrl: z.string().url().optional().or(z.literal("")),
  affiliationRole: z.string().min(1, "Affiliation role is required"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

export type CreateClaimInput = z.infer<typeof createClaimSchema>;
