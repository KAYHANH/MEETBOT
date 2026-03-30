import crypto from 'crypto';
import { logger } from './logger.js';
import { UserSettings } from '../models/UserSettings.js';

const ALGORITHM = 'aes-256-cbc';
const IV_LENGTH = 16;

const isHexKey = (value) => /^[0-9a-fA-F]{64}$/.test(value);

const getEncryptionKey = () => {
  const key = process.env.TOKEN_ENCRYPTION_KEY;
  if (!key) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('TOKEN_ENCRYPTION_KEY is missing in production');
    }
    logger.warn('TOKEN_ENCRYPTION_KEY is missing. Using a development fallback key.');
    return crypto.createHash('sha256').update('fallback-secret').digest();
  }

  if (isHexKey(key)) {
    return Buffer.from(key, 'hex');
  }

  if (Buffer.byteLength(key, 'utf8') === 32) {
    return Buffer.from(key, 'utf8');
  }

  logger.warn('TOKEN_ENCRYPTION_KEY should be 32 UTF-8 characters or 64 hex characters. Hashing the provided value for compatibility.');
  return crypto.createHash('sha256').update(key).digest();
};

export const encrypt = (text) => {
  if (!text) return null;
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, getEncryptionKey(), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return `${iv.toString('hex')}:${encrypted.toString('hex')}`;
};

export const decrypt = (text) => {
  if (!text) return null;
  try {
    const textParts = text.split(':');
    const iv = Buffer.from(textParts.shift(), 'hex');
    const encryptedText = Buffer.from(textParts.join(':'), 'hex');
    const decipher = crypto.createDecipheriv(ALGORITHM, getEncryptionKey(), iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
  } catch (error) {
    logger.error('Decryption failed:', error);
    return null;
  }
};

export const storeTokens = async (userId, { accessToken, refreshToken, expiryDate }) => {
  const update = {
    googleAccessToken: encrypt(accessToken),
    googleTokenExpiry: expiryDate
  };

  if (refreshToken) {
    update.googleRefreshToken = encrypt(refreshToken);
  }

  return await UserSettings.findOneAndUpdate(
    { userId },
    { $set: update },
    { upsert: true, new: true }
  );
};

export const getTokens = async (userId) => {
  const settings = await UserSettings.findOne({ userId });
  if (!settings) return null;

  return {
    access_token: decrypt(settings.googleAccessToken),
    refresh_token: decrypt(settings.googleRefreshToken),
    expiry_date: settings.googleTokenExpiry?.getTime()
  };
};
