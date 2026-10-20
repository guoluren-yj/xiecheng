import moment from 'moment';
import { math } from 'choerodon-ui/dataset';
import { NumberField } from 'choerodon-ui/pro';
import { stringify } from 'querystring';
import { isNil } from 'lodash';

import intl from 'utils/intl';
import { HZERO_FILE } from 'utils/config';
import notification from 'utils/notification';
import {
  getAccessToken,
  getCurrentOrganizationId,
  getCurrentLanguage,
  filterNullValueObject,
  getRequestId,
  createPagination,
} from 'utils/utils';
import { DEFAULT_DATE_FORMAT } from 'utils/constants';
// import { getEnvConfig } from 'utils/iocUtils';

const lang = getCurrentLanguage();
const localCode = getCurrentLanguage().split('_')[0];
const accessToken = getAccessToken();
const tenantId = getCurrentOrganizationId();
const bucketName = window.$$env.PRIVATE_BUCKET || 'private-bucket';

/**
 * 接口返回数据处理，添加自允许在单词内换行
 * @param {接口返回数据} response
 */

export function getResponse(response) {
  if (response && response.failed === true) {
    const msg = {
      message: intl.get('hzero.common.notification.error').d('操作失败'),
      description: response.message,
      style: {
        maxHeight: '600px',
        wordBreak: 'break-all',
        overflow: 'auto',
      },
    };
    switch (response.type) {
      case 'info':
        notification.info(msg);
        break;
      case 'warn':
        notification.warning(msg);
        break;
      case 'error':
      default:
        notification.error(msg);
        break;
    }
  } else {
    return response;
  }
}

export function thousandsRender(value) {
  if (math.isNaN(value) || value === 0) return value;
  return NumberField.format(value, localCode, {
    maximumFractionDigits: 20,
    minimumFractionDigits: math.dp(value) || 0,
  });
}

export function dateRangeTransform(dateRange, isFormat = false) {
  const transToArr = () => {
    switch (dateRange) {
      case 'ALL TIME':
        return [undefined, undefined];
      case 'LAST MONTH':
        return [moment().subtract(1, 'month'), moment()];
      case 'LAST THREE MONTHS':
        return [moment().subtract(3, 'month'), moment()];
      case 'RECENT HALF YEAR':
        return [moment().subtract(6, 'month'), moment()];
      case 'IN RECENT YAER':
        return [moment().subtract(12, 'month'), moment()];
      case 'LAST MONTH AND BEFORE':
        return [undefined, moment().subtract(1, 'month').endOf('month')];
      case 'LAST MONTH TO 25':
        return [moment().subtract(1, 'month').date(26), moment().date(25)];
      default:
        return [moment().subtract(6, 'month'), moment()];
    }
  };
  if (isFormat) {
    const start = transToArr()[0]?.format(DEFAULT_DATE_FORMAT) || '';
    const end = transToArr()[1]?.format(DEFAULT_DATE_FORMAT) || '';
    const sign = dateRange === 'ALL TIME' ? '' : ',';
    return start + sign + end;
  } else {
    return transToArr();
  }
}

// 个性化附件必填校验getEditTableData不支持，需改造
export const getEditTableAllData = async (dataSource) => {
  const res = await Promise.all(
    (dataSource || []).map((item) =>
      (() =>
        new Promise((resolve, reject) => {
          if (item.$form && item._status) {
            item.$form.validateFieldsAndScroll(
              {
                scroll: {
                  allowHorizontalScroll: true,
                },
                force: true,
              },
              (err, recordData) => {
                if (!err) {
                  const { $form, ...otherProps } = item;
                  resolve({
                    ...otherProps,
                    ...recordData,
                  });
                } else {
                  reject(err);
                }
              }
            );
          }
        }))()
    )
  );
  return res;
};

export async function previewPdf(fileUrl, paramBucketName = bucketName) {
  const pdfParams = stringify(
    filterNullValueObject({
      bucketName: paramBucketName,
      access_token: accessToken,
      url: encodeURIComponent(fileUrl),
    })
  );
  const previewUrl = `${HZERO_FILE}/v1/${tenantId}/file-preview/by-url?${pdfParams}`;
  window.open(previewUrl);
}

export function getAttachmentUrlWithToken(url, flag = false) {
  const requestId = getRequestId();
  const params = stringify(
    filterNullValueObject({
      bucketName,
      access_token: accessToken,
      'H-Request-Id': requestId,
    })
  );
  // const { HZERO_FILE } = getEnvConfig();
  const newUrl = `${HZERO_FILE}/v1/${getCurrentOrganizationId()}/files/download-with-token?${params}&url=${encodeURIComponent(
    url
  )}`;
  if (flag) window.open(newUrl, '_self');
  else window.open(newUrl);
}

// ds金额字段formatter
export function amountFormatterOptions({ record, name }) {
  const { [name]: value, amountPrecision } = record.get([name, 'amountPrecision']);
  return numberFormatterOptions(value, amountPrecision);
}

// ds单价字段formatter
export function priceFormatterOptions({ record, name }) {
  const { [name]: value, pricePrecision } = record.get([name, 'pricePrecision']);
  return numberFormatterOptions(value, pricePrecision);
}

// 数字formatter
export function numberFormatterOptions(value, precision) {
  if (math.isNaN(value) || math.isZero(value)) return;
  const options = { maximumFractionDigits: 20 };
  if (!isNil(precision)) Object.assign(options, { minimumFractionDigits: precision });
  return { lang, options };
}

// 金额字段渲染，千分位+补零
export function amountRender({ value, record }) {
  return formatNumber(value, record?.get('amountPrecision'));
}

// 单价字段渲染，千分位+补零
export function priceRender({ value, record }) {
  return formatNumber(value, record?.get('pricePrecision'));
}

// 数字渲染，千分位
export function numberRender({ value }) {
  return formatNumber(value);
}

export function formatNumber(value, precision) {
  if (math.isNaN(value) || math.isZero(value) || !math.isValidNumber(value)) return value;
  const options = { maximumFractionDigits: 20 };
  if (!isNil(precision)) Object.assign(options, { minimumFractionDigits: precision });
  return NumberField.format(value, lang, options);
}

export function* fetchTotalCountGen(options) {
  const { payload, firstResult, queryRequest, setPagination } = options || {};
  const { needCountFlag } = firstResult || {};
  if (!payload || needCountFlag !== 'Y') return;
  const response = yield queryRequest({ ...payload, onlyCountFlag: 'Y' });
  const result = getResponse(response);
  if (!result) return;
  const pagination = createPagination(result);
  if (setPagination) {
    yield setPagination(pagination);
  }
  return pagination;
}
