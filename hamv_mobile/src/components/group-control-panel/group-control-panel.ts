import {
  Component,
  HostListener,
  Input,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { ViewController } from 'ionic-angular';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import isEqual from 'lodash/isEqual';

import { Group, StateStore } from 'app-engine';

import { InformationModelService } from '../../modules/information-model';
import { DeviceControlService } from '../../providers/device-control-service';
import { ViewStateService } from '../../providers/view-state-service';
import { debounceImmediate } from '../../app/app.extends';

@Component({
  selector: 'group-control-panel',
  templateUrl: 'group-control-panel.html'
})
export class GroupControlPanelComponent implements OnInit, OnDestroy {

  private lifeCycleSubs: Array<Subscription>;
  private subs: Array<Subscription>;
  private devices$: Observable<any>;

  viewState: any;

  _group: Group;
  private allDevices;
  _devices: Array<string>;
  _possibleModelsNames;
  _controls: Array<any>;

  constructor(
    private deviceCtrlService: DeviceControlService,
    private ims: InformationModelService,
    private stateStore: StateStore,
    private viewCtrl: ViewController,
    private viewStateService: ViewStateService,
  ) {
    this.lifeCycleSubs = [];
    this.subs = [];

    this._devices = [];
    this._controls = [];

    this.viewState = {
      showControls: false,
      showControlsIcon: 'arrow-dropdown-circle',
      state: {},
    };

    this.devices$ = this.stateStore.devices$;
  }

  @HostListener('window:model-loaded', ['$event'])
  reload(event) {
    this.updateUI();
  }

  @Input()
  set group(val: Group) {
    this._group = val;
    this.updateUI();
  }

  get group(): Group {
    return this._group;
  }

  @Input()
  set expand(val: boolean) {
    this.viewState.showControls = val;
    if (val) {
      this.viewState.showControlsIcon = 'arrow-dropup-circle';
    } else {
      this.viewState.showControlsIcon = 'arrow-dropdown-circle';
    }
  }

  get expand(): boolean {
    return this.viewState.showControls;
  }

  public ngOnInit(): void {
    this.lifeCycleSubs.push(this.viewCtrl.willEnter.subscribe(() => this.doSubscribe()));
    this.lifeCycleSubs.push(this.viewCtrl.didLeave.subscribe(() => this.doUnsubscribe()));
    this.doSubscribe();
  }

  public ngOnDestroy(): void {
    this.doUnsubscribe();
    this.lifeCycleSubs && this.subs.forEach((s) => {
      s.unsubscribe();
    });
    this.lifeCycleSubs.length = 0;
  }

  private doSubscribe() {
    this.subs.push(
      this.devices$
        .pipe(debounceImmediate(1000))
        .subscribe(devices => {
          this.allDevices = devices;
          this.updateUI();
        })
    );
  }

  private doUnsubscribe() {
    this.subs && this.subs.forEach((s) => {
      s.unsubscribe();
    });
    this.subs.length = 0;
  }

  toggleControls() {
    if (this.viewState.showControls) {
      this.viewState.showControls = false;
      this.viewState.showControlsIcon = 'arrow-dropdown-circle';
    } else {
      this.viewState.showControls = true;
      this.viewState.showControlsIcon = 'arrow-dropup-circle';
    }
  }

  private updateUI() {
    if (this._group) {
      this._devices = [...this._group.devices];
    } else {
      this._devices.length = 0;
    }
    if (this.allDevices && this._devices.length > 0) {
      const possibleModelsNames = this.filterPossibleModels();
      if (!isEqual(possibleModelsNames, this._possibleModelsNames)) {
        this._possibleModelsNames = possibleModelsNames;
        this._controls = this.generateControls(possibleModelsNames);
      }
      this.viewState = this.updateViewState(this.viewState);
    } else {
      this.viewState = {
        showControls: false,
        showControlsIcon: 'arrow-dropdown-circle',
      };
      this._controls.length = 0;
    }
  }

  private updateViewState(current) {
    const temp = {};
    this._devices.forEach(deviceId => {
      const _d = this.allDevices[deviceId];
      if (_d && _d.status) {
        for (let key in _d.status) {
          if (!temp[key]) {
            temp[key] = { value: _d.status[key], keep: true, count: 1 };
          } else if (temp[key].value === _d.status[key]) {
            temp[key].count++;
          } else {
            temp[key].keep = false;
          }
        }
      }
    });

    const oldState = current.state || {};
    const state = {};
    for (let key in temp) {
      let item = temp[key];
      if (item.keep && item.count === this._devices.length) {
        if (!this._devices.some(deviceId => !this.deviceCtrlService.isAvailable(deviceId, key))) {
          state[key] = item.value;
        } else {
          state[key] = oldState[key];
        }
      }
    }

    let viewState: any = this.viewStateService.getViewState(this.getViewStateName()) || {};
    viewState.state = state;
    if (!isEqual(current, viewState)) {
      viewState = Object.assign({}, current, viewState);
    }
    this.viewStateService.setViewState(this.getViewStateName(), viewState);

    return viewState;
  }

  private generateControls(possibleModelNames) {
    const uiModels = [];
    for (let modelName of possibleModelNames) {
      uiModels.push(this.ims.getUIModelFromName(modelName));
    }

    if (!uiModels || uiModels.length <= 0) return [];
    this.cleanRelationship(uiModels);
    if (uiModels.length === 1) {
      const uiModel = uiModels[0];
      return this.getControlsFromModel(uiModel);
    } else {
      const controls = this.generateGroupControlsFromControlLayouts(uiModels);
      return controls.length > 0 ? controls : this.generateGroupControlsFromComponentRepository(uiModels);
    }
  }

  private getControlsFromModel(uiModel) {
    const uiControls = [];
    const controlLayout = uiModel.controlLayout;
    if (controlLayout && controlLayout.primary) {
      controlLayout.primary.forEach((name) => {
        let m = uiModel.components[name];
        if (m) {
          uiControls.push(m);
        }
      });
    }
    if (controlLayout && controlLayout.secondary) {
      controlLayout.secondary.forEach((name) => {
        let m = uiModel.components[name];
        if (m) {
          uiControls.push(m);
        }
      });
    }
    return uiControls;
  }

  private generateGroupControlsFromControlLayouts(uiModels) {
    const controlMaps = {};
    let shortestCtrls;
    let length = Number.MAX_SAFE_INTEGER;
    uiModels.forEach(uiModel => {
      const c = this.getControlsFromModel(uiModel);
      controlMaps[uiModel.familyName] = c;
      if (c.length < length) {
        shortestCtrls = { name: uiModel.familyName, ctrls: c };
        length = c.length;
      }
    });
    delete controlMaps[shortestCtrls.name];
    const controls = [];
    for (let candidate of shortestCtrls.ctrls) {
      let voted = true;
      for (let key in controlMaps) {
        const temp = controlMaps[key];
        voted = voted && temp.some(ctrl => isEqual(ctrl, candidate));
        if (!voted) break;
      }
      if (voted) {
        controls.push(candidate);
      }
    }
    return controls;
  }

  private generateGroupControlsFromComponentRepository(uiModels) {
    const controlMaps = {};
    let shortestCtrls;
    let length = Number.MAX_SAFE_INTEGER;
    uiModels.forEach(uiModel => {
      const c = uiModel.components;
      controlMaps[uiModel.familyName] = c;
      const cLength = Object.keys(c).length;
      if (cLength < length) {
        shortestCtrls = { name: uiModel.familyName, ctrls: c };
        length = cLength;
      }
    });
    delete controlMaps[shortestCtrls.name];
    const controls = [];
    for (let key in shortestCtrls.ctrls) {
      const candidate = shortestCtrls.ctrls[key];
      let voted = true;
      for (let key in controlMaps) {
        let temp = controlMaps[key];
        let found = false;
        for (let cName in temp) {
          let ctrl = temp[cName];
          if (isEqual(ctrl, candidate)) {
            found = true;
            break;
          }
        }
        voted = voted && found;
        if (!voted) break;
      }
      if (voted) {
        controls.push(candidate);
      }
    }
    return controls;
  }

  private cleanRelationship(uiModels) {
    uiModels.forEach(model => {
      const components = model.components;
      const removeKeys = Object.keys(components).filter(component => components[component].hideFromGroup);

      removeKeys.map((key) => {
        if (components[key]) {
          delete components[key];
        }
      });

      for (let key in components) {
        const component = components[key];
        const models = component.models;
        models && models.forEach(ctrl => {
          delete ctrl.dependency;
          delete ctrl.disable;
        });
      }
    });
  }

  sendCommands(commands) {
    if (this.allDevices && this._devices.length > 0) {
      this._devices.forEach(deviceId => {
        const _d = this.allDevices[deviceId];
        if (_d && _d.connected) {
          let cmd = {};
          cmd[commands.key] = commands.value;
          this.deviceCtrlService.setDevice(deviceId, cmd);

          this.viewState.state = Object.assign({}, this.viewState.state, cmd);
          this.viewStateService.setViewState(this.getViewStateName(), this.viewState);
        }
      });
    }
  }

  private filterPossibleModels() {
    let possibleModelNames = [];
    for (let deviceId of this._devices) {
      const _d = this.allDevices[deviceId];
      const modelName = this.ims.getUIModelName(_d);
      possibleModelNames.push(modelName);
    }
    if (possibleModelNames.some(t => !t)) return [];

    return possibleModelNames.filter((v, i, a) => a.indexOf(v) === i);
  }

  private getViewStateName(): string {
    return `${this._group.name}-group-control`;
  }
}
