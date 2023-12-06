import { Location } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { Subject } from "rxjs";
import { RouteComponentBase } from "@care/core/route-component-base";
import { UserSessionStoreService } from "@care/core/store";

@Component({
  selector: "telescope-meeting",
  templateUrl: "./meeting.component.html",
  styleUrls: ["./meeting.component.scss"],
})
export class MeetingComponent extends RouteComponentBase implements OnInit {
  userId: string;
  refreshTokenSubject$: Subject<void> = new Subject();
  internetDownTimer: NodeJS.Timeout;

  constructor(
    protected readonly location: Location,
    protected readonly route: ActivatedRoute,
    private readonly store: UserSessionStoreService
  ) {
    super(route, location);
  }

  /**
   * The ngOnInit function initializes the userId variable based on the user's id from the store, and
   * then initializes and subscribes to PubNub channels if the pre-call verification is successful.
   */
  ngOnInit(): void {
    this.userId = this.store.getExternalUserDetails()?.id;
    if (this.store.getPreCallVerified()) {
      if (!this.userId) {
        this.userId = this.store.getExternalUserDetails().id;
      }
    }
  }
}
