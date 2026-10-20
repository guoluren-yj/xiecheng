// base64解码
export function getDecode(str) {
  return decodeURIComponent(
    atob(str)
      .split('')
      .map((c) => {
        return `%${`00${c.charCodeAt(0).toString(16)}`.slice(-2)}`;
      })
      .join('')
  );
}
