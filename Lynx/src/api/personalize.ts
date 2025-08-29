import { httpJSON } from './http.ts';

export interface PersonalizeResponse {
  creator_id: string;
  guardrails: { tone: string; caption_length: string; banned_words: string[] };
  hints: { preferred_hashtags: string[]; niche: string | null };
  examples: Array<{ caption: string; hashtags: string[]; created_at: string }>;
}

export function getSuggestions(creator_id: string) {
  return httpJSON<PersonalizeResponse>('/personalize/suggestions', {
    method: 'POST',
    body: { creator_id },
  });
}
