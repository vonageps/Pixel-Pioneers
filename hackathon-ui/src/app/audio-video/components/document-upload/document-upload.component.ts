import { Component, ElementRef, Inject, Input, ViewChild } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { Numbers } from "@care/shared/enum/numbers.enum";
import { ToastrService } from "ngx-toastr";
import { AudioVideoService } from "../../shared/audio-video.service";
import { environment } from "@care/env/environment";
import { CommonfacadeService } from "@care/shared/facade/commonfacade.service";
const ALLOWED_CONTENT_LENGTH = 2097152; // (2 MB in bytes)
const ALLOWED_CONTENT_LENGTH2 = 1048576;

interface IFileUploadParams {
  isUploaded: boolean;
  uploadS3path: string;
  name: string;
  size: string;
  fileObj: File;
  uploadS3SignedUrl: string;
}
@Component({
  selector: "app-document-upload",
  templateUrl: "./document-upload.component.html",
  styleUrls: ["./document-upload.component.scss"],
})
export class DocumentUploadComponent {
  @ViewChild("fileDropRef", { static: false }) fileDropEl: ElementRef;
  files: any[] = [];
  totalFiles: number;
  loader = false;
  fileAcceptTypes: string[] = [".pdf"];
  uploadedFiles = [];
  isMultipleFiles = false;
  errorMsg = null;
  eventId: string;
  filesToBeRemoved = [];
  obj: IFileUploadParams = {
    isUploaded: false,
    uploadS3path: "",
    name: "",
    size: "",
    fileObj: undefined,
    uploadS3SignedUrl: "",
  };

  uploadInProgress = false;

  fileSizewithUnits = "";

  constructor(
    private readonly dialogRef: MatDialogRef<DocumentUploadComponent>,
    private readonly toastr: ToastrService,
    private readonly audioFacade: AudioVideoService,
    protected readonly commonService: CommonfacadeService,
    @Inject(MAT_DIALOG_DATA) public data
  ) {}

  onFileDropped(event): void {
    event.preventDefault();
    console.log(event);
    const files: File[] = event.dataTransfer?.files || [];
    console.log(files);
    if (files.length > 0) {
      this.handleSingleFileUpload(files);
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
  }

  /**
   * handle file from browsing
   */
  fileBrowseHandler(event: any) {
    this.handleSingleFileUpload(event.target.files);
  }

  handleSingleFileUpload(files: File[]) {
    if (this.files.length > 0) {
      this.toastr.error("Single file upload allowed");
      return;
    }
    if (
      this.isValidExtension(files[0]) &&
      this.isValidFileSize(files[0]) &&
      this.isSafeScript(files[0])
    ) {
      this.prepareFilesList(files);
    }
  }

  /**
   * Convert Files list to normal array list
   * @param files (Files List)
   */
  prepareFilesList(files: Array<any>) {
    for (const item of files) {
      item.progress = 0;
      this.files.push(item);
    }
    // this.uploadtoS3Bucket(this.files[0]);
    this.fileSizewithUnits = this.formatBytes(this.files[0]?.size);
  }

  uploadtoS3Bucket(file: File) {
    this.loader = true;
    // this.dialogRef.close({
    //   obj: this.obj,
    // });
    this.commonService.uploadFile(file).subscribe({
      next: (res) => {
        this.loader = false;
        this.dialogRef.close(res);
      },
      error: () => {
        this.loader = false;
      },
    });
  }

  /**
   * Delete file from files list
   * @param index (File index)
   */
  deleteFile(index: number) {
    this.files.splice(index, 1);
  }

  /**
   * format bytes
   * @param bytes (File size in bytes)
   * @param decimals (Decimals point)
   * @returns - string depicting size
   */
  formatBytes(bytes, decimals = Numbers.numberTwo): string {
    if (bytes === Numbers.numberZero) {
      return "0 Bytes";
    }
    const k = 1024;
    const dm = decimals <= 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
  }

  isValidExtension(file: File) {
    const fileExtension = file.name.substring(file.name.lastIndexOf("."));
    console.log("//fileExtension", fileExtension);
    if (!this.fileAcceptTypes.includes(fileExtension)) {
      //this.toastr.error("invalidFileExtension");
      this.toastr.error("invalidFileExtension", "Error", {
        timeOut: environment.messageTimeout,
      });
      return false;
    }
    return true;
  }

  isValidFileSize(file: File) {
    if (!this.isMultipleFiles && file.size > ALLOWED_CONTENT_LENGTH) {
      this.toastr.error("fileSizeError");
      return false;
    } else if (this.isMultipleFiles && file.size > ALLOWED_CONTENT_LENGTH2) {
      this.toastr.error("fileSizeError");
      return false;
    } else {
      return true;
    }
  }

  isSafeScript(file: File): boolean {
    const NO_HTML_TAGS = /^(?!.*<[^>]+>).*$/;
    if (!NO_HTML_TAGS.test(file.name)) {
      this.toastr.error("fileSizeError");
      return false;
    }
    return true;
  }

  remove(file) {
    this.files = this.files.filter((item) => item.name !== file.name);
  }
}
