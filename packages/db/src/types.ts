export type Database = {
  public: {
    Tables: {
      comments: {
        Row: {
          anon_name: string | null;
          body: string;
          created_at: string;
          id: string;
          parent_id: string | null;
          post_slug: string;
        };
        Insert: {
          anon_name?: string | null;
          body: string;
          created_at?: string;
          id?: string;
          parent_id?: string | null;
          post_slug: string;
        };
        Update: {
          anon_name?: string | null;
          body?: string;
          created_at?: string;
          id?: string;
          parent_id?: string | null;
          post_slug?: string;
        };
        Relationships: [
          {
            foreignKeyName: "comments_parent_id_fkey";
            columns: ["parent_id"];
            isOneToOne: false;
            referencedRelation: "comments";
            referencedColumns: ["id"];
          },
        ];
      };
      clap_votes: {
        Row: {
          created_at: string;
          ip_hash: string;
          post_slug: string;
        };
        Insert: {
          created_at?: string;
          ip_hash: string;
          post_slug: string;
        };
        Update: {
          created_at?: string;
          ip_hash?: string;
          post_slug?: string;
        };
        Relationships: [];
      };
      post_claps: {
        Row: {
          count: number;
          post_slug: string;
        };
        Insert: {
          count?: number;
          post_slug: string;
        };
        Update: {
          count?: number;
          post_slug?: string;
        };
        Relationships: [];
      };
      subscribers: {
        Row: {
          email: string;
          id: string;
          subscribed_at: string;
        };
        Insert: {
          email: string;
          id?: string;
          subscribed_at?: string;
        };
        Update: {
          email?: string;
          id?: string;
          subscribed_at?: string;
        };
        Relationships: [];
      };
    };
    Views: { [_ in never]: never };
    Functions: { [_ in never]: never };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
};

export type CommentRow = Database["public"]["Tables"]["comments"]["Row"];
export type PostClapRow = Database["public"]["Tables"]["post_claps"]["Row"];
export type ClapVoteRow = Database["public"]["Tables"]["clap_votes"]["Row"];
export type SubscriberRow = Database["public"]["Tables"]["subscribers"]["Row"];
