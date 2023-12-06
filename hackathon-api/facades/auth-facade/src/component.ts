import {Component, ProviderMap} from '@loopback/core';

import {FileUploadBindings} from './types';
import {SafeMulterS3Provider} from './providers/safe-multer-s3.provider';

export class FileUploaderComponent implements Component {
  constructor() {
    this.providers = {
      [FileUploadBindings.SafeMulterS3Provider.key]: SafeMulterS3Provider,
    };
  }
  providers?: ProviderMap = {};
}
