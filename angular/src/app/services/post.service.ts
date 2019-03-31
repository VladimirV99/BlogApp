import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';

import { AuthService } from './auth.service';
import Post from '../models/post';
import Comment from '../models/comment';

export interface PostMessage {
  success: boolean;
  message? : string;
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

  domain = this.authService.domain;
  postsPerPage = 1;
  commentsPerPage = 1;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }

  newPost(post) {
    let headers = this.authService.createAuthenticationHeaders();
    return this.http.post<PostMessage>(this.domain + 'posts/newPost', post, {headers: headers});
  }

  getPosts(page) {
    let headers = this.authService.createAuthenticationHeaders();
    return this.http.get<PostMessage>(this.domain + 'posts/page/' + page + '/' + this.postsPerPage.toString(), {headers: headers});
  }

  getPost(id) {
    let headers = this.authService.createAuthenticationHeaders();
    return this.http.get<PostMessage>(this.domain + 'posts/get/' + id, {headers: headers});
  }

  getPostCount() {
    let headers = this.authService.createHeaders();
    return this.http.get<PostMessage>(this.domain + 'posts/count', {headers: headers});
  }

  getUserPosts(username, page) {
    let headers = this.authService.createAuthenticationHeaders();
    return this.http.get<PostMessage>(this.domain + 'posts/user/' + username + '/page/' + page, {headers: headers});
  }

  getUserPostCount(username) {
    let headers = this.authService.createHeaders();
    return this.http.get<PostMessage>(this.domain + 'posts/user/' + username + '/count', {headers: headers});
  }

  getPopular() {
    let headers = this.authService.createHeaders();
    return this.http.get<PostMessage>(this.domain + 'posts/popular', {headers: headers});
  }

  likePost(id) {
    let headers = this.authService.createAuthenticationHeaders();
    return this.http.put<PostMessage>(this.domain + 'posts/like', { id: id }, {headers: headers});
  }

  dislikePost(id) {
    let headers = this.authService.createAuthenticationHeaders();
    return this.http.put<PostMessage>(this.domain + 'posts/dislike', { id: id }, {headers: headers});
  }

  editPost(id) {
    let headers = this.authService.createAuthenticationHeaders();
    return this.http.put<PostMessage>(this.domain + 'posts/update/', id, {headers: headers});
  }

  deletePost(id) {
    let headers = this.authService.createAuthenticationHeaders();
    return this.http.delete<PostMessage>(this.domain + 'posts/delete/' + id, {headers: headers});
  }

  postComment(comment) {
    let headers = this.authService.createAuthenticationHeaders();
    return this.http.post<PostMessage>(this.domain + 'comments/newComment', comment,  {headers: headers});
  }

  postReply(reply) {
    let headers = this.authService.createAuthenticationHeaders();
    return this.http.post<PostMessage>(this.domain + 'comments/newReply', reply,  {headers: headers});
  }

  getComments(post_id, before=Date.now(), limit=this.commentsPerPage) {
    let headers = this.authService.createHeaders();
    return this.http.post<PostMessage>(this.domain + 'comments/getComments/' + post_id, {before: before, limit: limit}, {headers: headers});
  }

  getReplies(comment_id, before=Date.now(), limit=this.commentsPerPage) {
    let headers = this.authService.createHeaders();
    return this.http.post<PostMessage>(this.domain + 'comments/getReplies/' + comment_id, {before: before, limit: limit}, {headers: headers});
  }

  getCommentCount(id) {
    let headers = this.authService.createHeaders();
    return this.http.get<PostMessage>(this.domain + 'comments/count/' + id, {headers: headers});
  }

  deleteComment(id) {
    let headers = this.authService.createAuthenticationHeaders();
    return this.http.delete<PostMessage>(this.domain + 'comments/delete/' + id, {headers: headers});
  }

}
