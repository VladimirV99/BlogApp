import { Component, OnInit, ContentChild, ElementRef } from '@angular/core';

import { makeHtml } from '../../libs/markdown.node';

@Component({
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.scss']
})
export class EditorComponent implements OnInit {
  @ContentChild('mdContent', { static: false }) mdContent: ElementRef;

  convertedText: string = '';

  tabWriteActive: boolean = true;
  tabPreviewActive: boolean = !this.tabWriteActive;

  constructor() {}

  ngOnInit() {}

  reset(): void {
    this.convertedText = '';
    this.showWrite();
  }

  showPreview(): boolean {
    this.tabWriteActive = false;
    this.tabPreviewActive = true;

    let text: string = this.mdContent.nativeElement.value.trim();

    if (this.convertedText != text || text == '') {
      this.convertedText = text;

      let preview: string = 'nothing to preview';
      if (text != '') {
        preview = makeHtml(text);
      }
      document.getElementById('md-preview').innerHTML = preview;
    }

    return false;
  }

  showWrite(): boolean {
    this.tabPreviewActive = false;
    this.tabWriteActive = true;
    return false;
  }

  makeHeader(): void {
    this.toggleMdTag(this.mdContent.nativeElement, '### ', '');
  }

  makeBold(): void {
    this.toggleMdTag(this.mdContent.nativeElement, '**', '**');
  }

  makeItalic(): void {
    this.toggleMdTag(this.mdContent.nativeElement, '_', '_');
  }

  makeQuote(): void {
    this.toggleMdBlockTag(this.mdContent.nativeElement, '> ', '');
  }

  moveToParagraph(mdContent: HTMLTextAreaElement): void {
    let selectionStart: number = mdContent.selectionStart;
    let selectionEnd: number = mdContent.selectionEnd;
    let text: string = mdContent.value;

    let prefix: string = '';
    let suffix: string = '';
    if (!(selectionStart == 1 && text[0] == '\n') && selectionStart > 1) {
      if (text[selectionStart - 1] != '\n') prefix += '\n\n';
      else if (text[selectionStart - 2] != '\n') prefix += '\n';
    }
    if (
      !(selectionEnd == text.length - 1 && text[text.length - 2] == '\n') &&
      selectionEnd < text.length - 1
    ) {
      if (text[selectionEnd] != '\n') suffix += '\n\n';
      else if (text[selectionEnd + 1] != '\n') suffix += '\n';
    }
    this.addMdTag(mdContent, prefix, suffix);
  }

  makeCode(): void {
    if (
      this.mdContent.nativeElement.value
        .substring(
          this.mdContent.nativeElement.selectionStart,
          this.mdContent.nativeElement.selectionEnd
        )
        .includes('\n')
    )
      this.toggleMdTag(this.mdContent.nativeElement, '```\n', '\n```');
    else this.toggleMdTag(this.mdContent.nativeElement, '`', '`');
  }

  makeLink(): void {
    this.toggleMdTag(this.mdContent.nativeElement, '[', '](url)');
    if (
      this.mdContent.nativeElement.selectionStart !=
      this.mdContent.nativeElement.selectionEnd
    ) {
      this.mdContent.nativeElement.setSelectionRange(
        this.mdContent.nativeElement.selectionEnd + 2,
        this.mdContent.nativeElement.selectionEnd + 5
      );
    }
  }

  makeUnorderedList(): void {
    this.toggleMdBlockTag(this.mdContent.nativeElement, '- ', '');
  }

  makeOrderedList(): void {
    let lines: string[] = this.mdContent.nativeElement.value
      .substring(
        this.mdContent.nativeElement.selectionStart,
        this.mdContent.nativeElement.selectionEnd
      )
      .split('\n');

    let selectionStart: number = this.mdContent.nativeElement.selectionStart;
    let selectionEnd: number = this.mdContent.nativeElement.selectionStart;
    let originalStart: number = selectionStart;

    let remove: boolean = true;
    let prefix: string;
    let suffix: string = '';
    for (let i = 0; i < lines.length; i++) {
      prefix = i + 1 + '. ';
      selectionEnd = selectionStart + lines[i].length;
      if (
        !this.tryRemoveMdTag(
          this.mdContent.nativeElement.value,
          selectionStart + prefix.length,
          selectionEnd - suffix.length,
          prefix,
          suffix
        )
      ) {
        remove = false;
        break;
      }
      selectionStart = selectionEnd + 1;
    }

    selectionStart = this.mdContent.nativeElement.selectionStart;
    selectionEnd = this.mdContent.nativeElement.selectionStart;
    if (remove) {
      for (let i = 0; i < lines.length; i++) {
        prefix = i + 1 + '. ';
        selectionEnd = selectionStart + lines[i].length;
        this.mdContent.nativeElement.setSelectionRange(
          selectionStart + prefix.length,
          selectionEnd - suffix.length
        );
        this.removeMdTag(this.mdContent.nativeElement, prefix, suffix);
        selectionStart = this.mdContent.nativeElement.selectionEnd + 1;
      }
      this.mdContent.nativeElement.setSelectionRange(
        originalStart,
        this.mdContent.nativeElement.selectionEnd
      );
    } else {
      for (let i = 0; i < lines.length; i++) {
        prefix = i + 1 + '. ';
        selectionEnd = selectionStart + lines[i].length;
        this.mdContent.nativeElement.setSelectionRange(
          selectionStart,
          selectionEnd
        );
        this.addMdTag(this.mdContent.nativeElement, prefix, suffix);
        selectionStart = this.mdContent.nativeElement.selectionEnd + 1;
      }
      this.mdContent.nativeElement.setSelectionRange(
        originalStart,
        this.mdContent.nativeElement.selectionEnd
      );
      this.moveToParagraph(this.mdContent.nativeElement);
    }
  }

  makeTaskList(): void {
    this.toggleMdBlockTag(this.mdContent.nativeElement, '- [] ', '');
  }

  addMdTag(
    mdContent: HTMLTextAreaElement,
    prefix: string,
    suffix: string
  ): void {
    let selectionStart: number = mdContent.selectionStart;
    let selectionEnd: number = mdContent.selectionEnd;
    let text: string = mdContent.value;

    mdContent.value =
      text.substring(0, selectionStart) +
      prefix +
      text.substring(selectionStart, selectionEnd) +
      suffix +
      text.substring(selectionEnd);
    mdContent.setSelectionRange(
      selectionStart + prefix.length,
      selectionEnd + prefix.length
    );

    mdContent.focus();
  }

  removeMdTag(
    mdContent: HTMLTextAreaElement,
    prefix: string,
    suffix: string,
    check: boolean = true
  ): void {
    let selectionStart: number = mdContent.selectionStart;
    let selectionEnd: number = mdContent.selectionEnd;
    let text: string = mdContent.value;

    if (
      check &&
      !this.tryRemoveMdTag(text, selectionStart, selectionEnd, prefix, suffix)
    )
      return;

    mdContent.value =
      text.substring(0, selectionStart - prefix.length) +
      text.substring(selectionStart, selectionEnd) +
      text.substring(selectionEnd + suffix.length);
    mdContent.setSelectionRange(
      selectionStart - prefix.length,
      selectionEnd - prefix.length
    );

    mdContent.focus();
  }

  tryRemoveMdTag(
    text: string,
    l: number,
    r: number,
    prefix: string,
    suffix: string
  ): boolean {
    return (
      l >= prefix.length &&
      text.substring(l - prefix.length, l) == prefix &&
      text.substring(r, r + suffix.length) == suffix
    );
  }

  toggleMdTag(
    mdContent: HTMLTextAreaElement,
    prefix: string,
    suffix: string
  ): boolean {
    let selectionStart: number = mdContent.selectionStart;
    let selectionEnd: number = mdContent.selectionEnd;
    let text: string = mdContent.value;

    if (
      this.tryRemoveMdTag(text, selectionStart, selectionEnd, prefix, suffix)
    ) {
      this.removeMdTag(mdContent, prefix, suffix);
      return false;
    } else {
      this.addMdTag(mdContent, prefix, suffix);
      return true;
    }
  }

  toggleMdBlockTag(
    mdContent: HTMLTextAreaElement,
    prefix: string,
    suffix: string
  ) {
    let lines: string[] = mdContent.value
      .substring(mdContent.selectionStart, mdContent.selectionEnd)
      .split('\n');

    let selectionStart: number = mdContent.selectionStart;
    let selectionEnd: number = mdContent.selectionStart;
    let originalStart: number = selectionStart;

    let remove: boolean = true;
    for (let i = 0; i < lines.length; i++) {
      selectionEnd = selectionStart + lines[i].length;
      if (
        !this.tryRemoveMdTag(
          mdContent.value,
          selectionStart + prefix.length,
          selectionEnd - suffix.length,
          prefix,
          suffix
        )
      ) {
        remove = false;
        break;
      }
      selectionStart = selectionEnd + 1;
    }

    selectionStart = mdContent.selectionStart;
    selectionEnd = mdContent.selectionStart;
    if (remove) {
      for (let i = 0; i < lines.length; i++) {
        selectionEnd = selectionStart + lines[i].length;
        mdContent.setSelectionRange(
          selectionStart + prefix.length,
          selectionEnd - suffix.length
        );
        this.removeMdTag(mdContent, prefix, suffix);
        selectionStart = mdContent.selectionEnd + 1;
      }
      mdContent.setSelectionRange(originalStart, mdContent.selectionEnd);
    } else {
      for (let i = 0; i < lines.length; i++) {
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
