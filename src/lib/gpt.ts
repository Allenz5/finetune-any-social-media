import type { Action, Post } from './adapters/types';

export async function decideAction(post: Post, campaignPrompt: string): Promise<Action> {
  const result = await chrome.storage.local.get('openai_api_key');
  const apiKey = (result['openai_api_key'] as string) ?? '';

  if (!apiKey) throw new Error('OpenAI API key not set. Add it in Settings.');

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are a LinkedIn feed curator. Based on the instructions below, decide what to do with each post. Reply with exactly one word: "like", "dislike", or "skip".\n\nInstructions: ${campaignPrompt}`,
        },
        {
          role: 'user',
          content: `Author: ${post.author}\n\n${post.text}`,
        },
      ],
      max_tokens: 5,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`OpenAI ${response.status}: ${body}`);
  }

  const data = await response.json();
  const choice = data.choices?.[0]?.message?.content?.trim().toLowerCase() as string;

  if (choice === 'like' || choice === 'dislike' || choice === 'skip') return choice;
  throw new Error(`Unexpected GPT response: "${choice}"`);
}
