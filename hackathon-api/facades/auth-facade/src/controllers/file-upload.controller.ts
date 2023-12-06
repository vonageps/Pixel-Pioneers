// Uncomment these imports to begin using these cool features!

import {inject} from '@loopback/core';
import {AnyObject} from '@loopback/repository';
import {
  HttpErrors,
  post,
  Request,
  requestBody,
  Response,
  RestBindings,
} from '@loopback/rest';
import {ErrorCodes, STATUS_CODE} from '@sourceloop/core';
import * as AWS from 'aws-sdk';
import _ from 'lodash';
import {authorize} from 'loopback4-authorization';
import {AWSS3Bindings} from 'loopback4-s3';
import {FileUploadBindings, IUploader, SafeMulterS3Options} from '../types';
import axios from 'axios';

const bucket = process.env.FILE_BUCKET ?? '';
const VALID_FILE_EXTENSION = ['.jpeg', '.jpg', '.png', '.pdf'];
const ALLOWED_DIR = './.tmp';
export class FileUploadController {
  constructor(
    @inject(FileUploadBindings.SafeMulterS3Provider)
    private readonly multerS3Provider: IUploader,
  ) {}

  @authorize({permissions: ['*']})
  @post('/file-upload', {
    description: 'General file upload',
    responses: {
      [STATUS_CODE.OK]: {
        description: 'Upload file',
      },
      ...ErrorCodes,
    },
  })
  async uploadFile(
    @requestBody({
      description: 'multipart/form-data',
      required: true,
      content: {
        'multipart/form-data': {
          // Skip body parsing
          'x-parser': 'stream',
          schema: {type: 'object'},
        },
      },
    })
    request: Request,
    @inject(RestBindings.Http.RESPONSE) response: Response,
    @inject(AWSS3Bindings.AwsS3Provider) s3: AWS.S3,
  ): Promise<any> {
    // sonarignore:start
    s3 = new AWS.S3({
      region: process.env.AWS_S3_REGION,
      signatureVersion: 'v4',
    });
    // sonarignore:end
    const safeMulterS3Options: SafeMulterS3Options = {
      s3,
      bucket,
      // Set public read permissions
      acl: 'private',
      //Set key/ filename as original uploaded name
      key: (_req, file, cb) => {
        const fileSplitArr = file.originalname.split('.');
        const fileExt = fileSplitArr[fileSplitArr.length - 1];
        const fileName = fileSplitArr.splice(-1, 1).join('_');
        cb(null, `${Date.now()}_${_.snakeCase(fileName)}.${fileExt}`);
      },
      contentDisposition: 'inline',
      tempDir: ALLOWED_DIR,
      allowedExts: VALID_FILE_EXTENSION,
    };
    // sonarignore:start

    const uploadResp = await this.multerS3Provider.uploadAny(
      safeMulterS3Options,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      request as any,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      response as any,
    );
    if (
      !((uploadResp as AnyObject)?.files as Express.Multer.File[])[0]?.filename
    ) {
      throw new HttpErrors.UnprocessableEntity('Unable to upload file');
    }
    const {filename: fileKey} = (
      (uploadResp as AnyObject).files as Express.Multer.File[]
    )[0];

    // Make the fetch request
    let finalresult = await axios.get(`${process.env.DATA_EXTRACTOR_SERVICE_URL}/extract`,{
      params:{
        s3_link:`s3://${process.env.FILE_BUCKET}/${fileKey}`
      }
    });
    return this.extractData(finalresult.data);
    // sonarignore:end
  }

  getAWSSignedUrl(fileKey: string, bucketName: string) {
    const expire = 900;
    const s3 = new AWS.S3({
      region: process.env.AWS_S3_REGION,
      signatureVersion: 'v4',
    });
    return s3.getSignedUrl('getObject', {
      Key: fileKey,
      Bucket: bucketName,
      Expires: expire,
    });
  }
  extractData(input:string){
    const inputString = input;
    // Split the string by newline characters
    const splitString = inputString.split("\n");
    // Initialize an empty object to hold the extracted data
    const extractedData: any = {};
    // Iterate through each line of the split string
    splitString.forEach((line) => {
      // Split each line by the colon character
      const lineSplit = line.split(":");
      if (lineSplit.length === 2) {
        // Trim whitespace and assign key-value pairs to the object
        const key = lineSplit[0].trim();
        const value = lineSplit[1].trim();
        extractedData[key] = value;
      }
    });
    // Resulting JSON object
    return extractedData;
  }
}
