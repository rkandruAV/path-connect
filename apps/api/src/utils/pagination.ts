import type { PaginatedResponse } from '@path-connect/shared';

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export function getPaginationArgs(params: PaginationParams) {
  const page = Math.max(1, params.page || 1);
  const limit = Math.min(50, Math.max(1, params.limit || 20));
  return {
    skip: (page - 1) * limit,
    take: limit,
    page,
    limit,
  };
}

export function toPaginatedResponse<T>(
  data: T[],
  total: number,
  page: number,
  limit: number
): PaginatedResponse<T> {
  return { data, total, page, limit };
}
