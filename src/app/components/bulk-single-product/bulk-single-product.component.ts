import { WpService } from './../../services/wp.service';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { OpenAIService } from 'src/app/services/open-ai.service';
import { FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-bulk-single-product',
  templateUrl: './bulk-single-product.component.html',
  styleUrls: ['./bulk-single-product.component.scss']
})
export class BulkSingleProductComponent {
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
  firstFormGroup = this._formBuilder.group({
    firstCtrl: ['', Validators.required],
  });
  secondFormGroup = this._formBuilder.group({
    secondCtrl: ['', Validators.required],
  });
  isLinear = false;
  ngOnInit(): void { }
  constructor(private openAIService: OpenAIService,
    private wpService: WpService,
    private _formBuilder: FormBuilder,
    private cdr: ChangeDetectorRef) { }

  async improveTopicTitle() {
    this.isGettingTopicTitle = true;
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

    try {
      const response = await this.openAIService.getResponse(prompt_test).toPromise();
      this.isGettingTopicTitle = false;
      console.log(response);
      this.topicTitle = response.message;
    } catch (error) {
      this.isGettingTopicTitle = false;
      console.error('There was an error getting the topic title:', error);
    }
  }
  async improveTopicInfo() {
    this.isGettingTopicInfo = true;
    const prompt_test =
      'Migliora il contenuto di questo testo ' +
      this.topicInfos +
      ' in ' +
      this.language +
      '. Stile: ' +
      this.writing_style +
      '. Tono: ' +
      this.writing_tone +
      '. Deve essere massimo 500 caratteri. Deve contenere solo informazioni essenziali e non può contenere frasi incomplete. Non deve contenere icone, emoji o caratteri speciali. Deve essere impersonale e deve essere strutturato come elenco numerato.';

    try {
      const response = await this.openAIService.getResponse(prompt_test).toPromise();
      this.isGettingTopicInfo = false;
      console.log(response);
      this.topicInfos = response.message;
    } catch (error) {
      this.isGettingTopicInfo = false;
      console.error('There was an error getting the topic information:', error);
    }
  }
  async getTitle() {
    this.isGettingTitle = true;
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

    try {
      const response = await this.openAIService.getResponse(prompt_test).toPromise();
      this.isGettingTitle = false;
      this.titleResponse = response.message;
      this.analyzeSeoTitle(this.titleResponse);
    } catch (error) {
      this.isGettingTitle = false;
      console.error('There was an error getting the title:', error);
    }
  }
  async getAndOptimizeIntroduction(maxRetries: number = 2): Promise<void> {
    this.isGettingIntroduction = true;
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

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      let optimizationHints = '';

      let prompt_test = basePrompt + optimizationHints;

      let response = await this.openAIService.getResponse(prompt_test).toPromise();
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
    console.error("Used introduction with a less-than-satisfactory SEO score after " + maxRetries + " attempts.");
  }
  async getSections() {
    this.isGettingSections = true;
    const sections_count = 10;
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

    try {
      const response = await this.openAIService.getResponse(prompt_test).toPromise();
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
    } catch (error) {
      this.isGettingSections = false;
      console.error('There was an error getting the sections:', error);
    }
  }
  async getContent() {
    this.isGettingContent = true;
    const paragraphs_per_section = 3;
    const sections = this.sectionsResponse.split('\n').map(section => section.replace('<h2>', '').replace('</h2>', ''));
    const prompt_test =
      'Scrivi un articolo su ' +
      this.titleResponse +
      ' in ' +
      this.language +
      ' L\'articolo è organizzato secondo i seguenti titoli avvolti nei tag <h2></h2>: ' +
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
      ' Deve essere compreso tra 700 e 900 parole. Deve essere un articolo completo. Deve essere una recensione di un prodotto. Non devono esserci frasi incomplete. Non ripetere il titolo h1. Ogni sezione deve iniziare con la sua intestazione h2 corrispondente. La prima riga di ogni paragrafo deve essere diversa da quella degli altri paragrafi.';

    try {
      const response = await this.openAIService.getResponse(prompt_test).toPromise();
      this.isGettingContent = false;
      this.contentResponse = response.message;
      this.analyzeSeoContent(this.contentResponse);
    } catch (error) {
      this.isGettingContent = false;
      console.error('There was an error getting the content:', error);
    }
  }
  getCompleteArticle() {
    this.isGettingCompleteArticle = true;

    // Divide the content into sections based on <h2> tags
    let contentSections = this.contentResponse.split('<h2>').map(section => section.trim());

    // Select a random section to insert the image (but not the first one)
    let randomSectionIndex = Math.floor(Math.random() * (contentSections.length - 1)) + 1;

    // Insert the image at the start of the random section
    contentSections[randomSectionIndex] = `
    [amazon fields="${this.topicASIN}" value="thumb" image="1" image_size="large" image_align="center"]
      <h2>${contentSections[randomSectionIndex]}</h2>
    `;

    // Reassemble the content
    let contentWithImage = contentSections.join('<h2>');

    // Assemble the complete article
    this.completeArticleResponse = `
    ${this.titleResponse}
    [amazon fields="${this.topicASIN}" value="thumb" image="2" image_size="large" image_align="center"]
    ${this.introductionResponse}
    <h3>Punti chiave:</h3>
    [amazon fields="${this.topicASIN}" value="description" description_length="400"]
    [content-egg-block template=offers_list_no_price]
    ${contentWithImage}
    <h3>Migliori Offerte inerenti a ${this.topicKeyword}:</h3>
    [amazon bestseller="${this.topicKeyword}" items="5"/]
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
  async publishArticleOnWP() {
    if (!this.isGettingCompleteArticle) {
      // Rimuovi completamente i tag <h1> e il loro contenuto
      const cleanedContent = this.completeArticleResponse.replace(/<h1\b[^>]*>.*?<\/h1>/g, '');

      try {
        await this.wpService.publishPost(this.titleResponse, cleanedContent).toPromise();
        alert('Articolo pubblicato con successo!');
      } catch (error) {
        console.error('There was an error publishing the article:', error);
      }
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

  //*** PROCESS ALL  ******//
  listProducts: any;
  async processAll() {
    const products = JSON.parse(this.listProducts);
    for (const item of products) {
      // Assigning the properties to your class or object's instance variables
      this.topicTitle = item.product_title;
      this.topicInfos = item.product_infos.map((info: { product_infos: any; }) => info.product_infos).join(' ');
      this.topicASIN = item.product_asin;
      this.topicKeyword = item.product_title;

      // Call the functions in the required order
      await this.improveTopicTitle();
      await this.improveTopicInfo();
      await this.getTitle();
      await this.getAndOptimizeIntroduction();
      await this.getSections();
      await this.getContent();
      await this.getCompleteArticle();

      // If you want to publish the article on WordPress, you can call the function here
      await this.publishArticleOnWP();
    }
  }
}
