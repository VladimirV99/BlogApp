import { Component, OnInit } from '@angular/core';

import { AuthService } from '../services/auth.service'
import { UiService } from '../services/ui.service';
import { PostService } from '../services/post.service';

export interface Post{
  title: string;
  body: string;
  createdBy: {
    username: string;
    first_name: string;
    last_name: string;
  };
  createdAt: string;
  likes: number;
  likedByUser: boolean;
  dislikes: number;
  dislikedByUser: boolean;
}

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss', '../post.scss']
})
export class HomeComponent implements OnInit {

  message: string;
  messageClass: string;

  user;
  posts: Post[] = [];
  popularPosts: Post[] = [];
  postToDelete: string;
  loading = true;

  totalPosts = 0;
  page = 1;

  constructor(
    private authService: AuthService,
    private uiService: UiService,
    private postService: PostService
  ) { }

  getPosts() {
    this.loading = true;
    this.postService.getPostCount().subscribe(data => {
      if(!data.success) {
        this.messageClass = 'alert alert-danger';
        this.message = data.message;
      } else {
        this.totalPosts = data.count;
        this.postService.getPosts(this.page).subscribe(data => {
          this.posts = data.posts;
          this.loading = false;
        });
      }
    });
  }

  getPopularPosts() {
    this.postService.getPopular().subscribe(data => {
      if(!data.success) {
        this.messageClass = 'alert alert-danger';
        this.message = data.message;
      } else {
        this.popularPosts = data.posts;
      }
    });
  }

  likePost(id) {
    this.postService.likePost(id).subscribe(data => {
      this.getPosts();
    });
  }

  dislikePost(id) {
    this.postService.dislikePost(id).subscribe(data => {
      this.getPosts();
    });
  }

  prepareToDelete(id) {
    this.postToDelete = id;
  }

  deletePost() {
    if(this.postToDelete){
      this.postService.deletePost(this.postToDelete).subscribe(data => {
        this.postToDelete = null;
        this.messageClass = "alert alert-danger";
        this.message = data.message;
        this.getPosts();
      });
    }
  }

  onNextPage(): void {
    if(this.page<Math.ceil(this.totalPosts/this.postService.postsPerPage)){
      this.page++;
      this.getPosts();
    }
  }

  onPrevPage(): void {
    if(this.page>0){
      this.page--;
      this.getPosts();
    }
  }

  goToPage(page: number): void {
    this.page = page;
    this.getPosts();
  }

  ngOnInit() {
    if(this.authService.loggedIn()){
      this.authService.getProfile().subscribe(profileData => {
        if (!profileData.success) {
          this.messageClass = 'alert alert-danger';
          this.message = profileData.message;
        } else {
          this.user = profileData.user;
        }
      });
    }
    this.getPosts();
    this.getPopularPosts();
  }

}
