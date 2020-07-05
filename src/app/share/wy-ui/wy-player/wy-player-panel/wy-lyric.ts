import { skip } from 'rxjs/internal/operators';
import { Lyric } from '../../../../services/data-types/common.types';
import { zip, from, Subject, timer, Subscription } from 'rxjs';

export interface BaseLyricLine {
  txt: string;
  txtCn: string;
}

interface LyricLine extends BaseLyricLine {
  time: number;
}

interface Handler extends BaseLyricLine {
  lineNum: number;
}

const timeExp = /\[(\d{1,2}):(\d{2})(?:\.\d{2,3})?\]/;

export class WyLyric {
  private lrc: Lyric;
  private playing: boolean;
  private timer: Subscription;

  handler = new Subject<Handler>();
  curNum: number;
  startStamp: number;
  pauseStamp: number;
  lines: LyricLine[] = [];

  constructor(lrc: Lyric) {
    this.lrc = lrc;
    this.init();
  }

  private init() {
    if (this.lrc.lyric) {
      if (this.lrc.tlyric) {
        this.generTLyric();
      } else {
        this.generLyric();
      }
    }
  }

  private generLyric() {
    const lines = this.lrc.lyric.split('\n');
    lines.forEach((line) => this.makeLine(line));
  }

  private generTLyric() {
    const lines = this.lrc.lyric.split('\n');
    const tlines = this.lrc.tlyric.split('\n').filter((item) => timeExp.exec(item));

    const moreLine = lines.length - tlines.length;

    let tempArr = [];
    if (moreLine >= 0) {
      tempArr = [lines, tlines];
    } else {
      tempArr = [tlines, lines];
    }
    let first;
    if (tempArr[1].length > 0) {
      first = timeExp.exec(tempArr[1][0])[0];
    } else {
      first = null;
    }
    const skipIndex = lines.findIndex((item) => {
      const exec = timeExp.exec(item);
      if (exec) {
        return exec[0] === first;
      }
    });
    const skipNumber = skipIndex === -1 ? 0 : skipIndex;
    const skipItems = tempArr[0].slice(0, skipNumber);
    if (skipItems.length) {
      skipItems.forEach((line) => this.makeLine(line));
    }

    let zipLines;
    if (moreLine > 0) {
      zipLines = zip(from(lines).pipe(skip(skipNumber)), from(tlines));
    } else {
      zipLines = zip(from(lines), from(tlines).pipe(skip(skipNumber)));
    }
    zipLines.subscribe(([line, tline]) => this.makeLine(line, tline));
  }

  private makeLine(line: string, tline = '') {
    const result = timeExp.exec(line);
    if (result) {
      const txt = line.replace(timeExp, '').trim();
      const txtCn = tline ? tline.replace(timeExp, '').trim() : '';
      if (txt) {
        const thirdResult = result[3] || '00';
        const trueThirdResult = thirdResult.length > 2 ? parseInt(thirdResult, 10) : parseInt(thirdResult, 10) * 10;
        const time = Number(result[1]) * 60 * 1000 + Number(result[2]) * 1000 + trueThirdResult;
        this.lines.push({ txt, txtCn, time });
      }
    }
  }

  play(startTime = 0, skip = false) {
    if (!this.lines.length) { return; }
    if (!this.playing) {
      this.playing = true;
    }
    this.curNum = this.findCurNum(startTime);
    this.startStamp = Date.now() - startTime;

    if (!skip) {
      this.callHandler(this.curNum - 1);
    }
    if (this.curNum < this.lines.length) {
      if (this.timer) {
        this.timer.unsubscribe();
      }
      this.playReset();
    }
  }

  private playReset() {
    const line = this.lines[this.curNum];
    const delay = line.time - (Date.now() - this.startStamp);
    this.timer = timer(delay).subscribe(() => {
      this.callHandler(this.curNum++);
      if (this.curNum < this.lines.length && this.playing) {
        this.playReset();
      }
    });
  }

  private callHandler(i: number) {
    if (i > 0) {
      this.handler.next({
        txt: this.lines[i].txt,
        txtCn: this.lines[i].txtCn,
        lineNum: i
      });
    }
  }

  private findCurNum(time: number): number {
    const index = this.lines.findIndex((item) => time <= item.time);
    return index === -1 ? this.lines.length - 1 : index;
  }

  togglePlay(playing: boolean) {
    const now = Date.now();
    this.playing = playing;
    if (playing) {
      const startTime = (this.pauseStamp || now) - (this.startStamp || now);
      this.play(startTime, true);
    } else {
      this.stop();
      this.pauseStamp = now;
    }
  }

  stop() {
    if (this.playing) {
      this.playing = false;
    }
    if (this.timer) {
      this.timer.unsubscribe();
    }
  }

  seek(time: number) {
    this.play(time);
  }
}
