import { SeoAnalyzerService } from './../../../utils/seoAnalyzer/seoanalyzer.service';
import { FunctionsService } from './../../../utils/functions/amazon/functions.service';
import { WpService } from '../../../services/wp.service';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { OpenAIService } from 'src/app/services/open-ai.service';
import { Observable, Subject } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';
import { StepperOrientation } from '@angular/material/stepper';
import { BreakpointObserver } from '@angular/cdk/layout';
import Swal from 'sweetalert2';
import { DbService } from 'src/app/services/db.service';


@Component({
  selector: 'app-single-product',
  templateUrl: './single-product.component.html',
  styleUrls: ['./single-product.component.scss']
})
export class SingleProductComponent implements OnInit {
  titleResponse: string = '';
  introductionResponse: string = '';
  sectionsResponse: string = '';
  contentResponse: string = '';
  completeArticleResponse: string = '';
  topicTitle = 'Brigros - Barbecue a gas DALLAS con rotelle potente e pratico, comodo da spostare, sistema di pulizia facile (3 fuochi)';
  topicInfos = `Barbecue gas con 3 bruciatori, tubi di acciaio ad alte prestazioni
  Grigli barbecue 60 x 42 cm con opzioni di cottura infinite
  Barbecue a gas con sistema di pulizia facile e veloce
  bbq a gas dotato di rotelle per un facile trasporto
  bbq gas dimensioni: prodotto (coperchio chiuso) 122 x 57 x 112 cm, peso del prodotto: 26,70 kg, imballo: 60 x 58 x 53 cm
  L'accensione piezoelettrica assicura che l’accensione del BBQ sia semplice e rapida e un termometro integrato nel coperchio facilita la cottura ottima del cibo.`;
  topicKeyword = 'Brigros - Barbecue a gas';
  topicASIN = 'B08Y59NM8V';


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
  stepperOrientation!: Observable<StepperOrientation>;
  titleInfoArray: any[] = []
  qtyParagraphs = 10;
  titlePrompt = ''
  introductionPrompt = ''
  sectionsPrompt = ''
  contentPrompt = ''

  ngOnInit(): void {
    this.getModels();
    this.getLanguages();
    this.getStyles();
    this.getTones();
  }
  constructor(private openAIService: OpenAIService,
    private wpService: WpService,
    private cdr: ChangeDetectorRef,
    breakpointObserver: BreakpointObserver,
    private functionService: FunctionsService,
    private seoAnalyzerService: SeoAnalyzerService,
    private dbService: DbService) {
    this.stepperOrientation = breakpointObserver
      .observe('(min-width: 800px)')
      .pipe(map(({ matches }) => (matches ? 'horizontal' : 'vertical')));

    this.loadDefaultData();
  }

  //**** DB CONNECTION *****/
  models: any[] = [];
  languages: any[] = [];
  styles: any[] = [];
  tones: any[] = []

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
  stopRequest() {
    this.openAIService.abortRequests();
    this.isGettingTopicTitle = false;
    this.isGettingTopicInfo = false;
    this.isGettingTitle = false;
    this.isGettingSections = false;
    this.isGettingIntroduction = false;
    this.isGettingContent = false;
  }
  improveTopicTitle() {
    this.isGettingTopicTitle = true;
    let finalPrompt = this.improveTitlePrompt
      .replace('[TOPIC]', this.topicTitle)
      .replace('[LANGUAGE]', this.selectedLanguageImproveTOPIC)
      .replace('[STYLE]', this.selectedStyleImproveTOPIC)
      .replace('[TONE]', this.selectedToneImproveTOPIC);
    this.functionService.getImprovedTopic(
      finalPrompt,
      this.modelTopic,
      this.maxTokensTopic
    )
      .subscribe((response) => {
        this.isGettingTopicTitle = false;
        this.topicTitle = response.message;
      }, (error) => {
        this.isGettingTopicTitle = false;
        this.showError(error.error.message);
      });
  }

  improveTopicInfo() {
    this.isGettingTopicInfo = true;
    let finalPrompt = this.improveInfoPrompt
      .replace('[INFOS]', this.topicInfos)
      .replace('[LANGUAGE]', this.selectedLanguageImproveTOPIC)
      .replace('[STYLE]', this.selectedStyleImproveTOPIC)
      .replace('[TONE]', this.selectedToneImproveTOPIC);
    this.functionService.getImprovedInfo(
      finalPrompt, this.modelTopic, this.maxTokensTopic
    )
      .subscribe((response) => {
        this.isGettingTopicInfo = false;
        this.topicInfos = response.message;
      }, (error) => {
        this.isGettingTopicInfo = false;
        this.showError(error.error.message);
      });
  }

  getTitle() {
    this.isGettingTitle = true;
    let finalPrompt = this.titlePrompt
      .replace('[TOPIC]', this.topicTitle)
      .replace('[LANGUAGE]', this.selectedLanguage)
      .replace('[STYLE]', this.selectedStyle)
      .replace('[TONE]', this.selectedTone);
    this.functionService.getTitle(
      finalPrompt, this.modelTitle, this.maxTokensTitle
    )
      .subscribe((response) => {
        this.isGettingTitle = false;
        this.titleResponse = response.message;
        this.addDefaulIntroduction();
        this.analyzeSeoTitle(this.titleResponse);
      }, (error) => {
        this.isGettingTitle = false;
        this.showError(error.error.message);
      });
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
        this.topicKeyword,
      );
      this.addDefaultSections();
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.log('Fetch aborted');
      } else {
        console.error("Used introduction with a less-than-satisfactory SEO score after retries.");
        this.showError(error.error.message);
      }
    } finally {
      this.isGettingIntroduction = false;
    }
  }

  getSections() {
    this.isGettingSections = true;
    let finalPrompt = this.sectionsPrompt
      .replace('[QUANTITY]', this.qtyParagraphs.toString())
      .replace('[TOPIC]', this.titleResponse)
      .replace('[LANGUAGE]', this.selectedLanguage)
      .replace('[STYLE]', this.selectedStyle)
      .replace('[TONE]', this.selectedTone);
    const keywordInsertionRate = 0.5; // 50% degli h2 conterrà la parola chiave
    this.functionService.getSections(
      finalPrompt,
      this.modelSections,
      this.maxTokensSections,
    )
      .subscribe((response) => {
        this.isGettingSections = false;

        let sections = response.message.split('</h2>');
        sections = sections.slice(0, -1); // Rimuovi l'ultimo elemento vuoto
        const keywordSectionsCount = Math.floor((sections.length - 4) * keywordInsertionRate); // Escludi i primi tre e l'ultimo

        const interval = Math.floor((sections.length - 4) / keywordSectionsCount);
        for (let i = 0; i < keywordSectionsCount; i++) {
          const index = 3 + i * interval;
          sections[index] = sections[index].replace('<h2>', `<h2>${this.topicKeyword}: `);
        }

        this.analyzeSeoSections(sections);
        this.sectionsResponse = sections.join('</h2>') + '</h2>';
        this.addDefaultContent();
      }, (error) => {
        this.isGettingSections = false;
        this.showError(error.error.message);
      });
  }
  getContent() {
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
    this.functionService.getContent(
      finalPrompt, this.modelContent, this.maxTokensContent
    ).subscribe((response) => {
      this.isGettingContent = false;
      this.contentResponse = response.message;
      this.analyzeSeoContent(this.contentResponse);
    }, (error) => {
      this.isGettingContent = false;
      this.showError(error.error.message);
    });
  }
  async getCompleteArticle() {
    this.isGettingCompleteArticle = true;

    this.completeArticleResponse = this.functionService.getCompleteArticle(
      this.titleResponse, this.contentResponse, this.introductionResponse, this.topicASIN, this.topicKeyword,
      this.shortcodes
    ).replace(/\[ASIN\]/g, this.topicASIN)
    .replace(/\[KEYWORD\]/g, this.topicKeyword);
    this.isGettingCompleteArticle = false;
    this.countWords();
    this.calculateTotalSeoScore();
    this.cdr.detectChanges();
  }
  async publishArticleOnWP() {
    try {
      this.showSuccess(await this.functionService.publishArticleOnWP(
        this.isGettingCompleteArticle,
        this.completeArticleResponse,
        this.titleResponse,
        this.wpService));
    } catch (error: any) {
      console.error(error);
      this.showError(error);
    }
  }

  //*************SHORTCODE HANDLE *******************//
  shortcodes: { code: string, position: string }[] = [
    {
      code: `[content-egg-block template=customizable product="it-[ASIN]" show=img]`,
      position: 'beforeIntroduction'
    },
    {
      code: ` [content-egg module=AmazonNoApi products="it-[ASIN]" template=list_no_price]`,
      position: 'afterIntroduction'
    },
    {
      code: `<h3>Migliore Offerta inerente a [KEYWORD]:</h3>
      <p>[content-egg module=AmazonNoApi products="it-[ASIN]" template=item]`,
      position: 'endOfArticle'
    }
  ];

  addShortcode() {
    this.shortcodes.push({ code: '', position: '' });
  }

  removeShortcode(index: number) {
    this.shortcodes.splice(index, 1);
  }

  saveShortcode() {
    this.shortcodes = this.shortcodes.map(shortcode => {
      let newCode = shortcode.code
        .replace('[ASIN]', this.topicASIN)
        .replace('[KEYWORD]', this.topicKeyword);

      return {
        ...shortcode,
        code: newCode
      };
    });
  }

  // setDefaultShortcodes() {
  //   this.shortcodes = [
  //     {
  //       code: `[content-egg-block template=customizable product="it-${this.topicASIN}" show=img]`,
  //       position: 'beforeIntroduction'
  //     },
  //     {
  //       code: ` [content-egg module=AmazonNoApi products="it-${this.topicASIN}" template=list_no_price]`,
  //       position: 'afterIntroduction'
  //     },
  //     {
  //       code: `<h3>Migliore Offerta inerente a ${this.topicKeyword}:</h3>
  //       <p>[content-egg module=AmazonNoApi products="it-${this.topicASIN}" template=item]`,
  //       position: 'endOfArticle'
  //     }
  //   ];
  // }

  //*************COUNT WORDS *******************//
  wordsCount: number = 0
  countWords() {
    if (this.completeArticleResponse) {
      this.wordsCount = this.completeArticleResponse.split(/\s+/).length;
    } else {
      this.wordsCount = 0;
    }
  }
  //*************SETTINGS FOR EVERY STEPS *******************//
  currentStepValue = 1;
  modelTopic = 'gpt-3.5-turbo';
  maxTokensTopic = 2048;
  modelTitle = 'gpt-3.5-turbo';
  maxTokensTitle = 2048;
  modelIntroduction = 'gpt-3.5-turbo';
  maxTokensIntroduction = 2048;
  modelSections = 'gpt-3.5-turbo';
  maxTokensSections = 2048;
  modelContent = 'gpt-4';
  maxTokensContent = 2048;
  currentStep(currenStep: number) {
    this.currentStepValue = currenStep
  }
  getModelValue() {
    switch (this.currentStepValue) {
      case 1:
        return this.modelTitle;
      case 2:
        return this.modelIntroduction;
      case 3:
        return this.modelSections;
      case 4:
        return this.modelContent;
      default:
        return null;
    }
  }

  setModelValue(value: string) {
    switch (this.currentStepValue) {
      case 1:
        this.modelTitle = value;
        break;
      case 2:
        this.modelIntroduction = value;
        break;
      case 3:
        this.modelSections = value;
        break;
      case 4:
        this.modelContent = value;
        break;
    }
  }

  setDefaultModelValue() {
    switch (this.currentStepValue) {
      case 1:
        this.modelTitle = 'gpt-3.5';
        break;
      case 2:
        this.modelIntroduction = 'gpt-3.5-turbo';
        break;
      case 3:
        this.modelSections = 'gpt-3.5-turbo';
        break;
      case 4:
        this.modelContent = 'gpt-3.5-turbo-16k';
        break;
    }
  }
  setDefaultMaxTokensValue() {
    switch (this.currentStepValue) {
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
  setDefaultModelValueTOPIC() {
    this.modelTopic = 'gpt-3.5-turbo';
  }
  setDefaultMaxTokensValueTOPIC() {
    this.maxTokensTopic = 2048;
  }
  getMaxTokensValue() {
    switch (this.currentStepValue) {
      case 1:
        return this.maxTokensTitle;
      case 2:
        return this.maxTokensIntroduction;
      case 3:
        return this.maxTokensSections;
      case 4:
        return this.maxTokensContent;
      default:
        return null;
    }
  }

  setMaxTokensValue(value: number) {
    switch (this.currentStepValue) {
      case 1:
        this.maxTokensTitle = value;
        break;
      case 2:
        this.maxTokensIntroduction = value;
        break;
      case 3:
        this.maxTokensSections = value;
        break;
      case 4:
        this.maxTokensContent = value;
        break;
    }
  }

  setDefaultQtyParagraphs() {
    this.qtyParagraphs = 10;
  }

  getPromptValue() {
    switch (this.currentStepValue) {
      case 1:
        return this.titlePrompt;
      case 2:
        return this.introductionPrompt;
      case 3:
        return this.sectionsPrompt;
      case 4:
        return this.contentPrompt;
      default:
        return null;
    }
  }
  setPromptValue(value: string) {
    switch (this.currentStepValue) {
      case 1:
        this.titlePrompt = value;
        break;
      case 2:
        this.introductionPrompt = value;
        break;
      case 3:
        this.sectionsPrompt = value;
        break;
      case 4:
        this.contentPrompt = value;
        break;
    }
  }

  getImprovementTitlePromptValue() {
    return this.improveTitlePrompt;
  }
  setImprovementTitlePromptValue(value: string) {
    this.improveTitlePrompt = value;
  }

  getImprovementINFOPromptValue() {
    return this.improveInfoPrompt;
  }
  setImprovementtINFOPromptValue(value: string) {
    this.improveInfoPrompt = value;
  }


  //*************ADD VALUE DEFAULT DURING MODAL OPEN *******************//
  selectedLanguage: string = 'italiano';
  selectedStyle: string = 'blog post';
  selectedTone: string = 'informal';

  setDefaultPromptValue() {
    switch (this.currentStepValue) {
      case 1:
        this.titlePrompt = this.addValueDefaultTitle();
        break;
      case 2:
        this.introductionPrompt = this.addDefaulIntroduction();
        break;
      case 3:
        this.sectionsPrompt = this.addDefaultSections();
        break;
      case 4:
        this.contentPrompt = this.addDefaultContent();
        break;
    }
  }
  loadDefaultData() {
    this.addValueDefaultTitle();
    this.addDefaulIntroduction();
    this.addDefaultSections();
    this.addDefaultContent();
    this.addDefaultImproveTitle();
    this.addDefaultImproveInfo();
  }
  useCorrectDefaultPrompt() {
    switch (this.currentStepValue) {
      case 1:
        this.titlePrompt = this.addValueDefaultTitle();
        break;
      case 2:
        this.introductionPrompt = this.addDefaulIntroduction();
        break;
      case 3:
        this.sectionsPrompt = this.addDefaultSections();
        break;
      case 4:
        this.contentPrompt = this.addDefaultContent();
        break;
    }
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

  //########### IMPROVE TOPIC #############//
  selectedLanguageImproveTOPIC: string = 'italiano';
  selectedStyleImproveTOPIC: string = 'blog post';
  selectedToneImproveTOPIC: string = 'informal';

  improveTitlePrompt = ''
  improveInfoPrompt = ''

  addDefaultImproveTitle() {
    let value = this.functionService.getDefaultImproveTitlePrompt()
    return this.improveTitlePrompt = value;
  }
  addDefaultImproveInfo() {
    let value = this.functionService.getDefaultImproveInfoPrompt()
    return this.improveInfoPrompt = value;
  }
  useCorrectDefaultPromptImproveTOPIC() {
    this.improveTitlePrompt = this.addDefaultImproveTitle();
    this.improveInfoPrompt = this.addDefaultImproveInfo();
  }
  setDefaultPromptValueTITLE_TOPIC() {
    this.improveTitlePrompt = this.addDefaultImproveTitle();
  }

  setDefaultPromptValueINFO_TOPIC() {
    this.improveInfoPrompt = this.addDefaultImproveInfo();
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


}
