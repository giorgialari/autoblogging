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

  ngOnInit(): void { }
  constructor(private openAIService: OpenAIService,
    private wpService: WpService,
    private cdr: ChangeDetectorRef,
    private notificationService: NotificationService) { }
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

  async improveTopicTitle() {
    this.isGettingTopicTitle = true;
    const model = this.modelTitle;
    const maxTokens = this.maxTokensTitle
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
      const response = await this.openAIService.getResponse(prompt_test, model, maxTokens).toPromise();
      this.isGettingTopicTitle = false;
      this.topicTitle = response.message;
    } catch (error: any) {
      this.isGettingTopicTitle = false;
      this.showError(error.error.message)
      console.error('There was an error getting the topic title:', error);
    }
  }
  async improveTopicInfo() {
    this.isGettingTopicInfo = true;
    const model = this.modelTitle;
    const maxTokens = this.maxTokensTitle
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
      const response = await this.openAIService.getResponse(prompt_test, model, maxTokens).toPromise();
      this.isGettingTopicInfo = false;
      this.topicInfos = response.message;
    } catch (error: any) {
      this.isGettingTopicInfo = false;
      console.error('There was an error getting the topic information:', error);
      this.showError(error.error.message)
    }
  }
  async getTitle() {
    this.isGettingTitle = true;

    const model = this.modelTitle;
    const maxTokens = this.maxTokensTitle
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
      const response = await this.openAIService.getResponse(prompt_test, model, maxTokens).toPromise();
      this.isGettingTitle = false;
      this.titleResponse = response.message;
      this.analyzeSeoTitle(this.titleResponse);
    } catch (error: any) {
      this.isGettingTitle = false;
      console.error('There was an error getting the title:', error);
      this.showError(error.error.message)
      this.hasError = true;
      throw new Error('Failed to get title');

    }
  }
  async getAndOptimizeIntroduction(maxRetries: number = 2): Promise<void> {
    this.isGettingIntroduction = true;
    const model = this.modelIntroduction;
    const maxTokens = this.maxTokensIntroduction
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
    }
    catch (error: any) {
      this.isGettingIntroduction = false;
      console.error("Used introduction with a less-than-satisfactory SEO score after " + maxRetries + " attempts.");
      this.showError(error.error.message)
      throw new Error('Failed to get title');
      this.hasError = true;
    }
  }
  async getSections() {
    this.isGettingSections = true;
    const model = this.modelSections;
    const maxTokens = this.maxTokensSections
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
      const response = await this.openAIService.getResponse(prompt_test, model, maxTokens).toPromise();
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
      alert('Errore: Qualcosa è andato storto. Verifica di aver inserito l\'apiKey nelle impostazioni.');
      this.hasError = true;
      throw new Error('Failed to get title');

    }
  }
  async getContent() {
    this.isGettingContent = true;
    const paragraphs_per_section = 3;
    const model = this.modelContent;
    const maxTokens = this.maxTokensContent
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
      ` paragrafi, ognuno con contenuti unici e non ripetitivi. Ogni sezione inizia con l'intestazione corrispondente.
      Per favorire la SEO, utilizza le parole chiave in modo naturale e vario, evitando il keyword stuffing.   ` +
      ' Basati sulle informazioni seguenti: ' +
      this.topicInfos +
      ' Stile: ' +
      this.writing_style +
      '. Tono: ' +
      this.writing_tone +
      ` Deve essere almeno di 1000 parole. Deve essere un articolo completo.
      Deve essere una recensione di un prodotto. Non devono esserci frasi incomplete.
      Non ripetere il titolo h1.
      Ogni sezione deve iniziare con la sua sezione h2 corrispondente, usa tutte le sezioni citate sopra.
      La prima riga di ogni paragrafo deve essere diversa da quella degli altri paragrafi.
      Ogni articolo deve avere il suo paragrafo di conclusione. Ogni paragrafo deve essere concluso
      e non deve essere incompleto.`;;

    try {
      const response = await this.openAIService.getResponse(prompt_test, model, maxTokens).toPromise();
      this.isGettingContent = false;
      this.contentResponse = response.message;
      this.analyzeSeoContent(this.contentResponse);
      this.getCompleteArticle();
    } catch (error) {
      this.isGettingContent = false;
      console.error('There was an error getting the content:', error);
      alert('Errore: Qualcosa è andato storto. Verifica di aver inserito l\'apiKey nelle impostazioni.');
      this.hasError = true;
      throw new Error('Failed to get title');
    }
  }
  getCompleteArticle() {
    this.isGettingCompleteArticle = true;
    this.statusMessage = ' Sto componendo l\'articolo';

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
    this.publishArticleOnWP();
  }
  async publishArticleOnWP() {
    if (!this.isGettingCompleteArticle) {
      // Rimuovi completamente i tag <h1> e il loro contenuto
      const cleanedContent = this.completeArticleResponse.replace(/<h1\b[^>]*>.*?<\/h1>/g, '');
      const wpUrl = localStorage.getItem('wp_wpUrl') || '';
      const status = localStorage.getItem('wp_status') || 'draft';
      const btoa = localStorage.getItem('wp_btoa') || '';

      const credentials = (btoa || '').split(':');
      const username = credentials[0];
      const password = credentials[1];

      try {
        // Ottieni il token prima
        const tokenResponse = await this.wpService.getToken(username, password, wpUrl).toPromise() as TokenResponse;
        const jwtToken = tokenResponse.token;


        // Ora pubblica il post con il token
        await this.wpService.publishPost(this.titleResponse, cleanedContent, wpUrl, status, jwtToken).toPromise();

        this.statusMessage = 'Articolo pubblicato con successo!';
      } catch (error) {
        console.error('There was an error publishing the article:', error);
        this.hasError = true;
        throw new Error('Failed to get title');
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
      window.location.reload();
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
      console.error(e.message);
      this.formatExcelNotValidMessage = e.message;
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


}
interface TokenResponse {
  token: string;
}
