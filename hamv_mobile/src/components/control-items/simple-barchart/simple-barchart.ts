import { Chart } from 'chart.js';
import { TranslateService } from '@ngx-translate/core';
import {
  Component,
  forwardRef,
  ViewEncapsulation,
  ViewChild
} from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { AppTasks } from 'app-engine';

import {
  ComponentModel,
  ControlItemModel,
  InformationModelService,
  ReadOnlyLogic,
  ReadOnlyLogicState,
  UIOptions,
  UIComponentBase,
  ValueItem
} from '../../../modules/information-model';
import { Storage } from '@ionic/storage';

@Component({
  selector: 'simple-barchart',
  templateUrl: 'simple-barchart.html',
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => SimpleBarchart), multi: true }],
  encapsulation: ViewEncapsulation.None,
})
export class SimpleBarchart extends UIComponentBase {
  title: string = '';
  logic: ReadOnlyLogic;
  state: ReadOnlyLogicState;
  @ViewChild('barCanvas') barCanvas;
  barChart: any;
  lastTime: any;
  xAxesTicks: any = { fontSize: 8 };
  yAxesTicks: any;
  showDetails: boolean = false;
  currentSn: string;
  currentKey: string;
  currentOption: any;
  currentDatas: any;
  fontColor: string = '#000000';

  constructor(
    ims: InformationModelService,
    private appTasks: AppTasks,
    private translate: TranslateService,
    private storage: Storage,
  ) {
    super(ims, 'simple-barchart', null);
    this.logic = new ReadOnlyLogic(ims, this.exoChange);
    this.state = this.logic.state;
  }

  protected processLayout(model: ComponentModel, values: Array<ValueItem> | UIOptions, key: string, index: number, unitModel: ControlItemModel) {
    if (!values || !model || !unitModel || index !== 0) return;
    this.title = this.translate.instant(model.title);
    this.state = this.logic.processLayout(values, key, unitModel);
  }

  private historyByAuthTask(deviceSn, field, options) {
    const group = options && options.sammpling ? options.sammpling : 60;
    const currentDate: Date = new Date();
    const timeNow = currentDate.getTime();
    let from = Math.floor(timeNow / 1000) - 60 * 60 * 24 * 7;
    if (group == 1440) {
      from = Math.floor(timeNow / 1000) - 60 * 60 * 24 * 90;
    }
    const to = Math.floor(timeNow / 1000);
    console.log("from:" + from + " & to:" + to);

    return this.appTasks.historyByAuthTask(deviceSn, from, to, group)
      .then((result: any) => {
        this.storage.set(deviceSn, result);
        this.makeBarChart(deviceSn, field, options);
      })
      .catch((error: any) => {

      });
  }

  makeBarChart(deviceSn, field, options) {
    let datas = {
      labels: [],
      datasets: []
    };
    let dataset = {
      label: this.title,
      data: [],
      backgroundColor: [],
      borderColor: [],
      borderWidth: 1
    };
    this.yAxesTicks = options && options.ymax ? { beginAtZero: true, max: options.ymax, min: options.ymin } : { beginAtZero: true };
    const currentDate: Date = new Date();
    const timeNow = currentDate.getTime();
    this.storage.get(deviceSn + 'lastTime').then((lastTime) => {
      if (!lastTime || timeNow - 60 * 60 * 1000 > lastTime) {
        this.storage.set(deviceSn + 'lastTime', timeNow);
        this.historyByAuthTask(deviceSn, field, options);
      } else {
        this.storage.get(deviceSn).then((result) => {
          if (!result) {
            this.historyByAuthTask(deviceSn, field, options);
          } else {
            let ratio = options && options.ratio ? options.ratio : 1;
            result.forEach(data => {
              const currentDate: Date = new Date();
              currentDate.setTime(data.tick * 1000);
              const month = getTimeString(currentDate.getMonth() + 1);
              const date = getTimeString(currentDate.getDate());
              const hour = getTimeString(currentDate.getHours());
              const minute = getTimeString(currentDate.getMinutes());
              const fulldate = `${month}-${date} ${hour}:${minute}`;
              let value = data[field] / ratio;
              if (value > -30000) {
                datas.labels.push(fulldate);
                dataset.data.push(value);
                dataset.backgroundColor.push(options && options.backgroundColor ? options.backgroundColor : "rgba(255, 99, 132, 0.2)");
                dataset.borderColor.push(options && options.borderColor ? options.borderColor : "rgba(255, 99, 132, 1)");
              }
            });
            datas.datasets.push(dataset);
            this.barChart = new Chart(this.barCanvas.nativeElement, {
              type: 'line',
              data: datas,
              options: {
                scales: {
                  xAxes: [{
                    ticks: this.xAxesTicks
                  }],
                  yAxes: [{
                    ticks: this.yAxesTicks
                  }]
                }
              }
            });
          }
        });
      }
    });
  }

  toggleDetails() {
    this.showDetails = !this.showDetails;
    if (this.showDetails) {
      this.makeBarChart(this.currentSn, this.currentKey, this.currentOption);
    } else {
      this.barChart = false;
    }
  }

  protected processUIState(currentValueState: any, key: string, index: number, model: ControlItemModel) {
    if (!key || index !== 0) return;
    this.state = this.logic.processUIState(currentValueState, key, model);
    this.currentSn = currentValueState.sn;
    this.currentKey = key;
    this.currentOption = model.options;

    let threshold: number[] = [0, 65535];
    if (currentValueState.sensorLimit && currentValueState.sensorLimit[key]) {
      threshold = currentValueState.sensorLimit[key];
    }
    if (model.options && threshold[1] != 65535) {
      if (this.state.currentValueItem.value >= threshold[1]) {
        this.fontColor = model.options.fontColor;
      } else {
        this.fontColor = "#000000";
      }
    }
  }

  protected processDisableState(disableState, key: string, index: number, model: ControlItemModel) {
    if (index !== 0) return;
    this.state = this.logic.processDisableState(disableState, key, model);
  }
}

function getTimeString(value: number) {
  let timeString = `${value}`;
  if (timeString.length == 1) {
    timeString = '0' + timeString;
  }
  return timeString;
}
