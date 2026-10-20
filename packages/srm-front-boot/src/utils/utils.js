/* eslint-disable no-useless-escape */
import { EventEmitter } from 'events';
import { isNumber } from 'lodash';
import { transformTreeToArr, getSRMAccessCode } from 'hzero-front/lib/utils/utils';
import { findMenuPath } from 'hzero-front/lib/utils/menuTab';
import qs from 'query-string';
import BigNumber from 'bignumber.js';
import { math } from 'choerodon-ui/dataset';
import intl from 'utils/intl';
import Cookies from 'universal-cookie';
import { getDvaApp } from 'hzero-front/lib/utils/iocUtils';

import { downloadFileByAxios } from 'hzero-front/lib/services/api';
import request from 'utils/request';
import { getEnvConfig } from 'utils/iocUtils';
import {
  getResponse,
  filterNullValueObject,
  getAccessToken,
  getCurrentOrganizationId,
  getRequestId,
  isTenantRoleLevel,
  getAmount10CalTax,
} from 'utils/utils';
import { SRM_PLATFORM } from './config';
import { queryApprovaFlag, querySimpleApprovaHistory } from '../services/taskService';

const cookies = new Cookies();
const JD_PREFIX_IMG_URL = 'http://img13.360buyimg.com';

export function jdConvertImg(path, level = 0) {
  return `${JD_PREFIX_IMG_URL}/n${level}/${path}`;
}

export const EventManager = new EventEmitter();

// 打印文件通用方法
export function printFileFromBlob(file) {
  if (!(file instanceof Blob)) {
    console.error('Error: need a file from blob object');
    return;
  }
  // 兼容ie
  if (window.navigator && window.navigator.msSaveOrOpenBlob) {
    window.navigator.msSaveOrOpenBlob(file);
  } else {
    const fileURL = URL.createObjectURL(file);
    const printWindow = window.open(fileURL);
    printWindow.print();
  }
}

export { transformTreeToArr, findMenuPath };

/**
 * 金额计算逻辑
 * @param {{hasTax: boolean, hasMount: boolean, options:{ taxUnitPrice: number, netUnitPrice: number, quantity:number, each: number, taxRate:number, financialPrecision:number, defaultPrecision:number, }}}
 * @param options.hasTax {boolean} 基准价类型是否为含税单价
 * @param options.hasMount {boolean} 单据是否有金额
 * @param options.taxUnitPrice {number}  含税单价 基准价类型为不含税单价可不传
 * @param options.netUnitPrice {number} 不含税单价 基准价类型为含税单价可不传
 * @param options.quantity {number} 数量
 * @param options.each {number} 每 不传或传null默认为1
 * @param options.taxRate {number}  税率  不传或传null默认为0
 * @param options.financialPrecision {number} 金额精度
 * @param options.defaultPrecision {number} 单位精度
 * @param options.caclRule {string} 业务规则定义 'Amount'| 'Price' 默认为'Amount'
 * @param options.stageRule {string} 'normal'| 'asQuantity' | 'asPrice' | 'noQuantity' 默认为'normal'
 * @param options.taxRateType {string} 税率类型  null ｜ IN_PRICE_TAX， 价内税：IN_PRICE_TAX，  默认为null
 * @returns {{taxAmount: number, netAmount: number, taxQuota: number, taxUnitPrice: number, netUnitPrice: number}}
 * @returns calcTaxAmount {number} 含税金额
 * @returns calcNetAmount {number} 不含税金额
 * @returns calcTaxQuota {number} 税额
 * @returns calcTaxUnitPrice {number} 含税单价
 * @returns calcNetUnitPrice {number} 不含税单价
 *
 * @example
 */
export function amountCalculation(options) {
  const _option = options || {};

  const {
    hasTax,
    hasMount,
    quantity,
    each = 1,
    taxRate = 0,
    taxRateType = null,
    caclRule = 'Amount',
    financialPrecision = 10,
    defaultPrecision = 10,
    stageRule = 'normal',
  } = _option;

  const exitConfigTable = getAmount10CalTax();

  // 金额优先时，计算精度放大到10位
  const AMOUNT_PERCISION = 10;

  // 判断税率类型是否为价内税
  const getTaxRateFlag = taxRateType && taxRateType === 'IN_PRICE_TAX';

  // 定义一个函数getBigNumber，接收一个参数val
  // 如果val存在且不为0且不为NaN，则返回一个新的BigNumber对象，否则返回val
  const getBigNumber = (val) =>
    val && !math.isZero(val) && !math.isNaN(val) ? new BigNumber(val) : val;

  // 判断一个数是否为有效数字
  // 判断num是否为数字或者大数，并且不为NaN，并且为有限数
  const isValidNum = (num) =>
    (isNumber(num) || math.isBigNumber(num)) && !math.isNaN(num) && math.isFinite(num);

  // 将数字num保留precision位小数，并返回BigNumber类型的值
  const toFixedNum = (num, precision) => new BigNumber(math.toFixed(num, Number(precision)));

  const bigQuantity = getBigNumber(quantity); // 数量

  const bigEach = getBigNumber(each || 1); // 每

  const bigTaxRate = getBigNumber(taxRate || 0); // 税率

  const _taxRate = math.div(bigTaxRate, 100); // 税率百分比

  // noQuantity：不计算数量(数量不参与计算)
  if (stageRule === 'noQuantity') {
    const { taxUnitPrice } = _option;

    const bigTaxUnitPrice = getBigNumber(taxUnitPrice); // 含税单价

    // 根据基准价类型是否为含税单价，计算不含税单价或含税单价
    if (hasTax) {
      if (!isValidNum(bigTaxUnitPrice)) return {};

      const calcNetUnitPrice = toFixedNum(
        math.div(bigTaxUnitPrice, math.plus(1, _taxRate)), // 含税单价 / (1+税率)
        defaultPrecision
      );

      return { calcNetUnitPrice }; // 不含税单价
    } else {
      const { netUnitPrice } = _option;

      const bigNetUnitPrice = getBigNumber(netUnitPrice); // 不含税单价

      if (!isValidNum(bigNetUnitPrice)) return {};

      const calcTaxUnitPrice = toFixedNum(
        math.multipliedBy(bigNetUnitPrice, math.plus(1, _taxRate)), // 不含税单价 * (1+税率)
        defaultPrecision
      );

      return { calcTaxUnitPrice }; // 含税单价
    }
  } else if (stageRule === 'normal') {
    // 根据基准价类型是否为含税单价，计算不含税金额或含税金额
    if (hasTax) {
      let calcNetAmount; // 不含税金额

      let calcNetUnitPrice; // 不含税单价

      const { taxUnitPrice } = _option;

      const bigTaxUnitPrice = getBigNumber(taxUnitPrice); // 含税单价

      if (!isValidNum(bigQuantity) || !isValidNum(bigTaxUnitPrice)) return {};

      // 单据是否有金额
      if (hasMount) {
        // 含税金额
        const calcTaxAmount = toFixedNum(
          math.div(math.multipliedBy(bigTaxUnitPrice, bigQuantity), bigEach), // （含税单价 * 数量）/ 每
          exitConfigTable ? 10 : financialPrecision
        );

        // 税额
        const calcTaxQuota = toFixedNum(
          getTaxRateFlag
            ? math.multipliedBy(calcTaxAmount, _taxRate) // 含税金额*税率
            : math.multipliedBy(math.div(calcTaxAmount, math.plus(1, _taxRate)), _taxRate), // （含税金额 / (1+税率)）* 税率
          financialPrecision
        );

        // 根据业务规则定义判断 caclRule === 'Amount' 时，按照金额优先计算，否则按照单价优先计算
        if (caclRule === 'Amount') {
          // 含税金额
          const _calcTaxAmount = toFixedNum(
            math.div(math.multipliedBy(bigTaxUnitPrice, bigQuantity), bigEach), // （含税单价 * 数量）/ 每
            AMOUNT_PERCISION
          );

          // 税额
          const _calcTaxQuota = toFixedNum(
            getTaxRateFlag
              ? math.multipliedBy(calcTaxAmount, _taxRate) // 含税金额*税率
              : math.multipliedBy(math.div(calcTaxAmount, math.plus(1, _taxRate)), _taxRate), // （含税金额 / (1+税率)）* 税率
            AMOUNT_PERCISION
          );

          // 不含税金额
          calcNetAmount = toFixedNum(math.minus(calcTaxAmount, calcTaxQuota), financialPrecision); // 不含税金额 = 含税金额 - 税额

          // 不含税单价
          calcNetUnitPrice = toFixedNum(
            math.multipliedBy(
              math.div(math.minus(_calcTaxAmount, _calcTaxQuota), bigQuantity),
              bigEach
            ), // （含税金额 - 税额）/ 数量 / 每
            defaultPrecision
          );
        } else {
          // 不含税单价
          calcNetUnitPrice = toFixedNum(
            math.div(bigTaxUnitPrice, math.plus(1, _taxRate)), // 不含税单价 = 含税单价 / (1+税率)
            defaultPrecision
          );

          // 不含税金额
          calcNetAmount = toFixedNum(
            math.div(math.multipliedBy(calcNetUnitPrice, bigQuantity), bigEach), // 不含税金额 = 不含税单价 * 数量 / 每
            financialPrecision
          );
        }

        return {
          calcTaxAmount, // 含税金额
          calcTaxQuota, // 税额
          calcNetAmount, // 不含税金额
          calcNetUnitPrice: math.isZero(taxRate) ? taxUnitPrice : calcNetUnitPrice, // 不含税单价
        };
      } else {
        // taxRate为0时，含税单价即为不含税单价
        // if (math.isZero(taxRate)) {
        //   return { calcNetUnitPrice: taxUnitPrice };
        // };

        // 不含税单价
        calcNetUnitPrice = toFixedNum(
          math.div(bigTaxUnitPrice, math.plus(1, _taxRate)), // （含税单价 / (1+税率)）
          defaultPrecision
        );

        // taxRate为0时，含税单价即为不含税单价
        return { calcNetUnitPrice: math.isZero(taxRate) ? taxUnitPrice : calcNetUnitPrice };
      }
    } else {
      let calcTaxAmount; // 含税金额

      let calcTaxUnitPrice; // 含税单价

      const { netUnitPrice } = _option;

      const bigNetUnitPrice = getBigNumber(netUnitPrice); // 不含税单价

      if (!isValidNum(bigQuantity) || !isValidNum(bigNetUnitPrice)) return {};

      // 单据是否有金额
      if (hasMount) {
        // 不含税金额
        const calcNetAmount = toFixedNum(
          math.div(math.multipliedBy(bigNetUnitPrice, bigQuantity), bigEach), // 不含税金额 = 不含税单价 * 数量 / 每
          exitConfigTable ? 10 : financialPrecision
        );

        // 税额
        const calcTaxQuota = toFixedNum(
          getTaxRateFlag
            ? math.div(math.multipliedBy(calcNetAmount, _taxRate), math.minus(1, _taxRate)) // 不含税金额*税率/(1-税率)
            : math.multipliedBy(calcNetAmount, _taxRate), // 税额 = 不含税金额 * 税率
          financialPrecision
        );

        if (caclRule === 'Amount') {
          // 不含税金额
          const _calcNetAmount = toFixedNum(
            math.div(math.multipliedBy(bigNetUnitPrice, bigQuantity), bigEach), // 不含税金额 = 不含税单价 * 数量 / 每
            AMOUNT_PERCISION
          );

          // 税额
          const _calcTaxQuota = toFixedNum(
            getTaxRateFlag
              ? math.div(math.multipliedBy(calcNetAmount, _taxRate), math.minus(1, _taxRate)) // 不含税金额*税率/(1-税率)
              : math.multipliedBy(calcNetAmount, _taxRate), // 税额 = 不含税金额 * 税率
            AMOUNT_PERCISION
          );

          // 含税金额
          calcTaxAmount = toFixedNum(math.plus(calcNetAmount, calcTaxQuota), financialPrecision); // 含税金额 = 不含税金额 + 税额

          // 含税单价
          calcTaxUnitPrice = toFixedNum(
            math.multipliedBy(
              math.div(math.plus(_calcNetAmount, _calcTaxQuota), bigQuantity),
              bigEach
            ), // 含税单价 = (不含税金额 + 税额) / 数量 / 每
            defaultPrecision
          );
        } else {
          // 含税单价
          calcTaxUnitPrice = toFixedNum(
            math.multipliedBy(bigNetUnitPrice, math.plus(1, _taxRate)), // 含税单价 = 不含税单价 * (1 + 税率)
            defaultPrecision
          );

          // 含税金额
          calcTaxAmount = toFixedNum(
            math.div(math.multipliedBy(calcTaxUnitPrice, bigQuantity), bigEach), // 含税金额 = 含税单价 * 数量 / 每
            financialPrecision
          );
        }

        return {
          calcNetAmount, // 不含税金额
          calcTaxQuota, // 税额
          calcTaxAmount, // 含税金额
          calcTaxUnitPrice: math.isZero(taxRate) ? netUnitPrice : calcTaxUnitPrice, // 含税单价
        };
      } else {
        calcTaxUnitPrice = toFixedNum(
          math.multipliedBy(bigNetUnitPrice, math.plus(1, _taxRate)), // 含税单价 = 不含税单价 * (1 + 税率)
          defaultPrecision
        );

        // taxRate为0时，含税单价即为不含税单价
        return { calcTaxUnitPrice: math.isZero(taxRate) ? netUnitPrice : calcTaxUnitPrice };
      }
    }
  }
}

/**
 * 通过文件服务器的接口获取可访问的文件URL(带fileToken)
 *
 * @export
 * @param {String} url 上传接口返回的 Url
 * @param {String} bucketName 桶名
 * @param {Number} tenantId 租户Id
 * @param {String} bucketDirectory 文件目录
 * @param {String} storageCode 存储配置编码
 */
// @ts-ignore
export function getAttachmentUrlWithToken(
  url,
  bucketName,
  tenantId,
  bucketDirectory,
  storageCode,
  _fileToken,
  enableImageWatermark,
  isAttachmentsInControl = true,
  options
) {
  const { _previewToken, isImg, businessParams } = options || {};
  const accessToken = getAccessToken();
  const requestId = getRequestId();
  const params = qs.stringify(
    filterNullValueObject({
      bucketName,
      storageCode,
      _fileToken: isAttachmentsInControl ? _fileToken : undefined,
      _downloadToken: isAttachmentsInControl ? undefined : _fileToken,
      access_token: accessToken,
      'H-Request-Id': requestId,
      directory: bucketDirectory,
      enableImageWatermark,
      _previewToken,
      ...(businessParams || {}),
    })
  );
  const { HZERO_FILE } = getEnvConfig();
  const version = isAttachmentsInControl ? '/v1' : '/v2';
  const middleUrl = isAttachmentsInControl ? '/files/download-with-token' : '/files/download';
  // v2图片预览且有_previewToken
  if (isImg && version === '/v2' && _previewToken) {
    return !isTenantRoleLevel()
      ? `${HZERO_FILE}${version}/preview/img?${params}&url=${encodeURIComponent(url)}`
      : `${HZERO_FILE}${version}/${getCurrentOrganizationId()}/preview/img?${params}&url=${encodeURIComponent(
          url
        )}`;
  }
  const newUrl = !isTenantRoleLevel()
    ? `${HZERO_FILE}${version}${middleUrl}?${params}&url=${encodeURIComponent(url)}`
    : `${HZERO_FILE}${version}/${getCurrentOrganizationId()}${middleUrl}?${params}&url=${encodeURIComponent(
        url
      )}`;
  return newUrl;
}

// 获取浏览器信息
export function getBrowserInfo() {
  const ua = window.navigator.userAgent;
  if (/trident.+rv[: ]([\w\.]{1,9})\b.+like Gecko/i.test(ua)) {
    return {
      browser: 'IE',
      version: 11,
      standard: false,
    };
  } else if (/MicroMessenger\/(\S+)/i.test(ua)) {
    return {
      browser: 'WeChart',
      version: RegExp.$1,
      standard: parseFloat(RegExp.$1) >= 6.0,
    };
  } else if (/metasr[\s|\/]([\w\.]+)/i.test(ua)) {
    if (/SE[\s|\/](\w)/i.test(ua)) {
      return {
        browser: 'Sougou',
        version: RegExp.$1,
        standard: parseFloat(RegExp.$1) >= 2,
      };
    }
  } else if (/QQBrowser\/(\S+)/i.test(ua)) {
    return {
      browser: 'QQBrowser',
      version: RegExp.$1,
      standard: parseFloat(RegExp.$1) >= 9.3,
    };
  } else if (/rv:([^)]+)\) Gecko\/\d{8}/i.test(ua)) {
    if (/Firefox\/(\S+)/.test(ua)) {
      return {
        browser: 'Firefox',
        version: RegExp.$1,
        standard: parseFloat(RegExp.$1) >= 68,
      };
    }
  } else if (/edg(?:e|ios|a)?\/(\S+)/i.test(ua)) {
    return {
      browser: 'Edge',
      version: RegExp.$1,
      standard: true,
    };
  } else if (/SLBChan\/(\S+)/i.test(ua)) {
    return {
      browser: 'Lenovo',
      version: RegExp.$1,
      standard: parseFloat(RegExp.$1) >= 6.0,
    };
  } else if (/OPR\/(\S+)/i.test(ua)) {
    return {
      browser: 'Opera',
      version: RegExp.$1,
      standard: parseFloat(RegExp.$1) >= 60,
    };
  } else if (/UBrowser\/(\S+)/i.test(ua)) {
    return {
      browser: 'UC',
      version: RegExp.$1,
      standard: parseFloat(RegExp.$1) >= 6.2,
    };
  } else if (
    /\(KHTML, like Gecko\) Chrome\/(\S+)/i.test(ua) ||
    /\(KHTML, like Gecko\) HeadlessChrome\/(\S+)/i.test(ua)
  ) {
    return {
      browser: 'Chrome',
      version: RegExp.$1,
      standard: parseFloat(RegExp.$1) >= 75,
    };
  } else if (/Safari\/(\S+)/i.test(ua) && /Version\/(\S+)/i.test(ua)) {
    return {
      browser: 'Safari',
      version: RegExp.$1,
      standard: parseFloat(RegExp.$1) >= 13,
    };
  }

  return {
    browser: 'unknown',
    version: 'unknown',
    standard: false,
  };
}

const cnNums = ['零', '壹', '贰', '叁', '肆', '伍', '陆', '柒', '捌', '玖']; // 汉字的数字
const cnIntRadice = ['', '拾', '佰', '仟']; // 基本单位
const cnIntUnits = ['', '万', '亿', '兆']; // 对应整数部分扩展单位
const cnDecUnits = ['角', '分']; // 对应小数部分单位
const cnInteger = '整'; // 整数金额时后面跟的字符
const cnIntLast = '元'; // 整型完以后的单位
const maxNum = new BigNumber('999999999999999.99'); // 最大处理的数字
/**
 * 金额转大写
 *
 * @export
 * @param {number | BigNumber} amount 金额
 * @param {string | undefined} prefix 前缀
 */
export function capitalAmount(amount, prefix = '') {
  if (math.gt(amount, maxNum)) {
    throw new Error(`${amount} is too big.`);
  }
  if (math.isZero(amount)) {
    return `${prefix}${cnNums[0]}${cnIntLast}${cnInteger}`;
  }
  let chineseStr = ''; // 输出的中文金额字符串
  let symbol = ''; // 正负值标记
  if (math.isNegative(amount)) {
    amount = math.negated(amount);
    symbol = '负';
  }
  const moneyStr = new BigNumber(amount).toFixed(2); // 转换为字符串
  const [
    integerNum, // 金额整数部分
    part2,
  ] = moneyStr.split('.');
  const decimalNum = part2 === '00' ? '' : part2; // 金额小数部分
  if (parseInt(integerNum, 10) > 0) {
    // 获取整型部分转换
    let zeroCount = 0;
    const intLen = integerNum.length;
    for (let i = 0; i < intLen; i++) {
      const n = integerNum.charAt(i);
      const p = intLen - i - 1;
      const m = p % 4;
      if (n === '0') {
        zeroCount++;
      } else {
        if (zeroCount > 0) {
          chineseStr += cnNums[0];
        }
        zeroCount = 0; // 归零
        chineseStr += cnNums[parseInt(n, 10)] + cnIntRadice[m];
      }
      if (m === 0 && zeroCount < 4) {
        chineseStr += cnIntUnits[p / 4];
      }
    }
    chineseStr += cnIntLast;
    // 整型部分处理完毕
  }
  if (decimalNum !== '') {
    // 小数部分
    const decLen = decimalNum.length;
    let zeroCount = 0;
    for (let i = 0; i < decLen; i++) {
      const n = decimalNum.charAt(i);
      if (n === '0') {
        zeroCount++;
      } else {
        if (zeroCount > 0) {
          chineseStr += cnNums[0];
        }
        zeroCount = 0; // 归零
        chineseStr += cnNums[Number(n)] + cnDecUnits[i];
      }
    }
  }
  if (chineseStr === '') {
    chineseStr += cnNums[0] + cnIntLast + cnInteger;
  } else if (decimalNum === '') {
    chineseStr += cnInteger;
  }

  return `${prefix}${symbol}${chineseStr}`;
}

// base64解码
export function decodeString(str, type) {
  if (type === 'decode') {
    return decodeURIComponent(atob(str));
  } else {
    return decodeURIComponent(
      atob(str)
        .split('')
        .map((c) => {
          return `%${`00${c.charCodeAt(0).toString(16)}`.slice(-2)}`;
        })
        .join('')
    );
  }
}

/**
 * @param {string} bucketName
 * @param {string} bucketDirectory
 * @returns {Promise<number|undefined>}
 */
export function fetchRemoteFileSizeLimit(bucketName, bucketDirectory, useChunk) {
  if (!isTenantRoleLevel() || !bucketName) return Promise.resolve();
  const allCache = fetchRemoteFileSizeLimit.cache;
  const key = `${bucketName || ''}/${bucketDirectory || ''}`;
  if (allCache.get(key)) {
    const finalSize = allCache.get(key);
    return Promise.resolve(allCache.get(key));
  } else {
    const { HZERO_FILE } = getEnvConfig();
    return request(
      `${HZERO_FILE}/v1/${getCurrentOrganizationId()}/upload-configs/by-directory-bucket`,
      {
        method: 'GET',
        query: { bucketName, directory: bucketDirectory },
      }
    ).then((res) => {
      if (getResponse(res)) {
        const { storageUnit, storageSize, maxStorageUnit, maxStorageSize } = res;
        let finalSize;
        let maxFinalSize;
        if (maxStorageUnit === 'MB') maxFinalSize = maxStorageSize * 1024 * 1024;
        else if (maxStorageUnit === 'KB') maxFinalSize = maxStorageSize * 1024;
        if (storageUnit === 'MB') finalSize = storageSize * 1024 * 1024;
        else if (storageUnit === 'KB') finalSize = storageSize * 1024;
        if (finalSize > maxFinalSize) {
          finalSize = useChunk ? finalSize : maxFinalSize;
        }
        allCache.set(key, finalSize);
        return finalSize;
      }
    });
  }
}
/**
 * @type {Map<string, number>}
 * number的单位为B
 */
fetchRemoteFileSizeLimit.cache = new Map();

// 校验浏览器能否支持通过 window.open 打开 blob:// 地址的窗口
export function checkPrintWindow() {
  const { userAgent } = window.navigator;
  // 目前仅飞书内置浏览出现此问题，此处为排除飞书浏览器
  return !/Lark\/(\S+)/i.test(userAgent) && !/DingTalk/i.test(userAgent);
}

// 生成 pdf 文件预览地址
export async function getPdfPreviewUrl({ fileUrl, bucketName, fileToken }) {
  // 默认5分钟有效期
  const _sac = await getSRMAccessCode({ expires: 300 });
  const { HZERO_HFLE } = getEnvConfig();
  return `${HZERO_HFLE}/v1/${getCurrentOrganizationId()}/file-preview-with-token?url=${fileUrl}&bucketName=${bucketName}&_fileToken=${fileToken}&_sac=${_sac}`;
}

const vierBase = ['không', 'một', 'hai', 'ba', 'bốn', 'năm', 'sáu', 'bảy', 'tám', 'chín'];
const vierBaseTen = [
  'mười',
  'hai mươi',
  'ba mươi',
  'bốn mươi',
  'năm mươi',
  'sáu mươi',
  'bảy mươi',
  'tám mươi',
  'chín mươi',
];
const vierBaseHundred = [
  'không trăm',
  'một trăm',
  'hai trăm',
  'ba trăm',
  'bốn trăm',
  'năm trăm',
  'sáu trăm',
  'bảy trăm',
  'tám trăm',
  'chín trăm',
];

const getVIETen = (number) => {
  const array = `${number}`.split('');
  const first = parseInt(array[0], 10);
  const second = parseInt(array[1], 10);
  if (second === 0) {
    return vierBaseTen[first - 1];
  }
  if (second === 5) {
    return `${vierBaseTen[first - 1]} lăm`;
  }
  if (second === 4) {
    return `${vierBaseTen[first - 1]} tư`;
  }
  if (second === 1) {
    if (first === 1) {
      return `${vierBaseTen[first - 1]} một`;
    }
    return `${vierBaseTen[first - 1]} mốt`;
  }

  return `${vierBaseTen[first - 1]} ${vierBase[second]}`;
};

const getVIEHundred = (number) => {
  const array = `${number}`.split('');
  const first = parseInt(array[0], 10);
  const second = parseInt(array[1], 10);
  const third = parseInt(array[2], 10);
  if (second > 0) {
    return `${vierBaseHundred[first]} ${getVIETen(`${second}${third}`)}`;
  }
  if (third === 0) {
    return `${vierBaseHundred[first]}`;
  }
  if (third === 4) {
    return `${vierBaseHundred[first]} linh tư`;
  }
  return `${vierBaseHundred[first]} linh ${vierBase[third]}`;
};

const getVIEThousand = (number) => {
  const reverseArray = `${number}`.split('').reverse();
  const afterNumber = reverseArray.slice(0, 3).reverse().join('');
  const beforeNumber = parseInt(reverseArray.slice(3, reverseArray.length).reverse().join(''), 10);
  const beforeLength = `${beforeNumber}`.length;

  let afterText = '';

  if (parseInt(afterNumber, 10) >= 1) {
    afterText = getVIEHundred(afterNumber);
  }

  if (beforeLength === 1) {
    return `${vierBase[beforeNumber]} nghìn ${afterText}`;
  }

  if (beforeLength === 2) {
    return `${getVIETen(beforeNumber)} nghìn ${afterText}`;
  }
  return `${getVIEHundred(beforeNumber)} nghìn ${afterText}`;
};

const getVIEMillion = (number) => {
  const reverseArray = `${number}`.split('').reverse();
  const afterNumber = reverseArray.slice(0, 6).reverse().join('');
  const beforeNumber = parseInt(reverseArray.slice(6, reverseArray.length).reverse().join(''), 10);
  const beforeLength = `${beforeNumber}`.length;

  let afterText = '';
  if (parseInt(afterNumber, 10) > 999) {
    afterText = getVIEThousand(afterNumber);
  } else if (parseInt(afterNumber, 10) <= 999 && parseInt(afterNumber, 10) >= 1) {
    afterText = getVIEHundred(`${afterNumber}`.split('').slice(3, 6).join(''));
  }

  if (beforeLength === 1) {
    return `${vierBase[beforeNumber]} triệu ${afterText}`;
  }

  if (beforeLength === 2) {
    return `${getVIETen(beforeNumber)} triệu ${afterText}`;
  }

  return `${getVIEHundred(beforeNumber)} triệu ${afterText}`;
};

const getVIEBillion = (number) => {
  const reverseArray = `${number}`.split('').reverse();

  const afterNumber = reverseArray.slice(0, 9).reverse().join('');

  const beforeNumber = parseInt(reverseArray.slice(9, reverseArray.length).reverse().join(''), 10);

  let afterText = '';
  if (parseInt(afterNumber, 10) > 999999 && parseInt(afterNumber, 10) <= 999999999) {
    afterText = getVIEMillion(afterNumber);
  } else if (parseInt(afterNumber, 10) <= 999999 && parseInt(afterNumber, 10) > 999) {
    afterText = getVIEThousand(`${afterNumber}`.split('').slice(3, 9).join(''));
  } else if (parseInt(afterNumber, 10) <= 999 && parseInt(afterNumber, 10) >= 1) {
    afterText = getVIEHundred(`${afterNumber}`.split('').slice(6, 9).join(''));
  }

  const beforeLength = `${beforeNumber}`.length;
  if (beforeLength === 1) {
    return `${vierBase[beforeNumber]} tỷ ${afterText}`;
  }

  if (beforeLength === 2) {
    return `${getVIETen(beforeNumber)} tỷ ${afterText}`;
  }

  if (beforeLength === 3) {
    return `${getVIEHundred(beforeNumber)} tỷ ${afterText}`;
  }

  if (beforeLength > 3 && beforeLength <= 6) {
    return `${getVIEThousand(beforeNumber)} tỷ ${afterText}`;
  }

  if (beforeLength > 6 && beforeLength <= 9) {
    return `${getVIEMillion(beforeNumber)} tỷ ${afterText}`;
  }
};

// const addVIESuffix = (result = "", suffix = "") => {
//   let array = result.split(" ").reverse();
//   const tram = array.findIndex((e) => e === "trăm");
//   const nghin = array.findIndex((e) => e === "nghìn");
//   const trieu = array.findIndex((e) => e === "triệu");
//   const ty = array.findIndex((e) => e === "tỷ");

//   if (ty !== -1 && !!suffix) {
//     array.splice(ty, 1, `${array[ty]} ${suffix}`);
//   }
//   if (trieu !== -1 && !!suffix) {
//     array.splice(trieu, 1, `${array[trieu]} ${suffix}`);
//   }
//   if (nghin !== -1 && !!suffix && tram !== -1) {
//     array.splice(nghin, 1, `${array[nghin]} ${suffix}`);
//   }
//   return array.reverse().join(" ");
// }

export const capitalAmountByVIE = (argNumber, suffix = '') => {
  let number = argNumber;
  try {
    // 如果number既不是大数字并且不是常规数字，先尝试做一次大数字转换，如果结果为NaN，再报错
    if (!math.isBigNumber(number) && !isNumber(number)) {
      number = new BigNumber(number);
      if (math.isNaN(number)) throw new Error(`${number} is not a number`);
    }

    if (math.gt(number, maxNum)) {
      throw new Error(`${number} is too big.`);
    }

    if (number < 0) {
      return `âm ${capitalAmountByVIE(math.abs(number))}`;
    }

    number = math.round(number);

    const { length } = `${number}`;

    let result;

    if (length === 1) {
      result = vierBase[number];
    }
    if (length === 2) {
      result = getVIETen(number);
    }
    if (length === 3) {
      result = getVIEHundred(number);
    }
    if (length > 3 && length <= 6) {
      result = getVIEThousand(number);
    }
    if (length > 6 && length <= 9) {
      result = getVIEMillion(number);
    }
    if (length > 9) {
      result = getVIEBillion(number);
    }
    if (suffix) {
      return `${result} ${suffix}`.toUpperCase();
      // return addVIESuffix(result, suffix).toUpperCase();
    }
    return result.toUpperCase();
  } catch (error) {
    console.error('error', error);
  }
};

export const getLovPatching = () => {
  return [
    {
      code: 'SSLM.SUPPLIER_CHOOSE',
      name: 'supplierChooseFlag',
      parseValue: (value) => {
        let result = 0;
        if (!value) {
          return 0;
        }
        if (value.startsWith('P:')) {
          result = 1;
        } else if (value.startsWith('E:')) {
          result = 2;
        }
        return result;
      },
      options: [
        {
          value: 0,
          meaning: intl
            .get('hzero.common.pagination.patching.supplierChooseFlag.meaning1')
            .d('精准查询'),
          description: intl
            .get('hzero.common.pagination.patching.supplierChooseFlag.desc1')
            .d('按所选供应商精确查询，检索与所选供应商信息一致的单据'),
        },
        {
          value: 1,
          meaning: intl
            .get('hzero.common.pagination.patching.supplierChooseFlag.meaning2')
            .d('按平台供应商查询'),
          description: intl
            .get('hzero.common.pagination.patching.supplierChooseFlag.desc2')
            .d('支持按平台供应商模糊查询，检索所有包含该平台供应商的历史单据'),
        },
        {
          value: 2,
          meaning: intl
            .get('hzero.common.pagination.patching.supplierChooseFlag.meaning3')
            .d('按本地供应商查询'),
          description: intl
            .get('hzero.common.pagination.patching.supplierChooseFlag.desc3')
            .d('支持按本地供应商模糊查询，检索所有包含该本地供应商的历史单据'),
        },
      ],
    },
  ];
};

export async function removeFile(params) {
  const { urls, isAttachmentsInControl, ...otherParams } = params;
  const tenantId = getCurrentOrganizationId();
  const version = isAttachmentsInControl ? '/v1' : '/v2';
  const reqUrl = isTenantRoleLevel()
    ? `${getEnvConfig().HZERO_FILE}${version}/${tenantId}/files/delete-by-uuidurl`
    : `${getEnvConfig().HZERO_FILE}${version}/files/delete-by-uuidurl`;
  return request(reqUrl, {
    method: 'POST',
    body: urls,
    query: filterNullValueObject(otherParams),
  });
}

export const getHomeDefaultLanguage = async () => {
  let lang = cookies.get('language');
  if (!lang) {
    const homeConfig = await request(`${SRM_PLATFORM}/v1/portal-layouts/layout-pub`, {
      method: 'GET',
      headers: {
        // 跑本地测试时可写死portal-host, 如：zhenyun.dev.isrm.going-link.com
        'portal-host': window.location.host,
      },
    });
    if (getResponse(homeConfig) && homeConfig && homeConfig.dataJson) {
      const { cardContent = {} } =
        JSON.parse(homeConfig.dataJson).find((card) => card.cardCategory === 'Nav') || {};
      lang =
        cardContent.useBrowserLanguage === 1 && homeConfig.browserLanguage
          ? homeConfig.browserLanguage
          : cardContent.defaultLanguage;
      if (!lang) {
        lang = 'zh_CN';
      }
      const expires = new Date();
      expires.setTime(new Date().getTime() + 365 * 24 * 60 * 60 * 1000);
      if (!cookies.get('language')) {
        setSecureCookie('language', lang, { path: '/', expires });
      }
    }
  }
  lang = lang || 'zh_CN';
  if (
    getDvaApp()?._store?.getState()?.global &&
    lang !== getDvaApp()?._store?.getState()?.global?.language
  ) {
    getDvaApp()._store.dispatch({
      type: 'global/publicLayoutLanguage',
      payload: {
        language: lang,
      },
    });
  }
  return lang;
};

/**
 * @param {array} bussinessKeys 多个bussinessKey
 * @return {map} 返回每个bussinessKey对应的taskId和processInstanceId,若为null表示bussinessKey对应的流程不可审批
 */
export const queryBatchApprovaFlag = async (bussinessKeys) => {
  const result = {};
  bussinessKeys.forEach((key) => {
    result[key] = null;
  });
  if (bussinessKeys && bussinessKeys.length) {
    const res = await queryApprovaFlag(bussinessKeys);
    if (getResponse(res) && res) {
      bussinessKeys.forEach((key) => {
        const value = res[key];
        if (value && value.approval) {
          result[key] = {
            processInstanceId: value.processInstanceId,
            taskId: value.taskId,
          };
        }
      });
    }
  }
  return result;
};

/**
 * @param {array} bussinessKeys 多个bussinessKey
 * @return {map} 返回每个bussinessKey对应的流程的简易审批记录，为null表示无审批记录
 */
export const queryBatchSimpleApprovalHistory = async (bussinessKeys) => {
  const result = {};
  bussinessKeys.forEach((key) => {
    result[key] = null;
  });
  if (bussinessKeys && bussinessKeys.length) {
    const res = await querySimpleApprovaHistory(bussinessKeys);
    if (getResponse(res) && res) {
      bussinessKeys.forEach((key) => {
        const process = res[key];
        if (process) {
          let lineList = [];
          if (process.approvalLineList && process.approvalLineList.length) {
            lineList = process.approvalLineList;
          }
          if (process.processStatus === 'SUSPENDED') {
            // 若头状态是挂起，最后一条记录是审批中时，去掉该记录
            if (lineList.length && lineList[lineList.length - 1]) {
              lineList[lineList.length - 1].headerAction = 'SUSPENDED';
            }
          }
          result[key] = lineList;
        }
      });
    }
  }
  return result;
};

export function downLoadFile(file) {
  if (!file) {
    return;
  }
  let queryParams = [];
  const { fileUrl, bucketName, bucketDirectory, storageCode, _fileToken, skipPdfWatermark } = file;
  const url = getAttachmentUrlWithToken(
    fileUrl,
    bucketName,
    getCurrentOrganizationId(),
    bucketDirectory,
    storageCode,
    _fileToken
  );
  const paramStr = url.split('?')[1];
  if (paramStr) {
    queryParams = paramStr
      .split('&')
      .map((param) => {
        const [name, value] = param.split('=');
        return { name, value };
      })
      .filter((item) => !['access_token'].includes(item.name));
  }
  if (skipPdfWatermark) {
    queryParams.push({
      name: 'skipPdfWatermark',
      value: skipPdfWatermark,
    });
  }
  downloadFileByAxios({ requestUrl: url, queryParams, method: 'GET' });
}
window.SRM_downLoadFile = downLoadFile;

export function setSecureCookie(key, value, options = {}) {
  cookies.set(key, value, { sameSite: 'none', secure: true, ...options });
  if (!cookies.get(key)) {
    cookies.set(key, value, { secure: true, ...options });
  }
  if (!cookies.get(key)) {
    cookies.set(key, value, { ...options });
  }
}

export const newUrlPreviewList = [
  'dot',
  'dotx',
  'dotm',
  'odt',
  'fodt',
  'ott',
  'rtf',
  'txt',
  'html',
  'htm',
  'mht',
  'djvu',
  'fb2',
  'epub',
  'xps',
  'xls',
  'xlsx',
  'xlsm',
  'xlt',
  'xltx',
  'xltm',
  'ods',
  'fods',
  'ots',
  'csv',
  'pps',
  'ppsx',
  'ppsm',
  'ppt',
  'pptx',
  'pptm',
  'pot',
  'potx',
  'potm',
  'odp',
  'fodp',
  'otp',
  'zip',
  'rar',
  '7z',
  'tar',
];
export const imgs = ['png', 'gif', 'jpg', 'webp', 'jpeg', 'bmp', 'svg'];
export const supportPreviewList = [
  'doc',
  'docx',
  'docm',
  'dot',
  'dotx',
  'dotm',
  'odt',
  'fodt',
  'ott',
  'rtf',
  'txt',
  'html',
  'htm',
  'mht',
  'pdf',
  'djvu',
  'fb2',
  'epub',
  'xps',
  'xls',
  'xlsx',
  'xlsm',
  'xlt',
  'xltx',
  'xltm',
  'ods',
  'fods',
  'ots',
  'csv',
  'pps',
  'ppsx',
  'ppsm',
  'ppt',
  'pptx',
  'pptm',
  'pot',
  'potx',
  'potm',
  'odp',
  'fodp',
  'otp',
  'zip',
  'rar',
  '7z',
  'tar',
];
