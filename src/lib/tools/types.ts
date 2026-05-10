export type Platform = 'linkedin';

export type ToolName = 'getNextPost' | 'like' | 'dislike' | 'skip' | 'scroll';

export interface LogEntry {
  timestamp: number;
  status: 'info' | 'success' | 'error';
  message: string;
}

export interface Post {
  id: string;
  author: string;
  text: string;
}

export type Logger = (status: LogEntry['status'], message: string) => void;

export interface PlatformToolset {
  getNextPost?: () => Promise<Post | null>;
  like?: () => Promise<void>;
  dislike?: () => Promise<void>;
  skip?: () => Promise<void>;
  scroll?: () => Promise<void>;
}
