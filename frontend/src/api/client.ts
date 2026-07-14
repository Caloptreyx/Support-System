import { axiosInstance } from '@/api/axios.ts';
import { parseFromApi, parsePaginationFromApi, serializeForApi } from '@/lib/api-transform.ts';
import {
  adminAssignTicketRequestSchema,
  adminTicketBootstrapSchema,
  adminTicketMessageRequestSchema,
  adminTicketSettingsDetailSchema,
  adminUpdateTicketCategoryRequestSchema,
  adminUpdateTicketPriorityRequestSchema,
  adminUpdateTicketSettingsRequestSchema,
  adminUpdateTicketStatusRequestSchema,
  adminUpsertTicketCategoryRequestSchema,
  clientCreateTicketRequestSchema,
  clientReplyTicketRequestSchema,
  clientTicketBootstrapSchema,
  clientUpdateTicketStatusRequestSchema,
  ticketCategorySchema,
  ticketDetailSchema,
  ticketSummarySchema,
} from '../schemas/index.ts';
import type {
  AdminTicketBootstrap,
  AdminTicketSettingsDetail,
  ClientTicketBootstrap,
  Paginated,
  TicketCategory,
  TicketDetail,
  TicketSummary,
} from '../types/index.ts';

export interface ClientTicketListParams {
  page: number;
  perPage: number;
  search?: string;
  status?: string;
}

export interface AdminTicketListParams {
  page: number;
  perPage: number;
  search?: string;
  status?: string;
  categoryUuid?: string;
  assignedUserUuid?: string;
  client?: string;
  server?: string;
  priority?: string;
}

export const getClientBootstrap = async (): Promise<ClientTicketBootstrap> => {
  const { data } = await axiosInstance.get('/api/client/support/bootstrap');
  return parseFromApi(clientTicketBootstrapSchema, data.support);
};

export const getClientTickets = async (params: ClientTicketListParams): Promise<Paginated<TicketSummary>> => {
  const { data } = await axiosInstance.get('/api/client/support/tickets', {
    params: {
      page: params.page,
      per_page: params.perPage,
      search: params.search || undefined,
      status: params.status || undefined,
    },
  });

  return parsePaginationFromApi(ticketSummarySchema, data.tickets);
};

export const createClientTicket = async (payload: {
  serverUuid?: string;
  categoryUuid?: string;
  subject: string;
  message: string;
  metadata?: Record<string, unknown>;
}): Promise<TicketDetail> => {
  const { data } = await axiosInstance.post(
    '/api/client/support/tickets',
    serializeForApi(clientCreateTicketRequestSchema, payload),
  );

  return parseFromApi(ticketDetailSchema, data.ticket);
};

export const createClientTicketUpload = async (payload: {
  serverUuid?: string;
  categoryUuid?: string;
  subject: string;
  message: string;
  metadata?: Record<string, unknown>;
  files: File[];
}): Promise<TicketDetail> => {
  const form = new FormData();
  form.append('subject', payload.subject);
  form.append('message', payload.message);

  if (payload.serverUuid) {
    form.append('server_uuid', payload.serverUuid);
  }

  if (payload.categoryUuid) {
    form.append('category_uuid', payload.categoryUuid);
  }

  if (payload.metadata) {
    form.append('metadata', JSON.stringify(payload.metadata));
  }

  for (const file of payload.files) {
    form.append('files', file, file.name);
  }

  const { data } = await axiosInstance.post('/api/client/support/tickets/upload', form, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return parseFromApi(ticketDetailSchema, data.ticket);
};

export const getClientTicket = async (ticketUuid: string): Promise<TicketDetail> => {
  const { data } = await axiosInstance.get(`/api/client/support/tickets/${ticketUuid}`);
  return parseFromApi(ticketDetailSchema, data.ticket);
};

export const addClientReply = async (ticketUuid: string, body: string): Promise<TicketDetail> => {
  const { data } = await axiosInstance.post(
    `/api/client/support/tickets/${ticketUuid}/messages`,
    serializeForApi(clientReplyTicketRequestSchema, { body }),
  );

  return parseFromApi(ticketDetailSchema, data.ticket);
};

export const addClientReplyUpload = async (
  ticketUuid: string,
  payload: { body: string; files: File[] },
): Promise<TicketDetail> => {
  const form = new FormData();
  form.append('body', payload.body);

  for (const file of payload.files) {
    form.append('files', file, file.name);
  }

  const { data } = await axiosInstance.post(`/api/client/support/tickets/${ticketUuid}/messages/upload`, form, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return parseFromApi(ticketDetailSchema, data.ticket);
};

export const updateClientTicketStatus = async (ticketUuid: string, status: string): Promise<TicketDetail> => {
  const { data } = await axiosInstance.patch(
    `/api/client/support/tickets/${ticketUuid}/status`,
    serializeForApi(clientUpdateTicketStatusRequestSchema, { status }),
  );

  return parseFromApi(ticketDetailSchema, data.ticket);
};

export const getAdminBootstrap = async (): Promise<AdminTicketBootstrap> => {
  const { data } = await axiosInstance.get('/api/admin/support/bootstrap');
  return parseFromApi(adminTicketBootstrapSchema, data.support);
};

export const getAdminSettingsDetail = async (): Promise<AdminTicketSettingsDetail> => {
  const { data } = await axiosInstance.get('/api/admin/support/settings');
  return parseFromApi(adminTicketSettingsDetailSchema, data.settings);
};

export const getAdminTickets = async (params: AdminTicketListParams): Promise<Paginated<TicketSummary>> => {
  const { data } = await axiosInstance.get('/api/admin/support/tickets', {
    params: {
      page: params.page,
      per_page: params.perPage,
      search: params.search || undefined,
      status: params.status || undefined,
      category_uuid: params.categoryUuid || undefined,
      assigned_user_uuid: params.assignedUserUuid || undefined,
      client: params.client || undefined,
      server: params.server || undefined,
      priority: params.priority || undefined,
    },
  });

  return parsePaginationFromApi(ticketSummarySchema, data.tickets);
};

export const getAdminTicket = async (ticketUuid: string): Promise<TicketDetail> => {
  const { data } = await axiosInstance.get(`/api/admin/support/tickets/${ticketUuid}`);
  return parseFromApi(ticketDetailSchema, data.ticket);
};

export const addAdminMessage = async (ticketUuid: string, body: string, isInternal: boolean): Promise<TicketDetail> => {
  const { data } = await axiosInstance.post(
    `/api/admin/support/tickets/${ticketUuid}/messages`,
    serializeForApi(adminTicketMessageRequestSchema, { body, isInternal }),
  );

  return parseFromApi(ticketDetailSchema, data.ticket);
};

export const addAdminMessageUpload = async (
  ticketUuid: string,
  payload: { body: string; isInternal: boolean; files: File[] },
): Promise<TicketDetail> => {
  const form = new FormData();
  form.append('body', payload.body);
  form.append('is_internal', String(payload.isInternal));

  for (const file of payload.files) {
    form.append('files', file, file.name);
  }

  const { data } = await axiosInstance.post(`/api/admin/support/tickets/${ticketUuid}/messages/upload`, form, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return parseFromApi(ticketDetailSchema, data.ticket);
};

export const updateAdminTicketStatus = async (ticketUuid: string, status: string): Promise<TicketDetail> => {
  const { data } = await axiosInstance.patch(
    `/api/admin/support/tickets/${ticketUuid}/status`,
    serializeForApi(adminUpdateTicketStatusRequestSchema, { status }),
  );

  return parseFromApi(ticketDetailSchema, data.ticket);
};

export const assignAdminTicket = async (ticketUuid: string, assignedUserUuid: string | null): Promise<TicketDetail> => {
  const { data } = await axiosInstance.patch(
    `/api/admin/support/tickets/${ticketUuid}/assignee`,
    serializeForApi(adminAssignTicketRequestSchema, { assignedUserUuid }),
  );

  return parseFromApi(ticketDetailSchema, data.ticket);
};

export const updateAdminTicketPriority = async (ticketUuid: string, priority: string | null): Promise<TicketDetail> => {
  const { data } = await axiosInstance.patch(
    `/api/admin/support/tickets/${ticketUuid}/priority`,
    serializeForApi(adminUpdateTicketPriorityRequestSchema, { priority }),
  );

  return parseFromApi(ticketDetailSchema, data.ticket);
};

export const updateAdminTicketCategory = async (
  ticketUuid: string,
  categoryUuid: string | null,
): Promise<TicketDetail> => {
  const { data } = await axiosInstance.patch(
    `/api/admin/support/tickets/${ticketUuid}/category`,
    serializeForApi(adminUpdateTicketCategoryRequestSchema, { categoryUuid }),
  );

  return parseFromApi(ticketDetailSchema, data.ticket);
};

export const deleteAdminTicket = async (ticketUuid: string): Promise<void> => {
  await axiosInstance.delete(`/api/admin/support/tickets/${ticketUuid}`);
};

export const updateAdminSettings = async (payload: {
  enabled: boolean;
  categoriesEnabled: boolean;
  allowClientClose: boolean;
  allowReplyOnClosed: boolean;
  createTicketRateLimitHits: number;
  createTicketRateLimitWindowSeconds: number;
  maxOpenTicketsPerUser: number;
  discordWebhookEnabled: boolean;
  discordWebhookUrl?: string | null;
  discordNotifyOnTicketCreated: boolean;
  discordNotifyOnClientReply: boolean;
  discordNotifyOnStaffReply: boolean;
  discordNotifyOnInternalNote: boolean;
  discordNotifyOnStatusChange: boolean;
  discordNotifyOnAssignmentChange: boolean;
  discordNotifyOnTicketDeleted: boolean;
}): Promise<AdminTicketSettingsDetail> => {
  const { data } = await axiosInstance.put(
    '/api/admin/support/settings',
    serializeForApi(adminUpdateTicketSettingsRequestSchema, {
      ...payload,
      discordWebhookUrl: payload.discordWebhookUrl ?? '',
    }),
  );

  return parseFromApi(adminTicketSettingsDetailSchema, data.settings);
};

export const upsertAdminCategory = async (payload: {
  uuid?: string;
  name: string;
  description?: string;
  color?: string;
  sortOrder: number;
  enabled: boolean;
}): Promise<TicketCategory> => {
  const { data } = await axiosInstance.put(
    '/api/admin/support/categories',
    serializeForApi(adminUpsertTicketCategoryRequestSchema, payload),
  );

  return parseFromApi(ticketCategorySchema, data.category);
};

export const deleteAdminCategory = async (categoryUuid: string): Promise<void> => {
  await axiosInstance.delete(`/api/admin/support/categories/${categoryUuid}`);
};
