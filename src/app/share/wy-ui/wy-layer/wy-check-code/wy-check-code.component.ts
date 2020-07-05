import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Component, OnInit, ChangeDetectionStrategy, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-wy-check-code',
  templateUrl: './wy-check-code.component.html',
  styleUrls: ['./wy-check-code.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WyCheckCodeComponent implements OnInit, OnChanges {

  private phoneHideStr = '';

  formModal: FormGroup;
  showRepeatBtn = false;
  showErrorTip = false;

  @Input() codePass: boolean;
  @Input() timing: number;

  @Input()
  set phone(phone: string) {
    const arr = phone.split('');
    arr.splice(3, 4, '****');
    this.phoneHideStr = arr.join('');
  }
  get phone() {
    return this.phoneHideStr;
  }

  @Output() onCheckCode = new EventEmitter<string>();
  @Output() onRepeatSentCode = new EventEmitter<void>();
  @Output() onCheckExist = new EventEmitter<void>();

  constructor() {
    this.formModal = new FormGroup({
      code: new FormControl('', [Validators.required, Validators.pattern(/\d{4}/)])
    });

    const codeControl = this.formModal.get('code');
    codeControl.statusChanges.subscribe((status) => {
      if (status === 'VALID') {
        this.onCheckCode.emit(this.formModal.get('code').value);
      }
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['timing']) {
      this.showRepeatBtn = this.timing <= 0;
    }
    if (changes['codePass'] && !changes['codePass'].firstChange) {
      this.showErrorTip = !this.codePass;
    }
  }

  ngOnInit(): void {
  }

  repeatSentCode() {
    this.onRepeatSentCode.emit();
  }

  submitRegister() {
    if (this.formModal.valid && this.codePass) {
      this.onCheckExist.emit();
    }
  }

}
