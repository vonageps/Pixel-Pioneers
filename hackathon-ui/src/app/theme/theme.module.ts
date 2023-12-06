import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatDividerModule } from '@angular/material/divider';
import { MatStepperModule } from '@angular/material/stepper';
import { MatRadioModule } from '@angular/material/radio';

const matModules = [
  MatButtonModule,
  MatFormFieldModule,
  MatInputModule,
  MatIconModule,
  MatNativeDateModule,
  MatDatepickerModule,
  MatSelectModule,
  MatMenuModule,
  MatCheckboxModule,
  MatCardModule,
  MatTabsModule,
  MatDialogModule,
  MatTooltipModule,
  MatExpansionModule,
  MatDividerModule,
  MatStepperModule,
  MatSidenavModule,
  MatRadioModule,
];

const syncfusionModules = [FormsModule];

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    FlexLayoutModule,
    ...matModules,
    ...syncfusionModules,
  ],
  exports: [
    CommonModule,
    FlexLayoutModule,
    ...matModules,
    ...syncfusionModules,
  ],
  providers: [],
})
export class ThemeModule {}
