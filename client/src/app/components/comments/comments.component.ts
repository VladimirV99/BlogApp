import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import { Post } from '../../models/post';
import { User } from '../../models/user';
import { BasicComment } from '../../models/comment';
import { Notification } from '../../models/message';
import { AuthService } from '../../services/auth.service';
import { PostService } from '../../services/post.service';
import { RepliesComponent } from '../replies/replies.component';

interface CommentFormValue {
  comment: string;
}

@Component({
  selector: 'app-comments',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RepliesComponent],
  templateUrl: './comments.component.html',
  styleUrls: ['./comments.component.scss', '../../styles/post.scss']
})
export class CommentsComponent implements OnInit {
  @Input({ required: true }) post!: Post;
  @Input({ required: true }) user!: User;

  @Output() notification = new EventEmitter<Notification>();
  @Output() refresh = new EventEmitter<number>();

  commentForm: FormGroup;

  totalComments: number = 0;
  comments: BasicComment[] = [];
  loadedComments: number = 0;

  constructor(
    private formBuilder: FormBuilder,
    public authService: AuthService,
    private postService: PostService
  ) {
    this.commentForm = this.formBuilder.group({
      comment: [
        '',
        Validators.compose([Validators.required, Validators.maxLength(500)])
      ]
    });
  }

  loadComments() {
    this.postService.getCommentCount(this.post._id).subscribe({
      next: data => {
        this.totalComments = data.count;
        this.refresh.emit(this.totalComments);
        if (this.totalComments > 0) {
          let before =
            this.comments && this.comments.length > 0
              ? Date.parse(this.comments[this.comments.length - 1].createdAt)
              : Date.now();
          this.postService.getComments(this.post._id, before).subscribe({
            next: data => {
              if (data.comments.length == 0) {
                this.loadedComments = this.totalComments;
              } else {
                this.comments = this.comments.concat(data.comments);
                this.loadedComments += data.comments.length;
              }
            },
            error: err => {
              this.notification.emit({ success: false, message: err.message });
            }
          });
        }
      },
      error: err => {
        this.notification.emit({ success: false, message: err.message });
      }
    });
  }

  onCommentSubmit() {
    this.commentForm.disable();

    const formValue = this.commentForm.value as CommentFormValue;
    const comment = {
      parent_post: this.post._id,
      comment: formValue.comment
    };

    this.postService.postComment(comment).subscribe({
      next: data => {
        this.notification.emit({ success: true, message: data.message });
        data.comment.createdBy = this.user;
        this.totalComments++;
        this.comments.unshift(data.comment);

        this.commentForm.reset();
        this.commentForm.enable();
      },
      error: err => {
        this.notification.emit({ success: false, message: err.message });
        this.commentForm.enable();
      }
    });
  }

  ngOnInit() {
    this.loadComments();
  }
}
