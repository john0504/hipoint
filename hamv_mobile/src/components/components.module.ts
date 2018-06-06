import { NgModule } from '@angular/core';
import { IonicModule } from 'ionic-angular';
import { TranslateModule } from '@ngx-translate/core';
import { InformationModelModule } from '../modules/information-model';
import { PipesModule } from '../pipes/pipes.module';

import { MyDevicesPage } from './my-devices/my-devices';
import { PopitContainerComponent } from './popit-container/popit-container';
import {
  ButtonGroupWithToggle,
  RangeWithToggle,
  LargeToggleWithRange,
  LargeToggle,
  SimpleButtonGroup,
  SimpleRange,
  SimpleText,
  AqiText,
  SimpleToggle,
  SimpleBarchart,
} from './control-items';
import { GroupItemComponent } from './group-item/group-item';
import { DeviceItemComponent } from './device-item/device-item';
import { GroupBagComponent } from './group-bag/group-bag';
import { DeviceBagComponent } from './device-bag/device-bag';
import { ExtraPageSpaceComponent } from './extra-page-space/extra-page-space';
import { ScrollableTabs } from './scrollable-tabs/scrollable-tabs';
import { GroupControlPanelComponent } from './group-control-panel/group-control-panel';

@NgModule({
  declarations: [
    MyDevicesPage,
    PopitContainerComponent,
    ButtonGroupWithToggle,
    RangeWithToggle,
    LargeToggleWithRange,
    LargeToggle,
    SimpleButtonGroup,
    SimpleRange,
    SimpleText,
    AqiText,
    SimpleToggle,
    SimpleBarchart,
    GroupBagComponent,
    DeviceBagComponent,
    ExtraPageSpaceComponent,
    ScrollableTabs,
    GroupControlPanelComponent,
    GroupItemComponent,
    DeviceItemComponent,
  ],
  imports: [
    IonicModule,
    PipesModule,
    TranslateModule,
    InformationModelModule,
  ],
  exports: [
    MyDevicesPage,
    PopitContainerComponent,
    ButtonGroupWithToggle,
    RangeWithToggle,
    LargeToggleWithRange,
    LargeToggle,
    SimpleButtonGroup,
    SimpleRange,
    SimpleText,
    AqiText,
    SimpleToggle,
    SimpleBarchart,
    GroupBagComponent,
    DeviceBagComponent,
    ExtraPageSpaceComponent,
    ScrollableTabs,
    GroupControlPanelComponent,
    GroupItemComponent,
    DeviceItemComponent,
  ],
  entryComponents: [
    MyDevicesPage,
    PopitContainerComponent,
    ButtonGroupWithToggle,
    RangeWithToggle,
    LargeToggleWithRange,
    LargeToggle,
    SimpleButtonGroup,
    SimpleRange,
    SimpleText,
    AqiText,
    SimpleToggle,
    SimpleBarchart,
    GroupBagComponent,
    DeviceBagComponent,
    ExtraPageSpaceComponent,
    ScrollableTabs,
    GroupControlPanelComponent,
    GroupItemComponent,
    DeviceItemComponent,
  ]
})
export class ComponentsModule { }
