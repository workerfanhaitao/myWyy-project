import { ImgDefaultDirective } from './../directives/img-default.directive';
import { WyLayerModule } from './wy-layer/wy-layer.module';
import { WySearchModule } from './wy-search/wy-search.module';
import { NgModule } from '@angular/core';
import { SingleSheetComponent } from './single-sheet/single-sheet.component';
import { PlayCountPipe } from '../pipes/play-count.pipe';
import { WyPlayerModule } from './wy-player/wy-player.module';

@NgModule({
  declarations: [SingleSheetComponent, PlayCountPipe, ImgDefaultDirective],
  imports: [
    WyPlayerModule,
    WySearchModule,
    WyLayerModule,
  ],
  exports: [
    SingleSheetComponent,
    PlayCountPipe,
    WyPlayerModule,
    WySearchModule,
    WyLayerModule,
    ImgDefaultDirective,
  ]
})
export class WyUiModule { }
