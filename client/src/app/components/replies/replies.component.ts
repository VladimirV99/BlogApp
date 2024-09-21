import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';

import { PostService } from '../../services/post.service';
import { AuthService } from '../../services/auth.service';
import { UiService } from '../../services/ui.service';
import { BasicComment } from '../../models/comment';
import { User } from '../../models/user';

interface ReplyFormValue {
  reply: string;
}

@Component({
  selector: 'app-replies',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './replies.component.html',
  styleUrls: ['./replies.component.scss', '../../styles/post.scss']
})
export class RepliesComponent {
  @Input({ required: true }) comment!: BasicComment;
  @Input({ required: true }) user!: User;
  @Input({ required: true }) postCreator!: User;

  replyForm: FormGroup;
  showReply: boolean = false;
  processingReply: boolean = false;

  showReplies: boolean = false;
  replies: BasicComment[] = [];
  processingReplies: boolean = false;

  deleted: boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    private postService: PostService,
    public authService: AuthService,
    public uiService: UiService
  ) {
    this.replyForm = this.formBuilder.group({
      reply: [
        '',
        Validators.compose([Validators.required, Validators.maxLength(500)])
      ]
    });
  }

  toggleReplyForm() {
    this.showReply = !this.showReply;
  }

  onReplySubmit() {
    this.processingReply = true;
    this.replyForm.disable();

    const formValue = this.replyForm.value as ReplyFormValue;
    const reply = {
      parent_comment: this.comment._id,
      comment: formValue.reply
    };

    this.postService.postReply(reply).subscribe({
      next: data => {
        // this.messageClass = 'alert-success';
        // this.message = data.message;
        this.replies.unshift(data.comment);
        this.showReplies = true;

        this.processingReply = false;
        this.replyForm.reset();
        this.replyForm.enable();
      },
      error: (err: HttpErrorResponse) => {
        // this.messageClass = 'alert-danger';
        // this.message = err.error.message;

        this.processingReply = false;
        this.replyForm.reset();
        this.replyForm.enable();
      }
    });
  }

  showRepliesDiv() {
    this.showReplies = true;
    this.loadReplies();
  }

  loadReplies() {
    this.processingReplies = true;
    let before =
      this.replies && this.replies.length > 0
        ? Date.parse(this.replies[this.replies.length - 1].createdAt)
        : Date.now();
    this.postService.getReplies(this.comment._id, before).subscribe(data => {
      if (data.comments.length == 0) {
        this.comment.replies = this.replies.length;
      } else {
        this.replies = this.replies.concat(data.comments);
      }
      this.processingReplies = false;
    });
  }

  deleteComment() {
    this.postService.deleteComment(this.comment._id).subscribe({
      next: data => {
        // this.messageClass = 'alert-success';
        // this.message = data.message;
        this.deleted = true;
      },
      error: err => {
        // this.messageClass = 'alert-danger';
        // this.message = err.error.message;
      }
    });
  }
}
