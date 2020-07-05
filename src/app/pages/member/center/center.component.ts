import { findIndex } from 'src/app/utils/tool';
import { getPlayer, getCurrentSong } from './../../../store/selectors/player.selector';
import { AppStoreModule } from './../../../store/index';
import { Store, select } from '@ngrx/store';
import { NzNotificationService } from 'ng-zorro-antd';
import { SongService } from './../../../services/song.service';
import { Song } from './../../../services/data-types/common.types';
import { MemberService } from './../../../services/member.service';
import { BatchActionsService } from './../../../store/batch-actions.service';
import { SheetService } from './../../../services/sheet.service';
import { User, RecordVal, UserSheet } from './../../../services/data-types/member.type';
import { map, takeUntil } from 'rxjs/internal/operators';
import { ActivatedRoute } from '@angular/router';
import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { RecordType } from '../../../services/member.service';
import { Subject } from 'rxjs/internal/Subject';

@Component({
  selector: 'app-center',
  templateUrl: './center.component.html',
  styleUrls: ['./center.component.less']
})
export class CenterComponent implements OnInit, OnDestroy {

  user: User;
  records: RecordVal[];
  userSheet: UserSheet;
  currentSong: Song;
  currentIndex: number;
  recordType = RecordType.weekData;
  private destory$ = new Subject();

  constructor(
    private route: ActivatedRoute,
    private sheetService: SheetService,
    private batchActionsService: BatchActionsService,
    private memberService: MemberService,
    private songService: SongService,
    private notification: NzNotificationService,
    private store$: Store<AppStoreModule>,
    private cdr: ChangeDetectorRef
  ) {
    this.route.data.pipe(map((res) => res.userData)).subscribe(([User, RecordVals, UserSheet]) => {
      this.user = User;
      this.records = RecordVals.slice(0, 10);
      this.userSheet = UserSheet;
      this.listenCurrentSong();
    });
  }

  ngOnInit(): void { }

  private listenCurrentSong() {
    this.store$.pipe(select(getPlayer), select(getCurrentSong), takeUntil(this.destory$)).subscribe((song: Song) => {
      this.currentSong = song;
      if (song) {
        const songs = this.records.map((item) => item.song);
        this.currentIndex = findIndex(songs, song);
      } else {
        this.currentIndex = -1;
      }
      this.cdr.markForCheck();
    });
  }

  onPlaySheet(id: number) {
    this.sheetService.playSheet(id).subscribe((list) => {
      this.batchActionsService.selectPlayList({ list, index: 0 });
    });
  }

  onChangeType(type: RecordType) {
    if (type !== this.recordType) {
      this.recordType = type;
      this.memberService.getUserRecord(this.user.profile.userId.toString(), type).subscribe((RecordVals: RecordVal[]) => {
        this.records = RecordVals.slice(0, 10);
        this.cdr.markForCheck();
      });
    }
  }

  onAddSong([song, isPlay = false]) {
    if (!this.currentSong || this.currentSong.id !== song.id) {
      this.songService.getSongList(song).subscribe((list) => {
        if (list.length) {
          this.batchActionsService.insertSong(list[0], isPlay);
        } else {
          this.notification.error(
            '失败',
            '歌曲无url'
          );
        }
      });
    }
  }

  // 收藏
  onLikeSong(song: Song) {
    this.batchActionsService.likeSong(song.id.toString());
  }

  // 分享
  onShareSong(resource: Song, type = 'song') {
    this.batchActionsService.shareResource(resource, type);
  }

  ngOnDestroy(): void {
    this.destory$.next();
    this.destory$.complete();
  }

}
