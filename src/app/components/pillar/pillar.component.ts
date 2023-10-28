import { Component } from '@angular/core';
import { CARDS } from 'src/app/utils/data/cards';

@Component({
  selector: 'app-pillar',
  templateUrl: './pillar.component.html',
  styleUrls: ['./pillar.component.scss']
})
export class PillarComponent {
  cards = CARDS.filter(card => card.header === 'Pillar');

}
