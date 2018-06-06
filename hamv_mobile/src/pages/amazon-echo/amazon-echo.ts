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
  selector: 'page-amazon-echo',
  templateUrl: 'amazon-echo.html',
})
export class AmazonEchoPage {

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

  openAlexaSkills() {
    if (this.platform.is('ios')) {
      this.market.open('id944011620');
    } else {
      const url = 'http://alexa.amazon.com/';
      this.utilsProvider.openLink(url);
    }
  }

  openAlexaSkillsDoc() {
    const url = 'https://www.amazon.com/gp/help/customer/display.html?nodeId=201749240';
    this.utilsProvider.openLink(url);
  }
}
