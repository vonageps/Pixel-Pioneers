import { Component } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { DocumentUploadComponent } from "../../../audio-video/components/document-upload/document-upload.component";
import { AudioVideoService } from "../../../audio-video/shared/audio-video.service";
import { RouteComponentBase } from "@care/core/route-component-base";
import { ActivatedRoute, Router } from "@angular/router";
import { Location } from "@angular/common";
import * as CryptoJS from "crypto-js";
import { environment } from "@care/env/environment";
import { UserSessionStoreService } from "@care/core/store";
import { Event } from "@care/shared/models/event.model";
import { CommonfacadeService } from "@care/shared/facade/commonfacade.service";
import { ExternalUser } from "@care/shared/models/external-user.model";
import * as uuid from "uuid";
@Component({
  selector: "app-verification",
  templateUrl: "./verification.component.html",
  styleUrls: ["./verification.component.scss"],
})
export class VerificationComponent extends RouteComponentBase {
  constructor(
    public dialog: MatDialog,
    private readonly audioVideoService: AudioVideoService,
    protected readonly route: ActivatedRoute,
    protected readonly location: Location,
    protected readonly store: UserSessionStoreService,
    protected readonly router: Router
  ) {
    super(route, location);
  }
  otpFetched = false;
  phoneNo: string;
  requestId: string;
  otp;
  otpVerfied = false;
  ngOnInit() {
    if (this.getQueryParam("code")) {
      this.phoneNo = this.decryptToken(this.getQueryParam("code"))?.code;
    }
  }
  uploadDocument() {
    const dialogRef = this.dialog.open(DocumentUploadComponent, {
      disableClose: true,
      width: "510px",
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        console.log("////", result);
        // will replace with upload api res
        const res = new ExternalUser();
        res.name = result["Name"];
        [res.firstName, res.lastName] = result["Name"]?.split(" ");
        res.email = result["Email"];
        res.phone = result["Phone"] ?? this.phoneNo;
        res.gender = result["Gender"] == "M" ? "Male" : "Female";
        res.dob = new Date();
        res.username = this.phoneNo;
        this.store.setExternalUserDetails(res);
        this.router.navigate(["/meeting/register"]);
      }
    });
  }
  getOtp() {
    this.audioVideoService.sendOtp(this.phoneNo).subscribe({
      next: (res) => {
        this.otpFetched = true;
        this.requestId = res.request_id;
      },
      error: () => {},
    });
  }
  verifyOtp() {
    this.audioVideoService
      .verifyOtp(this.otp, this.requestId, this.getQueryParam("code"))
      .subscribe({
        next: (res) => {
          this.otpVerfied = true;
          const event = new Event();
          event.meetingLinkId = res.meetingLinkId;
          this.store.setEventData(event);
          this.store.saveAccessToken(res.accessToken);
        },
        error: () => {},
      });
  }

  decryptToken(key: string) {
    if (!environment.secretKey && key) {
      // Intentional
      return JSON.parse(key) as unknown;
    }
    const decryptData = key && CryptoJS.AES.decrypt(key, environment.secretKey);
    console.log(
      "//",
      decryptData && JSON.parse(decryptData.toString(CryptoJS.enc.Utf8))
    );
    return decryptData && JSON.parse(decryptData.toString(CryptoJS.enc.Utf8));
  }
}
