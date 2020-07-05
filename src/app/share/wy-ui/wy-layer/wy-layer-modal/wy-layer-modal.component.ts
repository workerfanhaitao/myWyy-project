import { DOCUMENT } from '@angular/common';
import { BatchActionsService } from './../../../../store/batch-actions.service';
import { Overlay, OverlayRef, OverlayKeyboardDispatcher, BlockScrollStrategy, OverlayContainer } from '@angular/cdk/overlay';
import { ModalTypes } from './../../../../store/reducers/member.reducer';
import { Component, OnInit, ChangeDetectionStrategy, ElementRef, ChangeDetectorRef, ViewChild, AfterViewInit,
  Renderer2, Inject, Input, SimpleChanges, OnChanges} from '@angular/core';
import { ESCAPE } from '@angular/cdk/keycodes';
import { WINDOW } from '../../../../services/services.module';
import { trigger, state, style, transition, animate } from '@angular/animations';

@Component({
  selector: 'app-wy-layer-modal',
  templateUrl: './wy-layer-modal.component.html',
  styleUrls: ['./wy-layer-modal.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [trigger('showHide', [
    state('show', style({ transform: 'scale(1)', opacity: 1 })),
    state('hide', style({ transform: 'scale(0)', opacity: 0 })),
    transition('show <=> hide', animate('0.1s'))
  ])]
})
export class WyLayerModalComponent implements OnInit, AfterViewInit, OnChanges {

  modalTitle = {
    register: '注册',
    loginByPhone: '手机登录',
    share: '分享',
    like: '收藏',
    default: ''
  };

  @ViewChild('modalContainer', { static: false }) private modalRef: ElementRef;

  @Input() visible = false;
  @Input() currentModalType: ModalTypes.Default;
  @Input() showSpin = false;

  private overlayRef: OverlayRef;
  private scrollStategy: BlockScrollStrategy;
  private resizeHandler: () => void;
  private overlayContainerEl: HTMLElement;

  showModal = 'hide';

  constructor(
    @Inject(DOCUMENT) private doc: Document,
    @Inject(WINDOW) private win: Window,
    private overlay: Overlay,
    private elementRef: ElementRef,
    private overlayKeyboardDispatcher: OverlayKeyboardDispatcher,
    private cdr: ChangeDetectorRef,
    private batchActionsService: BatchActionsService,
    private rd: Renderer2,
    private overlayContainerServe: OverlayContainer
  ) {
    this.scrollStategy = this.overlay.scrollStrategies.block();
  }

  ngOnInit(): void {
    this.createOverlay();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['visible'] && !changes['visible'].firstChange) {
      this.handleVisibleChange(this.visible);
    }
  }

  ngAfterViewInit() {
    this.overlayContainerEl = this.overlayContainerServe.getContainerElement();
    this.listenResizeToCenter();
    this.simpleDrapModal();
  }

  // 普通方法实现modal拖拽
  simpleDrapModal() {
    const modal = this.modalRef.nativeElement;
    let isDrag = false;
    let initialX = null;
    let initialY = null;

    modal.addEventListener('mousedown', (e) => {
      const { left, top } = modal.getBoundingClientRect();
      initialX = e.clientX - left;
      initialY = e.clientY - top;
      if (initialY < 38) {
        isDrag = true;
      }
    });

    document.addEventListener('mouseup', (e) => {
      isDrag = false;
    });

    document.addEventListener('mousemove', (e: any) => {
      if (isDrag) {
        modal.style.left = e.clientX - initialX + 'px';
        modal.style.top = e.clientY - initialY + 'px';
      }
    });
  }

  // rxjs实现拖拽
  // rxjsDragModal() {
  //   const modal = this.modalRef.nativeElement;
  //   const mouseDown = fromEvent(modal, 'mousedown');
  //   const mouseMove = fromEvent(this.doc, 'mousemove');
  //   const mouseUp = fromEvent(this.doc, 'mouseup');

  //   mouseDown.pipe(
  //     map((e: any) => {
  //       const { left, top } = e.target.getBoundingClientRect();
  //       const clickOffsetX = e.clientX - left;
  //       const clickOffsetY = e.clientY - top;
  //       if (clickOffsetY < 38) {
  //         return {
  //           clickOffsetX,
  //           clickOffsetY
  //         };
  //       } else {
  //         return {};
  //       }
  //     }),
  //     map(({ clickOffsetX, clickOffsetY }) => {
  //       return mouseMove.pipe(
  //         takeUntil(mouseUp),
  //         map((moveEvent: any) => ({
  //           x: moveEvent.clientX - clickOffsetX,
  //           y: moveEvent.clientY - clickOffsetY
  //         }))
  //       );
  //     }),
  //     concatAll()
  //   ).subscribe(({ x, y }) => {
  //     modal.style.left = x + 'px';
  //     modal.style.top = y + 'px';
  //   });
  // }

  listenResizeToCenter() {
    const modal = this.modalRef.nativeElement;
    const modalSize = this.getHideDomSize(modal);
    this.keepCenter(modal, modalSize);
    this.resizeHandler = this.rd.listen('window', 'resize', () => this.keepCenter(modal, modalSize));
  }

  // 弹窗居中
  keepCenter(modal: HTMLElement, size: {w: number, h: number}) {
    const left = (this.getWindowSize().w - size.w) / 2;
    const top = (this.getWindowSize().h - size.h) / 2;
    modal.style.left = left + 'px';
    modal.style.top = top + 'px';
  }

  private handleVisibleChange(visible: boolean) {
    this.showModal = visible ? 'show' : 'hide';
    if (visible) {
      this.scrollStategy.enable();
      this.overlayKeyboardDispatcher.add(this.overlayRef);
      this.listenResizeToCenter();
      this.changePointerEvents('auto');
    } else {
      this.scrollStategy.disable();
      this.overlayKeyboardDispatcher.remove(this.overlayRef);
      this.resizeHandler();
      this.changePointerEvents('none');
    }
    this.cdr.markForCheck();
  }

  // 为overlay浮层出现时增加点击浮层外不会触发事件的效果
  private changePointerEvents(type: 'none' | 'auto') {
    if (this.overlayContainerEl) {
      this.overlayContainerEl.style.pointerEvents = type;
    }
  }

  private createOverlay() {
    this.overlayRef = this.overlay.create();
    this.overlayRef.overlayElement.appendChild(this.elementRef.nativeElement);
    this.overlayRef.keydownEvents().subscribe((e) => this.keydownListener(e));
  }

  private keydownListener(evt: KeyboardEvent) {
    if (evt.keyCode === ESCAPE) {
      this.batchActionsService.controlModal(false);
    }
  }

  closeThisModal() {
    this.batchActionsService.controlModal(false);
  }

  private getHideDomSize(dom: HTMLElement) {
    return {
      w: dom.offsetWidth,
      h: dom.offsetHeight
    };
  }

  private getWindowSize() {
    return {
      w: this.win.innerWidth || this.doc.documentElement.clientWidth || this.doc.body.offsetWidth,
      h: this.win.innerHeight || this.doc.documentElement.clientHeight || this.doc.body.offsetHeight
    };
  }

}
