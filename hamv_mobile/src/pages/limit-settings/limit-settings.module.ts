import { LimitSettingsPage } from './limit-settings';
import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TranslateModule } from '@ngx-translate/core';
import { ComponentsModule } from '../../components/components.module';
import { DirectivesModule } from '../../directives/directives.module';
import { InformationModelModule } from '../../modules/information-model/information-model.module';

@NgModule({
  declarations: [
    LimitSettingsPage
  ],
  imports: [
    IonicPageModule.forChild(LimitSettingsPage),
    TranslateModule,
    ComponentsModule,
    DirectivesModule,
    InformationModelModule,
  ],
  entryComponents: [
    LimitSettingsPage
  ]
})
export class LimitSettingsPageModule { }