import { z } from "zod";
import {
  SERVICE_REQUEST_PRIORITIES,
  type CreateServiceRequest,
} from "../../api/types";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function requiredText(label: string, min: number, max: number) {
  return z
    .string()
    .trim()
    .min(1, `${label} is required.`)
    .min(min, `${label} must be at least ${min} characters long.`)
    .max(max, `${label} must be ${max} characters or fewer.`);
}

export const createRequestSchema = z.object({
  title: requiredText("Title", 3, 120),
  description: requiredText("Description", 10, 2000),
  category: requiredText("Category", 2, 50),
  priority: z.enum(SERVICE_REQUEST_PRIORITIES, { error: "Choose a priority." }),
  requesterName: requiredText("Requester name", 2, 100),
  requesterEmail: z
    .string()
    .trim()
    .min(1, "Requester email is required.")
    .max(254, "Enter a valid email address.")
    .regex(EMAIL_PATTERN, "Enter a valid email address."),
}) satisfies z.ZodType<CreateServiceRequest>;

export type CreateRequestFormValues = z.input<typeof createRequestSchema>;

export const CREATE_REQUEST_FIELDS = Object.keys(
  createRequestSchema.shape,
) as (keyof CreateRequestFormValues)[];

export const DESCRIPTION_MAX_LENGTH = 2000;
