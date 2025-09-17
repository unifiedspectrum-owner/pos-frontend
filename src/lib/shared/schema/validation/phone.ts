import { z } from "zod/v4";

/* Phone number tuple validation schema */
export const PhoneNumberSchema = z.tuple([
  z.string().regex(/^\+\d{1,4}$/, "Invalid dial code"),  // First element
  z.string().regex(/^\d{4,15}$/, "Invalid phone number"), // Second element
]);