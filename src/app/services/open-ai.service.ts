import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OpenAIService {
  private apiUrl = 'http://localhost:3000/api/openai';

  constructor(private http: HttpClient) { }

  getResponse(prompt: string, model: string, maxTokens: number): Observable<any> {
    return this.http.post<any>(this.apiUrl, { prompt, model, maxTokens });
  }
}
