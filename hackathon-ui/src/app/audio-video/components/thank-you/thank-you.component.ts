import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { RouteComponentBase } from '@care/core/route-component-base';
import { UserSessionStoreService } from '@care/core/store';
import { environment } from '@care/env/environment';

@Component({
  selector: 'telescope-thank-you',
  templateUrl: './thank-you.component.html',
  styleUrls: ['./thank-you.component.scss'],
})
export class ThankYouComponent extends RouteComponentBase implements OnInit {
  constructor(
    protected readonly route: ActivatedRoute,
    protected readonly location: Location,
    private readonly store: UserSessionStoreService
  ) {
    super(route, location);
  }

  /**
   * The ngOnInit function removes a condition, clears user details, and closes the window after a
   * specified timeout.
   */
  ngOnInit(): void {
    if (this.store.getExternalUserDetails()) {
      this.store.clearAll();
    }
    setTimeout(() => {
      window.close();
    }, environment.messageTimeout);
  }
}
