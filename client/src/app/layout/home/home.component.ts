import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';

import { AuthService } from '../../services/auth.service';
import { UiService } from '../../services/ui.service';
import { PostService } from '../../services/post.service';
import User from '../../models/user';
import Post from '../../models/post';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss', '../../post.scss']
})
export class HomeComponent implements OnInit {
  @ViewChild('top', { static: true }) top: ElementRef;

  message: string = '';
  messageClass: string = '';

  user: User;
  posts: Post[] = [];
  popularPosts: Post[] = [];
  postToDelete: string;
  loading: boolean = true;

  totalPosts: number = 0;
  page: number = 1;

  constructor(
    private authService: AuthService,
    public uiService: UiService,
    public postService: PostService
  ) {}

  getPosts(): void {
    this.postService.getPostCount().subscribe(data => {
      if (!data.success) {
        this.messageClass = 'alert-danger';
        this.message = data.message;
      } else {
        this.totalPosts = data.count;
        this.page = Math.min(
          this.page,
          Math.ceil(this.totalPosts / this.postService.getPostsPerPage())
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
      }
    });
  }

  getPopularPosts(): void {
    this.postService.getPopular().subscribe(data => {
      if (!data.success) {
        this.messageClass = 'alert-danger';
        this.message = data.message;
      } else {
        this.popularPosts = data.posts;
      }
    });
  }

  deletePost(post: string): void {
    this.postService.deletePost(post).subscribe(data => {
      this.messageClass = 'alert alert-danger';
      this.message = data.message;
      this.getPosts();
    });
  }

  onNextPage(): void {
    if (
      this.page <
      Math.ceil(this.totalPosts / this.postService.getPostsPerPage())
    ) {
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
