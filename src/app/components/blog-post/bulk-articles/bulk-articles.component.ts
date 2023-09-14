import { ChangeDetectorRef, Component, HostListener } from '@angular/core';
import { DbService } from 'src/app/services/db.service';
import { NotificationService } from 'src/app/services/notifications/notifications.service';
import { OpenAIService } from 'src/app/services/open-ai.service';
import { WpService } from 'src/app/services/wp.service';
import { FunctionsService } from 'src/app/utils/functions/blog-post/functions.service';
import { SeoAnalyzerService } from 'src/app/utils/seoAnalyzer/seoanalyzer.service';
import Swal from 'sweetalert2';
import * as XLSX from 'xlsx';


@Component({
  selector: 'app-bulk-articles',
  templateUrl: './bulk-articles.component.html',
  styleUrls: ['./bulk-articles.component.scss']
})
export class BulkArticlesComponent {
  titleResponse: string = '';
  introductionResponse: string = '';
  sectionsResponse: string = '';
  contentResponse: string = '';
  completeArticleResponse: string = '';
  topicTitle = '';
  topicInfos = ``;
  topicKeyword = '';
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
  qtyParagraphs = 0;

  modelTitle = '';
  maxTokensTitle = 0;
  modelIntroduction = '';
  maxTokensIntroduction = 0;
  modelSections = '';
  maxTokensSections = 0;
  modelContent = '';
  maxTokensContent = 0;

  models: any[] = [];
  languages: any[] = [];
  styles: any[] = [];
  tones: any[] = [];
  prompt: any[] = [];


  constructor(private openAIService: OpenAIService,
    private wpService: WpService,
    private cdr: ChangeDetectorRef,
    private notificationService: NotificationService,
    private functionService: FunctionsService,
    private seoAnalyzerService: SeoAnalyzerService,
    private dbService: DbService) {
      this.getModels();
      this.getLanguages();
      this.getStyles();
      this.getTones();
      this.getPromptSection();
      this.getShortcodes();
     }
  ngOnInit(): void {
    this.loadDefaultData()
  }

  @HostListener('window:beforeunload', ['$event'])
  unloadNotification($event: any): void {
    $event.returnValue = '';
  }
  //**** DB CONNECTION *****/
  getModels() {
    this.dbService.get('/models').subscribe((response) => {
      this.models = response;
    }, (error) => {
      console.log(error);
    });
  }

  getLanguages() {
    return this.dbService.get('/languages').subscribe((response) => {
      this.languages = response;
    }, (error) => {
      console.log(error);
    });
  }

  getStyles() {
    return this.dbService.get('/styles').subscribe((response) => {
      this.styles = response;
    }, (error) => {
      console.log(error);
    });
  }

  getTones() {
    return this.dbService.get('/tones').subscribe((response) => {
      this.tones = response;
    }, (error) => {
      console.log(error);
    });
  }

  getPromptSection() {
    this.dbService.get('/prompt_section_bulk_blog_post').subscribe((response) => {
      this.prompt = response;
      this.loadDefaultData()

    }, (error) => {
      console.log(error);
    });
  }

  getShortcodes() {
    this.dbService.get('/shortcodes').subscribe((response) => {
      this.shortcodes = response.filter((item: any) => item.section === 'bulk_blog_post');
    }, (error) => {
      console.log(error);
    });
  }
  //**** ###END### DB CONNECTION *****/
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
  sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }


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
      this.titleResponse, this.contentResponse, this.introductionResponse, this.topicKeyword, this.shortcodes
    )
      .replace(/\[KEYWORD\]/g, this.topicKeyword);

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
  setDefaultModelValue(currentStepValue: number) {
    switch (currentStepValue) {
      case 1:
        this.modelTitle = this.prompt.filter((item: any) => item.name === 'title')[0].model;
        break;
      case 2:
        this.modelIntroduction = this.prompt.filter((item: any) => item.name === 'introduction')[0].model;
        break;
      case 3:
        this.modelSections = this.prompt.filter((item: any) => item.name === 'sections')[0].model;
        break;
      case 4:
        this.modelContent = this.prompt.filter((item: any) => item.name === 'content')[0].model;
        break;
    }
  }
  setDefaultMaxTokensValue(currentStepValue: number) {
    switch (currentStepValue) {
      case 1:
        this.maxTokensTitle = this.prompt.filter((item: any) => item.name === 'title')[0].max_tokens;
        break;
      case 2:
        this.maxTokensIntroduction = this.prompt.filter((item: any) => item.name === 'introduction')[0].max_tokens;
        break;
      case 3:
        this.maxTokensSections = this.prompt.filter((item: any) => item.name === 'sections')[0].max_tokens;
        break;
      case 4:
        this.maxTokensContent = this.prompt.filter((item: any) => item.name === 'content')[0].max_tokens;
        break;
    }
  }
  setDefaultQtyParagraphs() {
    this.qtyParagraphs = this.prompt.filter((item: any) => item.name === 'sections')[0].qtyParagraph;
  }

  //*** PROCESS ALL BY XLXS  ******//
  showOverlay = false;
  currentArticleNumber: string = '';
  statusMessage: string = '';
  formatExcelNotValid: boolean = false;
  formatExcelNotValidMessage: string = ''
  fileName: string = '';

  stopProcess() {
    if (confirm('Sei sicuro di voler fermare il processo e tornare indietro?')) {
      this.openAIService.abortRequests();
    }
  }

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
      Keyword: row[headers.indexOf('Keyword')],
    }));

    this.processExcel(products);
  }
  async processExcel(products: any[]) {
    try {
      let validProducts = products.filter(item => item.Title !== undefined && item.Infos !== undefined && item.Keyword);
      if (!Array.isArray(validProducts) || validProducts.some(item => !this.isValidExcelProduct(item))) {
        this.formatExcelNotValid = true;
        this.formatExcelNotValidMessage = 'Excel format not valid';
        throw new Error('Excel format not valid');
      }

      const totalProducts = validProducts.length;
      this.showOverlay = true;

      for (const [index, item] of validProducts.entries()) {
        if (this.hasError) {
          throw new Error('Error while processing product');
        }
        this.currentArticleNumber = `Article ${index + 1}/${totalProducts}`;
        // Assigning the properties to your class or object's instance variables
        this.topicTitle = item.Title;
        this.topicInfos = item.Infos;
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
        await this.sleep(5000); // Aspetta 5 secondi prima di passare al prossimo articolo
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
      typeof item.Keyword === 'string';
  }

  //*** PROCESS ALL BY DATA INSERT BY USER  ******//
  async getProductsEmitted(products: any[]) {
    try {
      const totalProducts = products.length;
      this.showOverlay = true;

      for (const [index, item] of products.entries()) {
        if (this.hasError) {
          throw new Error('Error while processing product');
        }
        this.currentArticleNumber = `Article ${index + 1}/${totalProducts}`;
        // Assigning the properties to your class or object's instance variables
        this.topicTitle = item.title; //
        this.topicInfos = item.infos;
        this.topicKeyword = item.keyword;

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
        await this.sleep(5000); // Aspetta 5 secondi prima di passare al prossimo articolo
      }
    } catch (e: any) {
      this.showOverlay = false;
      console.error(e);
      this.formatExcelNotValidMessage = e;
      this.notificationService.showNotification("An error occured during article generation. Please try again.");
    }
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

    this.modelTitle = this.prompt.filter((item: any) => item.name === 'title')[0].model;
    this.maxTokensTitle = this.prompt.filter((item: any) => item.name === 'title')[0].max_tokens;
    this.modelIntroduction = this.prompt.filter((item: any) => item.name === 'introduction')[0].model;
    this.maxTokensIntroduction = this.prompt.filter((item: any) => item.name === 'introduction')[0].max_tokens;
    this.modelSections = this.prompt.filter((item: any) => item.name === 'sections')[0].model;
    this.maxTokensSections = this.prompt.filter((item: any) => item.name === 'sections')[0].max_tokens;
    this.modelContent = this.prompt.filter((item: any) => item.name === 'content')[0].model;
    this.maxTokensContent = this.prompt.filter((item: any) => item.name === 'content')[0].max_tokens;

    this.qtyParagraphs = this.prompt.filter((item: any) => item.name === 'sections')[0].qtyParagraph;

    this.selectedLanguage = this.prompt.filter((item: any) => item.name === 'title')[0].language;
    this.selectedStyle = this.prompt.filter((item: any) => item.name === 'title')[0].style;
    this.selectedTone = this.prompt.filter((item: any) => item.name === 'title')[0].tone;
  }

  addValueDefaultTitle(): string {
    let value = this.prompt.filter((item: any) => item.name === 'title')[0].default_prompt;
    return this.titlePrompt = value;
  }

  addDefaulIntroduction() {
    let value = this.prompt.filter((item: any) => item.name === 'introduction')[0].default_prompt;
    return this.introductionPrompt = value;
  }

  addDefaultSections() {
    let value = this.prompt.filter((item: any) => item.name === 'sections')[0].default_prompt;
    return this.sectionsPrompt = value;
  }
  addDefaultContent() {
    let value = this.prompt.filter((item: any) => item.name === 'content')[0].default_prompt;
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

  saveSettings() {
    const prompt_settings = [
      {
        model: this.modelTitle,
        max_tokens: this.maxTokensTitle,
        default_prompt: this.titlePrompt,
        qtyParagraph: null,
        language: this.selectedLanguage,
        style: this.selectedStyle,
        tone: this.selectedTone,
        name: 'title'
      },
      {
        model: this.modelIntroduction,
        max_tokens: this.maxTokensIntroduction,
        default_prompt: this.introductionPrompt,
        qtyParagraph: null,
        language: this.selectedLanguage,
        style: this.selectedStyle,
        tone: this.selectedTone,
        name: 'introduction'
      },
      {
        model: this.modelSections,
        max_tokens: this.maxTokensSections,
        default_prompt: this.sectionsPrompt,
        qtyParagraph: this.qtyParagraphs,
        language: this.selectedLanguage,
        style: this.selectedStyle,
        tone: this.selectedTone,
        name: 'sections'
      },
      {
        model: this.modelContent,
        max_tokens: this.maxTokensContent,
        default_prompt: this.contentPrompt,
        qtyParagraph: null,
        language: this.selectedLanguage,
        style: this.selectedStyle,
        tone: this.selectedTone,
        name: 'content'
      }
    ]
    this.dbService.put('/prompt_section_bulk_blog_post', prompt_settings).subscribe((response) => {
      console.log(response);
      this.getPromptSection();
    }, (error) => {
      console.log(error);
    });

  }
  //*************SHORTCODE HANDLE *******************//
  shortcodes: { id: number, code: string, position: string, section: string }[] = [
    {
      id: 0,
      code: "",
      position: "",
      section: "bulk_blog_post"
    }
  ];
  addShortcode() {
    this.saveShortcode();
    const newShortcode = { code: '', position: '', section: 'bulk_blog_post' };
    this.dbService.post('/shortcodes', newShortcode).subscribe(response => {
      this.getShortcodes();
    });
  }


  removeShortcode(id: number) {
    if (confirm('Are you sure to delete this shortcode?')) {
      this.saveShortcode();
      this.dbService.delete('/shortcodes', id).subscribe(response => {
        this.getShortcodes();
      });
    }
  }

  saveShortcode() {
    this.dbService.put('/shortcodes', this.shortcodes).subscribe();
  }


}
