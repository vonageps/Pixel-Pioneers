import { Location } from "@angular/common";
import { Component, ElementRef, Inject, ViewChild } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import * as OTT from "@opentok/client";
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialog,
} from "@angular/material/dialog";
import { FormControl, FormGroup } from "@angular/forms";
import { RouteComponentBase } from "@care/core/route-component-base";
import { DialogComponent } from "@care/shared/components/dialog/dialog.component";
import { UserSessionStoreService } from "@care/core/store";
import { Event } from "@care/shared/models/event.model";
import { Numbers } from "@care/shared/enum/numbers.enum";
@Component({
  selector: "telescope-precall-screen",
  templateUrl: "./precall-screen.component.html",
  styleUrls: ["./precall-screen.component.scss"],
})
export class PrecallScreenComponent extends RouteComponentBase {
  @ViewChild("publisher") publisher: ElementRef;
  session: OT.Session;
  audioDevices: object[] = [];
  videoDevices: object[] = [];
  audioOutputDevices: object[] = [];
  event: Event;
  deviceIncompatible = false;
  controlForm: FormGroup;
  showJoinButton = true;
  isGuestUser: boolean;

  constructor(
    public dialogRef: MatDialogRef<DialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data,
    protected readonly route: ActivatedRoute,
    protected readonly location: Location,
    private readonly store: UserSessionStoreService,
    private readonly dialog: MatDialog
  ) {
    super(route, location);
  }

  /**
   * The `ngOnInit` function initializes the component, checks system requirements, and gets the user's
   * media devices.
   */
  ngOnInit(): void {
    this.event = this.store.getEventData() ?? new Event();
    if (!OT.checkSystemRequirements()) {
      this.deviceIncompatible = true;
      setTimeout(() => {
        window.close();
      }, Numbers.fiveThousand);
    } else {
      navigator.mediaDevices
        .getUserMedia({ audio: true, video: true })
        .then((stream) => {
          this.getDevices();
        })
        .catch((err) => err);
      navigator.mediaDevices.addEventListener("devicechange", (event) => {
        this.getDevices();
      });
    }
  }

  /**
   * The function retrieves the available audio output devices and assigns them to the
   * audioOutputDevices array, with a fallback to a default system speaker device if no devices are
   * found.
   */
  getOutPutDevices() {
    OTT.getAudioOutputDevices().then((device) => {
      this.audioOutputDevices = [];
      this.audioOutputDevices = device?.length
        ? device
        : [{ deviceId: "default", label: "System Default Speaker Device" }];
      this.event.audioOutputDeviceId = this.audioOutputDevices[0]["deviceId"];
      this.controlForm = new FormGroup({
        videoDeviceId: new FormControl(this.event.videoDeviceId),
        audioDevice: new FormControl(this.event.audioDeviceId),
      });
    });
  }

  /**
   * The function `getDevices()` retrieves the available audio and video devices and assigns the first
   * device of each type as the default device.
   */
  getDevices() {
    OTT.getDevices((err, devices) => {
      this.audioDevices = [];
      this.videoDevices = [];
      devices.forEach((ele) => {
        if (ele.kind === "audioInput") {
          this.audioDevices.push(ele);
          console.log(this.audioDevices);
        } else if (ele.kind === "videoInput") {
          this.videoDevices.push(ele);
        } else {
          //else block
        }
      });
      this.event.videoDeviceId = this.videoDevices[0]["deviceId"];
      this.event.audioDeviceId = this.audioDevices[0]["deviceId"];
      this.controlForm = new FormGroup({
        videoDeviceId: new FormControl(this.event.videoDeviceId),
        audioDevice: new FormControl(this.event.audioDeviceId),
      });
    });
  }

  /**
   * The micToggle function toggles the audio property of the event object.
   */
  micToggle() {
    this.event.audio = !this.event.audio;
  }

  /**
   * The videoToggle function toggles the value of the "video" property in the "event" object.
   */
  videoToggle() {
    this.event.video = !this.event.video;
  }

  /**
   * The function updates the audio and video device IDs, sets the pre-call verification status, sets
   * the audio output device, destroys the publisher, stores the event data, and closes the dialog.
   */
  proceed() {
    this.event.audioDeviceId = this.controlForm.value.audioDevice;
    this.event.audioOutputDeviceId = this.controlForm.value.audioOutputDeviceId;
    this.event.videoDeviceId = this.controlForm.value.videoDeviceId;
    this.store.setPreCallVerified(true);
    OT.setAudioOutputDevice(this.event.audioOutputDeviceId);
    this.publisher["publisher"].destroy();
    this.store.setEventData(this.event);
    this.dialogRef.close(true);
  }
  /**
   * The function disables the join button if any of the video device, audio device, show join button,
   * or patient consent is missing.
   * @returns a boolean value.
   */
  disableJoinButton() {
    return (
      !this.event?.videoDeviceId ||
      !this.event?.audioDeviceId ||
      !this.showJoinButton
    );
  }
}
