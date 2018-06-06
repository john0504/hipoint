import { Directive } from '@angular/core';
import { Platform } from 'ionic-angular';
import { TranslateService } from '@ngx-translate/core';

import {
  AppTasks,
  Logger,
} from 'app-engine';

import { PopupService } from '../../providers/popup-service';

@Directive({
  selector: '[fb-login]',
  host: {
    '(click)': 'fbLogin()',
  }
})
export class FbLoginDirective {
  constructor(
    private appTasks: AppTasks,
    private platform: Platform,
    private popupService: PopupService,
    private translate: TranslateService,
  ) {
  }

  fbLogin() {
    const unregister = this.platform.registerBackButtonAction(() => {
      Logger.log('Block back button event temporarily.');
    }, 9007199254740901);

    const loginPromise = this.appTasks.loginWithFacebookTask()
      .then(() => unregister())
      .catch(e => {
        setTimeout(() => unregister(), 200);
        if (!(e.errorCode === '4201' || (typeof e === 'string' && e.includes('cancelled')))) throw e;
      });

    const loggingContent = this.translate.instant('FB_LOGIN.LOGGING_IN');
    const issueHappenedMsg = this.translate.instant('FB_LOGIN.ISSUE_HAPPENED_MSG');

    this.popupService.loadingPopup(
      loginPromise,
      { content: loggingContent },
    );

    this.popupService.toastPopup(
      loginPromise,
      null,
      {
        message: issueHappenedMsg,
        duration: 3000
      },
    );
  }

}
