import { Component, ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

import {
  AlertController,
  DateTime,
  IonicPage,
  NavParams,
  ViewController,
} from 'ionic-angular';

import {
  AppTasks,
  Device,
  Schedule
} from 'app-engine';

import { InformationModelService } from '../../modules/information-model';
import { PopupService } from '../../providers/popup-service';
import { DeviceControlService } from '../../providers/device-control-service';
import { ScheduleAdapterService } from '../../providers/schedule-adapter-service';

@IonicPage()
@Component({
  selector: 'page-schedule-edit',
  templateUrl: 'schedule-edit.html'
})
export class ScheduleEditPage {

  @ViewChild('startdt') startDt: DateTime;
  @ViewChild('enddt') endDt: DateTime;

  action: string;

  private device: Device;
  index: number = -2;

  buttons: Array<object> = [
    {
      value: 1,
      text: 'SCHEDULE_REPEAT_TIME.MONDAY',
    },
    {
      value: 2,
      text: 'SCHEDULE_REPEAT_TIME.TUESDAY',
    },
    {
      value: 3,
      text: 'SCHEDULE_REPEAT_TIME.WEDNESDAY',
    },
    {
      value: 4,
      text: 'SCHEDULE_REPEAT_TIME.THURSDAY',
    },
    {
      value: 5,
      text: 'SCHEDULE_REPEAT_TIME.FRIDAY',
    },
    {
      value: 6,
      text: 'SCHEDULE_REPEAT_TIME.SATURDAY',
    },
    {
      value: 7,
      text: 'SCHEDULE_REPEAT_TIME.SUNDAY',
    },
  ];
  buttonWidth: string = `${100 / (this.buttons.length + 1)}%`;
  schedule: Schedule;
  isOneShot: boolean = false;
  // The originDaysSet is used to reset the selected days between repeated and one-shot schedules
  originDaysSet: Array<number> = [];

  actions: Array<any> = [];
  eshActions: any;

  constructor(
    private appTasks: AppTasks,
    private deviceCtrlService: DeviceControlService,
    private ims: InformationModelService,
    private popupService: PopupService,
    private scheduleService: ScheduleAdapterService,
    private translate: TranslateService,
    public alertCtrl: AlertController,
    public viewCtrl: ViewController,
    public params: NavParams,
  ) {
    this.device = params.get('device');
    if (!this.device) {
      this.viewCtrl.dismiss();
      return;
    }
    this.prepareLayout();

    this.index = params.get('index');
    if (this.index === -1) {
      const currentDateStart: Date = new Date();
      const startHour = currentDateStart.getHours() + 1;

      this.schedule = {
        name: '',
        start: this.getFormatTime(startHour),
        end: this.getFormatTime(startHour + 1),
        days: [currentDateStart.getDay()],
        active: 1,
        active_until: null,
        esh: {},
      };
      this.action = this.translate.instant('SCHEDULE_EDIT.CREATE');
      this.eshActions = Object.assign({}, this.device.status, this.getDefaultEshActions());
      this.eshActions = this.filterEshActions(this.eshActions);
    } else {
      const offset: number = new Date().getTimezoneOffset();
      this.schedule = this.scheduleService.toTimezoneSchedule(this.device.calendar[this.index], offset);
      this.action = this.translate.instant('SCHEDULE_EDIT.EDIT');

      this.eshActions = Object.assign({}, this.schedule.esh);
      this.isOneShot = this.scheduleService.isOneShot(this.schedule);
    }
  }

  private getFormatTime(hour: number) {
    // Return the time format 'HH:mm'
    let hourS = hour < 10 ? '0' + hour : new String(hour);
    return hourS + ':00';
  }

  private getDefaultEshActions() {
    // Return schedule esh actions from custom logic
    return {
      H00: 1,
    };
  }

  setRepeatData() {
    this.isOneShot = !this.isOneShot;
    if (!this.isOneShot) {
      this.schedule.days = this.originDaysSet;
      this.schedule.active_until = null;
    } else {
      this.originDaysSet = this.schedule.days;
      this.schedule.days = [new Date().getDay()];
      this.schedule.active_until = 1;
    }
  }

  setScheduleDays(value) {
    if (this.schedule.days.some(schedule => schedule === value)) {
      this.schedule.days = this.schedule.days.filter(schedule => schedule !== value);
    } else {
      this.schedule.days.push(value);
    }

    return this.schedule.days;
  }

  isEditMode(): boolean {
    return this.index > -1;
  }

  isValid(): boolean {
    const validSet = !!(
      this.schedule.days &&
      this.schedule.start !== '' &&
      this.schedule.end !== ''
    );

    return this.isOneShot ?
      validSet && this.schedule.days.length === 1 :
      validSet && this.schedule.days.length > 0;
  }

  deleteScheduleConfirm() {
    let alert = this.alertCtrl.create({
      title: this.translate.instant('SCHEDULE_EDIT.DELETE_SCHEDULE'),
      message: this.translate.instant('SCHEDULE_EDIT.DELETE_SCHEDULE_MSG', { name: this.schedule.name }),
      buttons: [
        {
          text: this.translate.instant('SCHEDULE_EDIT.CANCEL'),
          role: 'cancel',
        },
        {
          text: this.translate.instant('SCHEDULE_EDIT.DELETE'),
          handler: () => {
            this.deleteSchedule();
          }
        }
      ],
    });
    alert.present();
  }

  private deleteSchedule() {
    if (this.index > -1) {
      this.device.calendar.splice(this.index, 1);
    }

    let p = this.appTasks.wsRequestCalendarTask(this.device.device, this.device.calendar)
      .then(() => {
        this.viewCtrl.dismiss();
      });

    p = this.popupService.loadingPopup(p, {
      content: this.translate.instant('SCHEDULE_EDIT.DELETING')
    });

    p = this.popupService.toastPopup(p, null, {
      message: this.translate.instant('SCHEDULE_EDIT.DELETE_FAILED'),
      duration: 3000
    });
  }

  setStartTime() {
    this.startDt.open();
  }

  setEndTime() {
    this.endDt.open();
  }

  setCommand(event) {
    this.eshActions[event.key] = event.value;
    this.eshActions = Object.assign({}, this.eshActions);
  }

  save() {
    const offset: number = new Date().getTimezoneOffset();
    const utcSchedule = this.toUtcSchedule();
    utcSchedule.esh = this.filterEshActions(this.eshActions);

    if (utcSchedule.name && utcSchedule.name.trim() !== '') {
      utcSchedule.name = utcSchedule.name && utcSchedule.name.trim();
    } else {
      utcSchedule.name = this.translate.instant('SCHEDULE_EDIT.MY_SCHEDULE');
    }

    const shouldPopupShows = this.scheduleService.isOverlapping(utcSchedule, offset);
    if (shouldPopupShows) {
      this.showExecutePopup(utcSchedule, offset);
    } else {
      const calendar = this.setCalendar(utcSchedule, false, offset);
      this.saveCalendar(calendar);
    }
  }

  private showExecutePopup(UTCSchedule: Schedule, offset: number = 0) {
    this.alertCtrl
      .create({
        title: this.translate.instant('SCHEDULE_EDIT.EXECUTE_POPUP_TITLE'),
        message: this.translate.instant('SCHEDULE_EDIT.EXECUTE_POPUP_MSG'),
        buttons: [
          {
            handler: () => {
              const calendar = this.setCalendar(UTCSchedule, false, offset);
              this.saveCalendar(calendar);
            },
            text: this.translate.instant('SCHEDULE_EDIT.LATER'),
          },
          {
            handler: () => {
              const executeNow = true;
              const calendar = this.setCalendar(UTCSchedule, executeNow, offset);
              this.saveCalendar(calendar, executeNow, UTCSchedule.esh);
            },
            text: this.translate.instant('SCHEDULE_EDIT.START_NOW'),
          },
        ]
      })
      .present();
  }

  private saveCalendar(calendar: Array<Schedule>, executeNow: boolean = false, settings?: any) {
    if (executeNow && settings) {
      this.deviceCtrlService.setDevice(this.device.device, settings);
    }

    let p = this.appTasks.wsRequestCalendarTask(this.device.device, calendar)
      .then(() => this.viewCtrl.dismiss());

    p = this.popupService.loadingPopup(p, {
      content: this.translate.instant('SCHEDULE_EDIT.SAVING')
    });

    p = this.popupService.toastPopup(p, null, {
      message: this.translate.instant('SCHEDULE_EDIT.SAVE_FAILED'),
      duration: 3000
    });
  }

  private setCalendar(UTCSchedule: Schedule, executeNow: boolean = false, offset: number = 0) {
    const calendar = [];
    const utcSchedule = this.scheduleService.setActiveUntil(UTCSchedule, executeNow, offset);

    this.device.calendar.map(schedule => calendar.push(schedule));
    if (this.index === -1) {
      calendar.push(utcSchedule);
    } else {
      calendar[this.index] = utcSchedule;
    }

    return calendar;
  }

  private toUtcSchedule(): Schedule {
    const offset: number = new Date().getTimezoneOffset();
    let utcSchedule = this.scheduleService.toUTCSchedule(this.schedule, offset);

    utcSchedule.active = 1;

    return utcSchedule;
  }

  private filterEshActions(esh) {
    const newEsh = Object.assign({}, this.getDefaultEshActions());
    this.actions.forEach(componentModel => {
      componentModel.models.forEach(({ key, dependency, disable, values }) => {
        if (!Number.isInteger(esh[key])) return;

        const disableState = this.ims.processRules(disable, esh, key);
        if (!disableState) {
          const r = this.ims.processRules(dependency, esh, key);
          const vs = r && r.values ? r.values : values;
          if (Array.isArray(vs)) {
            newEsh[key] = vs.some(v => v.value === '*' || v.value === esh[key]) ? esh[key] : undefined;
          } else if (esh[key] >= Math.min(vs.min, vs.max) &&
            esh[key] <= Math.max(vs.min, vs.max)) {
            newEsh[key] = esh[key];
          }
        } else {
          delete newEsh[key];
        }
      });
    });

    return newEsh;
  }

  private prepareLayout() {
    this.actions.length = 0;
    if (this.device) {
      let uiModel = this.ims.getUIModel(this.device);
      let scheduleLayout = uiModel.scheduleLayout;
      if (scheduleLayout && scheduleLayout.primary) {
        let popular: Array<any> = [];
        scheduleLayout.primary.forEach((name) => {
          let m = uiModel.components[name];
          if (m) {
            popular.push(m);
          }
        });
        this.actions = [...popular];
      }

      if (scheduleLayout && scheduleLayout.secondary) {
        let expanded: Array<any> = [];
        scheduleLayout.secondary.forEach((name) => {
          let m = uiModel.components[name];
          if (m) {
            expanded.push(m);
          }
        });
        this.actions = [...this.actions, ...expanded];
      }
    }
  }
}
