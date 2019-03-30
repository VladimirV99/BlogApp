import { Component, OnInit, Input } from '@angular/core';

import Post from 'src/app/models/post';
import { User } from 'src/app/models/user';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-article',
  templateUrl: './article.component.html',
  styleUrls: ['./article.component.scss', '../../post.scss']
})
export class ArticleComponent implements OnInit {

  @Input('post') post: Post;
  @Input('user') user: User;

  constructor(private authService: AuthService) { }

  ngOnInit() {
  }

}
