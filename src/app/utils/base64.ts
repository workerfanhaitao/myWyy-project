import { AnyJson } from '../services/data-types/common.types';
import { Base64 } from 'js-base64';

export function codeJson(source: AnyJson, type = 'encode'): AnyJson {
  const result = {};
  for (const attr in source) {
    if (source.hasOwnProperty(attr)) {
      result[Base64[type](attr)] = Base64[type](source[attr]);
    }
  }
  return result;
}
