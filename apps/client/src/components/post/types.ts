export interface Reply {
  id: string;
  body: string;
  createdAt: Date;
}

export interface Comment {
  id: string;
  body: string;
  createdAt: Date;
  replies: Reply[];
}
