import { SeoAnalyzerService } from './../../../utils/seoAnalyzer/seoanalyzer.service';
import { FunctionsService } from './../../../utils/functions/functions.service';
import { WpService } from '../../../services/wp.service';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { OpenAIService } from 'src/app/services/open-ai.service';
import { NotificationService } from 'src/app/services/notifications/notifications.service';
import * as XLSX from 'xlsx';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-bulk-single-product',
  templateUrl: './bulk-single-product.component.html',
  styleUrls: ['./bulk-single-product.component.scss']
})
export class BulkSingleProductComponent implements OnInit {
  titleResponse: string = '';
  introductionResponse: string = '';
  sectionsResponse: string = '';
  contentResponse: string = '';
  completeArticleResponse: string = '';
  topicTitle = '';
  topicInfos = ``;
  topicKeyword = '';
  topicASIN = '';
  writing_tone = 'informale';
  writing_style = 'blog post';
  language = 'Italiano';
  isGettingTitle = false;
  isGettingIntroduction = false;
  isGettingSections = false;
  isGettingContent = false;
  isGettingTopicTitle = false;
  isGettingTopicInfo = false;
  isGettingCompleteArticle = false;
  isLinear = false;
  hasError = false;

  ngOnInit(): void { }
  constructor(private openAIService: OpenAIService,
    private wpService: WpService,
    private cdr: ChangeDetectorRef,
    private notificationService: NotificationService, private functionService: FunctionsService, private seoAnalyzerService: SeoAnalyzerService) { }
  showSuccess(success: string) {
    Swal.fire({
      icon: 'success',
      title: 'Good news!',
      text: success
    });
  }
  showError(error: string) {
    Swal.fire({
      icon: 'warning',
      title: 'Error',
      text: error
    });
  }

  async improveTopicTitle() {
    this.isGettingTopicTitle = true;
    try {
      const response = await this.functionService.getImprovedTopic(
        this.topicTitle, this.language, this.writing_style, this.writing_tone, this.modelTitle, this.maxTokensTitle
      ).toPromise();
      this.isGettingTopicTitle = false;
      this.topicTitle = response.message;
    } catch (error: any) {
      this.isGettingTopicTitle = false;
      this.showError(error.error.message)
      console.error('There was an error getting the topic title:', error);
    }
  }
  async improveTopicInfo() {
    this.isGettingTopicInfo = true;
    try {
      const response = await this.functionService.getImprovedInfo(
        this.topicInfos, this.language, this.writing_style, this.writing_tone, this.modelTitle, this.maxTokensTitle
      ).toPromise();
      this.isGettingTopicInfo = false;
      this.topicInfos = response.message;
    } catch (error: any) {
      this.isGettingTopicInfo = false;
      this.showError(error.error.message);
      console.error('There was an error getting the topic information:', error);
    }
  }
  async getTitle() {
    this.isGettingTitle = true;
    try {
      const response = await this.functionService.getTitle(
        this.topicTitle, this.language, this.writing_style, this.writing_tone, this.modelTitle, this.maxTokensTitle
      ).toPromise();
      this.isGettingTitle = false;
      this.titleResponse = response.message;
      this.analyzeSeoTitle(this.titleResponse);
    } catch (error: any) {
      this.isGettingTitle = false;
      console.error('There was an error getting the title:', error);
      this.showError(error.error.message);
      this.hasError = true;
      throw new Error('Failed to get title');
    }
  }
  async getAndOptimizeIntroduction() {
    this.isGettingIntroduction = true;

    try {
      this.introductionResponse = await this.functionService.getOptimizedIntroduction(
        this.topicTitle,
        this.topicInfos,
        this.language,
        this.writing_style,
        this.writing_tone,
        this.modelIntroduction,
        this.maxTokensIntroduction,
        this.topicKeyword
      );
    } catch (error: any) {
      console.error("Used introduction with a less-than-satisfactory SEO score after retries.");
      this.showError(error.message);
    } finally {
      this.isGettingIntroduction = false;
    }
  }
  async getSections() {
    this.isGettingSections = true;
    const keywordInsertionRate = 0.5; // 50% degli h2 conterrà la parola chiave

    try {
      const response = await this.functionService.getSections(
        this.topicTitle, this.topicInfos, this.language, this.writing_style, this.writing_tone, this.modelSections, this.maxTokensSections
      ).toPromise();

      this.isGettingSections = false;

      let sections = response.message.split('</h2>');
      sections = sections.slice(0, -1);
      const keywordSectionsCount = Math.floor((sections.length - 4) * keywordInsertionRate);

      const interval = Math.floor((sections.length - 4) / keywordSectionsCount);
      for (let i = 0; i < keywordSectionsCount; i++) {
        const index = 3 + i * interval;
        sections[index] = sections[index].replace('<h2>', `<h2>${this.topicKeyword}: `);
      }

      this.analyzeSeoSections(sections);
      this.sectionsResponse = sections.join('</h2>') + '</h2>';
    } catch (error: any) {
      this.isGettingSections = false;
      console.error('There was an error getting the sections:', error);
      this.showError(error.error.message);
      this.hasError = true;
    }

  }
  async getContent() {
    this.isGettingContent = true;
    try {
      const response = await this.functionService.getContent(
        this.titleResponse, this.language, this.sectionsResponse, this.topicInfos, this.writing_style, this.writing_tone, this.modelContent, this.maxTokensContent
      ).toPromise();
      this.isGettingContent = false;
      this.contentResponse = response.message;
      this.analyzeSeoContent(this.contentResponse);
      this.getCompleteArticle();
    } catch (error) {
      this.isGettingContent = false;
      console.error('There was an error getting the content:', error);
      alert('Errore: Qualcosa è andato storto. Verifica di aver inserito l\'apiKey nelle impostazioni.');
      this.hasError = true;
      throw new Error('Failed to get title');
    }
  }
  async getCompleteArticle() {
    this.isGettingCompleteArticle = true;
    this.statusMessage = ' Sto componendo l\'articolo';

    this.completeArticleResponse = this.functionService.getCompleteArticle(
      this.titleResponse, this.contentResponse, this.introductionResponse, this.topicASIN, this.topicKeyword
    );

    this.isGettingCompleteArticle = false;
    this.countWords();
    this.calculateTotalSeoScore();
    this.cdr.detectChanges();
    this.publishArticleOnWP();
  }
  async publishArticleOnWP() {
    try {
      this.statusMessage = await this.functionService.publishArticleOnWP(this.isGettingCompleteArticle, this.completeArticleResponse, this.titleResponse, this.wpService);
    } catch (error) {
      this.statusMessage = 'Errore nella pubblicazione dell\'articolo!';
      console.error(error);
    }
  }


  //*************WORD COUNT *******************//
  wordsCount: number = 0
  countWords() {
    if (this.completeArticleResponse) {
      this.wordsCount = this.completeArticleResponse.split(/\s+/).length;
    } else {
      this.wordsCount = 0;
    }
  }
  //*************SEO IMPROVMENT *******************//
  maxTitleScore = 30;
  maxIntroductionScore = 30;
  maxSectionsScore = 20;
  maxContentScore = 20;
  seoTitleScore: number = 0;
  seoIntroductionScore: number = 0;
  seoSectionsScore: number = 0;
  seoContentScore: number = 0;
  totalSeoScore: number = 0;

  analyzeSeoTitle(text: string): number {
    this.seoTitleScore = this.seoAnalyzerService.analyzeSeoTitle(text, this.topicKeyword);
    return this.seoTitleScore;
  }


  analyzeSeoIntroduction(text: string): number {
    this.seoIntroductionScore = this.seoAnalyzerService.analyzeSeoIntroduction(text, this.topicKeyword)
    return this.seoIntroductionScore
  }

  analyzeSeoSections(titles: string[]): number {
    this.seoSectionsScore = this.seoAnalyzerService.analyzeSeoSections(titles, this.topicKeyword)
    return this.seoSectionsScore;
  }

  analyzeSeoContent(text: string): number {
    this.seoContentScore = this.seoAnalyzerService.analyzeSeoContent(text,this.sectionsResponse,  this.titleResponse)
    return this.seoContentScore;
  }

  calculateTotalSeoScore(): number {
    this.totalSeoScore = this.seoAnalyzerService.calculateTotalSeoScore(
      this.maxTitleScore,
      this.maxIntroductionScore,
      this.maxSectionsScore,
      this.maxContentScore,
      this.seoTitleScore,
      this.seoIntroductionScore,
      this.seoSectionsScore,
      this.seoContentScore
    );

    return this.totalSeoScore;
  }
  //*************SETTINGS FOR EVERY ARTICLES *******************//
  modelTitle = 'gpt-3.5-turbo';
  maxTokensTitle = 2048;
  modelIntroduction = 'gpt-3.5-turbo';
  maxTokensIntroduction = 2048;
  modelSections = 'gpt-3.5-turbo';
  maxTokensSections = 2048;
  modelContent = 'gpt-4';
  maxTokensContent = 2048;

  setDefaultModelValue(currentStepValue: number) {
    switch (currentStepValue) {
      case 1:
        this.modelTitle = 'gpt-3.5-turbo';
        break;
      case 2:
        this.modelIntroduction = 'gpt-3.5-turbo';
        break;
      case 3:
        this.modelSections = 'gpt-3.5-turbo';
        break;
      case 4:
        this.modelContent = 'gpt-4';
        break;
    }
  }
  setDefaultMaxTokensValue(currentStepValue: number) {
    switch (currentStepValue) {
      case 1:
        this.maxTokensTitle = 2048;
        break;
      case 2:
        this.maxTokensIntroduction = 2048;
        break;
      case 3:
        this.maxTokensSections = 2048;
        break;
      case 4:
        this.maxTokensContent = 2048;
        break;
    }
  }

  //*** PROCESS ALL   ******//
  showOverlay = false;
  stopProcessing = false;
  listProducts: any;
  currentArticleNumber: string = '';
  statusMessage: string = '';
  formatJsonNotValid: boolean = false;
  formatJsonNotValidMessage: string = ''

  async processAll() {
    try {
      const products = JSON.parse(this.listProducts);

      if (!Array.isArray(products) || products.some(item => !this.isValidProduct(item))) {
        this.formatJsonNotValid = true;
        this.formatJsonNotValidMessage = 'JSON format not valid';
        throw new Error('JSON format not valid');
      }

      const totalProducts = products.length;
      this.showOverlay = true;

      for (const [index, item] of products.entries()) {
        if (this.hasError) {
          throw new Error('Error while processing product');
        }
        this.currentArticleNumber = `Articolo ${index + 1}/${totalProducts}`;
        // Assigning the properties to your class or object's instance variables
        this.topicTitle = item.product_title;
        this.topicInfos = item.product_infos.map((info: { product_infos: any; }) => info.product_infos).join(' ');
        this.topicASIN = item.product_asin.replace(/\u200E/g, "");
        this.topicKeyword = item.product_keyword;

        // Call the functions in the required order
        // await this.improveTopicTitle();
        // await this.improveTopicInfo();
        this.statusMessage = ' I\'m creating the title';
        await this.getTitle();
        this.statusMessage = ' I\'m creating the introduction';
        await this.getAndOptimizeIntroduction();
        this.statusMessage = ' I\'m creating the sections';
        await this.getSections();
        this.statusMessage = ' I\'m creating the content';
        await this.getContent();

        if (index === totalProducts - 1) {
          this.statusMessage = ' All articles have been published successfully!';
          this.showOverlay = false; // Nasconde l'overlay e lo spinner
          this.notificationService.showNotification(`${totalProducts} articles have been published successfully!`);
        }
      }
    } catch (e: any) {
      this.formatJsonNotValid = true;
      this.showOverlay = false;
      this.formatJsonNotValidMessage = e.message;
      this.notificationService.showNotification("An error occured during article generation. Please try again.");
    }
  }

  isValidProduct(product: any): boolean {
    // Verifica che tutti i campi richiesti siano presenti e abbiano il formato corretto
    return typeof product.product_title === 'string' &&
      Array.isArray(product.product_infos) &&
      product.product_infos.every((info: { product_infos: any; }) => typeof info.product_infos === 'string') &&
      typeof product.product_asin === 'string' &&
      typeof product.product_keyword === 'string';
  }

  stopProcess() {
    if (confirm('Sei sicuro di voler fermare il processo e tornare indietro?')) {
      window.location.reload();
    }
  }

  //*** PROCESS ALL BY XLXS  ******//
  formatExcelNotValid: boolean = false;
  formatExcelNotValidMessage: string = ''
  fileName: string = '';

  onFileChange(evt: any) {
    const file = evt.target.files[0];
    if (file) {
      this.fileName = file.name;
    }
    if (confirm('Sei sicuro di voler caricare questo file?')) {
      /* wire up file reader */
      const target: DataTransfer = <DataTransfer>(evt.target);
      if (target.files.length !== 1) throw new Error('Cannot use multiple files');

      const reader: FileReader = new FileReader();

      reader.onload = (e: any) => {
        /* read workbook */
        const bstr: string = e.target.result;
        const wb: XLSX.WorkBook = XLSX.read(bstr, { type: 'binary' });

        /* grab first sheet */
        const wsname: string = wb.SheetNames[0];
        const ws: XLSX.WorkSheet = wb.Sheets[wsname];

        /* save data */
        const data = XLSX.utils.sheet_to_json(ws, { header: 1 });
        this.processExcelData(data);

      };

      reader.readAsBinaryString(target.files[0]);
    }
  }

  processExcelData(data: any[]) {
    const headers = data[0]; // Assuming first row is header
    const products = data.slice(1).map(row => ({
      Title: row[headers.indexOf('Title')],
      Infos: row[headers.indexOf('Infos')],
      ASIN: row[headers.indexOf('ASIN')],
      Keyword: row[headers.indexOf('Keyword')],
    }));

    this.processExcel(products);
  }
  async processExcel(products: any[]) {
    try {
      if (!Array.isArray(products) || products.some(item => !this.isValidExcelProduct(item))) {
        this.formatExcelNotValid = true;
        this.formatExcelNotValidMessage = 'Excel format not valid';
        throw new Error('Excel format not valid');
      }

      const totalProducts = products.length;
      this.showOverlay = true;

      for (const [index, item] of products.entries()) {
        if (this.hasError) {
          throw new Error('Error while processing product');
        }
        this.currentArticleNumber = `Articolo ${index + 1}/${totalProducts}`;
        // Assigning the properties to your class or object's instance variables
        this.topicTitle = item.Title; // Make sure the Excel file has these headers
        this.topicInfos = item.Infos;
        this.topicASIN = item.ASIN.replace(/\u200E/g, "");
        this.topicKeyword = item.Keyword;

        // Call the functions in the required order
        this.statusMessage = ' I\'m creating the title';
        await this.getTitle();
        this.statusMessage = ' I\'m creating the introduction';
        await this.getAndOptimizeIntroduction();
        this.statusMessage = ' I\'m creating the sections';
        await this.getSections();
        this.statusMessage = ' I\'m creating the content';
        await this.getContent();

        if (index === totalProducts - 1) {
          this.statusMessage = ' All articles have been published successfully!';
          this.showOverlay = false; // Nasconde l'overlay e lo spinner
          this.notificationService.showNotification(`${totalProducts} articles have been published successfully!`);
        }
      }
    } catch (e: any) {
      this.formatExcelNotValid = true;
      this.showOverlay = false;
      console.error(e.message);
      this.formatExcelNotValidMessage = e.message;
      this.notificationService.showNotification("An error occured during article generation. Please try again.");
    }
  }
  isValidExcelProduct(item: any): boolean {
    return item &&
      typeof item.Title === 'string' &&
      typeof item.Infos === 'string' &&
      typeof item.ASIN === 'string' &&
      typeof item.Keyword === 'string';
  }
}

