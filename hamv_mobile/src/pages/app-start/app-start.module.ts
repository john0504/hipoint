import { AppStartPage } from './app-start';
import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TranslateModule } from '@ngx-translate/core';
import { ComponentsModule } from '../../components/components.module';
import { DirectivesModule } from '../../directives/directives.module';

@NgModule({
  declarations: [
    AppStartPage
  ],
  imports: [
    IonicPageModule.forChild(AppStartPage),
    TranslateModule,
    ComponentsModule,
    DirectivesModule,
  ],
  entryComponents: [
    AppStartPage
  ]
})
export class AppStartPageModule { }