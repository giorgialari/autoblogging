import { Component } from '@angular/core';
import { OpenAIService } from './services/open-ai.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  titleResponse: string = '';
  introductionResponse: string = '';
  sectionsResponse: string = '';
  contentResponse: string = '';
  completeArticleResponse: string = '';
  topicTitle = '';
  topicInfos = '';
  topicKeyword = '';
  topicASIN = '';
  writing_tone = 'informal';
  writing_style = 'blog post';
  language = 'Italian';
  isGettingTitle = false;
  isGettingIntroduction = false;
  isGettingSections = false;
  isGettingContent = false;
  isGettingTopicTitle = false;
  isGettingTopicInfo = false;
  isGettingCompleteArticle = false;

  constructor(private openAIService: OpenAIService) {}

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
  getIntroduction() {
    this.isGettingIntroduction = true;
    const prompt_test =
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
    this.openAIService.getResponse(prompt_test).subscribe((response) => {
      this.isGettingIntroduction = false;
      this.introductionResponse = response.message;
    });
  }
  getSections() {
    this.isGettingSections = true;
    const sections_count = 10;
    const prompt_test =
      'Scrivi ' +
      sections_count +
      ' intestazioni consecutive per un articolo su ' +
      this.topicTitle +
      ' ' +
      this.topicInfos +
      ' in ' +
      this.language +
      '. Stile: ' +
      this.writing_style +
      '. Tono: ' +
      this.writing_tone +
      ' Ogni sezione deve essere completa e deve essere lunga tra i 60 e gli 80 caratteri. Deve contenere sezioni come "Caratteristiche del prodotto", "Rapporto qualità prezzo", "Pro e contro". Devono essere elencate in ordine di importanza e alla fine ti tutte le sezioni va aggiunta la sezione "Conclusioni". Avvolgi tutte le sezioni nel tag h2.';
    this.openAIService.getResponse(prompt_test).subscribe((response) => {
      this.isGettingSections = false;
      this.sectionsResponse = response.message;
    });
  }

  getContent() {
    this.isGettingContent = true;
    const paragraphs_per_section = 3;
    const prompt_test =
      'Scrivi un articolo su ' +
      this.titleResponse +
      ' in ' +
      this.language +
      '. L articolo è organizzato secondo i seguenti titoli: ' +
      this.sectionsResponse +
      '  Ogni sezione deve avere ' +
      paragraphs_per_section +
      ' Usa HTML per la formattazione, includi tag h2, tag h3, elenchi e grassetto. ' +
      ' Basati sulle informazioni seguenti: ' +
      this.topicInfos +
      ' Stile: ' +
      this.writing_style +
      '. Tono: ' +
      this.writing_tone +
      '  Deve essere compreso tra 700 e 900 parole. Deve essere un articolo completo. Deve essere una recensione di un prodotto. Non devono esserci frasi incomplete."';
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
      `<p>[amazon fields="${this.topicASIN}" value="thumb" image="2" image_size="large" image_align="center"] </p> <br> <h2>` +
      contentSections[randomSectionIndex] +
      '</h2>';

    // Reassemble the content
    let contentWithImage = contentSections.join('<h2>');

    // Assemble the complete article
    this.completeArticleResponse = `
      ${this.titleResponse}
  
      [amazon fields="${this.topicASIN}" value="thumb" image="1" image_size="large" image_align="center"]
      <br>
  
      ${this.introductionResponse}
       <br>
      <h3>Punti chiave:</h3>
      <br>

      [amazon fields="${this.topicASIN}" value="description" description_length="400"]
      [content-egg-block template=offers_list_no_price]
      <br>
  
      ${contentWithImage}
  
      <h3> Migliori Offerte inerenti a ${this.topicKeyword}: </h3>
      <br>
      <p> [amazon bestseller="piscina ${this.topicKeyword} " items="5"/] </p>
    `;

    this.isGettingCompleteArticle = false;
  }
}
