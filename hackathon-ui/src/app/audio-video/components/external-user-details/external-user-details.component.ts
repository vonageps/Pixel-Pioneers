import { Component } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { Event } from "@care/shared/models/event.model";
import { ToastrService } from "ngx-toastr";
import { Location } from "@angular/common";
import { RouteComponentBase } from "@care/core/route-component-base";
import { ExternalUser } from "@care/shared/models/external-user.model";

@Component({
  selector: "app-external-user-details",
  templateUrl: "./external-user-details.component.html",
  styleUrls: ["./external-user-details.component.scss"],
})
export class ExternalUserDetailsComponent extends RouteComponentBase {
  call = new Event();
  externalUser = new ExternalUser();
  callAllowed = true;
  skipConfirmation = false;
  isExistingPatient = false;
  //pattern = PATTERNS;
  constructor(
    protected readonly route: ActivatedRoute,
    protected readonly location: Location,

    private readonly toaster: ToastrService
  ) {
    super(route, location);
  }

  /**
   * The ngOnInit function in TypeScript checks for query parameters and sets values accordingly,
   * displaying an error message if necessary.
   */
  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      if (params["eventId"]) {
        this.call.id = params["eventId"];
      } else {
        this.toaster.error("You are not allowed to access further");
      }
      if (params["userName"]) {
        this.isExistingPatient = true;
        this.externalUser.firstName = params["userName"].split(" ")[0];
        this.externalUser.lastName = params["userName"].split(" ")[1];
      }

      if (params["skipConfirmation"] === "true") {
        this.skipConfirmation = true;
        this.setDetails();
      }
    });
  }

  /**
   * The `setDetails()` function sets various details related to an external user and navigates to a
   * meeting component.
   */
  setDetails() {}
}
