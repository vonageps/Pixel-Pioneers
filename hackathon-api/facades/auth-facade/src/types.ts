/* eslint-disable @typescript-eslint/no-explicit-any */
import {BindingKey} from '@loopback/core';
import * as AWS from 'aws-sdk';
import {Request, Response} from 'express';
import {FileHelperService} from './services';

export namespace FileUploadBindings {
  export const FileHelper = BindingKey.create<FileHelperService>(
    'sf.services.fileHelper',
  );
  export const MulterS3Provider = BindingKey.create<IUploader>('sf.multer.s3');
  export const SafeMulterS3Provider =
    BindingKey.create<IUploader>('sf.safe-multer-s3');
  export const Config = BindingKey.create<MulterS3Options>(
    'sf.multerS3.options',
  );
  export const request = BindingKey.create<Request>('sf.multerS3.request');
  export const response = BindingKey.create<Response>('sf.multerS3.response');
  export const S3UploadProvider = BindingKey.create<IS3Options>('sf.s3.upload');
}

export interface File {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  destination: string;
  filename: string;
  path: string;
  buffer: Buffer;
}

export interface MulterS3Options {
  s3: AWS.S3;
  // sonarignore:start
  bucket:
    | ((
        req: Request,
        file: File,
        callback: (error: any, bucket?: string) => void,
      ) => void)
    | string;
  key?(
    req: Request,
    file: File,
    callback: (error: any, key: string) => void,
  ): void;
  acl?:
    | ((
        req: Request,
        file: File,
        callback: (error: any, acl?: string) => void,
      ) => void)
    | string;
  contentType?(
    req: Request,
    file: File,
    callback: (
      error: any,
      mime?: string,
      stream?: NodeJS.ReadableStream,
    ) => void,
  ): void;
  metadata?(
    req: Request,
    file: File,
    callback: (error: any, metadata?: any) => void,
  ): void;
  cacheControl?:
    | ((
        req: Request,
        file: File,
        callback: (error: any, cacheControl?: string) => void,
      ) => void)
    | string;
  serverSideEncryption?:
    | ((
        req: Request,
        file: File,
        callback: (error: any, serverSideEncryption?: string) => void,
      ) => void)
    | string;
  contentDisposition: string;
  // sonarignore:end
}

export interface SafeMulterS3Options
  extends Omit<MulterS3Options, 'contentType'> {
  maxSize?: number;
  allowedExts?: string[];
  fileFilter?: (
    req: Request,
    file: File,
    // sonarignore:start
    callback: (err: any, allow?: boolean) => void,
    // sonarignore:end
  ) => void;
  key: (
    req: Request,
    file: File,
    // sonarignore:start
    callback: (error: any, key: string) => void,
    // sonarignore:end
  ) => void;
  acl?: string;
  bucket: string;
  tempDir: string;
  clamavEndpoint?: string;
  noServerUpload?: boolean;
}

export interface IUploader {
  uploadAny(
    options: MulterS3Options,
    req: Request,
    res: Response,
  ): Promise<object>;
}
export interface IS3Options {
  s3: AWS.S3;
  acl: string;
  bucket: string;
  key: string;
  contentType: string;
  fileBuffer: Buffer;
}

export interface IUploadS3 {
  uploadAny(options: IS3Options): Promise<object>;
}
