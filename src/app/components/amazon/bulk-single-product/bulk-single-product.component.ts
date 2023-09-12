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
  qtyParagraphs = 10;


  constructor(private openAIService: OpenAIService,
    private wpService: WpService,
    private cdr: ChangeDetectorRef,
    private notificationService: NotificationService,
    private functionService: FunctionsService,
    private seoAnalyzerService: SeoAnalyzerService) { }
  ngOnInit(): void {
    this.loadDefaultData()
  }
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

  // async improveTopicTitle() {
  //   this.isGettingTopicTitle = true;
  //   try {
  //     const response = await this.functionService.getImprovedTopic(
  //       '', this.modelTitle, this.maxTokensTitle
  //     ).toPromise();
  //     this.isGettingTopicTitle = false;
  //     this.topicTitle = response.message;
  //   } catch (error: any) {
  //     this.isGettingTopicTitle = false;
  //     this.showError(error.error.message)
  //     console.error('There was an error getting the topic title:', error);
  //   }
  // }
  // async improveTopicInfo() {
  //   this.isGettingTopicInfo = true;
  //   try {
  //     const response = await this.functionService.getImprovedInfo(
  //       '', this.modelTitle, this.maxTokensTitle
  //     ).toPromise();
  //     this.isGettingTopicInfo = false;
  //     this.topicInfos = response.message;
  //   } catch (error: any) {
  //     this.isGettingTopicInfo = false;
  //     this.showError(error.error.message);
  //     console.error('There was an error getting the topic information:', error);
  //   }
  // }
  async getTitle() {
    this.isGettingTitle = true;
    let finalPrompt = this.titlePrompt
      .replace('[TOPIC]', this.topicTitle)
      .replace('[LANGUAGE]', this.selectedLanguage)
      .replace('[STYLE]', this.selectedStyle)
      .replace('[TONE]', this.selectedTone);
    try {
      const response = await this.functionService.getTitle(
        finalPrompt, this.modelTitle, this.maxTokensTitle
      ).toPromise();
      this.isGettingTitle = false;
      this.titleResponse = response.message;
      this.analyzeSeoTitle(this.titleResponse);
    } catch (error: any) {
      this.isGettingTitle = false;
      this.showError(error.error.message);
      this.hasError = true;
      throw new Error('Failed to get title');
    }
  }
  async getAndOptimizeIntroduction() {
    this.isGettingIntroduction = true;
    let finalPrompt = this.introductionPrompt
      .replace('[TOPIC]', this.titleResponse)
      .replace('[LANGUAGE]', this.selectedLanguage)
      .replace('[STYLE]', this.selectedStyle)
      .replace('[TONE]', this.selectedTone);
    try {
      this.introductionResponse = await this.functionService.getOptimizedIntroduction(
        finalPrompt,
        this.modelIntroduction,
        this.maxTokensIntroduction,
        this.topicKeyword
      );
    } catch (error: any) {
      this.showError(error.message);
      throw new Error('Failed to get introduction');

    } finally {
      this.isGettingIntroduction = false;
    }
  }
  async getSections() {
    this.isGettingSections = true;
    let finalPrompt = this.sectionsPrompt
      .replace('[QUANTITY]', this.qtyParagraphs.toString())
      .replace('[TOPIC]', this.titleResponse)
      .replace('[LANGUAGE]', this.selectedLanguage)
      .replace('[STYLE]', this.selectedStyle)
      .replace('[TONE]', this.selectedTone);
    const keywordInsertionRate = 0.5; // 50% degli h2 conterrà la parola chiave
    try {
      const response = await this.functionService.getSections(
        finalPrompt, this.modelSections, this.maxTokensSections
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
      this.showError(error.error.message);
      this.hasError = true;
      throw new Error('Failed to get sections');
    }

  }
  async getContent() {
    this.isGettingContent = true;
    const sections = this.sectionsResponse.split('\n').map(section => section.replace('<h2>', '').replace('</h2>', ''));
    const sectionsString = sections.join(', \n ');
    let finalPrompt = this.contentPrompt
      .replace('[TOPIC]', this.titleResponse)
      .replace('[LANGUAGE]', this.selectedLanguage)
      .replace('[SECTIONS]', sectionsString)
      .replace('[TOPIC_INFOS]', this.topicInfos)
      .replace('PARPERSECTIONS', '3')
      .replace('[STYLE]', this.selectedStyle)
      .replace('[TONE]', this.selectedTone);
    try {
      const response = await this.functionService.getContent(
        finalPrompt, this.modelContent, this.maxTokensContent
      ).toPromise();
      this.isGettingContent = false;
      this.contentResponse = response.message;
      this.analyzeSeoContent(this.contentResponse);
      this.getCompleteArticle();
    } catch (error) {
      this.isGettingContent = false;
      this.showError('There was an error getting the content: ' + error);
      this.hasError = true;
      throw new Error('Failed to get content');
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
    this.seoContentScore = this.seoAnalyzerService.analyzeSeoContent(text, this.sectionsResponse, this.titleResponse)
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
  setDefaultQtyParagraphs() {
    this.qtyParagraphs = 10;
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
      this.openAIService.abortRequests();
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
      console.error(e);
      this.formatExcelNotValidMessage = e;
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


  //****** PROMPT SECTIONS ******/
  improveTitlePrompt: string = '';
  improveInfoPrompt: string = '';
  titlePrompt: string = '';
  introductionPrompt: string = '';
  sectionsPrompt: string = '';
  contentPrompt: string = '';
  selectedLanguage: string = 'italiano';
  selectedStyle: string = 'blog post';
  selectedTone: string = 'informal';
  loadDefaultData() {
    this.addValueDefaultTitle();
    this.addDefaulIntroduction();
    this.addDefaultSections();
    this.addDefaultContent();
    this.addDefaultImproveTitle();
    this.addDefaultImproveInfo();
  }
  addDefaultImproveTitle() {
    let value = this.functionService.getDefaultImproveTitlePrompt()
    return this.improveTitlePrompt = value;
  }
  addDefaultImproveInfo() {
    let value = this.functionService.getDefaultImproveInfoPrompt()
    return this.improveInfoPrompt = value;
  }
  addValueDefaultTitle(): string {
    let value = this.functionService.getDefaultTitlePrompt()
    return this.titlePrompt = value;
  }

  addDefaulIntroduction() {
    let value = this.functionService.getDefaultIntroductionPrompt()
    return this.introductionPrompt = value;
  }

  addDefaultSections() {
    let value = this.functionService.getDefaultSectionsPrompt()
    return this.sectionsPrompt = value;
  }
  addDefaultContent() {
    let value = this.functionService.getDefaultContentPrompt()
    return this.contentPrompt = value;
  }


  getPromptValueTitle() {
    return this.titlePrompt;
  }
  setPromptValueTitle(value: string) {
    return this.titlePrompt = value;
  }
  setDefaultPromptValueTitle() {
    return this.titlePrompt = this.addValueDefaultTitle();
  }

  getPromptValueIntroduction() {
    return this.introductionPrompt;
  }

  setPromptValueIntroduction(value: string) {
    return this.introductionPrompt = value;
  }

  setDefaultPromptValueIntroduction() {
    return this.introductionPrompt = this.addDefaulIntroduction();
  }

  getPromptValueSections() {
    return this.sectionsPrompt;
  }

  setPromptValueSections(value: string) {
    return this.sectionsPrompt = value;
  }

  setDefaultPromptValueSections() {
    return this.sectionsPrompt = this.addDefaultSections();
  }

  getPromptValueContent() {
    return this.contentPrompt;
  }

  setPromptValueContent(value: string) {
    return this.contentPrompt = value;
  }

  setDefaultPromptValueContent() {
    return this.contentPrompt = this.addDefaultContent();
  }
}



