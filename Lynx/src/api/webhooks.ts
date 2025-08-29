import { httpJSON } from './http.ts';

export function logGeneration(input: {
  creator_id: string;
  suggestion_id: string;
  type?: 'caption' | 'hashtags' | 'both';
  suggested_caption?: string | null;
  suggested_hashtags?: string[];
  model?: string;
  meta?: Record<string, unknown>;
}) {
  return httpJSON<{ ok: true }>('/webhooks/generation', { method: 'POST', body: input });
}
