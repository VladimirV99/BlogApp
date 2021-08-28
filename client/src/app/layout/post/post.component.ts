import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { PostService } from '../../services/post.service';
import { AuthService } from '../../services/auth.service';
import { UiService } from '../../services/ui.service';
import User from 'src/app/models/user';
import Message from 'src/app/models/message';
import Post from 'src/app/models/post';

@Component({
  selector: 'app-post',
  templateUrl: './post.component.html',
  styleUrls: ['./post.component.scss', '../../post.scss']
})
export class PostComponent implements OnInit {
  message: string = '';
  messageClass: string = '';

  noPhoto: string = this.uiService.noPhoto();

  user: User;
  post: Post;
  loading: boolean = true;
  postToDelete: string;

  constructor(
    private activatedRoute: ActivatedRoute,
    private authService: AuthService,
    public postService: PostService,
    public uiService: UiService
  ) {}

  deletePost(post: string): void {
    this.postService.deletePost(post).subscribe(data => {
      this.messageClass = 'alert alert-danger';
      this.message = data.message;
      this.getPost();
    });
  }

  getPost(): void {
    this.postService
      .getPost(this.activatedRoute.snapshot.params.id)
      .subscribe(postData => {
        if (!postData.success) {
          this.messageClass = 'alert alert-danger';
          this.message = postData.message;
        } else {
          this.post = postData.post;
          this.post.comments = [];
          this.loading = false;
        }
      });
  }

  ngOnInit() {
    if (this.authService.loggedIn()) {
      this.user = this.authService.getUser();
    }
    this.getPost();
  }

  dismissAlert(): void {
    this.message = '';
    this.messageClass = '';
  }

  refreshCommentCount(count: number): void {
    this.post.totalComments = count;
  }

  onMessage(message: Message) {
    this.message = message.message;
    if (message.success) this.messageClass = 'alert alert-success';
    else this.messageClass = 'alert alert-danger';
  }
}
