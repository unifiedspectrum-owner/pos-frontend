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
  resolution_due: z.string().datetime().nullable().optional(),
  internal_notes: z.string().nullable().optional(),
  attachments: z.array(attachmentSchema).max(5, { message: "Maximum 5 attachments allowed per ticket" }).nullable().optional()
});

/* Create communication comment request validation schema */
export const createTicketCommunicationSchema = z.object({
  ticket_id: z.string().min(1, { message: "Ticket ID is required" }),
  message_content: z.string().min(1, { message: "Message content is required" }).max(10000, { message: "Message content cannot exceed 10000 characters" }),
  is_internal: z.boolean(),
  attachments: z.array(attachmentSchema).max(5, { message: "Maximum 5 attachments allowed per communication" }).nullable().optional()
});

/* Update ticket request validation schema */
export const updateTicketSchema = z.object({
  category_id: z.string({ message: "Valid category ID is required" }).optional(),
  subject: z.string().min(5, { message: "Subject must be at least 5 characters" }).max(500).optional(),
  status: ticketStatusSchema.optional(),
  resolution_due: z.string().datetime().nullable().optional(),
  internal_notes: z.string().nullable().optional()
});

/* Assign ticket schema */
export const assignTicketSchema = z.object({
  ticket_id: z.string().min(1, { message: "Ticket ID is required" }),
  assigned_to_user_id: z.number().int().positive({ message: "Valid user ID is required" }).nullable().optional(),
  assignment_reason: z.string().min(5, { message: "Assignment reason must be at least 5 characters" }).max(500).optional()
});

/* Ticket creation form schema */
export type CreateTicketFormSchema = z.infer<typeof createTicketSchema>;

/* Ticket update form schema */
export type UpdateTicketFormSchema = z.infer<typeof updateTicketSchema>;

export type CreateTicketCommentFormSchema = z.infer<typeof createTicketCommunicationSchema>;
export type assignTicketFormSchema = z.infer<typeof assignTicketSchema>;