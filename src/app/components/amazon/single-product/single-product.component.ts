import { WpService } from '../../../services/wp.service';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { OpenAIService } from 'src/app/services/open-ai.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { StepperOrientation } from '@angular/material/stepper';
import { BreakpointObserver } from '@angular/cdk/layout';
import Swal from 'sweetalert2';


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

  ngOnInit(): void { }
  constructor(private openAIService: OpenAIService,
    private wpService: WpService,
    private cdr: ChangeDetectorRef,
    breakpointObserver: BreakpointObserver) {
    this.stepperOrientation = breakpointObserver
      .observe('(min-width: 800px)')
      .pipe(map(({ matches }) => (matches ? 'horizontal' : 'vertical')));

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

  improveTopicTitle() {
    this.isGettingTopicTitle = true;
    const model = this.modelTopic;
    const maxTokens = this.maxTokensTopic;
    const prompt_test =
      'Migliora il contenuto di questo titolo ' +
      this.topicTitle +
      ' in ' +
      this.language +
      '. Stile: ' +
      this.writing_style +
      '. Tono: ' +
      this.writing_tone +
      '. Deve essere compreso tra 80 e 100 caratteri. Deve essere una frase completa e breve, non può contenere frasi incomplete. Deve contenere solo informazioni essenziali. Non deve contenere icone, emoji o caratteri speciali. Deve essere impersonale e deve contenere solo le informazioni essenziali.';
    this.openAIService.getResponse(prompt_test, model, maxTokens).subscribe((response) => {
      this.isGettingTopicTitle = false;
      this.topicTitle = response.message;
    },
      (error) => {
        this.isGettingTopicTitle = false;
        this.showError(error.error.message)
      }
    );
  }
  improveTopicInfo() {
    this.isGettingTopicInfo = true;
    const model = this.modelTopic;
    const maxTokens = this.maxTokensTopic;
    const prompt_test =
      'Migliora il contenuto di questo testo  ' +
      this.topicInfos +
      ' in ' +
      this.language +
      '. Stile: ' +
      this.writing_style +
      '. Tono: ' +
      this.writing_tone +
      '. Deve essere massimo 500 caratteri. Deve contenere solo informazioni essenziali e non può contenere frasi incomplete. Non deve contenere icone, emoji o caratteri speciali. Deve essere impersonale e deve essere strutturato come elenco numerato.';
    this.openAIService.getResponse(prompt_test, model, maxTokens).subscribe((response) => {
      this.isGettingTopicInfo = false;
      this.topicInfos = response.message;
    },
      (error) => {
        this.showError(error.error.message)
        this.isGettingTopicInfo = false;
      }
    );
  }
  getTitle() {
    this.isGettingTitle = true;
    const model = this.modelTitle;
    const maxTokens = this.maxTokensTitle;
    const prompt_test =
      'Scrivi un titolo per un post del blog su ' +
      this.topicTitle +
      'in ' +
      this.language +
      '. Stile: ' +
      this.writing_style +
      '. Tono: ' +
      this.writing_tone +
      '. Deve essere compreso tra 40 e 60 caratteri. Deve essere una frase completa e breve. Deve essere un titolo per la recensione di un post sul blog e deve contenere "Recensione" e deve essere avvolto da un tag <h1>. Ad esempio: <h1>Recensione del film Avengers: Endgame</h1>';
    this.openAIService.getResponse(prompt_test, model, maxTokens).subscribe((response) => {
      this.isGettingTitle = false;
      this.titleResponse = response.message;
      this.analyzeSeoTitle(this.titleResponse);
    },
      (error) => {
        this.showError(error.error.message)
        this.isGettingTitle = false;
      }
    );
  }
  async getAndOptimizeIntroduction(maxRetries: number = 2): Promise<void> {
    this.isGettingIntroduction = true;
    const model = this.modelIntroduction;
    const maxTokens = this.maxTokensIntroduction;
    const basePrompt =
      'Scrivi una introduzione per un post del blog su ' +
      this.topicTitle +
      ' ' +
      this.topicInfos +
      'in ' +
      this.language +
      '. Stile: ' +
      this.writing_style +
      '. Tono: ' +
      this.writing_tone +
      '.  Non possono esserci frasi incomplete. Deve invogliare il lettore ad approfondire l argomento e a leggere la recensione del prodotto, non deve spingere all acquisto ma dare una idea degli argomenti trattati nell articolo. Il testo deve contenere al massimo 70 parole, parla al lettore al singolare, non svelare troppe informazioni sul prodotto.';

    const someThreshold = 20; // Adjust this value based on your specific needs
    let lastIntroduction = '';
    try {
      for (let attempt = 0; attempt < maxRetries; attempt++) {
        let optimizationHints = '';

        let prompt_test = basePrompt + optimizationHints;

        let response = await this.openAIService.getResponse(prompt_test, model, maxTokens).toPromise();
        var originalIntroduction = response.message;
        lastIntroduction = originalIntroduction; //store the latest attempt

        let seoScore = this.analyzeSeoIntroduction(originalIntroduction);

        // If SEO score is satisfactory, set the introduction response and exit the function
        if (seoScore >= someThreshold) {
          this.isGettingIntroduction = false;
          this.introductionResponse = originalIntroduction;
          return;
        } else {
          optimizationHints = '';

          // Instruct the AI to include the keyword in the text
          if (!originalIntroduction.includes(this.topicKeyword)) {
            optimizationHints += ' Includi la parola chiave <strong>"' + this.topicKeyword + '"</strong> nella prima frase.';
          }

          // Change the tone to be more informal
          if (originalIntroduction.includes('Siete')) {
            optimizationHints += ' Usa un tono più informale, dando del tu al lettore.';
          }

          // Add other suggestions as needed...
        }
      }
      // If we reach this point, it means that after maxRetries attempts, the SEO score is still unsatisfactory.
      // Use the last generated introduction anyway
      this.isGettingIntroduction = false;
      this.introductionResponse = lastIntroduction;
    } catch (error: any) {
      this.showError(error.error.message)
      this.isGettingIntroduction = false;
      console.error("Used introduction with a less-than-satisfactory SEO score after " + maxRetries + " attempts.");
    }
  }
  getSections() {
    this.isGettingSections = true;
    const sections_count = 10;
    const model = this.modelSections;
    const maxTokens = this.maxTokensSections;
    const keywordInsertionRate = 0.5; // 50% degli h2 conterrà la parola chiave
    const prompt_test =
      'Genera ' +
      sections_count +
      ' titoli di sezioni per un articolo su ' +
      this.topicTitle +
      ' ' +
      this.topicInfos +
      ' in ' +
      this.language +
      '. Stile: ' +
      this.writing_style +
      '. Tono: ' +
      this.writing_tone +
      ' I primi tre titoli devono essere "Caratteristiche del prodotto", "Rapporto qualità prezzo", "Pro e contro". Dopo questi, generare ulteriori titoli di sezione a tua scelta, ognuno dei quali deve essere breve (60-80 caratteri). Alla fine di tutte le sezioni, aggiungi la sezione "Conclusioni". I titoli delle sezioni devono essere avvolti nel tag h2.' +
      `Esempio di risposta ideale:
      <h2>Caratteristiche del prodotto</h2>
      <h2>Rapporto qualità prezzo</h2>
      <h2>Pro e contro</h2>
      ...Altre sezioni...
      <h2>Conclusioni</h2>`;

    this.openAIService.getResponse(prompt_test, model, maxTokens).subscribe((response) => {
      this.isGettingSections = false;
      let sections = response.message.split('</h2>');
      sections = sections.slice(0, -1); // Rimuovi l'ultimo elemento vuoto
      const keywordSectionsCount = Math.floor((sections.length - 4) * keywordInsertionRate); // Escludi i primi tre e l'ultimo

      // Calcola l'intervallo per inserire le parole chiave in modo uniforme
      const interval = Math.floor((sections.length - 4) / keywordSectionsCount);

      // Aggiungi la parola chiave agli intervalli specificati
      for (let i = 0; i < keywordSectionsCount; i++) {
        const index = 3 + i * interval;
        sections[index] = sections[index].replace('<h2>', `<h2>${this.topicKeyword}: `);
      }
      this.analyzeSeoSections(sections);
      // Combina tutte le sezioni
      this.sectionsResponse = sections.join('</h2>') + '</h2>';
    },
      (error) => {
        this.isGettingSections = false;
        this.showError(error.error.message)

      }
    );
  }
  getContent() {
    this.isGettingContent = true;
    const paragraphs_per_section = 3;
    const model = this.modelContent;
    const maxTokens = this.maxTokensContent;
    const sections = this.sectionsResponse.split('\n').map(section => section.replace('<h2>', '').replace('</h2>', ''));
    const prompt_test =
      'Scrivi un articolo su ' +
      this.titleResponse +
      ' in ' +
      this.language +
      ' L articolo è organizzato secondo i seguenti titoli avvolti nei tag <h2></h2>: ' +
      sections.join(', ') +
      '. Ogni sezione deve avere ' +
      paragraphs_per_section +
      ' paragrafi, ognuno con contenuti unici e non ripetitivi. Ogni sezione inizia con l\'intestazione corrispondente. Per favorire la SEO, utilizza le parole chiave in modo naturale e vario, evitando il keyword stuffing.  ' +
      ' Basati sulle informazioni seguenti: ' +
      this.topicInfos +
      ' Stile: ' +
      this.writing_style +
      '. Tono: ' +
      this.writing_tone +
      ' Deve essere compreso di almeno 950 parole. Deve essere un articolo completo. Deve essere una recensione di un prodotto. Non devono esserci frasi incomplete. Non ripetere il titolo h1. Ogni sezione deve iniziare con la sua intestazione h2 corrispondente. La prima riga di ogni paragrafo deve essere diversa da quella degli altri paragrafi.';
    this.openAIService.getResponse(prompt_test, model, maxTokens).subscribe((response) => {
      this.isGettingContent = false;
      this.contentResponse = response.message;
      this.analyzeSeoContent(this.contentResponse);
    });
  }
  //METODO CON AAWP
  // getCompleteArticle() {
  //   this.isGettingCompleteArticle = true;
  //   // Divide the content into sections based on <h2> tags
  //   let contentSections = this.contentResponse.split('<h2>').map(section => section.trim());
  //   // Select a random section to insert the image (but not the first one)
  //   let randomSectionIndex = Math.floor(Math.random() * (contentSections.length - 1)) + 1;
  //   // Insert the image at the start of the random section
  //   contentSections[randomSectionIndex] = `
  //     <p>[amazon fields="${this.topicASIN}" value="thumb" image="2" image_size="large" image_align="center" image_alt="${this.topicKeyword}"] </p>
  //     <h2>${contentSections[randomSectionIndex]}</h2>
  //   `;
  //   // Reassemble the content
  //   let contentWithImage = contentSections.join('<h2>');
  //   // Assemble the complete article
  //   this.completeArticleResponse = `
  //     ${this.titleResponse}
  //     <p> [amazon fields="${this.topicASIN}" value="thumb" image="1" image_size="large" image_align="center" image_alt="${this.topicKeyword}"]</p>
  //     ${this.introductionResponse}
  //     <h3>Punti chiave:</h3>
  //     [amazon fields="${this.topicASIN}" value="description" description_length="400" image_alt="${this.topicKeyword}"]
  //     [content-egg-block template=offers_list_no_price]
  //     ${contentWithImage}
  //     <h3>Migliori Offerte inerenti a ${this.topicKeyword}:</h3>
  //     <p>[amazon bestseller="${this.topicKeyword}" items="5"/]</p>
  //   `
  //     .split('\n')
  //     .map(line => line.trim()) // Remove whitespace at the start and end of each line
  //     .filter(line => line) // Remove empty lines
  //     .join('\n');

  //   this.isGettingCompleteArticle = false;
  //   this.countWords();
  //   this.calculateTotalSeoScore();
  //   this.cdr.detectChanges();
  // }
  getCompleteArticle() {
    this.isGettingCompleteArticle = true;
    // Divide the content into sections based on <h2> tags
    let contentSections = this.contentResponse.split('<h2>').map(section => section.trim());
    // Select a random section to insert the image (but not the first one)
    let randomSectionIndex = Math.floor(Math.random() * (contentSections.length - 1)) + 1;
    // Insert the image at the start of the random section
    contentSections[randomSectionIndex] = `
      <h2>${contentSections[randomSectionIndex]}</h2>
    `;
    // Reassemble the content
    let contentWithImage = contentSections.join('<h2>');
    // Assemble the complete article
    this.completeArticleResponse = `
      ${this.titleResponse}
      <p>[content-egg-block template=customizable product="it-${this.topicASIN}" show=img]</p>
      </p>
      ${this.introductionResponse}
      [content-egg module=AmazonNoApi products="it-${this.topicASIN}" template=list_no_price]
      ${contentWithImage}
      <h3>Migliore Offerta inerente a ${this.topicKeyword}:</h3>
      <p>[content-egg module=AmazonNoApi products="it-${this.topicASIN}" template=item]</p>
    `
      .split('\n')
      .map(line => line.trim()) // Remove whitespace at the start and end of each line
      .filter(line => line) // Remove empty lines
      .join('\n');

    this.isGettingCompleteArticle = false;
    this.countWords();
    this.calculateTotalSeoScore();
    this.cdr.detectChanges();
  }
  publishArticleOnWP() {
    if (!this.isGettingCompleteArticle) {
      const cleanedContent = this.completeArticleResponse.replace(/<h1\b[^>]*>.*?<\/h1>/g, '');
      const wpUrl = localStorage.getItem('wp_wpUrl') || '';
      const status = localStorage.getItem('wp_status') || 'draft';
      const credentials = (localStorage.getItem('wp_btoa') || '').split(':');
      const username = credentials[0];
      const password = credentials[1];

      this.wpService.getToken(username, password, wpUrl)
        .subscribe((tokenResponse: any) => {
          const jwtToken = tokenResponse.token;
          this.wpService.publishPost(this.titleResponse, cleanedContent, wpUrl, status, jwtToken)
            .subscribe((response) => {
              this.showSuccess('Article published successfully!');
            },
              (error) => {
                this.showError(error.error.message);
                console.error(error);
              });
        }, (tokenError) => {
          this.showError(tokenError.error.message);
          console.error(tokenError);
        });
    }
  }

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
    let seoScore = 0;

    if (text.includes(this.topicKeyword)) {
      seoScore += 10;
    }

    if (text.startsWith('<h1>') && text.endsWith('</h1>')) {
      seoScore += 10;
    }

    if (text.length >= 40 && text.length <= 60) {
      seoScore += 10;
    }

    this.seoTitleScore = seoScore
    return this.seoTitleScore;
  }

  analyzeSeoIntroduction(text: string): number {
    let seoScore = 0;

    // Split the text into sentences
    let sentences = text.split('. ');

    // Increase the score if the keyword is in the first sentence
    if (sentences.length > 0 && sentences[0].includes(this.topicKeyword)) {
      seoScore += 10;
    }

    // Increase the score if the keyword is in bold
    if (text.includes('<strong>' + this.topicKeyword + '</strong>')) {
      seoScore += 10;
    }

    // Increase the score if the text has a certain length
    if (text.length > 70) {
      seoScore += 10;
    }

    this.seoIntroductionScore = seoScore
    return this.seoIntroductionScore
  }

  analyzeSeoSections(titles: string[]): number {
    let seoScore = 0;
    let keywordCount = 0;

    for (let title of titles) {
      if (title.includes(this.topicKeyword)) {
        seoScore += 3;
        keywordCount++;
      }
    }

    if (keywordCount > titles.length * 0.5) {
      seoScore -= 5;
    }

    this.seoSectionsScore = seoScore
    return this.seoSectionsScore;
  }

  analyzeSeoContent(text: string): number {
    let seoScore = 0;

    // Check if the text is between 700 and 900 words.
    const wordCount = text.split(' ').length;
    if (wordCount >= 700 && wordCount <= 900) {
      seoScore += 10;
    }

    // Check if the text does not contain incomplete sentences.
    if (text.endsWith('.') || text.endsWith('!') || text.endsWith('?')) {
      seoScore += 10;
    }

    // Check if every section starts with the corresponding <h2> heading.
    const sections = this.sectionsResponse.split('\n').map(section => section.replace('<h2>', '').replace('</h2>', ''));
    for (const section of sections) {
      if (text.includes('<h2>' + section + '</h2>')) {
        seoScore += 5;
      }
    }

    // Check if the text does not repeat the <h1> title.
    if (!text.includes(this.titleResponse)) {
      seoScore += 10;
    }

    // Check if the first line of each paragraph is different.
    const paragraphs = text.split('\n');
    const firstLines = paragraphs.map(p => p.split('. ')[0]);
    if (new Set(firstLines).size === firstLines.length) {
      seoScore += 5;
    }

    this.seoContentScore = seoScore
    return this.seoContentScore;
  }

  calculateTotalSeoScore(): number {
    const titleWeight = 0.3;
    const introductionWeight = 0.3;
    const sectionsWeight = 0.2;
    const contentWeight = 0.2;

    const totalMaxScore = (this.maxTitleScore * titleWeight) +
      (this.maxIntroductionScore * introductionWeight) +
      (this.maxSectionsScore * sectionsWeight) +
      (this.maxContentScore * contentWeight);

    const totalScore = (this.seoTitleScore * titleWeight) +
      (this.seoIntroductionScore * introductionWeight) +
      (this.seoSectionsScore * sectionsWeight) +
      (this.seoContentScore * contentWeight);

    this.totalSeoScore = (totalScore / totalMaxScore) * 100;

    return this.totalSeoScore;
  }

}
