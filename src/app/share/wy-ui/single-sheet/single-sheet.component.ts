import { SongSheet } from './../../../services/data-types/common.types';
import { Component, OnInit, Input, ChangeDetectionStrategy, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-single-sheet',
  templateUrl: './single-sheet.component.html',
  styleUrls: ['./single-sheet.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SingleSheetComponent implements OnInit {

  @Input() sheet: SongSheet;

  @Output() onPlay = new EventEmitter<number>();

  constructor() { }

  ngOnInit(): void {
  }

  playSheet(evt: MouseEvent, id: number) {
    evt.stopPropagation();
    this.onPlay.emit(id);
  }

  get coverImg(): string {
    return this.sheet.picUrl || this.sheet.coverImgUrl;
  }

}
