import { z } from 'zod';

// Mirrors the Api* structs in backend-extensions/dev_luxxy_supportsystem/src/models.rs.
// Field names are camelCase here; parseFromApi/serializeForApi remap to/from the
// backend's snake_case wire format.

export const ticketSettingsSchema = z.object({
  uuid: z.string(),
  enabled: z.boolean(),
  categoriesEnabled: z.boolean(),
  allowClientClose: z.boolean(),
  allowReplyOnClosed: z.boolean(),
  createTicketRateLimitHits: z.number(),
  createTicketRateLimitWindowSeconds: z.number(),
  maxOpenTicketsPerUser: z.number(),
  created: z.string(),
  updated: z.string(),
});

export const discordWebhookSettingsSchema = z.object({
  enabled: z.boolean(),
  webhookUrl: z.string().nullable(),
  notifyOnTicketCreated: z.boolean(),
  notifyOnClientReply: z.boolean(),
  notifyOnStaffReply: z.boolean(),
  notifyOnInternalNote: z.boolean(),
  notifyOnStatusChange: z.boolean(),
  notifyOnAssignmentChange: z.boolean(),
  notifyOnTicketDeleted: z.boolean(),
});

export const ticketCategorySchema = z.object({
  uuid: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  color: z.string().nullable(),
  sortOrder: z.number(),
  enabled: z.boolean(),
  created: z.string(),
  updated: z.string(),
});

export const ticketCategorySummarySchema = z.object({
  uuid: z.string(),
  name: z.string(),
  color: z.string().nullable(),
});

export const ticketUserSummarySchema = z.object({
  uuid: z.string(),
  username: z.string(),
  nameFirst: z.string(),
  nameLast: z.string(),
  admin: z.boolean(),
});

export const ticketLinkedServerSchema = z.object({
  uuid: z.string().nullable(),
  snapshotName: z.string().nullable(),
  snapshotUuidShort: z.number().nullable(),
  deletedAt: z.string().nullable(),
  currentName: z.string().nullable(),
  currentUuidShort: z.number().nullable(),
  currentStatus: z.string().nullable(),
  currentIsSuspended: z.boolean().nullable(),
  currentOwnerUsername: z.string().nullable(),
});

export const ticketServerOptionSchema = z.object({
  uuid: z.string(),
  uuidShort: z.number(),
  name: z.string(),
  ownerUsername: z.string(),
  nestName: z.string(),
  eggName: z.string(),
  isSuspended: z.boolean(),
  status: z.string().nullable(),
});

export const ticketAttachmentSchema = z.object({
  uuid: z.string(),
  originalName: z.string(),
  contentType: z.string(),
  mediaType: z.enum(['image', 'video']),
  size: z.number(),
  url: z.string(),
  created: z.string(),
});

export const ticketMessageSchema = z.object({
  uuid: z.string(),
  authorUserUuid: z.string().nullable(),
  authorUsername: z.string(),
  authorDisplayName: z.string(),
  authorAvatar: z.string().nullable(),
  authorType: z.string(),
  body: z.string(),
  isInternal: z.boolean(),
  attachments: z.array(ticketAttachmentSchema),
  created: z.string(),
  updated: z.string(),
});

export const ticketAuditEventSchema = z.object({
  uuid: z.string(),
  actorUserUuid: z.string().nullable(),
  actorUsername: z.string().nullable(),
  actorType: z.string(),
  event: z.string(),
  payload: z.record(z.string(), z.unknown()),
  created: z.string(),
});

export const ticketSummarySchema = z.object({
  uuid: z.string(),
  subject: z.string(),
  status: z.string(),
  priority: z.string().nullable(),
  creator: ticketUserSummarySchema,
  category: ticketCategorySummarySchema.nullable(),
  assignedUser: ticketUserSummarySchema.nullable(),
  linkedServer: ticketLinkedServerSchema,
  lastReplyAt: z.string().nullable(),
  lastReplyByType: z.string().nullable(),
  created: z.string(),
  updated: z.string(),
  closedAt: z.string().nullable(),
});

export const ticketDetailSchema = z.object({
  ticket: ticketSummarySchema,
  metadata: z.record(z.string(), z.unknown()),
  messages: z.array(ticketMessageSchema),
  auditEvents: z.array(ticketAuditEventSchema),
});

export const clientTicketBootstrapSchema = z.object({
  settings: ticketSettingsSchema,
  categories: z.array(ticketCategorySchema),
  servers: z.array(ticketServerOptionSchema),
});

export const adminTicketBootstrapSchema = z.object({
  settings: ticketSettingsSchema,
  categories: z.array(ticketCategorySchema),
  staffUsers: z.array(ticketUserSummarySchema),
});

export const adminTicketSettingsDetailSchema = z.object({
  settings: ticketSettingsSchema,
  discordWebhook: discordWebhookSettingsSchema,
});

// Request schemas, mirrored against the *Request structs in models.rs (now snake_case
// on the wire since rename_all = "camelCase" was dropped from those structs).

export const clientCreateTicketRequestSchema = z.object({
  serverUuid: z.string().optional(),
  categoryUuid: z.string().optional(),
  subject: z.string(),
  message: z.string(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export const clientReplyTicketRequestSchema = z.object({
  body: z.string(),
});

export const clientUpdateTicketStatusRequestSchema = z.object({
  status: z.string(),
});

export const adminTicketMessageRequestSchema = z.object({
  body: z.string(),
  isInternal: z.boolean(),
});

export const adminUpdateTicketStatusRequestSchema = z.object({
  status: z.string(),
});

export const adminAssignTicketRequestSchema = z.object({
  assignedUserUuid: z.string().nullable(),
});

export const adminUpdateTicketPriorityRequestSchema = z.object({
  priority: z.string().nullable(),
});

export const adminUpdateTicketCategoryRequestSchema = z.object({
  categoryUuid: z.string().nullable(),
});

export const adminUpdateTicketSettingsRequestSchema = z.object({
  enabled: z.boolean(),
  categoriesEnabled: z.boolean(),
  allowClientClose: z.boolean(),
  allowReplyOnClosed: z.boolean(),
  createTicketRateLimitHits: z.number(),
  createTicketRateLimitWindowSeconds: z.number(),
  maxOpenTicketsPerUser: z.number(),
  discordWebhookEnabled: z.boolean(),
  discordWebhookUrl: z.string(),
  discordNotifyOnTicketCreated: z.boolean(),
  discordNotifyOnClientReply: z.boolean(),
  discordNotifyOnStaffReply: z.boolean(),
  discordNotifyOnInternalNote: z.boolean(),
  discordNotifyOnStatusChange: z.boolean(),
  discordNotifyOnAssignmentChange: z.boolean(),
  discordNotifyOnTicketDeleted: z.boolean(),
});

export const adminUpsertTicketCategoryRequestSchema = z.object({
  uuid: z.string().optional(),
  name: z.string(),
  description: z.string().optional(),
  color: z.string().optional(),
  sortOrder: z.number(),
  enabled: z.boolean(),
});
