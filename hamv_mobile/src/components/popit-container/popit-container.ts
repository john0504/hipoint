import {
  Component,
  ElementRef,
  HostListener,
  Input,
  OnInit,
  OnDestroy
} from '@angular/core';
import { AlertController, NavController } from 'ionic-angular';
import { StateStore } from 'app-engine';
import isEqual from 'lodash/isEqual';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { combineLatest } from 'rxjs/observable/combineLatest';
import 'intersection-observer';

import { TranslateService } from '@ngx-translate/core';

import { debounceImmediate } from '../../app/app.extends';

import { InformationModelService } from '../../modules/information-model';
import { DeviceConfigService } from '../../providers/device-config-service';
import { DeviceControlService } from '../../providers/device-control-service';
import { ViewStateService } from '../../providers/view-state-service';
import { AppUtils } from '../../utils/app-utils';

const options = {
  root: null,
  rootMargin: "100px 0px 100px 0px",
  thresholds: [0],
};

const observer: IntersectionObserver = new IntersectionObserver((entries, obs) => {
  entries.forEach((entry: IntersectionObserverEntry) => {
    entry.target['intersectionCallback'] && entry.target['intersectionCallback'](entry.intersectionRatio);
  });
}, options);

@Component({
  selector: 'popit-container',
  templateUrl: 'popit-container.html'
})
export class PopitContainerComponent implements OnInit, OnDestroy {

  private subs: Array<Subscription>;
  private account$: Observable<any>;
  private devices$: Observable<any>;

  _deviceSn: any;
  _device;
  isOwner: boolean;
  viewState: any;
  uiModel: any;
  popitPopular: Array<any>;
  popitExpanded: Array<any>;

  constructor(
    private ims: InformationModelService,
    private alertCtrl: AlertController,
    private stateStore: StateStore,
    private translate: TranslateService,
    public navCtrl: NavController,
    public deviceConfigService: DeviceConfigService,
    public deviceCtrlService: DeviceControlService,
    public viewStateService: ViewStateService,
    private elementRef: ElementRef,
  ) {
    this.subs = [];
    this.popitPopular = [];
    this.popitExpanded = [];
    this.account$ = this.stateStore.account$;
    this.devices$ = this.stateStore.devices$;
  }

  @HostListener('window:model-loaded', ['$event'])
  reload(event) {
    this.updateLayout();
  }

  public ngOnInit(): void {
    observer.observe(this.elementRef.nativeElement);
    this.elementRef.nativeElement.intersectionCallback = go => {
      if (go <= 0) {
        this.stop();
      } else {
        this.start();
      }
    };
  }

  private start() {
    this.subs.push(
      combineLatest(this.devices$, this.account$)
        .pipe(debounceImmediate(500))
        .subscribe(values => this.updateUi(values))
    );
  }

  private updateUi([devices, account]) {
    if (this._deviceSn && devices[this._deviceSn]) {
      this._device = devices[this._deviceSn];
      this.isOwner = AppUtils.isOwner(this._device, account.account);
      this.updateLayout();
    }
    this.viewState = this.updateViewState(this.viewState);
  }

  public ngOnDestroy(): void {
    this.elementRef.nativeElement.intersectionCallback = undefined;
    observer.unobserve(this.elementRef.nativeElement);
    this.stop();
  }

  private stop() {
    this.subs && this.subs.forEach((s) => {
      s.unsubscribe();
    });
    this.subs.length = 0;
  }

  @Input()
  get deviceSn(): any {
    return this._deviceSn;
  }

  set deviceSn(val: any) {
    if (val) {
      this._deviceSn = val;
      this.viewState = this.viewStateService.getViewState(this._deviceSn) || {};
      this._device = this.viewState.device;
      this.popitPopular = this.viewState.popitPopular || [];
      this.popitExpanded = this.viewState.popitExpanded || [];
    }
  }

  private updateViewState(current): any {
    let viewState: any = this.viewStateService.getViewState(this._deviceSn) || {};
    const status = {};
    if (this._device) {
      viewState.device = this._device;
      viewState.isConnected = this.isDeviceOnline();
      viewState.isDeviceUpdating = this.isDeviceUpdate();

      if (this._device.status) {
        for (let key in this._device.status) {
          if (this.deviceCtrlService.isAvailable(this._device.device, key)) {
            status[key] = this._device.status[key];
          }
        }
      }
    }

    viewState.status = Object.assign({}, viewState.status, status);
    this.viewStateService.setViewState(this._deviceSn, viewState);

    return viewState;
  }

  private updateLayout() {
    if (this._device) {
      let uiModel = this.ims.getUIModel(this._device);
      if (!uiModel) {
        this.uiModel = undefined;
        this.popitPopular.length = 0;
        this.popitExpanded.length = 0;
      } else if (!isEqual(this.uiModel, uiModel)) {
        this.uiModel = uiModel;

        let controlLayout = this.uiModel.controlLayout;
        if (controlLayout && controlLayout.primary) {
          let popitPopular: Array<any> = [];
          controlLayout.primary.forEach((name) => {
            let m = uiModel.components[name];
            if (m) {
              popitPopular.push(m);
            }
          });
          this.popitPopular = popitPopular;
        }

        if (controlLayout && controlLayout.secondary) {
          let popitExpanded: Array<any> = [];
          controlLayout.secondary.forEach((name) => {
            let m = uiModel.components[name];
            if (m) {
              popitExpanded.push(m);
            }
          });
          this.popitExpanded = popitExpanded;
        }

        this.requestConfig(this._deviceSn, uiModel.config);
      }

      this.viewState.popitPopular = this.popitPopular;
      this.viewState.popitExpanded = this.popitExpanded;
      this.viewStateService.setViewState(this._deviceSn, this.viewState);
    }
  }

  private requestConfig(sn: string, config: Array<string>) {
    if (!sn || !config) return;
    this.deviceConfigService.requestConfig(sn, config);
  }

  showInfo() {
    const alertTitle = this.translate.instant('POPIT_CONTAINER.SHOW_INFO');
    const alertOK = this.translate.instant('POPIT_CONTAINER.OK');
    const alert = this.alertCtrl.create({
      title: alertTitle,
      buttons: [{ text: alertOK }],
    });
    alert.present();
  }

  toggleDetails() {
    if (!this.viewState) return;
    if (this.viewState.showDetails) {
      this.viewState.showDetails = false;
    } else {
      this.viewState.showDetails = true;
    }
  }

  isDeviceOnline(): boolean {
    return AppUtils.isDeviceOnline(this._device);
  }

  isDeviceUpdate(): boolean {
    return AppUtils.isDeviceUpdate(this._device);
  }

  sendCommands(commands) {
    let cmd = {};
    cmd[commands.key] = commands.value;
    this.deviceCtrlService.setDevice(this._deviceSn, cmd);

    this.viewState.status = Object.assign({}, this.viewState.status, cmd);
    this.viewStateService.setViewState(this._deviceSn, this.viewState);
  }

  openSettings() {
    this.navCtrl.push('DeviceSettingsPage', { device: this._device });
  }

  openSharing() {
    this.navCtrl.push('DeviceSharingPage', { deviceSn: this._deviceSn });
  }

  openSchedule() {
    this.navCtrl.push('ScheduleListPage', { deviceSn: this._device.device });
  }
}
