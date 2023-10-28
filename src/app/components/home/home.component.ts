import { Component, OnInit } from '@angular/core';
import { CARDS } from 'src/app/utils/data/cards';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  cards = CARDS;

  constructor() { }

  ngOnInit() {
  }

}
