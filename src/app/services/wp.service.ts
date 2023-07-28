import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class WpService {
  // Imposta qui l'URL del tuo sito WordPress e l'endpoint dell'API
  private wpUrl = 'https://reviewmodeon.com/wp-json/wp/v2';

  constructor(private http: HttpClient) {}

  publishPost(title: string, content: string) {
    // Imposta le credenziali di autenticazione, se necessario
    const headers = new HttpHeaders({
      'Authorization': 'Basic ' + btoa('r3vi3wm0d30n:fj[^1le84j24')
    });

    // Prepara il corpo della richiesta
    const body = {
      'title': title,
      'content': content,
      'status': 'draft'  // Usa 'draft' per creare un post in bozza
    };

    // Invia la richiesta POST
    return this.http.post(`${this.wpUrl}/posts`, body, { headers: headers });
  }

}
