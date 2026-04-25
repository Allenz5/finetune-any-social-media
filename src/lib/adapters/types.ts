export type Action = 'like' | 'dislike' | 'skip';

export interface Post {
  id: string;
  author: string;
  text: string;
}

export interface PlatformAdapter {
  readonly name: string;

  isLoggedIn(): Promise<boolean>;
  awaitLogin(timeoutMs?: number): Promise<void>;

  getNextPost(): Promise<Post | null>;
  like(): Promise<void>;
  dislike(): Promise<void>;
  skip(): Promise<void>;
  scroll(): Promise<void>;
}
