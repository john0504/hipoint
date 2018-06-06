import { Injectable } from '@angular/core';
import { Network } from '@ionic-native/network';
import { TranslateService } from '@ngx-translate/core';
import { Subject } from 'rxjs/Subject';
import { Subscription } from 'rxjs/Subscription';

import { PopupService } from './popup-service';

@Injectable()
export class CheckNetworkService {

  private noNetworkToast;
  private isPaused: number = 0;
  private noNetwork: boolean = false;
  private subject: Subject<any>;
  private worker: Subscription;

  constructor(
    private popupService: PopupService,
    private network: Network,
    private translate: TranslateService,
  ) {
    this.subject = new Subject<any>();
    this.worker = this.subject
      .subscribe((show: boolean) => {
        if (show && !this.noNetworkToast) {
          const notFoundMsg = this.translate.instant('CHECK_NETWORKS.NOT_FOUND');
          this.noNetworkToast = this.popupService.makeToast({
            message: notFoundMsg,
            position: 'top',
          });
        } else if (!show && this.noNetworkToast) {
          this.noNetworkToast.dismiss();
          this.noNetworkToast = null;
        }
      });
    this.network.onDisconnect().subscribe(() => {
      this.noNetwork = true;
      this.subject.next(this.noNetwork && !this.isPaused);
    });
    this.network.onConnect().subscribe(() => {
      this.noNetwork = false;
      this.subject.next(false);
    });
  }

  public pause() {
    this.isPaused++;
    this.subject.next(false);
  }

  public resume() {
    this.isPaused--;
    this.subject.next(this.noNetwork && this.isPaused === 0);
  }

  public destroy() {
    this.subject.unsubscribe();
    this.worker.unsubscribe();
  }
}
