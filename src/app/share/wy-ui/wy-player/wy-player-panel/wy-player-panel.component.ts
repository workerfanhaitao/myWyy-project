import { BatchActionsService } from './../../../../store/batch-actions.service';
import { SongService } from './../../../../services/song.service';
import { WyScrollComponent } from './../wy-scroll/wy-scroll.component';
import { Song } from './../../../../services/data-types/common.types';
import { Component, OnInit, Input, OnChanges, SimpleChanges, Output, EventEmitter, ViewChildren,
QueryList } from '@angular/core';
import { timer } from 'rxjs';
import { findIndex } from 'src/app/utils/tool';
import { WyLyric, BaseLyricLine } from './wy-lyric';
import { Router } from '@angular/router';

@Component({
  selector: 'app-wy-player-panel',
  templateUrl: './wy-player-panel.component.html',
  styleUrls: ['./wy-player-panel.component.less']
})
export class WyPlayerPanelComponent implements OnInit, OnChanges {

  @Input() playing: boolean;
  @Input() songList: Song[];
  @Input() currentSong: Song;
  @Input() showPanel: boolean;

  @Output() onClose = new EventEmitter<void>();
  @Output() onPlayThisSong = new EventEmitter<Song>();
  @Output() onDeleteSong = new EventEmitter<Song>();
  @Output() onClearSong = new EventEmitter<void>();
  @Output() onLikeSong = new EventEmitter<Song>();
  @Output() onShareSong = new EventEmitter<Song>();

  scrollY = 0;

  currentIndex: number;
  currentLyric: BaseLyricLine[];
  currentLineNum: number;

  private lyric: WyLyric;
  private lyricRefs: NodeList;
  private startLine = 2;

  @ViewChildren(WyScrollComponent) private wyScroll: QueryList<WyScrollComponent>;
  constructor(
    private songService: SongService,
    private router: Router,
    private batchActionsService: BatchActionsService
  ) { }

  ngOnInit(): void {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['playing']) {
      if (!changes['playing'].firstChange) {
        if (this.lyric) {
          this.lyric.togglePlay(this.playing);
        }
      }
    }
    if (changes['songList']) {
      if (this.currentSong) {
        this.updataCurrentIndex();
      }
    }
    if (changes['currentSong']) {
      if (this.currentSong) {
        this.updateLyric(this.currentSong.id);
        this.updataCurrentIndex();
        if (this.showPanel) {
          this.scrollToCurrent();
        }
      } else {
        this.resetLyric();
      }
    }

    if (changes['showPanel']) {
      if (!changes['showPanel'].firstChange && this.showPanel) {
        this.wyScroll.first.refreshScroll();
        this.wyScroll.last.refreshScroll();
        timer(80).subscribe(() => {
          if (this.currentSong) {
            this.scrollToCurrent(0);
          }
          if (this.lyricRefs) {
            if (this.currentLineNum - this.startLine > 0) {
              this.wyScroll.last.scrollToElement(this.lyricRefs[this.currentLineNum - this.startLine], 0, false, false);
            }
          }
        });
      }
    }
  }

  scrollToCurrent(scrollSpeed = 300 ) {
    const songListRefs = this.wyScroll.first.el.nativeElement.querySelectorAll('ul li');
    if (songListRefs.length) {
      const currentLi = songListRefs[this.currentIndex | 0] as HTMLElement;
      const offsetTop = currentLi.offsetTop;
      const offsetHeight = currentLi.offsetHeight;
      if ((offsetTop - Math.abs(this.scrollY) > offsetHeight * 5) || (offsetTop < Math.abs(this.scrollY))) {
        this.wyScroll.first.scrollToElement(currentLi, scrollSpeed, false, false);
      }
    }
  }

  updateLyric(songId: any) {
    this.resetLyric();
    this.songService.getLyric(songId).subscribe((res) => {
      this.lyric = new WyLyric(res);
      this.currentLyric = this.lyric.lines;
      this.startLine = res.tlyric ? 1 : 2;
      this.handleLyric(this.startLine);
      this.wyScroll.last.scrollTo(0, 0);
      if (this.playing) {
        this.lyric.play();
      }
    });
  }

  private handleLyric(startLine = 2) {
    this.lyric.handler.subscribe(({lineNum}) => {
      if (!this.lyricRefs) {
        this.lyricRefs = this.wyScroll.last.el.nativeElement.querySelectorAll('ul li');
      }
      if (this.lyricRefs.length > 0) {
        this.currentLineNum = lineNum;
        if (lineNum > startLine) {
          this.wyScroll.last.scrollToElement(this.lyricRefs[lineNum - startLine], 300, false, false);
        } else {
          this.wyScroll.last.scrollTo(0, 0);
        }
      }
    });
  }

  private resetLyric() {
    if (this.lyric) {
      this.lyric.stop();
      this.lyric = null;
      this.currentLyric = [];
      this.currentLineNum = 0;
      this.lyricRefs = null;
    }
  }

  seekLyric(time: number) {
    if (this.lyric) {
      this.lyric.seek(time);
    }
  }

  private updataCurrentIndex() {
    this.currentIndex = findIndex(this.songList, this.currentSong);
  }

  toInfo(e: MouseEvent, path: [string, number]) {
    e.stopPropagation();
    this.router.navigate(path);
  }

  likeSong(e: MouseEvent) {
    e.stopPropagation();
    this.onLikeSong.emit(this.currentSong);
  }

  shareSong(e: MouseEvent) {
    e.stopPropagation();
    this.onShareSong.emit(this.currentSong);
  }

  // 批量收藏
  onLikeSongs(songs: Song[]) {
    const ids = songs.map((item) => item.id).join(',');
    this.batchActionsService.likeSong(ids);
  }
}
