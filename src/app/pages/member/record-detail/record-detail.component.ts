import { Subject } from 'rxjs/internal/Subject';
import { AppStoreModule } from './../../../store/index';
import { Store, select } from '@ngrx/store';
import { NzNotificationService } from 'ng-zorro-antd';
import { BatchActionsService } from './../../../store/batch-actions.service';
import { SongService } from './../../../services/song.service';
import { Song } from './../../../services/data-types/common.types';
import { RecordType, MemberService } from './../../../services/member.service';
import { RecordVal } from './../../../services/data-types/member.type';
import { User } from './../../../services/data-types/user.type';
import { ActivatedRoute } from '@angular/router';
import { Component, OnInit, ChangeDetectionStrategy, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { map, takeUntil } from 'rxjs/internal/operators';
import { getPlayer, getCurrentSong } from 'src/app/store/selectors/player.selector';
import { findIndex } from 'src/app/utils/tool';

@Component({
  selector: 'app-record-detail',
  templateUrl: './record-detail.component.html',
  styles: [`.record-detail .page-wrap { padding: 40px; }`],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RecordDetailComponent implements OnInit, OnDestroy {
  user: User;
  records: RecordVal[];
  recordType = RecordType.weekData;
  currentIndex = -1;

  private currentSong: Song;
  private destory$ = new Subject();

  constructor(
    private route: ActivatedRoute,
    private memberService: MemberService,
    private songService: SongService,
    private batchActionsService: BatchActionsService,
    private notification: NzNotificationService,
    private store$: Store<AppStoreModule>,
    private cdr: ChangeDetectorRef
  ) {
    this.route.data.pipe(map((res) => res.userData)).subscribe(([User, RecordVals]) => {
      this.user = User;
      this.records = RecordVals;
      this.listenCurrentSong();
    });
  }

  ngOnInit(): void {
  }

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

  onChangeType(type: RecordType) {
    if (type !== this.recordType) {
      this.recordType = type;
      this.memberService.getUserRecord(this.user.profile.userId.toString(), type).subscribe((RecordVals: RecordVal[]) => {
        this.records = RecordVals;
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

  ngOnDestroy() {
    this.destory$.next();
    this.destory$.complete();
  }

}
