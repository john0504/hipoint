import { Component } from '@angular/core';
import { AppTasks, StateStore } from 'app-engine';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { pairwise, tap } from 'rxjs/operators';
import isEqual from 'lodash/isEqual';

import { IonicPage, NavController, Platform } from 'ionic-angular';

import { ThemeService } from '../../providers/theme-service';

import { InformationModelService } from '../../modules/information-model';
import { DeviceConfigService } from '../../providers/device-config-service';
import { DeviceControlService } from '../../providers/device-control-service';
import { ViewStateService } from '../../providers/view-state-service';
import { defer } from 'rxjs/observable/defer';
import { delay, repeatWhen } from 'rxjs/operators';

@IonicPage()
@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  private subs: Array<Subscription>;
  private account$: Observable<any>;
  _deviceList = [];
  isLoggedIn: boolean = false;
  ready: boolean = false;

  constructor(
    private navCtrl: NavController,
    private platform: Platform,
    private stateStore: StateStore,
    private ims: InformationModelService,
    public deviceConfigService: DeviceConfigService,
    public deviceCtrlService: DeviceControlService,
    public viewStateService: ViewStateService,
    public themeService: ThemeService,
    private appTasks: AppTasks,
  ) {
    this.subs = [];
    this.account$ = this.stateStore.account$;
  }

  ionViewDidEnter() {
    this.subs.push(
      this.account$
        .pipe(
        tap(account => this.isLoggedIn = account && account.isLoggedIn),
        pairwise()
        )
        .subscribe(([oldAccount, newAccount]) => {
          const oldLoginState = oldAccount && oldAccount.isLoggedIn;
          const newLoginState = newAccount && newAccount.isLoggedIn;
          this.refreshData();
          if (!oldLoginState && newLoginState) this.ready = false;
        })
    );
    this.subs.push(
      this.getListService().subscribe()
    );
  }

  ionViewWillLeave() {
    this.subs && this.subs.forEach((s) => {
      s.unsubscribe();
    });
    this.subs.length = 0;
  }

  isIOS(): boolean {
    return this.platform.is('ios');
  }

  goAddDevice() {
    this.navCtrl.push('DeviceCreatePage');
  }

  refreshData() {
    defer(() => this.getListServiceTask()).subscribe();
  }

  getListService() {
    return defer(() => this.getListServiceTask())
      .pipe(
      repeatWhen(attampes => attampes.pipe(delay(60000))
      ));
  }

  private getListServiceTask(): Promise<any> {
    return this.appTasks.getByAuthTask()
      .then((list) => {
        let deviceList = [];
        list.forEach(item => {
          if (item.uuid && item.uuid != "" && item.status && item.status == "y") {
            let isNewDevice = true;
            let aDevice;
            this._deviceList.forEach(device => {
              if (device._device && device._device.device == item.uuid) {
                isNewDevice = false;
                aDevice = this.makeDeviceItem(item, device.showDetails);
              }
            });
            if (isNewDevice == true) {
              aDevice = this.makeDeviceItem(item, false);
            }
            this.updateLayout(aDevice);
            aDevice.viewState = this.updateViewState(aDevice);
            deviceList.push(aDevice);
          }
        });
        deviceList.sort(function (a, b) {
          var nameA = a.deviceName.toUpperCase(); // ignore upper and lowercase
          var nameB = b.deviceName.toUpperCase(); // ignore upper and lowercase
          if (nameA < nameB) {
            return -1;
          }
          if (nameA > nameB) {
            return 1;
          }
          return 0;
        });
        this._deviceList = deviceList;
      })
      .catch((error) => { });
  }

  private makeDeviceItem(device, isShowDetails): any {
    let itemStatus = device.sensors;
    itemStatus.sn = device.uuid;
    let deviceItem = {
      deviceName: device.alias,
      _device: {
        device: device.uuid,
        profile: {
          esh: {
            class: 0, esh_version: "4.0.0", device_id: device.productCode,
            brand: device.vendorName, model: device.model
          },
          module: {
            firmwareVersion: device.wifiVersion, macAddress: device.uuid,
            local_ip: "", ssid: ""
          }, cert: {
            fingerprint: { sha1: "01234567890123456789" },
            validity: { not_before: "01/01/15", not_after: "12/31/25" }
          }
        },
        properties: { displayName: device.alias },
        fields: [],
        status: device.sensors
      },
      _deviceSn: device.uuid,
      viewState: { isConnected: this.getOnline(device.sensors.tick) },
      showDetails: isShowDetails,
      popitPopular: [],
      popitExpanded: []
    };
    return deviceItem;
  }

  sendCommands(deviceItem, commands) {
    let cmd = {};
    cmd[commands.key] = commands.value;
    // this.sendBluetoothCommands(deviceItem, "data", cmd);
    deviceItem.viewState = Object.assign({}, deviceItem.viewState, cmd);
    this.viewStateService.setViewState(deviceItem._deviceSn, deviceItem.viewState);
  }

  private updateViewState(deviceItem): any {
    let viewState: any = this.viewStateService.getViewState(deviceItem._deviceSn) || {};
    if (deviceItem && deviceItem._device && deviceItem._device.status) {
      for (let key in deviceItem._device.status) {
        if (this.deviceCtrlService.isAvailable(deviceItem._device.device, key)) {
          viewState[key] = deviceItem._device.status[key];
        }
      }
    }

    viewState = Object.assign({}, deviceItem.viewState, viewState);
    this.viewStateService.setViewState(deviceItem._deviceSn, viewState);

    return viewState;
  }

  private updateLayout(deviceItem) {
    if (deviceItem._device) {
      let uiModel = this.ims.getUIModel(deviceItem._device);
      if (uiModel && !isEqual(deviceItem.uiModel, uiModel)) {
        deviceItem.uiModel = uiModel;

        let controlLayout = deviceItem.uiModel.controlLayout;
        if (controlLayout && controlLayout.primary) {
          let popitPopular: Array<any> = [];
          controlLayout.primary.forEach((name) => {
            let m = uiModel.components[name];
            if (m) {
              popitPopular.push(m);
            }
          });
          deviceItem.popitPopular = popitPopular;
        }

        if (controlLayout && controlLayout.secondary) {
          let popitExpanded: Array<any> = [];
          controlLayout.secondary.forEach((name) => {
            let m = uiModel.components[name];
            if (m) {
              popitExpanded.push(m);
            }
          });
          deviceItem.popitExpanded = popitExpanded;
        }

        // this.requestConfig(deviceItem._deviceSn, uiModel.config);
      }
    }
  }

  // private requestConfig(sn: string, config: Array<string>) {
  //   if (!sn || !config) return;
  //   this.deviceConfigService.requestConfig(sn, config);
  // }

  toggleDetails(deviceItem) {
    if (deviceItem.showDetails) {
      deviceItem.showDetails = false;
    } else {
      deviceItem.showDetails = true;
    }
  }

  openSettings(deviceItem) {
    this.navCtrl.push('DeviceSettingsPage', { device: deviceItem._device });
  }

  getOnline(value: number) {
    const timeNow = Date.now() / 1000;
    if (timeNow - value > 300) {
      return false;
    }
    return true;
  }

  debug(obj): string {
    return JSON.stringify(obj);
  }

  isVisable(value) {
    return Number(value) > -100;
  }
}
