import dotenv from 'dotenv';

export function isDevMode(): boolean {
  dotenv.config();
  return process.env.NODE_ENV === 'dev';
}
