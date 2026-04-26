// TODO: replace with a backend call
export async function getOpenAIApiKey(): Promise<string> {
  const result = await chrome.storage.local.get('openai_api_key');
  return (result['openai_api_key'] as string) ?? '';
}
