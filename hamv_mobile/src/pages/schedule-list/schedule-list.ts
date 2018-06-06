import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

import {
  AlertController,
  IonicPage,
  NavController,
  NavParams,
  ViewController
} from 'ionic-angular';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import cloneDeep from 'lodash/cloneDeep';

import { debounceImmediate } from '../../app/app.extends';

import {
  AppTasks,
  StateStore,
  Schedule
} from 'app-engine';

import { DeviceControlService } from '../../providers/device-control-service';
import { PopupService } from '../../providers/popup-service';
import { ScheduleAdapterService } from '../../providers/schedule-adapter-service';
import { appConfig } from './../../app/app.config';

@IonicPage()
@Component({
  selector: 'page-schedule-list',
  templateUrl: 'schedule-list.html'
})
export class ScheduleListPage {

  private subs: Array<Subscription>;
  private devices$: Observable<any>;

  private deviceSn: string;
  private device;
  private calendar: Array<any>;
  deviceName: string;
  scheduleList: Array<any>;

  constructor(
    private alertCtrl: AlertController,
    private appTasks: AppTasks,
    private deviceCtrlService: DeviceControlService,
    private popupService: PopupService,
    private stateStore: StateStore,
    private scheduleService: ScheduleAdapterService,
    private translate: TranslateService,
    public navCtrl: NavController,
    public params: NavParams,
    public viewCtrl: ViewController,
  ) {
    this.deviceSn = params.get('deviceSn');
    this.subs = [];
    this.scheduleList = [];
    this.devices$ = this.stateStore.devices$;
  }

  ionViewWillEnter() {
    this.subs.push(
      this.devices$
        .pipe(debounceImmediate(500))
        .subscribe(devices => this.updateUi(devices))
    );
  }

  private updateUi(devices) {
    if (devices[this.deviceSn]) {
      this.device = devices[this.deviceSn];
      this.deviceName = this.device.properties.displayName || this.device.profile.esh.model;
      this.scheduleList.length = 0;
      this.calendar = this.device.calendar;
      this.checkCalendar();
      this.calendar
        .forEach((schedule: Schedule) => {
          const offset: number = new Date().getTimezoneOffset();
          let s = this.scheduleService.toTimezoneSchedule(schedule, offset);
          let scheduleItem = {
            schedule: s,
            isActive: !this.scheduleService.isOutOfDate(schedule) && schedule.active === 1,
          };
          this.scheduleList.push(scheduleItem);
        });
    } else {
      this.viewCtrl.dismiss();
    }
  }

  private checkCalendar() {
    let hasOutOfDateSchedule = false;
    this.calendar
      .forEach((schedule: Schedule) => {
        if (this.scheduleService.isOutOfDate(schedule)) {
          hasOutOfDateSchedule = true;
          schedule.active = 0;
        }
      });
    if (hasOutOfDateSchedule) {
      this.appTasks.wsRequestCalendarTask(this.deviceSn, this.calendar);
    }
  }

  ionViewDidLeave() {
    this.subs && this.subs.forEach((s) => {
      s.unsubscribe();
    });
    this.subs.length = 0;
  }

  addSchedule() {
    if (this.scheduleList.length >= appConfig.app.schedule.max) {
      const alert = this.alertCtrl.create({
        title: this.translate.instant('SCHEDULE_LIST.LIMIT_REACHED_TITLE'),
        subTitle: this.translate.instant('SCHEDULE_LIST.LIMIT_REACHED_MSG', { maxSchedules: appConfig.app.schedule.max }),
        buttons: [{ text: this.translate.instant('SCHEDULE_LIST.OK') }],
      });
      alert.present();
    } else {
      this.navCtrl.push('ScheduleEditPage', {
        device: cloneDeep(this.device),
        index: -1,
        isOneShot: false,
      });
    }
  }

  scheduleSelected(index: number) {
    this.navCtrl.push('ScheduleEditPage', {
      device: cloneDeep(this.device),
      index: index,
    });
  }

  scheduleActive(scheduleItem, index) {
    const offset: number = new Date().getTimezoneOffset();
    let schedule: Schedule = this.calendar[index];
    if (schedule) {
      schedule.active = scheduleItem.isActive ? 1 : 0;

      const shouldPopupShows = this.scheduleService.isOverlapping(schedule, offset);
      if (scheduleItem.isActive && shouldPopupShows) {
        this.showExecutePopup(schedule, index, offset);
      } else {
        const executeNow = false;
        this.saveCalendar(schedule, index, offset, executeNow);
      }
    }
  }

  private saveCalendar(UTCSchedule: Schedule, index: number, offset: number = 0, executeNow: boolean = false, settings?: any) {
    this.calendar[index] = this.scheduleService.setActiveUntil(UTCSchedule, executeNow, offset);

    if (executeNow && settings) {
      this.deviceCtrlService.setDevice(this.device.device, settings);
    }

    let p = this.appTasks.wsRequestCalendarTask(this.deviceSn, this.calendar);

    this.popupService.toastPopup(p, null, {
      message: this.translate.instant('SCHEDULE_LIST.SET_FAILED'),
      duration: 3000
    });
  }

  private showExecutePopup(UTCSchedule: Schedule, index: number, offset: number = 0) {
    this.alertCtrl.create({
      title: this.translate.instant('SCHEDULE_LIST.EXECUTE_POPUP_TITLE'),
      message: this.translate.instant('SCHEDULE_LIST.EXECUTE_POPUP_MSG'),
      buttons: [
        {
          handler: () => {
            this.saveCalendar(UTCSchedule, index, offset, false);
          },
          text: this.translate.instant('SCHEDULE_LIST.LATER'),
        },
        {
          handler: () => {
            const executeNow = true;
            this.saveCalendar(UTCSchedule, index, offset, executeNow, UTCSchedule.esh);
          },
          text: this.translate.instant('SCHEDULE_LIST.START_NOW'),
        },
      ]
    })
      .present();
  }
}
