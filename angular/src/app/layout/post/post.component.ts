import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { PostService } from '../../services/post.service';
import { AuthService } from '../../services/auth.service';
import { UiService } from '../../services/ui.service';

@Component({
  selector: 'app-post',
  templateUrl: './post.component.html',
  styleUrls: ['./post.component.scss', '../../post.scss']
})
export class PostComponent implements OnInit {

  message: string;
  messageClass: string;

  noPhoto = this.authService.domain + 'uploads/no-user.png';

  user;
  post;
  loading = true;

  commentForm: FormGroup;
  processingComment = false;

  totalComments = 0;
  loadedComments = 0;

  constructor(
    private formBuilder: FormBuilder,
    private activatedRoute: ActivatedRoute,
    private authService: AuthService,
    private postService: PostService,
    private uiService: UiService
  ) { 
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
        this.messageClass = 'alert alert-danger';
        this.message = data.message;
      } else {
        if(data.comments.length == 0){
          this.totalComments = this.loadedComments;
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
        this.messageClass = 'alert alert-danger';
        this.message = data.message;
      } else {
        this.messageClass = 'alert alert-success';
        this.message = data.message;
        data.comment.createdBy = this.user;
        this.post.comments.unshift(data.comment);
      }
      this.processingComment = false;
      this.commentForm.get('reply').reset();
      this.enableCommentForm();
    });
  }

  ngOnInit() {
    if(this.authService.loggedIn()){
      this.authService.getProfile().subscribe(profileData => {
        if(!profileData.success) {
          this.messageClass = 'alert alert-danger';
          this.message = profileData.message;
        } else {
          this.user = profileData.user;
          this.postService.getPost(this.activatedRoute.snapshot.params.id).subscribe(postData => {
            if (!postData.success) {
              this.messageClass = 'alert alert-danger';
              this.message = postData.message;
            } else {
              this.post = postData.post;
              this.post.comments = [];
              this.postService.getCommentCount(this.post._id).subscribe(commentData => {
                if (!commentData.success) {
                  this.messageClass = 'alert alert-danger';
                  this.message = commentData.message;
                } else {
                  this.totalComments = commentData.count;
                  if(this.totalComments > 0){
                    this.loadComments();
                  }
                }
                this.loading = false;
              });
            }
          });
        }
      });
    }
  }

}
