import { Component, OnInit } from '@angular/core';
import { ConfirmationService } from 'primeng/api';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { BlogService, BlogStats, Blog } from '../blog/blog.service';
// import * as CryptoJS from 'crypto-js';
import { ToastrService } from 'ngx-toastr';
import { CryptoUtil } from '../shared/crypto-util';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  activeRoute: string = '';
  blogStats: BlogStats = {
    totalBlogs: 0,
    totalComments: 0,
    totalUsers: 0,
    pendingComments: 0
  };
  recentBlogs: Blog[] = [];
  allBlogs: any[] = [];
  decryptedId: string = '';
  encryptedId: string = '';
  postCount:any;

  constructor(
    private confirmationService: ConfirmationService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private blogService: BlogService,
    private toastr: ToastrService
  ) {
    // Get encrypted ID from route params
    this.route.params.subscribe(params => {
      const encryptedId = params['encryptedId'];
      if (encryptedId) {
        localStorage.setItem('encryptedId', encryptedId);
        // this.loadPostCount(encryptedId);
      }
    });
  }




  ngOnInit(): void {
    // Read keyless query param from the URL
    const search = window.location.search;
    if (search && search.startsWith('?')) {
      this.encryptedId = decodeURIComponent(search.slice(1));
    }
    if (this.encryptedId) {
      const secretKey = 'Blog@123';
      const bytesId = CryptoJS.AES.decrypt(this.encryptedId, secretKey);
      this.decryptedId = bytesId.toString(CryptoJS.enc.Utf8);
      localStorage.setItem('userId', this.encryptedId); // Keep in sync
    }
    this.loadPostCount();
  }

   loadPostCount(): void {
    const userId = localStorage.getItem('userId');
    if (userId) {
      this.blogService.getPostCount(userId).subscribe(
        res => {
          this.postCount = res.count;
          // console.log(this.postCount);
        },
        error => {
          console.error('Error fetching post count:', error);
          this.toastr.error('Failed to fetch post count');
        }
      );
      this.blogService.getAllBlog(userId).subscribe(
        res => {
          this.allBlogs = res;
          // console.log(res);
          // console.log(this.postCount);
        },
        error => {
          console.error('Error fetching post count:', error);
          this.toastr.error('Failed to fetch post count');
        }
      );
    }
  }
  loadDashboardData(): void {
    // Load blog statistics
    this.blogService.getBlogStats().subscribe({
      next: (stats: BlogStats) => {
        this.blogStats = stats;
      },
      error: (error) => {
        console.error('Error loading blog stats:', error);
      }
    });

    // Load recent blogs
    this.blogService.getRecentBlogs().subscribe({
      next: (blogs: Blog[]) => {
        this.recentBlogs = blogs;
      },
      error: (error) => {
        console.error('Error loading recent blogs:', error);
      }
    });
  }

  editBlog(blogId: string): void {
    // const encryptedId = CryptoUtil.encryptUrlParams({ blog_id: blogId });
    // this.router.navigate(['/blog/new', encryptedId], { state: { isEdit: true } });
    const encryptedUrl = CryptoUtil.encryptUrlParams({ blog_id: blogId, isEdit: true, token: localStorage.getItem('userId') });
    this.router.navigateByUrl('/blog/new?' + encodeURIComponent(encryptedUrl));
  }

  viewBlog(blogId: string): void {
    // Use the common encryptUrlParams method to ensure blog_id is present as a property
    const encryptedUrl = CryptoUtil.encryptUrlParams({ blog_id: blogId, token: localStorage.getItem('userId') });
    this.router.navigateByUrl('/blog-details?' + encodeURIComponent(encryptedUrl));
  }

  deleteBlog(blogId: string): void {
    
    console.log(blogId);
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete this blog?',
      header: 'Delete Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.blogService.deleteBlog(blogId).subscribe({
          next: () => {
            this.toastr.success('Blog deleted successfully!');
            this.loadPostCount();
          },
          error: (error) => {
            console.error('Error deleting blog:', error);
          }
        });
      }
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
  addBlog()
  {
    this.router.navigate(['blog/new']);
  }

  goToAddBlog(): void {
    const encryptedUrl = CryptoUtil.encryptUrlParams({  isEdit: false, token: localStorage.getItem('userId') });
    this.router.navigateByUrl('/blog/new?' + encodeURIComponent(encryptedUrl));
  }
  getCount()
  {

  }
  
}
