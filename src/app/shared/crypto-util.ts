import * as CryptoJS from 'crypto-js';

const SECRET_KEY = 'Blog@123';

export class CryptoUtil {
  /**
   * Encrypts a string (e.g., JSON.stringify(obj)) for safe routing/query param usage.
   */
  static encrypt(data: string): string {
    return CryptoJS.AES.encrypt(data, SECRET_KEY).toString();
  }

  /**
   * Decrypts an encrypted string to its original value.
   */
  // static decrypt(cipherText: string): string {
  //   debugger
  //   const bytes = CryptoJS.AES.decrypt(cipherText, SECRET_KEY);
  //   console.log(bytes.toString(CryptoJS.enc.Utf8))
  //   return bytes.toString(CryptoJS.enc.Utf8);
  // }
  static decrypt(cipherText: string): string {
    // Always decode URL-encoded ciphertext
    const decoded = decodeURIComponent(cipherText);
    console.log('Decoded ciphertext:', decoded);
    const bytes = CryptoJS.AES.decrypt(decoded, SECRET_KEY);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    console.log('Decrypted:', decrypted);
    return decrypted;
  }

  /**
   * Encrypts an object as a URL-safe encrypted string.
   */
  static encryptUrlParams(params: object): string {
    const json = JSON.stringify(params);
    return CryptoUtil.encrypt(json);
  }

  /**
   * Decrypts a URL-safe encrypted string back to an object.
   */
  static decryptUrlParams(encrypted: string): any {
  try {
    const decrypted = CryptoUtil.decrypt(encrypted);
    console.log('Decrypted:', decrypted);
    try {
      return JSON.parse(decrypted);
    } catch (jsonErr) {
      // Not JSON, return as string
      console.warn('Decrypted value is not JSON:', decrypted);
      return decrypted;
    }
  } catch (e) {
    console.error('Failed to decrypt or parse encrypted URL params:', e);
    return null;
  }
}
}

