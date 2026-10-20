import qs from 'qs';

const prefixImgUrl = 'https://img13.360buyimg.com';
const zkhImgUrl = 'https://pathfinder-private.oss-cn-shanghai.aliyuncs.com/'; // 震坤行图片头

export function convertImg(path, level = 0, sourcefrom = 'JD') {
  if (sourcefrom === 'JD') {
    return `${prefixImgUrl}/n${level}/${path}`;
  } else if (sourcefrom === 'ZKH') {
    return `${zkhImgUrl}${path.substr(4)}`;
  } else if (sourcefrom === 'CATA' || sourcefrom === 'CG') {
    return path;
  }
}

export function filterNullGetUrl(url, params) {
  return generateUrlWithGetParam(url, filterNullValueObject(params));
}

/**
 * generateUrlWithGetParam 将参数拼接到url
 * @param {*} url
 * @param {*} 查询参数
 */
export function generateUrlWithGetParam(url, params) {
  let newUrl = url;
  if (params && Object.keys(params).length >= 1) {
    const newParams = params;
    if (Object.keys(newParams).length >= 1) {
      newUrl += `${url.indexOf('?') >= 0 ? '&' : '?'}${qs.stringify(newParams)}`;
    }
  }
  return newUrl;
}

/**
 * 过滤空字段
 * @param {*} obj
 */
export function filterNullValueObject(obj) {
  const result = {};
  if (obj && Object.keys(obj).length >= 1) {
    Object.keys(obj).forEach(key => {
      if (key && obj[key] !== undefined && obj[key] !== '' && obj[key] !== null) {
        // 如果查询的条件不为空
        if (obj[key].length === 0) {
          return;
        }
        result[key] = obj[key];
      }
    });
  }
  return result; // 返回查询条件
}
