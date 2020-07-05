import { takeUntil } from 'rxjs/internal/operators';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Component, OnInit, ChangeDetectionStrategy, forwardRef, ViewChild, ElementRef, AfterViewInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { Subject, fromEvent } from 'rxjs';
import { BACKSPACE } from '@angular/cdk/keycodes'

const CODELEN = 4;

@Component({
  selector: 'app-wy-code',
  templateUrl: './wy-code.component.html',
  styleUrls: ['./wy-code.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => WyCodeComponent),
      multi: true
    }
  ]
})
export class WyCodeComponent implements OnInit, ControlValueAccessor, AfterViewInit, OnDestroy {
  
  inputArr = [];

  inputEl: HTMLElement[];

  private code: string;

  result: string[] = [];

  currentFocusIndex = 0;

  private destory$ = new Subject();

  @ViewChild('codeWrap', { static: true }) private codeWrap: ElementRef;

  constructor(
    private cdr: ChangeDetectorRef
  ) {
    this.inputArr = Array(CODELEN).fill('');
  }
  
  ngAfterViewInit(): void {
    this.inputEl = this.codeWrap.nativeElement.getElementsByClassName('item') as HTMLElement[];
    this.inputEl[0].focus();
    for (let i = 0; i < this.inputEl.length; i++) {
      const item = this.inputEl[i];
      fromEvent(item, 'keyup').pipe(takeUntil(this.destory$)).subscribe((event: KeyboardEvent) => this.listenKeyUp(event));
      fromEvent(item, 'click').pipe(takeUntil(this.destory$)).subscribe(() => { this.currentFocusIndex = i });
    }
  }

  private listenKeyUp(event: KeyboardEvent) {
    const target = <HTMLInputElement>event.target;
    const value = target.value;
    const isBackSpace = event.keyCode === BACKSPACE;
    if (/\D/.test(value)) {
      target.value = '';
      this.result[this.currentFocusIndex] = '';
    } else if (value) {
      this.result[this.currentFocusIndex] = value;
      this.currentFocusIndex = (this.currentFocusIndex + 1) % CODELEN;
      this.inputEl[this.currentFocusIndex].focus();
    } else if (isBackSpace) {
      this.result[this.currentFocusIndex] = '';
      this.currentFocusIndex = Math.max(this.currentFocusIndex - 1, 0);
      this.inputEl[this.currentFocusIndex].focus();
    }
    this.checkResult(this.result);
    console.log('this.result', this.result);
  }

  private checkResult(result: string[]) {
    const codeStr = result.join('');
    this.setValue(codeStr);
  }

  private setValue(code: string) {
    this.code = code;
    this.onValueChange(code);
    this.cdr.markForCheck();
  }

  private onValueChange(value: string): void {}
  private onTouched(): void {}

  writeValue(value: any): void {
    this.setValue(value);
  }
  registerOnChange(fn: (value: string) => void): void {
    this.onValueChange = fn;
  }
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  ngOnInit(): void {
  }

  ngOnDestroy() {
    this.destory$.next();
    this.destory$.complete();
  }
}
