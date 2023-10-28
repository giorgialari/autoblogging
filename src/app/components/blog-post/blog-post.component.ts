import { Component } from '@angular/core';
import { CARDS } from 'src/app/utils/data/cards';

@Component({
  selector: 'app-blog-post',
  templateUrl: './blog-post.component.html',
  styleUrls: ['./blog-post.component.scss']
})
export class BlogPostComponent {
  cards = CARDS.filter(card => card.header === 'Blog Post');


}
