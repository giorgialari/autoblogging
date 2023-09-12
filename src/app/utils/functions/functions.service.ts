import { WpService } from './../../services/wp.service';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { OpenAIService } from 'src/app/services/open-ai.service';
import { SeoAnalyzerService } from '../seoAnalyzer/seoanalyzer.service';

@Injectable({
  providedIn: 'root'
})
export class FunctionsService {
  topicTitle = ''
  language = ''
  writing_style = ''
  writing_tone = ''
  topicInfos = ''
  quantityParagraphs = 0


  getDefaultImproveTitlePrompt(): string {
    return "Migliora il contenuto di questo titolo [TOPIC] in lingua [LANGUAGE]. Stile: [STYLE]. Tono: [TONE]. Deve essere compreso tra 80 e 100 caratteri. Deve essere una frase completa e breve, non può contenere frasi incomplete. Deve contenere solo informazioni essenziali. Non deve contenere icone, emoji o caratteri speciali. Deve essere impersonale e deve contenere solo le informazioni essenziali.";
  }

  getDefaultImproveInfoPrompt(): string {
    return "Migliora il contenuto di questo testo [INFOS]. Rispondi in lingua [LANGUAGE]. Stile: [STYLE]. Tono: [TONE]. Deve essere massimo 500 caratteri. Deve contenere solo informazioni essenziali e non può contenere frasi incomplete. Non deve contenere icone, emoji o caratteri speciali. Deve essere impersonale e deve essere strutturato come elenco numerato.";
  }

  getDefaultTitlePrompt(): string {
    return 'Scrivi un titolo per un post del blog su [TOPIC] in  lingua [LANGUAGE]. '
      + 'Stile: [STYLE]. Tono: [TONE]. '
      + 'Deve essere compreso tra 40 e 60 caratteri. Deve essere una frase completa e breve. '
      + 'Deve essere un titolo per la recensione di un post sul blog e deve contenere "Recensione" e '
      + 'deve essere avvolto da un tag <h1>. Ad esempio: <h1>Recensione del film Avengers: Endgame</h1>';
  }

  getDefaultIntroductionPrompt(): string {
    return 'Scrivi una introduzione per un post del blog su [TOPIC] in lingua [LANGUAGE]. '
      + 'Stile: [STYLE]. Tono: [TONE]. '
      + 'Non possono esserci frasi incomplete. Deve invogliare il lettore ad approfondire l argomento e a leggere la recensione del prodotto, '
      + 'non deve spingere all acquisto ma dare una idea degli argomenti trattati nell articolo. Il testo deve contenere al massimo 70 parole, '
      + 'parla al lettore al singolare, non svelare troppe informazioni sul prodotto.';
  }

  getDefaultSectionsPrompt(): string {
    return "Genera " +
      "[QUANTITY] titoli di sezioni per un articolo su [TOPIC] in lingua [LANGUAGE]. " +
      "Stile: [STYLE]. Tono: [TONE].\n" +
      "I primi tre titoli devono essere \"Caratteristiche del prodotto\", \"Rapporto qualità prezzo\", \"Pro e contro\". " +
      "Dopo questi, generare ulteriori titoli di sezione a tua scelta,\n" +
      "ognuno dei quali deve essere breve (60-80 caratteri). Alla fine di tutte le sezioni, aggiungi la sezione \"Conclusioni\". " +
      "I titoli delle sezioni devono essere avvolti nel tag h2.\n" +
      "Esempio di risposta ideale:\n" +
      "<h2>Caratteristiche del prodotto</h2>\n" +
      "<h2>Rapporto qualità prezzo</h2>\n" +
      "<h2>Pro e contro</h2>\n" +
      "...Altre sezioni...\n" +
      "<h2>Conclusioni</h2>";
  }

  getDefaultContentPrompt(): string {
    return "Scrivi un articolo su [TOPIC] in lingua [LANGUAGE]. L articolo è organizzato secondo i seguenti titoli avvolti nei tag <h2></h2>: " +
      " [SECTIONS] \n" +
      "Ogni sezione deve avere [PARPERSECTIONS] paragrafi, ognuno con contenuti unici e non ripetitivi. Ogni sezione inizia con l'intestazione corrispondente.\n" +
      "Per favorire la SEO, utilizza le parole chiave in modo naturale e vario, evitando il keyword stuffing.\n" +
      "Basati sulle informazioni seguenti: [TOPIC_INFOS] Stile: [STYLE]. Tono: [TONE] Deve essere compreso di almeno 950 parole.\n" +
      "Deve essere un articolo completo. Deve essere una recensione di un prodotto. Non devono esserci frasi incomplete. Non ripetere il titolo h1.\n" +
      "Ogni sezione deve iniziare con la sua intestazione h2 corrispondente. La prima riga di ogni paragrafo deve essere diversa da quella degli altri paragrafi.";
  }


  constructor(private openAIService: OpenAIService, private wpService: WpService, private seoAnalyService: SeoAnalyzerService) { }

  getImprovedTopic(prompt: string,
    model: string,
    maxTokens: number):
    Observable<any> {
    return this.openAIService.getResponse(prompt, model, maxTokens);
  }

  getImprovedInfo(prompt: string, model: string, maxTokens: number): Observable<any> {
    return this.openAIService.getResponse(prompt, model, maxTokens);
  }

  getTitle(prompt: string, model: string, maxTokens: number): Observable<any> {
    return this.openAIService.getResponse(prompt, model, maxTokens);
  }

  async getOptimizedIntroduction(
    prompt: string,
    model: string,
    maxTokens: number,
    topicKeyword: string,
    maxRetries: number = 2,
  ): Promise<string> {
    const basePrompt = prompt;
    const someThreshold = 20;
    let lastIntroduction = '';
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      let optimizationHints = '';
      let prompt_test = basePrompt + optimizationHints;

      let response = await this.openAIService.getResponse(prompt_test, model, maxTokens).toPromise();
      let originalIntroduction = response.message;
      lastIntroduction = originalIntroduction;

      let seoScore = this.seoAnalyService.analyzeSeoIntroduction(originalIntroduction, topicKeyword);

      if (seoScore >= someThreshold) {
        return originalIntroduction;
      } else {
        optimizationHints = '';

        // Instruct the AI to include the keyword in the text
        if (!originalIntroduction.includes(topicKeyword)) {
          optimizationHints += ' Includi la parola chiave <strong>"' + topicKeyword + '"</strong> nella prima frase.';
        }

        // Change the tone to be more informal
        if (originalIntroduction.includes('Siete')) {
          optimizationHints += ' Usa un tono più informale, dando del tu al lettore.';
        }
      }
    }

    return lastIntroduction; // default return if no satisfactory SEO score is achieved after retries
  }

  getSections(prompt: string, model: string, maxTokens: number): Observable<any> {
    return this.openAIService.getResponse(prompt, model, maxTokens);
  }

  getContent(prompt: string, model: string, maxTokens: number): Observable<any> {
    return this.openAIService.getResponse(prompt, model, maxTokens);
  }

  getCompleteArticle(titleResponse: string, contentResponse: string, introductionResponse: string, topicASIN: string, topicKeyword: string): string {
    // Divide the content into sections based on <h2> tags
    let contentSections = contentResponse.split('<h2>').map(section => section.trim());
    // Select a random section to insert the image (but not the first one)
    let randomSectionIndex = Math.floor(Math.random() * (contentSections.length - 1)) + 1;
    // Insert the image at the start of the random section
    contentSections[randomSectionIndex] = `
      <h2>${contentSections[randomSectionIndex]}</h2>
    `;
    // Reassemble the content
    let contentWithImage = contentSections.join('<h2>');
    // Assemble the complete article
    let completeArticle = `
      ${titleResponse}
      <p>[content-egg-block template=customizable product="it-${topicASIN}" show=img]</p>
      ${introductionResponse}
      [content-egg module=AmazonNoApi products="it-${topicASIN}" template=list_no_price]
      ${contentWithImage}
      <h3>Migliore Offerta inerente a ${topicKeyword}:</h3>
      <p>[content-egg module=AmazonNoApi products="it-${topicASIN}" template=item]</p>
    `
      .split('\n')
      .map(line => line.trim()) // Remove whitespace at the start and end of each line
      .filter(line => line) // Remove empty lines
      .join('\n');
    return completeArticle;
  }

  async publishArticleOnWP(isGettingCompleteArticle: boolean, completeArticleResponse: string, titleResponse: string, wpService: WpService): Promise<string> {
    if (!isGettingCompleteArticle) {
      // Rimuovi completamente i tag <h1> e il loro contenuto
      const cleanedContent = completeArticleResponse.replace(/<h1\b[^>]*>.*?<\/h1>/g, '');
      const wpUrl = localStorage.getItem('wp_wpUrl') || '';
      const status = localStorage.getItem('wp_status') || 'draft';
      const btoa = localStorage.getItem('wp_btoa') || '';

      const credentials = (btoa || '').split(':');
      const username = credentials[0];
      const password = credentials[1];

      try {
        // Ottieni il token prima
        const tokenResponse = await wpService.getToken(username, password, wpUrl).toPromise() as TokenResponse;
        const jwtToken = tokenResponse.token;

        // Ora pubblica il post con il token
        await wpService.publishPost(titleResponse, cleanedContent, wpUrl, status, jwtToken).toPromise();

        return 'Articolo pubblicato con successo!';
      } catch (error) {
        console.error('There was an error publishing the article:', error);
        throw new Error('Failed to publish article');
      }
    }
    return '';
  }




}
interface TokenResponse {
  token: string;
  [key: string]: any; // Questo consente altre proprietà nel tokenResponse.
}
