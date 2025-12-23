export interface Profile {
  handle: string;
  name: string;
  bio: string;
  avatarUrl: string;
  followersCount: number;
  followingCount: number;
  addedAt: number;
  tags: string[]; // AI generated tags e.g. "Thirst Trap", "Corporate Shill"
}

export interface SimpleProfile {
  handle: string;
  name: string;
  bio: string;
  avatarUrl?: string;
}

export interface Relationship {
  source: string; // handle
  target: string; // handle
  type: 'mutual' | 'follows' | 'followed_by' | 'none';
  interactions: number;
  sentiment: 'hostile' | 'friendly' | 'neutral' | 'romantic' | 'transactional';
  context: string; // AI explanation
  updatedAt: number;
}

export interface Interaction {
  id: string; // tweet id
  from: string;
  to: string;
  content: string;
  timestamp: number;
  type: 'reply' | 'quote' | 'mention';
}

export interface AppState {
  crawlerQueue: string[]; // list of handles to visit
  crawlerStatus: 'idle' | 'running' | 'paused';
  currentTabId: number | null;
}
