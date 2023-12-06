import {bind, BindingScope} from '@loopback/core';
import {Readable} from 'stream';

const NOT_FOUND = 404;
interface DownloadedFile {
  data: AWS.S3.HeadObjectOutput;
  stream: Readable;
}

@bind({scope: BindingScope.SINGLETON})
export class FileHelperService {
  async downloadFile(
    fileKey: string,
    s3: AWS.S3,
    bucketName: string,
    path?: string,
  ): Promise<DownloadedFile> {
    const fileParams = {
      Bucket: `${bucketName}${path ?? ''}`,
      Key: fileKey,
    };
    return new Promise((resolve, reject) => {
      s3.headObject(fileParams, function (err, data) {
        if (err) {
          if (err.statusCode === NOT_FOUND) {
            reject(new Error('FILE_NOT_FOUND'));
          }
          reject(new Error('SERVER_ERROR'));
        } else {
          resolve({
            data,
            stream: s3.getObject(fileParams).createReadStream(),
          });
        }
      });
    });
  }
}
