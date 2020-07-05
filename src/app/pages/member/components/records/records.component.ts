import { Song } from './../../../../services/data-types/common.types';
import { RecordType } from './../../../../services/member.service';
import { RecordVal } from './../../../../services/data-types/member.type';
import { Component, OnInit, ChangeDetectionStrategy, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-records',
  templateUrl: './records.component.html',
  styleUrls: ['./records.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RecordsComponent implements OnInit {

  @Input() records: RecordVal[];
  @Input() recordType = RecordType.weekData;
  @Input() listenSongs = 0;
  @Input() currentIndex = -1;

  @Output() onChangeType = new EventEmitter<RecordType>();
  @Output() onAddSong = new EventEmitter<[Song, boolean]>();
  @Output() onLikeSong = new EventEmitter<Song>();
  @Output() onShareSong = new EventEmitter<Song>();

  constructor() { }

  ngOnInit(): void {
  }

}
