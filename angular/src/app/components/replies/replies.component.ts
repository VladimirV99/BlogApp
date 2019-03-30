import { Component, OnInit, Input } from '@angular/core';

import { PostService } from '../../services/post.service';
import { AuthService } from '../../services/auth.service';
import { UiService } from '../../services/ui.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-replies',
  templateUrl: './replies.component.html',
  styleUrls: ['./replies.component.scss', '../../post.scss']
})
export class RepliesComponent implements OnInit {

  @Input('comment') comment;
  @Input('user') user;
  @Input('postCreator') postCreator;

  replyForm: FormGroup;
  showReply = false;
  processingReply = false;

  showReplies = false;
  processingReplies = false;

  replies = [];

  deleted = false;

  constructor(
    private formBuilder: FormBuilder,
    private postService: PostService,
    private authService: AuthService,
    private uiService: UiService
  ) { 
    this.replyForm = this.formBuilder.group({
      reply: ['', Validators.compose([
        Validators.required,
        Validators.maxLength(500)
      ])]
    });
  }

  toggleReplyForm() {
    this.showReply = !this.showReply;
  }

  disableReplyForm() {
    this.replyForm.controls['reply'].disable();
  }

  enableReplyForm() {
    this.replyForm.controls['reply'].enable();
  }

  onReplySubmit() {
    this.processingReply = true;
    this.disableReplyForm();
    
    const reply = {
      parent_comment: this.comment._id,
      comment: this.replyForm.get('reply').value
    }

    this.postService.postReply(reply).subscribe(data => {
      if (!data.success) {
        // this.messageClass = 'alert alert-danger';
        // this.message = data.message;
      } else {
        // this.messageClass = 'alert alert-success';
        // this.message = data.message;
        data.comment.createdBy = this.user;
        this.replies.unshift(data.comment);
      }
      this.processingReply = false;
      this.replyForm.get('reply').reset();
      this.enableReplyForm();
    });
  }

  showRepliesDiv() {
    this.showReplies = true;
    this.loadReplies();
  }

  loadReplies() {
    this.processingReplies = true;
    let before = (this.replies && this.replies.length>0)? this.replies[this.replies.length-1].createdAt : Date.now();
    this.postService.getReplies(this.comment._id, before).subscribe(data => {
      if(!data.success) {

      } else {
        if(data.comments.length==0) {
          this.comment.replies = this.replies.length;
        } else {
          this.replies = this.replies.concat(data.comments);
        }
        
      }
      this.processingReplies = false;
    });
  }

  deleteComment() {
    this.postService.deleteComment(this.comment._id).subscribe(data => {
      if (!data.success) {
        // this.messageClass = 'alert alert-danger';
        // this.message = data.message;
      } else {
        // this.messageClass = 'alert alert-success';
        // this.message = data.message;
        this.deleted = true;
      }
    });
  }

  ngOnInit() {
  }

}
