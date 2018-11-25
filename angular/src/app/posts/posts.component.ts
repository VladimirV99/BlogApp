import { Component, OnInit } from '@angular/core';

import { AuthService } from '../services/auth.service';
import { PostService } from '../services/post.service';
import { UiService } from '../services/ui.service';

@Component({
  selector: 'app-posts',
  templateUrl: './posts.component.html',
  styleUrls: ['./posts.component.css']
})
export class PostsComponent implements OnInit {

  message: string;
  messageClass: string;

  user;
  totalPosts = 0;

  page = 1;
  posts = [];

  postToDelete: string;
  loadingPosts = true;

  constructor(
    private authService: AuthService,
    private postService: PostService,
    private uiService: UiService
  ) { }

  loadMorePosts() {
    if(this.posts.length<this.totalPosts) {
      this.page++
      this.getPosts();
    }
  }

  getPosts() {
    this.loadingPosts = true;
    this.postService.getUserPostCount(this.user.username).subscribe(data => {
      if(!data.success) {
        this.messageClass = 'alert alert-danger';
        this.message = data.message;
      } else {
        this.totalPosts = data.count;
        this.postService.getUserPosts(this.user.username, this.page).subscribe(data => {
          this.posts = this.posts.concat(data.posts);
          this.loadingPosts = false;
        });
      }
    });
  }

  prepareToDelete(id) {
    this.postToDelete = id;
  }

  deletePost() {
    if(this.postToDelete){
      this.postService.deletePost(this.postToDelete).subscribe(data => {
        for(let i=0; i<this.posts.length; i++) {
          if(this.posts[i]._id==this.postToDelete) {
            this.posts.splice(i, 1);
            this.postToDelete = null;
            break;
          }
        }
        this.messageClass = "alert alert-danger";
        this.message = data.message;
        this.getPosts();
      });
    }
  }

  ngOnInit() {
    if(this.authService.loggedIn()){
      this.authService.getProfile().subscribe(profileData => {
        if (!profileData.success) {
          this.messageClass = 'alert alert-danger';
          this.message = profileData.message;
        } else {
          this.user = profileData.user;
          if(this.user.photo)
            this.user.photo = this.authService.domain + this.user.photo;
          this.getPosts();
        }
      });
    }
  }

}
