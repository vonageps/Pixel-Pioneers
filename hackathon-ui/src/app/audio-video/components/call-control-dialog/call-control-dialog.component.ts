import { Component, OnInit } from '@angular/core';
import { Event } from '@care/shared/models/event.model';
import * as OTT from '@opentok/client';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { UserSessionStoreService } from '@care/core/store';
@Component({
  selector: 'telescope-call-control-dialog',
  templateUrl: './call-control-dialog.component.html',
  styleUrls: ['./call-control-dialog.component.scss'],
})
export class CallControlDialogComponent implements OnInit {
  event: Event;
  audioDevices: object[] = [];
  videoDevices: object[] = [];
  audioOutputDevices: object[] = [];
  controlForm: FormGroup;
  constructor(
    private readonly store: UserSessionStoreService,
    private readonly fb: FormBuilder
  ) {}

  /**
   * The ngOnInit function initializes the component by getting the event data, retrieving the
   * available input and output devices, and listening for any changes in the device list.
   */
  ngOnInit(): void {
    this.event = this.store.getEventData() ?? new Event();
    this.getDevices();
    this.getOutPutDevices();
    navigator.mediaDevices.addEventListener('devicechange', (event) => {
      this.getDevices();
      this.getOutPutDevices();
    });
  }
  /**
   * The function retrieves the available audio output devices and assigns them to the
   * "audioOutputDevices" property, and then creates a form group with form controls for video device
   * ID, audio device ID, and audio output device ID.
   */
  getOutPutDevices() {
    OTT.getAudioOutputDevices().then((device) => {
      this.audioOutputDevices = [];
      this.audioOutputDevices = device?.length
        ? device
        : [{ deviceId: 'default', label: 'System Default Speaker Device' }];
      this.controlForm = new FormGroup({
        videoDeviceId: new FormControl(this.event.videoDeviceId),
        audioDevice: new FormControl(this.event.audioDeviceId),
        audioOutputDeviceId: new FormControl(this.event.audioOutputDeviceId),
      });
    });
  }

  /**
   * The function "getDevices" retrieves audio and video devices and stores them in separate arrays.
   */
  getDevices() {
    OTT.getDevices((err, devices) => {
      this.audioDevices = [];
      this.videoDevices = [];
      devices.forEach((ele) => {
        if (ele.kind === 'audioInput') {
          this.audioDevices.push(ele);
        } else if (ele.kind === 'videoInput') {
          this.videoDevices.push(ele);
        } else {
          //else block
        }
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
   * The function sets the audio and video device IDs based on the values from the control form.
   */
  setDevice() {
    this.event.audioDeviceId = this.controlForm.value.audioDevice;
    this.event.audioOutputDeviceId = this.controlForm.value.audioOutputDeviceId;
    this.event.videoDeviceId = this.controlForm.value.videoDeviceId;
  }
}
