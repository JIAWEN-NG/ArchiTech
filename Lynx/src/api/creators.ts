import { httpJSON } from './http.ts';

export interface Creator {
  id: string;
  username?: string | null;
  locale?: string;
  timezone?: string;
}

export function upsertCreator(creator_id: string, payload: Creator) {
  return httpJSON<Creator>(`/creators/${encodeURIComponent(creator_id)}`, {
    method: 'PUT',
    body: payload,
  });
}

export function getCreator(creator_id: string) {
  return httpJSON<Creator>(`/creators/${encodeURIComponent(creator_id)}`);
}
