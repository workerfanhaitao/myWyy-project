import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ShareInfo } from './../../../../store/reducers/member.reducer';
import { Component, OnInit, ChangeDetectionStrategy, Input, Output, EventEmitter, OnChanges, SimpleChange, SimpleChanges } from '@angular/core';
import { ShareParams } from '../../../../services/member.service';

const MAX_MSG = 140;

@Component({
  selector: 'app-wy-layer-share',
  templateUrl: './wy-layer-share.component.html',
  styleUrls: ['./wy-layer-share.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WyLayerShareComponent implements OnInit, OnChanges {

  @Input() shareInfo: ShareInfo;
  @Input() visible = false;

  @Output() onCancel = new EventEmitter<void>();
  @Output() shareResource = new EventEmitter<ShareParams>();

  formModal: FormGroup;

  surplusMsgCount = MAX_MSG;

  constructor() {}

  ngOnInit(): void {
    this.formModal = new FormGroup({
      shareMsg: new FormControl('', [Validators.maxLength(MAX_MSG)])
    });
    this.formModal.get('shareMsg').valueChanges.subscribe((msg) => {
      this.surplusMsgCount = MAX_MSG - msg.length;
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['shareInfo'] && !changes['shareInfo'].firstChange) {
      this.formModal.get('shareMsg').reset('');
    }
    if (changes['visible'] && !changes['visible'].firstChange) {
      this.formModal.get('shareMsg').markAsTouched();
    }
  }

  shareSubmit() {
    this.shareResource.emit({
      id: this.shareInfo.id,
      msg: this.formModal.get('shareMsg').value,
      type: this.shareInfo.type
    });
  }

}
