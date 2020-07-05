import { SingerDetailComponent } from './singer-detail/singer-detail.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SingerDetailResolverService } from './singer-detail/singer-detail-resolver.service';

const routes: Routes = [{
  path: '',
  component: SingerDetailComponent,
  data: { title: '歌手详情' },
  resolve: {singerDetail: SingerDetailResolverService}
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [SingerDetailResolverService]
})
export class SingerRoutingModule { }
