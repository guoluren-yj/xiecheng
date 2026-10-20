const headerKeyRe = new RegExp('(cookie|auth|jwt|token|key|ticket|secret|credential|session|password)', 'i');
const headerValueRe = new RegExp('(bearer|session)', 'i');

export default function isSensitiveHeader(e, t) {
  return !(!e || !t) && (headerKeyRe.test(e) || headerValueRe.test(t));
}
