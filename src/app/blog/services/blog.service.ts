import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BlogPost, Comment } from '../models/blog.model';

@Injectable({
  providedIn: 'root'
})
export class BlogService {
  private apiUrl = 'http://localhost:3000/api/blogs'; // Replace with your actual API URL

  constructor(private http: HttpClient) {}

  getBlogById(id: string): Observable<BlogPost> {
    return this.http.get<BlogPost>(`${this.apiUrl}/${id}`);
  }

  getRelatedPosts(currentBlogId: string | undefined): Observable<BlogPost[]> {
    return this.http.get<BlogPost[]>(`${this.apiUrl}/related?exclude=${currentBlogId}`);
  }

  getComments(blogId: string): Observable<Comment[]> {
    return this.http.get<Comment[]>(`${this.apiUrl}/${blogId}/comments`);
  }

  addComment(blogId: string, comment: Comment): Observable<Comment> {
    return this.http.post<Comment>(`${this.apiUrl}/${blogId}/comments`, comment);
  }

  addReply(blogId: string, reply: Comment): Observable<Comment> {
    return this.http.post<Comment>(`${this.apiUrl}/${blogId}/replies`, reply);
  }
}
