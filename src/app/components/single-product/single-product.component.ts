import { WpService } from './../../services/wp.service';
import { Component, OnInit } from '@angular/core';
import { OpenAIService } from 'src/app/services/open-ai.service';
import { FormBuilder, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

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
  firstFormGroup = this._formBuilder.group({
    firstCtrl: ['', Validators.required],
  });
  secondFormGroup = this._formBuilder.group({
    secondCtrl: ['', Validators.required],
  });
  isLinear = false;
  ngOnInit(): void {

  }
  constructor(private openAIService: OpenAIService, private wpService: WpService, private _formBuilder: FormBuilder) { }

  improveTopicTitle() {
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
    this.openAIService.getResponse(prompt_test).subscribe((response) => {
      this.isGettingTopicTitle = false;
      console.log(response);
      this.topicTitle = response.message;
    });
  }

  improveTopicInfo() {
    this.isGettingTopicInfo = true;
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
    this.openAIService.getResponse(prompt_test).subscribe((response) => {
      this.isGettingTopicInfo = false;
      console.log(response);
      this.topicInfos = response.message;
    });
  }
  getTitle() {
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
    this.openAIService.getResponse(prompt_test).subscribe((response) => {
      this.isGettingTitle = false;
      this.titleResponse = response.message;
    });
  }
  // getIntroduction() {
  //   this.isGettingIntroduction = true;
  //   const prompt_test =
  //     'Scrivi una introduzione per un post del blog su ' +
  //     this.topicTitle +
  //     ' ' +
  //     this.topicInfos +
  //     'in ' +
  //     this.language +
  //     '. Stile: ' +
  //     this.writing_style +
  //     '. Tono: ' +
  //     this.writing_tone +
  //     '.  Non possono esserci frasi incomplete. Deve invogliare il lettore ad approfondire l argomento e a leggere la recensione del prodotto, non deve spingere all acquisto ma dare una idea degli argomenti trattati nell articolo. Il testo deve contenere al massimo 70 parole, parla al lettore al singolare, non svelare troppe informazioni sul prodotto.';
  //   this.openAIService.getResponse(prompt_test).subscribe((response) => {
  //     this.isGettingIntroduction = false;
  //     this.introductionResponse = response.message;
  //   });
  // }

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


  getSections() {
    this.isGettingSections = true;
    const sections_count = 10;
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
      ' I primi tre titoli devono essere "Caratteristiche del prodotto", "Rapporto qualità prezzo", "Pro e contro". Dopo questi, generare ulteriori titoli di sezione a tua scelta, ognuno dei quali deve essere breve (60-80 caratteri). Alla fine di tutte le sezioni, aggiungi la sezione "Conclusioni". I titoli delle sezioni devono essere avvolti nel tag h2.';
    this.openAIService.getResponse(prompt_test).subscribe((response) => {
      this.isGettingSections = false;
      this.sectionsResponse = response.message;
    });
  }

  async getAndOptimizeSections(maxRetries: number = 3): Promise<void> {
    const sections_count = 10;
    const initialPrompt =
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
      ` I primi tre titoli devono essere "Caratteristiche del prodotto", "Rapporto qualità prezzo",
      "Pro e contro". Dopo questi, generare ulteriori titoli di sezione a tua scelta,
       ognuno dei quali deve essere breve (60-80 caratteri). Alla fine di tutte le sezioni,
       aggiungi la sezione "Conclusioni". I titoli delle sezioni devono essere avvolti nel tag h2. NON usare elenchi puntati nei titoli.
        Cerca di utilizzare un linguaggio naturale e colloquiale.`;

    let lastTitles: string[] = [];

    for (let i = 0; i < maxRetries; i++) {
      this.isGettingSections = true;

      const prompt = i === 0 ? initialPrompt : `${initialPrompt} Assicurati che almeno alcuni titoli includano la parola chiave "${this.topicKeyword}" e che coprano vari aspetti del prodotto (ad esempio, "Design del prodotto", "Facilità d'uso", "Qualità costruttiva", ecc.).`;

      const response = await this.openAIService.getResponse(prompt).toPromise();

      this.isGettingSections = false;
      let originalTitles = response.message.split("\n").map((title: string) => title.replace(/<h2>|<\/h2>/g, '')).filter((title: string) => title.trim() !== ''); // remove <h2> tags and empty titles
      lastTitles = originalTitles;

      // Check if at least 3 titles contain the keyword
      let seoScore = originalTitles.filter((title: string | string[]) => title.includes(this.topicKeyword)).length;

      const someThreshold = 3; // Adjust this value based on your specific needs

      // If SEO score is satisfactory, set the sections response and exit the function
      if (seoScore >= someThreshold) {
        this.sectionsResponse = originalTitles.map((title: any) => `<h2>${title}</h2>`).join("\n"); // re-add <h2> tags
        return;
      }
    }

    // If we reach this point, it means that after maxRetries attempts, the SEO score is still unsatisfactory.
    // Use the last generated titles anyway
    this.sectionsResponse = lastTitles.map((title: any) => `<h2>${title}</h2>`).join("\n"); // re-add <h2> tags
    console.error("Used section titles with a less-than-satisfactory SEO score after " + maxRetries + " attempts.");
  }




  getContent() {
    this.isGettingContent = true;
    const paragraphs_per_section = 3;
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
      ' paragrafi, ognuno con contenuti unici e non ripetitivi. Ogni sezione inizia con l\'intestazione corrispondente. Per favorire la SEO, utilizza le parole chiave in modo naturale e vario, evitando il keyword stuffing. ' +
      ' Basati sulle informazioni seguenti: ' +
      this.topicInfos +
      ' Stile: ' +
      this.writing_style +
      '. Tono: ' +
      this.writing_tone +
      ' Deve essere compreso tra 700 e 900 parole. Deve essere un articolo completo. Deve essere una recensione di un prodotto. Non devono esserci frasi incomplete. Non ripetere il titolo h1. Ogni paragrafo deve iniziare in modo diverso, evitando ripetizioni all\'inizio dei paragrafi. Ogni sezione deve iniziare con la sua intestazione h2 corrispondente.';
    this.openAIService.getResponse(prompt_test).subscribe((response) => {
      this.isGettingContent = false;
      this.contentResponse = response.message;
    });
  }


  getCompleteArticle() {
    this.isGettingCompleteArticle = true;

    // Divide the content into sections based on <h2> tags
    let contentSections = this.contentResponse.split('<h2>');

    // Select a random section to insert the image (but not the first one)
    let randomSectionIndex =
      Math.floor(Math.random() * (contentSections.length - 1)) + 1;

    // Insert the image at the start of the random section
    contentSections[randomSectionIndex] =
      `<p>[amazon fields="${this.topicASIN}" value="thumb" image="2" image_size="large" image_align="center" image_alt="${this.topicKeyword}"] </p> <br> <h2>` +
      contentSections[randomSectionIndex] +
      '</h2>';

    // Reassemble the content
    let contentWithImage = contentSections.join('<h2>');

    // Assemble the complete article
    this.completeArticleResponse = `
      ${this.titleResponse}

      [amazon fields="${this.topicASIN}" value="thumb" image="1" image_size="large" image_align="center" image_alt="${this.topicKeyword}"]
      <br>

      ${this.introductionResponse}
       <br>
      <h3>Punti chiave:</h3>
      <br>

      [amazon fields="${this.topicASIN}" value="description" description_length="400" image_alt="${this.topicKeyword}"]
      [content-egg-block template=offers_list_no_price]
      <br>

      ${contentWithImage}

      <h3> Migliori Offerte inerenti a ${this.topicKeyword}: </h3>
      <br>
      <p> [amazon bestseller="piscina ${this.topicKeyword} " items="5"/] </p>
    `;

    this.isGettingCompleteArticle = false;
  }

  publishArticleOnWP() {
    if (!this.isGettingCompleteArticle) {
      // Rimuovi completamente i tag <h1> e il loro contenuto
      const cleanedContent = this.completeArticleResponse.replace(/<h1\b[^>]*>.*?<\/h1>/g, '');

      this.wpService.publishPost(this.titleResponse, cleanedContent)
        .subscribe(response => {
          alert('Articolo pubblicato con successo!');
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

  //*************SEO IMPROVMENT *******************//
  analyzeSeoIntroduction(text: string): number {
    let seoScore = 0;

    //Split the text into sentences
    let sentences = text.split('. ');

    //Increase the score if the keyword is in the first sentence
    if (sentences.length > 0 && sentences[0].includes(this.topicKeyword)) {
      seoScore += 10;
    }

    //Increase the score if the keyword is in bold
    if (text.includes('<strong>' + this.topicKeyword + '</strong>')) {
      seoScore += 10;
    }

    //Increase the score if the text has a certain length
    if (text.length > 70) {
      seoScore += 10;
    }

    //Other SEO criteria can be added here...

    return seoScore;
  }

  analyzeSeoSections(titles: string[]): number {
    let seoScore = 0;
    let keywordCount = 0;

    for (let title of titles) {
      //Increase the score if the title includes the keyword
      if (title.includes(this.topicKeyword)) {
        seoScore += 3;  // change here
        keywordCount++;
      }
    }

    //If too many titles include the keyword, reduce the score to avoid keyword stuffing
    if (keywordCount > titles.length * 0.5) {
      seoScore -= 5;  // change here
    }

    //Other SEO criteria can be added here...

    return seoScore;
  }



}
