import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Storage } from '@ionic/storage';

import { AppTasks } from 'app-engine';
import {
  ActionSheetController,
  AlertController,
  Config,
  IonicPage,
  NavController,
} from 'ionic-angular';

import { appConfig } from '../../app/app.config';
import { appLanguages } from '../../app/app.languages';
import { ViewStateService } from '../../providers/view-state-service';

const USER_LANGUAGE = 'userLang';

@IonicPage()
@Component({
  selector: 'page-settings',
  templateUrl: 'settings.html'
})
export class SettingsPage {
  appConfig;
  currentLang;
  supportLangs: Array<any> = [];

  constructor(
    private appTasks: AppTasks,
    private config: Config,
    private storage: Storage,
    private translate: TranslateService,
    public actionSheetCtrl: ActionSheetController,
    public alertCtrl: AlertController,
    public navCtrl: NavController,
    public viewStateService: ViewStateService,
  ) {
    this.appConfig = appConfig;
    this.supportLangs = appLanguages;
    this.storage.get(USER_LANGUAGE)
      .then((value) => {
        if (value) {
          this.currentLang = value;
        } else {
          const defaultLang = this.supportLangs[0].value;
          const deviceLang = navigator.language.toLowerCase();
          const findLang = this.supportLangs.find(({ value }) => value.toLowerCase() === deviceLang);
          this.currentLang = findLang ? findLang.value : defaultLang;
        }
      });
  }

  private changeLanguage(value) {
    this.translate.use(value).subscribe(() => this.storage.set(USER_LANGUAGE, value));
    this.translate.get('SETTINGS.BACK').subscribe(backLabel => this.config.set('ios', 'backButtonText', backLabel));
    this.currentLang = value;
  }

  private goHomePage() {
    this.navCtrl.setRoot('HomePage');
  }

  goAmazonEchoPage() {
    this.navCtrl.push('AmazonEchoPage');
  }

  goIftttPage() {
    this.navCtrl.push('IftttPage');
  }

  goGoogleHomePage() {
    this.navCtrl.push('GoogleHomePage');
  }

  logout() {
    this.appTasks.logoutTask()
      .then(() => {
        this.viewStateService.clearAll();
        this.goHomePage();
      });
  }

  languageSelect() {
    if (appLanguages.length <= 6) {
      let actionSheet = this.actionSheetCtrl.create({
        title: this.translate.instant('SETTINGS.CHOOSE_LANGUAGE'),
      });

      appLanguages.forEach((lang) => {
        const button = {
          text: lang.text,
          handler: () => this.changeLanguage(lang.value),
        };
        actionSheet.addButton(button);
      });

      actionSheet.addButton({
        text: this.translate.instant('SETTINGS.CANCEL'),
        role: 'cancel',
      });

      actionSheet.present();
    } else {
      const inputArr = [];
      appLanguages.forEach((lang) => {
        inputArr.push({
          checked: lang.value === this.currentLang,
          label: lang.text,
          type: 'radio',
          value: lang.value,
        });
      });

      let alert = this.alertCtrl.create({
        title: this.translate.instant('SETTINGS.CHOOSE_LANGUAGE'),
        inputs: inputArr,
        buttons: [
          {
            text: this.translate.instant('SETTINGS.CANCEL'),
            role: "cancel",
          },
          {
            text: this.translate.instant('SETTINGS.OK'),
            handler: value => this.changeLanguage(value),
          },
        ],
      });

      alert.present();
    }
  }
}
