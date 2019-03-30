import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

import Post from 'src/app/models/post';
import { User } from 'src/app/models/user';
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

  likePost(id: string) {
    this.postService.likePost(id).subscribe(data => {
      this.reload.emit(true);
    });
  }

  dislikePost(id: string) {
    this.postService.dislikePost(id).subscribe(data => {
      this.reload.emit(true);
    });
  }

  prepareToDelete(id: string) {
    this.delete.emit(id);
  }

  ngOnInit() {
  }

}
