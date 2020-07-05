import { Component, OnInit, ViewEncapsulation, ChangeDetectionStrategy,
  ViewChild, ElementRef, AfterViewInit, Input, OnChanges, SimpleChanges, Output, EventEmitter } from '@angular/core';
// 引入better scroll插件
import BScroll from '@better-scroll/core';
import ScrollBar from '@better-scroll/scroll-bar';
import MouseWheel from '@better-scroll/mouse-wheel';
import { timer } from 'rxjs';

BScroll.use(ScrollBar);
BScroll.use(MouseWheel);

@Component({
  selector: 'app-wy-scroll',
  template: `
    <div class="wy-scroll" #wrap>
      <ng-content></ng-content>
    </div>
  `,
  styles: [`.wy-scroll {width:100%; height:100%; overflow: hidden}`],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WyScrollComponent implements OnInit, AfterViewInit, OnChanges {

  @ViewChild('wrap', {static: true}) private wrapRef: ElementRef;

  @Input() data: any[];

  @Output() private onScrollEnd = new EventEmitter<number>();

  private bs: BScroll;

  constructor(
   public el: ElementRef
  ) { }

  ngOnInit(): void {
  }

  ngAfterViewInit() {
    this.bs = new BScroll(this.wrapRef.nativeElement, {
      scrollbar: {
        interactive: true
      },
      mouseWheel: {}
    });
    this.bs.on('scrollEnd', ({ y }) => this.onScrollEnd.emit(y));
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data']) {
      this.refreshScroll();
    }
  }

  refreshScroll() {
    timer(50).subscribe(() => {
      this.bs.refresh();
    });
  }

  scrollTo(...args) {
    this.bs.scrollTo.apply(this.bs, args);
  }
  scrollToElement(...args) {
    this.bs.scrollToElement.apply(this.bs, args);
  }

}
