import { Injectable } from '@angular/core';
import { InAppBrowser, InAppBrowserOptions } from '@ionic-native/in-app-browser';
import { SafariViewController } from '@ionic-native/safari-view-controller';
import { Platform } from 'ionic-angular';

@Injectable()
export class UtilsProvider {

  constructor(
    private iab: InAppBrowser,
    private safariViewController: SafariViewController,
    private platform: Platform,
  ) {
  }

  public openLink(url: string) {
    const option: InAppBrowserOptions = {
      location: 'no',
      toolbar: 'no'
    };
    if (this.platform.is('ios')) {
      this.safariViewController
        .isAvailable()
        .then((available: boolean) => {
          if (available) {
            this.safariViewController
              .show({ url })
              .subscribe();
          } else {
            this.iab.create(url, '_self', option).show();
          }
        });
    } else {
      this.iab.create(url, '_self', option).show();
    }
  }
}