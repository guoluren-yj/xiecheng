import getDefaultDocument from './getDefaultDocument';

export default function getFullUrl(url) {
  const doc = getDefaultDocument();
  if (!doc || !url) {
    return '';
  }
  const a = doc.createElement('a');
  a.href = url;
  return a.href;
}
