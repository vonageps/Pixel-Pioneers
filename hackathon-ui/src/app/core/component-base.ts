import {OnInit, OnDestroy, Component} from '@angular/core';
import {Subscription} from 'rxjs';
@Component({
  template: '',
})
export class ComponentBase implements OnInit, OnDestroy {
  protected _subscriptions: Subscription[] = [];

  ngOnDestroy() {
    this.clearAllSubscriptions();
  }

  clearAllSubscriptions() {
    this._subscriptions.forEach(subscription => {
      if (subscription) {
        subscription.unsubscribe();
      }
    });
    this._subscriptions = [];
  }

  ngOnInit() {
    // Add initialisation related logic
  }
}
