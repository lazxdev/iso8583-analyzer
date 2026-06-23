export const mtiVersions: Record<string, string> = {
  '0': 'ISO 8583:1987',
  '1': 'ISO 8583:1993',
  '2': 'ISO 8583:2003',
  '9': 'Private Use',
};

export const mtiClasses: Record<string, string> = {
  '1': 'Authorization',
  '2': 'Financial',
  '3': 'File Actions',
  '4': 'Reversal / Chargeback',
  '5': 'Reconciliation',
  '6': 'Administrative',
  '7': 'Fee Collection',
  '8': 'Network Management',
  '9': 'Reserved',
};

export const mtiFunctions: Record<string, string> = {
  '0': 'Request',
  '1': 'Request Response',
  '2': 'Advice',
  '3': 'Advice Response',
  '4': 'Notification',
  '5': 'Notification Response',
  '6': 'Inquiry',
  '7': 'Inquiry Response',
};

export const mtiOriginators: Record<string, string> = {
  '0': 'Acquirer',
  '1': 'Acquirer Repeat',
  '2': 'Issuer',
  '3': 'Issuer Repeat',
  '4': 'Other',
  '5': 'Other Repeat',
};
