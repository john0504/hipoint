import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, Platform, ViewController } from 'ionic-angular';
import { Insomnia } from '@ionic-native/insomnia';

import { ErrorObservable } from 'rxjs/observable/ErrorObservable';
import { defer } from 'rxjs/observable/defer';
import {
  // first, map, 
  retryWhen, timeoutWith,
  delay, flatMap, retry,
} from 'rxjs/operators';

import { CheckNetworkService } from '../../providers/check-network';

import {
  AppEngine,
  AppTasks,
  // StateStore,
  TimeoutError,
} from 'app-engine';

import { ThemeService } from '../../providers/theme-service';

@IonicPage()
@Component({
  selector: 'page-provision-loading',
  templateUrl: 'provision-loading.html'
})
export class ProvisionLoadingPage {

  private unregister;
  accessToken: string = "";
  private serial: string;

  constructor(
    private appEngine: AppEngine,
    // private stateStore: StateStore,
    private appTasks: AppTasks,
    private platform: Platform,
    private insomnia: Insomnia,
    public checkNetworkService: CheckNetworkService,
    public navCtrl: NavController,
    public params: NavParams,
    public themeService: ThemeService,
    public viewCtrl: ViewController,
  ) {

  }

  ionViewDidLoad() {
    this.checkNetworkService.pause();
    this.platform.ready()
      .then(() => {
        this.unregister = this.platform.registerBackButtonAction(() => {
          console.log('Preventing users from pressing the hardware back button on the phone');
        }, 100);
        return this.insomnia.keepAwake();
      })
      .then(() => {
        this.fireApMode()
          .pipe(
          delay(10000),
          flatMap(newDevice => this.provision(newDevice)),
        )
          .subscribe(({ serial }) => {
            this.navCtrl.push('ProvisionDonePage', { deviceSn: serial })
              .then(() => this.viewCtrl.dismiss());
          }, (error) => {
            this.navCtrl.push('ProvisionFailurePage', { deviceSn: this.serial });
            this.viewCtrl.dismiss();
            // this.navCtrl.push('ProvisionDonePage')
            //   .then(() => this.viewCtrl.dismiss());
          });
      })
      .catch((error) => {
        this.navCtrl.push('ProvisionFailurePage');
        this.viewCtrl.dismiss();
      });
  }

  private fireApMode() {
    return defer(() => this.fireApModePromise())
      .pipe(retry(2));
  }

  private getDeviceList(newDevice) {
    return defer(() => this.getByAuthPromise(newDevice));
  }

  private fireApModePromise() {
    const w = this.params.get('wifiAp');
    const pMethod = this.params.get('method');
    const accessToken = this.params.get('accessToken');
    const updatePeriod = this.params.get('updatePeriod');
    return this.appTasks.fireApModeTask(w.ssid, w.password, w.sec,
      `https://${this.appEngine.getBaseUrl()}/`, accessToken, updatePeriod, pMethod);
  }

  private getByAuthPromise(newDevice) {
    return this.appTasks.getByAuthTask().then((list) => {
      let itemFound = false;
      list.forEach(item => {
        if (item.uuid && item.uuid != "" && item.status && item.status == "y") {
          const newDeviceSn: string = `${newDevice.serial}`;
          const getSn: string = `${item.uuid}`;
          if (newDeviceSn === getSn) {
            itemFound = true;
          }
        }
      });
      if (itemFound) {
        return newDevice;
      } else {
        throw new Error('Not found');
      }
    });
  }

  private provision(newDevice) {
    this.serial = newDevice.serial;
    return this.getDeviceList(newDevice).pipe(
      retryWhen(error => error.pipe(delay(3000))),
      timeoutWith(50000, ErrorObservable.create(new TimeoutError('Provision timeout'))),
    );
  }

  ionViewWillUnload() {
    this.unregister && this.unregister();
    this.insomnia.allowSleepAgain();
    this.checkNetworkService.resume();
  }
}
