import { SetShareInfo } from './../../store/actions/member.actions';
import { MemberService } from './../../services/member.service';
import { findIndex } from 'src/app/utils/tool';
import { BatchActionsService } from './../../store/batch-actions.service';
import { SongService } from './../../services/song.service';
import { getPlayer, getCurrentSong } from './../../store/selectors/player.selector';
import { AppStoreModule } from './../../store/index';
import { Store, select } from '@ngrx/store';
import { SongSheet, Song, Singer } from './../../services/data-types/common.types';
import { map, takeUntil } from 'rxjs/internal/operators';
import { ActivatedRoute } from '@angular/router';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { NzMessageService } from 'ng-zorro-antd';

@Component({
  selector: 'app-sheet-info',
  templateUrl: './sheet-info.component.html',
  styleUrls: ['./sheet-info.component.less']
})
export class SheetInfoComponent implements OnInit, OnDestroy {

  sheetInfo: SongSheet;
  description = {
    short: '',
    long: ''
  };
  controlDesc = {
    isExpand: false,
    label: '展开',
    iconCls: 'down'
  };
  currentSong: Song;
  currentIndex = -1;

  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private store$: Store<AppStoreModule>,
    private songService: SongService,
    private batchActionsService: BatchActionsService,
    private memberService: MemberService,
    private messageService: NzMessageService
  ) {
    this.route.data.pipe((map((res) => res.sheetInfo))).subscribe((res) => {
      this.sheetInfo = res;
      if (res.description) {
        this.changeDesc(res.description);
      }
      this.listenCurrent();
    });
  }

  ngOnInit(): void {}

  private listenCurrent() {
    this.store$.pipe(select(getPlayer), select(getCurrentSong), takeUntil(this.destroy$)).subscribe((song) => {
      this.currentSong = song;
      if (song) {
        this.currentIndex = findIndex(this.sheetInfo.tracks, song);
      } else {
        this.currentIndex = -1;
      }
    });
  }

  private changeDesc(desc: string) {
    const trueDesc = desc.replace(/\n/g, '<br />');
    if (desc.length < 99) {
      this.description = {
        short: this.replaceBr('<b>介绍: </b>' + desc),
        long: ''
      };
    } else {
      this.description = {
        short: this.replaceBr('<b>介绍: </b>' + desc.slice(0, 99) + '...'),
        long: this.replaceBr('<b>介绍: </b>' + desc)
      };
    }
  }

  private replaceBr(str: string): string {
    return str.replace(/\n/g, '<br />');
  }

  toggleDesc() {
    this.controlDesc.isExpand = !this.controlDesc.isExpand;
    if (this.controlDesc.isExpand) {
      this.controlDesc.label = '收起';
      this.controlDesc.iconCls = 'up';
    } else {
      this.controlDesc.label = '展开';
      this.controlDesc.iconCls = 'down';
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
        this.alertMessage('error', '歌曲无url');
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
          this.alertMessage('error', '歌曲无url');
        }
      });
    }
  }

  // 收藏歌曲
  onLikeSong(song: Song) {
    this.batchActionsService.likeSong(song.id.toString());
  }

  // 收藏歌单
  onLikeSheet(id: number) {
    this.memberService.likeSheet(id).subscribe(() => {
      this.alertMessage('success', '收藏成功');
    }, (error) => {
      this.alertMessage('error', error.msg || '收藏失败');
    });
  }

  // 分享
  shareResource(resource: Song | SongSheet, type = 'song') {
    this.batchActionsService.shareResource(resource, type);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private alertMessage(type: string, msg: string) {
    this.messageService.create(type, msg);
  }

}
