import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import User from 'src/app/models/user';
import Message from 'src/app/models/message';
import Post from 'src/app/models/post';
import { PostService } from '../../services/post.service';

@Component({
  selector: 'app-comments',
  templateUrl: './comments.component.html',
  styleUrls: ['./comments.component.scss', '../../post.scss']
})
export class CommentsComponent implements OnInit {

  @Input('post') post: Post;
  @Input('user') user: User;

  @Output() message = new EventEmitter<Message>();
  @Output() refresh = new EventEmitter<number>();

  commentForm: FormGroup;
  processingComment: boolean = false;

  loadedComments: number = 0;

  constructor(private formBuilder: FormBuilder,
    private postService: PostService) { 
    this.commentForm = this.formBuilder.group({
      comment: ['', Validators.compose([
        Validators.required,
        Validators.maxLength(500)
      ])]
    });
  }

  loadComments() {
    let before = (this.post && this.post.comments && this.post.comments.length>0)? this.post.comments[this.post.comments.length-1].createdAt : Date.now();
    this.postService.getComments(this.post._id, before).subscribe(data => {
      if(!data.success) {
        this.message.emit({success: false, message: data.message});
      } else {
        if(data.comments.length == 0){
          this.refresh.emit(this.loadedComments);
        } else {
          this.post.comments = this.post.comments.concat(data.comments);
          this.loadedComments += data.comments.length;
        }
      }
    });
  }

  disableCommentForm() {
    this.commentForm.controls['comment'].disable();
  }

  enableCommentForm() {
    this.commentForm.controls['comment'].enable();
  }

  onCommentSubmit() {
    this.processingComment = true;
    this.disableCommentForm();
    
    const comment = {
      parent_post: this.post._id,
      comment: this.commentForm.get('comment').value
    }

    this.postService.postComment(comment).subscribe(data => {
      if (!data.success) {
        this.message.emit({success: false, message: data.message});
      } else {
        this.message.emit({success: true, message: data.message});
        data.comment.createdBy = this.user;
        this.post.comments.unshift(data.comment);
      }
      this.processingComment = false;
      this.commentForm.get('reply').reset();
      this.enableCommentForm();
    });
  }

  ngOnInit() {
    this.loadComments();
  }

}
