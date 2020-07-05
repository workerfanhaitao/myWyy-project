import { NgModule } from '@angular/core';

// modules
import { CoreModule } from './core/core.module';

// components
import { AppComponent } from './app.component';

@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    CoreModule,
  ],
  bootstrap: [AppComponent],
})
export class AppModule { }
