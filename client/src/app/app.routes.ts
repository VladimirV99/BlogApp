import { Routes, mapToCanActivate } from '@angular/router';

import { HomeComponent } from './layout/home/home.component';
import { RegisterComponent } from './layout/register/register.component';
import { LoginComponent } from './layout/login/login.component';
import { WriteComponent } from './layout/write/write.component';
import { EditComponent } from './layout/edit/edit.component';
import { PostsComponent } from './layout/posts/posts.component';
import { PostComponent } from './layout/post/post.component';
import { ProfileComponent } from './layout/profile/profile.component';
import { UserComponent } from './layout/user/user.component';
import { BookmarksComponent } from './layout/bookmarks/bookmarks.component';

import { AuthGuard } from './guards/auth.guard';
import { NotAuthGuard } from './guards/notAuth.guard';

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent
  },
  {
    path: 'write',
    component: WriteComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'post/:id',
    component: PostComponent
  },
  {
    path: 'edit/:id',
    component: EditComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'posts',
    component: PostsComponent
  },
  {
    path: 'user/:username',
    component: UserComponent
  },
  {
    path: 'profile',
    component: ProfileComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'login',
    component: LoginComponent,
    canActivate: [NotAuthGuard]
  },
  {
    path: 'register',
    component: RegisterComponent,
    canActivate: [NotAuthGuard]
  },
  {
    path: 'bookmarks',
    component: BookmarksComponent,
    canActivate: [AuthGuard]
  },
  { path: '**', component: HomeComponent }
];
