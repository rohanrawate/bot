import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AppService {

  constructor(private http: HttpClient) { }

  getBotData(value): Observable<any> {
    return this.http.post('http://18.233.97.177:5005/webhooks/rest/webhook', {message: value}, {})
      .pipe(map((res: any) => res));
  }

  getEpsData(value): Observable<any> {
    return this.http.get('assets/eis.json', {})
      .pipe(map((res: any) => res));
  }

}
