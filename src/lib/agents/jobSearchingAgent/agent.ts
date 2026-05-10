import { Agent } from '@openai/agents';
import { listTools } from '../../tools/registry';
import { buildTools } from '../../tools/definitions';
import type { Logger, Platform } from '../../tools/types';
import { JOB_SEARCHING_AGENT_PROMPT } from './prompt';

export function createJobSearchingAgent(platform: Platform, log: Logger): Agent {
  const tools = buildTools(platform, listTools(platform), log);
  return new Agent({
    name: 'JobSearchingAgent',
    instructions: JOB_SEARCHING_AGENT_PROMPT,
    model: 'gpt-4o-mini',
    tools,
  });
}
