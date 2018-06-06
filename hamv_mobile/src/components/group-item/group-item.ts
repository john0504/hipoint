import { Component, Input } from '@angular/core';

import { NavController } from 'ionic-angular';

import { ThemeService } from '../../providers/theme-service';

@Component({
  selector: 'group-item',
  templateUrl: 'group-item.html'
})
export class GroupItemComponent {

  _group: any;
  devices: Array<any>;

  constructor(
    public navCtrl: NavController,
    public themeService: ThemeService,
  ) {
    this.devices = [];
  }

  @Input()
  set group(val: any) {
    this._group = val;
    this.devices = val ? val.devices : [];
  }

  get group(): any {
    return this._group;
  }

  goToGroupsPage() {
    this.navCtrl.setRoot('MyGroupsPage');
  }
}
