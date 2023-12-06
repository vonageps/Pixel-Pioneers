import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { AudioVideoRoutingModule } from "./audio-video-routing.module";
import { FlexLayoutModule } from "@angular/flex-layout";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
//import {ThemeModule} from '@telescope/theme/theme.module';
import { MatDialogModule } from "@angular/material/dialog";
import { MeetingComponent } from "./meeting.component";
import {
  SubscriberComponent,
  ExternalUserDetailsComponent,
  RetryComponent,
  PrecallScreenComponent,
  AudioVideoComponent,
  ThankYouComponent,
  PublisherComponent,
  CallControlDialogComponent,
} from "./components";
import { SharedModule } from "@care/shared/shared.module";
import { ThemeModule } from "@care/theme/theme.module";
import { MatSelectModule } from "@angular/material/select";
import { MatInputModule } from "@angular/material/input";
import { MatFormFieldModule } from "@angular/material/form-field";
import { DocumentUploadComponent } from "./components/document-upload/document-upload.component";
import { RegisterComponent } from "./components/register/register.component";
import { TranscriptionComponent } from "./components/transcription/transcription.component";
import { SuggestionPopupComponent } from "./components/suggestion-popup/suggestion-popup.component";
import { PatientDetailsComponent } from "./components/patient-details/patient-details.component";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatNativeDateModule } from "@angular/material/core";
import { VerificationComponent } from "../shared/components/verification/verification.component";
import { ViewDocumentComponent } from "./components/view-document/view-document.component";
import { IncomingBoxComponent } from "./components/incoming-box/incoming-box.component";
import { NgxDropzoneModule } from "ngx-dropzone";
import { ToastrModule, ToastrService } from "ngx-toastr";

@NgModule({
  declarations: [
    AudioVideoComponent,
    PublisherComponent,
    SubscriberComponent,
    ExternalUserDetailsComponent,
    ThankYouComponent,
    RetryComponent,
    PrecallScreenComponent,
    MeetingComponent,
    CallControlDialogComponent,
    DocumentUploadComponent,
    RegisterComponent,
    TranscriptionComponent,
    SuggestionPopupComponent,
    PatientDetailsComponent,
    ViewDocumentComponent,
    IncomingBoxComponent,
  ],
  imports: [
    CommonModule,
    AudioVideoRoutingModule,
    FlexLayoutModule,
    MatDialogModule,
    SharedModule,
    ThemeModule,
    MatSelectModule,
    MatInputModule,
    MatFormFieldModule,
    FormsModule,
    MatDatepickerModule,
    MatNativeDateModule,
    NgxDropzoneModule,
  ],
  providers: [ToastrService],
})
export class AudioVideoModule {}
