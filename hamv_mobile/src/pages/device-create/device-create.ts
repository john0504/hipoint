import { Component } from '@angular/core';
import {
  // Alert, AlertController, 
  IonicPage, NavController, ViewController
} from 'ionic-angular';
import { TranslateService } from '@ngx-translate/core';
import { AppVersion } from '@ionic-native/app-version';
import { Subscription } from 'rxjs/Subscription';
import { of } from 'rxjs/observable/of';
import { defer } from 'rxjs/observable/defer';
import { catchError, delay, repeatWhen, switchMap, first, map } from 'rxjs/operators';
import { NgRedux } from '@angular-redux/store';
import { Observable } from 'rxjs/Observable';

import { AppActions, AppTasks, ErrorsService, StateStore } from 'app-engine';
import { OpenNativeSettings } from '@ionic-native/open-native-settings';

import { ThemeService } from '../../providers/theme-service';
import { CheckNetworkService } from '../../providers/check-network';
import { PopupService } from '../../providers/popup-service';
import { Storage } from '@ionic/storage';

@IonicPage()
@Component({
  selector: 'page-device-create',
  templateUrl: 'device-create.html'
})
export class DeviceCreatePage {

  private subs: Array<Subscription>;
  canContinue: boolean = false;
  isTokenValidated: boolean = false;
  appName: Promise<string>;
  // alert: Alert;
  accessToken: string = "";
  private deviceInfo$: Observable<any>;
  deviceInfo;

  constructor(
    private ngRedux: NgRedux<any>,
    private stateStore: StateStore,
    private appTasks: AppTasks,
    private translate: TranslateService,
    // public alertCtrl: AlertController,
    public appVersion: AppVersion,
    public checkNetworkService: CheckNetworkService,
    public nativeSettings: OpenNativeSettings,
    public navCtrl: NavController,
    public themeService: ThemeService,
    public viewCtrl: ViewController,
    private popupService: PopupService,
    private storage: Storage,
    private errorsService: ErrorsService,
  ) {
    this.subs = [];
    this.appName = this.appVersion.getAppName();
    this.deviceInfo$ = this.ngRedux.select(['deviceCreate', 'deviceInfo']);
  }

  ionViewDidLoad() {
    this.checkNetworkService.pause();
  }

  ionViewWillEnter() {
    this.subs.push(
      this.errorsService.getSubject()
        .subscribe(error => this.handleErrors(error))
    );
    this.subs.push(
      this.queryDeviceInfo()
        .pipe(repeatWhen(attampes => attampes.pipe(delay(3000))))
        .subscribe()
    );
    this.subs.push(
      this.deviceInfo$
        .subscribe(deviceInfo => {
          this.deviceInfo = deviceInfo;
        })
    );
    let p = this.appTasks.requestAuthorizeTask()
      .then((accessToken) => {
        this.storage.set("accessToken", accessToken);
        this.accessToken = accessToken;
      })
      .catch(() => {
        this.storage.get("accessToken").then((accessToken) => {
          if (accessToken) {
            this.accessToken = accessToken;
          }
        });
      });
    this.popupService.toastPopup(p, null, {
      message: this.translate.instant('CHECK_NETWORKS.NOT_FOUND'),
      duration: 3000
    });
  }

  private queryDeviceInfo() {
    return defer(() => this.appTasks.queryDeviceInfoTask())
      .pipe(
        switchMap(() =>
          this.stateStore.account$
            .pipe(
              first(),
              map(account => {
                return true;
              }),
            )
        ),
        catchError(() => of(false)),
        map(result => this.canContinue = result && this.accessToken != ""),
      );
  }

  ionViewDidLeave() {
    this.subs && this.subs.forEach((s) => {
      s.unsubscribe();
    });
    this.subs.length = 0;
  }

  ionViewWillUnload() {
    this.checkNetworkService.resume();
  }

  test() {
    let p = this.appTasks.requestAuthorizeTask()
      .then((accessToken) => {
        this.accessToken = accessToken;
      });
    this.popupService.toastPopup(p, null, {
      message: this.translate.instant('CHECK_NETWORKS.NOT_FOUND'),
      duration: 3000
    });
  }
  // error is an action
  private handleErrors(error) {
    switch (error.type) {
      case AppActions.QUERY_DEVICE_INFO_DONE:
        break;
    }
  }

  onNext() {
    this.navCtrl.push('SsidConfirmPage', { accessToken: this.accessToken, deviceInfo: this.deviceInfo })
      .then(() => this.closePage());
  }

  closePage() {
    this.viewCtrl.dismiss();
  }

  // private showAlert() {
  //   if (!this.alert) {
  //     this.alert = this.alertCtrl.create({
  //       title: this.translate.instant('DEVICE_CREATE.OUT_OF_DATE_TITLE'),
  //       message: this.translate.instant('DEVICE_CREATE.OUT_OF_DATE_MSG'),
  //       buttons: [this.translate.instant('DEVICE_CREATE.OK')]
  //     });
  //     this.alert.present();
  //     this.alert.onDidDismiss(() => {
  //       this.alert = null;
  //     });
  //   }
  // }
}

const INITIAL_STATE = {
  deviceInfo: null,
};

export function deviceCreateReducer(state = INITIAL_STATE, action) {
  switch (action.type) {
    case AppActions.QUERY_DEVICE_INFO_DONE:
      if (!action.error) {
        return Object.assign({}, state, { deviceInfo: action.payload, });
      }
      return state;
    default:
      return state;
  }
}