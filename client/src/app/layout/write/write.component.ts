import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';

import { PostService } from '../../services/post.service';
import { ValidateService } from '../../services/validate.service';
import { EditorComponent } from 'src/app/components/editor/editor.component';

import { makeHtml } from '../../libs/markdown.node';

@Component({
  selector: 'app-write',
  templateUrl: './write.component.html',
  styleUrls: ['./write.component.scss', '../../form-validation.scss']
})
export class WriteComponent implements OnInit {

  @ViewChild('editor', {static: false}) editor: EditorComponent;

  message: string = '';
  messageClass: string = '';

  writeForm : FormGroup;
  processing: boolean = false;

  convertedText: string = '';

  tabWriteActive: boolean = true;
  tabPreviewActive: boolean = !this.tabWriteActive;

  constructor(
    private formBuilder: FormBuilder,
    private postService: PostService,
    private validateService: ValidateService
  ) {
    this.writeForm = this.formBuilder.group({
      title: ['', Validators.compose([
        Validators.required,
        Validators.maxLength(60),
        Validators.minLength(1),
        this.validateService.validateTitle
      ])],
      body: ['', Validators.compose([
        Validators.required,
        Validators.maxLength(1500),
        Validators.minLength(5)
      ])]
    });
  }

  disableForm(): void {
    this.writeForm.controls['title'].disable();
    this.writeForm.controls['body'].disable();
  }

  enableForm(): void {
    this.writeForm.controls['title'].enable();
    this.writeForm.controls['body'].enable();
  }

  onWriteSubmit(): void {
    this.processing = true;
    this.disableForm();
    
    const post = {
      title: this.writeForm.get('title').value,
      body: this.writeForm.get('body').value
    }

    this.postService.newPost(post).subscribe(data => {
      if (!data.success) {
        this.messageClass = 'alert alert-danger';
        this.message = data.message;
      } else {
        this.messageClass = 'alert alert-success';
        this.message = data.message;
      }
      this.editor.reset();
      this.writeForm.controls['title'].reset();
      this.writeForm.controls['body'].reset();
      this.processing = false;
      this.enableForm();
    });
  }

  ngOnInit() {
  }

  dismissAlert(): void {
    this.message = '';
    this.messageClass = '';
  }

}
