import { Component } from '@angular/core';
import { CARDS } from 'src/app/utils/data/cards';

@Component({
  selector: 'app-amazon',
  templateUrl: './amazon.component.html',
  styleUrls: ['./amazon.component.scss']
})
export class AmazonComponent {
  cards = CARDS.filter(card => card.header === 'Amazon');

}
