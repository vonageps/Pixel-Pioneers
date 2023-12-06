import {Component, Input, EventEmitter, Output} from '@angular/core';
import {ControlContainer, FormGroup, FormGroupDirective} from '@angular/forms';

@Component({
  selector: 'telescope-dropdown',
  templateUrl: './dropdown.component.html',
  styleUrls: ['./dropdown.component.scss'],
  viewProviders: [{provide: ControlContainer, useExisting: FormGroupDirective}],
})
export class DropdownComponent {
  @Input() dropdownItems: object[];
  @Input() dropdownFields: object;
  @Input() dropwdownPlaceholder: string;
  @Input() dropdownId: string;
  @Input() dropwdownModel: string;
  @Input() dropwdownName: string;
  @Input() dropwdownError: string;
  @Input() required: string;
  @Input() parentFormGroup: FormGroup;
  @Input() controlName: string;
  @Input() readonly: boolean;
  @Input() template: boolean;
  @Input() allowFiltering: boolean;
  @Input() filterBarPlaceholder: string;
  @Output() dropwdownModelChange: EventEmitter<string> = new EventEmitter();

  /**
   * The "itemChange" function emits the value of the selected item in a dropdown menu.
   * @param event - The event parameter is an object that represents the event that triggered the
   * itemChange function. It likely contains information about the event, such as the selected item
   * data.
   */
  itemChange(event) {
    const valueProp = this.dropdownFields?.['value'] ?? 'value';
    this.dropwdownModelChange.emit(event.itemData[valueProp]);
  }
}
