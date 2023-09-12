import { Component, EventEmitter, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-bulk-table',
  templateUrl: './bulk-table.component.html',
  styleUrls: ['./bulk-table.component.scss']
})
export class BulkTableComponent implements OnInit {
  @Output() productsBulkEmit = new EventEmitter<any[]>();
  inputProducts: any[] = [
    {
      title: '',
      infos: '',
      asin: '',
      keyword: '',
    }
  ];


  constructor() { }
  ngOnInit(): void {
  }

  addToInfoProducts() {
    this.inputProducts.push({
      title: '',
      infos: '',
      asin: '',
      keyword: '',
    });
}

  removeToInfoProducts(index: number) {
    this.inputProducts.splice(index, 1);
  }

shouldDisableButton(): boolean {
  if (this.inputProducts.length === 1) {
    const product = this.inputProducts[0];
    return !product.title && !product.infos && !product.asin && !product.keyword;
  }
  return false;
}
process() {
  const filteredProducts = this.inputProducts.filter(product => {
      return product.title || product.infos || product.asin || product.keyword;
  });
  this.productsBulkEmit.emit(filteredProducts);
}

}
