import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  {
    path: 'home',
    loadChildren: () => import('./pages/home/home.module')
    .then((mod) => mod.HomeModule)
  },
  {
    path: 'member/:id',
    loadChildren: () => import('./pages/member/member.module')
    .then((mod) => mod.MemberModule)
  },
  {
    path: 'sheet-info/:id',
    loadChildren: () => import('./pages/sheet-info/sheet-info.module')
    .then((mod) => mod.SheetInfoModule)
  },
  {
    path: 'sheet-list',
    loadChildren: () => import('./pages/sheet-list/sheet-list.module')
    .then((mod) => mod.SheetListModule)
  },
  {
    path: 'singer/:id',
    loadChildren: () => import('./pages/singer/singer.module')
    .then((mod) => mod.SingerModule)
  },
  {
    path: 'song-info/:id',
    loadChildren: () => import('./pages/song-info/song-info.module')
    .then((mod) => mod.SongInfoModule)
  },
  { path: '', redirectTo: '/home', pathMatch: 'full'},
  { path: '**', redirectTo: '/home' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    scrollPositionRestoration: "enabled"
  })],
  exports: [RouterModule],
})
export class AppRoutingModule { }
