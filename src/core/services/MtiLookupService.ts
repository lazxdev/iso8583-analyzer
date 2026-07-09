import type { MtiLookupProvider } from '../interfaces/mti-lookup-provider';
import { mtiVersions, mtiClasses, mtiFunctions, mtiOriginators } from '../../constants';

export class MtiLookupService implements MtiLookupProvider {
  lookupVersion(key: string): string {
    return mtiVersions[key] ?? `Unknown (${key})`;
  }

  lookupClass(key: string): string {
    return mtiClasses[key] ?? `Unknown (${key})`;
  }

  lookupFunction(key: string): string {
    return mtiFunctions[key] ?? `Unknown (${key})`;
  }

  lookupOriginator(key: string): string {
    return mtiOriginators[key] ?? `Unknown (${key})`;
  }
}
