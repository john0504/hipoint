import { Component } from '@angular/core';
import { IonicPage, Platform } from 'ionic-angular';
import { Market } from '@ionic-native/market';
import { StateStore } from 'app-engine';

import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { first } from 'rxjs/operators';

import { appConfig } from '../../app/app.config';
import { ThemeService } from '../../providers/theme-service';
import { UtilsProvider } from '../../providers/utils-provider';

@IonicPage()
@Component({
  selector: 'page-google-home',
  templateUrl: 'google-home.html',
})
export class GoogleHomePage {
  private subs: Array<Subscription>;
  private userMe$: Observable<any>;

  userMe;
  appConfig;

  constructor(
    private market: Market,
    private platform: Platform,
    private stateStore: StateStore,
    private utilsProvider: UtilsProvider,
    public themeService: ThemeService,
  ) {
    this.subs = [];
    this.userMe$ = this.stateStore.userMe$;
    this.appConfig = appConfig;
  }

  ionViewWillEnter() {
    this.subs.push(
      this.userMe$
        .pipe(first())
        .subscribe(me => this.userMe = me)
    );
  }

  ionViewDidLeave() {
    this.subs && this.subs.forEach((s) => {
      s.unsubscribe();
    });
    this.subs.length = 0;
  }

  openGoogleHome() {
    if (this.platform.is('ios')) {
      this.market.open('id680819774');
    } else if (this.platform.is('android')) {
      this.market.open('com.google.android.apps.chromecast.app');
    } else {
      const url = 'https://www.google.com/url?q=https://support.google.com/googlehome/answer/7073578?hl%3Den&sa=D&ust=1514861183149000&usg=AFQjCNGMgCFcV5dtpXBnJWYR7efOUU3atg';
      this.utilsProvider.openLink(url);
    }
  }

  openGoogleHomeDoc() {
    const url = 'https://www.google.com/url?q=https://support.google.com/googlehome/answer/7073578?hl%3Den&sa=D&ust=1514861183149000&usg=AFQjCNGMgCFcV5dtpXBnJWYR7efOUU3atg';
    this.utilsProvider.openLink(url);
  }
}
