import { map } from 'rxjs/internal/operators';
import { SearchResult } from './data-types/common.types';
import { Observable } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { ServicesModule, API_CONFIG } from './services.module';
import { Injectable, Inject } from '@angular/core';

@Injectable({
  providedIn: ServicesModule
})
export class SearchService {

  constructor(
    private http: HttpClient,
    @Inject(API_CONFIG) private uri: string
  ) { }

  search(keywords: string): Observable<SearchResult> {
    const params = new HttpParams().set('keywords', keywords);
    return this.http.get(this.uri + 'search/suggest', { params }).pipe(map((res: {result: SearchResult}) => res.result));
  }
}
