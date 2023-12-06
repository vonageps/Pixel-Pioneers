import { Location } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { RouteComponentBase } from '@care/core/route-component-base';

@Component({
  selector: 'telescope-retry',
  templateUrl: './retry.component.html',
  styleUrls: ['./retry.component.scss'],
})
export class RetryComponent extends RouteComponentBase {
  errMsg = sessionStorage.getItem('publishingErr');
  constructor(
    protected readonly route: ActivatedRoute,
    protected readonly location: Location
  ) {
    super(route, location);
  }

  /**
   * The `retry` function redirects the user to the '/meeting/room' page.
   */
  retry() {
    window.location.href = '/meeting/room';
  }
}
