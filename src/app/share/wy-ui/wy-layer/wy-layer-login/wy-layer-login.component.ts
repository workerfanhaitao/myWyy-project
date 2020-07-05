import { Component, OnInit, ChangeDetectionStrategy, EventEmitter, Output, Input, OnChanges, SimpleChanges } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { codeJson } from 'src/app/utils/base64';

export interface LoginParams {
  phone: string;
  password: string;
  remember: boolean;
}

@Component({
  selector: 'app-wy-layer-login',
  templateUrl: './wy-layer-login.component.html',
  styleUrls: ['./wy-layer-login.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WyLayerLoginComponent implements OnInit, OnChanges {
  @Input() wyRememberLogin: LoginParams;
  @Input() visible = false;
  @Output() onChangeModalType = new EventEmitter<string | void>();
  @Output() onLogin = new EventEmitter<LoginParams>();
  formModal: FormGroup;
  constructor(private fb: FormBuilder) {

  }

  ngOnInit() {
  }

  ngOnChanges(changes: SimpleChanges): void {
    const userLoginParams = changes.wyRememberLogin;
    const visible = changes.visible;
    if (userLoginParams) {
      let phone = '';
      let password = '';
      let remember = false;
      if (userLoginParams.currentValue) {
        const value = codeJson(userLoginParams.currentValue, 'decode');
        phone = value.phone;
        password = value.password;
        remember = value.remember;
      }
      this.setModal({ phone, password, remember });
    }


    if (visible && !visible.firstChange) {
      this.formModal.markAllAsTouched();
    }
  }

  private setModal({ phone, password, remember }) {
    this.formModal = this.fb.group({
      phone: [phone, [Validators.required, Validators.pattern(/^1\d{10}$/)]],
      password: [password, [Validators.required, Validators.minLength(6)]],
      remember: [remember]
    });
  }

  submitFormData() {
    const model = this.formModal;
    if (model.valid) {
      this.onLogin.emit(model.value);
    }
  }
}
