import { environment } from '@care/env/environment';
import * as CryptoJS from 'crypto-js';

export class EncryptDecrypt {
  encrypt<T>(data: T): string {
    return (
      data &&
      CryptoJS.AES.encrypt(
        JSON.stringify(data),
        environment.cryptoSecretKey
      ).toString()
    );
  }

  decrypt<T>(data: string): T {
    const decryptData =
      data && CryptoJS.AES.decrypt(data, environment.cryptoSecretKey);
    return decryptData && JSON.parse(decryptData.toString(CryptoJS.enc.Utf8));
  }
}
