/* Libraries imports */
import { z } from "zod/v4";

/* Shared module imports */
import { DIAL_CODE_REGEX, PHONE_NUMBER_REGEX } from "@shared/constants";

/* Phone number tuple validation schema */
export const PhoneNumberSchema = z.tuple([
  z.string().regex(DIAL_CODE_REGEX, "Invalid dial code"),  // First element
  z.string().regex(PHONE_NUMBER_REGEX, "Invalid phone number"), // Second element
]);