/**
 * choerodon-ui - choerodon-ui 客制化配置文件
 * @Author: wuyunqiang <yunqiang.wu@hand-china.com>
 * @Date: 2019-08-15 09:12:30
 * @LastEditTime: 2019-08-27 09:47:01
 * @Copyright: Copyright (c) 2018, Hand
 */
import moment from 'moment';
import intl from 'utils/intl';
import {
  generateUrlWithGetParam,
  getAccessToken,
  getCurrentOrganizationId,
  isTenantRoleLevel,
  descryptLovFieldValue,
  getPlatformVersionApi,
} from 'utils/utils';
import Cookies from 'universal-cookie';
import { routerRedux } from 'dva/router';
import { getDvaApp } from 'hzero-front/lib/utils/iocUtils';
import { setSession } from 'hzero-front/lib/utils/utils';
import { getEnvConfig } from 'utils/iocUtils';
import { getMenuId } from 'utils/menuTab';
import { axios } from 'utils/c7nUiConfig';
import { getConfig } from 'hzero-boot';
import { isEmpty, forIn } from 'lodash';

// eslint-disable-next-line import/no-mutable-exports
let withTokenAxios = {};
const cookies = new Cookies();

/**
 * 鉴权 401
 * @param status 状态码
 */
const authrIntercept = (status) => {
  if (status === 401) {
    const accessToken = getAccessToken();
    const { HZERO_OAUTH } = getEnvConfig();
    const dvaApp = getDvaApp();
    const language = cookies.get('language') || 'zh_CN';
    // FIXME:已处理过一次401后就不再处理
    const cacheLocation = encodeURIComponent(window.location.toString());
    if (accessToken) {
      withTokenAxios(`${HZERO_OAUTH}/public/token/kickoff`, {
        method: 'POST',
        params: {
          access_token: accessToken,
        },
      }).then((res) => {
        if (res && res.kickoff === 1) {
          // 跳转到踢下线界面
          // eslint-disable-next-line
          dvaApp._store.dispatch(
            routerRedux.push({
              pathname: '/public/kickoff',
              search: `?language=${language}`,
            })
          );
          setSession('redirectUrl', cacheLocation);
          setSession('isErrorFlag', false);
        } else {
          // token 失效, 跳转到 token失效页面
          dvaApp._store.dispatch(
            routerRedux.push({
              pathname: '/public/unauthorized',
              search: `?language=${language}`,
            })
          );
          setSession('isErrorFlag', true);
          // 登陆后需要跳回的界面， 放到session中
          setSession('redirectUrl', cacheLocation);
        }
      });
    }
    return false;
  }
  return true;
};

function getHmdeTenantId() {
  const { dvaApp } = window;
  if (dvaApp) {
    const { _store } = dvaApp;
    if (_store) {
      const state = _store.getState();
      if (state) {
        const { hmde } = state;
        if (hmde) {
          const path = hmde[window.location.pathname];
          if (path) {
            return path.tenantId;
          }
        }
      }
    }
  }
}

// 只执行一次
if (!withTokenAxios._SRM_AXIOS_IS_CONFIGED) {
  // 覆盖hzero axios request拦截器
  // Add a request interceptor
  withTokenAxios = axios;
  withTokenAxios.interceptors.request.use(
    (config) => {
      let { url = '' } = config;
      const { API_HOST } = getEnvConfig();
      if (url.indexOf('://') === -1 && !url.startsWith('/_api')) {
        url = `${API_HOST}${url}`;
      }
      // Do something before request is sent
      const newConfig = {
        ...config,
        url,
        headers: {
          ...config.headers,
          Authorization: `bearer ${getAccessToken()}`,
        },
      };
      const MenuId = getMenuId();
      if (MenuId) {
        newConfig.headers['H-Menu-Id'] = `${getMenuId()}`;
      }
      // 添加额外的请求头
      const patchRequestHeaderConfig = getConfig('patchRequestHeader');
      let patchRequestHeader;
      if (patchRequestHeaderConfig) {
        if (typeof patchRequestHeaderConfig === 'function') {
          patchRequestHeader = patchRequestHeaderConfig();
        } else {
          patchRequestHeader = patchRequestHeaderConfig;
        }
        newConfig.headers = {
          ...newConfig.headers,
          ...patchRequestHeader,
        };
      }
      // 模型化页面的axios请求需将租户id拼到url search上
      if (window.location.pathname.includes('/hmde')) {
        // 需要排除拼tenantId的特定路由 (全局拼tenantId有个漏洞，当选择租户时本身这个Lov就接受tenantId作为筛选的条件，这是拼接tenantId会导致Lov搜索数据丢失)
        const exceptUrlList = ['?lovCode=HPFM.TENANT_PAGING'];
        let tenantId = getHmdeTenantId();
        let tenantFlag = false;
        if (
          (typeof tenantId === 'number' ||
            (typeof tenantId === 'string' && tenantId.length > 0 && !isNaN(Number(tenantId)))) &&
          !exceptUrlList.some((item) => config.url && config.url.indexOf(item) > -1)
        ) {
          tenantFlag = true;
        } else if (isTenantRoleLevel()) {
          tenantFlag = true;
          tenantId = getCurrentOrganizationId();
        }
        if (tenantFlag) {
          newConfig.params = {
            ...newConfig.params,
            tenantId,
          };
        }
      }
      return newConfig;
    },
    (error) =>
      // Do something with request error
      Promise.reject(error)
  );
  withTokenAxios._SRM_AXIOS_IS_CONFIGED = true;
}

const getLovItemType = (type) => {
  switch (type) {
    case 'BIG_DECIMAL':
      return 'currency';
    case 'INT':
      return 'number';
    default:
      return 'auto';
  }
};

const lovTransformResponse = (data, code) => {
  // 对 data 进行任意转换处理
  let originData = {};
  try {
    originData = JSON.parse(data);
  } catch (e) {
    console.error(e, data);
    return data;
  }

  const {
    // height,
    viewCode = code,
    valueField = 'value',
    displayField = 'name',
    pageSize = 5,
    queryFields = [],
    tableFields = [],
    encryptFields = [],
    idField = undefined,
    childrenFieldName = undefined,
    onlySelectLastFlag = false,
    // queryUrl,
  } = originData;
  let { title } = originData;
  if (originData.failed) {
    title = intl
      .get('hzero.common.c7n.lov.notDefine', { code })
      .d(`值集视图未定义: "${code}", 请维护值集视图!`);
  } else if (!originData.lovCode) {
    title = `lov ${code} loading...`;
  }
  const lovItems = [];
  let tableWidth = 0;
  queryFields.forEach((queryItem = {}) => {
    const lovItem = {
      lovId: viewCode,
      lovItemId: `query_${queryItem.field}`,
      gridFieldName: queryItem.field,
      gridField: 'N',
      display: queryItem.label,
      autocompleteField: 'Y',
      conditionField: 'Y',
      isAutocomplete: 'N',
      conditionFieldWidth: null,
      conditionFieldLabelWidth: null,
      conditionFieldType: queryItem.dataType === 'LOV_CODE' ? 'object' : queryItem.dataType,
      conditionFieldSelectCode: queryItem.dataType === 'SELECT' ? queryItem.sourceCode : null,
      conditionFieldLovCode: queryItem.dataType === 'LOV_CODE' ? queryItem.sourceCode : null,
      conditionFieldName: null,
      conditionFieldTextfield: null,
      conditionFieldNewline: 'N',
      conditionFieldSelectUrl: null,
      conditionFieldSelectVf: null,
      conditionFieldSelectTf: null,
      conditionFieldSequence: 1,
      conditionFieldDefaultSelect: queryItem.defaultQueryFlag === 1,
      gridFieldSequence: 1,
    };
    lovItems.push(lovItem);
  });
  tableFields.forEach((tableItem) => {
    const lovItem = {
      lovId: viewCode,
      lovItemId: `table_${tableItem.dataIndex}`,
      gridFieldName: tableItem.dataIndex,
      gridFieldWidth: tableItem.width,
      gridFieldAlign: 'left',
      autocompleteField: 'Y',
      conditionField: 'N',
      isAutocomplete: 'N',
      gridField: 'Y',
      display: tableItem.title,
      conditionFieldWidth: null,
      conditionFieldLabelWidth: null,
      conditionFieldType: null,
      conditionFieldSelectCode: null,
      conditionFieldName: null,
      conditionFieldTextfield: null,
      conditionFieldNewline: 'N',
      conditionFieldSelectUrl: null,
      conditionFieldSelectVf: null,
      conditionFieldSelectTf: null,
      conditionFieldLovCode: null,
      conditionFieldSequence: 1,
      gridFieldSequence: 1,
      fieldProps: {
        type: getLovItemType(tableItem.dataType),
      },
    };
    lovItems.push(lovItem);
    tableWidth += tableItem.width;
  });

  let queryColumns = 0;
  if (queryFields.length) {
    if (queryFields.length <= 2) {
      queryColumns = queryFields.length;
    } else {
      queryColumns = 2;
    }
  }

  return {
    originData: {
      lovCode: code,
      ...originData,
    },
    code: viewCode,
    title,
    description: title,
    lovId: viewCode,
    // placeholder: title,
    sqlId: viewCode,
    customSql: null,
    queryColumns,
    customUrl: null,
    textField: displayField,
    valueField,
    delayLoad: 'N',
    needQueryParam: 'N',
    editableFlag: 'Y',
    canPopup: 'Y',
    lovPageSize: pageSize,
    treeFlag: childrenFieldName ? 'Y' : 'N',
    idField: idField || valueField,
    parentIdField: childrenFieldName,
    lovItems,
    width: tableWidth ? tableWidth + 300 : 700,
    height: null,
    dataSetProps: {
      paging: !childrenFieldName,
      record: {
        dynamicProps: {
          disabled: (record) => {
            return onlySelectLastFlag && record && record.children;
          },
          selectable: (record) => {
            return !onlySelectLastFlag || (record && !record.children);
          },
        },
      },
    },
    transformSelectedData: (originValue) => {
      const value = originValue;
      if (value && encryptFields && encryptFields.length > 0) {
        encryptFields.forEach((encryptField) => {
          const encryptFieldSuffix = '_encrypt'; // 加密字段固定后缀
          if (encryptField.field && value[`${encryptField.field}${encryptFieldSuffix}`]) {
            value[encryptField.field] = descryptLovFieldValue(
              value[`${encryptField.field}${encryptFieldSuffix}`]
            );
          }
        });
      }
      return value;
    },
  };
};

const lovDefineAxiosConfig = (code) => {
  const { API_HOST, HZERO_PLATFORM } = getEnvConfig();
  return {
    url: `${API_HOST}${HZERO_PLATFORM}/v1/${
      isTenantRoleLevel() ? `${getCurrentOrganizationId() || 0}/` : ''
    }lov-view/info?viewCode=${code}`,
    method: 'GET',
    // 单独抽取出来
    transformResponse: [(data) => lovTransformResponse(data, code)],
  };
};

const lovQueryAxiosConfig = (code, lovConfig = {}, props) => {
  const { queryUrl, lovCode, lovTypeCode, viewCode } = lovConfig.originData || {};
  const { API_HOST, HZERO_PLATFORM } = getEnvConfig();
  const { data } = props || {};
  let url = `${API_HOST}${HZERO_PLATFORM}/v1/${
    isTenantRoleLevel() ? `${getCurrentOrganizationId() || 0}/` : ''
  }lovs/data?lovCode=${code}`;
  if (queryUrl) {
    // 解决特殊值集lovCode和查询条件同key问题
    const HPFM_LOV_DETAIL_CODE = 'HPFM.LOV.LOV_DETAIL';
    const HPFM_LOV_VIEW_CODE = 'HPFM.LOV.VIEW';
    url =
      lovCode.includes(HPFM_LOV_DETAIL_CODE) || lovCode.includes(HPFM_LOV_VIEW_CODE)
        ? queryUrl
        : generateUrlWithGetParam(queryUrl, { lovCode });
    const organizationRe = /{organizationId}|{tenantId}/g;
    if (organizationRe.test(url)) {
      const tId = getCurrentOrganizationId();
      url = url.replace(organizationRe, tId);
    }
    if (!isEmpty(data)) {
      Object.keys(data).forEach((key) => {
        const lovParamsRe = new RegExp('\\{'.concat(key, '\\}'), 'g');
        if (lovParamsRe.test(url)) {
          const val = data[key];
          url = url.replace(lovParamsRe, val);
        }
      });
    }
    // url = `${url}${url.indexOf('?') ? '&' : '?'}lovCode=${lovCode}`;
  }
  const config = {
    url,
    method: 'GET',
  };
  if (['URL', 'SQL'].includes(lovTypeCode)) {
    config.headers = {
      'lov-view-code': viewCode,
      'lov-view-code-tenant': getCurrentOrganizationId(),
    };
  }
  return config;
};

const lookupBatchAxiosConfig = (codes, lovParams = []) => {
  const { API_HOST, HZERO_PLATFORM } = getEnvConfig();
  const url = `${API_HOST}${HZERO_PLATFORM}/v1/${getPlatformVersionApi('lovs/batch/data')}`;
  const data = {
    ...codes.reduce((obj, code, index) => {
      obj[code] = { ...lovParams[index] };
      return obj;
    }, {}),
  };
  return {
    url,
    method: 'POST',
    data,
  };
};

const lovBatchAxiosConfig = (codes) => {
  const { API_HOST, HZERO_PLATFORM } = getEnvConfig();
  const url = `${API_HOST}${HZERO_PLATFORM}/v1/${getPlatformVersionApi('lov-view/batch/info')}`;
  const data = codes.reduce((obj, code) => {
    obj.push(code);
    return obj;
  }, []);
  return {
    url,
    method: 'POST',
    data,
    transformResponse: [
      (data) => {
        let originData = {};
        try {
          originData = JSON.parse(data);
        } catch (e) {
          console.error(e, data);
          return data;
        }
        const result = {};
        forIn(originData, (value, code) => {
          result[code] = value ? lovTransformResponse(JSON.stringify(value), code) : {};
        });
        return result;
      },
    ],
  };
};

const dateAxiosConfig = (code, year = moment().format('YYYY')) => {
  const { globalCalendarEnable } = window.dvaApp._store.getState().global;
  const { API_HOST, HZERO_PLATFORM } = getEnvConfig();
  const url =
    globalCalendarEnable === '0'
      ? `${API_HOST}${HZERO_PLATFORM}/v1/${getPlatformVersionApi(
          'calendars/rest-date'
        )}?companyId=${code}&year=${year}`
      : undefined;
  return {
    url,
    method: 'GET',
  };
};

export {
  authrIntercept,
  withTokenAxios as axios,
  lovDefineAxiosConfig,
  lovQueryAxiosConfig,
  dateAxiosConfig,
  lookupBatchAxiosConfig,
  lovBatchAxiosConfig,
};
