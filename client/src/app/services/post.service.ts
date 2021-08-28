import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';

import { AuthService } from './auth.service';
import Post from '../models/post';
import Comment from '../models/comment';
import { Observable } from 'rxjs';

export interface PostMessage {
  success: boolean;
  message?: string;
  posts?: Post[];
  post?: Post;
  comments?: Comment[];
  comment?: Comment;
  count?: number;
}

@Injectable({
  providedIn: 'root'
})
export class PostService {
  private domain: string = this.authService.getDomain();
  private postsPerPage: number = 2;
  private likesPerPage: number = 1;
  private commentsPerPage: number = 1;

  constructor(private http: HttpClient, private authService: AuthService) {}

  getPostsPerPage(): number {
    return this.postsPerPage;
  }

  getCommentsPerPage(): number {
    return this.commentsPerPage;
  }

  newPost(post): Observable<PostMessage> {
    let headers = this.authService.createAuthenticationHeaders();
    return this.http.post<PostMessage>(this.domain + 'posts/newPost', post, {
      headers: headers
    });
  }

  getPosts(page: number): Observable<PostMessage> {
    let headers = this.authService.createAuthenticationHeaders();
    return this.http.get<PostMessage>(
      this.domain + 'posts/page/' + page + '/' + this.postsPerPage.toString(),
      {
        headers: headers
      }
    );
  }

  getPost(id: string): Observable<PostMessage> {
    let headers = this.authService.createAuthenticationHeaders();
    return this.http.get<PostMessage>(this.domain + 'posts/get/' + id, {
      headers: headers
    });
  }

  getPostCount(): Observable<PostMessage> {
    let headers = this.authService.createHeaders();
    return this.http.get<PostMessage>(this.domain + 'posts/count', {
      headers: headers
    });
  }

  getEditPost(id: string): Observable<PostMessage> {
    let headers = this.authService.createAuthenticationHeaders();
    return this.http.get<PostMessage>(this.domain + 'posts/edit/' + id, {
      headers: headers
    });
  }

  getUserPosts(username: string, page: number): Observable<PostMessage> {
    let headers = this.authService.createAuthenticationHeaders();
    return this.http.get<PostMessage>(
      this.domain + 'posts/user/' + username + '/page/' + page,
      { headers: headers }
    );
  }

  getUserPostCount(username: string): Observable<PostMessage> {
    let headers = this.authService.createHeaders();
    return this.http.get<PostMessage>(
      this.domain + 'posts/user/' + username + '/count',
      { headers: headers }
    );
  }

  getPopular(): Observable<PostMessage> {
    let headers = this.authService.createHeaders();
    return this.http.get<PostMessage>(this.domain + 'posts/popular', {
      headers: headers
    });
  }

  getLikes(id: string, page: number): Observable<PostMessage> {
    let headers = this.authService.createAuthenticationHeaders();
    return this.http.get<PostMessage>(
      this.domain +
        'posts/likes/' +
        id +
        '/page/' +
        page +
        '/' +
        this.likesPerPage.toString(),
      { headers: headers }
    );
  }

  likePost(id: string): Observable<PostMessage> {
    let headers = this.authService.createAuthenticationHeaders();
    return this.http.put<PostMessage>(
      this.domain + 'posts/like',
      { id: id },
      { headers: headers }
    );
  }

  getDislikes(id: string, page: number): Observable<PostMessage> {
    let headers = this.authService.createAuthenticationHeaders();
    return this.http.get<PostMessage>(
      this.domain +
        'posts/dislikes/' +
        id +
        '/page/' +
        page +
        '/' +
        this.likesPerPage.toString(),
      { headers: headers }
    );
  }

  dislikePost(id: string): Observable<PostMessage> {
    let headers = this.authService.createAuthenticationHeaders();
    return this.http.put<PostMessage>(
      this.domain + 'posts/dislike',
      { id: id },
      { headers: headers }
    );
  }

  editPost(post): Observable<PostMessage> {
    let headers = this.authService.createAuthenticationHeaders();
    return this.http.put<PostMessage>(this.domain + 'posts/update/', post, {
      headers: headers
    });
  }

  deletePost(id: string): Observable<PostMessage> {
    let headers = this.authService.createAuthenticationHeaders();
    return this.http.delete<PostMessage>(this.domain + 'posts/delete/' + id, {
      headers: headers
    });
  }

  postComment(comment): Observable<PostMessage> {
    let headers = this.authService.createAuthenticationHeaders();
    return this.http.post<PostMessage>(
      this.domain + 'comments/newComment',
      comment,
      { headers: headers }
    );
  }

  postReply(reply): Observable<PostMessage> {
    let headers = this.authService.createAuthenticationHeaders();
    return this.http.post<PostMessage>(
      this.domain + 'comments/newReply',
      reply,
      { headers: headers }
    );
  }

  getComments(
    post_id: string,
    before = Date.now(),
    limit = this.commentsPerPage
  ): Observable<PostMessage> {
    let headers = this.authService.createHeaders();
    return this.http.post<PostMessage>(
      this.domain + 'comments/getComments/' + post_id,
      { before: before, limit: limit },
      { headers: headers }
    );
  }

  getReplies(
    comment_id: string,
    before = Date.now(),
    limit = this.commentsPerPage
  ): Observable<PostMessage> {
    let headers = this.authService.createHeaders();
    return this.http.post<PostMessage>(
      this.domain + 'comments/getReplies/' + comment_id,
      { before: before, limit: limit },
      { headers: headers }
    );
  }

  getCommentCount(id: string): Observable<PostMessage> {
    let headers = this.authService.createHeaders();
    return this.http.get<PostMessage>(this.domain + 'comments/count/' + id, {
      headers: headers
    });
  }

  deleteComment(id: string): Observable<PostMessage> {
    let headers = this.authService.createAuthenticationHeaders();
    return this.http.delete<PostMessage>(
      this.domain + 'comments/delete/' + id,
      { headers: headers }
    );
  }

  getBookmarkCount(): Observable<PostMessage> {
    let headers = this.authService.createAuthenticationHeaders();
    return this.http.get<PostMessage>(this.domain + 'users/bookmark/count', {
      headers: headers
    });
  }

  getBookmarks(page: number): Observable<PostMessage> {
    let headers = this.authService.createAuthenticationHeaders();
    return this.http.get<PostMessage>(
      this.domain +
        'users/bookmark/page/' +
        page +
        '/' +
        this.postsPerPage.toString(),
      { headers: headers }
    );
  }
}
