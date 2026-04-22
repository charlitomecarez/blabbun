export interface CommentRow {
  id: string;
  post_slug: string;
  body: string;
  created_at: string;
  parent_id: string | null;
}

export interface PostClapRow {
  post_slug: string;
  count: number;
}

export interface ClapVoteRow {
  post_slug: string;
  ip_hash: string;
  created_at: string;
}

export interface SubscriberRow {
  id: string;
  email: string;
  subscribed_at: string;
}

export interface Database {
  public: {
    Tables: {
      comments: {
        Row: CommentRow;
        Insert: Omit<CommentRow, "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<CommentRow>;
      };
      post_claps: {
        Row: PostClapRow;
        Insert: { post_slug: string; count?: number };
        Update: { count?: number };
      };
      clap_votes: {
        Row: ClapVoteRow;
        Insert: { post_slug: string; ip_hash: string; created_at?: string };
        Update: never;
      };
      subscribers: {
        Row: SubscriberRow;
        Insert: Omit<SubscriberRow, "id" | "subscribed_at"> & {
          id?: string;
          subscribed_at?: string;
        };
        Update: Partial<SubscriberRow>;
      };
    };
  };
}
