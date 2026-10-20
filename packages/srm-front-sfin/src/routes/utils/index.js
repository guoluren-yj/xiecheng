export function decimalPointAccuracy(num, precision) {
  if (typeof num === 'undefined' || typeof num === 'object') {
    return num;
  }

  if (
    (typeof num === 'number' && typeof precision === 'undefined') ||
    typeof precision === 'object'
  ) {
    return Number(num).toString();
  }

  const arr = Number(num).toString().split('.');
  const oldLength = arr[1] ? arr[1].length : 0;

  if (oldLength >= precision) {
    // 四舍五入
    return precision !== 0 ? Number(`${arr[0]}.${arr[1].slice(0, precision)}`).toString() : arr[0];
  }

  return Number(num).toString();
}
