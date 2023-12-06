import {Provider} from '@loopback/core';
import {Request, Response} from 'express';
import {fromBuffer} from 'file-type';
import FormData from 'form-data';
import * as fs from 'fs';
import multer from 'multer';
import fetch from 'node-fetch';

import {File, IUploader, SafeMulterS3Options} from '../types';
import {HttpErrors} from '@loopback/rest';

import path from 'path';

// sonarignore:start
// import sharp from 'sharp';
// sonarignore:end
// sonarignore:start
// const sharpSupportedFiles = ['.jpg', '.jpeg', '.png', '.webp', '.avif'];
// sonarignore:end

const allowedExt = ['jpg', 'jpeg', 'png', 'pdf'];
const HTTP_200 = 200;
const extMaxLength = 2;
const ALLOWED_DIR = './.tmp';
const allowedDir = [ALLOWED_DIR];

async function readFilePromise(filePath: string, directoryName: string) {
  filePath = path.normalize(filePath);
  if (!allowedDir.includes(directoryName)) {
    throw new Error('unsupported');
  }

  return new Promise<Buffer>((resolve, reject) => {
    fs.readFile(filePath, (err, buffer) => {
      if (err) {
        reject(err);
      } else {
        resolve(buffer);
      }
    });
  });
}

async function deleteFilePromise(filePath: string, directoryName: string) {
  filePath = path.normalize(filePath);

  if (!allowedDir.includes(directoryName)) {
    throw new Error('unsupported');
  }

  return new Promise<void>((resolve, reject) => {
    fs.unlink(filePath, err => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

async function contentTypeCheck(options: SafeMulterS3Options, file: File) {
  try {
    const buffer = await readFilePromise(
      `${options.tempDir}/${file.filename}`,
      options.tempDir,
    );

    const trueType = await fromBuffer(buffer);

    // Assign buffer as it's removed after multer processing
    file.buffer = buffer;
    /**
     * Trutype gives `jpg` and we maintain whitelist as `['.jpg']`
     */
    let ext: string | undefined = trueType?.ext;
    const mimeType: string | undefined = trueType?.mime;
    if (ext && !ext.startsWith('.')) {
      ext = `.${ext}`;
    }
    // sonarignore:start
    // Assign true type property to file to be used by virus check
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (file as any).ext = ext;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (file as any).mimeType = mimeType;
    // sonarignore:end

    if (file.mimetype.split('/')[1] !== 'CSV' && options.allowedExts) {
      if (!ext || !options.allowedExts.includes(ext) || !file.mimetype) {
        throw new Error('');
      }
    }
  } catch (err) {
    throw new Error('File type not supported');
  }
}

async function clamVirusCheck(options: SafeMulterS3Options, file: File) {
  if (options.clamavEndpoint?.length) {
    const form = new FormData();
    // sonarignore:start
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    form.append('FILES', file.buffer as any);
    // sonarignore:end
    const response = await fetch(`${options.clamavEndpoint}`, {
      method: 'POST',
      // sonarignore:start
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      body: form as any,
      // sonarignore:end
    });
    if (response.status === HTTP_200) {
      // sonarignore:start
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const body = (await response.json()) as any;
      // sonarignore:end
      if (!body?.success || body?.data?.result[0]?.is_infected) {
        throw new Error('');
      }
      return;
    } else {
      throw new Error('');
    }
  }
}

async function virusCheck(options: SafeMulterS3Options, file: File) {
  try {
    await Promise.all([
      // sonarignore:start
      // sharpVirusCheck(options, file),
      // sonarignore:end
      clamVirusCheck(options, file),
    ]);
  } catch (err) {
    throw new Error('File contains malware');
  }
}

function preMulterChecks(
  _options: SafeMulterS3Options,
  _file: File,
  // sonarignore:start
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  callback: (err: any, allow?: boolean) => void,
  // sonarignore:end
) {
  callback(null, true);
}

async function postMulterChecks(options: SafeMulterS3Options, file: File) {
  await contentTypeCheck(options, file);
  await virusCheck(options, file);
}

async function uploadToS3(options: SafeMulterS3Options, file: File) {
  if (options.noServerUpload) {
    return Promise.resolve();
  }
  const buffer = await readFilePromise(
    `${options.tempDir}/${file.filename}`,
    options.tempDir,
  );
  const payload = {
    ACL: options.acl,
    Bucket: options.bucket,
    Key: file.filename,
    ContentDisposition: options.contentDisposition,
    StorageClass: 'STANDARD',
    Body: buffer,
    ContentType: file.mimetype,
  };

  return new Promise(function (resolve, reject) {
    try {
      options.s3.putObject(payload, function (res) {
        resolve(file.filename);
      });
    } catch (e) {
      reject(new Error('ErrorInUpload'));
    }
  });
}

export class SafeMulterS3Provider implements Provider<IUploader> {
  value() {
    return {
      uploadAny: async (
        options: SafeMulterS3Options,
        req: Request,
        res: Response,
      ) => {
        const fileFilter = (
          _req: Request,
          file: File,
          // sonarignore:start
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          callback: (err: any, allow?: boolean) => void,
          // sonarignore:end
        ) => {
          preMulterChecks(options, file, callback);
        };
        // sonarignore:start
        const upload = multer({
          storage: multer.diskStorage({
            destination: options.tempDir,
            filename: options.key,
          }),
          fileFilter: options.fileFilter ?? fileFilter,
          limits: {fileSize: options.maxSize},
        });
        // sonarignore:end

        return new Promise<object>((resolve, reject) => {
          // sonarignore:start
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          upload.any()(req, res, async (err: any) => {
            // sonarignore:end
            if (err) {
              reject(err);
            } else {
              if (Array.isArray(req.files) && req.files[0]) {
                try {
                  validateFileExtention(req.files[0]);
                  await postMulterChecks(options, req.files[0]);
                  await uploadToS3(options, req.files[0]);
                  // delete file
                } catch (postMulterError) {
                  reject(postMulterError);
                } finally {
                  // eslint-disable-next-line @typescript-eslint/no-floating-promises
                  deleteFilePromise(
                    `${options.tempDir}/${req.files[0].filename}`,
                    options.tempDir,
                  );
                }
              }
              resolve({
                files: req.files,
                reqBody: req.body,
              });
            }
          });
        });
      },
    };
  }
}

/**
 * To validate if correct file uploaded
 * @param file , pass file
 */
function validateFileExtention(file: File) {
  const fileDetail = file.originalname.split('.');
  /** VALIDATE FOR DOUBLE EXTENSION **/
  if (fileDetail.length > extMaxLength) {
    throw new HttpErrors.Forbidden('un');
  }
  /** CHECK VALID EXTENSION **/
  if (
    fileDetail.length !== extMaxLength &&
    !allowedExt.includes(fileDetail[fileDetail.length - 1])
  ) {
    throw new HttpErrors.Forbidden('un');
  }
}
