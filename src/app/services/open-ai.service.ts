import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import  {environment } from '../../enviroment/enviroment';

@Injectable({
  providedIn: 'root'
})
export class OpenAIService {
  private apiUrl = environment.apiUrl;
  private apiKey = '';
  constructor(private http: HttpClient) {
    this.apiKey = localStorage.getItem('openAI_apiKey') || '';
   }

  getResponse(prompt: string, model: string, maxTokens: number ): Observable<any> {
    return this.http.post<any>(this.apiUrl + '/api/openai', { prompt, model, maxTokens, apiKey:  localStorage.getItem('openAI_apiKey') });
  }

}
