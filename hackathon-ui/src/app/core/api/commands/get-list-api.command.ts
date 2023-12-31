import {HttpHeaders, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';

import {IAdapter} from '../adapters/i-adapter';
import {ApiService} from '../api.service';
import {ICommand} from './i-command';

export abstract class GetListAPICommand<T> implements ICommand {
  constructor(
    protected readonly apiService: ApiService,
    protected readonly adapter: IAdapter<T>,
    protected readonly uri: string,
  ) {}

  parameters?: {
    query?: HttpParams;
    headers?: HttpHeaders;
  };

  execute(): Observable<T[]> {
    const options: any = {observe: 'body'};
    if (this.parameters) {
      if (this.parameters.headers) {
        options.headers = this.parameters.headers;
      }

      if (this.parameters.query) {
        options.params = this.parameters.query;
      }
    }
    return this.apiService
      .get(this.uri, options)
      .pipe(map(resp => resp.map(data => this.adapter.adaptToModel(data))));
  }
}
