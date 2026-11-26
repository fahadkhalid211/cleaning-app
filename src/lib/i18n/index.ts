import type { TranslationDictionary } from './types';
import { enDictionary } from './dictionaries/en';
import { cnDictionary } from './dictionaries/cn';

export * from './types';
export * from './context';
export { enDictionary } from './dictionaries/en';
export { cnDictionary } from './dictionaries/cn';

export function getDictionary(locale?: string): TranslationDictionary {
  if (locale === 'cn') return cnDictionary;
  return enDictionary;
}
