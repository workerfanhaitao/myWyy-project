import { User } from './../../../services/data-types/user.type';
import { UserSheet, RecordVal } from './../../../services/data-types/member.type';
import { MemberService, RecordType } from './../../../services/member.service';
import { Injectable } from '@angular/core';
import { Resolve, Router, ActivatedRouteSnapshot } from '@angular/router';
import { Observable, forkJoin } from 'rxjs';
import { first } from 'rxjs/internal/operators';

type UserDataType = [User, RecordVal[], UserSheet];

@Injectable()
export class CenterResolverService implements Resolve<UserDataType> {
  constructor(
    private memberService: MemberService,
    private router: Router
  ) {}

  resolve(route: ActivatedRouteSnapshot): Observable<UserDataType> {
    const uid = route.paramMap.get('id');
    if (uid) {
    return forkJoin([
      this.memberService.getUserDetail(uid),
      this.memberService.getUserRecord(uid),
      this.memberService.getUserSheets(uid)
    ]).pipe(first());
    } else {
      this.router.navigate(['/home']);
    }
  }
}
