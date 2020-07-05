import { FormGroup, FormControl, Validators } from '@angular/forms';
import { SongSheet } from './../../../../services/data-types/common.types';
import { Component, OnInit, ChangeDetectionStrategy, Input, OnChanges, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { LikeSongParams } from 'src/app/services/member.service';
import { timer } from 'rxjs';

@Component({
  selector: 'app-wy-layer-like',
  templateUrl: './wy-layer-like.component.html',
  styleUrls: ['./wy-layer-like.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WyLayerLikeComponent implements OnInit, OnChanges {

  @Input() mySheets: SongSheet[];
  @Input() likeId: string;
  @Input() visible: boolean;
  @Output() onLikeSong = new EventEmitter<LikeSongParams>();
  @Output() onCreateSheet = new EventEmitter<string>();

  creating = false;
  formModal: FormGroup;

  constructor() {
    this.formModal = new FormGroup({
      sheetName: new FormControl('', [Validators.required]),
    });
  }

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['visible'] && !changes['visible'].firstChange) {
      if (!this.visible) {
        this.formModal.get('sheetName').reset();
        timer(500).subscribe(() => this.creating = false);
      }
    }
  }

  onLike(pid: string) {
    this.onLikeSong.emit({ pid, tracks: this.likeId });
  }

  onSubmit() {
    this.onCreateSheet.emit(this.formModal.get('sheetName').value);
  }

}
