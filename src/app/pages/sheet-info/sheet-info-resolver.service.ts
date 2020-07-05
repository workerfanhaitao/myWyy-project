import { SheetService } from './../../services/sheet.service';
import { SongSheet } from './../../services/data-types/common.types';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';

@Injectable()
export class SheetInfoResolverService implements Resolve<SongSheet> {

  constructor(
    private sheetService: SheetService
  ) {}

  resolve(route: ActivatedRouteSnapshot): Observable<SongSheet> {
    return this.sheetService.getSongSheetDetail(Number(route.paramMap.get('id')));
  }
}
