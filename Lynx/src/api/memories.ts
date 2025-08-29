import { httpJSON } from './http.ts';

export interface Memory {
  id: number;
  creator_id: string;
  caption: string;
  hashtags: string[];
  performance: Record<string, unknown>;
  created_at: string;
}

export function ingestMemory(input: {
  creator_id: string;
  platform: 'tiktok';
  caption: string;
  hashtags?: string[];
  performance?: Record<string, unknown>;
}) {
  return httpJSON<Memory>('/memories/ingest', { method: 'POST', body: input });
}

export function listMemories(creator_id: string) {
  return httpJSON<Memory[]>(`/memories/${encodeURIComponent(creator_id)}`);
}
