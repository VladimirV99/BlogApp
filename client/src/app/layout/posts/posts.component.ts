import { Component, OnInit } from '@angular/core';

import { AuthService } from '../../services/auth.service';
import { PostService } from '../../services/post.service';
import { UiService } from '../../services/ui.service';
import User from 'src/app/models/user';
import Post from 'src/app/models/post';

@Component({
  selector: 'app-posts',
  templateUrl: './posts.component.html',
  styleUrls: ['./posts.component.scss']
})
export class PostsComponent implements OnInit {
  message: string = '';
  messageClass: string = '';

  user: User;
  totalPosts: number = 0;

  page: number = 1;
  posts: Post[] = [];

  postToDelete: string;
  loading: boolean = true;

  constructor(
    private authService: AuthService,
    private postService: PostService,
    public uiService: UiService
  ) {}

  loadMorePosts(): void {
    if (this.posts.length < this.totalPosts) {
      this.page++;
      this.getPosts();
    }
  }

  getPosts(): void {
    this.loading = true;
    this.postService.getUserPostCount(this.user.username).subscribe(data => {
      if (!data.success) {
        this.messageClass = 'alert alert-danger';
        this.message = data.message;
      } else {
        this.totalPosts = data.count;
        this.postService
          .getUserPosts(this.user.username, this.page)
          .subscribe(data => {
            this.posts = this.posts.concat(data.posts);
            this.loading = false;
          });
      }
    });
  }

  prepareToDelete(id: string): void {
    this.postToDelete = id;
  }

  deletePost(): void {
    if (this.postToDelete) {
      this.postService.deletePost(this.postToDelete).subscribe(data => {
        for (let i = 0; i < this.posts.length; i++) {
          if (this.posts[i]._id == this.postToDelete) {
            this.posts.splice(i, 1);
            this.postToDelete = null;
            break;
          }
        }
        this.messageClass = 'alert alert-danger';
        this.message = data.message;
        this.getPosts();
      });
    }
  }

  ngOnInit() {
    if (this.authService.loggedIn()) {
      this.user = this.authService.getUser();
      this.getPosts();
    }
  }

  dismissAlert(): void {
    this.message = '';
    this.messageClass = '';
  }
}
