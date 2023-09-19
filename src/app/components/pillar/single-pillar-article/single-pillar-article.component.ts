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
  titleResponse: string = '';
  introductionResponse: string = '';
  sectionsResponse: string = '';
  contentResponse: string = '';
  completeArticleResponse: string = '';

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
      shortcodes: [
        {
          code: '[ScontoSpeciale]',
          position: 'afterThirdH2'
        },
        {
          code: '[PromozioneEstiva]',
          position: 'beginningOfArticle'
        }
      ]
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
      //Aggiungere sezione senza Amazon


      this.block.settings.promptTextContent = this.prompt[3].default_prompt
      this.block.settings.selectedLanguageContent = this.prompt[3].language
      this.block.settings.selectedStyleContent = this.prompt[3].style
      this.block.settings.selectedToneContent = this.prompt[3].tone
      this.block.settings.modelContent = this.prompt[3].model
      this.block.settings.maxTokensContent = this.prompt[3].max_tokens

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
      this.block.settings.selectedLanguageTitle = event
    } else if (this.currentStepValue == 2) {
      this.block.settings.selectedLanguageIntroduction = event
    } else if (this.currentStepValue == 3) {
      this.block.settings.selectedLanguageSections = event
    } else if (this.currentStepValue == 4) {
      this.block.settings.selectedLanguageContent = event
    }
  }

  getSelectedStyle() {
    if (this.currentStepValue == 1) {
      return this.block.settings.selectedStyleTitle
    } else if (this.currentStepValue == 2) {
      return this.block.settings.selectedStyleIntroduction
    } else if (this.currentStepValue == 3) {
      return this.block.settings.selectedStyleSections
    } else if (this.currentStepValue == 4) {
      this.block.settings.selectedStyleContent
    }
    return this.block.settings.selectedStyleContent
  }
  selectedStyleChange(event: any) {
    if (this.currentStepValue == 1) {
      this.block.settings.selectedStyleTitle = event
    } else if (this.currentStepValue == 2) {
      this.block.settings.selectedStyleIntroduction = event
    } else if (this.currentStepValue == 3) {
      this.block.settings.selectedStyleSections = event
    } else if (this.currentStepValue == 4) {
      this.block.settings.selectedStyleContent = event
    }
  }

  getSelectedTone() {
    if (this.currentStepValue == 1) {
      return this.block.settings.selectedToneTitle
    } else if (this.currentStepValue == 2) {
      return this.block.settings.selectedToneIntroduction
    } else if (this.currentStepValue == 3) {
      return this.block.settings.selectedToneSections
    } else if (this.currentStepValue == 4) {
      this.block.settings.selectedToneContent
    }
    return this.block.settings.selectedToneTitle

  }
  selectedToneChange(event: any) {
    if (this.currentStepValue == 1) {
      this.block.settings.selectedToneTitle = event
    } else if (this.currentStepValue == 2) {
      this.block.settings.selectedToneIntroduction = event
    } else if (this.currentStepValue == 3) {
      this.block.settings.selectedToneSections = event
    } else if (this.currentStepValue == 4) {
      this.block.settings.selectedToneContent = event
    }
  }
  getShortcodes() {
    this.dbService.get('/shortcodes').subscribe((response) => {
      this.shortcodes = response.filter(
        (shortcode: any) => shortcode.section === 'pillar_section'
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
  }

  loadDefaultData() { }

  //**** PROMPT GENERATION *****/
  getTitle() {
    this.isGettingTitle = true;
    //codice per generare il prompt del titolo
    const titlePrompt = this.block.settings.promptTextTitle
      .replace('[TOPIC]', this.block.topicTitle)
      .replace('[LANGUAGE]', this.block.settings.selectedLanguageTitle)
      .replace('[STYLE]', this.block.settings.selectedStyleTitle)
      .replace('[TONE]', this.block.settings.selectedToneTitle);
    this.openAIService.getResponse(
      titlePrompt, this.block.settings.modelTitle, this.block.settings.maxTokensTitle).subscribe((response) => {
        this.titleResponse = response.message;
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
        this.isGettingIntroduction = false;
        // this.optimizeIntroduction();
      });
  }
  allSectionGen = ''
  getSections() {
    this.isGettingSections = true;
    const secionsGen: any[] = [];
    for (const row of this.block.rows) {
      const rowPrompt = this.block.settings.promptTextSections
        .replace('[TITLE]', row.title)
        .replace('[ASIN]', row.asin)
        .replace('[DETAILS]', row.details)
        .replace('[LANGUAGE]', this.block.settings.selectedLanguageSections)
        .replace('[STYLE]', this.block.settings.selectedStyleSections)
        .replace('[TONE]', this.block.settings.selectedToneSections);
      this.openAIService.getResponse(rowPrompt, this.block.settings.modelSections, this.block.settings.maxTokensSections).
        subscribe((rowResponse) => {
          secionsGen.push(rowResponse.message);
          this.allSectionGen = secionsGen.join('/n');
          this.isGettingSections = false;
          this.sectionsResponse = this.allSectionGen;
          console.log(this.sectionsResponse);
        });
    }
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
      this.isGettingContent = false;
    });
  }
  getCompleteArticle() {
    this.isGettingCompleteArticle = true;
    //codice per generare il prompt del contenuto
  }
  countWords() {
    if (this.completeArticleResponse) {
      this.wordsCount = this.completeArticleResponse.split(/\s+/).length;
    } else {
      this.wordsCount = 0;
    }
  }

  publishArticleOnWP() {
  }


  onQtyParagraphsChange(newValue: any) {
    // if (this.block.isAmazonProduct) {
    //   this.block.settings.qtyParagraph = newValue;
    // } else {
    //   this.block.settings.qtyParagraphsNoAMZ = newValue;
    // }
  }
  onModelChange(newValue: any) {
  }
  onMaxTokensChange(newValue: any) {
  }

  addShortcode() {
  }
  removeShortcode(shortcode: any) {
  }

  saveAsDefaultSettings() {
  }
  saveShortcode() {
  }
}
