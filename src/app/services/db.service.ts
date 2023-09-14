import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/enviroment/enviroment';

@Injectable({
  providedIn: 'root'
})
export class DbService {

  constructor(private http: HttpClient) { }

  get<T = any>(apiController: string): Observable<T> {
    return this.http.get<T>(`${environment.apiDbUrl}${apiController}`);
  }

  post<T = any>(apiController: string, data: T): Observable<T> {
    return this.http.post<T>(`${environment.apiDbUrl}${apiController}`, data);
  }

  put<T = any>(apiController: string, data: T): Observable<T> {
    return this.http.put<T>(`${environment.apiDbUrl}${apiController}`, data);
  }

  delete<T = any>(apiController: string, id: string | number): Observable<T> {
    return this.http.delete<T>(`${environment.apiDbUrl}${apiController}/${id}`);
  }

}
