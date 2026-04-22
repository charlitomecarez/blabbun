export interface Reply {
  id: string;
  body: string;
  created_at: string;
  parent_id: string;
}

export interface Comment {
  id: string;
  body: string;
  created_at: string;
  parent_id: null;
  replies: Reply[];
}
