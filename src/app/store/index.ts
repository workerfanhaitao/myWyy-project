import { environment } from './../../environments/environment.prod';
import { StoreModule } from '@ngrx/store';
import { NgModule } from '@angular/core';
import { playerReducer } from './reducers/player.reducer';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { memberReducer } from './reducers/member.reducer';

@NgModule({
  declarations: [],
  imports: [
    StoreModule.forRoot({ player: playerReducer, member: memberReducer}, {
      runtimeChecks: {
        strictActionImmutability: true,
        strictStateImmutability: true,
        strictStateSerializability: true,
        strictActionSerializability: true
      }
    }),
    StoreDevtoolsModule.instrument({
      maxAge: 20, // 最大记录条数
      logOnly: environment.production // environment.production判断是否为生产环境
    })
  ]
})
export class AppStoreModule { }
