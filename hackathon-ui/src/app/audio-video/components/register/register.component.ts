import { Component, Inject } from "@angular/core";
import { MAT_DIALOG_DATA } from "@angular/material/dialog";
import { ActivatedRoute, Router } from "@angular/router";
import { RouteComponentBase } from "@care/core/route-component-base";
import { Location } from "@angular/common";
import { UserSessionStoreService } from "@care/core/store";
import { ExternalUser } from "@care/shared/models/external-user.model";
import { AudioVideoService } from "../../shared/audio-video.service";
@Component({
  selector: "app-register",
  templateUrl: "./register.component.html",
  styleUrls: ["./register.component.scss"],
})
export class RegisterComponent extends RouteComponentBase {
  constructor(
    protected readonly route: ActivatedRoute,
    protected readonly location: Location,
    protected readonly store: UserSessionStoreService,
    protected readonly router: Router,
    protected readonly audioFacade: AudioVideoService
  ) {
    super(route, location);
  }
  user: ExternalUser;

  ngOnInit() {
    this.getUser();
  }
  getUser() {
    this.user = this.store.getExternalUserDetails();
  }

  proceed() {
    this.audioFacade.registerUser(this.user).subscribe(() => {
      this.router.navigate(["/meeting/room"]);
    });
  }
}
