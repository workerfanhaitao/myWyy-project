import { SearchResult } from './../../../services/data-types/common.types';
import { pluck, debounceTime, distinctUntilChanged } from 'rxjs/internal/operators';
import { Component, OnInit, Input, TemplateRef, ElementRef, ViewChild, AfterViewInit, Output, EventEmitter, OnChanges,
  SimpleChanges, ViewContainerRef} from '@angular/core';
import { fromEvent } from 'rxjs';
import { isEmptyObject } from '../../../utils/tool';
import { Overlay } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { WySearchPanelComponent } from './wy-search-panel/wy-search-panel.component';

@Component({
  selector: 'app-wy-search',
  templateUrl: './wy-search.component.html',
  styleUrls: ['./wy-search.component.less']
})
export class WySearchComponent implements OnInit, AfterViewInit, OnChanges {

  @Input() searchResult: SearchResult;
  @Input() connectedRef: ElementRef;
  @Output() onSearch = new EventEmitter<string>();
  @ViewChild('nzInput', { static: false }) private nzInput: ElementRef;
  @ViewChild('search', { static: false }) private defaultRef: ElementRef;

  private overlayRef: any;

  constructor(
    private overlay: Overlay,
    private viewContainerRef: ViewContainerRef
  ) { }

  ngOnInit(): void {}

  ngAfterViewInit() {
    fromEvent(this.nzInput.nativeElement, 'input')
    .pipe(
      debounceTime(1000),
      distinctUntilChanged(),
      pluck('target', 'value')
    ).subscribe((value: string) => {
      console.log('value', value);
      this.onSearch.emit(value);
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['searchResult'] && !changes['searchResult'].firstChange) {
      if (!isEmptyObject(this.searchResult)) {
        console.log(this.searchResult);
        this.showOverlayPanel();
      } else {
        this.hideOverlayPanel();
      }
    }
  }

  onFocus() {
    if (this.searchResult && !isEmptyObject(this.searchResult)) {
      this.showOverlayPanel();
    }
  }

  onBlur() {
    this.hideOverlayPanel();
  }

  showOverlayPanel() {
    this.hideOverlayPanel();
    const positionStrategy = this.overlay.position().
    flexibleConnectedTo(this.connectedRef || this.defaultRef).   // 传入参照DOM进行参照
    withPositions([{
      originX: 'start',
      originY: 'bottom',
      overlayX: 'start',
      overlayY: 'top'
    }]).
    withLockedPosition(true); // 设置浮层是否锁定(不随滚动而移动)
    this.overlayRef = this.overlay.create({
      // width: 200, // 自定义浮层宽高
      // hasBackdrop: true, // 启用浮层背景
      positionStrategy,  // 自定义浮层位置
      scrollStrategy: this.overlay.scrollStrategies.reposition()
    });
    const panelPortal = new ComponentPortal(WySearchPanelComponent, this.viewContainerRef);
    const panelRef = this.overlayRef.attach(panelPortal);
    panelRef.instance.searchResult = this.searchResult;
    this.overlayRef.backdropClick().subscribe((res) => { // 浮层外点击事件
      this.hideOverlayPanel();
    });
  }

  hideOverlayPanel() {
    if (this.overlayRef && this.overlayRef.hasAttached) {
      this.overlayRef.dispose();
    }
  }

}
