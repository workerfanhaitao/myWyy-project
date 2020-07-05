import { SliderEventObservableConfig } from './wy-slider-type';
import { Component, OnInit, ViewEncapsulation, ChangeDetectionStrategy, ElementRef, ViewChild, Input, Inject,
  ChangeDetectorRef, OnDestroy, forwardRef, EventEmitter, Output} from '@angular/core';
import { Observable, fromEvent, merge, Subscription } from 'rxjs';
import { filter, pluck, map, tap, distinctUntilChanged, takeUntil } from 'rxjs/internal/operators';
import { DOCUMENT } from '@angular/common';
import { sliderEvent } from './wy-slider-helper';
import { inArray, getElementOffset, limitNumberInRange, valueEqual} from '../../../utils/tool';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-wy-slider',
  templateUrl: './wy-slider.component.html',
  styleUrls: ['./wy-slider.component.less'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush, // 使用OnPush策略后,static属性(例如Input)不发生变化,则不会出现变更检测
  providers: [{
    provide: NG_VALUE_ACCESSOR, // 组件注册
    useExisting: forwardRef(() => WySliderComponent),
    multi: true
  }]
})
export class WySliderComponent implements OnInit, OnDestroy, ControlValueAccessor {

  @Input() wyVertical: false;
  @Input() wyMin = 0;
  @Input() wyMax = 100;
  @Input() bufferPercent: number | null = 0;

  @Output() wyOnAfterChange = new EventEmitter<number | null>();

  @ViewChild('wySlider', { static: true }) private wySlider: ElementRef;

  private sliderDom: HTMLDivElement;
  // 绑定流的状态3个变量
  private dragStart$: Observable<number>;
  private dragMove$: Observable<number>;
  private dragEnd$: Observable<Event>;
  // 解绑流的状态的3个变量
  private dragStart$B: Subscription | null;
  private dragMove$B: Subscription | null;
  private dragEnd$B: Subscription | null;

  private isDragging: boolean;
  value: number | null;
  offset: number | null;

  constructor(
    @Inject(DOCUMENT) private doc: Document,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.sliderDom = this.wySlider.nativeElement;
    this.createDraggingObservables();
    this.subscribeDrag(['start']);
  }

  private createDraggingObservables() {
    const orient = this.wyVertical ? 'pageY' : 'pageX';
    const mouse: SliderEventObservableConfig = {
      start: 'mousedown',
      move: 'mousemove',
      end: 'mouseup',
      filter: (e: MouseEvent) => e instanceof MouseEvent,
      pluckKey: [orient]
    };

    const touch: SliderEventObservableConfig = {
      start: 'touchstart',
      move: 'touchmove',
      end: 'touchend',
      filter: (e: TouchEvent) => e instanceof TouchEvent,
      pluckKey: ['touches', '0', orient]
    };

    [mouse, touch].forEach((source) => {
      const { start, move, end, filter: filterFct, pluckKey } = source;
      source.startPlucked$ = fromEvent(this.sliderDom, start)
      .pipe(
        filter(filterFct),
        tap(sliderEvent),
        pluck(...pluckKey),
        map((position: number) => this.findClosestValue(position))
      );

      source.end$ = fromEvent(this.doc, end);
      source.moveResolve$ = fromEvent(this.doc, move)
      .pipe(
        filter(filterFct),
        tap(sliderEvent),
        pluck(...pluckKey),
        distinctUntilChanged(),
        map((position: number) => this.findClosestValue(position)),
        takeUntil(source.end$)
      );
    });
    this.dragStart$ = merge(mouse.startPlucked$, touch.startPlucked$);
    this.dragMove$ = merge(mouse.moveResolve$, touch.moveResolve$);
    this.dragEnd$ = merge(mouse.end$, touch.end$);
  }

  private subscribeDrag(events: string[] = ['start', 'move', 'end']) {
    if (inArray(events, 'start') && this.dragStart$ && !this.dragStart$B) {
      this.dragStart$B = this.dragStart$.subscribe(this.onDragStart.bind(this));
    }
    if (inArray(events, 'move') && this.dragMove$ && !this.dragMove$B) {
      this.dragMove$B = this.dragMove$.subscribe(this.onDragMove.bind(this));
    }
    if (inArray(events, 'end') && this.dragEnd$ && !this.dragEnd$B) {
      this.dragEnd$B = this.dragEnd$.subscribe(this.onDragEnd.bind(this));
    }
  }

  private unsubscribeDrag(events: string[] = ['start', 'move', 'end']) {
    if (inArray(events, 'start') && this.dragStart$B) {
      this.dragStart$B.unsubscribe();
      this.dragStart$B = null;
    }
    if (inArray(events, 'move') && this.dragMove$B) {
      this.dragMove$B.unsubscribe();
      this.dragMove$B = null;
    }
    if (inArray(events, 'end') && this.dragEnd$B) {
      this.dragEnd$B.unsubscribe();
      this.dragEnd$B = null;
    }
  }

  private onDragStart(value: number) {
    this.toggleDragMoving(true);
    this.setValue(value);
  }

  private onDragMove(value) {
    if (this.isDragging) {
      this.setValue(value);
      this.cdr.markForCheck();
    }
  }

  private onDragEnd() {
    this.wyOnAfterChange.emit(this.value);
    this.toggleDragMoving(false);
    this.cdr.markForCheck();
  }

  private setValue(value: number | null, needCheck = false) {
    if (needCheck) {
      if (this.isDragging) { return null; }
      this.value = this.formatValue(value);
      this.updateTrackAndHandles();
    } else {
      if (!valueEqual(this.value, value)) {
        this.value = value;
        this.updateTrackAndHandles();
        this.onValueChange(this.value);
      }
    }
  }

  formatValue(value: number | null): (number | null) {
    let res = value;
    if (this.assertValueVaild(value)) {
      res = this.wyMin;
    } else {
      res = limitNumberInRange(value, this.wyMin, this.wyMax);
    }
    return res;
  }
  // 判断是否为NAN
  private assertValueVaild(value: number | null): boolean {
    return isNaN(typeof value !== 'number' ? parseFloat(value) : value);
  }

  private updateTrackAndHandles() {
    this.offset = ((this.value - this.wyMin) / (this.wyMax - this.wyMin) * 100);
    this.cdr.markForCheck();
  }

  private toggleDragMoving(movable: boolean) {
    this.isDragging = movable;
    if (movable) {
      this.subscribeDrag(['move', 'end']);
    } else {
      this.unsubscribeDrag(['move', 'end']);
    }
  }

  private findClosestValue(position: number): number {
    // 获取滑块总长
    const sliderLength: number = this.wyVertical ? this.sliderDom.clientHeight : this.sliderDom.clientWidth;

    // 获取滑块(左, 下)端点位置
    const offset = getElementOffset(this.sliderDom);
    const sliderStart: number = this.wyVertical ? offset.top : offset.left;

    // 滑块当前位置 / 总长
    const ratio = limitNumberInRange((position - sliderStart) / sliderLength, 0, 1);
    const trueRatio = this.wyVertical ? (1 - ratio) : ratio;

    return trueRatio * (this.wyMax - this.wyMin) + this.wyMin;
  }

  private onValueChange(value: number | null): void {}
  private onValueTouched(): void {}

  // 将表单模型中的值写入视图中
  writeValue(value: number | null): void {
    this.setValue(value);
  }
  // 注册在视图中的某些内容发生更改时应调用的处理程序
  registerOnChange(fn: (value: number | null) => void): void {
    this.onValueChange = fn;
  }
  // 为控件接收触摸事件时注册一个处理程序
  registerOnTouched(fn: () => void): void {
    this.onValueTouched = fn;
  }

  // 组件销毁
  ngOnDestroy(): void {
    this.unsubscribeDrag();
  }
}
