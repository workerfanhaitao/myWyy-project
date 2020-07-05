import { SetShareInfo } from './../../../store/actions/member.actions';
import { CurrentActions } from './../../../store/reducers/player.reducer';
import { BatchActionsService } from './../../../store/batch-actions.service';
import { WyPlayerPanelComponent } from './wy-player-panel/wy-player-panel.component';
import { PlayMode } from './player-type';
import { SetCurrentIndex, SetPlayMode, SetPlayList, SetCurrentAction } from './../../../store/actions/player.actions';
import { Song, Singer } from './../../../services/data-types/common.types';
import { getSongList, getPlayList, getCurrentIndex, getPlayer,
  getPlayMode, getPlaying, getCurrentSong, getCurrentAction } from './../../../store/selectors/player.selector';
import { AppStoreModule } from './../../../store/index';
import { Component, OnInit, ViewChild, ElementRef, Inject } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { Subscription, timer } from 'rxjs';
import { DOCUMENT } from '@angular/common';
import { shuffle, findIndex } from '../../../utils/tool';
import { NzModalService } from 'ng-zorro-antd';
import { Router } from '@angular/router';
import { trigger, state, style, transition, animate, AnimationEvent } from '@angular/animations';

const modeTypes: PlayMode[] = [{
  type: 'loop',
  label: '循环',
}, {
  type: 'random',
  label: '随机',
}, {
  type: 'singleLoop',
  label: '单曲循环',
}];

enum Tiptitles {
  Add = '已添加到列表',
  Play = '已开始播放'
}

@Component({
  selector: 'app-wy-player',
  templateUrl: './wy-player.component.html',
  styleUrls: ['./wy-player.component.less'],
  animations: [
    trigger('showHide', [
      state('show', style({ bottom: 0})),
      state('hide', style({ bottom: -70 })),
      transition('show=>hide', [animate('0.3s')]),
      transition('hide=>show', [animate('0.1s')])
    ])
  ]
})
export class WyPlayerComponent implements OnInit {

  @ViewChild('audio', { static: true }) private audio: ElementRef;
  @ViewChild(WyPlayerPanelComponent, { static: false }) private playerPanel: WyPlayerPanelComponent;
  private audioEl: HTMLAudioElement;

  percent = 0;
  bufferPercent = 0;
  showPlayer = 'hide';
  isLocked = false;
  // 动画是否正在进行
  animating = false;

  controlTooltip = {
    title: '',
    show: false
  };

  // ngrx实现监听音乐播放的动作
  songList: Song[];
  playList: Song[];
  currentIndex: number;
  currentSong: Song;

  currentTime: number;
  duration: number;

  // 播放状态
  playing: boolean;

  // 是否可以播放
  songRedy: boolean;

  // 音量
  volume = 60;

  // 控制音量显示 | 隐藏
  showVolumePanel = false;
  // 控制播放列表面板显示 | 隐藏
  showPlayListPanel = false;

  // 是否绑定指令事件
  bindFlag = false;

  // 当前模式
  currentPlayMode: PlayMode;
  modeCount = 0;

  private windowClick: Subscription;

  constructor(
    private store$: Store<AppStoreModule>,
    @Inject(DOCUMENT) private doc: Document,
    private nzModalServe: NzModalService,
    private batchActionsService: BatchActionsService,
    private router: Router
  ) {
    // ngrx实现监听音乐播放的动作
    const appStore$ = this.store$.pipe(select(getPlayer));
    appStore$.pipe(select(getSongList)).subscribe((songList: Song[]) => {
      this.songList = songList;
    });
    appStore$.pipe(select(getPlayList)).subscribe((playList: Song[]) => {
      this.playList = playList;
    });
    appStore$.pipe(select(getCurrentIndex)).subscribe((currentIndex: number) => {
      this.currentIndex = currentIndex;
    });
    appStore$.pipe(select(getPlayMode)).subscribe((playMode: PlayMode) => {
      this.currentPlayMode = playMode;
      if (this.songList) {
        let list = this.songList.slice();
        if (playMode.type === 'random') {
          list = shuffle(this.songList);
        }
        this.updateCurrentIndex(list, this.currentSong);
        this.store$.dispatch(SetPlayList({ playList: list }));
      }
    });
    appStore$.pipe(select(getPlaying)).subscribe((playing: boolean) => {
      this.playing = playing;
    });
    appStore$.pipe(select(getCurrentSong)).subscribe((currentSong: Song) => {
      this.currentSong = currentSong;
      if (!currentSong) {
        this.bufferPercent = 0;
      } else {
        this.duration = this.currentSong.dt / 1000;
      }
    });
    appStore$.pipe(select(getCurrentAction)).subscribe((currentAction: CurrentActions) => {
      const title = Tiptitles[CurrentActions[currentAction]];
      if (title) {
        this.controlTooltip.title = title;
        if (this.showPlayer === 'hide') {
          this.togglePlayer('show');
        } else {
          this.showToolTip();
        }
      }
      console.log(CurrentActions[currentAction]);
      this.store$.dispatch(SetCurrentAction({ currentAction: CurrentActions.Other }));
    });
  }

  ngOnInit(): void {
    this.audioEl = this.audio.nativeElement;
  }

  private showToolTip() {
    this.controlTooltip.show = true;
    timer(1500).subscribe(() => {
      this.controlTooltip = {
        title: '',
        show: false
      };
    });
  }

  onAnimateDone(event: AnimationEvent) {
    this.animating = false;
    if (event.toState === 'show' && this.controlTooltip.title) {
      this.showToolTip();
    }
  }

  // 监听播放进度
  onPercentChange(per: number) {
    if (this.currentSong) {
      const currentTime = this.duration * (per / 100);
      this.audioEl.currentTime = currentTime;
      if (this.playerPanel) {
        this.playerPanel.seekLyric(currentTime * 1000);
      }
    }
  }

  // 监听音量变化
  onVolumeChange(per: number) {
    this.audioEl.volume = per / 100;
  }

  // 控制音量面板显示 | 隐藏
  toggleVolumePanel(event: MouseEvent) {
    this.togglePanel('showVolumePanel');
  }

  // 控制列表面板显示 | 隐藏
  togglePlayListPanel(event: MouseEvent) {
    if (this.songList.length) {
      this.togglePanel('showPlayListPanel');
    }
  }

  togglePanel(type: string) {
    this[type] = !this[type];
    this.bindFlag = (this.showVolumePanel || this.showPlayListPanel);
  }

  onClickOutSide(target: HTMLElement) {
    if (target.dataset.act !== 'delete') {
      this.showVolumePanel = false;
      this.showPlayListPanel = false;
      this.bindFlag = false;
    }
  }

  // 绑定全局click事件
  // private bindDocumentClickListener() {
  //   if (!this.windowClick) {
  //     this.windowClick = fromEvent(this.doc, 'click').subscribe(() => {
  //       if (!this.selfClick) {   // 点击了播放器以外的部分
  //         this.showVolumePanel = false;
  //         this.showPlayListPanel = false;
  //         this.unbindDocumentClickListener();
  //       }
  //       this.selfClick = false;
  //     });
  //   }
  // }
  // // 解绑全局click事件
  // private unbindDocumentClickListener() {
  //   if (this.windowClick) {
  //     this.windowClick.unsubscribe();
  //     this.windowClick = null;
  //   }
  // }

  // 改变播放模式
  changePlayMode() {
    this.store$.dispatch(SetPlayMode({ playMode: modeTypes[++this.modeCount % 3] }));
  }
  // 当播放模式改变时使当前播放歌曲不受影响
  private updateCurrentIndex(list: Song[], song: Song) {
    const newIndex = findIndex(list, song);
    this.store$.dispatch(SetCurrentIndex({ currentIndex: newIndex }));
  }

  // 播放/暂停
  onToggle() {
    if (!this.currentSong) {
      if (this.playList.length) {
        this.updateIndex(0);
      }
    } else {
      if (this.songRedy) {
        this.playing = !this.playing;
        if (this.playing) {
          this.audioEl.play();
        } else {
          this.audioEl.pause();
        }
      }
    }
  }

  // 上一曲
  onPrev(index: number) {
    if (!this.songRedy) { return; }
    const newIndex = index < 0 ? this.playList.length - 1 : index;
    this.updateIndex(newIndex);
  }

   // 下一曲
  onNext(index: number) {
    console.log(index);
    if (this.playList.length === 1) {
      this.onCanplay();
    } else {
      if (!this.songRedy) { return; }
      const newIndex = index >= this.playList.length ? 0 : index;
      this.updateIndex(newIndex);
    }
  }

  // 歌曲结束
  onEnded() {
    this.playing = false;
    if (this.currentPlayMode.type === 'singleLoop') {
      this.loop();
    } else {
      this.onNext(this.currentIndex + 1);
    }
  }

  // 单曲循环
  private loop() {
    this.audioEl.currentTime = 0;
    this.play();
    if (this.playerPanel) {
      this.playerPanel.seekLyric(0);
    }
  }

  private updateIndex(index: number) {
    console.log(index);
    this.store$.dispatch(SetCurrentIndex({ currentIndex: index }));
    this.songRedy = false;
  }

  onCanplay() {
    this.songRedy = true;
    this.play();
  }

  onTimeUpdate(e: Event) {
    this.currentTime = (e.target as HTMLAudioElement).currentTime;
    this.percent = this.currentTime / this.duration * 100;
    const buffered = this.audioEl.buffered;
    if (buffered.length && this.bufferPercent < 100) {
      this.bufferPercent = (buffered.end(0) / this.duration * 100);
    }
  }

  private play() {
    this.playing = true;
    this.audioEl.play();
  }

  get picUrl(): string {
    return this.currentSong ? this.currentSong.al.picUrl : '//s4.music.126.net/style/web2/img/default/default_album.jpg';
  }

  // 面板列表选择歌曲
  onPlayThisSong(song: Song) {
    this.updateCurrentIndex(this.playList, song);
  }

  // 删除歌曲
  onDeleteSong(song: Song) {
    this.batchActionsService.DeleteSong(song);
  }
  // 清空歌曲列表
  onClearSong() {
    this.nzModalServe.confirm({
      nzTitle: '确认清空列表?',
      nzOnOk: () => {
        this.batchActionsService.ClearSong();
      }
    });
  }

  // 跳转
  toInfo(path: [string, number]) {
    if (path[1]) {
      this.showPlayListPanel = false;
      this.showVolumePanel = false;
      this.router.navigate(path);
    }
  }

  // 切换player面板的显示隐藏
  togglePlayer(type: string) {
    if (!this.isLocked && !this.animating) {
      this.showPlayer = type;
    }
  }

  // 收藏歌曲
  onLikeSong(song: Song) {
    this.batchActionsService.likeSong(song.id.toString());
  }

  // 分享
  onShareSong(resource: Song, type = 'song') {
    this.batchActionsService.shareResource(resource, type);
  }
}
