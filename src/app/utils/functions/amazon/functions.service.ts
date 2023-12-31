import { WpService } from 'src/app/services/wp.service';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { OpenAIService } from 'src/app/services/open-ai.service';
import { SeoAnalyzerService } from '../../seoAnalyzer/seoanalyzer.service';

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

  wrapParagraphsWithPTags(content: string): string {
    return content.split('\n')
      .map(line => {
        line = line.trim();
        // Check if the line is not empty and is not wrapped by a tag
        if (line && !line.startsWith('<')) {
          return `<p>${line}</p>`;
        }
        return line;
      })
      .join('\n');
  }

  getCompleteArticle(titleResponse: string, contentResponse: string, introductionResponse: string, topicASIN: string, topicKeyword: string, shortcodes: { code: string, position: string }[]): string {
    contentResponse = this.wrapParagraphsWithPTags(contentResponse);

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


    // Apply shortcodes based on their positions
    shortcodes.forEach(shortcode => {
      switch (shortcode.position) {
        // case 'beforeIntroduction':
        //   introductionResponse = insertShortcodes(introductionResponse, 'p', 0, shortcode.code);
        //   break;
        // case 'afterIntroduction':
        //   introductionResponse = insertShortcodes(introductionResponse, 'p', 0, shortcode.code, false);
        //   break;
        case 'beforeIntroduction':
          introductionResponse = shortcode.code + introductionResponse;
          break;
        case 'afterIntroduction':
          introductionResponse = introductionResponse + shortcode.code;
          break;

        case 'beforeFirstP':
          contentResponse = insertShortcodes(contentResponse, 'p', 0, shortcode.code);
          break;
        case 'afterFirstP':
          contentResponse = insertShortcodes(contentResponse, 'p', 0, shortcode.code, false);
          break;
        case 'afterSecondP':
          contentResponse = insertShortcodes(contentResponse, 'p', 1, shortcode.code, false);
          break;
        case 'afterThirdP':
          contentResponse = insertShortcodes(contentResponse, 'p', 2, shortcode.code, false);
          break;
        case 'afterFourthP':
          contentResponse = insertShortcodes(contentResponse, 'p', 3, shortcode.code, false);
          break;
        case 'afterFifthP':
          contentResponse = insertShortcodes(contentResponse, 'p', 4, shortcode.code, false);
          break;
        case 'afterSixthP':
          contentResponse = insertShortcodes(contentResponse, 'p', 5, shortcode.code, false);
          break;
        case 'afterSeventhP':
          contentResponse = insertShortcodes(contentResponse, 'p', 6, shortcode.code, false);
          break;
        case 'afterEighthP':
          contentResponse = insertShortcodes(contentResponse, 'p', 7, shortcode.code, false);
          break;
        case 'afterNinthP':
          contentResponse = insertShortcodes(contentResponse, 'p', 8, shortcode.code, false);
          break;
        case 'afterTenthP':
          contentResponse = insertShortcodes(contentResponse, 'p', 9, shortcode.code, false);
          break;
        case 'afterEleventhP':
          contentResponse = insertShortcodes(contentResponse, 'p', 10, shortcode.code, false);
          break;
        case 'afterTwelfthP':
          contentResponse = insertShortcodes(contentResponse, 'p', 11, shortcode.code, false);
          break;
        case 'afterThirteenthP':
          contentResponse = insertShortcodes(contentResponse, 'p', 12, shortcode.code, false);
          break;
        case 'afterFourteenthP':
          contentResponse = insertShortcodes(contentResponse, 'p', 13, shortcode.code, false);
          break;
        case 'afterFifteenthP':
          contentResponse = insertShortcodes(contentResponse, 'p', 14, shortcode.code, false);
          break;
        case 'afterSixteenthP':
          contentResponse = insertShortcodes(contentResponse, 'p', 15, shortcode.code, false);
          break;
        case 'afterSeventeenthP':
          contentResponse = insertShortcodes(contentResponse, 'p', 16, shortcode.code, false);
          break;
        case 'afterEighteenthP':
          contentResponse = insertShortcodes(contentResponse, 'p', 17, shortcode.code, false);
          break;
        case 'afterNineteenthP':
          contentResponse = insertShortcodes(contentResponse, 'p', 18, shortcode.code, false);
          break;
        case 'afterTwentiethP':
          contentResponse = insertShortcodes(contentResponse, 'p', 19, shortcode.code, false);
          break;

        case 'beforeFirstH2':
          contentResponse = insertShortcodes(contentResponse, 'h2', 0, shortcode.code);
          break;
        case 'afterFirstH2':
          contentResponse = insertShortcodes(contentResponse, 'h2', 0, shortcode.code, false);
          break;
        case 'beforeSecondH2':
          contentResponse = insertShortcodes(contentResponse, 'h2', 1, shortcode.code);
          break;
        case 'afterSecondH2':
          contentResponse = insertShortcodes(contentResponse, 'h2', 1, shortcode.code, false);
          break;
        case 'beforeThirdH2':
          contentResponse = insertShortcodes(contentResponse, 'h2', 2, shortcode.code);
          break;
        case 'afterThirdH2':
          contentResponse = insertShortcodes(contentResponse, 'h2', 2, shortcode.code, false);
          break;
        case 'beforeFourthH2':
          contentResponse = insertShortcodes(contentResponse, 'h2', 3, shortcode.code);
          break;
        case 'afterFourthH2':
          contentResponse = insertShortcodes(contentResponse, 'h2', 3, shortcode.code, false);
          break;
        case 'beforeFifthH2':
          contentResponse = insertShortcodes(contentResponse, 'h2', 4, shortcode.code);
          break;
        case 'afterFifthH2':
          contentResponse = insertShortcodes(contentResponse, 'h2', 4, shortcode.code, false);
          break;
        case 'beforeSixthH2':
          contentResponse = insertShortcodes(contentResponse, 'h2', 5, shortcode.code);
          break;
        case 'afterSixthH2':
          contentResponse = insertShortcodes(contentResponse, 'h2', 5, shortcode.code, false);
          break;
        case 'beforeSeventhH2':
          contentResponse = insertShortcodes(contentResponse, 'h2', 6, shortcode.code);
          break;
        case 'afterSeventhH2':
          contentResponse = insertShortcodes(contentResponse, 'h2', 6, shortcode.code, false);
          break;
        case 'beforeEighthH2':
          contentResponse = insertShortcodes(contentResponse, 'h2', 7, shortcode.code);
          break;
        case 'afterEighthH2':
          contentResponse = insertShortcodes(contentResponse, 'h2', 7, shortcode.code, false);
          break;
        case 'beforeNinthH2':
          contentResponse = insertShortcodes(contentResponse, 'h2', 8, shortcode.code);
          break;
        case 'afterNinthH2':
          contentResponse = insertShortcodes(contentResponse, 'h2', 8, shortcode.code, false);
          break;
        case 'beforeTenthH2':
          contentResponse = insertShortcodes(contentResponse, 'h2', 9, shortcode.code);
          break;

        case "beginningOfArticle":
          contentResponse = shortcode.code + contentResponse;
          break;
        case 'randomInTheContent':
          const paragraphs = contentResponse.split('<p>');
          const randomIndex = Math.floor(Math.random() * paragraphs.length);
          paragraphs[randomIndex] = shortcode.code + paragraphs[randomIndex];
          contentResponse = paragraphs.join('<p>');
          break;
        case 'endOfArticle':
          contentResponse = contentResponse + shortcode.code;
          break;


     }
    });


    // Assemble the complete article
    let completeArticle = `${titleResponse}\n${introductionResponse}\n${contentResponse}`
      .split('\n')
      .map(line => line.trim())
      .filter(line => line)
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
