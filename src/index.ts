import * as countryCoder from './country-coder';

declare global {
  var countryCoder: typeof import('./country-coder');
}

globalThis.countryCoder = countryCoder;
