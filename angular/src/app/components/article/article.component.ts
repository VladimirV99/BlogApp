import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

import Post from '../../models/post';
import User from '../../models/user';
import { AuthService } from 'src/app/services/auth.service';
import { PostService } from 'src/app/services/post.service';

@Component({
  selector: 'app-article',
  templateUrl: './article.component.html',
  styleUrls: ['./article.component.scss', '../../post.scss']
})
export class ArticleComponent implements OnInit {

  @Input('post') post: Post;
  @Input('user') user: User;

  @Output() reload = new EventEmitter<boolean>();
  @Output() delete = new EventEmitter<string>();

  constructor(
    private authService: AuthService, 
    private postService: PostService
  ) { }

  bookmark(): void {
    if(!this.post.bookmarked) {
      this.authService.addBookmark(this.post._id).subscribe(data => {
        this.reload.emit(true);
      });
    } else {
      this.authService.removeBookmark(this.post._id).subscribe(data => {
        this.reload.emit(true);
      });
    }
  }

  likePost(): void {
    this.postService.likePost(this.post._id).subscribe(data => {
      this.reload.emit(true);
    });
  }

  dislikePost(): void {
    this.postService.dislikePost(this.post._id).subscribe(data => {
      this.reload.emit(true);
    });
  }

  prepareToDelete(): void {
    this.delete.emit(this.post._id);
  }

  ngOnInit() {
  }

}
