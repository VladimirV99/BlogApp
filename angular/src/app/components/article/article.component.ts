import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

import Post from '../../models/post';
import User from '../../models/user';
import { AuthService } from 'src/app/services/auth.service';
import { PostService } from 'src/app/services/post.service';
import { UiService } from 'src/app/services/ui.service';

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

  private likesPage: number = 1;
  private dislikesPage: number = 1;

  constructor(
    public authService: AuthService, 
    private postService: PostService,
    public uiService: UiService
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

  deletePost(): void {
    this.delete.emit(this.post._id);
  }

  openLikes(): void {
    if(this.post.likes>0 && this.post.likedBy.length==0)
      this.loadLikes();
  }

  loadLikes(): void {
    if(this.post.likedBy.length < this.post.likes) {
      this.postService.getLikes(this.post._id, this.likesPage).subscribe(data => {
        this.post.likes = data.post.likes;
        data.post.likedBy.forEach(like => {
          like.photo = this.uiService.getPhoto(like.photo);
          this.post.likedBy.push(like);
        })
      });
      this.likesPage++;
    }
  }

  openDislikes(): void {
    if(this.post.dislikes>0 && this.post.dislikedBy.length==0)
      this.loadDislikes();
  }

  loadDislikes(): void {
    if(this.post.dislikedBy.length < this.post.dislikes) {
      this.postService.getDislikes(this.post._id, this.dislikesPage).subscribe(data => {
        this.post.dislikes = data.post.dislikes;
        data.post.dislikedBy.forEach(dislike => {
          dislike.photo = this.uiService.getPhoto(dislike.photo);
          this.post.dislikedBy.push(dislike);
        })
      });
      this.dislikesPage++;
    }
  }

  ngOnInit() {
    if(!this.post.likedBy)
      this.post.likedBy = [];
    if(!this.post.dislikedBy)
      this.post.dislikedBy = [];
  }

}
