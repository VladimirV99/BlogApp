import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';

import { AuthService } from '../../services/auth.service';
import { PostService } from '../../services/post.service';
import { UiService } from '../../services/ui.service';
import { User } from '../../models/user';
import { Post } from '../../models/post';
import { ArticleComponent } from '../../components/article/article.component';
import { PagerComponent } from '../../components/pager/pager.component';

@Component({
  selector: 'app-bookmarks',
  standalone: true,
  imports: [CommonModule, ArticleComponent, PagerComponent],
  templateUrl: './bookmarks.component.html',
  styleUrls: ['./bookmarks.component.scss', '../../styles/post.scss']
})
export class BookmarksComponent implements OnInit {
  message: string = '';
  messageClass: string = '';

  user!: User;
  posts: Post[] = [];
  popularPosts: Post[] = [];
  postToDelete: string | null = null;
  loading: boolean = true;

  totalPosts: number = 0;
  page: number = 1;

  constructor(
    private authService: AuthService,
    public postService: PostService,
    public uiService: UiService
  ) {}

  getBookmarks(): void {
    this.postService.getBookmarkCount().subscribe({
      next: data => {
        this.totalPosts = data.count;
        this.page = Math.min(
          this.page,
          Math.ceil(this.totalPosts / this.postService.getPostsPerPage())
        );
        if (this.totalPosts != 0) {
          this.postService.getBookmarks(this.page).subscribe(data => {
            this.posts = data.posts;
            this.loading = false;
          });
        } else {
          this.posts = [];
          this.loading = false;
        }
      },
      error: (err: HttpErrorResponse) => {
        this.messageClass = 'alert-danger';
        this.message = err.error.message;
      }
    });
  }

  onDelete(post: string): void {
    this.postToDelete = post;
  }

  deletePost(): void {
    if (this.postToDelete) {
      this.postService.deletePost(this.postToDelete).subscribe(data => {
        this.postToDelete = null;
        this.messageClass = 'alert-danger';
        this.message = data.message;
        this.getBookmarks();
      });
    }
  }

  onNextPage(): void {
    if (
      this.page <
      Math.ceil(this.totalPosts / this.postService.getPostsPerPage())
    ) {
      this.page++;
      this.getBookmarks();
    }
  }

  onPrevPage(): void {
    if (this.page > 0) {
      this.page--;
      this.getBookmarks();
    }
  }

  goToPage(page: number): void {
    this.page = page;
    this.getBookmarks();
  }

  ngOnInit(): void {
    if (this.authService.loggedIn()) {
      this.user = this.authService.getUser()!;
    }
    this.getBookmarks();
  }

  dismissAlert(): void {
    this.message = '';
    this.messageClass = '';
  }
}
