import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

import { Device, AppTasks, StateStore } from 'app-engine';
import {
  AlertController,
  AlertOptions,
  LoadingController,
  IonicPage,
  NavParams,
  ViewController,
} from 'ionic-angular';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
// import * as semver from 'semver';

// import { PopupService } from '../../providers/popup-service';
import { ViewStateService } from '../../providers/view-state-service';
import { AppUtils } from '../../utils/app-utils';

@IonicPage()
@Component({
  selector: 'page-device-settings',
  templateUrl: 'device-settings.html'
})
export class DeviceSettingsPage {

  private subs: Array<Subscription>;
  private account$: Observable<any>;
  private devices$: Observable<any>;

  device: Device;
  deviceName: string;
  viewState: any;
  // isVersionLoading: boolean = false;

  constructor(
    private alertCtrl: AlertController,
    private appTasks: AppTasks,
    // private popupService: PopupService,
    private stateStore: StateStore,
    private translate: TranslateService,
    public loadingCtrl: LoadingController,
    public params: NavParams,
    public viewCtrl: ViewController,
    public viewStateService: ViewStateService,
  ) {
    this.subs = [];
    this.account$ = this.stateStore.account$;
    this.devices$ = this.stateStore.devices$;
  }

  ionViewDidLoad() {
    this.device = this.params.get('device');
    if (this.device) {
      this.deviceName = this.device.properties && this.device.properties['displayName'];
      this.viewState = this.viewStateService.getViewState(this.device.device);
    }
  }

  ionViewWillEnter() {
  }

  ionViewDidLeave() {
    this.subs && this.subs.forEach((s) => {
      s.unsubscribe();
    });
    this.subs.length = 0;
  }

  canSaveDeviceName(): boolean {
    let deviceName = this.device && this.device.properties && this.device.properties['displayName'];
    return this.deviceName && this.deviceName !== deviceName;
  }

  processValues(devices) {
    this.device = devices[this.device.device];
    this.viewState = this.viewStateService.getViewState(this.device.device);
    this.viewState.isDeviceUpdating = AppUtils.isDeviceUpdate(this.device);
    this.viewStateService.setViewState(this.device.device, this.viewState);
  }

  saveDevice() {
    let deviceName = this.device.properties && this.device.properties['displayName'];
    this.deviceName = this.deviceName && this.deviceName.trim();
    if (!this.deviceName || this.deviceName === deviceName) return;
    const updatingContent = this.translate.instant('DEVICE_SETTINGS.UPDATING');
    const loading = this.loadingCtrl.create({
      content: updatingContent,
    });
    loading.present();
    this.appTasks.saveByAuthTask(this.device.device, this.deviceName)
      .then(() => {
        loading.dismiss();
        const alertTitle = this.translate.instant('DEVICE_SETTINGS.HAS_UPDATED');
        const alertOK = this.translate.instant('DEVICE_SETTINGS.OK');
        const alert = this.alertCtrl.create({
          title: alertTitle,
          buttons: [
            {
              text: alertOK,
            }
          ],
        });
        alert.present();
      })
      .catch(() => {
        loading.dismiss();
        const alertTitle = this.translate.instant('DEVICE_SETTINGS.ISSUE_HAPPENED_WHEN_UPDATE');
        const alertOK = this.translate.instant('DEVICE_SETTINGS.OK');
        const alert = this.alertCtrl.create({
          title: alertTitle,
          buttons: [
            {
              text: alertOK,
            }
          ],
        });
        alert.present();
      });
  }

  private showErrorAlert() {
    const alertTitle = this.translate.instant('DEVICE_SETTINGS.ISSUE_HAPPENED_WHEN_CHECK_UPDATES');
    const alertMsg = this.translate.instant('DEVICE_SETTINGS.CHECK_NETWORK_AGAIN');
    const alertOK = this.translate.instant('DEVICE_SETTINGS.OK');
    const alert = this.alertCtrl.create({
      title: alertTitle,
      message: alertMsg,
      buttons: [{ text: alertOK }],
    });
    alert.present();
  }

  checkForUpdates() {
    if (!this.device || !this.device.profile || !this.device.profile.module || !this.device.profile.esh) {
      this.showErrorAlert();
      return;
    }
    // const version = this.device.profile.module.firmwareVersion;
    // const deviceModel = this.device.profile.esh.model;
    // let versionNew;
    // let targetVersionObj = null;
    // this.isVersionLoading = true;
    // this.appTasks.getFirmwareList(deviceModel)
    //   .then((items: any) => {
    //     this.isVersionLoading = false;
    //     items.forEach(element => {
    //       if (targetVersionObj === null || semver.lt(targetVersionObj.version, element.version)) {
    //         targetVersionObj = element;
    //       }
    //     });

    //     if (targetVersionObj != null) {
    //       versionNew = targetVersionObj.version;
    //     }

    //     if (!version) {
    //       this.showErrorAlert();
    //       return;
    //     }

    //     if (!versionNew) {
    //       this.showUpToDateAlert(version);
    //       return;
    //     }

    //     if (version && versionNew && semver.lt(version, versionNew)) {
    //       // need to update
    //       const sn = this.device && this.device.device;
    //       const url = targetVersionObj && targetVersionObj.url;
    //       const sha1 = targetVersionObj && targetVersionObj.sha1;
    //       this.otaService(sn, url, sha1, version, versionNew);
    //     } else {
    //       // no need to update
    //       this.showUpToDateAlert(version);
    //     }
    //   })
    //   .catch(() => {
    //     this.isVersionLoading = false;
    //     this.showErrorAlert();
    //   });
  }

  // private showUpToDateAlert(version: string) {
  //   const alertTitle = this.translate.instant('DEVICE_SETTINGS.UP_TO_DATE_TITLE');
  //   const alertMsg = this.translate.instant('DEVICE_SETTINGS.UP_TO_DATE_MSG', { version });
  //   const alertOK = this.translate.instant('DEVICE_SETTINGS.OK');

  //   const alert = this.alertCtrl.create({
  //     title: alertTitle,
  //     message: alertMsg,
  //     buttons: [{ text: alertOK }],
  //   });
  //   alert.present();
  // }

  // private updatePopup(sn: string, url: string, sha1: string, version: string) {
  //   const loadingContent = this.translate.instant('DEVICE_SETTINGS.LOADING');
  //   const otaPromise = this.popupService.loadingPopup(
  //     this.appTasks.wsRequestOtaTask(sn, url, sha1, version),
  //     { content: loadingContent },
  //   );

  //   otaPromise
  //     .then(() => {
  //       const alertTitle = this.translate.instant('DEVICE_SETTINGS.UPDATE_STARTED');
  //       const alertMsg = this.translate.instant('DEVICE_SETTINGS.UPDATE_STARTED_MSG');
  //       const alertOK = this.translate.instant('DEVICE_SETTINGS.OK');
  //       const alert = this.alertCtrl.create({
  //         title: alertTitle,
  //         message: alertMsg,
  //         buttons: [alertOK],
  //       });
  //       alert.present();
  //     })
  //     .catch(() => {
  //       this.showErrorAlert();
  //     });
  // }

  // private otaService(sn: string, url: string, sha1: string, version: string, versionNew: string) {
  //   const alertTitle = this.translate.instant('DEVICE_SETTINGS.NEW_VERSION_TITLE', { versionNew });
  //   const alertMsg = this.translate.instant('DEVICE_SETTINGS.UPDATE_FOUND_MSG');
  //   const alertCancel = this.translate.instant('DEVICE_SETTINGS.CANCEL');
  //   const alertUpdate = this.translate.instant('DEVICE_SETTINGS.UPDATE_NOW');
  //   const alert = this.alertCtrl.create({
  //     title: alertTitle,
  //     message: alertMsg,
  //     buttons: [
  //       {
  //         text: alertCancel,
  //         role: 'cancel',
  //       },
  //       {
  //         text: alertUpdate,
  //         handler: () => this.updatePopup(sn, url, sha1, version),
  //       }
  //     ]
  //   });
  //   alert.present();
  // }

  deleteDeviceConfirm() {
    const alertTitle = this.translate.instant('DEVICE_SETTINGS.DELETE_ALERT_TITLE', { deviceName: this.deviceName });
    const alertCancel = this.translate.instant('DEVICE_SETTINGS.CANCEL');
    const alertDelete = this.translate.instant('DEVICE_SETTINGS.DELETE');

    let options: AlertOptions = {
      title: alertTitle,
      buttons: [
        {
          text: alertCancel,
          role: 'cancel',
        },
        {
          text: alertDelete,
          handler: () => this.deleteDevice(),
        }
      ],
    };

    const guestMsg = this.translate.instant('DEVICE_SETTINGS.GUEST_DELETE_MSG');
    options.message = guestMsg;

    const alert = this.alertCtrl.create(options);
    alert.present();
  }

  private deleteDevice() {
    this.appTasks.deleteByAuthTask(this.device.device);
    this.viewCtrl.dismiss();
      // .then(() => this.viewCtrl.dismiss());
  }
}
