import { Component, OnInit, OnDestroy } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

import { Group, StateStore } from 'app-engine';
import { NavController, ViewController } from 'ionic-angular';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { combineLatest } from 'rxjs/observable/combineLatest';

import { debounceImmediate } from '../../app/app.extends';
import { ThemeService } from '../../providers/theme-service';

@Component({
  selector: 'my-devices',
  templateUrl: 'my-devices.html',
})
export class MyDevicesPage implements OnInit, OnDestroy {
  private deviceDisplayList$: Observable<any>;
  private devicesSubs: Array<Subscription>;
  private groupDisplayList$: Observable<any>;
  private groups$: Observable<any>;
  private userData$: Observable<any>;
  private subs: Array<Subscription>;

  myDevicesGroup: Group;

  constructor(
    private _viewCtrl: ViewController,
    private navCtrl: NavController,
    private stateStore: StateStore,
    private translate: TranslateService,
    public themeService: ThemeService,
  ) {
    this.devicesSubs = [];
    this.deviceDisplayList$ = this.stateStore.deviceDisplayList$;
    this.groupDisplayList$ = this.stateStore.groupDisplayList$;
    this.groups$ = this.stateStore.groups$;
    this.userData$ = this.stateStore.userData$;
    this.subs = [];
  }

  ngOnInit() {
    this.subs.push(this._viewCtrl.willEnter.subscribe(() => this.subscribeDevices()));
    this.subs.push(this._viewCtrl.didLeave.subscribe(() => this.unsubscribeDevices()));
    this.subscribeDevices();
  }

  ngOnDestroy() {
    this.subs && this.subs.forEach(sub => sub.unsubscribe());
    this.subs.length = 0;

    if (this.devicesSubs.length !== 0) {
      this.unsubscribeDevices();
    }
  }

  private subscribeDevices() {
    this.devicesSubs.push(
      combineLatest(this.deviceDisplayList$, this.groupDisplayList$, this.groups$, this.userData$, this.translate.stream(['MY_DEVICES']))
        .pipe(debounceImmediate(500))
        .subscribe(latestValues => this.processValues(latestValues))
    );
  }

  private unsubscribeDevices() {
    this.devicesSubs && this.devicesSubs.forEach(sub => sub.unsubscribe());
    this.devicesSubs.length = 0;
  }

  private processValues(latestValues) {
    const [deviceDisplayList, groupDisplayList, groups, userData] = latestValues;
    const { groupDisplayOrder } = userData;
    const groupOrder = groupDisplayOrder ? groupDisplayOrder : groupDisplayList;
    this.myDevicesGroup = this.generateGroup(deviceDisplayList, groups, groupOrder);
    this.myDevicesGroup.properties['displayName'] = this.translate.instant('MY_DEVICES.ALL_DEVICES');
  }

  private generateGroup(deviceDisplayList, groups, groupDisplayList = []): Group {
    let myDevices = [];

    groupDisplayList
      .forEach(groupId => {
        const g = groups[groupId];
        if (g && g.devices) myDevices = myDevices.concat(g.devices);
      });

    deviceDisplayList.forEach((deviceSn) => {
      const found = groupDisplayList.some((groupId) => {
        const group = groups[groupId];
        return group && group.devices && group.devices.some(dSn => (dSn === deviceSn));
      });

      if (!found) {
        myDevices.push(deviceSn);
      }
    });

    return {
      name: '__my_devices_group__',
      devices: myDevices,
      properties: {
      },
    };
  }

  goAddDevice() {
    this.navCtrl.push('DeviceCreatePage');
  }
}
