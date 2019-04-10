import { Component, OnInit } from '@angular/core';

import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Params } from '@angular/router';
import { ValidateService } from '../../services/validate.service';
import { PostService } from '../../services/post.service';

@Component({
  selector: 'app-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.scss', '../../form-validation.scss']
})
export class EditComponent implements OnInit {

  message: string = '';
  messageClass: string = '';

  editForm: FormGroup;
  processing: boolean = false;
  currentUrl: Params;
  loading: boolean = true;

  constructor(
    private formBuilder: FormBuilder,
    private activatedRoute: ActivatedRoute,
    private postService: PostService,
    private validateService: ValidateService
  ) { 
    this.editForm = this.formBuilder.group({
      title: ['', Validators.compose([
        Validators.required,
        Validators.maxLength(50),
        Validators.minLength(5),
        this.validateService.validateTitle
      ])],
      body: ['', Validators.compose([
        Validators.required,
        Validators.maxLength(500),
        Validators.minLength(5)
      ])]
    });
  }

  disableForm(): void {
    this.editForm.controls['title'].disable();
    this.editForm.controls['body'].disable();
  }

  enableForm(): void {
    this.editForm.controls['title'].enable();
    this.editForm.controls['body'].enable();
  }

  onEditSubmit(): void {
    this.processing = true;
    this.disableForm();
    
    const post = {
      _id: this.currentUrl.id,
      title: this.editForm.get('title').value,
      body: this.editForm.get('body').value
    }

    this.postService.editPost(post).subscribe(data => {
      if (!data.success) {
        this.messageClass = 'alert alert-danger';
        this.message = data.message;
      } else {
        this.messageClass = 'alert alert-success';
        this.message = data.message;
      }
      this.processing = false;
      this.enableForm();
    });
  }

  ngOnInit() {
    this.currentUrl = this.activatedRoute.snapshot.params;
    this.postService.getPost(this.currentUrl.id).subscribe(data => {
      if (!data.success) {
        this.messageClass = 'alert alert-danger';
        this.message = data.message;
      } else {
        this.editForm.controls['title'].setValue(data.post.title);
        this.editForm.controls['body'].setValue(data.post.body);
        this.loading = false;
      }
    });
  }

  dismissAlert(): void {
    this.message = '';
    this.messageClass = '';
  }

}
