import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class WpService {
  // Imposta qui l'URL del tuo sito WordPress e l'endpoint dell'API
  private wpUrl = localStorage.getItem('wp_wpUrl') || 'https://reviewmodeon.com/wp-json/wp/v2';
  private status = localStorage.getItem('wp_status') || 'draft';
  private btoa = localStorage.getItem('wp_btoa') || 'r3vi3wm0d30n:fj[^1le84j24';

  constructor(private http: HttpClient) {}

  publishPost(title: string, content: string) {
    // Imposta le credenziali di autenticazione, se necessario
    const headers = new HttpHeaders({
      'Authorization': 'Basic ' + btoa(this.btoa!.toString())
    });

    // Prepara il corpo della richiesta
    const body = {
      'title': title,
      'content': content,
      'status': this.status  // Usa 'draft' per creare un post in bozza
    };

    // Invia la richiesta POST
    return this.http.post(`${this.wpUrl}/posts`, body, { headers: headers });
  }

}
