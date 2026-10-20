import uuidv4 from 'uuid/v4';

function replaceAll(targetString, s1, s2) {
  if (typeof targetString !== 'string') return '';
  return targetString.replace(new RegExp(s1, 'gm'), s2);
}

/**
 * 返回一个32位去除连字符的随机版uuid
 * @returns 32位uuid
 */
function uuidv4hyphenless() {
  return replaceAll(uuidv4(), '-', '') as string;
}

export default uuidv4hyphenless;
