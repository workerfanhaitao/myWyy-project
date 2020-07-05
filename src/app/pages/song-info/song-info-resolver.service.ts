import { first } from 'rxjs/internal/operators';
import { Song, Lyric } from './../../services/data-types/common.types';
import { SongService } from './../../services/song.service';
import { Injectable } from '@angular/core';
import { Observable, forkJoin } from 'rxjs';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';

type SongDataModel = [Song, Lyric];

@Injectable()
export class SongInfoResolverService implements Resolve<SongDataModel> {

  constructor(
    private songService: SongService
  ) {}

  resolve(route: ActivatedRouteSnapshot): Observable<SongDataModel> {
    const id = route.paramMap.get('id');
    return forkJoin([
      this.songService.getSongDetail(id),
      this.songService.getLyric(Number(id))
    ]).pipe(first());
  }
}
