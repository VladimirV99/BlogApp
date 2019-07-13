import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';

import { PostService } from '../../services/post.service';
import { ValidateService } from '../../services/validate.service';

import { makeHtml } from '../../libs/markdown.node';

@Component({
  selector: 'app-write',
  templateUrl: './write.component.html',
  styleUrls: ['./write.component.scss', '../../form-validation.scss']
})
export class WriteComponent implements OnInit {

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
      this.showWrite();
      this.convertedText = '';
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

  showPreview(): boolean {
    this.tabWriteActive = false;
    this.tabPreviewActive = true;

    let text: string = this.writeForm.get('body').value.trim();
    
    if(this.convertedText != text || text=="") {
      this.convertedText = text;
    
      let preview: string = "nothing to preview";
      if(text!="") {
        preview = makeHtml(text);
      }
      document.getElementById('md-preview').innerHTML=preview;
    }

    return false;
  }

  showWrite(): boolean {
    this.tabPreviewActive = false;
    this.tabWriteActive = true;
    return false;
  }

  makeHeader(mdContent: HTMLTextAreaElement): void {
    this.toggleMdTag(mdContent, '### ', '');
    this.writeForm.controls['body'].setValue(mdContent.value);
  }

  makeBold(mdContent: HTMLTextAreaElement): void {
    this.toggleMdTag(mdContent, '**', '**');
    this.writeForm.controls['body'].setValue(mdContent.value);
  }

  makeItalic(mdContent: HTMLTextAreaElement): void {
    this.toggleMdTag(mdContent, '_', '_');
    this.writeForm.controls['body'].setValue(mdContent.value);
  }

  makeQuote(mdContent: HTMLTextAreaElement): void {
    this.toggleMdBlockTag(mdContent, '> ', '');
    this.writeForm.controls['body'].setValue(mdContent.value);
  }

  moveToParagraph(mdContent: HTMLTextAreaElement): void {
    let selectionStart: number = mdContent.selectionStart;
    let selectionEnd: number = mdContent.selectionEnd;
    let text: string = mdContent.value;

    let prefix: string = '';
    let suffix: string = '';
    if(!(selectionStart == 1 && text[0] == '\n') && selectionStart > 1) {
      if(text[selectionStart-1] != '\n')
        prefix += '\n\n';
      else if(text[selectionStart-2] != '\n')
        prefix += '\n';
    }
    if(!(selectionEnd == text.length - 1 && text[text.length-2] == '\n') && selectionEnd < text.length - 1) {
      if(text[selectionEnd] != '\n')
        suffix += '\n\n';
      else if(text[selectionEnd+1] != '\n')
        suffix += '\n';
    }
    this.addMdTag(mdContent, prefix, suffix);
  }

  makeCode(mdContent: HTMLTextAreaElement): void {
    if(mdContent.value.substring(mdContent.selectionStart, mdContent.selectionEnd).includes('\n'))
      this.toggleMdTag(mdContent, '```\n', '\n```');
    else
      this.toggleMdTag(mdContent, '`', '`');
    this.writeForm.controls['body'].setValue(mdContent.value);
  }

  makeLink(mdContent: HTMLTextAreaElement): void {
    this.toggleMdTag(mdContent, '[', '](url)');
    if(mdContent.selectionStart != mdContent.selectionEnd) {
      mdContent.setSelectionRange(mdContent.selectionEnd + 2, mdContent.selectionEnd + 5);
    }
    this.writeForm.controls['body'].setValue(mdContent.value);
  }

  makeUnorderedList(mdContent: HTMLTextAreaElement): void {
    this.toggleMdBlockTag(mdContent, '- ', '');
    this.writeForm.controls['body'].setValue(mdContent.value);
  }

  makeOrderedList(mdContent: HTMLTextAreaElement): void {
    let lines: string[] = mdContent.value.substring(mdContent.selectionStart, mdContent.selectionEnd).split('\n');
    
    let selectionStart: number = mdContent.selectionStart;
    let selectionEnd: number = mdContent.selectionStart;
    let originalStart: number = selectionStart;

    let remove: boolean = true;
    let prefix: string;
    let suffix: string = '';
    for(let i = 0; i < lines.length; i++) {
      prefix = (i+1) + '. ';
      selectionEnd = selectionStart + lines[i].length;
      if(!this.tryRemoveMdTag(mdContent.value, selectionStart + prefix.length, selectionEnd - suffix.length, prefix, suffix)) {
        remove = false;
        break;
      }
      selectionStart = selectionEnd + 1;
    }

    selectionStart = mdContent.selectionStart;
    selectionEnd = mdContent.selectionStart;
    if(remove) {
      for(let i = 0; i < lines.length; i++) {
        prefix = (i+1) + '. ';
        selectionEnd = selectionStart + lines[i].length;
        mdContent.setSelectionRange(selectionStart + prefix.length, selectionEnd - suffix.length);
        this.removeMdTag(mdContent, prefix, suffix);
        selectionStart = mdContent.selectionEnd + 1;
      }
      mdContent.setSelectionRange(originalStart, mdContent.selectionEnd);
    } else {
      for(let i = 0; i < lines.length; i++) {
        prefix = (i+1) + '. ';
        selectionEnd = selectionStart + lines[i].length;
        mdContent.setSelectionRange(selectionStart, selectionEnd);
        this.addMdTag(mdContent, prefix, suffix);
        selectionStart = mdContent.selectionEnd + 1;
      }
      mdContent.setSelectionRange(originalStart, mdContent.selectionEnd);
      this.moveToParagraph(mdContent);
    }
    this.writeForm.controls['body'].setValue(mdContent.value);
  }

  makeTaskList(mdContent: HTMLTextAreaElement): void {
    this.toggleMdBlockTag(mdContent, '- [] ', '');
    this.writeForm.controls['body'].setValue(mdContent.value);
  }

  addMdTag(mdContent: HTMLTextAreaElement, prefix: string, suffix: string): void {
    let selectionStart: number = mdContent.selectionStart;
    let selectionEnd: number = mdContent.selectionEnd;
    let text: string = mdContent.value;

    mdContent.value = text.substring(0, selectionStart) + prefix + text.substring(selectionStart, selectionEnd) + suffix + text.substring(selectionEnd);
    mdContent.setSelectionRange(selectionStart + prefix.length, selectionEnd + prefix.length);
      
    mdContent.focus();
  }

  removeMdTag(mdContent: HTMLTextAreaElement, prefix: string, suffix: string, check: boolean=true): void {
    let selectionStart: number = mdContent.selectionStart;
    let selectionEnd: number = mdContent.selectionEnd;
    let text: string = mdContent.value;

    if(check && !this.tryRemoveMdTag(text, selectionStart, selectionEnd, prefix, suffix))
      return;

    mdContent.value = text.substring(0, selectionStart - prefix.length) + text.substring(selectionStart, selectionEnd) + text.substring(selectionEnd + suffix.length);
    mdContent.setSelectionRange(selectionStart - prefix.length, selectionEnd - prefix.length);

    mdContent.focus();
  }

  tryRemoveMdTag(text: string, l: number, r: number, prefix: string, suffix: string): boolean {
    return l >= prefix.length && text.substring(l - prefix.length, l) == prefix && text.substring(r, r + suffix.length) == suffix;
  }

  toggleMdTag(mdContent: HTMLTextAreaElement, prefix: string, suffix: string): boolean {
    let selectionStart: number = mdContent.selectionStart;
    let selectionEnd: number = mdContent.selectionEnd;
    let text: string = mdContent.value;

    if(this.tryRemoveMdTag(text, selectionStart, selectionEnd, prefix, suffix)) {
      this.removeMdTag(mdContent, prefix, suffix);
      return false;
    } else {
      this.addMdTag(mdContent, prefix, suffix);
      return true;
    }
  }

  toggleMdBlockTag(mdContent: HTMLTextAreaElement, prefix: string, suffix: string) {
    let lines: string[] = mdContent.value.substring(mdContent.selectionStart, mdContent.selectionEnd).split('\n');
    
    let selectionStart: number = mdContent.selectionStart;
    let selectionEnd: number = mdContent.selectionStart;
    let originalStart: number = selectionStart;

    let remove: boolean = true;
    for(let i = 0; i < lines.length; i++) {
      selectionEnd = selectionStart + lines[i].length;
      if(!this.tryRemoveMdTag(mdContent.value, selectionStart + prefix.length, selectionEnd - suffix.length, prefix, suffix)) {
        remove = false;
        break;
      }
      selectionStart = selectionEnd + 1;
    }

    selectionStart = mdContent.selectionStart;
    selectionEnd = mdContent.selectionStart;
    if(remove) {
      for(let i = 0; i < lines.length; i++) {
        selectionEnd = selectionStart + lines[i].length;
        mdContent.setSelectionRange(selectionStart + prefix.length, selectionEnd - suffix.length);
        this.removeMdTag(mdContent, prefix, suffix);
        selectionStart = mdContent.selectionEnd + 1;
      }
      mdContent.setSelectionRange(originalStart, mdContent.selectionEnd);
    } else {
      for(let i = 0; i < lines.length; i++) {
        selectionEnd = selectionStart + lines[i].length;
        mdContent.setSelectionRange(selectionStart, selectionEnd);
        this.addMdTag(mdContent, prefix, suffix);
        selectionStart = mdContent.selectionEnd + 1;
      }
      mdContent.setSelectionRange(originalStart, mdContent.selectionEnd);
      this.moveToParagraph(mdContent);
    }
  }

}
