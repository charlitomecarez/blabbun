export interface Reply {
  id: string;
  body: string;
  createdAt: Date | string;
}

export interface Comment {
  id: string;
  body: string;
  createdAt: Date | string;
  replies: Reply[];
}
