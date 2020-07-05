import { Signin } from './../../services/data-types/member.type';
import { MemberService } from './../../services/member.service';
import { getMember, getUserId } from './../../store/selectors/member.selector';
import { AppStoreModule } from './../../store/index';
import { Store, select } from '@ngrx/store';
import { User } from './../../services/data-types/user.type';
import { BatchActionsService } from './../../store/batch-actions.service';
import { PlayState } from './../../store/reducers/player.reducer';
import { SheetService } from './../../services/sheet.service';
import { Banner, HotTag, SongSheet, Singer } from './../../services/data-types/common.types';
import { Component, OnInit, ViewChild } from '@angular/core';
import { NzCarouselComponent, NzMessageService } from 'ng-zorro-antd';
import { ActivatedRoute, Router } from '@angular/router';
import { map } from 'rxjs/internal/operators';
import { ModalTypes } from 'src/app/store/reducers/member.reducer';
import { timer } from 'rxjs';
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.less'],
})
export class HomeComponent implements OnInit {

  public banners: Banner[];
  public hotTags: HotTag[];
  public songSheetList: SongSheet[];
  public singerList: Singer[];
  public user: User;
  point: number;
  showPoint = false;

  public carouselActiveIndex: any;

  private playerState: PlayState;

  @ViewChild(NzCarouselComponent, { static: true }) nzCarousel: NzCarouselComponent;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private sheetService: SheetService,
    private batchActionsService: BatchActionsService,
    private store$: Store<AppStoreModule>,
    private memberService: MemberService,
    private messageService: NzMessageService
  ) {
    this.route.data.pipe(map((res) => res.homeDatas)).subscribe(([banners, hotTags, songSheetList, singerList]) => {
      this.banners = banners;
      this.hotTags = hotTags;
      this.songSheetList = songSheetList;
      this.singerList = singerList;
    });

    this.store$.pipe(select(getMember), select(getUserId)).subscribe((userId) => {
      if (userId) {
        this.getUserDetail(userId);
      } else {
        this.user = null;
      }
    });
  }

  ngOnInit(): void {}

  changeSlide(type: 'pre' | 'next') {
    this.nzCarousel[type]();
  }

  OnBeforeChange({ to }) {
    this.carouselActiveIndex = to;
  }

  private getUserDetail(userId: string) {
    this.memberService.getUserDetail(userId).subscribe((user: User) => {
      this.user = user;
    });
  }

  onPlaySheet(id: number) {
    this.sheetService.playSheet(id).subscribe((list) => {
      this.batchActionsService.selectPlayList({ list, index: 0 });
    });
  }

  toInfo(id: number) {
    this.router.navigate(['/sheet-info', id]);
  }

  openModal() {
    this.batchActionsService.controlModal(true, ModalTypes.Default);
  }

  // 签到
  signin() {
    this.memberService.signin().subscribe((res: Signin) => {
      this.alertMessage('success', '签到成功');
      this.point = res.point;
      this.showPoint = true;
      timer(1500).subscribe(() => this.showPoint = false);
    }, (error) => {
      this.alertMessage('error', error.msg || '签到失败');
    });
  }

  // 创建通知提示
  private alertMessage(type: string, msg: string) {
    this.messageService.create(type, msg);
  }
}
