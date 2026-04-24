export interface Reply {
  id: string;
  body: string;
  created_at: string;
  parent_id: string;
  anon_name: string | null;
}

export interface Comment {
  id: string;
  body: string;
  created_at: string;
  parent_id: null;
  anon_name: string | null;
  replies: Reply[];
}
