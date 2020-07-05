import { WyUiModule } from './wy-ui/wy-ui.module';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';

import { NzButtonModule, NzMenuModule, NzLayoutModule, NzInputModule, NzIconModule, NzCarouselModule, NzModalModule,
NzRadioModule, NzPaginationModule, NzTagModule, NzTableModule, NzNotificationModule, NzMessageModule, NzAvatarModule,
NzToolTipModule,
NzDividerModule, 
NzProgressModule,
NzBackTopModule} from 'ng-zorro-antd';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    NzButtonModule,
    NzMenuModule,
    NzLayoutModule,
    NzInputModule,
    NzIconModule,
    NzCarouselModule,
    WyUiModule,
    NzModalModule,
    NzRadioModule,
    NzPaginationModule,
    NzTagModule,
    NzTableModule,
    NzNotificationModule,
    NzMessageModule,
    NzAvatarModule,
    NzToolTipModule,
    NzDividerModule,
    NzProgressModule,
    NzBackTopModule
  ],
  exports: [
    CommonModule,
    FormsModule,
    NzButtonModule,
    NzMenuModule,
    NzLayoutModule,
    NzInputModule,
    NzIconModule,
    NzCarouselModule,
    WyUiModule,
    NzModalModule,
    NzRadioModule,
    NzPaginationModule,
    NzTagModule,
    NzTableModule,
    NzNotificationModule,
    NzMessageModule,
    NzAvatarModule,
    NzToolTipModule,
    NzDividerModule,
    NzProgressModule,
    NzBackTopModule,
  ],
})
export class ShareModule { }
