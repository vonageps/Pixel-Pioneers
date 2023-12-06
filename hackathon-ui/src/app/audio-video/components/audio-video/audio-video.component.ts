import { DOCUMENT, Location } from "@angular/common";
import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostListener,
  Inject,
  OnDestroy,
  OnInit,
  Renderer2,
  ViewChild,
} from "@angular/core";
import { Event } from "@care/shared/models/event.model";
import { MatDialog } from "@angular/material/dialog";
import { ActivatedRoute, Router } from "@angular/router";
import { Howl, Howler } from "howler";
import * as moment from "moment-timezone";
import { ToastrService } from "ngx-toastr";
import { Subscription, timer } from "rxjs";
import { map, share } from "rxjs/operators";
import {
  CallControlDialogComponent,
  PrecallScreenComponent,
} from "../../components";
import { AudioVideoService } from "../../shared/audio-video.service";
import { DisplayType } from "../../shared/enum/display.enum";
import { RouteComponentBase } from "@care/core/route-component-base";
import { Numbers } from "@care/shared/enum/numbers.enum";
import { ExternalUser } from "@care/shared/models/external-user.model";
import { UserSessionStoreService } from "@care/core/store";
import { environment } from "@care/env/environment";
import { MESSAGES } from "@care/shared/constant/messages";

declare const Trulience: any; //nosonar

@Component({
  selector: "telescope-audio-video",
  templateUrl: "./audio-video.component.html",
  styleUrls: ["./audio-video.component.scss"],
})
export class AudioVideoComponent
  extends RouteComponentBase
  implements OnInit, OnDestroy
{
  @ViewChild("publisher") publisher: ElementRef;
  @ViewChild("parentScreenPreview") parentScreenPreview: ElementRef;
  session: OT.Session;
  streams: Array<OT.Stream> = [];
  changeDetectorRef: ChangeDetectorRef;
  cssClass = "flex-100";
  currentTime = moment(new Date()).format("h:mm A");
  subscription: Subscription;
  sessionData: Event;
  externalUser: ExternalUser;
  callLink: string;
  endCallTimer: NodeJS.Timeout;
  scrWidth: number;
  scrHeight: number;
  screenSharing = false;
  boxWidth = Numbers.numberhundred;
  screenPublisher: OT.Publisher;
  screenshareIcon = false;
  screenSubs: boolean;
  screenOption = DisplayType.displayNone;
  detailsbox = false;
  presenterName: string;
  connectionCount = 1;
  thankYouPageUrl = "/meeting/thank-you";
  userDetails = false;
  showtranscription = false;
  prescription = false;
  joiningRing = true;
  private socket: WebSocket;
  loader = false;
  transcript;
  constructor(
    protected readonly route: ActivatedRoute,
    protected readonly location: Location,
    private readonly ref: ChangeDetectorRef,
    private readonly audioVideoService: AudioVideoService,
    private readonly store: UserSessionStoreService,
    private readonly toasterService: ToastrService,
    private readonly router: Router,
    private readonly dialog: MatDialog,
    private readonly renderer: Renderer2,
    @Inject(DOCUMENT) private readonly document: Document,
  ) {
    super(route, location);
    this.changeDetectorRef = ref;
    this.externalUser = this.store.getExternalUserDetails();
    this.getScreenSize();
  }
  @HostListener("window:resize", ["$event"])
  /**
   * The function "getScreenSize" retrieves the width and height of the window and calls the "getWidth"
   * function.
   */
  getScreenSize() {
    this.scrWidth = window.innerWidth;
    this.scrHeight = window.innerHeight;
    this.getWidth();
  }

  /**
   * The `ngOnInit` function initializes the component by checking if certain conditions are met and
   * then either adding user call terms or opening a pre-call screen component.
   */
  ngOnInit() {
    //this.pubnubService.initPubnub();
    this.recordSpeech();
    this.connect('ws://3.231.48.80/question')
    this.pageOnloadHandler(false);
    const user = this.store.getExternalUserDetails() ?? new ExternalUser();
    if (!user?.firstName) {
      user.firstName = "Jane";
    }
    if (!user?.lastName) {
      user.lastName = "Doe";
    }
    this.store.setExternalUserDetails(user);
    history.pushState(null, "", location.href);
    window.onpopstate = () => {
      history.go(1);
    };
    if (!this.store.getPreCallVerified()) {
      const dialogRef = this.dialog.open(PrecallScreenComponent, {
        closeOnNavigation: false,
        disableClose: true,
        panelClass: "precalling-pop",
        width: "100vw",
        height: "100vh",
        maxWidth: "100vw",
      });
      dialogRef.afterClosed().subscribe((result) => {
        if (result?.redirectToThankYouPage) {
          this.moveToThankYouPage();
        } else {
          this.joinAppointment(result);
        }
      });
    } else {
      this.initSession();
    }
  }
  moveToThankYouPage() {
    this.store.removeCallData();
    this.router.navigate([this.thankYouPageUrl]);
  }
  joinAppointment(result) {
    this.sessionData = this.store.getEventData();
    if (result) {
      this.audioVideoService.setPrecallVerified(true);
      // if (this.getQueryParam("code")) {
      //   this.joinProviderCall();
      //   return;
      // }
      //this.joinExternalCall();
      if (this.store.getExternalUserDetails()?.phone) {
        this.joinExternalCall();
      } else {
        this.initSession();
      }
    }
  }

  joinProviderCall() {
    this.loader = true;
    this.audioVideoService
      .JoinMeetingProvider(this.getQueryParam("code"))
      .subscribe({
        next: (res) => {
          this.sessionData = {
            ...this.sessionData,
            ...res,
          };
          this.loader = false;
          this.store.setEventData(this.sessionData);
          this.initSession();
        },
        error: () => {
          this.loader = false;
          this.moveToThankYouPage();
        },
      });
  }

  /**
   * The function `joinExternalCall()` retrieves event data from the store, joins a meeting externally
   * using the retrieved session ID, updates the session data with the response, sets the updated
   * session data in the store, initializes the session, and retrieves the chat channel.
   */
  joinExternalCall() {
    this.loader = true;
    this.audioVideoService
      .joinMeeting(this.store.getEventData()?.meetingLinkId)
      .subscribe({
        next: (res) => {
          this.sessionData = {
            ...this.sessionData,
            ...res,
          };
          this.loader = false;
          this.store.setEventData(this.sessionData);
          this.initSession();
        },
        error: () => {
          this.loader = false;
          this.moveToThankYouPage();
        },
      });
  }

  archiveCall(sessionId: string) {
    this.audioVideoService.archive(sessionId).subscribe((res) => {
      this.sessionData.archiveId = res["archiveId"];
      this.store.setEventData(this.sessionData);
    });
  }
  /**
   * The `initSession` function initializes a session by retrieving event data from a store, connecting
   * to the session, and starting a clock.
   */
  initSession() {
    this.sessionData = this.store.getEventData();
    this.connectToSession();
    this.startClock();
  }

  /**
   * The function `connectToSession()` initializes a session, connects to it, and handles any errors
   * that occur.
   */
  connectToSession() {
    console.log(
      "//",
      this.sessionData.apiKey,
      this.sessionData.sessionId,
      this.sessionData.token
    );
    this.audioVideoService
      .initSession(
        this.sessionData.apiKey ?? "47606701",
        this.sessionData.sessionId ??
          "2_MX40NzYwNjcwMX5-MTcwMTE3MDkwMzMwOX5kM09SRTd5Q3pDaUlRakVjQ1N5enJ6S2t-fn4",
        this.sessionData.token ??
          "T1==cGFydG5lcl9pZD00NzYwNjcwMSZzaWc9YTkxNjc1NWRjNzljZWJjOGFjMmM0MTdhZDU3OTI5YjVlYjRmM2YxOTpzZXNzaW9uX2lkPTJfTVg0ME56WXdOamN3TVg1LU1UY3dNVEUzTURrd016TXdPWDVrTTA5U1JUZDVRM3BEYVVsUmFrVmpRMU41ZW5KNlMydC1mbjQmY3JlYXRlX3RpbWU9MTcwMTE3MDkyNSZub25jZT0wLjUzNTk5MzcwMjI5MzU2MTcmcm9sZT1wdWJsaXNoZXImZXhwaXJlX3RpbWU9MTcwMzc2MjkyNCZpbml0aWFsX2xheW91dF9jbGFzc19saXN0PQ=="
      )
      .then((session: OT.Session) => {
        this.session = session;
        this.handleSessionEvents();
      })
      .then(() => {
        this.audioVideoService.connect();

        setTimeout(() => {
          this.archiveCall(this.sessionData.sessionId);
        }, Numbers.fiveThousand);
      })
      .catch((err) => {
        this.showToastrMsg(MESSAGES.OtConnectionFailed, err.message, "error");
        sessionStorage.setItem("publishingErr", err.message);
        //this.router.navigate(['/meeting/retry']);
      });
  }
  playAudio(chimeTune: string) {
    const chime: Howler = new Howl({
      src: [`../../assets/audio/${chimeTune}.mp3`],
    });
    chime.play();
  }

  /**
   * The function "handleSessionEvents" handles various events related to a session, such as stream
   * creation, stream destruction, stream property changes, session reconnecting, session reconnected,
   * and session disconnected.
   */
  handleSessionEvents() {
    this.session.on({
      streamCreated: (event) => {
        this.playAudio("join_chime");
        if (event.stream.videoType === "screen") {
          this.screenSubs = true;
          this.changeView();
          this.getscreenOptions();
          const parentElementId = "screen-sharing-main";
          this.session.subscribe(event.stream, parentElementId, {
            insertMode: "append",
            audioVolume: 60,
            width: "100%",
            height: "100%",
          });
          this.presenterName = event.stream.name;
        } else {
          this.connectionCount += 1;
          event.stream.hasVideo
            ? this.streams.splice(0, 0, event.stream)
            : this.streams.push(event.stream);
        }
        this.getScreenSize();
        this.changeDetectorRef.detectChanges();
        if (this.streams.length > 1 && this.endCallTimer) {
          clearTimeout(this.endCallTimer);
        }
      },
      streamDestroyed: (event) => {
        this.playAudio("leave_chime");
        const idx = this.streams.indexOf(event.stream);
        if (idx > -1) {
          this.streams.splice(idx, 1);
          this.changeDetectorRef.detectChanges();
        }
        if (event.stream.videoType === "screen") {
          this.screenSubs = false;
          this.screenSharing = false;
          this.changeView();
          this.getscreenOptions();
          this.getWidth();
        } else {
          this.connectionCount -= 1;
          this.getScreenSize();
          this.getWidth();
        }
      },
      streamPropertyChanged: (event) => {
        const idx = this.streams.indexOf(event.stream);
        if (event.changedProperty === "hasVideo" && idx > -1) {
          this.streams.splice(idx, 1);
          if (event.newValue) {
            this.streams.splice(0, 0, event.stream);
          } else {
            this.streams.push(event.stream);
          }
        }
        this.getScreenSize();
        this.changeDetectorRef.detectChanges();
      },
      sessionReconnecting: () => {
        this.showToastrMsg("", MESSAGES.OtSessionReconnecting, "warning");
      },
      sessionReconnected: () => {
        this.showToastrMsg("", MESSAGES.OTSessionReconnected, "success");
      },
      sessionDisconnected: () => {
        // this.router.navigate(['/meeting/retry']);
        this.showToastrMsg(
          MESSAGES.OTSessionDisconnected,
          MESSAGES.OtInternetIssue,
          "error"
        );
      },
    });
  }

  /**
   * The function opens a dialog box for changing call control settings and updates the session data
   * and audio output device based on the user's selection.
   */
  changeSettings() {
    const dialogRef = this.dialog.open(CallControlDialogComponent, {
      width: "510px",
      panelClass: "common-pop",
    });
    dialogRef.afterClosed().subscribe((event) => {
      if (event) {
        this.sessionData.videoDeviceId = event.videoDeviceId;
        this.sessionData.audioDeviceId = event.audioDeviceId;
        this.sessionData.audio = event.audio;
        this.sessionData.video = event.video;
        this.sessionData.audioOutputDeviceId = event.audioOutputDeviceId;
        this.store.setEventData(this.sessionData);
        OT.setAudioOutputDevice(this.sessionData.audioOutputDeviceId);
      }
    });
  }

  /**
   * The function checks if there are five minutes remaining between the current time and the end time
   * of a given data object.
   * @param data - An object containing the following properties:
   * @returns a boolean value.
   */
  ifFiveMinutesRemaining(data) {
    return (
      data.id &&
      moment().diff(data.startDateTime, "minute") > -Numbers.numberFive &&
      moment().diff(data.endDateTime, "minute") < 0
    );
  }

  /**
   * The function updates the current level in the session data based on a JOIN action message.
   * @param message - The `message` parameter is an object that contains information about the action
   * being performed. It has a property called `action` which represents the action being performed
   * (e.g., 'JOIN'). It also has a property called `currentLevel` which is an object containing
   * information about the current level.
   */
  updateCurrentLevel(message) {
    if (message.action === "JOIN") {
      this.sessionData.currentLevel["nextLevelEntry"] =
        message?.currentLevel?.nextLevelEntry;
      this.store.setEventData(this.sessionData);
    }
  }

  /**
   * The micToggle function toggles the audio property of the sessionData object and updates the
   * eventData in the store.
   */
  micToggle() {
    this.sessionData.audio = !this.sessionData.audio;
    this.store.setEventData(this.sessionData);
    if(this.sessionData.audio){
      this.recordSpeech();
    }
  }
  /**
   * The videoToggle function toggles the value of the video property in the sessionData object and
   * updates the eventData in the store.
   */
  videoToggle() {
    this.sessionData.video = !this.sessionData.video;
    this.store.setEventData(this.sessionData);
  }
  /**
   * The `unpublish` function removes call data from the store and destroys the publisher.
   */
  unpublish() {
    this.store.removeCallData();
    this.publisher["publisher"].destroy();
  }

  disconnect() {
    if (!this.store.getExternalUserDetails()?.phone) {
      this.disconnectCall();
    } else {
      this.audioVideoService
        .endCall(
          this.sessionData?.meetingLinkId,
          this.sessionData?.archiveId,
          this.sessionData?.sessionId
        )
        .subscribe({
          next: () => {
            this.disconnectCall();
          },
          error: () => {
            this.disconnectCall();
          },
        });
    }
  }

  disconnectCall() {
    this.publisher["publisher"].destroy();
    this.session.off();
    this.moveToThankYouPage();
  }

  /**
   * The function determines the CSS class to apply based on the number of streams and whether screen
   * sharing or screen subscriptions are active.
   */
  getWidth() {
    if (this.screenSharing || this.screenSubs) {
      this.cssClass = "flex-100";
    } else {
      switch (this.streams.length) {
        case Numbers.numberZero:
          this.cssClass = "full-100";
          break;
        case Numbers.numberOne:
          this.cssClass = "floated-publisher";
          break;
        case Numbers.numberThree:
          this.cssClass = "flex-50";
          break;
        case Numbers.numberTwo:
        case Numbers.numberFour:
        case Numbers.numberFive:
        case Numbers.numberEight:
          this.cssClass = "flex-33";
          break;
        case Numbers.numberSix:
        case Numbers.numberSeven:
        case Numbers.numberNine:
          this.cssClass = "flex-25";
          break;
        default:
          this.cssClass = "flex-20";
      }
    }
  }

  /**
   * The startClock function sets up a timer that updates the currentTime property with the current
   * time every second.
   */
  startClock() {
    this._subscriptions.push(
      timer(0, Numbers.thousand)
        .pipe(
          map(() => new Date()),
          share()
        )
        .subscribe(() => {
          this.currentTime = moment(new Date()).format("h:mm A");
        })
    );
  }

  /**
   * The function checks if the session data belongs to an external user and returns true if it does
   * not.
   * @returns a boolean value. If the `externalUser` property is truthy, it will return `false`.
   * Otherwise, it will return `true`.
   */
  checkIsExternalUserAllowed() {
    if (this.externalUser) {
      return false;
    }
    return true;
  }

  /**
   * The function `showToastrMsg` displays a toastr message with a specified title, message, and
   * message type (error, warning, or success).
   * @param {string} title - A string representing the title of the toastr message.
   * @param {string} msg - The `msg` parameter is a string that represents the message to be displayed
   * in the toastr notification. It can be any text or information that you want to show to the user.
   * @param {string} msgType - The `msgType` parameter is a string that represents the type of message
   * to be displayed. It can have one of the following values: 'error', 'warning', or 'success'.
   */
  showToastrMsg(title: string, msg: string, msgType: string) {
    switch (msgType) {
      case "error":
        this.toasterService.error(msg, title, {
          timeOut: environment.messageTimeout,
        });
        break;
      case "warning":
        this.toasterService.warning(msg, title, {
          timeOut: environment.messageTimeout,
        });
        break;
      case "success":
        this.toasterService.success(msg, title, {
          timeOut: environment.messageTimeout,
        });
        break;
    }
  }

  /**
   * The function `screenshare()` checks if screen sharing is supported by the browser and if so,
   * initiates screen sharing; otherwise, it displays a message indicating that screen sharing is not
   * supported. If screen sharing is already in progress, it stops the screen sharing.
   */
  screenshare() {
    this.showtranscription = false;
    this.userDetails = false;
    if (!this.screenSharing) {
      OT.checkScreenSharingCapability((response) => {
        if (
          !response.supported ||
          response.extensionRegistered === false ||
          response.extensionInstalled === false
        ) {
          this.toasterService.info(
            "Your browser does not support screen sharing",
            "Not Supported",
            {
              timeOut: environment.messageTimeout,
            }
          );
        } else {
          this.screenPublish();
        }
      });
    } else {
      this.stopScreenShare();
    }
  }

  /**
   * The function determines the appropriate display option for a screen based on the values of
   * screenSharing, screenSubs, and detailsbox.
   */
  getscreenOptions() {
    if (!this.screenSharing && !this.screenSubs) {
      this.screenOption = DisplayType.displayNone;
    }
    if (this.screenSharing || this.screenSubs) {
      if (this.detailsbox) {
        this.screenOption = DisplayType.displayFlexAbsolute;
      } else {
        this.screenOption = DisplayType.displayFlex;
      }
    }
  }
  /**
   * The `screenPublish()` function initializes a screen publisher and starts sharing the screen with
   * specified options.
   * @returns The function does not have a return statement, so it does not explicitly return anything.
   */
  screenPublish() {
    const firstName = this.store.getExternalUserDetails().firstName;
    const lastName = this.store.getExternalUserDetails().lastName;
    const publishOptions = {
      maxResolution: { width: 1920, height: 1080 },
      videoSource: "screen",
      fitmode: "contain",
      publishAudio: false,
      showControls: false,
      width: "100%",
      height: "100%",
      name: `${firstName} ${lastName}`,
    };
    const screenPublisherElement = document.createElement("div");
    if (this.screenSubs) {
      this.toasterService.warning(
        "Another user is currently sharing their screen."
      );
      return;
    } else {
      this.screenPublisher = OT.initPublisher(
        screenPublisherElement,
        publishOptions,
        (error) => {
          if (error) {
            // error handling
          } else {
            this.screenSharing = true;
            this.changeView();
            this.getscreenOptions();
            this.renderer.appendChild(
              this.parentScreenPreview.nativeElement,
              screenPublisherElement
            );
            this.presenterName = this.publisher["userName"];
            const presentingScreen =
              this.document.getElementById("presentingScreen");
            presentingScreen.classList.add("show");
            this.session.publish(this.screenPublisher, () => {
              this.screenshareIcon = true;
            });
          }
        }
      );
    }
    this.screenPublisher.on("mediaStopped", () => {
      this.stopScreenShare();
    });
  }
  /**
   * The function "stopScreenShare" stops the screen sharing feature, destroys the screen publisher,
   * updates the UI, and retrieves the screen options.
   */
  stopScreenShare() {
    this.screenPublisher.destroy();
    this.screenshareIcon = false;
    const presentingScreen = this.document.getElementById("presentingScreen");
    presentingScreen.classList.remove("show");
    this.screenSharing = false;
    this.changeView();
    this.getscreenOptions();
  }

  /**
   * The function changes the width of a box based on the values of two variables and then calls
   * another function.
   */
  changeView() {
    if (this.screenSharing || this.screenSubs) {
      this.boxWidth = Numbers.twentyfive;
    } else {
      this.boxWidth = Numbers.numberhundred;
    }
    this.getWidth();
  }

  getUserDetails() {
    this.userDetails = !this.userDetails;
    this.showtranscription = false;
  }

  getTranscription() {
    this.showtranscription = !this.showtranscription;
    this.userDetails = false;
  }

  /**
   * The ngOnDestroy function is used to clean up resources and unsubscribe from chat channels and
   * PubNub listeners.
   */
  ngOnDestroy() {
    this.publisher["publisher"].destroy();
    this.screenPublisher?.destroy();
    super.ngOnDestroy();
  }

  trulience = null;
  avatarId = '1597532707462073645'; //Default Avatar Id 10 = ECHO_TEST

  pageOnloadHandler = (retry) => {
    // call back after authentication and ready to connect
    const authenticated = () => {
      // autoconnect
      this.trulience.connectGateway();
    };

    const connected = () => {
      this.document.getElementById("connect")["disabled"] = true;
      this.document.getElementById("disconnect")["disabled"] = false;
      this.document.getElementById("send")["disabled"] = false;
    };

    const disconnected = () => {
      this.document.getElementById("connect")["disabled"] = false;
      this.document.getElementById("disconnect")["disabled"] = true;
      this.document.getElementById("send")["disabled"] = true;
    };

    const handleMessage = () => {
      // const messageType = resp.messageType;
      // if (messageType === window.Trulience.MessageType.ChatText) {
      //   // Ignore the acknowledgement messages.
      //     if (resp.status === "MESSAGE_DELIVERED_TO_VPS" || resp.status === "MESSAGE_NOT_DELIVERED_TO_VPS") {
      //     return;
      //           }
      //     if (resp.sttResponse === true) {
      //   // Received stt message.
      //     console.log("Received STT Message - " + resp.messageArray[0].message);
      //           }
      // }
    };

    // Trulience authentication callbacks
    const authEvents = {
      onReady: authenticated,
      onFail: null,
    };

    // Trulience websocket callbacks
    const wsEvents = {
      onOpen: null,
      onConnectFail: null,
      onMessage: handleMessage,
      onWarn: null,
      onError: null,
      onClose: null,
    };

    // Trulience media event callbacks
    const mediaEvents = {
      onConnected: connected,
      onWaiting: null,
      onBusy: null,
      onConnecting: null,
      onDisconnect: disconnected,
      micStatus: null,
    };

    // id of video element to display avatar
    const videoElements = {
      remoteVideo: "myvideo",
    };

    //if avatar has oauth enabled then it will be checked on sdk load
    this.trulience = Trulience.Builder()
      .setAvatarId(this.avatarId) // Setting as String as Long values are truncated in JavaScript
      .setLanguagePreference("en-US")
      .setUserName("Guest")
      .enableAvatar(true) // false for chat only, true for chat and video avatar
      .setAuthCallbacks(authEvents)
      .setWebSocketCallbacks(wsEvents)
      .setMediaCallbacks(mediaEvents)
      .setRetry(retry)
      .registerVideoElements(videoElements)
      .build();
    this.trulience.authenticate();
  };

  //window.onload = () => this.pageOnloadHandler(false);

  // window.onunload = function () {
  //     trulience.disconnectGateway();
  // }

  startCall() {
    this.trulience.connectGateway();
  }

  endCall(reason) {
    this.trulience.disconnectGateway(reason);
  }

  sendMessageToAvatar = (message) => {
    this.trulience.sendMessageToVPS(message);
  };

  connect(url: string): void {
    this.socket = new WebSocket(url);

    this.socket.addEventListener('open', (event) => {
      console.log('WebSocket connection opened:', event);
      //this.sendMessage()
    });

    this.socket.addEventListener('message', (event) => {
      this.sendMessageToAvatar(event.data);
      console.log('WebSocket message received:', event);
    });

    this.socket.addEventListener("close", (event) => {
      console.log("WebSocket connection closed:", event);
    });
  }

  close(): void {
    this.socket.close();
  }

  recordSpeech(){
    // Check if the browser supports the Web Speech API
if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
  // Create a new SpeechRecognition instance
  const recognition = new (window['SpeechRecognition'] || window['webkitSpeechRecognition'])();

  // Set configuration options
  recognition.continuous = true;
  recognition.interimResults = true;

  let isPaused = false;
  let lastSentMsg;

  // Event handler for when speech is recognized
  recognition.onresult = (event) => {
    setInterval(() => {
      if(this.transcript === event.results[0][0].transcript){
        //this.pubnubService.publishToChannel(this.transcript)
        if(lastSentMsg !== this.transcript){
          this.socket.send(this.transcript);
          lastSentMsg = this.transcript;
        }
      }
    }, 3000)
    this.transcript = event.results[0][0].transcript;
    console.log('Speech Recognition Result:', this.transcript);
  };

  // Event handler for errors
  recognition.onerror = (event) => {
    console.error('Speech Recognition Error:', event.error);
  };

  // Start speech recognition
  recognition.start();
} else {
  console.error('Speech recognition is not supported in this browser.');
}

  }
}
