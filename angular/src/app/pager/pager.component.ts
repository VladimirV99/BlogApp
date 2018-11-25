import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-pager',
  templateUrl: './pager.component.html',
  styleUrls: ['./pager.component.scss']
})
export class PagerComponent implements OnInit {

  @Input('totalItems') totalItems: number;
  @Input('itemsPerPage') itemsPerPage: number;
  @Input('currentPage') currentPage: number;
  @Input('pagesToShow') pagesToShow: number;
  @Input('loading') loading = true;

  @Output() goPrev = new EventEmitter<boolean>();
  @Output() goNext = new EventEmitter<boolean>();
  @Output() goPage = new EventEmitter<number>();

  constructor() { }

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

  ngOnInit() {
  }

}
