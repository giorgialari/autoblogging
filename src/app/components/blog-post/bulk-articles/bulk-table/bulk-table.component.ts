import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-bulk-table-article',
  templateUrl: './bulk-table.component.html',
  styleUrls: ['./bulk-table.component.scss']
})
export class BulkTableArticlesComponent {
  @Output() productsBulkEmit = new EventEmitter<any[]>();
  inputProducts: any[] = [
    {
      title: '',
      infos: '',
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
      keyword: '',
    });
  }

  removeToInfoProducts(index: number) {
    this.inputProducts.splice(index, 1);
  }

  shouldDisableButton(): boolean {
    if (this.inputProducts.length === 1) {
      const product = this.inputProducts[0];
      return !product.title && !product.infos && !product.keyword;
    }
    return false;
  }
  process() {
    const filteredProducts = this.inputProducts.filter(product => {
      return product.title || product.infos || product.keyword;
    });
    this.productsBulkEmit.emit(filteredProducts);
  }
}
