import {
  Component,
  ElementRef,
  AfterViewInit,
  ViewChild,
  Input,
} from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { Router } from "@angular/router";
import { ToastrService } from "ngx-toastr";
//import { AudioVideoService } from '../../shared/audio-video.service';
import { environment } from "@care/env/environment";
import { DialogComponent } from "@care/shared/components/dialog/dialog.component";
import { UserSessionStoreService } from "@care/core/store";
import { AudioVideoService } from "../../shared/audio-video.service";
import { ExternalUser } from "@care/shared/models/external-user.model";
@Component({
  selector: "app-publisher",
  templateUrl: "./publisher.component.html",
  styleUrls: ["./publisher.component.scss"],
})
export class PublisherComponent implements AfterViewInit {
  @ViewChild("publisherDiv") publisherDiv: ElementRef;
  @Input() session: OT.Session;
  @Input() humanBot: boolean;
  @Input()
  public set mic(value: boolean) {
    this.micIcon = value;
    if (this.publisher) {
      this.publisher.publishAudio(value);
    }
  }
  @Input()
  public set micDevice(value: string) {
    if (this.publisher) {
      this.publisher.setAudioSource(value);
    }
  }
  @Input()
  public set videoDevice(value: string) {
    if (this.publisher) {
      this.publisher.setVideoSource(value);
    }
  }
  @Input()
  public set video(value: boolean) {
    this.videoIcon = value;
    if (this.publisher) {
      this.publisher.publishVideo(value);
    }
  }
  publisher: OT.Publisher;
  publishing: boolean;
  micIcon: boolean;
  videoIcon: boolean;
  user: ExternalUser;
  userName: string;
  userImage = null;
  userSpeaking = false;
  publishingFailed = "Publishing Failed";
  retryComponentRoute = "/meeting/retry";
  constructor(
    private readonly audioVideoService: AudioVideoService,
    private readonly store: UserSessionStoreService,
    private readonly toasterService: ToastrService,
    private readonly dialog: MatDialog,
    private readonly router: Router
  ) {
    this.publishing = false;
  }

  ngOnInit() {
    this.user = this.store.getExternalUserDetails();
    console.log("///", this.user);
    this.userName = this.user?.firstName
      ? `${this.user.firstName} ${this.user.lastName}`
      : "Jane Doe";
  }

  ngAfterViewInit() {
    this.initPublisher();
  }

  initPublisher() {
    const canvas = document.createElement("canvas");
    canvas.width = 640;
    canvas.height = 480;
    const ctx = canvas.getContext("2d");
    const video = document.getElementById("myvideo");
    // Draw a random colour in the Canvas every 3 seconds
    if (video) {
      setInterval(() => {
        ctx.drawImage(video as any, 0, 0, canvas.width, canvas.height);
      }, 3000);
    }
    const patientId = this.store.getExternalUserDetails()?.id;
    const userName = this.userName.split(" ");
    const OT = this.audioVideoService.getOT();
    this.publisher = OT.initPublisher(
      this.publisherDiv.nativeElement,
      {
        audioSource: this.humanBot
          ? (video as any).captureStream()?.getAudioTracks()?.[0]
          : this.store.getEventData()?.audioDeviceId,
        videoSource: this.humanBot
          ? canvas.captureStream(60)?.getVideoTracks()?.[0]
          : this.store.getEventData()?.videoDeviceId,
        publishVideo: this.videoIcon,
        publishAudio: this.micIcon,
        width: "100%",
        height: "100%",
        insertMode: "append",
        name: `${this.userName}|${patientId}`,
        style: {
          nameDisplayMode: "off",
          buttonDisplayMode: "off",
          audioLevelDisplayMode: "off",
          backgroundImageURI: `https://ui-avatars.com/api/?name=${userName[0]}+${userName[1]}=true&size=128`,
        },
      },
      (err) => {
        if (err) {
          this.errorHandling(err);
        }
      }
    );
    if (this.session) {
      if (this.session["isConnected"]()) {
        this.publish();
      }
      this.session.on("sessionConnected", () => this.publish());
      this.speakerDetection(
        this.publisher,
        () => {
          this.userSpeaking = true;
        },
        () => {
          this.userSpeaking = false;
        }
      );
    }
  }
  /**
   * The `publish` function publishes a session and handles any errors that occur during the publishing
   * process.
   */
  publish() {
    this.session.publish(this.publisher, (err) => {
      if (err) {
        this.showToastrMsg(this.publishingFailed, err.message, "error");
        sessionStorage.setItem("publishingErr", err.message);
        this.router.navigate([this.retryComponentRoute]);
      } else {
        this.publishing = true;
      }
    });
  }
  /**
   * The errorHandling function displays an error message using Toastr, stores the error message in
   * sessionStorage, and navigates to a retry component.
   * @param error - The error parameter is an object that represents an error that occurred during the
   * execution of a function or operation. It typically contains information about the error, such as
   * an error message or error code.
   */
  errorHandling(error) {
    this.showToastrMsg(this.publishingFailed, error.message, "error");
    sessionStorage.setItem("publishingErr", error.message);
    this.router.navigate([this.retryComponentRoute]);
  }
  /**
   * The function `openErrorDialog` opens a dialog box with a header message and content, and provides
   * options for the user to click on an "Ok" button or close the dialog.
   * @param {string} HeaderMessage - The HeaderMessage parameter is a string that represents the
   * message to be displayed as the header of the error dialog. It typically provides a brief summary
   * or title for the error being shown to the user.
   * @param {string} content - The content parameter is a string that represents the message or content
   * to be displayed in the error dialog. It could be an error message or any other relevant
   * information related to the error.
   */
  openErrorDialog(HeaderMessage: string, content: string) {
    const retrydialogRef = this.dialog.open(DialogComponent, {
      closeOnNavigation: false,
      disableClose: true,
      width: "400px",
      data: {
        HeaderMessage,
        content,
        leftButton: "Ok",
        rightButton: "none",
      },
    });
    retrydialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.initPublisher();
      } else {
        retrydialogRef.close();
      }
    });
  }
  /**
   * The `speakerDetection` function detects when a speaker starts and stops talking based on the audio
   * level and triggers the `startTalking` and `stopTalking` functions accordingly.
   * @param publisher - The `publisher` parameter is an object that emits events related to audio
   * levels. It is used to detect changes in audio levels and determine if someone is speaking or not.
   * @param startTalking - The `startTalking` parameter is a function that will be called when the
   * speaker is detected as talking.
   * @param stopTalking - The `stopTalking` parameter is a function that will be called when the
   * speaker stops talking.
   */
  speakerDetection(publisher, startTalking, stopTalking) {
    const num1 = 0.2;
    const num2 = 100;
    const num3 = 1000;
    let activity = null;
    publisher.on("audioLevelUpdated", (event) => {
      const now = Date.now();
      if (event.audioLevel > num1) {
        if (!activity) {
          activity = { timestamp: now, talking: false };
        } else if (activity.talking) {
          activity.timestamp = now;
        } else if (
          now - activity.timestamp > num2 &&
          typeof startTalking === "function"
        ) {
          activity.talking = true;
          startTalking();
        } else {
          // Empty else block
        }
      } else if (activity && now - activity.timestamp > num3) {
        if (activity.talking && typeof stopTalking === "function") {
          stopTalking();
        }
        activity = null;
      } else {
        // Empty else block
      }
    });
  }
  /**
   * The function `showToastrMsg` displays a toastr message with a specified title, message, and type
   * (error or warning).
   * @param {string} title - A string representing the title of the toastr message.
   * @param {string} msg - The `msg` parameter is a string that represents the message to be displayed
   * in the toastr notification.
   * @param {string} msgType - The `msgType` parameter is a string that represents the type of message
   * to be displayed. It can have two possible values: "error" or "warning".
   */
  showToastrMsg(title: string, msg: string, msgType: string) {
    if (msgType === "error") {
      this.toasterService.error(msg, title, {
        timeOut: environment.messageTimeout,
      });
    }
    if (msgType === "warning") {
      this.toasterService.warning(msg, title, {
        timeOut: environment.messageTimeout,
      });
    }
  }
}
