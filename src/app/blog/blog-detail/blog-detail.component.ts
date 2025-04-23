import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Router, ActivatedRoute } from '@angular/router';
import { CryptoUtil } from '../../shared/crypto-util';
import { BlogService } from '../blog.service';

@Component({
  selector: 'app-blog-detail',
  templateUrl: './blog-detail.component.html',
  styleUrls: ['./blog-detail.component.scss']
})
export class BlogDetailComponent implements OnInit {
  blog_id:any;
  // blog = {
  //   title: 'The Power of Positive Thinking',
  //   content: '',
  //   coverImage: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1920&q=80',
  //   author: {
  //     name: 'John Doe',
  //     avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=200&q=80'
  //   },
  //   createdAt: new Date(),
  //   readingTime: 7,
  //   tags: ['Self-Improvement', 'Mindset', 'Personal Growth', 'Motivation']
  // };

  relatedPosts = [
    {
      title: 'Mindfulness in Daily Life',
      description: 'Learn how to incorporate mindfulness into your daily routine and improve your overall well-being.',
      coverImage: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&q=80',
      slug: 'mindfulness-in-daily-life'
    },
    {
      title: 'The Art of Letting Go',
      description: 'Discover the power of releasing what no longer serves you and embracing new opportunities.',
      coverImage: 'https://images.unsplash.com/photo-1497034825429-c343d7c6a43e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&q=80',
      slug: 'the-art-of-letting-go'
    }
  ];

  comments = [
    {
      id: 'comment1',
      content: 'Great article! I\'ve been trying to implement positive thinking in my life and it\'s making a big difference.',
      author: {
        name: 'Sarah Smith',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=80&q=80'
      },
      createdAt: new Date()
    },
    {
      id: 'comment2',
      content: 'The section about challenging negative thoughts was particularly helpful. I\'ll definitely try implementing those strategies.',
      author: {
        name: 'Michael Johnson',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=80&q=80'
      },
      createdAt: new Date()
    }
  ];

  commentForm: FormGroup;
  replyForm: FormGroup;
  replyingTo: string | null = null;
  blog:any={};

  constructor(
    private fb: FormBuilder,
    private sanitizer: DomSanitizer,
    private router: Router,
    private blogService: BlogService,
    private route: ActivatedRoute
  ) {
    this.commentForm = this.fb.group({
      content: ['', [Validators.required, Validators.minLength(10)]]
    });

    this.replyForm = this.fb.group({
      content: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  ngOnInit(): void {
    // debugger
    const url = this.router.url;
    const queryString = url.split('?')[1];
    if (queryString) {
      try {
        const encryptedData = decodeURIComponent(queryString);
        if (encryptedData) {
          const decryptedObj = CryptoUtil.decryptUrlParams(encryptedData);
          if (decryptedObj && decryptedObj.blog_id) {
            this.blog_id = decryptedObj.blog_id;
            // console.log(this.blog_id);
            this.getDetails();
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

// Optional: Example method to generate an encrypted URL param for navigation
createEncryptedQuery(params: object): string {
  return CryptoUtil.encryptUrlParams(params);
}

getDetails()
{
  this.blogService.getBlogDetails(this.blog_id).subscribe({
    next: (res:any) => {
      this.blog = res[0];
      // console.log(this.blog)
    },
    error: (error) => {
      console.error('Error fetching blog details:', error);
    }
  });
}
goBack()
{
  const encryptedId = localStorage.getItem('encryptedId') || '';
    if (encryptedId) {
      this.router.navigate(['/dashboard', encryptedId]);
    } else {
      this.router.navigate(['/dashboard']);
    }
}







 
}
