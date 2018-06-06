import { Component, Input } from '@angular/core';

@Component({
    selector: 'device-item',
    templateUrl: 'device-item.html',
})
export class DeviceItemComponent {

    _device: any;

    constructor(
    ) {
    }

    @Input()
    set device(val: any) {
        if (val) {
            this._device = val;
        }
    }
}
