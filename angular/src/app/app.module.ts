import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms'

import { AppRoutingModule } from './app-routing.module';
import { AuthService } from './services/auth.service';
import { UiService } from './services/ui.service';
import { PostService } from './services/post.service';
import { ValidateService } from './services/validate.service';
import { AuthGuard } from './guards/auth.guard';
import { NotAuthGuard } from './guards/notAuth.guard';

import { AppComponent } from './app.component';
import { NavbarComponent } from './layout/navbar/navbar.component';
import { RegisterComponent } from './layout/register/register.component';
import { LoginComponent } from './layout/login/login.component';
import { HomeComponent } from './layout/home/home.component';
import { WriteComponent } from './layout/write/write.component';
import { EditComponent } from './layout/edit/edit.component';
import { ProfileComponent } from './layout/profile/profile.component';
import { PostComponent } from './layout/post/post.component';
import { RepliesComponent } from './components/replies/replies.component';
import { PagerComponent } from './components/pager/pager.component';
import { UserComponent } from './layout/user/user.component';
import { PostsComponent } from './layout/posts/posts.component';
import { ArticleComponent } from './components/article/article.component';
import { BookmarksComponent } from './layout/bookmarks/bookmarks.component';
import { EditorComponent } from './components/editor/editor.component';

@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    RegisterComponent,
    HomeComponent,
    LoginComponent,
    WriteComponent,
    EditComponent,
    ProfileComponent,
    PostComponent,
    RepliesComponent,
    PagerComponent,
    UserComponent,
    PostsComponent,
    ArticleComponent,
    BookmarksComponent,
    EditorComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule
  ],
  providers: [
    AuthService,
    UiService,
    PostService,
    ValidateService,
    AuthGuard,
    NotAuthGuard
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
