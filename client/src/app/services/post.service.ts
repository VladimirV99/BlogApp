import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { API_URL } from '../../environments/environment';
import {
  commentsPerPage,
  likesPerPage,
  postsPerPage
} from '../constants/settings';
import {
  CreatePostRequest,
  CreatePostResponse,
  EditPostRequest,
  GetDisikesResponse,
  GetLikesResponse,
  GetPostResponse,
  GetPostsResponse
} from '../models/post';
import {
  GetCommentsResponse,
  PostCommentRequest,
  PostCommentResponse,
  PostReplyRequest
} from '../models/comment';
import { Notification, GetCountResponse } from '../models/message';

@Injectable({
  providedIn: 'root'
})
export class PostService {
  constructor(private http: HttpClient) {}

  getPostsPerPage(): number {
    return postsPerPage;
  }

  getCommentsPerPage(): number {
    return commentsPerPage;
  }

  createPost(post: CreatePostRequest): Observable<CreatePostResponse> {
    return this.http.post<CreatePostResponse>(API_URL + 'posts/newPost', post);
  }

  getPosts(page: number): Observable<GetPostsResponse> {
    return this.http.get<GetPostsResponse>(
      `${API_URL}posts/page/${page}/{postsPerPage}`
    );
  }

  getPost(id: string): Observable<GetPostResponse> {
    return this.http.get<GetPostResponse>(API_URL + 'posts/get/' + id);
  }

  getPostCount(): Observable<GetCountResponse> {
    return this.http.get<GetCountResponse>(API_URL + 'posts/count');
  }

  getEditPost(id: string): Observable<GetPostResponse> {
    return this.http.get<GetPostResponse>(API_URL + 'posts/edit/' + id);
  }

  getUserPosts(username: string, page: number): Observable<GetPostsResponse> {
    return this.http.get<GetPostsResponse>(
      `${API_URL}posts/user/${username}/page/${page}/${postsPerPage}`
    );
  }

  getUserPostCount(username: string): Observable<GetCountResponse> {
    return this.http.get<GetCountResponse>(
      API_URL + 'posts/user/' + username + '/count'
    );
  }

  getPopular(): Observable<GetPostsResponse> {
    return this.http.get<GetPostsResponse>(API_URL + 'posts/popular');
  }

  getLikes(id: string, page: number): Observable<GetLikesResponse> {
    return this.http.get<GetLikesResponse>(
      API_URL +
        'posts/likes/' +
        id +
        '/page/' +
        page +
        '/' +
        likesPerPage.toString()
    );
  }

  likePost(id: string): Observable<Notification> {
    return this.http.put<Notification>(API_URL + 'posts/like', { id: id });
  }

  getDislikes(id: string, page: number): Observable<GetDisikesResponse> {
    return this.http.get<GetDisikesResponse>(
      API_URL +
        'posts/dislikes/' +
        id +
        '/page/' +
        page +
        '/' +
        likesPerPage.toString()
    );
  }

  dislikePost(id: string): Observable<Notification> {
    return this.http.put<Notification>(API_URL + 'posts/dislike', { id: id });
  }

  editPost(post: EditPostRequest): Observable<Notification> {
    return this.http.put<Notification>(API_URL + 'posts/update/', post);
  }

  deletePost(id: string): Observable<Notification> {
    return this.http.delete<Notification>(API_URL + 'posts/delete/' + id);
  }

  postComment(comment: PostCommentRequest): Observable<PostCommentResponse> {
    return this.http.post<PostCommentResponse>(
      API_URL + 'comments/newComment',
      comment
    );
  }

  getComments(
    post_id: string,
    before = Date.now(),
    limit = commentsPerPage
  ): Observable<GetCommentsResponse> {
    return this.http.post<GetCommentsResponse>(
      API_URL + 'comments/getComments/' + post_id,
      { before: before, limit: limit }
    );
  }

  getCommentCount(id: string): Observable<GetCountResponse> {
    return this.http.get<GetCountResponse>(API_URL + 'comments/count/' + id);
  }

  deleteComment(id: string): Observable<Notification> {
    return this.http.delete<Notification>(API_URL + 'comments/delete/' + id);
  }

  postReply(reply: PostReplyRequest): Observable<PostCommentResponse> {
    return this.http.post<PostCommentResponse>(
      API_URL + 'comments/newReply',
      reply
    );
  }

  getReplies(
    comment_id: string,
    before = Date.now(),
    limit = commentsPerPage
  ): Observable<GetCommentsResponse> {
    return this.http.post<GetCommentsResponse>(
      API_URL + 'comments/getReplies/' + comment_id,
      { before: before, limit: limit }
    );
  }

  getBookmarkCount(): Observable<GetCountResponse> {
    return this.http.get<GetCountResponse>(API_URL + 'users/bookmark/count');
  }

  getBookmarks(page: number): Observable<GetPostsResponse> {
    return this.http.get<GetPostsResponse>(
      API_URL + 'users/bookmark/page/' + page + '/' + postsPerPage.toString()
    );
  }
}
