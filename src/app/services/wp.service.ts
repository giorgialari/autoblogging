import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class WpService {
  constructor(private http: HttpClient) { }
  getToken(username: string, password: string, wpUrl: string) {
    const body = new HttpParams()
      .set('username', username)
      .set('password', password);

    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded'
    });

    return this.http.post(`${wpUrl}/wp-json/jwt-auth/v1/token`, body, { headers: headers });
}

  publishPost(title: string, content: string, wpUrl: any, status: string, jwtToken: string) {
    // Imposta l'header di autorizzazione con il token JWT e Content-Type appropriato
    const headers = new HttpHeaders({
      'Authorization': 'Bearer ' + jwtToken,
      'Content-Type': 'application/x-www-form-urlencoded'
    });

    // Converte il corpo della richiesta in x-www-form-urlencoded
    let body = new HttpParams();
    body = body.set('title', title);
    body = body.set('content', content);
    body = body.set('status', status); // Usa 'draft' per creare un post in bozza

    // Invia la richiesta POST
    return this.http.post(`${wpUrl}/wp-json/wp/v2/posts`, body, { headers: headers });
  }
}
