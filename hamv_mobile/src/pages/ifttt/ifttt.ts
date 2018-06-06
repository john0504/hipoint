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
  selector: 'page-ifttt',
  templateUrl: 'ifttt.html',
})
export class IftttPage {

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

  openIfttt() {
    if (this.platform.is('ios')) {
      this.market.open('id660944635');
    } else if (this.platform.is('android')) {
      this.market.open('com.ifttt.ifttt');
    } else {
      const url = 'https://ifttt.com/';
      this.utilsProvider.openLink(url);
    }
  }

  openIftttDoc() {
    const url = 'https://help.ifttt.com/hc/en-us/articles/115010325748-What-is-IFTTT-';
    this.utilsProvider.openLink(url);
  }
}
