import { AfterContentInit, Component, DoCheck, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { Storage } from '@ionic/storage';

import { ScrollableTabsOptions } from './scrollable-tabs-options';

const TAB_CONFIG = 'tabConfig';

@Component({
  selector: 'scrollable-tabs',
  templateUrl: 'scrollable-tabs.html'
})
export class ScrollableTabs implements AfterContentInit, DoCheck {
  @Input('tabs') tabs: Array<ScrollableTabsOptions>;
  @Output() tabSelected: EventEmitter<any> = new EventEmitter();
  @ViewChild('scrollableTabs') scrollableTabs: ElementRef;
  currentTabIndex: number = 0;

  constructor(
    private storage: Storage,
  ) {
  }

  ngDoCheck() {
    if (!this.tabs) { return; }

    if (!this.tabs[this.currentTabIndex]) {
      this.selectTab(this.tabs[0]);
    }
  }

  ngAfterContentInit() {
    if (isNaN(this.currentTabIndex)) {
      this.selectTab(this.tabs[0]);
    }

    this.getTabIndex()
      .then((index) => {
        this.currentTabIndex = index;
        this.selectTab(this.tabs[index], index);
      });
  }

  private getTabIndex(): Promise<number> {
    return this.storage.get(TAB_CONFIG)
      .then((value) => {
        if (!value || value.lastSelectedIndex < 0) {
          return 0;
        }

        return value.lastSelectedIndex;
      });
  }

  selectTab(currentTab, index: number = 0) {
    const tabConfig = {
      "lastSelectedIndex": index,
    };
    this.storage.set(TAB_CONFIG, tabConfig);

    this.currentTabIndex = index;
    setTimeout(() => this.scrollToSelectedTab());
    this.tabSelected.emit({
      index,
      selected: currentTab,
    });
  }

  // Source from: https://github.com/SinoThomas/Ionic2-ScrollableTabs/blob/master/src/components/scrollable-tabs/scrollable-tabs.ts
  scrollToSelectedTab() {
    const tabs = this.scrollableTabs.nativeElement;
    const tabsWidth = tabs.clientWidth;
    const selectedTab = tabs.children[this.currentTabIndex];
    const selectedTabWidth = selectedTab.clientWidth;
    const selectedTabLeftOffset = tabs.getElementsByTagName("li")[this.currentTabIndex].offsetLeft;
    const selectedTabMid = selectedTabLeftOffset + (selectedTabWidth / 2);
    const newScrollLeft = selectedTabMid - (tabsWidth / 2);

    this.scrollXTo(newScrollLeft, 300);
  }

  scrollXTo(x: number, duration: number = 300): Promise<any> {
    // scroll animation loop w/ easing
    const tabbar = this.scrollableTabs.nativeElement;

    if (!tabbar) {
      // invalid element
      return Promise.resolve();
    }
    x = x || 0;

    const originalRaf = (window[window['Zone']['__symbol__']('requestAnimationFrame')] || window[window['Zone']['__symbol__']('webkitRequestAnimationFrame')]);
    const nativeRaf = originalRaf !== undefined ? originalRaf['bind'](window) : window.requestAnimationFrame.bind(window);
    const fromX = tabbar.scrollLeft;
    const maxAttempts = (duration / 16) + 100;

    return new Promise((resolve) => {
      let attempts = 0;
      let isPlaying: boolean;
      let startTime: number;

      // scroll loop
      function step() {
        attempts++;

        if (!tabbar || !isPlaying || attempts > maxAttempts) {
          isPlaying = false;
          resolve();
          return;
        }

        let time = Math.min(1, ((Date.now() - startTime) / duration));

        // where .5 would be 50% of time on a linear scale easedT gives a
        // fraction based on the easing method
        let easedT = (--time) * time * time + 1;

        if (fromX !== x) {
          tabbar.scrollLeft = Math.floor((easedT * (x - fromX)) + fromX);
        }

        if (easedT < 1) {
          nativeRaf(step);
        } else {
          // done
          resolve();
        }
      }

      // start scroll loop
      isPlaying = true;

      // chill out for a frame first
      nativeRaf(() => {
        startTime = Date.now();
        nativeRaf(step);
      });
    });
  }
}
