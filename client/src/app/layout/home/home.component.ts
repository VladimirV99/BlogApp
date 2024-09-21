import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { RouterLink } from '@angular/router';

import { AuthService } from '../../services/auth.service';
import { UiService } from '../../services/ui.service';
import { PostService } from '../../services/post.service';
import { postsPerPage } from '../../constants/settings';
import { Post } from '../../models/post';
import { User } from '../../models/user';
import { PagerComponent } from '../../components/pager/pager.component';
import { ArticleComponent } from '../../components/article/article.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, ArticleComponent, PagerComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss', '../../styles/post.scss']
})
export class HomeComponent implements OnInit {
  @ViewChild('top', { static: true }) top!: ElementRef;

  message: string = '';
  messageClass: string = '';

  user: User | null = null;
  posts: Post[] = [];
  popularPosts: Post[] = [];
  loading: boolean = true;

  totalPosts: number = 0;
  page: number = 1;

  constructor(
    private authService: AuthService,
    public uiService: UiService,
    public postService: PostService
  ) {}

  getPosts(): void {
    this.postService.getPostCount().subscribe({
      next: data => {
        this.totalPosts = data.count;
        this.page = Math.min(
          this.page,
          Math.ceil(this.totalPosts / postsPerPage)
        );
        if (this.totalPosts != 0) {
          this.postService.getPosts(this.page).subscribe(data => {
            this.posts = data.posts;
            if (!this.loading)
              this.top.nativeElement.scrollIntoView({ behavior: 'smooth' });
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

  getPopularPosts(): void {
    this.postService.getPopular().subscribe({
      next: data => {
        this.popularPosts = data.posts;
      },
      error: (err: HttpErrorResponse) => {
        this.messageClass = 'alert-danger';
        this.message = err.error.message;
      }
    });
  }

  deletePost(post: string): void {
    this.postService.deletePost(post).subscribe(data => {
      this.messageClass = 'alert-danger';
      this.message = data.message;
      this.getPosts();
    });
  }

  onNextPage(): void {
    if (this.page < Math.ceil(this.totalPosts / postsPerPage)) {
      this.page++;
      this.getPosts();
    }
  }

  onPrevPage(): void {
    if (this.page > 0) {
      this.page--;
      this.getPosts();
    }
  }

  goToPage(page: number): void {
    this.page = page;
    this.getPosts();
  }

  ngOnInit(): void {
    if (this.authService.loggedIn()) {
      this.user = this.authService.getUser();
    }
    this.getPosts();
    this.getPopularPosts();
  }

  dismissAlert(): void {
    this.message = '';
    this.messageClass = '';
  }
}
