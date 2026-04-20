export interface Post {
  title: string;
  description: string;
  pubDate: Date;
  updatedDate?: Date;
  tags: string[];
  draft: boolean;
  image?: string;
  imageSource?: string;
  imageSourceUrl?: string;
}
