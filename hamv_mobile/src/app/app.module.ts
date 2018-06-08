import { NgModule, 
  // ErrorHandler 
} from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { IonicApp, IonicModule, 
  // IonicErrorHandler
 } from 'ionic-angular';
import { MyApp, MyModalWrapper } from './app.component';

import { ComponentsModule } from '../components/components.module';
import { DirectivesModule } from '../directives/directives.module';
import { InformationModelModule } from '../modules/information-model';

import { AppVersion } from '@ionic-native/app-version';
import { Deeplinks } from '@ionic-native/deeplinks';
import { Device } from '@ionic-native/device';
import { EmailComposer } from '@ionic-native/email-composer';
import { Market } from '@ionic-native/market';
import { OpenNativeSettings } from '@ionic-native/open-native-settings';
import { SafariViewController } from '@ionic-native/safari-view-controller';
import { SplashScreen } from '@ionic-native/splash-screen';
import { InAppBrowser } from '@ionic-native/in-app-browser';
import { Insomnia } from '@ionic-native/insomnia';
import { SocialSharing } from '@ionic-native/social-sharing';
import { File } from '@ionic-native/file';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

import { CheckNetworkService } from '../providers/check-network';
import { DeviceConfigService } from '../providers/device-config-service';
import { DeviceControlService } from '../providers/device-control-service';
import { PopupService } from '../providers/popup-service';
import { ViewStateService } from '../providers/view-state-service';
import { HockeyApp } from '../providers/hockey-app';
import { OtaUpdatePopup } from '../providers/ota-update-popup';
import { OtaUpdateResult } from '../providers/ota-update-result';
import { ScheduleAdapterService } from '../providers/schedule-adapter-service';
import { ThemeService } from '../providers/theme-service';
import { UtilsProvider } from '../providers/utils-provider';

import { AppEngineModule, ReduxModule } from 'app-engine';

export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

@NgModule({
  declarations: [
    MyApp,
    MyModalWrapper,
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    IonicModule.forRoot(MyApp),
    AppEngineModule,
    ReduxModule,
    InformationModelModule.forRoot(),
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: (createTranslateLoader),
        deps: [HttpClient]
      },
    }),
    ComponentsModule,
    DirectivesModule,
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    MyModalWrapper,
  ],
  providers: [
    AppVersion,
    Deeplinks,
    Device,
    EmailComposer,
    SafariViewController,
    SplashScreen,
    InAppBrowser,
    Insomnia,
    SocialSharing,
    File,
    // { provide: ErrorHandler, useClass: IonicErrorHandler },
    CheckNetworkService,
    DeviceConfigService,
    DeviceControlService,
    Market,
    OtaUpdatePopup,
    OtaUpdateResult,
    PopupService,
    ViewStateService,
    HockeyApp,
    OpenNativeSettings,
    ScheduleAdapterService,
    ThemeService,
    UtilsProvider,
  ]
})
export class AppModule { }
