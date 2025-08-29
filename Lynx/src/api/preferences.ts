import { httpJSON } from './http.ts';

export interface Preferences {
  tone?: 'playful' | 'informative' | 'inspirational' | 'edgy' | 'friendly';
  caption_length?: 'short' | 'medium' | 'long';
  niche?: string | null;
  banned_words: string[];
}

export function getPreferences(creator_id: string) {
  return httpJSON<Preferences>(`/creators/${encodeURIComponent(creator_id)}/preferences`);
}

export function putPreferences(creator_id: string, patch: Partial<Preferences>) {
  return httpJSON<Preferences>(`/creators/${encodeURIComponent(creator_id)}/preferences`, {
    method: 'PUT',
    body: patch,
  });
}
