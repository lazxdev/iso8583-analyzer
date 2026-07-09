export interface MtiLookupProvider {
  lookupVersion(key: string): string;
  lookupClass(key: string): string;
  lookupFunction(key: string): string;
  lookupOriginator(key: string): string;
}
