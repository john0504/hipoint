import { NgModule } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

import { TabIndexDirective } from './tab-index/tab-index';
import { SendLogReportDirective } from './send-log-report/send-log-report';
import { FbLoginDirective } from './fb-login/fb-login';
import { RippleEffectDirective } from './ripple-effect/ripple-effect';

@NgModule({
  declarations: [
    FbLoginDirective,
    RippleEffectDirective,
    SendLogReportDirective,
    TabIndexDirective,
  ],
  imports: [
    TranslateModule,
  ],
  exports: [
    FbLoginDirective,
    RippleEffectDirective,
    SendLogReportDirective,
    TabIndexDirective,
  ]
})
export class DirectivesModule { }
