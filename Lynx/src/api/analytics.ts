import { httpJSON } from './http.ts';

export interface InlineAnalytics {
  memories: number;
  feedback: { approved: number; edited: number; rejected: number };
}

export function getInlineAnalytics(creator_id: string) {
  const q = new URLSearchParams({ creator_id }).toString();
  return httpJSON<InlineAnalytics>(`/analytics/inline?${q}`);
}
