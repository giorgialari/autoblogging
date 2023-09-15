import { Component } from '@angular/core';
import { forkJoin, from, switchMap } from 'rxjs';
import { DbService } from 'src/app/services/db.service';
import { OpenAIService } from 'src/app/services/open-ai.service';

@Component({
  selector: 'app-pillar',
  templateUrl: './pillar.component.html',
  styleUrls: ['./pillar.component.scss']
})
export class PillarComponent {
  isProcessing = false;
  blocks = [
    {
      topicTitle: 'Aspirapolveri',
      isAmazonProduct: true,
      rows: [
        {
          asin: 'B07GH89JZD',
          productTitle: 'Dyson V11',
          productInfo: 'Aspirapolvere potente con batteria a lunga durata.'
        },
        {
          asin: 'B081QNXFSF',
          productTitle: 'Roomba i7',
          productInfo: 'Robot aspirapolvere programmabile e con stazione di svuotamento.'
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
  ];
  settings: any = {};
  selectedBlock: any = {};
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
    modelContent: '',
    maxTokensContent: 0,
    promptTextContent: '',
    shortcodes: []
  };

  constructor(private openAIService: OpenAIService,  private dbService: DbService) {
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
    this.dbService.get('/prompt_pillar_section').subscribe((response) => {
      this.prompt = response;
      this.setDefaultSettings(this.prompt);
    }, (error) => {
      console.log(error);
    });
  }

  setDefaultSettings(promptData: any) {
    promptData.forEach((data: { name: any; language: string; style: string; tone: string; model: string; max_tokens: number; default_prompt: string; qtyParagraph: number; }) => {
      switch(data.name) {
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
        case 'content':
          this.defaultSettings.modelContent = data.model;
          this.defaultSettings.maxTokensContent = data.max_tokens;
          this.defaultSettings.promptTextContent = data.default_prompt;
          break;
      }
    });
  }

  getShortcodes() {
    this.dbService.get('/shortcodes').subscribe((response) => {
      this.shortcodes = response.filter((item: any) => item.section === 'pillar_section');
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
          productTitle: '',
          productInfo: '',
        }
      ],
      settings: {...this.defaultSettings}
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
      productTitle: '',
      productInfo: ''
    });
  }

  removeRow(block: any, rowIndex: any) {
    if (confirm("Are you sure to delete this row?")) {
      block.rows.splice(rowIndex, 1);
    }
  }

  //TODO - METODO DA SISTEMAERE
  async generateSequentially(): Promise<string[]> {
    this.isProcessing = true;
    const articles = [];

    for (const block of this.blocks) {
      let article = ''; // Un singolo articolo che verrà costruito blocco per blocco

      const titlePrompt = `Crea un titolo e un'introduzione per una guida all'acquisto su ${block.topicTitle}.`;
      const titleResponse = await this.openAIService.getResponse(titlePrompt, 'gpt-3.5-turbo', 150).toPromise();
      article += titleResponse.message + '\n\n';  // Aggiungi la risposta al contenuto dell'articolo

      for (const product of block.rows) {
        const productPrompt = block.isAmazonProduct
          ? `Scrivi una breve recensione di circa 100-150 parole su ${product.productTitle} con l'ASIN ${product.asin}. Dettagli: ${product.productInfo}.`
          : `Scrivi una breve recensione di circa 100-150 parole su ${product.productTitle}. Dettagli: ${product.productInfo}.`;
        const productResponse = await this.openAIService.getResponse(productPrompt, 'gpt-3.5-turbo', 150).toPromise();
        article += productResponse.message + '\n\n';  // Aggiungi la risposta al contenuto dell'articolo
      }

      const sectionsPrompt = `Spiega quale prodotto scegliere tra i prodotti menzionati nel blocco ${block.topicTitle}, come utilizzarli al meglio e le conclusioni.`;
      const sectionsResponse = await this.openAIService.getResponse(sectionsPrompt, 'gpt-3.5-turbo', 450).toPromise();
      article += sectionsResponse.message;  // Aggiungi la risposta al contenuto dell'articolo

      articles.push(article);  // Aggiungi l'articolo completato all'array degli articoli
    }

    return articles;
  }

  generateMultipleArticles(): void {
    from(this.generateSequentially())
      .subscribe(allArticles => {
        this.isProcessing = false;
        // Qui, `allArticles` conterrà tutti gli articoli generati in ordine sequenziale
        console.log('Tutti gli articoli:', allArticles);
      });
  }

  stopRequest() {
    this.openAIService.abortRequests();
    this.isProcessing = false;
  }
  openModal(block:any) {
    this.selectedBlock = block;
    this.settings = {...block.settings};
  }

  saveForThisArticle(){
    this.selectedBlock.settings = this.settings;
  }

  saveSettings() {
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

    this.dbService.put('/prompt_pillar_section', prompt_settings).subscribe((response) => {
      console.log(response);
      this.getPromptSection(); // Ricarica le impostazioni predefinite
    }, (error) => {
      console.log(error);
    });
  }


  addShortcode() {
    this.saveShortcode();
    const newShortcode = { code: '', position: '', section: 'pillar_section' };
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
