import { IAdapter } from "@care/core/api/adapters/i-adapter";
import { ApiService } from "@care/core/api/api.service";
import { PostAPICommand } from "@care/core/api/commands";
import { environment } from "@care/env/environment";

export class VerifyOtpCommand<T> extends PostAPICommand<T> {
  constructor(apiService: ApiService, adapter: IAdapter<T>) {
    super(apiService, adapter, `${environment.appUrlAuth}/otp-verify/verify`);
  }
}
