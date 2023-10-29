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
  selector: 'app-single-pillar-article',
  templateUrl: './single-pillar-article.component.html',
  styleUrls: ['./single-pillar-article.component.scss']
})
export class SinglePillarArticleComponent {
  showInfo: boolean = false;
  titleResponse: string = '';
  introductionResponse: string = '';
  sectionsResponse: string = '';
  contentResponse: string = '';
  completeArticleResponse: string = '';
  shortcodes: { id: number, code: string, position: string, section: string }[] = [
    {
      id: 0,
      code: "",
      position: "",
      section: "single_product"
    }
  ];
  block = {
    topicTitle: 'Aspirapolveri',
    isAmazonProduct: true,
    rows: [
      {
        asin: 'B07GH89JZD',
        title: 'Dyson V11',
        details: 'Aspirapolvere potente con batteria a lunga durata.'
      },
      {
        asin: 'B081QNXFSF',
        title: 'Roomba i7',
        details: 'Robot aspirapolvere programmabile e con stazione di svuotamento.'
      }
    ],
    settings: {
      // Impostazioni Titolo
      selectedLanguageTitle: 'italiano',
      selectedStyleTitle: 'article',
      selectedToneTitle: 'formal',
      modelTitle: 'gpt-3.5-turbo',
      maxTokensTitle: 150,
      promptTextTitle: 'Guida all\'acquisto di aspirapolveri nel 2023',

      // Impostazioni Introduzione
      selectedLanguageIntroduction: 'italiano',
      selectedStyleIntroduction: 'article',
      selectedToneIntroduction: 'formal',
      modelIntroduction: 'gpt-3.5-turbo',
      maxTokensIntroduction: 200,
      promptTextIntroduction: 'Introduzione alle migliori opzioni di aspirapolveri disponibili nel mercato.',

      // Impostazioni Sezioni
      selectedLanguageSections: 'italiano',
      selectedStyleSections: 'article',
      selectedToneSections: 'formal',
      qtyParagraphs: 2,
      modelSections: 'gpt-3.5-turbo',
      maxTokensSections: 300,
      promptTextSections: 'Caratteristiche salienti e differenze tra Dyson V11 e Roomba i7.',

      //Impostazioni Sezioni senza Amazon
      selectedLanguageSectionsNoAmz: 'italiano',
      selectedStyleSectionsNoAmz: 'article',
      selectedToneSectionsNoAmz: 'formal',
      qtyParagraphsNoAMZ: 2,
      modelSectionsNoAMZ: 'gpt-3.5-turbo',
      maxTokensSectionsNoAMZ: 300,
      promptTextSectionsNoAMZ: 'Caratteristiche salienti e differenze tra Dyson V11 e Roomba i7.',

      // Impostazioni Contenuto
      selectedLanguageContent: 'italiano',
      selectedStyleContent: 'article',
      selectedToneContent: 'formal',
      modelContent: 'gpt-3.5-turbo',
      maxTokensContent: 500,
      promptTextContent: 'Dettagli sul funzionamento, manutenzione e suggerimenti per l\'utilizzo ottimale degli aspirapolveri.',

      // Impostazioni Shortcode
      shortcodes: this.shortcodes
    }
  }



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
    this.dbService.get('/prompt_pillar_section').subscribe((response) => {
      this.prompt = response;
      this.block.settings.promptTextTitle = this.prompt[0].default_prompt
      this.block.settings.selectedLanguageTitle = this.prompt[0].language
      this.block.settings.selectedStyleTitle = this.prompt[0].style
      this.block.settings.selectedToneTitle = this.prompt[0].tone
      this.block.settings.modelTitle = this.prompt[0].model
      this.block.settings.maxTokensTitle = this.prompt[0].max_tokens

      this.block.settings.promptTextIntroduction = this.prompt[1].default_prompt
      this.block.settings.selectedLanguageIntroduction = this.prompt[1].language
      this.block.settings.selectedStyleIntroduction = this.prompt[1].style
      this.block.settings.selectedToneIntroduction = this.prompt[1].tone
      this.block.settings.modelIntroduction = this.prompt[1].model
      this.block.settings.maxTokensIntroduction = this.prompt[1].max_tokens

      this.block.settings.promptTextSections = this.prompt[2].default_prompt
      this.block.settings.selectedLanguageSections = this.prompt[2].language
      this.block.settings.selectedStyleSections = this.prompt[2].style
      this.block.settings.selectedToneSections = this.prompt[2].tone
      this.block.settings.modelSections = this.prompt[2].model
      this.block.settings.maxTokensSections = this.prompt[2].max_tokens

      this.block.settings.promptTextSectionsNoAMZ = this.prompt[3].default_prompt
      this.block.settings.selectedLanguageSectionsNoAmz = this.prompt[3].language
      this.block.settings.selectedStyleSectionsNoAmz = this.prompt[3].style
      this.block.settings.selectedToneSectionsNoAmz = this.prompt[3].tone
      this.block.settings.modelSectionsNoAMZ = this.prompt[3].model
      this.block.settings.maxTokensSectionsNoAMZ = this.prompt[3].max_tokens


      this.block.settings.promptTextContent = this.prompt[4].default_prompt
      this.block.settings.selectedLanguageContent = this.prompt[4].language
      this.block.settings.selectedStyleContent = this.prompt[4].style
      this.block.settings.selectedToneContent = this.prompt[4].tone
      this.block.settings.modelContent = this.prompt[4].model
      this.block.settings.maxTokensContent = this.prompt[4].max_tokens

      this.loadDefaultData()

    }, (error) => {
      console.log(error);
    });
  }
  getSelectedLanguage() {
    if (this.currentStepValue == 1) {
      return this.block.settings.selectedLanguageTitle
    } else if (this.currentStepValue == 2) {
      return this.block.settings.selectedLanguageIntroduction
    } else if (this.currentStepValue == 3) {
      return this.block.settings.selectedLanguageSections
    } else if (this.currentStepValue == 4) {
      this.block.settings.selectedLanguageContent
    }
    return this.block.settings.selectedLanguageTitle
  }
  selectedLanguageChange(event: any) {
    if (this.currentStepValue == 1) {
      return this.block.settings.selectedLanguageTitle = event
    } else if (this.currentStepValue == 2) {
      return this.block.settings.selectedLanguageIntroduction = event
    } else if (this.currentStepValue == 3 && this.block.isAmazonProduct == true) {
      return this.block.settings.selectedLanguageSections = event
    } else if (this.currentStepValue == 3 && this.block.isAmazonProduct == false) {
      return this.block.settings.selectedLanguageSectionsNoAmz = event
    } else if (this.currentStepValue == 4) {
      return this.block.settings.selectedLanguageContent = event
    }
  }

  getSelectedStyle() {
    if (this.currentStepValue == 1) {
      return this.block.settings.selectedStyleTitle
    } else if (this.currentStepValue == 2) {
      return this.block.settings.selectedStyleIntroduction
    } else if (this.currentStepValue == 3 && this.block.isAmazonProduct == true) {
      return this.block.settings.selectedStyleSections
    } else if (this.currentStepValue == 3 && this.block.isAmazonProduct == false) {
      return this.block.settings.selectedStyleSectionsNoAmz
    } else if (this.currentStepValue == 4) {
      this.block.settings.selectedStyleContent
    }
    return this.block.settings.selectedStyleContent
  }
  selectedStyleChange(event: any) {
    if (this.currentStepValue == 1) {
      return this.block.settings.selectedStyleTitle = event
    } else if (this.currentStepValue == 2) {
      return this.block.settings.selectedStyleIntroduction = event
    } else if (this.currentStepValue == 3 && this.block.isAmazonProduct == true) {
      return this.block.settings.selectedStyleSections = event
    } else if (this.currentStepValue == 3 && this.block.isAmazonProduct == false) {
      return this.block.settings.selectedStyleSectionsNoAmz = event
    } else if (this.currentStepValue == 4) {
      return this.block.settings.selectedStyleContent = event
    }
  }

  getSelectedTone() {
    if (this.currentStepValue == 1) {
      return this.block.settings.selectedToneTitle
    } else if (this.currentStepValue == 2) {
      return this.block.settings.selectedToneIntroduction
    } else if (this.currentStepValue == 3 && this.block.isAmazonProduct == true) {
      return this.block.settings.selectedToneSections
    } else if (this.currentStepValue == 3 && this.block.isAmazonProduct == false) {
      return this.block.settings.selectedToneSectionsNoAmz
    } else if (this.currentStepValue == 4) {
      return this.block.settings.selectedToneContent
    }
    return this.block.settings.selectedToneTitle

  }
  selectedToneChange(event: any) {
    if (this.currentStepValue == 1) {
      return this.block.settings.selectedToneTitle = event
    } else if (this.currentStepValue == 2) {
      return this.block.settings.selectedToneIntroduction = event
    } else if (this.currentStepValue == 3 && this.block.isAmazonProduct == true) {
      return this.block.settings.selectedToneSections = event
    } else if (this.currentStepValue == 3 && this.block.isAmazonProduct == false) {
      return this.block.settings.selectedToneSectionsNoAmz = event
    } else if (this.currentStepValue == 4) {
      return this.block.settings.selectedToneContent = event
    }
  }
  getShortcodes() {
    this.dbService.get('/shortcodes').subscribe((response) => {
      this.shortcodes = response.filter(
        (shortcode: any) => shortcode.section === 'single_pillar_section'
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

  addRow(block: any) {
    block.rows.push({
      asin: '',
      title: '',
      details: ''
    });
  }

  removeRow(block: any, rowIndex: any) {
    if (confirm("Are you sure to delete this row?")) {
      block.rows.splice(rowIndex, 1);
    }
  }

  currentStep(currenStep: number) {
    this.currentStepValue = currenStep
  }
  stopRequest() {
    this.openAIService.abortRequests();
    this.isGettingTitle = false;
    this.isGettingIntroduction = false;
    this.isGettingSections = false;
    this.isGettingContent = false;
    this.isGettingCompleteArticle = false;
  }

  loadDefaultData() { }

  //**** PROMPT GENERATION *****/
  getTitle() {
    this.isGettingTitle = true;
    const titlePrompt = this.block.settings.promptTextTitle
      .replace('[TOPIC]', this.block.topicTitle)
      .replace('[LANGUAGE]', this.block.settings.selectedLanguageTitle)
      .replace('[STYLE]', this.block.settings.selectedStyleTitle)
      .replace('[TONE]', this.block.settings.selectedToneTitle);
      console.log(localStorage.getItem('openAI_apiKey'))
    this.openAIService.getResponse(
      titlePrompt, this.block.settings.modelTitle, this.block.settings.maxTokensTitle).subscribe((response) => {
        this.titleResponse = response.message;
        this.analyzeSeoTitle(this.titleResponse);
        this.isGettingTitle = false;

      });
  }

  getAndOptimizeIntroduction() {
    this.isGettingIntroduction = true;
    const introductionPrompt = this.block.settings.promptTextIntroduction
      .replace('[TOPIC]', this.block.topicTitle)
      .replace('[LANGUAGE]', this.block.settings.selectedLanguageIntroduction)
      .replace('[STYLE]', this.block.settings.selectedStyleIntroduction)
      .replace('[TONE]', this.block.settings.selectedToneContent);
    this.openAIService.getResponse(introductionPrompt,
      this.block.settings.modelIntroduction, this.block.settings.maxTokensIntroduction).subscribe((response) => {
        this.introductionResponse = response.message;
        this.analyzeSeoIntroduction(this.introductionResponse);
        this.isGettingIntroduction = false;
        // this.optimizeIntroduction();
      });
  }

  getSectionForRow(row: any, sectionsGen: any[]): Promise<void> {
    return new Promise((resolve) => {
      const rowPrompt = this.block.settings.promptTextSections
        .replace('[TITLE]', row.title)
        .replace('[ASIN]', row.asin)
        .replace('[DETAILS]', row.details)
        .replace('[LANGUAGE]', this.block.settings.selectedLanguageSections)
        .replace('[STYLE]', this.block.settings.selectedStyleSections)
        .replace('[TONE]', this.block.settings.selectedToneSections);
      this.openAIService.getResponse(rowPrompt, this.block.settings.modelSections, this.block.settings.maxTokensSections)
        .subscribe((rowResponse) => {
          sectionsGen.push(rowResponse.message);
          resolve();
        });
    });
  }

  allSectionGen = ''
  async getSections() {
    this.isGettingSections = true;
    const sectionsGen: any[] = [];
    for (const row of this.block.rows) {
      await this.getSectionForRow(row, sectionsGen);
    }
    this.analyzeSeoSections(sectionsGen);
    this.allSectionGen = sectionsGen.join('\n\n');
    this.isGettingSections = false;
    this.sectionsResponse = this.allSectionGen;
  }


  getContent() {
    this.isGettingContent = true;
    const contentPrompt = this.block.settings.promptTextContent
      .replace('[TOPIC]', this.block.topicTitle)
      .replace('[LANGUAGE]', this.block.settings.selectedLanguageContent)
      .replace('[STYLE]', this.block.settings.selectedStyleContent)
      .replace('[TONE]', this.block.settings.selectedToneContent)
      .replace('[SECTIONS_GENERATED]', this.allSectionGen)
    this.openAIService.getResponse(contentPrompt, this.block.settings.modelContent, this.block.settings.maxTokensContent).subscribe((response) => {
      this.contentResponse = response.message;
      this.analyzeSeoContent(this.contentResponse);
      this.isGettingContent = false;
    });
  }
  getCompleteArticle() {
    this.isGettingCompleteArticle = true;

    const topics = this.block.rows.map(row => ({ asin: row.asin, keyword: row.title }));
    this.completeArticleResponse = this.getCustomCompleteArticle(
      this.titleResponse, this.contentResponse, this.introductionResponse, this.sectionsResponse, topics, this.shortcodes
    );

    this.isGettingCompleteArticle = false;
    this.countWords();
    this.calculateTotalSeoScore();
    this.cdr.detectChanges();
  }
  getCustomCompleteArticle(title: string, content: string, introduction: string, sections: string, topics: { asin: string, keyword: string }[], shortcodes: { code: string, position: string }[]): string {
    const mergeSectionsContent = sections + content;
    let wrappedContent = this.functionService.wrapParagraphsWithPTags(mergeSectionsContent);
    let wrappedIntroduction = introduction;

    for (const topic of topics) {
      this.shortcodes.forEach(shortcode => {
        shortcode.code = shortcode.code.replace(/\[TITLE\]/g, topic.keyword);
        shortcode.code = shortcode.code.replace(/\[ASIN\]/g, topic.asin);
      });
    }


    const insertShortcodes = (content: string, tag: string, position: number, code: string, before: boolean = true) => {
      const openingTag = `<${tag}>`;
      const closingTag = `</${tag}>`;
      const regex = new RegExp(`${openingTag}(.*?)${closingTag}`, 'g');
      let match;
      let count = 0;
      let newContent = '';
      let lastIndex = 0;

      // Controlliamo il numero totale di occorrenze
      const totalMatches = (content.match(regex) || []).length;
      if (position >= totalMatches) return content; // Se non abbiamo abbastanza occorrenze, restituisci il contenuto originale

      while ((match = regex.exec(content)) !== null) {
        if (count === position) {
          if (before) {
            newContent += content.slice(lastIndex, match.index) + code;
            lastIndex = match.index;
          } else {
            newContent += content.slice(lastIndex, regex.lastIndex) + code;
            lastIndex = regex.lastIndex;
          }
        }
        count++;
      }

      newContent += content.slice(lastIndex);
      return newContent;
    };

    shortcodes.forEach(shortcode => {
      switch (shortcode.position) {
        case 'beforeIntroduction':
          wrappedIntroduction = shortcode.code + wrappedIntroduction;
          break;
        case 'afterIntroduction':
          wrappedIntroduction = wrappedIntroduction + shortcode.code;
          break;

        case 'beforeFirstP':
          wrappedContent = insertShortcodes(wrappedContent, 'p', 0, shortcode.code);
          break;

        case 'afterFirstP':
          wrappedContent = insertShortcodes(wrappedContent, 'p', 0, shortcode.code, false);
          break;
        case 'afterSecondP':
          wrappedContent = insertShortcodes(wrappedContent, 'p', 1, shortcode.code, false);
          break;
        case 'afterThirdP':
          wrappedContent = insertShortcodes(wrappedContent, 'p', 2, shortcode.code, false);
          break;
        case 'afterFourthP':
          wrappedContent = insertShortcodes(wrappedContent, 'p', 3, shortcode.code, false);
          break;
        case 'afterFifthP':
          wrappedContent = insertShortcodes(wrappedContent, 'p', 4, shortcode.code, false);
          break;
        case 'afterSixthP':
          wrappedContent = insertShortcodes(wrappedContent, 'p', 5, shortcode.code, false);
          break;
        case 'afterSeventhP':
          wrappedContent = insertShortcodes(wrappedContent, 'p', 6, shortcode.code, false);
          break;
        case 'afterEighthP':
          wrappedContent = insertShortcodes(wrappedContent, 'p', 7, shortcode.code, false);
          break;
        case 'afterNinthP':
          wrappedContent = insertShortcodes(wrappedContent, 'p', 8, shortcode.code, false);
          break;
        case 'afterTenthP':
          wrappedContent = insertShortcodes(wrappedContent, 'p', 9, shortcode.code, false);
          break;
        case 'afterEleventhP':
          wrappedContent = insertShortcodes(wrappedContent, 'p', 10, shortcode.code, false);
          break;
        case 'afterTwelfthP':
          wrappedContent = insertShortcodes(wrappedContent, 'p', 11, shortcode.code, false);
          break;
        case 'afterThirteenthP':
          wrappedContent = insertShortcodes(wrappedContent, 'p', 12, shortcode.code, false);
          break;
        case 'afterFourteenthP':
          wrappedContent = insertShortcodes(wrappedContent, 'p', 13, shortcode.code, false);
          break;
        case 'afterFifteenthP':
          wrappedContent = insertShortcodes(wrappedContent, 'p', 14, shortcode.code, false);
          break;
        case 'afterSixteenthP':
          wrappedContent = insertShortcodes(wrappedContent, 'p', 15, shortcode.code, false);
          break;
        case 'afterSeventeenthP':
          wrappedContent = insertShortcodes(wrappedContent, 'p', 16, shortcode.code, false);
          break;
        case 'afterEighteenthP':
          wrappedContent = insertShortcodes(wrappedContent, 'p', 17, shortcode.code, false);
          break;
        case 'afterNineteenthP':
          wrappedContent = insertShortcodes(wrappedContent, 'p', 18, shortcode.code, false);
          break;
        case 'afterTwentiethP':
          wrappedContent = insertShortcodes(wrappedContent, 'p', 19, shortcode.code, false);
          break;

        case 'beforeFirstH2':
          wrappedContent = insertShortcodes(wrappedContent, 'h2', 0, shortcode.code);
          break;

        case 'afterFirstH2':
          wrappedContent = insertShortcodes(wrappedContent, 'h2', 0, shortcode.code, false);
          break;
        case 'beforeSecondH2':
          wrappedContent = insertShortcodes(wrappedContent, 'h2', 1, shortcode.code);
          break;
        case 'afterSecondH2':
          wrappedContent = insertShortcodes(wrappedContent, 'h2', 1, shortcode.code, false);
          break;
        case 'beforeThirdH2':
          wrappedContent = insertShortcodes(wrappedContent, 'h2', 2, shortcode.code);
          break;
        case 'afterThirdH2':
          wrappedContent = insertShortcodes(wrappedContent, 'h2', 2, shortcode.code, false);
          break;
        case 'beforeFourthH2':
          wrappedContent = insertShortcodes(wrappedContent, 'h2', 3, shortcode.code);
          break;
        case 'afterFourthH2':
          wrappedContent = insertShortcodes(wrappedContent, 'h2', 3, shortcode.code, false);
          break;
        case 'beforeFifthH2':
          wrappedContent = insertShortcodes(wrappedContent, 'h2', 4, shortcode.code);
          break;
        case 'afterFifthH2':
          wrappedContent = insertShortcodes(wrappedContent, 'h2', 4, shortcode.code, false);
          break;
        case 'beforeSixthH2':
          wrappedContent = insertShortcodes(wrappedContent, 'h2', 5, shortcode.code);
          break;
        case 'afterSixthH2':
          wrappedContent = insertShortcodes(wrappedContent, 'h2', 5, shortcode.code, false);
          break;
        case 'beforeSeventhH2':
          wrappedContent = insertShortcodes(wrappedContent, 'h2', 6, shortcode.code);
          break;
        case 'afterSeventhH2':
          wrappedContent = insertShortcodes(wrappedContent, 'h2', 6, shortcode.code, false);
          break;
        case 'beforeEighthH2':
          wrappedContent = insertShortcodes(wrappedContent, 'h2', 7, shortcode.code);
          break;
        case 'afterEighthH2':
          wrappedContent = insertShortcodes(wrappedContent, 'h2', 7, shortcode.code, false);
          break;
        case 'beforeNinthH2':
          wrappedContent = insertShortcodes(wrappedContent, 'h2', 8, shortcode.code);
          break;
        case 'afterNinthH2':
          wrappedContent = insertShortcodes(wrappedContent, 'h2', 8, shortcode.code, false);
          break;
        case 'beforeTenthH2':
          wrappedContent = insertShortcodes(wrappedContent, 'h2', 9, shortcode.code);
          break;

        case 'randomInTheContent':
          const paragraphs = wrappedContent.split('<p>');
          const randomIndex = Math.floor(Math.random() * paragraphs.length);
          paragraphs[randomIndex] = shortcode.code + paragraphs[randomIndex];
          wrappedContent = paragraphs.join('<p>');
          break;

        case 'endOfArticle':
          wrappedContent = wrappedContent + shortcode.code;
          break;

      }
    });

    return `${title} ${wrappedIntroduction} ${wrappedContent}`;

  }
  countWords() {
    if (this.completeArticleResponse) {
      this.wordsCount = this.completeArticleResponse.split(/\s+/).length;
    } else {
      this.wordsCount = 0;
    }
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

  addShortcode() {
    this.saveShortcode();
    const newShortcode = { code: '', position: '', section: 'single_pillar_section' };
    this.dbService.post('/shortcodes', newShortcode).subscribe(response => {
      this.getShortcodes();
    });
  }
  removeShortcode(id: any) {
    if (confirm('Are you sure to delete this shortcode?')) {
      this.saveShortcode();
      this.dbService.delete('/shortcodes', id).subscribe(response => {
        this.getShortcodes();
      });
    }
  }

  saveAsDefaultSettings() {
    const data: any = {}

    if (this.currentStepValue == 1) {
      data['default_prompt'] = this.block.settings.promptTextTitle
      data['language'] = this.block.settings.selectedLanguageTitle
      data['style'] = this.block.settings.selectedStyleTitle
      data['tone'] = this.block.settings.selectedToneTitle
      data['model'] = this.block.settings.modelTitle
      data['max_tokens'] = this.block.settings.maxTokensTitle
      data['name'] = 'title'
    } else if (this.currentStepValue == 2) {
      data['default_prompt'] = this.block.settings.promptTextIntroduction
      data['language'] = this.block.settings.selectedLanguageIntroduction
      data['style'] = this.block.settings.selectedStyleIntroduction
      data['tone'] = this.block.settings.selectedToneIntroduction
      data['model'] = this.block.settings.modelIntroduction
      data['max_tokens'] = this.block.settings.maxTokensIntroduction
      data['name'] = 'introduction'
    } else if (this.currentStepValue == 3 && this.block.isAmazonProduct == true) {
      data['default_prompt'] = this.block.settings.promptTextSections
      data['language'] = this.block.settings.selectedLanguageSections
      data['style'] = this.block.settings.selectedStyleSections
      data['tone'] = this.block.settings.selectedToneSections
      data['model'] = this.block.settings.modelSections
      data['max_tokens'] = this.block.settings.maxTokensSections
      data['name'] = 'sections'
    } else if (this.currentStepValue == 3 && this.block.isAmazonProduct == false) {
      data['default_prompt'] = this.block.settings.promptTextSectionsNoAMZ
      data['language'] = this.block.settings.selectedLanguageSectionsNoAmz
      data['style'] = this.block.settings.selectedStyleSectionsNoAmz
      data['tone'] = this.block.settings.selectedToneSectionsNoAmz
      data['model'] = this.block.settings.modelSectionsNoAMZ
      data['max_tokens'] = this.block.settings.maxTokensSectionsNoAMZ
      data['name'] = 'sectionsNoAMZ'
    } else if (this.currentStepValue == 4) {
      data['default_prompt'] = this.block.settings.promptTextContent
      data['language'] = this.block.settings.selectedLanguageContent
      data['style'] = this.block.settings.selectedStyleContent
      data['tone'] = this.block.settings.selectedToneContent
      data['model'] = this.block.settings.modelContent
      data['max_tokens'] = this.block.settings.maxTokensContent
      data['name'] = 'content'
    }
    this.dbService.put('/prompt_pillar_section', [data]).subscribe((response) => {
      this.getPromptSection();
      this.showSuccess('Settings saved successfully!');
    }, (error) => {
      this.showError(error.error);
    }
    );
  }
  saveShortcode() {
    this.dbService.put('/shortcodes', this.shortcodes).subscribe(  () => {
        this.getShortcodes();
      });
  }

  //*************SEO IMPROVMENT *******************//
  analyzeSeoTitle(text: string): number {
    this.seoTitleScore = this.seoAnalyzerService.analyzeSeoTitle(text, this.block.topicTitle);
    return this.seoTitleScore;
  }
  analyzeSeoIntroduction(text: string): number {
    this.seoIntroductionScore = this.seoAnalyzerService.analyzeSeoIntroduction(text, this.block.topicTitle)
    return this.seoIntroductionScore
  }
  analyzeSeoSections(titles: string[]): number {
    this.seoSectionsScore = this.seoAnalyzerService.analyzeSeoSections(titles, this.block.topicTitle)
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
