import { User } from '../../../services/data-types/user.type';
import { RecordVal } from '../../../services/data-types/member.type';
import { MemberService } from '../../../services/member.service';
import { Injectable } from '@angular/core';
import { Resolve, Router, ActivatedRouteSnapshot } from '@angular/router';
import { Observable, forkJoin } from 'rxjs';
import { first } from 'rxjs/internal/operators';

type RecordsDataType = [User, RecordVal[]];

@Injectable()
export class RecordResolverService implements Resolve<RecordsDataType> {
  constructor(
    private memberService: MemberService,
    private router: Router
  ) {}

  resolve(route: ActivatedRouteSnapshot): Observable<RecordsDataType> {
    const uid = route.paramMap.get('id');
    if (uid) {
    return forkJoin([
      this.memberService.getUserDetail(uid),
      this.memberService.getUserRecord(uid),
    ]).pipe(first());
    } else {
      this.router.navigate(['/home']);
    }
  }
}
