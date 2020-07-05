import { ShareModule } from './../../share/share.module';
import { NgModule } from '@angular/core';

import { SheetListRoutingModule } from './sheet-list-routing.module';
import { SheetListComponent } from './sheet-list.component';

@NgModule({
  declarations: [SheetListComponent],
  imports: [
    ShareModule,
    SheetListRoutingModule
  ]
})
export class SheetListModule { }
