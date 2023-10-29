import { SeoAnalyzerService } from './../../../utils/seoAnalyzer/seoanalyzer.service';
import { FunctionsService } from './../../../utils/functions/amazon/functions.service';
import { WpService } from '../../../services/wp.service';
import { ChangeDetectorRef, Component, HostListener, OnInit } from '@angular/core';
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
  showInfo: boolean = false;
  titleResponse: string = '';
  introductionResponse: string = '';
  sectionsResponse: string = '';
  contentResponse: string = '';
  completeArticleResponse: string = '';
  topicTitle = 'Brigros - Barbecue a gas DALLAS con rotelle potente e pratico, comodo da spostare, sistema di pulizia facile (3 fuochi)';
  topicInfos = `1. Barbecue a gas con 3 bruciatori ad alte prestazioni in tubi di acciaio.
  2. Griglia barbecue di dimensioni 60 x 42 cm con infinite opzioni di cottura.
  3. Sistema di pulizia facile e veloce per una manutenzione senza problemi.
  4. Dotato di rotelle per un facile trasporto ovunque desideri.
  5. Dimensioni del barbecue: 122 x 57 x 112 cm (coperchio chiuso), peso: 26,70 kg, imballo: 60 x 58 x 53 cm.
  6. Accensione piezoelettrica per un'avvio semplice e rapido.
  7. Termometro integrato nel coperchio per una cottura ottimale del cibo.
  8. Massimo 500 caratteri.
  9. Contiene solo informazioni essenziali.
  10. Non contiene frasi incomplete.
  11. Non contiene icone, emoji o caratteri speciali.
  12. Strutturato come elenco numerato.
  13. Impersonale e professionale.`;
  topicKeyword = 'Brigros - Barbecue a gas';
  topicASIN = 'B08Y59NM8V';

  isGettingTitle = false;
  isGettingIntroduction = false;
  isGettingSections = false;
  isGettingContent = false;
  isGettingTopicTitle = false;
  isGettingTopicInfo = false;
  isGettingCompleteArticle = false;

  stepperOrientation!: Observable<StepperOrientation>;
  titleInfoArray: any[] = []

  qtyParagraphs = 0;
  titlePrompt = ''
  introductionPrompt = ''
  sectionsPrompt = ''
  contentPrompt = ''

  currentStepValue = 1;
  modelTopic = '';
  maxTokensTopic = 0;
  modelTitle = '';
  maxTokensTitle = 0;
  modelIntroduction = '';
  maxTokensIntroduction = 0;
  modelSections = '';
  maxTokensSections = 0;
  modelContent = '';
  maxTokensContent = 0;
  wordsCount: number = 0

  improveTitlePrompt = ''
  improveInfoPrompt = ''

  selectedLanguageTitle: string = '';
  selectedLanguageIntroduction: string = '';
  selectedLanguageSections: string = '';
  selectedLanguageContent: string = '';

  selectedStyleTitle: string = '';
  selectedStyleIntroduction: string = '';
  selectedStyleSections: string = '';
  selectedStyleContent: string = '';

  selectedToneTile: string = '';
  selectedToneIntroduction: string = '';
  selectedToneSections: string = '';
  selectedToneContent: string = '';

  selectedLanguageImproveTOPIC: string = '';
  selectedStyleImproveTOPIC: string = '';
  selectedToneImproveTOPIC: string = '';

  maxTitleScore = 30;
  maxIntroductionScore = 30;
  maxSectionsScore = 20;
  maxContentScore = 20;
  seoTitleScore: number = 0;
  seoIntroductionScore: number = 0;
  seoSectionsScore: number = 0;
  seoContentScore: number = 0;
  totalSeoScore: number = 0;


  models: any[] = [];
  languages: any[] = [];
  styles: any[] = [];
  tones: any[] = [];
  prompt: any[] = [];
  shortcodes: { id: number, code: string, position: string, section: string }[] = [
    {
      id: 0,
      code: "",
      position: "",
      section: "single_product"
    }
  ];

  ngOnInit(): void {

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

    this.getModels();
    this.getLanguages();
    this.getStyles();
    this.getTones();
    this.getPromptSection();
    this.getShortcodes();

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
    this.dbService.get('/prompt_section_product').subscribe((response) => {
      this.prompt = response;
      this.loadDefaultData()

    }, (error) => {
      console.log(error);
    });
  }

  getShortcodes() {
    this.dbService.get('/shortcodes').subscribe((response) => {
      this.shortcodes = response.filter(
        (shortcode: any) => shortcode.section === 'single_product'
      )
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
      .replace('[LANGUAGE]', this.prompt.filter((item: any) => item.name === 'title')[0].language)
      .replace('[STYLE]', this.prompt.filter((item: any) => item.name === 'title')[0].style)
      .replace('[TONE]', this.prompt.filter((item: any) => item.name === 'title')[0].tone);
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
      .replace('[LANGUAGE]', this.prompt.filter((item: any) => item.name === 'introduction')[0].language)
      .replace('[STYLE]', this.prompt.filter((item: any) => item.name === 'introduction')[0].style)
      .replace('[TONE]', this.prompt.filter((item: any) => item.name === 'introduction')[0].tone);
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
      .replace('[LANGUAGE]', this.prompt.filter((item: any) => item.name === 'sections')[0].language)
      .replace('[STYLE]', this.prompt.filter((item: any) => item.name === 'sections')[0].style)
      .replace('[TONE]', this.prompt.filter((item: any) => item.name === 'sections')[0].tone);
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
      .replace('[LANGUAGE]', this.prompt.filter((item: any) => item.name === 'content')[0].language)
      .replace('[SECTIONS]', sectionsString)
      .replace('[TOPIC_INFOS]', this.topicInfos)
      .replace('PARPERSECTIONS', '3')
      .replace('[STYLE]', this.prompt.filter((item: any) => item.name === 'content')[0].style)
      .replace('[TONE]', this.prompt.filter((item: any) => item.name === 'content')[0].tone);
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

  addShortcode() {
    this.saveShortcode();
    const newShortcode = { code: '', position: '', section: 'single_product' };
    this.dbService.post('/shortcodes', newShortcode).subscribe(response => {
      this.getShortcodes();
    });
  }


  removeShortcode(id: number) {
    if (confirm('Are you sure to delete this shortcode?')){
      this.saveShortcode();
      this.dbService.delete('/shortcodes', id).subscribe(response => {
        this.getShortcodes();
      });
    }
  }

  saveShortcode() {
    this.dbService.put('/shortcodes', this.shortcodes).subscribe();
  }

  //*************COUNT WORDS *******************//
  countWords() {
    if (this.completeArticleResponse) {
      this.wordsCount = this.completeArticleResponse.split(/\s+/).length;
    } else {
      this.wordsCount = 0;
    }
  }
  //*************SETTINGS FOR EVERY STEPS *******************//

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
  setDefaultMaxTokensValue() {
    switch (this.currentStepValue) {
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
  setDefaultModelValueTOPIC() {
    this.modelTopic = this.prompt.filter((item: any) => item.name === 'topicTitle')[0].model;
  }
  setDefaultMaxTokensValueTOPIC() {
    this.maxTokensTopic = this.prompt.filter((item: any) => item.name === 'topicTitle')[0].max_tokens;
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
    this.qtyParagraphs = this.prompt.filter((item: any) => item.name === 'sections')[0].qtyParagraphs;
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

  setCurrentValueLanguage(value: string) {
    switch (this.currentStepValue) {
      case 1:
        this.selectedLanguageTitle = value;
        break;
      case 2:
        this.selectedLanguageIntroduction = value;
        break;
      case 3:
        this.selectedLanguageSections = value;
        break;
      case 4:
        this.selectedLanguageContent = value;
        break;
    }
  }

  setCurrentValueStyle(value: string) {
    switch (this.currentStepValue) {
      case 1:
        this.selectedStyleTitle = value;
        break;
      case 2:
        this.selectedStyleIntroduction = value;
        break;
      case 3:
        this.selectedStyleSections = value;
        break;
      case 4:
        this.selectedStyleContent = value;
        break;
    }
  }

  setCurrentValueTone(value: string) {
    switch (this.currentStepValue) {
      case 1:
        this.selectedToneTile = value;
        break;
      case 2:
        this.selectedToneIntroduction = value;
        break;
      case 3:
        this.selectedToneSections = value;
        break;
      case 4:
        this.selectedToneContent = value;
        break;
    }
  }
  saveSettings() {
    this.dbService.put('/prompt_section_product', {
      model: this.getModelValue(),
      max_tokens: this.getMaxTokensValue(),
      language: this.currentStepValue == 1 ? this.selectedLanguageTitle :
        this.currentStepValue == 2 ? this.selectedLanguageIntroduction :
          this.currentStepValue == 3 ? this.selectedLanguageSections :
            this.selectedLanguageContent,
      style: this.currentStepValue == 1 ? this.selectedStyleTitle :
        this.currentStepValue == 2 ? this.selectedStyleIntroduction :
          this.currentStepValue == 3 ? this.selectedStyleSections :
            this.selectedStyleContent,
      tone: this.currentStepValue == 1 ? this.selectedToneTile :
        this.currentStepValue == 2 ? this.selectedToneIntroduction :
          this.currentStepValue == 3 ? this.selectedToneSections
            : this.selectedToneContent,
      default_prompt: this.getPromptValue(),
      name: this.currentStepValue == 1 ? 'title' :
        this.currentStepValue == 2 ? 'introduction' :
          this.currentStepValue == 3 ? 'sections' : 'content'
    }).subscribe((response) => {
      console.log(response);
      this.getPromptSection();
    }, (error) => {
      console.log(error);
    });

  }

  //*************ADD VALUE DEFAULT DURING MODAL OPEN *******************//
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

    this.modelTopic = this.prompt.filter((item: any) => item.name === 'topicTitle')[0].model;
    this.maxTokensTopic = this.prompt.filter((item: any) => item.name === 'topicTitle')[0].max_tokens;
    this.modelTitle = this.prompt.filter((item: any) => item.name === 'title')[0].model;
    this.maxTokensTitle = this.prompt.filter((item: any) => item.name === 'title')[0].max_tokens;
    this.modelIntroduction = this.prompt.filter((item: any) => item.name === 'introduction')[0].model;
    this.maxTokensIntroduction = this.prompt.filter((item: any) => item.name === 'introduction')[0].max_tokens;
    this.modelSections = this.prompt.filter((item: any) => item.name === 'sections')[0].model;
    this.maxTokensSections = this.prompt.filter((item: any) => item.name === 'sections')[0].max_tokens;
    this.modelContent = this.prompt.filter((item: any) => item.name === 'content')[0].model;
    this.maxTokensContent = this.prompt.filter((item: any) => item.name === 'content')[0].max_tokens;

    this.qtyParagraphs = this.prompt.filter((item: any) => item.name === 'sections')[0].qtyParagraph;

    this.selectedLanguageTitle = this.prompt.filter((item: any) => item.name === 'title')[0].language;
    this.selectedLanguageIntroduction = this.prompt.filter((item: any) => item.name === 'introduction')[0].language;
    this.selectedLanguageSections = this.prompt.filter((item: any) => item.name === 'sections')[0].language;
    this.selectedLanguageContent = this.prompt.filter((item: any) => item.name === 'content')[0].language;

    this.selectedStyleTitle = this.prompt.filter((item: any) => item.name === 'title')[0].style;
    this.selectedStyleIntroduction = this.prompt.filter((item: any) => item.name === 'introduction')[0].style;
    this.selectedStyleSections = this.prompt.filter((item: any) => item.name === 'sections')[0].style;
    this.selectedStyleContent = this.prompt.filter((item: any) => item.name === 'content')[0].style;

    this.selectedToneTile = this.prompt.filter((item: any) => item.name === 'title')[0].tone;
    this.selectedToneIntroduction = this.prompt.filter((item: any) => item.name === 'introduction')[0].tone;
    this.selectedToneSections = this.prompt.filter((item: any) => item.name === 'sections')[0].tone;
    this.selectedToneContent = this.prompt.filter((item: any) => item.name === 'content')[0].tone;

    this.selectedLanguageImproveTOPIC = this.prompt.filter((item: any) => item.name === 'topicTitle')[0].language;
    this.selectedStyleImproveTOPIC = this.prompt.filter((item: any) => item.name === 'topicTitle')[0].style;
    this.selectedToneImproveTOPIC = this.prompt.filter((item: any) => item.name === 'topicTitle')[0].tone;
  }

  addValueDefaultTitle(): string {
    let value = this.prompt.filter((item: any) => item.name === 'title')[0].default_prompt
    return this.titlePrompt = value;
  }

  addDefaulIntroduction() {
    let value = this.prompt.filter((item: any) => item.name === 'introduction')[0].default_prompt
    return this.introductionPrompt = value;
  }

  addDefaultSections() {
    let value = this.prompt.filter((item: any) => item.name === 'sections')[0].default_prompt
    return this.sectionsPrompt = value;
  }

  addDefaultContent() {
    let value = this.prompt.filter((item: any) => item.name === 'content')[0].default_prompt
    return this.contentPrompt = value;
  }

  //########### IMPROVE TOPIC #############//

  addDefaultImproveTitle() {
    let value = this.prompt.filter((item: any) => item.name === 'topicTitle')[0].default_prompt
    return this.improveTitlePrompt = value;
  }
  addDefaultImproveInfo() {
    let value = this.prompt.filter((item: any) => item.name === 'topicInfos')[0].default_prompt
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

  saveSettingsTOPIC() {
    this.dbService.put('/prompt_section_product', {
      model: this.modelTopic,
      max_tokens: this.maxTokensTopic,
      language: this.selectedLanguageImproveTOPIC,
      style: this.selectedStyleImproveTOPIC,
      tone: this.selectedToneImproveTOPIC,
      default_prompt: this.getImprovementTitlePromptValue(),
      name: 'topicTitle'
    }).subscribe((response) => {
      console.log(response);
    }, (error) => {
      console.log(error);
    });

    this.dbService.put('/prompt_section_product', {
      model: this.modelTopic,
      max_tokens: this.maxTokensTopic,
      language: this.selectedLanguageImproveTOPIC,
      style: this.selectedStyleImproveTOPIC,
      tone: this.selectedToneImproveTOPIC,
      default_prompt: this.getImprovementINFOPromptValue(),
      name: 'topicInfos'
    }).subscribe((response) => {
      console.log(response);
    }, (error) => {
      console.log(error);
    });
  }

  //*************SEO IMPROVMENT *******************//
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
  //*************END SEO IMPROVMENT *******************//
}
