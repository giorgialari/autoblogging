import { Component, HostListener } from '@angular/core';
import { from } from 'rxjs';
import { DbService } from 'src/app/services/db.service';
import { OpenAIService } from 'src/app/services/open-ai.service';
import { WpService } from 'src/app/services/wp.service';
import { FunctionsService } from 'src/app/utils/functions/amazon/functions.service';
import Swal from 'sweetalert2';
import { saveAs } from 'file-saver';
@Component({
  selector: 'app-bulk-pillar-articles',
  templateUrl: './bulk-pillar-articles.component.html',
  styleUrls: ['./bulk-pillar-articles.component.scss']
})
export class BulkPillarArticlesComponent {
  showInfo: boolean = false;
  isProcessing = false;
  blocks = [
    {
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
        // Impostazioni Prompt
        selectedLanguage: 'italiano',
        selectedStyle: 'article',
        selectedTone: 'formal',

        // Impostazioni Titolo
        modelTitle: 'gpt-3.5-turbo',
        maxTokensTitle: 150,
        promptTextTitle: 'Guida all\'acquisto di aspirapolveri nel 2023',

        // Impostazioni Introduzione
        modelIntroduction: 'gpt-3.5-turbo',
        maxTokensIntroduction: 200,
        promptTextIntroduction: 'Introduzione alle migliori opzioni di aspirapolveri disponibili nel mercato.',
        // Impostazioni Sezioni
        qtyParagraphs: 2,
        modelSections: 'gpt-3.5-turbo',
        maxTokensSections: 300,
        promptTextSections: 'Caratteristiche salienti e differenze tra Dyson V11 e Roomba i7.',

        //Impostazioni Sezioni senza Amazon
        qtyParagraphsNoAMZ: 2,
        modelSectionsNoAMZ: 'gpt-3.5-turbo',
        maxTokensSectionsNoAMZ: 300,
        promptTextSectionsNoAMZ: 'Caratteristiche salienti e differenze tra Dyson V11 e Roomba i7.',

        // Impostazioni Contenuto
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
    // {
    //   topicTitle: 'Aspirapolveri 2',
    //   isAmazonProduct: true,
    //   rows: [
    //     {
    //       asin: 'B07GH89JZD',
    //       title: 'Dyson V11',
    //       details: 'Aspirapolvere potente con batteria a lunga durata.'
    //     },
    //     {
    //       asin: 'B081QNXFSF',
    //       title: 'Roomba i7',
    //       details: 'Robot aspirapolvere programmabile e con stazione di svuotamento.'
    //     }
    //   ],
    //   settings: {
    //     // Impostazioni Prompt
    //     selectedLanguage: 'italiano',
    //     selectedStyle: 'article',
    //     selectedTone: 'formal',

    //     // Impostazioni Titolo
    //     modelTitle: 'gpt-3.5-turbo',
    //     maxTokensTitle: 150,
    //     promptTextTitle: 'Guida all\'acquisto di aspirapolveri nel 2023',

    //     // Impostazioni Introduzione
    //     modelIntroduction: 'gpt-3.5-turbo',
    //     maxTokensIntroduction: 200,
    //     promptTextIntroduction: 'Introduzione alle migliori opzioni di aspirapolveri disponibili nel mercato.',

    //     // Impostazioni Sezioni
    //     qtyParagraphs: 2,
    //     modelSections: 'gpt-3.5-turbo',
    //     maxTokensSections: 300,
    //     promptTextSections: 'Caratteristiche salienti e differenze tra Dyson V11 e Roomba i7.',

    //     // Impostazioni sezioni senza prodotto Amazon
    //     qtyParagraphsNoAMZ: 2,
    //     modelSectionsNoAMZ: 'gpt-3.5-turbo',
    //     maxTokensSectionsNoAMZ: 300,
    //     promptTextSectionsNoAMZ: 'Caratteristiche salienti e differenze tra Dyson V11 e Roomba i7.',

    //     // Impostazioni Contenuto
    //     modelContent: 'gpt-3.5-turbo',
    //     maxTokensContent: 500,
    //     promptTextContent: 'Dettagli sul funzionamento, manutenzione e suggerimenti per l\'utilizzo ottimale degli aspirapolveri.',

    //     // Impostazioni Shortcode
    //     shortcodes: [
    //       {
    //         code: '[ScontoSpeciale]',
    //         position: 'afterThirdH2'
    //       },
    //       {
    //         code: '[PromozioneEstiva]',
    //         position: 'beginningOfArticle'
    //       }
    //     ]
    //   }
    // }
  ];

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
      section: "pillar_section"
    }
  ];
  defaultSettings = {
    selectedLanguage: '',
    selectedStyle: '',
    selectedTone: '',
    modelTitle: '',
    maxTokensTitle: 0,
    promptTextTitle: '',
    modelIntroduction: '',
    maxTokensIntroduction: 0,
    promptTextIntroduction: '',
    qtyParagraphs: 1,
    modelSections: '',
    maxTokensSections: 0,
    promptTextSections: '',

    qtyParagraphsNoAMZ: 1,
    modelSectionsNoAMZ: '',
    maxTokensSectionsNoAMZ: 0,
    promptTextSectionsNoAMZ: '',

    modelContent: '',
    maxTokensContent: 0,
    promptTextContent: '',
    shortcodes: []
  };
  selectedBlock: any = {
    topicTitle: '',
    isAmazonProduct: false,
    rows: [],
    settings: this.defaultSettings
  };
  showOverlay: boolean = false;
  currentArticleNumber: number = 0;
  statusMessage = '';

  isDownload: boolean = false;
  isPublish: boolean = false;
  saveOrPublish() {
    Swal.fire({
      title: 'Do you want to save or publish on WP?',
      showDenyButton: true,
      showCancelButton: false,
      confirmButtonText: 'Save on PC',
      denyButtonText: `Publish on WP`,
      denyButtonColor: 'lightblue',
    }).then((result) => {
      /* Read more about isConfirmed, isDenied below */
      if (result.isConfirmed) {
        // Swal.fire('Saved!', '', 'success')
        this.isDownload = true;
        this.isPublish = false;
        this.generateMultipleArticles()
      } else if (result.isDenied) {
        // Swal.fire('Changes are not saved', '', 'info')
        this.isPublish = true;
        this.isDownload = false;
        this.generateMultipleArticles()
      }
    })
  }
  @HostListener('window:beforeunload', ['$event'])
  unloadNotification($event: any): void {
    $event.returnValue = '';
  }

  constructor(private openAIService: OpenAIService,
    private dbService: DbService,
    private functionService: FunctionsService,
    private wpService: WpService) {
    this.getModels();
    this.getLanguages();
    this.getStyles();
    this.getTones();
    this.getPromptSection();
    this.getShortcodes();
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
    this.dbService.get('/prompt_bulk_pillar_section').subscribe((response) => {
      this.prompt = response;
      this.setDefaultSettings(this.prompt);
    }, (error) => {
      console.log(error);
    });
  }

  setDefaultSettings(promptData: any) {
    promptData.forEach((data: { name: any; language: string; style: string; tone: string; model: string; max_tokens: number; default_prompt: string; qtyParagraph: number; }) => {
      switch (data.name) {
        case 'title':
          this.defaultSettings.selectedLanguage = data.language;
          this.defaultSettings.selectedStyle = data.style;
          this.defaultSettings.selectedTone = data.tone;
          this.defaultSettings.modelTitle = data.model;
          this.defaultSettings.maxTokensTitle = data.max_tokens;
          this.defaultSettings.promptTextTitle = data.default_prompt;
          break;
        case 'introduction':
          this.defaultSettings.modelIntroduction = data.model;
          this.defaultSettings.maxTokensIntroduction = data.max_tokens;
          this.defaultSettings.promptTextIntroduction = data.default_prompt;
          break;
        case 'sections':
          this.defaultSettings.qtyParagraphs = data.qtyParagraph;
          this.defaultSettings.modelSections = data.model;
          this.defaultSettings.maxTokensSections = data.max_tokens;
          this.defaultSettings.promptTextSections = data.default_prompt;
          break;
        case 'sectionNoAmz':
          this.defaultSettings.qtyParagraphsNoAMZ = data.qtyParagraph;
          this.defaultSettings.modelSectionsNoAMZ = data.model;
          this.defaultSettings.maxTokensSectionsNoAMZ = data.max_tokens;
          this.defaultSettings.promptTextSectionsNoAMZ = data.default_prompt;
          break;
        case 'content':
          this.defaultSettings.modelContent = data.model;
          this.defaultSettings.maxTokensContent = data.max_tokens;
          this.defaultSettings.promptTextContent = data.default_prompt;
          break;
      }
    });
    this.blocks.forEach((block: any) => {
      block.settings = { ...this.defaultSettings };
    });
  }

  getShortcodes() {
    this.dbService.get('/shortcodes').subscribe((response) => {
      this.shortcodes = response.filter((item: any) => item.section === 'pillar_bulk_section');
    }, (error) => {
      console.log(error);
    });
  }
  //**** ###END### DB CONNECTION *****/
  addBlock() {
    this.blocks.push({
      topicTitle: '',
      isAmazonProduct: false,
      rows: [
        {
          asin: '',
          title: '',
          details: '',
        }
      ],
      settings: { ...this.defaultSettings }
    });
  }

  removeBlock(index: number) {
    if (confirm("Are you sure to delete this block?")) {
      this.blocks.splice(index, 1);
    }
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

  async generateSequentially(): Promise<string[]> {
    this.isProcessing = true;
    this.showOverlay = true;
    const articles = [];

    for (const block of this.blocks) {
      let article = ''; // Un singolo articolo che verrà costruito blocco per blocco
      this.currentArticleNumber = this.blocks.indexOf(block) + 1;
      // 1. Creazione del titolo della guida
      this.statusMessage = `Generating title for ${block.topicTitle}...`;
      const titlePrompt = block.settings.promptTextTitle
        .replace('[TOPIC]', block.topicTitle)
        .replace('[LANGUAGE]', block.settings.selectedLanguage)
        .replace('[STYLE]', block.settings.selectedStyle)
        .replace('[TONE]', block.settings.selectedTone);
      const titleResponse = await this.openAIService.getResponse(titlePrompt, block.settings.modelTitle, block.settings.maxTokensTitle).toPromise();
      article += `<h1>${titleResponse.message}</h1>\n\n`;


      // 2. Creazione dell'introduzione alla guida
      this.statusMessage = `Generating introduction for ${block.topicTitle}...`;
      const introductionPrompt = block.settings.promptTextIntroduction
        .replace('[TOPIC]', block.topicTitle)
        .replace('[LANGUAGE]', block.settings.selectedLanguage)
        .replace('[STYLE]', block.settings.selectedStyle)
        .replace('[TONE]', block.settings.selectedTone);
      const introductionResponse = await this.openAIService.getResponse(introductionPrompt, block.settings.modelIntroduction, block.settings.maxTokensIntroduction).toPromise();
      article += `${introductionResponse.message}\n\n`;

      // 3. Creazione delle sezioni con le descrizioni dei prodotti
      this.statusMessage = `Generating sections for ${block.topicTitle}...`;
      const secionsGen = [];
      for (const row of block.rows) {
        const rowPromptBase = block.isAmazonProduct
          ? block.settings.promptTextSections
          : block.settings.promptTextSectionsNoAMZ;
        const rowPrompt = rowPromptBase
          .replace('[TITLE]', row.title)
          .replace('[ASIN]', row.asin)
          .replace('[DETAILS]', row.details)
          .replace('[LANGUAGE]', block.settings.selectedLanguage)
          .replace('[STYLE]', block.settings.selectedStyle)
          .replace('[TONE]', block.settings.selectedTone);
        const rowResponseModel = block.isAmazonProduct ? block.settings.modelSections : block.settings.modelContent;
        const rowResponseMaxTokens = block.isAmazonProduct ? block.settings.maxTokensSections : block.settings.maxTokensContent;
        const rowResponse = await this.openAIService.getResponse(rowPrompt, rowResponseModel, rowResponseMaxTokens).toPromise();
        secionsGen.push(rowResponse.message);
        article += `<h2>${row.title}</h2>\n${rowResponse.message}\n\n`;
      }
      // 4. Creazione delle conclusioni e consigli su come scegliere e utilizzare i prodotti
      this.statusMessage = `Generating content for ${block.topicTitle}...`;
      const contentPromptBase = block.settings.promptTextContent;
      const allSectionGen = secionsGen.join('\n\n');
      const contentPrompt = contentPromptBase
        .replace('[TOPIC]', block.topicTitle)
        .replace('[LANGUAGE]', block.settings.selectedLanguage)
        .replace('[STYLE]', block.settings.selectedStyle)
        .replace('[TONE]', block.settings.selectedTone)
        .replace('[SECTIONS_GENERATED]', allSectionGen)
      const contentResponse = await this.openAIService.getResponse(contentPrompt, block.settings.modelContent, block.settings.maxTokensContent).toPromise();
      article += `${contentResponse.message}`;

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

      let wrappedIntroduction = introductionResponse.message;
      const mergeSectionsContent = allSectionGen + contentResponse.message;
      let wrappedContent =  this.functionService.wrapParagraphsWithPTags(mergeSectionsContent);
      this.shortcodes.forEach(shortcode => {
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

      let completeArticleResponse = "<h1>" + titleResponse.message + "</h1>" + wrappedIntroduction + wrappedContent;
      articles.push(completeArticleResponse);

      if (this.isPublish) {
        await this.functionService.publishArticleOnWP(
          false,
          completeArticleResponse,
          titleResponse.message,
          this.wpService);
      } else if (this.isDownload) {
        this.downloadAsTxt(completeArticleResponse);
      }

    }

    return articles;
  }


  generateMultipleArticles(): void {
    from(this.generateSequentially())
      .subscribe(allArticles => {
        this.isProcessing = false;
        this.showOverlay = false;
      });
  }

  downloadAsTxt(article: string) {
    const blob = new Blob([article], { type: 'text/plain;charset=utf-8' });
    saveAs(blob, 'articolo.txt');
  }

  stopRequest() {
    this.openAIService.abortRequests();
    this.isProcessing = false;
    this.showOverlay = false;
  }
  openModal(block: any) {
    this.selectedBlock = block;
  }

  onModelChange(newValue: any) {
    if (this.selectedBlock.isAmazonProduct) {
      this.selectedBlock.settings.modelSections = newValue;
    } else {
      this.selectedBlock.settings.modelSectionsNoAMZ = newValue;
    }
  }
  onMaxTokensChange(newValue: any) {
    if (this.selectedBlock.isAmazonProduct) {
      this.selectedBlock.settings.maxTokensSections = newValue;
    } else {
      this.selectedBlock.settings.maxTokensSectionsNoAMZ = newValue;
    }
  }
  saveAsDefaultSettings() {
    if (confirm("Are you sure to save these settings as default? These settings will be used for all blocks.")) {
      const settings = this.selectedBlock.settings;

      const prompt_settings = [
        {
          model: settings.modelTitle,
          max_tokens: settings.maxTokensTitle,
          default_prompt: settings.promptTextTitle,
          qtyParagraph: null,
          language: settings.selectedLanguage,
          style: settings.selectedStyle,
          tone: settings.selectedTone,
          name: 'title'
        },
        {
          model: settings.modelIntroduction,
          max_tokens: settings.maxTokensIntroduction,
          default_prompt: settings.promptTextIntroduction,
          qtyParagraph: null,
          language: settings.selectedLanguage,
          style: settings.selectedStyle,
          tone: settings.selectedTone,
          name: 'introduction'
        },
        {
          model: settings.modelSections,
          max_tokens: settings.maxTokensSections,
          default_prompt: settings.promptTextSections,
          qtyParagraph: settings.qtyParagraphs,
          language: settings.selectedLanguage,
          style: settings.selectedStyle,
          tone: settings.selectedTone,
          name: 'sections'
        },
        {
          model: settings.modelSectionsNoAMZ,
          max_tokens: settings.maxTokensSectionsNoAMZ,
          default_prompt: settings.promptTextSectionsNoAMZ,
          qtyParagraph: settings.qtyParagraphsNoAMZ,
          language: settings.selectedLanguage,
          style: settings.selectedStyle,
          tone: settings.selectedTone,
          name: 'sectionNoAmz'
        },
        {
          model: settings.modelContent,
          max_tokens: settings.maxTokensContent,
          default_prompt: settings.promptTextContent,
          qtyParagraph: null,
          language: settings.selectedLanguage,
          style: settings.selectedStyle,
          tone: settings.selectedTone,
          name: 'content'
        }
      ]

      this.dbService.put('/prompt_bulk_pillar_section', prompt_settings).subscribe((response) => {
        this.getPromptSection(); // Ricarica le impostazioni predefinite
      }, (error) => {
        console.log(error);
      });
    }
  }


  addShortcode() {
    this.saveShortcode();
    const newShortcode = { code: '', position: '', section: 'pillar_bulk_section' };
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
