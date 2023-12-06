import {
  Component,
  ElementRef,
  AfterViewInit,
  ViewChild,
  Input,
} from '@angular/core';
import { ComponentBase } from '@care/core/component-base';
import { environment } from '@care/env/environment';
import * as OT from '@opentok/client';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-subscriber',
  templateUrl: './subscriber.component.html',
  styleUrls: ['./subscriber.component.scss'],
})
export class SubscriberComponent
  extends ComponentBase
  implements AfterViewInit
{
  @ViewChild('subscriberDiv') subscriberDiv: ElementRef;
  @Input() session: OT.Session;
  @Input() stream: OT.Stream;

  subscriber: OT.Subscriber;
  mic = true;
  userSpeaking = false;
  userName: string;
  constructor(private readonly toasterService: ToastrService) {
    super();
  }

  /**
   * The ngAfterViewInit function initializes a subscription and listens for changes in the audio
   * property of a stream, toggling the mic variable accordingly.
   */
  ngAfterViewInit() {
    this.initSubscription();
    this.session.on('streamPropertyChanged', (event) => {
      if (
        event.changedProperty === 'hasAudio' &&
        event.stream['id'] === this.stream.streamId
      ) {
        this.mic = !this.mic;
      }
    });
  }

  /**
   * The `initSubscription()` function initializes a subscription to a session and sets up the
   * subscriber's properties and styles.
   */
  initSubscription() {
    this.subscriber = this.session.subscribe(
      this.stream,
      this.subscriberDiv.nativeElement,
      {
        audioVolume: 60,
        width: '100%',
        height: '100%',
        style: {
          nameDisplayMode: 'off',
          buttonDisplayMode: 'off',
          audioLevelDisplayMode: 'off',
        },
      },
      (err) => {
        if (err) {
          this.toasterService.error(err.message, 'Subscription failure', {
            timeOut: environment.messageTimeout,
          });
          this.initSubscription();
        }
        const name = this.stream.name.split('|');
        const userName = name[0].split(' ');
        if (name[1] !== 'undefined' && name[1] !== 'null') {
          this.getSignedUrl(name);
        } else {
          this.subscriber.setStyle(
            'backgroundImageURI',
            `https://ui-avatars.com/api/?name=${userName[0]}+${userName[1]}=true&size=128`
          );
        }
        this.userName = `${name[0]}`;
        this.mic = this.stream.hasAudio;
        this.speakerDetection(
          this.subscriber,
          () => {
            this.userSpeaking = true;
          },
          () => {
            this.userSpeaking = false;
          }
        );
      }
    );
  }

  /**
   * The function `getSignedUrl` retrieves a signed URL for uploading a file and updates the background
   * image style of a subscriber element with the URL.
   * @param name - The `name` parameter is an array containing the user's name.
   */
  getSignedUrl(name) {
    const userName = name[0].split(' ');
    // this.uploadService
    //   .getSignedUrl(name[Numbers.numberOne], ServiceFlags.CtoService)
    //   .subscribe((res) => {
    //     name[Numbers.numberOne] =
    //       res['url'] ||
    //       `https://ui-avatars.com/api/?name=${userName[0]}+${userName[1]}=true&size=128`;
    //     this.subscriber.setStyle('backgroundImageURI', name[Numbers.numberOne]);
    //   });
  }

  /**
   * The `speakerDetection` function detects when a speaker starts and stops talking based on the audio
   * level and triggers the `startTalking` and `stopTalking` functions accordingly.
   * @param publisher - The `publisher` parameter is an object that emits an `audioLevelUpdated` event.
   * This event is triggered when the audio level of the speaker changes.
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
    publisher.on('audioLevelUpdated', (event) => {
      const now = Date.now();
      if (event.audioLevel > num1) {
        if (!activity) {
          activity = { timestamp: now, talking: false };
        } else if (activity.talking) {
          activity.timestamp = now;
        } else if (
          now - activity.timestamp > num2 &&
          typeof startTalking === 'function'
        ) {
          activity.talking = true;
          startTalking();
        } else {
          // Empty else block
        }
      } else if (activity && now - activity.timestamp > num3) {
        if (activity.talking && typeof stopTalking === 'function') {
          stopTalking();
        }
        activity = null;
      } else {
        // Empty else block
      }
    });
  }

  /**
   * The ngOnDestroy function is called when a component is destroyed and it unsubscribes from a
   * session.
   */
  ngOnDestroy() {
    super.ngOnDestroy();
    this.session.unsubscribe(this.subscriber);
  }
}
