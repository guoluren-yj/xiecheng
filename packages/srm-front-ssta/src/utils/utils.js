/*
 * @Description: 通用工具方法
 * @Date: 2020-07-24 11:09:36
 * @author: zhangyongxuan <yongxuan.zhang@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2020, Hand
 */
import React, { createElement } from 'react';
import { stringify } from 'querystring';
import pathToRegexp from 'path-to-regexp';
import { Modal, NumberField } from 'choerodon-ui/pro';
import { Icon } from 'choerodon-ui';
import moment from 'moment';
import intl from 'utils/intl';
import { HZERO_FILE, HZERO_PLATFORM } from 'utils/config';
import { math } from 'choerodon-ui/dataset';
import {
  isNil,
  pick,
  concat,
  difference,
  isEqual,
  isUndefined,
  isNull,
  isEmpty,
  defaults,
  omit,
  isObject,
  isString,
} from 'lodash';
import { getDvaApp } from 'utils/iocUtils';
import notification from 'utils/notification';
import EmbedPage from '_components/EmbedPage';
import { DATETIME_MAX, DATETIME_MIN, DEFAULT_DATE_FORMAT } from 'utils/constants';
import {
  getAccessToken,
  getCurrentOrganizationId,
  getCurrentLanguage,
  filterNullValueObject,
  getRequestId,
  getAttachmentUrl,
} from 'utils/utils';
import PaymentPlanDetail from '@/routes/PaymentPlan/Detail';
import PurchaseSettleDetail from '@/routes/NewPurchaseSettle/Detail';
import SupplySettleDetail from '@/routes/NewSupplySettle/Detail';
import PurchasePrePayDetail from '@/routes/NewPurchaseSettle/PrePayment/Detail';
import SupplyPrePayDetail from '@/routes/NewSupplySettle/PrePayment/Detail';
import { getEnvConfig } from 'utils/iocUtils';
import commonStyles from '../routes/common.less';

const lang = getCurrentLanguage();
const accessToken = getAccessToken();
const tenantId = getCurrentOrganizationId();
const localCode = getCurrentLanguage().split('_')[0];
// const allMenuData = getDvaApp()._store.getState().global.menuLeafNode;
const bucketName = window.$$env.PRIVATE_BUCKET || 'private-bucket';

/**
 * 获取指定格式的日期
 * @param {要转换的日期} date
 * @param {日期格式} format
 */

export function getMomentDate(date = new Date(), format = 'YYYY-MM-DD HH:mm:ss') {
  return moment(date).format(format);
}

/**
 * 处理数据
 */
export function getDatas(data) {
  const itemData = {};

  for (const key in data) {
    // 日期数字 特殊处理
    if (
      key.lastIndexOf('LOV') !== -1 ||
      key.lastIndexOf('MapList') !== -1 ||
      key.lastIndexOf('Lov') !== -1
    ) {
      Object.assign(itemData, {});
    } else if (Array.isArray(data[key])) {
      Object.assign(itemData, { [key]: data[key].join(',') });
    } else if (data[key] instanceof Object && key.search('Date')) {
      Object.assign(itemData, data[key]);
    } else if (data[key] instanceof Object) {
      Object.assign(itemData, { ...data[key] });
    } else {
      Object.assign(itemData, { [key]: data[key] });
    }
  }
  return itemData;
}

/**
 * 获取时间周期维度动态字段属性
 * @param {} item
 */

export function getFieldsConfig(item) {
  const {
    enabledFlag = 0, // 是否启用
    queryFlag = 0, // 是否作为查询条件
    requiredFlag = 0, // 是否必输
    componentType = 'INPUT', // 组件类型
    gridWidth = '240', // 列宽
    multipleFlag = 0, // 是否多选
    budgetItemCode = '', // 字段名
    budgetItemName, // 列名
    gridSeq = 0, // 位置
    displayField,
    valueField,
  } = item;
  const label = intl.get(`sbud.budgeting.model.budgeting.${budgetItemCode}`).d(budgetItemName);
  const name = budgetItemCode;
  let gridField = {};
  let queryField = {};
  const columnsConfig = {
    name,
    width: gridWidth,
    gridSeq,
  };

  if (!enabledFlag) {
    return {};
  }

  switch (componentType) {
    case 'LOV':
      {
        const { lovCode } = item;
        gridField = {
          name,
          label,
          type: 'object',
          required: requiredFlag,
          valueField,
          textField: displayField,
          lovCode,
          multiple: Number(multipleFlag) === 1,
          transformRequest: (value) =>
            value
              ? Number(multipleFlag) === 1
                ? value.map((i) => i[budgetItemCode]).join(',')
                : value[budgetItemCode]
              : null,
          transformResponse: (value, record) => {
            const {
              [valueField]: budgetItemCodes = null,
              [displayField]: budgetItemCodeMeaning = null,
            } = record;
            if (budgetItemCodes && budgetItemCodeMeaning) {
              return { [valueField]: budgetItemCodes, [displayField]: budgetItemCodeMeaning };
            } else {
              return null;
            }
          },
          dynamicProps: {
            lovPara: () => ({
              tenantId: getCurrentOrganizationId(),
            }),
          },
        };
        if (queryFlag) {
          queryField = {
            name,
            label,
            type: 'object',
            lovCode,
            multiple: false,
            transformRequest: (value) => (value ? value[budgetItemCode] : null),
            dynamicProps: {
              lovPara: () => ({
                tenantId: getCurrentOrganizationId(),
              }),
            },
          };
        }
      }
      break;
    case 'SELECT':
      {
        const { lovCode } = item;
        gridField = {
          name,
          label,
          type: 'string',
          required: requiredFlag,
          lookupCode: lovCode,
          multiple: Number(multipleFlag) === 1,
        };
        if (queryFlag) {
          queryField = {
            name,
            label,
            type: 'string',
            lookupCode: lovCode,
            multiple: false,
            transformRequest: (value) => (value ? value[budgetItemCode] : null),
          };
        }
      }
      break;
    default:
      gridField = {
        name,
        label,
        type: 'string',
      };
      if (queryFlag) {
        queryField = {
          name,
          label,
          type: 'string',
        };
      }
      break;
  }

  return {
    gridField,
    queryField,
    columnsConfig,
  };
}

/**
 * 获取预算编制动态字段属性
 * @param {} item
 */

export function getBugetFieldsConfig(item) {
  const {
    enabledFlag = 0, // 是否启用
    queryFlag = 0, // 是否作为查询条件
    requiredFlag = 0, // 是否必输
    componentType = 'INPUT', // 组件类型
    gridWidth = '240', // 列宽
    multipleFlag = 0, // 是否多选
    budgetItemCode = '', // 字段名
    budgetItemName, // 列名
    gridSeq = 0, // 位置
  } = item;
  const label = intl.get(`sbud.budgeting.model.budgeting.${budgetItemCode}`).d(budgetItemName);
  const name = budgetItemCode;
  let gridField = {};
  let queryField = {};
  const columnsConfig = {
    name,
    width: gridWidth,
    gridSeq,
  };

  if (!enabledFlag) {
    return {};
  }

  switch (componentType) {
    case 'LOV':
      {
        const { lovCode } = item;
        gridField = {
          name: `${name}LOV`,
          label,
          type: 'object',
          required: requiredFlag,
          lovCode,
          multiple: Number(multipleFlag) === 1 ? ',' : false,
          dynamicProps: {
            lovPara: () => ({
              tenantId: getCurrentOrganizationId(),
            }),
          },
        };

        columnsConfig.name = `${name}LOV`;

        if (queryFlag) {
          queryField = {
            name,
            label,
            type: 'object',
            lovCode,
            multiple: false,
            transformRequest: (value) => (value ? value[budgetItemCode] : null),
            dynamicProps: {
              lovPara: () => ({
                tenantId: getCurrentOrganizationId(),
              }),
            },
          };
        }
      }
      break;
    case 'SELECT':
      {
        const { lovCode } = item;
        gridField = {
          name,
          label,
          type: 'string',
          required: requiredFlag,
          lookupCode: lovCode,
          multiple: Number(multipleFlag) === 1,
        };
        if (queryFlag) {
          queryField = {
            name,
            label,
            type: 'string',
            lookupCode: lovCode,
            multiple: false,
            transformRequest: (value) => (value ? value[budgetItemCode] : null),
          };
        }
      }
      break;
    default:
      gridField = {
        name,
        label,
        type: 'string',
      };
      if (queryFlag) {
        queryField = {
          name,
          label,
          type: 'string',
        };
      }
      break;
  }

  return {
    gridField,
    queryField,
    columnsConfig,
  };
}

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
export function amountLocalRender({ value }) {
  return isNil(value) || math.isNaN(value)
    ? value
    : NumberField.format(value, localCode, {
        maximumFractionDigits: 20,
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

export function btnsFormat(btns = []) {
  const showBtns = [];
  let foldBtns = [];
  btns
    .filter((item) => item)
    .forEach((btn, index) => {
      const { name, btnComp, btnProps = {} } = btn;
      const { funcType, color } = btnProps;
      const newFuncType = funcType || (index === 0 ? 'raised' : 'flat');
      const newColor = color || (index === 0 ? 'primary ' : 'default');
      const pushArr = index < 5 ? showBtns : foldBtns;
      if (!btnComp) {
        pushArr.push({
          ...btn,
          btnType: 'c7n-pro',
          btnProps: { ...btnProps, funcType: newFuncType, color: newColor, key: name },
        });
      } else {
        pushArr.push(btn);
      }
    });
  foldBtns = foldBtns.map((item) => {
    const { btnProps } = item;
    if (btnProps && btnProps.buttonProps) {
      return {
        ...item,
        btnProps: {
          ...btnProps,
          buttonProps: {
            ...btnProps.buttonProps,
            icon: '',
            style: {
              width: '100%',
              margin: '0 0',
              display: 'block',
              borderRadius: 0,
              height: '0.4rem',
              lineHeight: '0.4rem',
              padding: '0 0.16rem',
              textAlign: 'left',
            },
          },
        },
      };
    } else if (btnProps && btnProps.otherButtonProps) {
      return {
        ...item,
        btnProps: {
          ...btnProps,
          otherButtonProps: {
            ...btnProps.otherButtonProps,
            icon: '',
            style: {
              width: '100%',
              margin: '0 0',
              display: 'block',
              borderRadius: 0,
              height: '0.4rem',
              lineHeight: '0.4rem',
              padding: '0 0.16rem',
              textAlign: 'left',
            },
          },
        },
      };
    } else {
      return {
        ...item,
        btnProps: {
          ...btnProps,
          icon: '',
          disabled: btnProps.disabled || btnProps.loading,
        },
      };
    }
  });
  return foldBtns.length
    ? [
        ...showBtns,
        {
          name: 'more',
          group: true,
          children: foldBtns,
          child: createElement(Icon, { type: 'more_horiz' }),
        },
      ]
    : showBtns;
}

// 配置平台组件 maxNum 属性后使用
export function formatDynamicBtns(btns = []) {
  return btns
    .filter((item) => item)
    .map((item, index) => {
      const { btnComp, btnProps = {} } = item;
      if (!btnComp) {
        const defaultBtnProps =
          index > 0
            ? { funcType: 'flat', color: 'default' }
            : { funcType: 'raised', color: 'primary' };
        Object.assign(item, {
          btnProps: defaults(btnProps, defaultBtnProps),
        });
      }
      return item;
    });
}

export function shouldCleanSearchBarCache() {
  const { tabs, activeTabKey: tabKey } = getDvaApp()._store.getState().global;
  return !tabs.find((item) => item.key === tabKey);
}

export function recordsCommit(data, dataSet, rowKey) {
  data.forEach((item) => {
    const findRecord = dataSet.records.find((record) => record.get(rowKey) === item[rowKey]);
    if (findRecord) {
      findRecord.commit(item, dataSet);
    }
  });
}

// 个性化区域校验
export function unitValidate(dataSet, config = {}, standardFields = []) {
  const customizeFields = (config?.fields || []).map((item) => item.fieldCode);
  const valiFields = isEmpty(customizeFields) ? standardFields : customizeFields;
  return new Promise(async (resolve) => {
    const res = await Promise.all(
      valiFields.map((item) => dataSet.current.getField(item).checkValidity())
    );
    resolve(res.every((item) => item === true));
  });
}

export function writeBackRecord(data, record, dataSet, forceRefreshFields = []) {
  const customizeRefreshFields = data.customizeRefreshFields || []; // 个性化预留刷新字段
  const oldData = record.toData();
  const newData = { ...oldData, ...data }; // 避免后端返回字段不完整
  // 前后数据对比变更的字段
  const changedFields = Object.entries(newData)
    .filter(
      ([name, value]) =>
        !isEqual(oldData[name], value) && !isUndefined(oldData[name] && isNull(value))
    )
    .map(([name]) => {
      // 或影响二开项目，暂时注释
      // const transformResponse = dataSet.getField(name)?.get('transformResponse');
      // if (isFunction(transformResponse)) {
      //   newData[name] = transformResponse(newData[name]);
      // }
      return name;
    });
  // ds中特殊处理不需要刷新的字段
  const dirtyFields = Array.from(dataSet.fields)
    .filter(
      ([, field]) =>
        field.isDirty(record) || field.get('lovCode', record) || field.get('lookupCode', record)
    )
    .map(([name]) => name);
  const refreshFields = Array.from(
    new Set(
      concat(difference(changedFields, dirtyFields), forceRefreshFields, customizeRefreshFields)
    )
  );
  record.init(pick(newData, refreshFields));
}

export function recordPickValues(record, data, standardRefreshFields = []) {
  if (isNil(record) || isNil(data)) return;
  const commonRefreshFields = ['objectVersionNumber'];
  const customizeRefreshFields = data.customizeRefreshFields || []; // 个性化预留刷新字段
  const customizeRefreshLovFields = data.customizeRefreshLovFields || []; // 个性化预留刷新单值集字段（翻译sql）
  const coverData = {};
  customizeRefreshLovFields.forEach((fieldName) => {
    const lovField = record.dataSet?.getField(fieldName);
    if (lovField && lovField.type === 'object') {
      const valueField = data[fieldName];
      const valueFieldMeaning = data[`${fieldName}Meaning`];
      if (lovField?.get('multiple')) {
        // 如果是多选需要解析，组装成数组赋值, 多选meaning当大于1个时返回的是对象，只有一个值时还是返回的字符串
        const values = (valueField?.split(',') || []).map((item) => {
          return {
            [lovField.get('valueField')]: item,
            [lovField.get('textField')]: isObject(valueFieldMeaning)
              ? valueFieldMeaning[item]
              : valueFieldMeaning,
          };
        });
        coverData[fieldName] = values;
      } else {
        coverData[fieldName] = {
          [lovField.get('valueField')]: valueField,
          [lovField.get('textField')]: valueFieldMeaning,
        };
      }
    }
  });
  const refreshFields = Array.from(
    new Set(
      concat(
        commonRefreshFields,
        standardRefreshFields,
        customizeRefreshFields,
        customizeRefreshLovFields
      )
    )
  );
  record.set(pick({ ...data, ...coverData }, refreshFields));
}

export function findMenuName() {
  return true; // 默认都走ux，后续几个迭代没问题再完全下掉
  // if (!allMenuData) return;
  // // 避免把结算平台内的菜单移动到新建的目录下，导致查询失败
  // const findItem = allMenuData.find((v) =>
  //   [v.name, v.functionMenuCode, v?.menuItem?.functionMenuCode].includes(menuName)
  // );
  // return findItem;
}

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

export function previewFile(previewFileUrl, otherProps = {}) {
  let fileUrl = previewFileUrl;
  const {
    originFileUrl,
    tenantId = getCurrentOrganizationId(),
    bucketName = window.$$env.PRIVATE_BUCKET || 'private-bucket',
    bucketDirectory,
  } = otherProps;
  if (!previewFileUrl && !originFileUrl) {
    return;
  } else if (!previewFileUrl && originFileUrl) {
    fileUrl = originFileUrl;
  }
  const fA = fileUrl.split('.');
  const fileExt = fA && fA[fA.length - 1];
  if (fileExt.toLowerCase() === 'pdf') return previewPdf(fileUrl);
  else if (fileExt.toLowerCase() === 'ofd') return getAttachmentUrlWithToken(fileUrl);
  const src = getAttachmentUrl(fileUrl, bucketName, tenantId, bucketDirectory);
  const downloadUrl = originFileUrl
    ? getAttachmentUrl(originFileUrl, bucketName, tenantId, bucketDirectory)
    : src;
  Modal.preview({ list: [{ src, downloadUrl }] });
}

// 费用单对账单结算单详情增加了折叠面板个性化，根据个性化更新fieldName
export function getAnchorName(list = [], fields = []) {
  const arr = list.filter((v) => {
    return !v.hidden;
  });
  arr.map((item) => {
    const obj = fields.find((v) => {
      return v.fieldName && v.fieldCode === item.code;
    });
    if (obj) {
      // eslint-disable-next-line
      item.title = obj.fieldName;
    }
    return item;
  });
  return arr;
}

// 获取title
export function getName(list = [], code = '') {
  const obj = list.find((v) => v.code === code);
  return obj?.title;
}

export function getValidationResponse(res, callback) {
  const { validatedCode, msg } = res || {};
  if (validatedCode === 'WARNING') {
    // 警告，确认操作
    Modal.confirm({
      title: intl.get('ssta.common.view.message.tip').d('提示'),
      children: msg,
      autoCenter: true,
      onOk: () => callback(),
    });
    return false;
  } else if (validatedCode === 'ERROR') {
    // 错误，提示错误信息
    notification.error({
      message: intl.get('hzero.common.notification.error').d('操作失败'),
      description: msg,
    });
    return false;
  } else if (validatedCode === 'EXTERNAL_ERROR') {
    // 外部系统错误,版本号会更新
    notification.error({
      message: intl.get('hzero.common.notification.error').d('操作失败'),
      description: msg,
    });
    return callback(true);
  } else {
    return callback();
  }
}

export function lovOptionDS(props = {}) {
  const { paging } = props;
  const queryParameter = omit(props, 'paging') || {};
  return {
    paging,
    queryParameter,
    autoQuery: true,
    selection: 'single',
    transport: {
      read() {
        return {
          url: `${HZERO_PLATFORM}/v1/${tenantId}/lovs/data`,
          method: 'get',
        };
      },
    },
  };
}

export function transformQselectDate(data, dateFieldsMapping = {}) {
  if (!data) return {};
  const mergeData = {};
  const { customizeFilterComparison } = data;
  const addComparisonSet = new Set();
  const safeComparison = customizeFilterComparison || '';
  Object.entries(dateFieldsMapping).forEach(([qSelectField, dateField]) => {
    if (!qSelectField || !dateField) return;
    const qSelectValue = data[qSelectField];
    const rangeField = `${dateField}_range`;
    const rangeValue = data[rangeField];
    if (isNil(qSelectValue) || !isNil(rangeValue)) return;
    const [from, to] = dateRangeTransform(qSelectValue);
    if (!from && !to) return;
    mergeData[rangeField] = `${from?.format(DATETIME_MIN) || ''},${to?.format(DATETIME_MAX) || ''}`;
    if (isString(safeComparison) && !safeComparison.includes(dateField)) {
      addComparisonSet.add(`${dateField}:~`);
    }
  });
  if (addComparisonSet.size > 0 && isString(safeComparison)) {
    const concatComparison = Array.from(addComparisonSet).join(',');
    const sign = safeComparison ? ',' : '';
    mergeData.customizeFilterComparison = safeComparison + sign + concatComparison;
  }
  return mergeData;
}

export function transformSupplierData(
  mergeSupplierId,
  { supCompanyPropCode = 'supplierCompanyId', supPropCode = 'supplierId' } = {}
) {
  const originSupplierData = { [supCompanyPropCode]: mergeSupplierId };
  if (!mergeSupplierId || typeof mergeSupplierId !== 'string') return originSupplierData;
  // 新改造的供应商查询支持多选
  if (mergeSupplierId.includes('_')) {
    // 销售方未改，保持原逻辑
    const idList = mergeSupplierId.split('_');
    if (idList.length !== 2) return originSupplierData;
    const [supplierCompanyId, supplierId] = idList;
    return {
      [supCompanyPropCode]: supplierCompanyId || undefined,
      [supPropCode]: supplierId || undefined,
    };
  } else {
    return {
      supplierLovKeysStr: mergeSupplierId,
      [supCompanyPropCode]: undefined, // 后端不再传对应的supCompanyPropCode
    };
  }
}

// 根据返回的DTO解析报错信息,仅做提示
export function handleParseErrorInfo(result) {
  const { validatedCode, msg } = result || {};
  if (validatedCode === 'WARNING') {
    notification.warning({
      message: msg,
    });
  } else {
    notification.error({
      message: msg,
    });
  }
}

export function parseJsonStr(str, defaultValue) {
  if (!str) return defaultValue;
  try {
    const parseData = JSON.parse(str);
    if (typeof parseData === 'object') return parseData;
    return defaultValue;
  } catch (e) {
    return defaultValue;
  }
}

export function parseJson(jsonStr) {
  let jsonArr = [];
  if (jsonStr) {
    try {
      jsonArr = JSON.parse(jsonStr);
    } catch {
      jsonArr = [];
    }
  }
  return jsonArr;
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

/**
 * @description: 手动解析路由参数
 * @param {string} href 路由链接
 * @param {Array<string>} paths 待匹配路由配置
 * @return {Object} { location, match }
 */
export function parseRouteHref(href, paths = []) {
  const initialValue = { location: {}, match: {} };
  if (!href || isEmpty(paths)) return initialValue;
  let matchData;
  const subStrIndex = href.indexOf('?');
  const pathname = subStrIndex > -1 ? href.substring(0, subStrIndex) : href;
  const search = subStrIndex > -1 ? href.substring(subStrIndex) : '';
  const matchPath = paths.find((path) => {
    const execData = pathToRegexp(path).exec(pathname);
    if (execData) {
      matchData = execData;
      return true;
    } else return false;
  });
  if (!matchData) return initialValue;
  const parseData = pathToRegexp.parse(matchPath).slice(1);
  const params = parseData.reduce((total, key, index) => {
    total[key.name] = matchData[index + 1];
    return total;
  }, {});
  const location = { search, pathname };
  const match = { isExact: true, params, path: matchPath, url: pathname };
  return { location, match };
}

export function openEmbedPage({ href, search, params, ...otherProps }) {
  Modal.open({
    drawer: true,
    closable: true,
    resizable: true,
    key: Modal.key(),
    className: commonStyles['ssta-embed-page-modal'],
    children: (
      <EmbedPage
        href={href}
        match={{ params }}
        location={{ search: search ? `?${search}` : '' }}
        {...otherProps}
      />
    ),
    header: null,
    footer: null,
  });
}

export function viewPayPlanModal({ planNum, history, source = 'planNum' }) {
  Modal.open({
    drawer: true,
    key: Modal.key(),
    closable: true,
    bodyStyle: { padding: 0, backgroundColor: '#f4f4f4' },
    className: commonStyles['ssta-large-modal'],
    title: intl.get('ssta.common.view.title.paymentPlanDetail').d('付款计划详情'),
    children: (
      <PaymentPlanDetail
        history={history}
        match={{ params: { planNum } }}
        location={{ search: `?${stringify({ operate: 'view', source })}` }}
      />
    ),
    okCancel: false,
    okText: intl.get('hzero.common.button.close').d('关闭'),
  });
}

export function viewSettleModal({
  settleHeaderId,
  documentType = 'INVOICE',
  history,
  camp = 'PURCHASER',
}) {
  const supplierFlag = camp === 'SUPPLIER';
  const docType = documentType?.toLowerCase() || 'invoice';
  const pathname = supplierFlag
    ? `/ssta/new-supply-settle/${docType}/${settleHeaderId}`
    : `/ssta/new-purchase-settle/${docType}/${settleHeaderId}`;
  const title = supplierFlag
    ? intl.get(`ssta.supplySettle.view.title.settleView`).d('结算单查看')
    : intl.get(`ssta.purchaseSettle.view.title.settleView`).d('结算单查看');
  const ModalChildren = supplierFlag ? SupplySettleDetail : PurchaseSettleDetail;
  const settleDetailProps = {
    history,
    location: {
      pathname,
      search: `?${stringify({ type: 'view' })}`,
    },
    match: {
      params: { docType, settleHeaderId },
    },
    // 是否隐藏Header
    headerHideFlag: true,
  };
  Modal.open({
    title,
    children: createElement(ModalChildren, settleDetailProps),
    drawer: true,
    closable: true,
    key: Modal.key(),
    bodyStyle: { padding: 0, backgroundColor: '#f4f4f4' },
    className: commonStyles['ssta-large-modal'],
    okCancel: false,
    okText: intl.get('hzero.common.button.close').d('关闭'),
  });
}

export function viewPrePayModal({ settleHeaderId, history, camp = 'PURCHASER' }) {
  const supplierFlag = camp === 'SUPPLIER';
  const pathname = supplierFlag
    ? '/ssta/new-supply-settle/pre-payment'
    : '/ssta/new-purchase-settle/pre-payment';
  const title = supplierFlag
    ? intl.get(`ssta.supplySettle.view.title.settleView`).d('结算单查看')
    : intl.get(`ssta.purchaseSettle.view.title.settleView`).d('结算单查看');
  const ModalChildren = supplierFlag ? SupplyPrePayDetail : PurchasePrePayDetail;
  const prePayDetailProps = {
    history,
    location: {
      pathname,
      search: `?${stringify({
        settleHeaderId,
        type: 'ALL',
        source: 'detail',
        documentType: 'PREPAYMENT',
      })}`,
    },
    // 是否隐藏Header
    headerHideFlag: true,
  };
  Modal.open({
    title,
    children: createElement(ModalChildren, prePayDetailProps),
    drawer: true,
    closable: true,
    key: Modal.key(),
    bodyStyle: { padding: 0, backgroundColor: '#f4f4f4' },
    className: commonStyles['ssta-large-modal'],
    okCancel: false,
    okText: intl.get('hzero.common.button.close').d('关闭'),
  });
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
 * @param {String} flag 在当前页打开标识
 */
export function getAttachmentUrlWithToken(url, flag = false) {
  const accessToken = getAccessToken();
  const requestId = getRequestId();
  const params = stringify(
    filterNullValueObject({
      bucketName,
      access_token: accessToken,
      'H-Request-Id': requestId,
    })
  );
  const { HZERO_FILE } = getEnvConfig();
  const newUrl = `${HZERO_FILE}/v1/${getCurrentOrganizationId()}/files/download-with-token?${params}&url=${encodeURIComponent(
    url
  )}`;
  if (flag) window.open(newUrl, '_self');
  else window.open(newUrl);
}

/**
 * Returns an object containing the values corresponding to the given keys from the data object. If a key is not present in the data object or its value is undefined, the default value is used instead.
 *
 * @param {object} data - The data object to extract values from.
 * @param {Array} keyList - An array of keys whose values should be extracted from the data object.
 * @param {*} defaultValue - The default value to use for keys that are not present in the data object or have an undefined value.
 * @return {object} - An object containing the extracted values.
 */
export function ObjectBatchGet(data = {}, keyItemList = [], defaultValue) {
  return keyItemList.reduce((total, keyItem) => {
    const [targetName, sourceName] = Array.isArray(keyItem) ? keyItem : [keyItem, keyItem];
    total[targetName] =
      data === null || data[sourceName] === undefined ? defaultValue : data[sourceName];
    return total;
  }, {});
}

export function getSelectedNegActConfirmMsg(action, dataSet) {
  const actionDescMap = {
    delete: intl.get('hzero.common.button.delete').d('删除'),
    cancel: intl.get('hzero.common.button.cancel').d('取消'),
  };
  const actionDesc = actionDescMap[action] || action;
  const msgFlag = isNil(dataSet) ? true : dataSet.selected?.some((item) => item.status !== 'add');
  return (
    msgFlag && {
      title: intl.get('ssta.common.view.title.tip').d('提示'),
      children: intl
        .get('ssta.common.view.message.confirmActionSelectedRowsOrNot', { actionDesc })
        .d('是否确认{actionDesc}选中行？'),
    }
  );
}

export async function confirmDocNegAction(params) {
  const actionDescMap = {
    delete: intl.get('hzero.common.button.delete').d('删除'),
    cancel: intl.get('hzero.common.button.cancel').d('取消'),
    return: intl.get('hzero.common.button.return').d('退回'),
  };
  const { action, documentNum, documentName } = params || {};
  const actionDesc = actionDescMap[action] || action;
  const feedback = await Modal.confirm({
    title: intl.get('ssta.common.view.title.tip').d('提示'),
    children: intl
      .get('ssta.common.view.message.confirmActionDocumentOrNot', {
        actionDesc,
        documentNum,
        documentName,
      })
      .d('是否确认{actionDesc}{docmentName}{docmentNum}？'),
  });
  return feedback === 'ok';
}

export const collectStrs = (str1, str2) => {
  return str1 && str2 ? str1 + str2 : str1 || str2 || null;
};

// 根据不含税单价，计算出含税单价
export const getIncTaxAmountByNetPrice = (
  netPrice,
  quantity,
  taxRate,
  price,
  unitPriceBatch,
  inPriceTaxFlag
) => {
  const rate = math.div(taxRate, 100);
  const newNetAmount = math.toFixed(
    math.div(math.multipliedBy(netPrice, quantity), unitPriceBatch),
    10
  );
  const newTaxAmount = inPriceTaxFlag
    ? math.toFixed(math.div(math.multipliedBy(newNetAmount, rate), math.minus(1, rate)), 10)
    : math.toFixed(math.multipliedBy(newNetAmount, rate), 10);
  const taxIncludedAmount = math.plus(newNetAmount, newTaxAmount);
  return math.toFixed(
    math.multipliedBy(math.div(taxIncludedAmount, quantity), unitPriceBatch),
    price
  );
};
// 根据含税单价，计算出不含税单价
export const getNetPriceByTaxIncPrice = (
  taxIncludedPrice,
  quantity,
  taxRate,
  price,
  unitPriceBatch,
  inPriceTaxFlag
) => {
  const rate = math.div(taxRate, 100);
  const newTaxIncludedAmount = math.toFixed(
    math.div(math.multipliedBy(taxIncludedPrice, quantity), unitPriceBatch),
    10
  );
  const newTaxAmount = inPriceTaxFlag
    ? math.toFixed(math.multipliedBy(newTaxIncludedAmount, rate), 10)
    : math.toFixed(math.multipliedBy(math.div(newTaxIncludedAmount, math.plus(1, rate)), rate), 10);
  const newNetAmount = math.minus(newTaxIncludedAmount, newTaxAmount);
  return math.toFixed(math.multipliedBy(math.div(newNetAmount, quantity), unitPriceBatch), price);
};

export const openExpiredTipsModal = (onOk) => {
  Modal.warning({
    keyboardClosable: false,
    title: intl.get('ssta.common.view.message.tip').d('提示'),
    children: intl
      .get('ssta.common.view.message.statusUpdatedAndBackToList')
      .d('当前页面已有状态更新，您可点击下方按钮返回列表页'),
    okText: intl.get('ssta.common.view.button.backToList').d('返回列表页'),
    onOk,
  });
};
