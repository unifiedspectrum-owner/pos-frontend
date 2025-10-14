/* Libraries imports */
import { z } from 'zod';

/* Ticket status validation schema */
export const ticketStatusSchema = z.enum([
  'new',
  'open',
  'in_progress',
  'pending_customer',
  'pending_internal',
  'escalated',
  'resolved',
  'closed',
  'cancelled'
]);

/* Attachment validation schema */
export const attachmentSchema = z.object({
  filename: z.string().min(1, { message: "Filename is required" }).max(255),
  file_size: z.number().int().positive({ message: "File size must be positive" }).max(10485760, { message: "File size cannot exceed 10MB" }),
  mime_type: z.string().min(1, { message: "MIME type is required" }),
  file_extension: z.string().max(10).nullable().optional(),
  file_content: z.string().min(1, { message: "File content is required" }), /* Base64 encoded file content */
  is_public: z.boolean()
});

/* Create ticket request validation schema */
export const createTicketSchema = z.object({
  tenant_id: z.string(),
  requester_user_id: z.string().nullable().optional(),
  requester_email: z.string().email({ message: "Invalid email format" }),
  requester_name: z.string().min(2, { message: "Requester name must be at least 2 characters" }).max(255),
  requester_phone: z.string().nullable().optional(),
  category_id: z.string({ message: "Valid category ID is required" }),
  subject: z.string().min(5, { message: "Subject must be at least 5 characters" }).max(500),
  message_content: z.string().min(10, { message: "Initial message must be at least 10 characters" }),
  resolution_due: z.string().nullable().optional(),
  internal_notes: z.string().nullable().optional(),
  attachments: z.array(attachmentSchema).max(5, { message: "Maximum 5 attachments allowed per ticket" }).nullable().optional()
});

/* Create communication comment request validation schema */
export const createTicketCommunicationSchema = z.object({
  message_content: z.string().min(1, { message: "Message content is required" }).max(10000, { message: "Message content cannot exceed 10000 characters" }),
  is_internal: z.boolean(),
  attachments: z.array(attachmentSchema).max(5, { message: "Maximum 5 attachments allowed per communication" }).nullable().optional()
});

/* Update ticket status schema */
export const updateTicketStatusSchema = z.object({
  status: ticketStatusSchema,
  status_reason: z.string().min(5).max(500),
});

/* Update ticket request validation schema - all fields from createTicketSchema made optional plus status field */
export const updateTicketSchema = createTicketSchema.partial();

/* Assign ticket schema */
export const assignTicketSchema = z.object({
  user_id: z.string().min(1, { message: "Valid user ID is required" }),
  reason: z.string().min(5, { message: "Assignment reason must be at least 5 characters" }).max(500)
});

/* Ticket creation form schema */
export type CreateTicketFormSchema = z.infer<typeof createTicketSchema>;

/* Ticket update form schema */
export type UpdateTicketFormSchema = z.infer<typeof updateTicketSchema>;

/* Ticket comment form schema */
export type CreateTicketCommentFormSchema = z.infer<typeof createTicketCommunicationSchema>;

/* Ticket assignment form schema */
export type AssignTicketFormSchema = z.infer<typeof assignTicketSchema>;
export type UpdateTicketStatusFormSchema = z.infer<typeof updateTicketStatusSchema>;