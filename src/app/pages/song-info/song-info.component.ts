import { getPlayer, getCurrentSong } from './../../store/selectors/player.selector';
import { Store, select } from '@ngrx/store';
import { AppStoreModule } from './../../store/index';
import { NzNotificationService } from 'ng-zorro-antd';
import { BatchActionsService } from './../../store/batch-actions.service';
import { SongService } from './../../services/song.service';
import { WyLyric, BaseLyricLine } from './../../share/wy-ui/wy-player/wy-player-panel/wy-lyric';
import { Song } from './../../services/data-types/common.types';
import { map, takeUntil } from 'rxjs/internal/operators';
import { ActivatedRoute } from '@angular/router';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-song-info',
  templateUrl: './song-info.component.html',
  styleUrls: ['./song-info.component.less']
})
export class SongInfoComponent implements OnInit, OnDestroy {

  song: Song;
  lyric: BaseLyricLine[];
  controlLyric = {
    isExpand: false,
    label: '展开',
    iconCls: 'down'
  };
  currentSong: Song;

  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private songService: SongService,
    private batchActionsService: BatchActionsService,
    private notification: NzNotificationService,
    private store$: Store<AppStoreModule>
  ) {
    this.route.data.pipe(map((res) => res.songInfoDatas)).subscribe(([song, lyric]) => {
      this.song = song;
      this.lyric = new WyLyric(lyric).lines;
    });
    this.listenCurrent();
  }

  ngOnInit(): void {}

  toggleLyric() {
    this.controlLyric.isExpand = !this.controlLyric.isExpand;
    if (this.controlLyric.isExpand) {
      this.controlLyric.label = '收起';
      this.controlLyric.iconCls = 'up';
    } else {
      this.controlLyric.label = '展开';
      this.controlLyric.iconCls = 'down';
    }
  }

  private listenCurrent() {
    this.store$.pipe(select(getPlayer), select(getCurrentSong), takeUntil(this.destroy$)).subscribe((song) => this.currentSong = song);
  }

  // 添加歌曲
  onAddSong(song: Song, isPlay = false) {
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
    this.destroy$.next();
    this.destroy$.complete();
  }

}
