import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SeoAnalyzerService {

  constructor() { }
  analyzeSeoTitle(text: string, topicKeyword: string): number {
    let seoScore = 0;

    if (text.includes(topicKeyword)) {
      seoScore += 10;
    }

    if (text.startsWith('<h1>') && text.endsWith('</h1>')) {
      seoScore += 10;
    }

    if (text.length >= 40 && text.length <= 60) {
      seoScore += 10;
    }

    return seoScore;
  }

  analyzeSeoIntroduction(text: string, topicKeyword: string): number {
    let seoScore = 0;

    // Split the text into sentences
    let sentences = text.split('. ');

    // Increase the score if the keyword is in the first sentence
    if (sentences.length > 0 && sentences[0].includes(topicKeyword)) {
      seoScore += 10;
    }

    // Increase the score if the keyword is in bold
    if (text.includes('<strong>' + topicKeyword + '</strong>')) {
      seoScore += 10;
    }

    // Increase the score if the text has a certain length
    if (text.length > 70) {
      seoScore += 10;
    }
    return seoScore
  }

  analyzeSeoSections(titles: string[], topicKeyword: string): number {
    let seoScore = 0;
    let keywordCount = 0;

    for (let title of titles) {
      if (title.includes(topicKeyword)) {
        seoScore += 3;
        keywordCount++;
      }
    }

    if (keywordCount > titles.length * 0.5) {
      seoScore -= 5;
    }
    return seoScore;
  }

  analyzeSeoContent(text: string, sectionsResponse: string, titleResponse: string): number {
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
    const sections = sectionsResponse.split('\n').map(section => section.replace('<h2>', '').replace('</h2>', ''));
    for (const section of sections) {
      if (text.includes('<h2>' + section + '</h2>')) {
        seoScore += 5;
      }
    }

    // Check if the text does not repeat the <h1> title.
    if (!text.includes(titleResponse)) {
      seoScore += 10;
    }

    // Check if the first line of each paragraph is different.
    const paragraphs = text.split('\n');
    const firstLines = paragraphs.map(p => p.split('. ')[0]);
    if (new Set(firstLines).size === firstLines.length) {
      seoScore += 5;
    }
    return seoScore;
  }

  calculateTotalSeoScore(
    maxTitleScore: number,
    maxIntroductionScore: number,
    maxSectionsScore: number,
    maxContentScore: number,
    seoTitleScore: number,
    seoIntroductionScore: number,
    seoSectionsScore: number,
    seoContentScore: number
  ): number {
    const titleWeight = 0.3;
    const introductionWeight = 0.3;
    const sectionsWeight = 0.2;
    const contentWeight = 0.2;

    const totalMaxScore = (maxTitleScore * titleWeight) +
      (maxIntroductionScore * introductionWeight) +
      (maxSectionsScore * sectionsWeight) +
      (maxContentScore * contentWeight);

    const totalScore = (seoTitleScore * titleWeight) +
      (seoIntroductionScore * introductionWeight) +
      (seoSectionsScore * sectionsWeight) +
      (seoContentScore * contentWeight);

    return (totalScore / totalMaxScore) * 100;
  }
}
