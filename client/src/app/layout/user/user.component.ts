import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';

import { AuthService } from '../../services/auth.service';
import { PostService } from '../../services/post.service';
import { UiService } from '../../services/ui.service';
import { User } from '../../models/user';
import { Post } from '../../models/post';
import { ArticleComponent } from '../../components/article/article.component';

@Component({
  selector: 'app-user',
  standalone: true,
  imports: [CommonModule, ArticleComponent],
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss', '../../styles/post.scss']
})
export class UserComponent implements OnInit {
  message: string = '';
  messageClass: string = '';

  noPhoto: string = this.uiService.noPhoto();

  user: User | null = null;

  page: number = 1;
  profile!: User; // TODO
  totalPosts: number = 0;
  posts: Post[] = [];

  loadingPosts: boolean = true;

  constructor(
    private activatedRoute: ActivatedRoute,
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
    this.loadingPosts = true;
    this.postService.getUserPostCount(this.profile.username).subscribe({
      next: data => {
        this.totalPosts = data.count;
        this.postService
          .getUserPosts(this.profile.username, this.page)
          .subscribe(data => {
            this.posts = this.posts.concat(data.posts);
            this.loadingPosts = false;
          });
      },
      error: (err: HttpErrorResponse) => {
        this.messageClass = 'alert-danger';
        this.message = err.error.message;
      }
    });
  }

  ngOnInit() {
    if (this.authService.loggedIn()) {
      this.user = this.authService.getUser();
    }
    this.authService
      .getUserProfile(this.activatedRoute.snapshot.params['username'])
      .subscribe({
        next: data => {
          this.profile = data.user;
          if (this.profile.photo)
            this.profile.photo = this.uiService.getPhoto(this.profile.photo);
          this.getPosts();
        },
        error: (err: HttpErrorResponse) => {
          this.messageClass = 'alert-danger';
          this.message = err.error.message;
        }
      });
  }

  dismissAlert(): void {
    this.message = '';
    this.messageClass = '';
  }
}
