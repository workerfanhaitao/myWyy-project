import { MemberService } from './../../../services/member.service';
import { NzNotificationService } from 'ng-zorro-antd';
import { BatchActionsService } from './../../../store/batch-actions.service';
import { SongService } from './../../../services/song.service';
import { findIndex } from 'src/app/utils/tool';
import { getPlayer, getCurrentSong } from './../../../store/selectors/player.selector';
import { AppStoreModule } from './../../../store/index';
import { Store, select } from '@ngrx/store';
import { SingerDetail, Song, Singer } from './../../../services/data-types/common.types';
import { ActivatedRoute } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { map, takeUntil } from 'rxjs/internal/operators';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-singer-detail',
  templateUrl: './singer-detail.component.html',
  styleUrls: ['./singer-detail.component.less']
})
export class SingerDetailComponent implements OnInit {

  singerDetail: SingerDetail;
  simiSingers: Singer[];
  currentSong: Song;
  currentIndex = -1;
  singerHasLike = false;

  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private store$: Store<AppStoreModule>,
    private songService: SongService,
    private batchActionsService: BatchActionsService,
    private notification: NzNotificationService,
    private memberService: MemberService
  ) {
    this.route.data.pipe(map((res) => res.singerDetail)).subscribe(([detail, simiSingers]) => {
      this.singerDetail = detail;
      this.simiSingers = simiSingers;
    });
    this.listenCurrent();
  }

  ngOnInit(): void {
  }

  private listenCurrent() {
    this.store$.pipe(select(getPlayer), select(getCurrentSong), takeUntil(this.destroy$)).subscribe((song) => {
      this.currentSong = song;
      if (song) {
        this.currentIndex = findIndex(this.singerDetail.hotSongs, song);
      } else {
        this.currentIndex = -1;
      }
    });
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

  // 添加歌单
  onAddSongs(songList: Song[], isPlay = false) {
    this.songService.getSongList(songList).subscribe((list) => {
      if (list.length) {
        if (isPlay) {
          this.batchActionsService.selectPlayList({ list, index: 0 });
        } else {
          this.batchActionsService.insertSongs(list);
        }
      } else {
        this.notification.error(
          '失败',
          '歌曲无url'
        );
      }
    });
  }

  // 收藏
  onLikeSong(song: Song) {
    this.batchActionsService.likeSong(song.id.toString());
  }

  // 分享
  onShareSong(resource: Song, type = 'song') {
    this.batchActionsService.shareResource(resource, type);
  }

  // 批量收藏
  onLikeSongs(songs: Song[]) {
    const ids = songs.map((item) => item.id).join(',');
    this.batchActionsService.likeSong(ids);
  }

  // 收藏 | 取消收藏 歌手
  onLikeSinger(singerId: number) {
    let typeInfo = {
      type: 1,
      msg: '收藏'
    };
    if (this.singerHasLike) {
      typeInfo = {
        type: 2,
        msg: '取消收藏'
      };
    }
    this.memberService.likeSinger(singerId, typeInfo.type).subscribe(() => {
      this.singerHasLike = !this.singerHasLike;
      this.notification.success(
        'success',
        typeInfo.msg + '成功'
      );
    }, (error) => {
      this.notification.error(
        '失败',
        typeInfo.msg + '失败:' + error.msg
      );
    });
  }
}
