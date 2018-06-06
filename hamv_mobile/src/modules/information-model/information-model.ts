export interface ContainerModel {
    familyName: string;
    controlLayout: LayoutModel;
    scheduleLayout: LayoutModel;
    familyMembers: Array<string>;
    config: Array<string>;
    hiddenFields: Array<string>;
    deviceId: number | string;
    components;
}

export interface LayoutModel {
    primary: Array<string>;
    secondary?: Array<string>;
}

export interface ComponentModel {
    type: string;
    title: string;
    models: Array<ControlItemModel>;
    hideFromGroup: boolean;
}

export interface ControlItemModel {
    key: string;
    values?: Array<ValueItem> | UIOptions;
    default: number;
    dependency?: Array<Rule>;
    disable?: Array<Rule>;
    options?: any;
}

export interface ValueItem {
    value: number | string;
    text: string;
    icon?: string;
    fontColor? :string;
}

export interface UIOptions {
    min: number;
    max: number;
    step: number;
    func?: string;
    rules?: Array<Rule>;
}

export interface Rule {
    conditions: Array<Condition>;
    result?: any;
}

export interface Condition {
    key?: string;
    op: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte';
    target: any;
}
