import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, Platform, ViewController } from 'ionic-angular';
import { Insomnia } from '@ionic-native/insomnia';

import { ErrorObservable } from 'rxjs/observable/ErrorObservable';
import { defer } from 'rxjs/observable/defer';
import {
  // first, map, 
  retryWhen, timeoutWith,
  delay, flatMap, retry,
  repeatWhen
} from 'rxjs/operators';

import { CheckNetworkService } from '../../providers/check-network';

import {
  AppEngine,
  AppTasks,
  AppActions,
  // StateStore,
  TimeoutError,
} from 'app-engine';

import { ThemeService } from '../../providers/theme-service';
import { Observable } from 'rxjs/Observable';
import { NgRedux } from '@angular-redux/store';
import { Subscription } from 'rxjs/Subscription';

@IonicPage()
@Component({
  selector: 'page-provision-loading',
  templateUrl: 'provision-loading.html'
})
export class ProvisionLoadingPage {

  private unregister;
  accessToken: string = "";
  private serial: string;
  logs;
  private deviceStatus$: Observable<any>;
  private subs: Array<Subscription>;
  // sub: any;
  isExit: boolean = false;

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
    private ngRedux: NgRedux<any>,
  ) {
    this.subs = [];
    this.logs = [];
    this.deviceStatus$ = this.ngRedux.select(['wifiConfirm', 'deviceStatus']);
  }

  ionViewDidLoad() {
    this.checkNetworkService.pause();
    this.isExit = false;
    this.platform.ready()
      .then(() => {
        this.unregister = this.platform.registerBackButtonAction(() => {
          console.log('Preventing users from pressing the hardware back button on the phone');
        }, 100);
        return this.insomnia.keepAwake();
      })
      .then(() => {
        this.fireApMode()
          .pipe(flatMap(newDevice => this.provision(newDevice)))
          .subscribe(({ serial }) => {
            if (!this.isExit) {
              this.isExit = true;
              this.navCtrl.push('ProvisionDonePage', { deviceSn: serial })
                .then(() => this.viewCtrl.dismiss());
            }
          }, (error) => {
            this.printLog(JSON.stringify(error) + "\r\n");
            if (!this.isExit) {
              this.isExit = true;
              // this.printLog("ProvisionFailurePage\r\n");
              this.navCtrl.push('ProvisionFailurePage', { deviceSn: this.serial })
                .then(() => this.viewCtrl.dismiss());
            }
          });
        this.subs.push(this.callQueryDeviceStatus());
        this.subs.push(this.deviceStatus$.subscribe());
      })
      .catch((error) => {
        // this.printLog(JSON.stringify(error) + "\r\n");
        // this.navCtrl.push('ProvisionFailurePage')
        //   .then(() => this.viewCtrl.dismiss());
      });
  }

  ionViewDidLeave() {
    // this.sub.unsubscribe();
    this.subs && this.subs.forEach((s) => {
      s.unsubscribe();
    });
    this.subs.length = 0;
  }

  private callQueryDeviceStatus() {
    return this.queryDeviceStatus()
      .pipe(repeatWhen(attampes => attampes.pipe(delay(20000))),
        timeoutWith(5000, ErrorObservable.create(new TimeoutError('Device Status timeout'))))
      .subscribe((result) => {
        this.printLog(JSON.stringify(result) + "\r\n");
        if (result["Connect Status"] != null &&
          result["Connect Status"] != "0" &&
          result["Connect Status"] != "255") {
          if (!this.isExit) {
            this.isExit = true;
            // this.printLog("ProvisionFailurePage\r\n");
            this.navCtrl.push('ProvisionFailurePage', { deviceSn: this.serial })
              .then(() => this.viewCtrl.dismiss());
          }
        }
      }, (error) => {
        // this.printLog(JSON.stringify(error) + "\r\n");        
        this.subs.push(this.callQueryDeviceStatus());
      });
  }

  private queryDeviceStatus() {
    return defer(() => this.appTasks.queryDeviceStatusTask())
      .pipe(retry(2));
  }

  private fireApMode() {
    return defer(() => this.fireApModePromise())
      .pipe(retry(2));
  }

  private getDeviceList(newDevice) {
    return defer(() => this.getByAuthPromise(newDevice));
  }

  private printLog(message) {
    const currentDate: Date = new Date();
    this.logs.push('[' + currentDate + ']' + message);
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
      timeoutWith(60000, ErrorObservable.create(new TimeoutError('Provision timeout'))),
    );
  }

  ionViewWillUnload() {
    this.unregister && this.unregister();
    this.insomnia.allowSleepAgain();
    this.checkNetworkService.resume();
  }
}

const INITIAL_STATE = {
  deviceStatus: null,
};

export function wifiConfirmReducer(state = INITIAL_STATE, action) {
  switch (action.type) {
    case AppActions.QUERY_DEVICE_STATUS_DONE:
      if (!action.error) {
        return Object.assign({}, state, { deviceStatus: action.payload, });
      }
      return state;
    default:
      return state;
  }
}