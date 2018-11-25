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
import { NavbarComponent } from './navbar/navbar.component';
import { RegisterComponent } from './register/register.component';
import { LoginComponent } from './login/login.component';
import { HomeComponent } from './home/home.component';
import { WriteComponent } from './write/write.component';
import { EditComponent } from './edit/edit.component';
import { EditProfileComponent } from './edit-profile/edit-profile.component';
import { PostComponent } from './post/post.component';
import { RepliesComponent } from './replies/replies.component';
import { PagerComponent } from './pager/pager.component';
import { UserComponent } from './user/user.component';
import { PostsComponent } from './posts/posts.component';

@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    RegisterComponent,
    HomeComponent,
    LoginComponent,
    WriteComponent,
    EditComponent,
    EditProfileComponent,
    PostComponent,
    RepliesComponent,
    PagerComponent,
    UserComponent,
    PostsComponent
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
