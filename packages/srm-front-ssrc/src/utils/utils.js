import React, { memo, useState, useEffect } from 'react';
import crypto from 'crypto-js';
import { notification, Tooltip } from 'hzero-ui';
import { Spin, Tooltip as TooltipC7N } from 'choerodon-ui';
import { Modal } from 'choerodon-ui/pro';
import moment from 'moment';
import {
  isArray,
  isEmpty,
  isNumber,
  sortBy,
  uniq,
  isFunction,
  isNil,
  isString,
  isObject,
} from 'lodash';
import Cookies from 'universal-cookie';
import qs from 'query-string';
import Record from 'choerodon-ui/pro/lib/data-set/Record';
import { math } from 'choerodon-ui/dataset';
import querystring from 'querystring';

import { PAGE_SIZE_OPTIONS, GLOBAL_PAGE_SIZE } from 'utils/constants';
import intl from 'utils/intl';
import { HZERO_FILE } from 'utils/config';
import { PRIVATE_BUCKET, SRM_SSRC } from '_utils/config';
import { getEnvConfig, getDvaApp } from 'utils/iocUtils';
import { getMenuId, getActiveTabKey, openTab, refreshTab, getTabFromKey } from 'utils/menuTab';

import {
  getAccessToken,
  getCurrentOrganizationId,
  getRequestId,
  getResponse,
  getCurrentTenant,
  getCurrentUserId,
  getCurrentRole,
} from 'utils/utils';

import {
  calculateQuantity,
  queryEnableDoubleUnit,
  batchBusinessRules,
  ssrcBatchBusinessRules,
  fetchOperationFlag,
  revokeWorkFlowByKey,
  queryPrecision,
} from '@/services/commonService';
import { fetchSupplierBiddingHallConfig } from '@/services/biddingHallService';
import { getErrors } from '@/routes/ssrc/RFSupplierQuotation/Quotation/utils/getDSError.js';
import { fetchConfigSheet } from '@/services/inquiryHallService';

const organizationId = getCurrentOrganizationId();
const ACCESS_TOKEN = 'access_token';
const cookies = new Cookies();
const { API_HOST } = getEnvConfig();
const roleId = getCurrentRole().id;
const userId = getCurrentUserId();

// todo 调整消息返回
export function getResponseParse(response, errorCallback) {
  if (response && response.failed === true) {
    if (errorCallback) {
      errorCallback(response);
    } else {
      const msg = {
        message: intl.get('hzero.common.notification.error').d('操作失败'),
        description: <div dangerouslySetInnerHTML={{ __html: response.message }} />,
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
    }
  } else {
    return response;
  }
}

export function replacePrivateBucket(context) {
  if (context) {
    const accessToken = getAccessToken();
    const bucketName = PRIVATE_BUCKET;
    const imgReg = new RegExp(/<img\b.*?(?:>|\/>)/g);
    const newContext = context.replace(imgReg, (item) => {
      const matchResult = item.match(
        /(http|https):\/\/[\w\-_]+(\.[\w\-_]+)+([\w\-\\.,@?^=%&:/~\\+#]*[\w\-\\@?^=%&/~\\+#])+([\S]+[.]*[\w\-\\@?^=%&/~\\+#])/
      );
      const url = matchResult ? matchResult[0] : undefined;
      const newUrl = `${HZERO_FILE}/v1/${organizationId}/files/redirect-url?bucketName=${bucketName}&access_token=${accessToken}&url=${encodeURIComponent(
        url
      )}`;
      let replaceImg = item;
      replaceImg = item.replace(
        /(http|https):\/\/[\w\-_]+(\.[\w\-_]+)+([\w\-\\.,@?^=%&:/~\\+#]*[\w\-\\@?^=%&/~\\+#])+([\S]+[.]*[\w\-\\@?^=%&/~\\+#])/,
        newUrl
      );
      return replaceImg;
    });
    return newContext;
  } else {
    return context;
  }
}

/**
 * 不超过精度则展示本身，若超过精度则展示变量precision的精度
 * @param {Number} value 传入的值
 * @param {Number} precision 转换的精度
 */
export function showPrecisionValue(value, precision) {
  if (isNil(value) || isNil(precision) || math.isZero(value) || math.isNegativeZero(value)) return;
  if (isNumber(precision) && math.dp(value) > precision) {
    return math.toFixed(value, precision);
  } else {
    return value;
  }
}

/**
 * 提交保存日期格式转化
 * @param {*} date - 要转化的日期
 * @param {*} format - 要转换的格式
 * - DATETIME_MAX = "YYYY-MM-DD 23:59:59";
 * - DATETIME_MIN = "YYYY-MM-DD 00:00:00";
 * - DEFAULT_TIME_FORMAT = "HH:mm:ss";
 * - DEFAULT_DATETIME_FORMAT = "YYYY-MM-DD HH:mm:ss";
 * - DEFAULT_DATE_FORMAT = "YYYY-MM-DD";
 */
export function dateFormate(date, format) {
  if (date && format) {
    return moment(date).format(format);
  } else if (date) {
    return date;
  } else {
    return null;
  }
}

/**
 * 根据传入的数据列表对象，生成页面分页参数对象
 * @param {object} data - 数据列表对象
 * @returns {object} pagination- 分页对象
 * 与hzero不同之处(当前页属性: {hzero: current, c7n-pro: page})
 */
export function createC7nPagination(data, list) {
  if (data) {
    return {
      showSizeChanger: true,
      pageSizeOptions: isArray(list) && !isEmpty(list) ? list : PAGE_SIZE_OPTIONS,
      page: (isNumber(data.number) ? data.number : data.start) + 1,
      pageSize: data.size, // 每页大小
      total: isNumber(data.totalElements) ? data.totalElements : data.total,
    };
  }
}

/**
 * 解析查询参数
 * @param {Object} params
 * @returns {Object} 解析后的查询参数
 * 与hzero不同之处(当前页属性: {hzero: current, c7n-pro: page})
 */
export function parseC7nParameters(params = {}) {
  const { pagination = {}, sort = {}, ...others } = params;
  const { page = 1, pageSize = GLOBAL_PAGE_SIZE } = pagination;
  if (sort.order === 'ascend') {
    sort.order = 'asc';
  }
  if (sort.order === 'descend') {
    sort.order = 'desc';
  }
  const sortObj = {};
  if (!isEmpty(sort)) {
    sortObj.sort = `${sort.field},${sort.order}`;
  }
  let size = pageSize;
  const sourceSize = [...PAGE_SIZE_OPTIONS];
  if (!sourceSize.includes(`${pageSize}`)) {
    const sizes = sortBy(uniq([...sourceSize, `${pageSize}`]), (i) => +i);
    const index = sizes.findIndex((item) => +item === pageSize);
    size = +sizes[index];
  }
  return {
    size,
    page: page - 1,
    ...others,
    ...sortObj,
  };
}

/**
 * 获取行内编辑表格中的值
 * @param {array} dataSource - 表格数据源
 * @param {array} filterList - 过滤新增操作中的属性字段，例如：['children', 'unitId']，默认过滤 record
 * @param {object} attributes - 用于每行记录新增字段，例如：{templateCode}
 * @param {string} treeChildrenAlias = 'children' - 指定树形结构行内编辑的子节点名称
 */
export async function getEditPerformanceTableData(
  dataSource = [],
  filterList = [],
  attributes = {},
  treeChildrenAlias = 'children'
) {
  const paramsList = [];
  const fetchForm = (source, list) => {
    if (Array.isArray(source)) {
      for (let i = 0; i < source.length; i++) {
        if (source[i].record && source[i]._status) {
          const values = source[i].record.toJSONData();
          const { record, ...otherProps } = source[i];
          const { __id, _status, __dirty, ...otherValues } = values;
          if (Array.isArray(filterList) && filterList.length > 0) {
            for (const name of filterList) {
              // 如果record中存在需要过滤的值，且是新增操作，执行过滤，默认过滤record
              // eslint-disable-next-line
              if (source[i][name] && source[i]._status === 'create') {
                delete otherProps[name];
                // eslint-disable-next-line
                delete values[name];
              }
            }
          }
          // 只保存有更改项的
          list.push({ ...otherValues, ...attributes });
        } else {
          const { record, ...otherProps } = source[i];
          list.push({ ...otherProps, ...attributes });
        }
        if (source[i][treeChildrenAlias] && Array.isArray(source[i][treeChildrenAlias])) {
          fetchForm(source[i][treeChildrenAlias], list);
        }
      }
    }
  };
  fetchForm(dataSource, paramsList);
  return paramsList;
}

/**
 * 获取行内编辑表格中的值 - 自定义筛选条件
 * @param {array} dataSource - 表格数据源
 * @param {array} filterList - 过滤新增操作中的属性字段，例如：['children', 'unitId']，默认过滤 record
 * @param {array} noLimitFilterList - 无限制(新增/编辑/查询)过滤字段
 * @param {object} attributes - 用于每行记录新增字段，例如：{templateCode}
 * @param {string} treeChildrenAlias = 'children' - 指定树形结构行内编辑的子节点名称
 */
export async function getCustomizeEditPerformanceTableData(
  dataSource = [],
  filterList = [],
  noLimitFilterList = [],
  attributes = {},
  treeChildrenAlias = 'children'
) {
  const paramsList = [];
  const fetchForm = (source, list) => {
    if (Array.isArray(source)) {
      for (let i = 0; i < source.length; i++) {
        if (source[i].record && source[i]._status) {
          const values = source[i].record.toJSONData();
          const { record, ...otherProps } = source[i];
          const { __id, _status, __dirty, ...otherValues } = values;
          if (Array.isArray(filterList) && filterList.length > 0) {
            for (const name of filterList) {
              // 如果record中存在需要过滤的值，且是新增操作，执行过滤，默认过滤record
              // eslint-disable-next-line
              if (source[i][name] && source[i]._status === 'create') {
                delete otherProps[name];
                // eslint-disable-next-line
                delete values[name];
              }
            }
          }
          // 只保存有更改项的
          list.push({ ...otherValues, ...attributes, changeFlag: 1 });
        } else {
          const { record, ...otherProps } = source[i];
          list.push({ ...otherProps, ...attributes, changeFlag: 0 });
        }
        if (source[i][treeChildrenAlias] && Array.isArray(source[i][treeChildrenAlias])) {
          fetchForm(source[i][treeChildrenAlias], list);
        }
      }
    }
  };
  fetchForm(dataSource, paramsList);
  // 再次过滤数据, 根据 `noLimitFilterList`
  const newFilterList = [...noLimitFilterList];
  const collectionMeaningKeys = [];
  paramsList.forEach((item, index) => {
    if (index === 0) {
      Object.keys(item).forEach((key) => {
        if (key.includes('Meaning')) {
          collectionMeaningKeys.push(key);
        }
      });
      newFilterList.push(...collectionMeaningKeys);
    }
    if (Array.isArray(newFilterList) && newFilterList.length > 0) {
      for (const name of newFilterList) {
        // eslint-disable-next-line no-param-reassign
        delete item[name];
      }
    }
  });
  return paramsList;
}

// 组合函数
export const composedFunction = (f = () => {}, g = () => {}) => {
  return async (x = null) => {
    return f(await g(x));
  };
};

// 路由为public下。获取cookie
export const getCookie = (cname) => {
  const name = `${cname}=`;
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    const c = ca[i].trim();
    if (c.indexOf(name) === 0) return c.substring(name.length, c.length);
  }
  return '';
};

// 路由为public下。获取token
export const getToken = () => {
  const privateRouter = window.location.pathname.startsWith('/private');
  const privateToken = qs.parse(window.location.search) || {};
  return privateRouter
    ? privateToken.access_token
    : cookies.get(ACCESS_TOKEN, {
        path: '/',
      });
};

// 路由为public下，获取tenantId
export const getPublicCurrentOrganizationId = () => {
  const state = window?.dvaApp._store.getState();
  const { user = {} } = state;
  const { currentUser = {} } = user;
  return currentUser.tenantId;
};

// 路由为public下，获取tenantId
export const getPublicLanguage = () => {
  const state = window?.dvaApp._store.getState();
  const { global = {} } = state;
  return global.language;
};

// 判断是否/pub 页面
export const isPubPage = (path, sourcePath = false) => {
  const IsPublic = path && path.includes('/pub');
  let newPath;
  if (IsPublic) {
    newPath = `/pub${sourcePath}`;
    return newPath;
  } else {
    return sourcePath;
  }
};

// 判断是否/pub 页面
export const isBackPubPage = (path, sourcePath = false) => {
  const IsPublic = path && path.includes('/pub');
  let newPath;
  if (IsPublic) {
    if (sourcePath && sourcePath.includes('/pub')) {
      return sourcePath;
    } else {
      newPath = `/pub${sourcePath}`;
    }
    return newPath;
  } else {
    return sourcePath;
  }
};

// name --- 标准代码编译后func.name与二开的不同
// eslint-disable-next-line func-names
export const withOverride = function (func, name) {
  return isFunction(this[func.name] || this[name]) ? this[func.name] || this[name] : func;
};
/**
 * 下载文件根据后端接口返回流 - 主要解决文件名
 * @param {string} apiSuffix
 */
export function downloadFileByApi(apiSuffix, params) {
  const search = isEmpty(params) ? '' : `?${qs.stringify(params)}`;
  let fileName = '';
  const reqConfig = new Request(
    `${API_HOST}${SRM_SSRC}/v1/${organizationId}${apiSuffix}${search}`,
    {
      method: 'GET',
      headers: {
        Authorization: `bearer ${getAccessToken()}`,
        'H-Request-Id': getRequestId(),
        'H-Menu-Id': getMenuId(),
        Accept: 'application/json',
      },
    }
  );
  fetch(reqConfig)
    .then((response) => {
      const contentDisposition = response.headers.get('content-disposition');
      const reg = /filename(.*)/;
      const originFileName = reg.exec(contentDisposition)[1].trim();
      fileName = decodeURIComponent(
        originFileName?.split(originFileName?.includes("utf-8''") ? "*=utf-8''" : '*=')[1]
      );
      return response.blob();
    })
    .then((blob) => {
      // 创建a标签，用于跳转至下载链接
      const tempLink = document.createElement('a');
      tempLink.style.display = 'none';
      const blobURL = window.URL.createObjectURL(blob);
      tempLink.href = blobURL;
      tempLink.setAttribute('download', fileName);
      // 兼容：某些浏览器不支持HTML5的download属性
      if (typeof tempLink.download === 'undefined') {
        tempLink.setAttribute('target', '_blank');
      }
      // 挂载a标签
      document.body.appendChild(tempLink);
      tempLink.click();
      document.body.removeChild(tempLink);
      // 释放blob URL地址
      window.URL.revokeObjectURL(blobURL);
    });
}

/**
 * 判断是否是url
 */
export function isUrl(path) {
  /* eslint no-useless-escape:0 */
  const reg = /(((^https?:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)(:[\d]+)?((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)$/g;
  return reg.test(path);
}

/**
 * 获取下载文件url
 * @param {string} text - 接口返回文本值(url/字符串报错信息)
 */
export function getDownloadFileUrl(text) {
  if (isUrl(text)) {
    return text;
  }
  try {
    getResponse(JSON.parse(text));
  } finally {
    // eslint-disable-next-line no-unsafe-finally
    return null;
  }
}

/**
 * 判断是否是 ds中的 Record对象
 */
export function isRecord(record) {
  return record instanceof Record;
}

/**
 * h0异步分页查询
 * @param {*} param0
 * @param { Boolean } pageChangeFlag - 是否是切换分页查询
 * @param { Object } commonPayload - 公共参数
 * @param { Number } oldTotalElements - 异步分页第二次查询到的总条数
 * @param { Function } fetchDataList - 数据查询方法
 */
export async function asyncPageFetchList(props = {}) {
  const {
    pageChangeFlag = false,
    commonPayload = {},
    oldTotalElements,
    fetchDataList = () => {},
  } = props;
  if (pageChangeFlag) {
    await fetchDataList({
      ...commonPayload,
      oldTotalElements,
      asyncCountFlag: 'DEFAULT',
    });
  } else {
    const firstFetch = await fetchDataList({
      // 如果开启异步分页，第一次只查询数据
      ...commonPayload,
      asyncCountFlag: 'DEFAULT',
    });
    if (firstFetch && firstFetch?.needCountFlag === 'Y') {
      await fetchDataList({
        // 如果开启异步分页，第二次只查询条数
        ...commonPayload,
        onlyCountFlag: firstFetch?.needCountFlag,
      });
    }
  }
}

/**
 * 获取行内编辑表格中的data
 * 只取值不校验
 * @param {array} dataSource - 表格数据源
 * @param {array} filterList - 过滤新增操作中的属性字段，例如：['children', 'unitId']，默认过滤 $form
 * @param {string} treeChildrenAlias = 'children' - 指定树形结构行内编辑的子节点名称
 */
export function getEditTableToData(
  dataSource = [],
  filterList = [],
  treeChildrenAlias = 'children'
) {
  const paramsList = [];
  const fetchForm = (source, list) => {
    if (Array.isArray(source)) {
      for (let i = 0; i < source.length; i++) {
        if (source[i].$form && source[i]._status) {
          const { $form, ...otherProps } = source[i];
          const values = $form.getFieldsValue();
          if (Array.isArray(filterList) && filterList.length > 0) {
            for (const name of filterList) {
              // 如果record中存在需要过滤的值，且是新增操作，执行过滤，默认过滤$form
              // eslint-disable-next-line
              if (source[i][name] && source[i]._status === 'create') {
                delete otherProps[name];
                // eslint-disable-next-line
                delete values[name];
              }
            }
          }
          list.push({ ...otherProps, ...values });
        }
        if (source[i][treeChildrenAlias] && Array.isArray(source[i][treeChildrenAlias])) {
          fetchForm(source[i][treeChildrenAlias], list);
        }
      }
    }
  };
  fetchForm(dataSource, paramsList);
  return paramsList;
}

export function menuLeaf() {
  const state = getDvaApp()._store.getState();
  const { global: { menuLeafNode = [] } = {} } = state;
  return menuLeafNode;
}

export function getDetailDispatchRouter() {
  const menuLeafNode = menuLeaf();
  let approvalMenu = false;
  let taskMenu = false;
  let startByTaskMenu = false;
  let involvedTaskMenu = false;
  let carbonCopyTaskMenu = false;
  menuLeafNode.forEach((item) => {
    // 审批工作台
    if (item.path === '/hwfp/approval') {
      approvalMenu = true;
    }
    // 我的待办事项
    if (item.path === '/hwfp/task') {
      taskMenu = true;
    }
    // 我发起的流程
    if (item.path === '/hwfp/start-by-task') {
      startByTaskMenu = true;
    }
    // 我参与的流程
    if (item.path === '/hwfp/involved-task') {
      involvedTaskMenu = true;
    }
    // 我的抄送流程
    if (item.path === '/hwfp/carbon-copy-task') {
      carbonCopyTaskMenu = true;
    }
  });
  return { approvalMenu, taskMenu, involvedTaskMenu, carbonCopyTaskMenu, startByTaskMenu };
}

/*
 * 工作台表格选择筛选字段自适应相关样式
 * @param {*} flag - 针对于页面中是否是单表flag
 */
export const getTableFixSelfAdaptStyle = (flag = false) => {
  const wrapperCalcHeight = { height: `calc(100vh - 190px)` };
  return {
    wrapperCalcHeight: flag ? wrapperCalcHeight : {}, // 筛选器和tabs外侧容器高度
    wrapperStyle: flag
      ? {
          // 筛选器和tabs外侧容器样式
          display: 'flex',
          flexFlow: 'column',
          ...wrapperCalcHeight,
        }
      : {},
    tabsProps: flag
      ? {
          // table自适应需要的tabs配置属性
          flex: 'flex',
          style: {
            height: '100%',
            // flex: 1
          },
        }
      : {},
    tableContainerHeight: flag
      ? {
          // table外侧容器高度
          height: '100%',
        }
      : {},
    tableMaxHeight: {
      // 不是SerchBarTab这样自带筛选的，即表格和筛选器分开单独的表格最大高度
      maxHeight: `calc(100% - 50px)`,
    },
    searchBarTableMaxHeight: {
      // SerchBarTab这样自带筛选的表格最大高度
      maxHeight: `calc(100% - 10px)`,
    },
  };
};

/**
 * 计算基本数量api
 * params object | array  null
 * */
export async function calculateBasicQty(params) {
  if (isEmpty(params)) {
    return;
  }

  let batchFlag = 0; // 批量标识
  let data = [params];

  if (Array.isArray(params) && params.length) {
    batchFlag = 1;
    data = params;
  }

  let result = await calculateQuantity(data);
  result = getResponse(result);

  if (!result || isEmpty(result)) {
    return undefined;
  }

  if (!batchFlag) {
    return result[0].primaryQuantity;
  }

  return result;
}

// 返回接口json报错处理
export function isText(str) {
  let result;
  try {
    result = getResponse(JSON.parse(str));
    return result;
  } catch (e) {
    return str;
  }
}

// 是否开启双单位高阶函数
export const isOpenDoubleUnit = ({ businessModule = 'RFX' }) => {
  return (Comp) => {
    return memo((props) => {
      const [flag, setFlag] = useState();
      const [loading, setLoading] = useState(false);

      useEffect(() => {
        setLoading(true);
        queryEnableDoubleUnit({
          businessModule,
        })
          .then((res) => {
            if (isText(res)) {
              setFlag(!!Number(res));
            }
          })
          .finally(() => {
            setLoading(false);
          });
      }, []);

      return (
        <Spin spinning={loading}>
          <Comp {...props} doubleUnitFlag={flag} />
        </Spin>
      );
    });
  };
};

// 单价的双单位气泡提示
export const TooltipTitle = ({ doubleUnitFlag = false, tipValue = '', title = '' }) => {
  return doubleUnitFlag ? <Tooltip title={tipValue}>{title}</Tooltip> : title;
};

// 单价的双单位气泡提示
export const TooltipTitleC7N = ({ doubleUnitFlag = false, tipValue = '', title = '' }) => {
  return doubleUnitFlag ? <TooltipC7N title={tipValue}>{title}</TooltipC7N> : title;
};

export const applyToNotification = (msg) => {
  notification.info({
    message: `${intl
      .get(`ssrc.inquiryHall.view.message.openDoubleUnit`)
      .d('寻源模块已开启双单位，')}${msg}${intl
      .get(`ssrc.inquiryHall.view.message.secondaryUomBatchPrice`)
      .d('辅助单位不等于基本单位且价格批量不为1，将会为您自动计算每一单价！')}`,
  });
};

// 参与应用的字段
export const getApplicationWord = (flag = false, value, secondaryValue) => {
  return flag ? secondaryValue : value;
};

// 单位和基本单位名称获取
export const getUomName = (flag = false) => {
  return flag
    ? intl.get(`ssrc.common.model.inquiryHall.basicUomName`).d('基本单位')
    : intl.get(`ssrc.common.model.unit`).d('单位');
};

// 数量和基本数量名称获取
export const getQtyName = (flag = false) => {
  return flag
    ? intl.get(`ssrc.common.model.inquiryHall.basicQuantity`).d('基本数量')
    : intl.get(`ssrc.common.model.common.quantity`).d('需求数量');
};

// 中标数量
export const getBidQtyName = (flag = false) => {
  return flag
    ? intl.get(`ssrc.common.model.inquiryHall.basicBidQuantity`).d('基本中标数量')
    : intl.get(`ssrc.common.model.common.bidQuantity`).d('中标数量');
};

export const getQuantityName = (flag = false) => {
  return flag
    ? intl.get(`ssrc.common.model.inquiryHall.basicQuantity`).d('基本数量')
    : intl.get(`ssrc.common.model.common.quantities`).d('数量');
};

// 可供数量
export const getAvailableQtyName = (flag = false) => {
  return flag
    ? intl.get(`ssrc.common.model.inquiryHall.basicAvailableQuantity`).d('基本可供数量')
    : intl.get(`ssrc.common.model.common.availableQuantity`).d('可供数量');
};

export const getLadderFrom = (flag = false) => {
  return flag
    ? intl.get(`ssrc.common.model.inquiryHall.basicLadderFrom`).d('基本数量从')
    : intl.get(`ssrc.common.model.common.ladderFrom`).d('数量从');
};

export const getLadderTo = (flag = false) => {
  return flag
    ? intl.get(`ssrc.common.model.inquiryHall.basicLadderTo`).d('基本数量至')
    : intl.get(`ssrc.common.model.common.ladderTo`).d('数量至');
};

// 报价单位和数量
export const getQuantityAndUomCombine = (flag = false) => {
  return flag
    ? intl.get('ssrc.common.basicQuantityAndUomCombine').d('基本数量-基本单位')
    : intl.get('ssrc.common.quantityAndUomCombine').d('数量-单位');
};

// 单价含税
export const getPriceName = (flag = false) => {
  return flag
    ? intl.get(`ssrc.common.model.supQuo.basicUnitPriceTax`).d('基本单价(含税)')
    : intl.get(`ssrc.common.model.common.taxPrice`).d('单价(含税)');
};

// 单价不含税
export const getNetPriceName = (flag = false) => {
  return flag
    ? intl.get(`ssrc.common.model.supQuo.basicNetPrice`).d('基本单价(不含税)')
    : intl.get(`ssrc.common.model.common.netPrice`).d('单价(不含税)');
};

// 阶梯报价含税
export const getLadderPriceName = (flag = false) => {
  return flag
    ? intl.get(`ssrc.common.model.supQuo.basicValidTaxPrice`).d('基本有效报价(含税)')
    : intl.get(`ssrc.common.model.common.validLadderTaxPrice`).d('有效阶梯报价（含税）');
};

// 阶梯报价不含税
export const getNetLadderPriceName = (flag = false) => {
  return flag
    ? intl.get(`ssrc.common.model.supQuo.basicValidUnTaxQuotationPrice`).d('基本有效报价(不含税)')
    : intl.get(`ssrc.common.model.common.validLadderNetPrice`).d('有效阶梯报价(不含税)');
};

export const getValidPriceName = (flag = false) => {
  return flag
    ? intl.get(`ssrc.common.model.supQuo.basicValidTaxPrice`).d('基本有效报价(含税)')
    : intl.get(`ssrc.common.model.common.validPrice`).d('有效报价(含税)');
};

export const getValidNetPriceName = (flag = false) => {
  return flag
    ? intl.get(`ssrc.common.model.supQuo.basicValidUnTaxQuotationPrice`).d('基本有效报价(不含税)')
    : intl.get(`ssrc.common.model.common.validNetPrice`).d('有效报价(不含税)');
};

export const getTooltipsName = (flag = false) => {
  return flag
    ? intl.get('ssrc.common.previewSubmitValidBasicPrice').d('上一次提交的基本有效单价')
    : intl.get('ssrc.common.previewSubmitValidPrice').d('上一次提交的有效单价');
};

export const getQuotationPrice = (flag = false) => {
  return flag
    ? intl.get(`ssrc.common.model.inquiryHall.basicUnitPrice`).d('基本单价')
    : intl.get('ssrc.common.model.common.unitPrice').d('单价');
};

export const getAllottedQuantity = (flag = false) => {
  return flag
    ? intl.get(`ssrc.common.model.inquiryHall.basicAllottedQuantity`).d('基本分配数量')
    : intl.get(`ssrc.inquiryHall.model.inquiryHall.allottedQuantity`).d('分配数量');
};

export const getSeletedQuantity = (flag = false) => {
  return flag
    ? intl.get(`ssrc.common.model.inquiryHall.basicSeletedQuantity`).d('基本选用数量')
    : intl.get(`ssrc.inquiryHall.model.inquiryHall.seletedQuantity`).d('选用数量');
};

// 目标单价和基本目标单价名称获取
export const getTargetPriceName = (flag = false) => {
  return flag
    ? intl.get(`ssrc.common.model.inquiryHall.basicTargetPrice`).d('基本目标单价')
    : intl.get(`ssrc.common.model.targetPrice`).d('目标单价');
};

export function getTabKey() {
  let activeTabKey = getActiveTabKey();
  if (activeTabKey.split('/').includes('pub')) {
    activeTabKey = activeTabKey.split('/')?.slice(2, 4)?.join('/');
    return `/${activeTabKey}`;
  } else {
    return getActiveTabKey();
  }
}

/**
 * 取路径前缀
 * @param {String} path - 传入路径
 */
export function getJumpRoutePrefixUrl(path = '') {
  if (path && isString(path)) {
    const pathArr = path.split('/');
    if (pathArr.includes('app')) {
      pathArr.splice(
        pathArr.findIndex((item) => item === 'app'),
        1
      );
    }
    if (pathArr.includes('pub')) {
      // 如果含有pub 去掉pub拼接
      return `/${pathArr.slice(2, 4).join('/')}`;
    } else {
      return pathArr.slice(0, 3).join('/');
    }
  }
  return path;
}

// 是否开启双单位高阶函数
export function IsOpenDoubleUnitHOC() {
  return (Com) => {
    class WrapComponent extends React.Component {
      constructor(props) {
        super(props);
        this.state = {
          flag: false,
        };
      }

      componentDidMount() {
        queryEnableDoubleUnit({
          businessModule: 'RFX',
        }).then((res) => {
          if (isText(res)) {
            this.setState({ flag: !!Number(res) });
          }
        });
      }

      render() {
        const { flag } = this.state;
        return <Com doubleUnitFlag={flag} {...this.props} />;
      }
    }
    return WrapComponent;
  };
}

/**
 * 下划线转驼峰
 * 转换字段 例如将ADJUST_TIME转换成adjustTime
 * @param {*} value - 原始value
 */
export function underlineToHump(value) {
  if (isEmpty(value) || !isString(value)) return value;
  let str = value.toLowerCase(); // 先转换为小写
  // 如果首字母是_，执行 replace 时会多一个_，这里需要去掉
  if (str.slice(0, 1) === '_') {
    str = str.slice(1);
  }
  return str.replace(/([^_])(?:_+([^_]))/g, function ($0, $1, $2) {
    return $1 + $2.toUpperCase();
  });
}

/**
 * 获取ds校验报错
 * @param {*} params ds.getValidationErrors()
 */
export function getDSErrors(params = {}) {
  getErrors(params);
}

/**
 * 解决openTab刷新问题的openTab
 * @param {*} tabConfig {key: tabKey,path: tabKey,title: title,closable: true,}
 */
export function openOrFreshTab(tabConfig = {}) {
  const { key } = tabConfig;

  if (!['/swbh/role-workbench', '/workplace'].includes(getTabFromKey(key)?.key)) {
    refreshTab(key);
  }
  openTab(tabConfig);
}

// 判断JSON数据
export function isJSON(str) {
  let result;
  try {
    result = JSON.parse(str);
  } catch (e) {
    return false;
  }
  return isObject(result) && !isString(result);
}

/**
 * 有很多页面都有供应商行，若后续有跳转需求，可调用此方法
 * 跳转供应商主数据360查询明细页面
 * @param {Object} props - 入参 companyId- 头信息中的公司id; record- 供应商行数据
 */
export function directionSupplierLifeManagerDetail(props = {}) {
  const { history = {}, record = {}, companyId = null, sslmLifeCycleFlag = true } = props;
  const { location: { pathname = null, search } = {} } = history || {};

  const recordData = (isRecord(record) ? record.toData() : record) ?? {};
  const {
    tenantId,
    partnerCompanyId,
    partnerTenantId,
    // spfmSupplierCompanyId,
    // spfmCompanyId,
    supplierCompanyId,
  } = recordData;

  if (
    !companyId ||
    !partnerCompanyId ||
    !partnerTenantId ||
    // !spfmSupplierCompanyId ||
    !supplierCompanyId
  ) {
    return;
  }

  const params = {
    tenantId: tenantId ?? getCurrentOrganizationId(),
    companyId,
    partnerCompanyId,
    partnerTenantId,
    // spfmPartnerCompanyId: spfmSupplierCompanyId,
    // spfmCompanyId,
    supplierCompanyId,
  };
  const searchParams = querystring.stringify(params);

  history.push({
    pathname: sslmLifeCycleFlag
      ? '/sslm/include/supplier-manager/supplier-detail'
      : '/sslm/supplier-detail-new',
    search: searchParams,
    state: {
      historyBack: pathname + search,
      ...params,
    },
  });
}

/*
 * 过滤出需要的个性化单元
 * @param {*} codeMap 个性化集合
 * @param {*} codeName 个性化对应集合中存储的名称
 */

export function filterCustomizeCodes(codeMap, codeName) {
  if (!codeName || isEmpty(codeName) || isEmpty(codeMap) || !(codeMap instanceof Map)) return null;

  let currentUnitCode = null;

  if (typeof codeName === 'string') {
    currentUnitCode = codeMap.get(codeName);
  }

  if (isArray(codeName)) {
    const codeSet = new Set();
    codeName.forEach((unitCode) => {
      if (codeMap.get(unitCode)) {
        codeSet.add(codeMap.get(unitCode));
      }
    });

    currentUnitCode = codeSet.size ? [...codeSet].join(',') : null;
  }

  return currentUnitCode;
}

// 查业务规则定义-批量
export const batchQueryBusinessRules = async (params = {}) => {
  const { data = [], currentOrganizationId } = params;
  if (isEmpty(data)) {
    return null;
  }

  const orgId = getCurrentOrganizationId();

  let result = null;
  try {
    result = await batchBusinessRules({
      ...params,
      organizationId: currentOrganizationId || orgId,
    });
  } catch (e) {
    throw e;
  }

  return result;
};

// 查询配置表，是否启用竞价大厅
export const fetchSourceTemplateConfig = async (data) => {
  const { organizationId: currentOrganizationId, ...others } = data || {};
  let result = null;
  let flag = null;

  try {
    result = await fetchSupplierBiddingHallConfig({
      configTableCode: 'ssrc_source_template_menu_cnf',
      organizationId: currentOrganizationId || organizationId,
      ...others,
      // data: {
      //   tenant: getCurrentTenant().tenantNum,
      // },
    });
    result = getResponse(result);
    const errorCode = result !== 1 && result !== '1' && result !== 0 && result !== '0';
    if (errorCode) {
      return flag;
    }

    flag = result === 1 || result === '1' ? 1 : 0;
    return flag;
  } catch (e) {
    throw e;
  }
};

// 查询配置表，是否启用竞价大厅
export const fetchBiddingHallConfigResult = async (data) => {
  const { organizationId: currentOrganizationId, ...others } = data || {};
  let result = null;
  let flag = null;

  try {
    result = await fetchSupplierBiddingHallConfig({
      configTableCode: 'ssrc_rfa_tenant_config',
      organizationId: currentOrganizationId || organizationId,
      ...others,
      // data: {
      //   tenant: getCurrentTenant().tenantNum,
      // },
    });
    result = getResponse(result);
    const errorCode = result !== 1 && result !== '1' && result !== 0 && result !== '0';
    if (errorCode) {
      return flag;
    }

    flag = result === 1 || result === '1' ? 1 : 0;
    return flag;
  } catch (e) {
    throw e;
  }
};

// 查询业务规则定义-金额计算方式
export const amountCalcType = async (params = {}) => {
  const { organizationId: currentOrganizationId, purTenantId, supplierFlag = 0 } = params || {};
  let result = null;
  const data = [
    {
      fullPathCode: 'SITE.SPFM.CALCULATION_METHOD',
      cnfParamDTOs: [{}],
    },
  ];

  try {
    if (supplierFlag === 0) {
      result = await batchQueryBusinessRules({ data, currentOrganizationId });
    }
    if (supplierFlag === 1) {
      const supplierData = {
        organizationId,
        data: {
          cnfParamBatchDTOS: data,
          purTenantId,
        },
      };
      result = await ssrcBatchBusinessRules(supplierData);
    }
  } catch (e) {
    throw e;
  }

  return result?.['SITE.SPFM.CALCULATION_METHOD'] || [];
};

// 查询精度
export const fetchCurrentPrecision = async (data = {}) => {
  const { currencyCodes, uomIds = [], purTenantId } = data || {};
  if (!currencyCodes && !uomIds) {
    return;
  }

  const params = {
    uomIds,
    currencyCodes,
    financialCodes: currencyCodes,
    purTenantId,
  };

  const precisionObject = {};
  try {
    let result = await queryPrecision(params);
    result = getResponse(result);
    if (isEmpty(result)) {
      return;
    }

    result.forEach((item = {}) => {
      const { precisionType, precision } = item || {};

      switch (precisionType) {
        case 'NUM':
          precisionObject.uom = precision;
          break;
        case 'PRICE':
          precisionObject.currency = precision;
          break;
        case 'FINANCE':
          precisionObject.financial = precision;
          break;
        default:
          break;
      }
    });
  } catch (e) {
    throw e;
  }

  return precisionObject;
};

// 获取供应商关系图谱url参数信息
export const getUrlParams = (url) => {
  if (!url) return url;
  const query = url?.substring?.(url?.indexOf?.('?') + 1)?.split?.('&') || [];
  const result = {};
  for (let i = 0; i < query.length; i++) {
    const temp = query[i]?.split?.('=') || [];
    if (temp.length < 2) {
      result[temp[0]] = '';
    } else {
      // eslint-disable-next-line prefer-destructuring
      result[temp[0]] = temp[1];
    }
  }
  return result;
};

// 获取供应商关系图谱url
export const getSupplierRelationUrl = (url) => {
  if (!url) return url;
  const res = getUrlParams(url);
  if (String(res?.relativeFlag) === '1') {
    // relativeFlag为1，相对路径，走拼接二级域名逻辑
    return `${window.location.origin}/app${url}`;
  }
  return url;
};

/**
 * 自动计算最大滚动高度
 * @param {*} extraHeight 额外的高度(表格底部的内容高度 Number类型,默认为30)
 * @param {*} isC7N 是否是C7N表格(布尔类型 默认为否)
 * @param {*} tableKey 处理多个table情况 获取与 tableKey 类名下的 ant-table-thead
 */
export const getContentScrollHeight = (extraHeight = 30, isC7N = false, tableKey = false) => {
  let tHeaderBottom = 0;
  const tHeader = isC7N
    ? document.getElementsByClassName('c7n-pro-table-thead')[0]
    : tableKey
    ? document
        .getElementsByClassName(`${tableKey}`)[0]
        ?.getElementsByClassName('ant-table-thead')[0]
    : document.getElementsByClassName(`ant-table-thead`)[0];

  if (tHeader) {
    tHeaderBottom = tHeader.getBoundingClientRect().bottom; // 默认取第一个表格头部
  }
  // 窗体高度-表格内容顶部的高度-表格内容底部的高度
  // let height = document.body.clientHeight - tHeaderBottom - extraHeight

  const height = `calc(100vh - ${tHeaderBottom + extraHeight}px)`;
  return height;
};

/**
 * 天、时、分转换成时间戳
 * @param {*} day
 * @param {*} hour
 * @param {*} minute
 */
export function dayHourMinuteToTimestamp(day, hour, minute) {
  let second = 0;

  if (!isNil(day) && isNumber(day) && day !== 0) {
    second += day * 24 * 60 * 60;
  }

  if (!isNil(hour) && isNumber(hour) && hour !== 0) {
    second += hour * 60 * 60;
  }

  if (!isNil(minute) && isNumber(minute) && minute !== 0) {
    second += minute * 60;
  }

  return second * 1000; // 秒需乘以1000
}

// dateTime trans to 年月日 时分秒
export const transDateTimeToLocal = (time) => {
  let value = '';
  if (!time) {
    return value;
  }

  const ft = `
    YYYY[${intl.get('ssrc.inquiryHall.date.unit.year').d('年')}]MM[${intl
    .get('ssrc.inquiryHall.date.unit.month')
    .d('月')}]DD[${intl.get('ssrc.inquiryHall.date.unit.day').d('日')}]
    HH:mm:ss
  `;
  value = moment(time).format(ft);
  return value;
};

// 获取新分值法数据集
// 新分值法 ['SCORE_NEW', 'WEIGHT] 原分值法['SCORE', 'WEIGHT]
export function getCurrentScoreType(params) {
  const { scoreTemplateScoreType = [], newScoreFlag = false } = params || {};
  const newScoreType =
    scoreTemplateScoreType?.filter((item) =>
      newScoreFlag ? item.value !== 'SCORE' : item.value !== 'SCORE_NEW'
    ) || [];
  return newScoreType;
}

// 是否开启新分值法高阶函数
export const isOpenNewScoreType = () => {
  return (Comp) => {
    return memo((props) => {
      const [flag, setFlag] = useState(false);

      useEffect(() => {
        fetchConfigSheet({
          configCode: 'ssrc_new_score_type_config',
          organizationId: getCurrentOrganizationId(),
          data: {
            tenant: getCurrentTenant().tenantNum,
          },
        }).then((res) => {
          const result = getResponse(res);
          if (isEmpty(result)) {
            setFlag(true);
          }
        });
      }, []);

      return <Comp {...props} newScoreFlag={flag} />;
    });
  };
};

/**
 * 批量获取该工作流流程是否允许撤销
 * @param {Array} businessKeys businessKeys
 */
export async function getBatchOperationFlag(businessKeys) {
  const res = getResponse(
    await fetchOperationFlag({ body: businessKeys, query: { revokeFlag: 1 } })
  );
  if (res) {
    return res;
  }
  return {};
}

/**
 * 撤销工作流审批
 * @param {String} businessKey businessKey
 */
export function handleRevokeApproval(businessKey) {
  return new Promise(async (resolve) => {
    Modal.confirm({
      title: intl.get('ssrc.common.message.tip').d('提示'),
      children: intl
        .get('ssrc.common.view.message.revokeWorkFlow')
        .d('是否确认撤销审批？撤销后您仍可再次提交发起审批（仅工作流审批发起人可撤销审批）'),
      onOk: async () => {
        const res = await revokeWorkFlowByKey({ businessKey });
        if (isString(res)) {
          notification.error({
            message: intl.get('hzero.common.status.mistake').d('错误'),
            description: res,
          });
        } else if (res && !res.failed) {
          resolve(true);
          notification.success({
            message: intl.get('ssrc.common.view.message.revokeApprovalSuccess').d('撤销审批成功'),
          });
        }
        resolve(false);
      },
      afterClose: () => {
        resolve(false);
      },
    });
  });
}

// 查询招标文件模板是否启用
export async function queryBidFileTemplateConfig() {
  let data = null;

  let flag = 0;
  const param = {
    configCode: 'ssrc_file_template_cnf',
    organizationId: getCurrentOrganizationId(),
    data: {
      tenantNum: getCurrentTenant().tenantNum,
    },
  };

  try {
    data = await fetchConfigSheet(param); // 黑名单
    data = getResponse(data);
    if (!isEmpty(data)) {
      flag = 0;
    } else {
      flag = 1;
    }
  } catch (e) {
    throw e;
  }

  return flag;
}

// 查询整单线下寻源是否开启
export async function fetchOfflineWholeConfig() {
  let data = null;
  let flag = false;
  try {
    data = getResponse(
      await fetchConfigSheet({
        configCode: 'ssrc_rfx_offline_whole_config',
        organizationId: getCurrentOrganizationId(),
        data: {
          tenantNum: getCurrentTenant().tenantNum,
        },
      })
    );
    if (data && !data.failed) {
      // 现在判断配置表查出来的是开启的，以后要改成没有查出来的是开启的
      if (!isEmpty(data)) {
        flag = true;
      }
    }
  } catch (e) {
    throw e;
  }
  return flag;
}

// md5加密
export const encryptMd5 = (params, str) => {
  /* 如果没有 str 字段，则使用默认数据加密 */
  if (!str) {
    return crypto
      .MD5(
        `fadc147bab4eea6097136669a6a7bd98+${organizationId}+${userId}+${roleId}+${params?.templateCode}`
      )
      .toString(crypto.enc.Hex);
  }
  /* 如果没有 str 字段，则使用str数据加密 */
  return crypto.MD5(str).toString(crypto.enc.Hex);
};

// 筛选器-增加时间范围的过滤，默认三个月
export const getFilterDataRangeDefaultValue = () => {
  const value = [moment().subtract(3, 'months').startOf('day'), moment().endOf('day')];
  return value;
};

// 将分钟数转换时间为时分秒
export const transTimeToDHS = (value = null) => {
  let day = null;
  let hour = null;
  let minute = null;

  if (!isNil(value) && typeof value === 'number') {
    day = Math.floor(value / 1440);
    hour = day > 0 ? Math.floor((value - day * 1440) / 60) : value ? Math.floor(value / 60) : value;
    minute = hour > 0 || day > 0 ? value - day * 1440 - hour * 60 : value;
  }

  return {
    day,
    hour,
    minute,
  };
};
