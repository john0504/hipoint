import {
    Component,
    EventEmitter,
    Input,
    Output,
} from '@angular/core';

@Component({
    selector: 'group-bag',
    templateUrl: 'group-bag.html'
})
export class GroupBagComponent {

    _group;

    @Output() groupAction: EventEmitter<any> = new EventEmitter<any>();

    constructor() {
    }

    @Input()
    set group(val: any) {
        if (val) {
            this._group = val;
        }
    }

    get group() {
        return this._group;
    }

    triggerAction() {
        this.groupAction.emit();
    }
}
