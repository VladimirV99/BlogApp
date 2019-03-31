import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import Post from '../../models/post';
import { AuthService } from '../../services/auth.service';
import { PostService } from '../../services/post.service';
import { UiService } from '../../services/ui.service';
import User from '../../models/user';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss', '../../post.scss']
})
export class UserComponent implements OnInit {

  message: string = '';
  messageClass: string = '';

  noPhoto: string = this.authService.domain + 'uploads/no-user.png';

  user: User;

  page: number = 1;
  profile: User;
  totalPosts: number = 0;
  posts: Post[] = [];

  loadingPosts: boolean = true;

  constructor(
    private activatedRoute: ActivatedRoute,
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
    this.postService.getUserPostCount(this.profile.username).subscribe(data => {
      if(!data.success) {
        this.messageClass = 'alert alert-danger';
        this.message = data.message;
      } else {
        this.totalPosts = data.count;
        this.postService.getUserPosts(this.profile.username, this.page).subscribe(data => {
          this.posts = this.posts.concat(data.posts);
          this.loadingPosts = false;
        });
      }
    });
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
          this.authService.getUserProfile(this.activatedRoute.snapshot.params.username).subscribe(data => {
            if(!data.success) {
              this.messageClass = 'alert alert-danger';
              this.message = data.message;
            } else {
              this.profile = data.user;
              if(this.profile.photo)
                this.profile.photo = this.authService.domain + this.profile.photo;
              this.getPosts();
            }
          });
        }
      });
    }
  }

  dismissAlert(): void {
    this.message = '';
    this.messageClass = '';
  }

}
