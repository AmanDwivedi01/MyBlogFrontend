import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface BlogStats {
  totalBlogs: number;
  totalComments: number;
  totalUsers: number;
  pendingComments: number;
}

export interface Blog {
  id: string;
  title: string;
  content: string;
  author: {
    id: string;
    name: string;
    email: string;
  };
  status: 'draft' | 'published' | 'archived';
  comments: {
    id: string;
    content: string;
    author: string;
    status: 'approved' | 'pending' | 'rejected';
  }[];
  createdAt: string;
  updatedAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class BlogService {
  private apiUrl = 'http://localhost:3000/api/blogs';

  constructor(private http: HttpClient) {}

  getPostCount(userId: string): Observable<{ count: number }> {
    return this.http.get<{ count: number }>(`http://localhost:3000/api/blogs/posts/count/${Number(userId)}`);
  }

  getBlogStats(): Observable<BlogStats> {
    return this.http.get<BlogStats>(`${this.apiUrl}/stats`);
  }

  getRecentBlogs(): Observable<Blog[]> {
    return this.http.get<Blog[]>(`${this.apiUrl}/recent`);
  }

  getAllBlog(id: string): Observable<Blog[]> {
    return this.http.get<Blog[]>(`http://localhost:3000/api/blogs/posts/all/${Number(id)}`);
  }
  getBlogDetails(id: string): Observable<Blog[]> {
    return this.http.get<Blog[]>(`http://localhost:3000/api/blogs/posts/details/view/${Number(id)}`);
  }
  getBlog(id: string): Observable<Blog> {
    return this.http.get<Blog>(`${this.apiUrl}/${id}`);
  }

  createBlog(blogData: any): Observable<Blog> {
    return this.http.post<Blog>(this.apiUrl, blogData);
  }

  updateBlog(id: string, blogData: any): Observable<Blog> {
    return this.http.put<Blog>(`${this.apiUrl}/${id}`, blogData);
  }

  deleteBlog(id: string): Observable<void> {
    return this.http.delete<void>(`http://localhost:3000/api/blogs/posts/delete/${id}`);
  }

  approveComment(commentId: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/comments/${commentId}/approve`, {});
  }

  rejectComment(commentId: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/comments/${commentId}/reject`, {});
  }
}
