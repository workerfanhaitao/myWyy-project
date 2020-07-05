import { Component, OnInit, Input, OnChanges, SimpleChanges, ChangeDetectionStrategy } from '@angular/core';
import { WySliderStyle } from './wy-slider-type';

@Component({
  selector: 'app-wy-slider-handle',
  template: `<div class="wy-slider-handle" [ngStyle]="style"></div>`,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WySliderHandleComponent implements OnInit, OnChanges {

  @Input() wyVertical = false;
  @Input() wyOffset: number;

  style: WySliderStyle = {};

  constructor() { }

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['wyOffset']) {
      this.style[this.wyVertical ? 'bottom' : 'left'] = this.wyOffset + '%';
    }
  }

}
