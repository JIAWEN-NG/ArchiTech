import { httpJSON } from './http.ts';

export function submitFeedback(input: {
  creator_id: string;
  suggestion_id: string;
  action: 'approved' | 'edited' | 'rejected';
  final_caption?: string | null;
  final_hashtags?: string[];
  reason?: string | null;
}) {
  return httpJSON<{ ok: true }>('/feedback', { method: 'POST', body: input });
}
