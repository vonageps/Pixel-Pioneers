import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiModule } from './api/api.module';
import { StoreModule } from './store';

import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';
@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    CommonModule,
    HttpClientModule,
    StoreModule,
    ApiModule,
    RouterModule,
  ],
  exports: [StoreModule, ApiModule],
})
export class CoreModule {}
