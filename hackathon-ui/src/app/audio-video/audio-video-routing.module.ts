import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";

import {
  AudioVideoComponent,
  ExternalUserDetailsComponent,
  RetryComponent,
  ThankYouComponent,
} from "./components";
import { RegisterComponent } from "./components/register/register.component";
import { MeetingComponent } from "./meeting.component";

const routes: Routes = [
  {
    path: "",
    component: MeetingComponent,
    children: [
      {
        path: "register",
        component: RegisterComponent,
      },
      {
        path: "room",
        component: AudioVideoComponent,
      },
      // {
      //   path: "room/:code",
      //   component: AudioVideoComponent,
      // },
      {
        path: "user-details",
        component: ExternalUserDetailsComponent,
      },

      {
        path: "thank-you",
        component: ThankYouComponent,
      },
      {
        path: "retry",
        component: RetryComponent,
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AudioVideoRoutingModule {}
