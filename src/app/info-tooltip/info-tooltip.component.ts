import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-info-tooltip',
  templateUrl: './info-tooltip.component.html',
  styleUrls: ['./info-tooltip.component.scss']
})
export class InfoTooltipComponent {
  @Input() type: string = '';
  showTooltip: boolean = false;

  toggleTooltip() {
    this.showTooltip = !this.showTooltip;
  }
}
