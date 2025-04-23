import { NgModule, APP_INITIALIZER } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CKEditorModule } from 'ng2-ckeditor';
import { RouterModule, Routes } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { ToastrModule } from 'ngx-toastr';

import { AppComponent } from './app.component';
import { HeaderComponent } from './shared/header/header.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { LoginComponent } from './auth/login/login.component';
import { SignupComponent } from './auth/signup/signup.component';
import { BlogFormComponent } from './blog/blog-form/blog-form.component';
import { BlogListComponent } from './blog/blog-list/blog-list.component';
import { BlogDetailComponent } from './blog/blog-detail/blog-detail.component';
import { ConfirmationService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  // { path: 'dashboard', component: DashboardComponent },
  { path: 'dashboard/:id', component: DashboardComponent },
  { path: 'blog/new', component: BlogFormComponent },
  { path: 'blog/new/:id', component: BlogFormComponent },
  { path: 'blog-details', component: BlogDetailComponent }
];

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    DashboardComponent,
    LoginComponent,
    SignupComponent,
    BlogFormComponent,
    BlogListComponent,
    BlogDetailComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    CKEditorModule,
    RouterModule.forRoot(routes),
    HttpClientModule,
    ToastrModule.forRoot({
      timeOut: 3000,
      positionClass: 'toast-top-right',
      preventDuplicates: true,
      progressBar: true,
      enableHtml: true
    }),
    ConfirmDialogModule
  ],
  providers: [
    ConfirmationService,
    {
      provide: APP_INITIALIZER,
      useFactory: () => {
        return () => {
          const bootstrap = (window as any).bootstrap;
          if (bootstrap) {
            // Initialize all dropdowns
            const dropdownElements = document.querySelectorAll('[data-bs-toggle="dropdown"]');
            dropdownElements.forEach(element => {
              new bootstrap.Dropdown(element);
            });
          }
          return Promise.resolve();
        };
      },
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
