import { NzMessageService } from 'ng-zorro-antd';
import { MemberService } from './../../../../services/member.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Component, OnInit, ChangeDetectionStrategy, Input, Output, EventEmitter, OnChanges, SimpleChanges,
  ChangeDetectorRef } from '@angular/core';
import { interval } from 'rxjs';
import { take } from 'rxjs/internal/operators';

@Component({
  selector: 'app-wy-layer-register',
  templateUrl: './wy-layer-register.component.html',
  styles: [`
    .m-footer{
      padding: 0 19px;
      height: 48px;
      border-top: 1px solid #c6c6c6;
      border-radius: 0 0 4px 4px;
      line-height: 48px;
      background-color: #f7f7f7;
      a{
        display: block;
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WyLayerRegisterComponent implements OnInit, OnChanges {

  @Input() visible = false;

  @Output() onChangeModalType = new EventEmitter<string | void>();
  @Output() onRegister = new EventEmitter<string>();

  formModal: FormGroup;
  timing: number;
  showCode = false;

  codePass: boolean;

  constructor(
    private fb: FormBuilder,
    private memberService: MemberService,
    private messageService: NzMessageService,
    private cdr: ChangeDetectorRef
  ) {
    this.formModal = this.fb.group({
      phone: ['', [Validators.required, Validators.pattern(/^1\d{10}$/)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['visible'] && !changes['visible'].firstChange) {
      this.formModal.markAllAsTouched();
      if (!this.visible) {
        this.showCode = false;
      }
    }
  }

  ngOnInit(): void {
  }

  submitRegister() {
    if (this.formModal.valid) {
      this.sentCode();
    }
  }

  sentCode() {
    this.memberService.sentCode(this.formModal.get('phone').value).subscribe(() => {
      this.timing = 60;
      if (!this.showCode) {
        this.showCode = true;
      }
      this.cdr.markForCheck();
      interval(1000).pipe(take(60)).subscribe(() => {
        this.timing--;
        this.cdr.markForCheck();
      });
    }, (error) => this.messageService.error(error.message));
  }

  changeType() {
    this.onChangeModalType.emit();
    this.showCode = false;
    this.formModal.reset();
  }

  onCheckCode(code: string) {
    this.memberService.verifyCode(this.formModal.get('phone').value, Number(code)).subscribe(() => {
      this.codePass = true;
      this.messageService.success('验证成功');
    }, () => {
      this.codePass = false;
      this.messageService.error('验证码错误');
    });
  }

  onCheckExist() {
    const phone = this.formModal.get('phone').value;
    this.memberService.checkExist(Number(phone)).subscribe(() => {
      this.onRegister.emit(phone);
    }, () => {
      this.messageService.error('帐号已存在,忘记密码?');
    });
  }
}
