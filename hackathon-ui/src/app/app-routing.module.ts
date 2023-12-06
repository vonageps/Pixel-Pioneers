import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { VerificationComponent } from "./shared/components/verification/verification.component";

const routes: Routes = [
  {
    path: "verification",
    component: VerificationComponent,
  },
  {
    path: "",
    component: VerificationComponent,
  },
  {
    path: "meeting",
    loadChildren: () =>
      import("./audio-video/audio-video.module").then(
        (m) => m.AudioVideoModule
      ),
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
