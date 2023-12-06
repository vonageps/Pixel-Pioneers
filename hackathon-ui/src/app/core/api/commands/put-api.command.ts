import { HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map } from 'rxjs/operators';

import { IAdapter } from '../adapters/i-adapter';
import { ApiService } from '../api.service';
import { ICommand } from './i-command';
import { HttpObserve } from '@care/core/types';

export class PutAPICommand<T> implements ICommand {
  constructor(
    protected readonly apiService: ApiService,
    protected readonly adapter: IAdapter<T>,
    protected readonly uri: string
  ) {}

  parameters: { data: T; headers?: HttpHeaders; observe?: HttpObserve };

  execute(): Observable<T> {
    if (!this.parameters) {
      throwError(() => `Parameters missing for PUT ${this.uri}`);
    }
    const options: any = { observe: this.parameters.observe || 'body' };
    if (this.parameters.headers) {
      options.headers = this.parameters.headers;
    }
    return this.apiService
      .put(this.uri, this.adapter.adaptFromModel(this.parameters.data), options)
      .pipe(map((resp) => this.adapter.adaptToModel(resp)));
  }
}
