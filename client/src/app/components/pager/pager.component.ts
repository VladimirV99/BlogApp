import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pager',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pager.component.html',
  styleUrl: './pager.component.scss'
})
export class PagerComponent {
  @Input({ required: true }) totalItems!: number;
  @Input() itemsPerPage: number = 10;
  @Input() currentPage: number = 1;
  @Input() pagesToShow: number = 5;
  @Input() loading = true;

  @Output() goPrev = new EventEmitter<boolean>();
  @Output() goNext = new EventEmitter<boolean>();
  @Output() goPage = new EventEmitter<number>();

  onPage(n: number): void {
    this.goPage.emit(n);
  }

  onPrev(): void {
    this.goPrev.emit(true);
  }

  onNext(): void {
    this.goNext.emit(true);
  }

  totalPages(): number {
    return Math.ceil(this.totalItems / this.itemsPerPage) || 0;
  }

  lastPage(): boolean {
    return this.itemsPerPage * this.currentPage >= this.totalItems;
  }

  getPages(): number[] {
    const total = Math.ceil(this.totalItems / this.itemsPerPage);
    const current = this.currentPage || 1;
    const pagesToShow = this.pagesToShow || 9;
    const pages: number[] = [];
    pages.push(current);
    const times = pagesToShow - 1;
    for (let i = 0; i < times; i++) {
      if (pages.length < pagesToShow) {
        if (Math.min.apply(null, pages) > 1) {
          pages.push(Math.min.apply(null, pages) - 1);
        }
      }
      if (pages.length < pagesToShow) {
        if (Math.max.apply(null, pages) < total) {
          pages.push(Math.max.apply(null, pages) + 1);
        }
      }
    }
    pages.sort((a, b) => a - b);
    return pages;
  }
}
