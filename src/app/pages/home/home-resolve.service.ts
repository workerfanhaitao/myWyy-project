import { Banner, HotTag, SongSheet, Singer } from './../../services/data-types/common.types';
import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { HomeService } from './../../services/home.service';
import { SingerService } from './../../services/singer.service';
import { Observable, forkJoin, of } from 'rxjs';
import { first } from 'rxjs/internal/operators';

type HomeDataType = [Banner[], HotTag[], SongSheet[], Singer[]];

@Injectable()
export class HomeResolverService implements Resolve<HomeDataType> {
  constructor(
    private homeService: HomeService,
    private singerService: SingerService,
  ) {}

  resolve(): Observable<HomeDataType> {
   return forkJoin([
     this.homeService.getBanners(),
     this.homeService.getHotTags(),
     this.homeService.getPerosonalSheetList(),
     this.singerService.getEnterSinger()
   ]).pipe(first());
  }
}
