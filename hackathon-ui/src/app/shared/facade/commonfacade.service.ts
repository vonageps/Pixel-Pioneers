import { Injectable } from "@angular/core";
import { AnyAdapter } from "@care/core/api/adapters/any-adapter.service";
import { ApiService } from "@care/core/api/api.service";
import { UploadDocumnetCommand } from "../commands/upload-document.command";

@Injectable({
  providedIn: "root",
})
export class CommonfacadeService {
  constructor(
    private readonly apiService: ApiService,

    private readonly anyAdapter: AnyAdapter
  ) {}

  uploadFile(file) {
    const command: UploadDocumnetCommand<any> = new UploadDocumnetCommand(
      this.apiService,
      this.anyAdapter
    );
    const formData = new FormData();
    formData.append("file", file);
    command.parameters = {
      data: formData,
    };

    return command.execute();
  }
}
