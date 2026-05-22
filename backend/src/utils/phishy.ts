export interface PhishyAnalysis {
  isPhishy: boolean;
  reasons: string[];
}

const SUSPICIOUS_HOST_FRAGMENTS = [
  'secure',
  'verify',
  'update',
  'wallet',
  'signin',
  'login',
  'account',
  'bank',
];

const SUSPICIOUS_URL_FRAGMENTS = [
  'confirm',
  'password',
  'reset',
  'recovery',
  '2fa',
  'mfa',
  'gift',
  'claim',
  'bonus',
];

export const analyzeUrlRisk = (value: string): PhishyAnalysis => {
  const reasons: string[] = [];

  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return { isPhishy: true, reasons: ['Malformed URL'] };
  }

  const protocol = url.protocol.toLowerCase();
  if (protocol !== 'http:' && protocol !== 'https:') {
    reasons.push('Non-http(s) protocol');
  }

  const hostname = url.hostname.toLowerCase();
  if (hostname.startsWith('xn--')) {
    reasons.push('Punycode hostname');
  }
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(hostname)) {
    reasons.push('IP address hostname');
  }
  if (hostname.split('.').length > 4) {
    reasons.push('Excessive hostname depth');
  }
  if (SUSPICIOUS_HOST_FRAGMENTS.some((piece) => hostname.includes(piece))) {
    reasons.push('Suspicious hostname keywords');
  }

  const full = `${url.pathname}${url.search}`.toLowerCase();
  if (SUSPICIOUS_URL_FRAGMENTS.some((piece) => full.includes(piece))) {
    reasons.push('Suspicious URL path/query keywords');
  }

  return { isPhishy: reasons.length > 0, reasons };
};
