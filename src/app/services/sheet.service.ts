import { SongService } from './song.service';
import { ServicesModule, API_CONFIG } from './services.module';
import { Injectable, Inject } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { SongSheet, Song, SheetParams, SheetList, SampleBack } from './data-types/common.types';
import { map, switchMap, pluck } from 'rxjs/internal/operators';
import queryString from 'query-string';

@Injectable({
  providedIn: ServicesModule,
})

export class SheetService {

  constructor(
    private http: HttpClient,
    private songService: SongService,
    @Inject(API_CONFIG) private uri: string,
  ) { }

  // 获取歌单列表
  getSheets(args: SheetParams): Observable<SheetList> {
    const params = new HttpParams({ fromString: queryString.stringify(args) });
    return this.http.get(this.uri + 'top/playlist', { params }).pipe(
      map((res) => res as SheetList)
    );
  }

  // 获取歌单详情
  getSongSheetDetail(id: number): Observable<SongSheet> {
    const params = new HttpParams().set('id', id.toString());
    return this.http.get(this.uri + 'playlist/detail', { params })
    .pipe(map((res: { playlist: SongSheet }) => res.playlist));
  }

  playSheet(id: number): Observable<Song[]> {
    return this.getSongSheetDetail(id)
    .pipe(pluck('tracks'), switchMap((tracks: any) => this.songService.getSongList(tracks)));
  }
}
