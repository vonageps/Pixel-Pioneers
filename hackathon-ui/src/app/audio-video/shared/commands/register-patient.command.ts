import { IAdapter } from "@care/core/api/adapters/i-adapter";
import { ApiService } from "@care/core/api/api.service";
import { PatchAPICommand } from "@care/core/api/commands";
import { environment } from "@care/env/environment";

export class RegisterCommand<T> extends PatchAPICommand<T> {
  constructor(apiService: ApiService, adapter: IAdapter<T>) {
    super(apiService, adapter, `${environment.appUrlAuth}/auth/user`);
  }
}
