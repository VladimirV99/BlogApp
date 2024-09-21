import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

import { AuthService } from '../../services/auth.service';
import { PostService } from '../../services/post.service';
import { UiService } from '../../services/ui.service';
import { User } from '../../models/user';
import { Post } from '../../models/post';
import { Notification } from '../../models/message';
import { ArticleComponent } from '../../components/article/article.component';
import { CommentsComponent } from '../../components/comments/comments.component';

@Component({
  selector: 'app-post',
  standalone: true,
  imports: [CommonModule, ArticleComponent, CommentsComponent],
  templateUrl: './post.component.html',
  styleUrl: './post.component.scss'
})
export class PostComponent implements OnInit {
  message: string = '';
  messageClass: string = '';

  noPhoto: string = this.uiService.noPhoto();

  user!: User;
  post: Post | null = null;
  loading: boolean = true;
  postToDelete: string | null = null;

  constructor(
    private activatedRoute: ActivatedRoute,
    private authService: AuthService,
    public postService: PostService,
    public uiService: UiService
  ) {}

  deletePost(post: string): void {
    this.postService.deletePost(post).subscribe(data => {
      this.messageClass = 'alert-danger';
      this.message = data.message;
      this.getPost();
    });
  }

  getPost(): void {
    this.postService
      .getPost(this.activatedRoute.snapshot.params['id'])
      .subscribe({
        next: postData => {
          this.post = postData.post;
          this.post.comments = [];
          this.loading = false;
        },
        error: (err: HttpErrorResponse) => {
          this.messageClass = 'alert-danger';
          this.message = err.error.message;
        }
      });
  }

  ngOnInit() {
    if (this.authService.loggedIn()) {
      this.user = this.authService.getUser()!;
    }
    this.getPost();
  }

  dismissAlert(): void {
    this.message = '';
    this.messageClass = '';
  }

  refreshCommentCount(count: number): void {
    this.post!.totalComments = count;
  }

  onMessage(message: Notification) {
    this.message = message.message;
    if (message.success) this.messageClass = 'alert-success';
    else this.messageClass = 'alert-danger';
  }
}
