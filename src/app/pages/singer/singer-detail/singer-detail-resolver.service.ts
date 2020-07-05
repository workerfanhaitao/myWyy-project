import { SingerDetail, Singer } from './../../../services/data-types/common.types';
import { SingerService } from './../../../services/singer.service';
import { first } from 'rxjs/internal/operators';
import { Injectable } from '@angular/core';
import { Observable, forkJoin } from 'rxjs';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';

type SingerDataModel = [SingerDetail, Singer[]];

@Injectable()
export class SingerDetailResolverService implements Resolve<SingerDataModel> {

  constructor(
    private singerService: SingerService
  ) {}

  resolve(route: ActivatedRouteSnapshot): Observable<SingerDataModel> {
    const id = route.paramMap.get('id');
    return forkJoin([
      this.singerService.getSingerDetail(id),
      this.singerService.getSimiSinger(id)
    ]).pipe(first());
  }
}
