import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ViewDocumentComponent } from '../view-document/view-document.component';

@Component({
  selector: 'app-patient-details',
  templateUrl: './patient-details.component.html',
  styleUrls: ['./patient-details.component.scss'],
})
export class PatientDetailsComponent {
  constructor(public dialog: MatDialog) {}
  panelOpenState = false;
  openDocument() {
    const dialogRef = this.dialog.open(ViewDocumentComponent, {
      width: '610px',
      maxHeight: '80vh',
    });
    dialogRef.afterClosed().subscribe((result) => {});
  }
}
