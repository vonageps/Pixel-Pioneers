import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { DropdownComponent } from "./components/dropdown/dropdown.component";
import { DialogComponent } from "./components/dialog/dialog.component";
import { DropDownListModule } from "@syncfusion/ej2-angular-dropdowns";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { ThemeModule } from "@care/theme/theme.module";
import { ToastrModule, ToastrService } from "ngx-toastr";
import { VerificationComponent } from "./components/verification/verification.component";
import { CommonfacadeService } from "./facade/commonfacade.service";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
@NgModule({
  declarations: [DropdownComponent, DialogComponent, VerificationComponent],
  imports: [
    CommonModule,
    DropDownListModule,
    FormsModule,
    ReactiveFormsModule,
    ThemeModule,
    MatProgressSpinnerModule,
  ],
  exports: [
    DropdownComponent,
    DialogComponent,
    FormsModule,
    ReactiveFormsModule,
  ],
  providers: [ToastrService, CommonfacadeService],
})
export class SharedModule {}
