import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { CryptoUtil } from '../../shared/crypto-util';
import { BlogService } from '../blog.service';

@Component({
  selector: 'app-blog-form',
  templateUrl: './blog-form.component.html',
  styleUrls: ['./blog-form.component.scss']
})
export class BlogFormComponent implements OnInit {
  blogForm: FormGroup;
  isSubmitting = false;
  imagePreview: string | null = null;
  encryptedId: string = '';
  imageFile: File | undefined = undefined;
  private readonly API_URL = 'https://myblog-lgth.onrender.com/api/blog/new';
  isEdit: any;
  blog_id: any;
  blog: any;

  constructor(
    private fb: FormBuilder,
    private blogService: BlogService,
    private router: Router,
    private toastr: ToastrService,
    private route: ActivatedRoute
  ) {
    // Read keyless query param from the URL
    const search = window.location.search;
    if (search && search.startsWith('?')) {
      this.encryptedId = decodeURIComponent(search.slice(1));
      // this.encryptedId = this.encryptedId.replace(/=$/, '');
    }
    this.blogForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      content: ['', Validators.required],
      featuredImage: [null]
    });
  }

  ngOnInit() {
    debugger
    const url = this.router.url;
    const queryString = url.split('?')[1];
        if (queryString) {
          try {
            // debugger
            const encryptedData = decodeURIComponent(queryString);
            if (encryptedData) {
              const decryptedObj = CryptoUtil.decryptUrlParams(encryptedData);
              if (decryptedObj) {
                this.blog_id = decryptedObj?.blog_id;
                this.isEdit = decryptedObj.isEdit;
                if(this.isEdit)
                {
                  this.getDetails()
                }
                console.log(this.isEdit);
           
              } else {
                console.error('Decrypted object missing blog_id:', decryptedObj);
              }
            } else {
              console.error('No encrypted data found in query string.');
            }
          } catch (e) {
            console.error('Decryption failed:', e);
          }
        }
  }

  get title() {
    return this.blogForm.get('title');
  }

  get content() {
    return this.blogForm.get('content');
  }
  getDetails() {
  this.blogService.getBlogDetails(this.blog_id).subscribe({
    next: (res: any) => {
      this.blog = res[0];
      // Patch form fields with blog data
      this.blogForm.patchValue({
        title: this.blog.title,
        content: this.blog.content,
        // featuredImage is handled by imagePreview
      });
      console.log('Patched form values:', this.blogForm.value);
      // Set image preview if image_url exists
      if (this.blog.image_url) {
        // If your backend returns a relative URL, prepend the host if needed
        this.imagePreview = this.blog.image_url.startsWith('http')
          ? this.blog.image_url
          : `https://myblog-lgth.onrender.com${this.blog.image_url}`;
      } else {
        this.imagePreview = null;
      }
    },
    error: (error) => {
      console.error('Error fetching blog details:', error);
    }
  });
}

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.imageFile = file;
      const reader = new FileReader();
      reader.onload = (e) => {
        this.imagePreview = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    } else {
      this.imageFile = undefined;
      this.imagePreview = null;
    }
  }

  removeImage() {
    this.imagePreview = null;
    this.blogForm.get('featuredImage')?.setValue(null);
  }

  triggerFileInput() {
    const fileInput = document.getElementById('fileInput') as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
  }

  onSubmit(): void {
    if (this.blogForm.invalid) {
      return;
    }
    this.isSubmitting = true;
    const userId = localStorage.getItem('userId') || '';
    const title = this.blogForm.value.title;
    const content = this.blogForm.value.content;
    console.log('Submitting form values:', this.blogForm.value);
    if (this.isEdit && this.blog_id) {
      this.updateBlogWithFetch(this.blog_id, userId, title, content, this.imageFile);
    } else {
      this.createBlogWithFetch(userId, title, content, this.imageFile);
    }
  }

  createBlogWithFetch(userId: string, title: string, description: string, imageFile?: File): void {
    const formData = new FormData();
    formData.append('userId', userId); // <-- camelCase
    formData.append('title', title);
    formData.append('content', description); // <-- match backend field
    if (imageFile) {
      formData.append('image', imageFile);
    }
  
    fetch('https://myblog-lgth.onrender.com/api/blog/new', {
      method: 'POST',
      body: formData
    })
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        if (data.message === 'Post created successfully') {
          this.toastr.success('Blog saved successfully!');
          // this.router.navigate(['/dashboard']);
        } else {
          throw new Error(data.message || 'Unknown response from server');
        }
      })
      .catch(error => {
        console.error('Error:', error);
        const errorMessage = error.message || 'An error occurred while saving the blog';
        this.toastr.error(errorMessage, 'Error Saving Blog');
        this.isSubmitting = false;
        // Reset the form after error
        this.blogForm.reset();
        this.imageFile = undefined;
        this.imagePreview = null;
        // Check if it's a 404 error
        if (error.message.includes('404')) {
          alert('API endpoint not found. Please check if your backend server is running and the endpoint is correct.');
        }
      });
  }

  updateBlogWithFetch(blogId: string, userId: string, title: string, content: string, imageFile?: File): void {
    console.log('updateBlogWithFetch args:', { blogId, userId, title, content, imageFile });
    const formData = new FormData();
    // formData.append('id', blogId); // blog id for update
    // formData.append('userId', userId);
    formData.append('title', title ?? '');
formData.append('content', content ?? '');
if (imageFile) {
  formData.append('image_url', imageFile); // Use the correct field name
}
    // Log all FormData contents
    formData.forEach((value, key) => {
      console.log('FormData:', key, value);
    });
    fetch(`https://myblog-lgth.onrender.com/api/blogs/posts/update/${blogId}`, {
      method: 'PUT',
      body: formData
    })
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        if (data.message === 'Post updated successfully') {
          this.toastr.success('Blog updated successfully!');
          // this.router.navigate(['/dashboard']);
        } else {
          throw new Error(data.message || 'Unknown response from server');
        }
      })
      .catch(error => {
        console.error('Error:', error);
        const errorMessage = error.message || 'An error occurred while updating the blog';
        this.toastr.error(errorMessage, 'Error Updating Blog');
        this.isSubmitting = false;
        // Reset the form after error
        this.blogForm.reset();
        this.imageFile = undefined;
        this.imagePreview = null;
        // Check if it's a 404 error
        if (error.message.includes('404')) {
          alert('API endpoint not found. Please check if your backend server is running and the endpoint is correct.');
        }
      });
  }

  onCancel(): void {
    // debugger
    const encryptedId = localStorage.getItem('encryptedId') || '';
    if (encryptedId) {
      this.router.navigate(['/dashboard', encryptedId]);
    } else {
      this.router.navigate(['/dashboard']);
    }
  }
}
