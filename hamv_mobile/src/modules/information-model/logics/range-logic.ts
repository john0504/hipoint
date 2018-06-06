import { EventEmitter } from '@angular/core';

import {
  ControlItemModel,
  InformationModelService,
  OUTLIER,
  UIOptions,
  ValueItem,
} from '../../information-model';
import { LogicBase } from './logic-base';

export class RangeLogic extends LogicBase<RangeLogicState> {
  public state: RangeLogicState;
  private _defaultValueItem: ValueItem = {
    value: OUTLIER,
    text: '--'
  };
  private values: Array<ValueItem> | UIOptions;

  constructor(
    _ims: InformationModelService,
    _exoChange: EventEmitter<{ key: string, value: any }>,
  ) {
    super(_ims, _exoChange);

    this.ims = _ims;
    this.state = {
      currentIndex: undefined,
      default: undefined,
      disableState: false,
      key: '',
      status: {
        min: 0,
        max: 1,
        step: 1,
      },
      currentValueItem: this._defaultValueItem,
    };
  }

  private getCurrentIndex(currentValue: number) {
    if (this.values instanceof Array) {
      const currentValues = this.values as Array<ValueItem>;
      return currentValues.findIndex(({ value }) => value === currentValue);
    }
    return currentValue;
  }

  private getValueItem(index: any): ValueItem {
    if (this.values instanceof Array) {
      return this.values[index] ? this.values[index] : this._defaultValueItem;
    } else if (this.values.func) {
      return this.ims.getValueItemByFunction(this.values.func, index, this._defaultValueItem);
    } else if (this.values.rules && this.ims.isValidRules(this.values.rules)) {
      return this.ims.getValueItemByRules(this.values.rules, this.state.key, index, this._defaultValueItem);
    }

    return this._defaultValueItem;
  }

  public processLayout(
    values: Array<ValueItem> | UIOptions,
    key: string,
    unitModel: ControlItemModel
  ): RangeLogicState {
    this.state.key = key;
    this.state.default = unitModel.default;

    if (values instanceof Array) {
      for (const valueItem of values) {
        // TODO: Throw error if value equals to OUTLIER
        if (valueItem.value === OUTLIER) {
          throw new Error('Value "*" is not supported now, please check your item value and try again.');
        }
      }

      this.state.status = {
        min: 0,
        max: values.length - 1,
        step: 1,
      };
    } else {
      if (values.min === undefined || values.max === undefined) {
        throw new Error('The value of min or max is undefined');
      }
      if (values.min >= values.max || values.step <= 0) {
        throw new Error('The values are illegal.');
      }
      if (!Number.isInteger(values.min) || !Number.isInteger(values.max) || !Number.isInteger(values.step)) {
        throw new Error('The values are illegal.');
      }
      this.state.status = {
        min: values.min,
        max: values.max,
        step: values.step,
      };
    }

    if (!this.values || this.values !== values) {
      this.values = values;
    }
    return this.state;
  }

  public processUIState(currentValueState: any, key: string, model: ControlItemModel): RangeLogicState {
    const currentValue = currentValueState ? currentValueState[key] : undefined;
    this.state.currentIndex = this.getCurrentIndex(currentValue);
    this.state.currentValueItem = this.getValueItem(this.state.currentIndex);

    return this.state;
  }

  public processDisableState(disableState, key: string, model: ControlItemModel): RangeLogicState {
    this.state.disableState = disableState;
    return this.state;
  }

  public sendValue(value: any): RangeLogicState {
    const valueItem = this.getValueItem(value);
    this.state.currentValueItem = valueItem;

    this.exoChange.emit({ key: this.state.key, value: valueItem.value });
    return this.state;
  }

  public valueChanges(value: any): RangeLogicState {
    this.state.currentValueItem = this.getValueItem(value);
    return this.state;
  }
}

export interface RangeLogicState {
  currentIndex: number;
  default: number;
  disableState: boolean;
  key: string;
  status: {
    min: number,
    max: number,
    step: number,
  };
  currentValueItem: ValueItem;
}
