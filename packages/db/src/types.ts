export type Database = {
  public: {
    Tables: {
      comments: {
        Row: {
          anon_name: string | null;
          body: string;
          created_at: string;
          env: string;
          id: string;
          parent_id: string | null;
          post_slug: string;
        };
        Insert: {
          anon_name?: string | null;
          body: string;
          created_at?: string;
          env?: string;
          id?: string;
          parent_id?: string | null;
          post_slug: string;
        };
        Update: {
          anon_name?: string | null;
          body?: string;
          created_at?: string;
          env?: string;
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
          env: string;
          ip_hash: string;
          post_slug: string;
        };
        Insert: {
          created_at?: string;
          env?: string;
          ip_hash: string;
          post_slug: string;
        };
        Update: {
          created_at?: string;
          env?: string;
          ip_hash?: string;
          post_slug?: string;
        };
        Relationships: [];
      };
      post_claps: {
        Row: {
          count: number;
          created_at: string;
          env: string;
          post_slug: string;
        };
        Insert: {
          count?: number;
          created_at?: string;
          env?: string;
          post_slug: string;
        };
        Update: {
          count?: number;
          created_at?: string;
          env?: string;
          post_slug?: string;
        };
        Relationships: [];
      };
      subscribers: {
        Row: {
          email: string;
          env: string;
          id: string;
          subscribed_at: string;
        };
        Insert: {
          email: string;
          env?: string;
          id?: string;
          subscribed_at?: string;
        };
        Update: {
          email?: string;
          env?: string;
          id?: string;
          subscribed_at?: string;
        };
        Relationships: [];
      };
      post_views: {
        Row: {
          count: number;
          env: string;
          post_slug: string;
        };
        Insert: {
          count?: number;
          env?: string;
          post_slug: string;
        };
        Update: {
          count?: number;
          env?: string;
          post_slug?: string;
        };
        Relationships: [];
      };
      post_notifications: {
        Row: {
          env: string;
          notified_at: string;
          post_slug: string;
        };
        Insert: {
          env?: string;
          notified_at?: string;
          post_slug: string;
        };
        Update: {
          env?: string;
          notified_at?: string;
          post_slug?: string;
        };
        Relationships: [];
      };
      admin_users: {
        Row: {
          created_at: string;
          email: string;
          env: string;
          id: string;
          password_hash: string;
          role: string;
        };
        Insert: {
          created_at?: string;
          email: string;
          env?: string;
          id?: string;
          password_hash: string;
          role?: string;
        };
        Update: {
          created_at?: string;
          email?: string;
          env?: string;
          id?: string;
          password_hash?: string;
          role?: string;
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
export type PostNotificationRow =
  Database["public"]["Tables"]["post_notifications"]["Row"];
export type AdminUserRow = Database["public"]["Tables"]["admin_users"]["Row"];
export type PostViewRow = Database["public"]["Tables"]["post_views"]["Row"];
