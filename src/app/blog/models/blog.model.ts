export interface Author {
  id: string;
  name: string;
  avatar: string;
  bio: string;
  social: {
    twitter: string;
    linkedin: string;
  };
}

export interface Comment {
  id: string;
  content: string;
  author: Author;
  createdAt: Date;
  parentId?: string;
}

export interface BlogPost {
  id: string;
  title: string;
  content: string;
  coverImage: string;
  author: Author;
  createdAt: Date;
  readingTime: number;
  tags: string[];
  slug: string;
  comments: Comment[];
  likes: number;
  views: number;
}
