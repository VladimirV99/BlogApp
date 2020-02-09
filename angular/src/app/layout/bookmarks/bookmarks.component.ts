import { Component, OnInit } from '@angular/core';

import { AuthService } from '../../services/auth.service'
import { UiService } from '../../services/ui.service';
import { PostService } from '../../services/post.service';
import User from '../../models/user';
import Post from '../../models/post';

@Component({
  selector: 'app-bookmarks',
  templateUrl: './bookmarks.component.html',
  styleUrls: ['./bookmarks.component.scss', '../../post.scss']
})
export class BookmarksComponent implements OnInit {

  message: string = '';
  messageClass: string = '';

  user: User;
  posts: Post[] = [];
  popularPosts: Post[] = [];
  postToDelete: string;
  loading: boolean = true;

  totalPosts: number = 0;
  page: number = 1;

  constructor(
    private authService: AuthService,
    public postService: PostService,
    public uiService: UiService
  ) { }

  getBookmarks(): void {
    this.postService.getBookmarkCount().subscribe(data => {
      if(!data.success) {
        this.messageClass = 'alert-danger';
        this.message = data.message;
      } else {
        this.totalPosts = data.count;
        this.page = Math.min(this.page, Math.ceil(this.totalPosts/this.postService.getPostsPerPage()));
        if(this.totalPosts != 0) {
          this.postService.getBookmarks(this.page).subscribe(data => {
            this.posts = data.posts;
            this.loading = false;
          });
        } else {
          this.posts = [];
          this.loading = false;
        }
      }
    });
  }

  onDelete(post: string): void {
    this.postToDelete = post;
  }

  deletePost(): void {
    if(this.postToDelete){
      this.postService.deletePost(this.postToDelete).subscribe(data => {
        this.postToDelete = null;
        this.messageClass = "alert alert-danger";
        this.message = data.message;
        this.getBookmarks();
      });
    }
  }

  onNextPage(): void {
    if(this.page<Math.ceil(this.totalPosts/this.postService.getPostsPerPage())){
      this.page++;
      this.getBookmarks();
    }
  }

  onPrevPage(): void {
    if(this.page>0){
      this.page--;
      this.getBookmarks();
    }
  }

  goToPage(page: number): void {
    this.page = page;
    this.getBookmarks();
  }

  ngOnInit(): void {
    if(this.authService.loggedIn()) {
      this.user = this.authService.getUser();
    }
    this.getBookmarks();
  }

  dismissAlert(): void {
    this.message = '';
    this.messageClass = '';
  }

}
