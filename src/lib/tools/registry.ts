import type { Platform, PlatformToolset, ToolName } from './types';

const registry: Partial<Record<Platform, PlatformToolset>> = {};

export function registerPlatformTools(platform: Platform, toolset: PlatformToolset): void {
  registry[platform] = { ...(registry[platform] ?? {}), ...toolset };
}

export function getTool<K extends ToolName>(
  name: K,
  platform: Platform,
): NonNullable<PlatformToolset[K]> {
  const impl = registry[platform]?.[name];
  if (!impl) {
    throw new Error(`Tool "${name}" is not implemented for platform "${platform}".`);
  }
  return impl as NonNullable<PlatformToolset[K]>;
}

export function listTools(platform: Platform): ToolName[] {
  return Object.keys(registry[platform] ?? {}) as ToolName[];
}
