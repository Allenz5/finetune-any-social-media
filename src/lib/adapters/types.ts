export type Action = 'like' | 'dislike' | 'skip';

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

export interface PlatformAdapter {
  readonly name: string;

  getNextPost(): Promise<Post | null>;
  like(): Promise<void>;
  dislike(): Promise<void>;
  skip(): Promise<void>;
  scroll(): Promise<void>;
}
