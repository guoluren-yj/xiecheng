/**
 * choerodon-ui - choerodon-ui 客制化配置文件
 * @Author: wuyunqiang <yunqiang.wu@hand-china.com>
 * @Date: 2019-08-15 09:12:30
 * @LastEditTime: 2019-08-27 09:47:01
 * @Copyright: Copyright (c) 2018, Hand
 */
import React, { useState, useMemo } from 'react';
import JSONBig from 'json-bigint';
import JSON3 from 'json3';
import { toJS } from 'mobx';
import { configure, message, notification as c7nNotification } from 'choerodon-ui';
import { Button, Form, Modal, Table } from 'choerodon-ui/pro';
import { formatNumber } from 'choerodon-ui/dataset';
import BigNumber from 'bignumber.js';
import intl from 'utils/intl';
import notification from 'utils/notification';
import {
  getCurrentOrganizationId,
  getCurrentUser,
  getCurrentUserId,
  getResponse,
  isEqualOrganization,
  isTenantRoleLevel,
  getCurrentUserDateFormatPerfer,
  getDateFormat,
  getDateMonthFormat,
  getDateTimeFormat,
  getTimeFormat,
} from 'utils/utils';
import { getEnvConfig } from 'utils/iocUtils';
import request from 'utils/request';
import { $l } from 'choerodon-ui/pro/lib/locale-context';
import { ShowValidation } from 'choerodon-ui/pro/lib/form/enum';
import { isEmpty, isString, isArray, isNil, isObject } from 'lodash';
import structuredClone from 'core-js-pure/actual/structured-clone';

import {
  axios,
  authrIntercept,
  dateAxiosConfig,
  lookupBatchAxiosConfig,
  lovBatchAxiosConfig,
  lovDefineAxiosConfig,
  lovQueryAxiosConfig,
} from './c7nUiConfig';
import DocumentWizardPopover from '../components/DocumentWizardPopover';
import { SRM_PLATFORM } from './config';
import attachmentConfig from '../components/Attachment';
import '../utils/polyfill';

const { FilterSelect } = Table;

if (typeof window !== 'undefined') {
  JSON3.noConflict();
  window.JSON3 = JSON3;
  window.$JSON = window.$JSON || window.JSON;
  Object.defineProperty(window, 'JSON', {
    get() {
      return JSONBig;
    },
    set() {},
  });
  if (typeof Response !== 'undefined') {
    Response.prototype.json = function () {
      return this.text().then((text) => JSON.parse(text));
    };
  }
}
const { toFixed, toFormat } = BigNumber.prototype;
Object.assign(BigNumber.prototype, {
  // 兼容 React 数字渲染
  [Symbol.iterator]() {
    return this.toString()[Symbol.iterator]();
  },
  // 兼容格式化
  toLocaleString(lang, options) {
    return formatNumber(this, lang, options);
  },
  toFixed(decimalPlaces, roundingMode) {
    const dp = Number(decimalPlaces);
    return toFixed.call(this, isNaN(dp) ? 0 : dp, roundingMode);
  },
  toFormat(decimalPlaces, roundingMode, format) {
    if (decimalPlaces === undefined) {
      decimalPlaces = this.dp();
    }
    return toFormat.call(this, decimalPlaces, roundingMode, format);
  },
});
// 兼容 lodash.isNumber
Object.defineProperty(BigNumber.prototype, Symbol.toStringTag, {
  value: 'Number',
});
export const pagination = {
  pageSizeEditable: true,
  showQuickJumper: true,
};

if (!window.structuredClone) {
  window.structuredClone = structuredClone;
}

export function loadConfig() {
  // axios.defaults.headers.common.Authorization = `bearer ${getAccessToken()}`;
  message.config({
    placement: 'bottomRight',
    bottom: 48,
    duration: 2,
  });

  c7nNotification.config({
    placement: 'bottomRight',
    foldCount: 2,
    icons: {
      success: 'check_circle',
      info: 'info',
      error: 'cancel',
      warning: 'info',
    },
  });
  const SelectionPlaceholder = () =>
    intl.get('hzero.common.lov.selectDataOnTheLeft').d('请勾选左侧数据');
  const AdvancedQueryBarMore = ({
    queryFields,
    queryFieldsLimit = 1,
    buttons,
    dataSet,
    queryDataSet,
    cache,
  }) => {
    let modal;
    const queryListNum = queryFieldsLimit >= 2 ? 2 : queryFieldsLimit;
    const query = async () => {
      if (await dataSet.validate(false, false)) {
        await dataSet.query(1, undefined, cache);
        if (modal) {
          modal.close();
        }
      }
    };
    const topActionNode =
      buttons && buttons.length > 0 && buttons.filter((b) => b.key === 'advanced-query-slot');
    const actionButtons =
      buttons && buttons.length > 0 && buttons.filter((b) => b.key !== 'advanced-query-slot');
    const showAllQuery = () => {
      modal = Modal.open({
        title: intl.get('hzero.c7nProUI.Table.advanced_query_conditions').d('高级查询条件'),
        children: <Form labelLayout="float">{queryFields}</Form>,
        okText: intl.get('hzero.common.status.search').d('查询'),
        onOk: query,
        className: 'c7n-advanced-query-conditions-modal',
        style: {
          width: '3.8rem',
        },
        drawer: true,
      });
    };
    const queryBar = (
      <div className="c7n-customer-advanced-query-bar">
        {actionButtons.length > 0 && topActionNode}
        {queryDataSet ? (
          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <div
              style={{
                display: 'flex',
                marginBottom: '10px',
                alignItems: 'flex-end',
                width: '60%',
              }}
            >
              {actionButtons && actionButtons.length ? (
                <div style={{ marginBottom: 4 }}>{actionButtons}</div>
              ) : (
                <div style={{ marginBottom: 4 }}>{topActionNode}</div>
              )}
            </div>
            <div
              style={{
                width: '40%',
                display: 'flex',
                alignItems: 'flex-start',
              }}
            >
              <Form
                style={{ flex: 'auto' }}
                columns={queryListNum}
                labelLayout="float"
                dataSet={queryDataSet}
                onKeyDown={(e) => {
                  if (e.keyCode === 13) return query();
                }}
              >
                {queryFields.slice(0, queryListNum)}
              </Form>
              {queryFields.length > queryListNum && (
                <div
                  style={{
                    marginTop: '10px',
                    flexShrink: 0,
                    display: 'flex',
                    alignItems: 'center',
                    marginLeft: 16,
                  }}
                >
                  <Button
                    onClick={() => {
                      if (queryDataSet.current) {
                        queryDataSet.current.reset();
                      }
                      dataSet.fireEvent('queryBarReset', {
                        dataSet,
                        queryFields,
                      });
                    }}
                  >
                    {intl.get('hzero.common.button.reset').d('重置')}
                  </Button>
                  <Button dataSet={null} color="primary" onClick={showAllQuery}>
                    {intl.get('hzero.c7nProU.Table.advanced_query').d('查询更多')}
                  </Button>
                </div>
              )}
            </div>
          </div>
        ) : null}
      </div>
    );
    const getFilterSelect = () => {
      return (
        <FilterSelect
          key="filter"
          prefixCls="c7n-pro-table-filter-select"
          className="c7n-pro-table-advanced-query-bar-options"
          optionDataSet={dataSet}
          queryDataSet={queryDataSet}
          prefix={`${$l('Table', 'advanced_query_conditions')}:`}
          editable={false}
          filter={(value) =>
            queryFields.slice(0, queryListNum).every((element) => element.props.name !== value)
          }
          hiddenIfNone
        />
      );
    };
    return [queryBar, getFilterSelect()];
  };

  const QueryBarMore = ({
    queryFields,
    buttons,
    queryFieldsLimit = 3,
    dataSet,
    queryDataSet,
    defaultShowMore,
    onBeforeQuery,
    labelLayout,
    cache,
  }) => {
    const [hidden, setHidden] = useState(!defaultShowMore);
    const handleToggle = () => {
      setHidden(!hidden);
    };
    const query = async () => {
      if (!onBeforeQuery || (await onBeforeQuery({ dataSet, queryDataSet })) !== false) {
        await dataSet.query(1, undefined, cache);
      }
    };
    const buttonWrapperStyle = {
      marginLeft: '16px',
      flexShrink: 0,
      display: 'flex',
      alignItems: 'center',
    };
    if (labelLayout !== 'float') {
      buttonWrapperStyle.marginTop = '11px';
    }
    const sortedQuertFields = useMemo(() => {
      let fields = [];
      if (queryDataSet && queryDataSet.getState('sortQueryFieldsByCustomize')) {
        queryDataSet.fields.forEach((_, fieldName) => {
          const field = queryFields.find((queryField) => queryField.key === fieldName);
          if (field) {
            fields.push(field);
          }
        });
      } else {
        fields = queryFields;
      }
      return fields;
    }, [queryDataSet, queryDataSet && queryDataSet.fields, queryFields]);
    return (
      <div>
        {queryDataSet ? (
          <div style={{ display: 'flex', marginBottom: '16px', alignItems: 'flex-start' }}>
            <Form
              labelLayout={labelLayout}
              style={{ flex: 'auto' }}
              columns={queryFieldsLimit}
              dataSet={queryDataSet}
              onKeyDown={(e) => {
                if (e.keyCode === 13) return query();
              }}
            >
              {hidden ? sortedQuertFields.slice(0, queryFieldsLimit) : sortedQuertFields}
            </Form>
            <div style={buttonWrapperStyle}>
              {sortedQuertFields.length > queryFieldsLimit && (
                <Button onClick={handleToggle}>
                  {hidden
                    ? intl.get('hzero.common.button.viewMore').d('更多查询')
                    : intl.get('hzero.common.button.collected').d('收起查询')}
                </Button>
              )}
              <Button
                onClick={() => {
                  if (queryDataSet.current) {
                    queryDataSet.current.reset();
                  }
                  dataSet.fireEvent('queryBarReset', {
                    dataSet,
                    sortedQuertFields,
                  });
                }}
              >
                {intl.get('hzero.common.button.reset').d('重置')}
              </Button>
              <Button dataSet={null} color="primary" onClick={query}>
                {intl.get('hzero.common.button.search').d('查询')}
              </Button>
            </div>
          </div>
        ) : null}
        {buttons && buttons.length ? <div style={{ marginBottom: 4 }}>{buttons}</div> : null}
      </div>
    );
  };

  const lookupAxiosConfig = ({ params, lookupCode }) => {
    let publicFlag = false;
    let lovParams = {};
    if (params) {
      const { publicMode, ...other } = params;
      publicFlag = publicMode;
      lovParams = other;
    }
    const { API_HOST, HZERO_PLATFORM } = getEnvConfig();
    return {
      url: lookupCode
        ? `${API_HOST}${HZERO_PLATFORM}/v1/${
            // eslint-disable-next-line no-nested-ternary
            publicFlag ? 'pub/' : isEqualOrganization() ? `${getCurrentOrganizationId()}/` : ''
          }lovs/data?lovCode=${lookupCode}`
        : undefined,
      method: 'GET',
      params: lovParams,
      transformResponse: (data) => {
        // 对 data 进行任意转换处理
        let originData = data || [];
        if (typeof data === 'string') {
          try {
            originData = JSON.parse(data);
          } catch (e) {
            originData = data;
          }
        }
        return originData;
      },
    };
  };

  const lovQueryCachedSelected = (code, recordMap) => {
    const { HZERO_PLATFORM } = getEnvConfig();
    return request(
      `${HZERO_PLATFORM}/v1/${getCurrentOrganizationId()}/ui-customize/translateLov?lovViewCode=${code}`,
      {
        body: [...recordMap.keys()],
        method: 'POST',
      }
    ).then((res) => {
      if (getResponse(res)) {
        return Object.keys(res).reduce((list, key) => {
          const value = res[key];
          if (!isString(value)) {
            list.push(value);
          }
          return list;
        }, []);
      }
      return [];
    });
  };

  const generatePageQuery = ({
    page,
    pageSize,
    sortName,
    sortOrder,
    sort,
    count,
    defaultCount,
    totalCount,
    onlyCount,
    countLimit,
  }) => ({
    page: page === undefined ? page : page - 1,
    size: pageSize,
    sort: sort || (sortName && (sortOrder ? `${sortName},${sortOrder}` : sortName)),
    asyncCountFlag:
      onlyCount === 'Y'
        ? undefined
        : count === 'N'
        ? 'Y'
        : count === 'Y'
        ? 'N'
        : defaultCount === 'N'
        ? 'DEFAULT'
        : undefined,
    oldTotalElements: totalCount,
    onlyCountFlag: onlyCount,
    countLimitFlag: onlyCount === 'Y' && countLimit !== 'N' ? 'Y' : undefined,
  });

  const renderQueryBar = (outerProps) => {
    return (props) => {
      const { buttons } = props;
      if (buttons) {
        if (buttons.findIndex((b) => b.key === 'advanced-query-slot') !== -1) {
          return <AdvancedQueryBarMore {...props} cache={outerProps.cache} />;
        }
        // if (buttons.findIndex((b) => b.key === 'filter-bar') !== -1) {
        //   return <FilterBar className='c7n-pro-lov-table-query-bar' {...props} />;
        // }
      }
      return (
        <QueryBarMore {...props} labelLayout={outerProps.labelLayout} cache={outerProps.cache} />
      );
    };
  };

  const getCustomizedComponentTag = (component) => {
    switch (component) {
      case 'Tabs':
        return 'tabs';
      case 'Modal':
        return 'modal';
      default:
        return 'table';
    }
  };

  /**
   * 脱敏组件
   * secretFieldGetAdditionInfo-获取验证方式及其对应值
   * secretFieldFetchVerifyCode-获取验证码
   * secretFieldQueryData-校验验证码并返回原始数据
   * secretFieldSaveData-保存编辑数据
   */
  const secretFieldFetchVerifyCode = (typeValue) => {
    const { HZERO_PLATFORM } = getEnvConfig();
    return request(`${HZERO_PLATFORM}/v1/desensitize/captcha?type=${typeValue}`, {
      method: 'GET',
    }).then((res) => {
      const result = getResponse(res);
      if (result) {
        return result;
      }
    });
  };
  const secretFieldQueryData = (params) => {
    const { HZERO_PLATFORM } = getEnvConfig();
    return request(`${HZERO_PLATFORM}/v1/desensitize/captcha/check`, {
      body: params,
      method: 'POST',
      responseType: 'text',
    }).then((res) => {
      try {
        if (res === undefined) return '';
        const errorResult = JSON.parse(res);
        getResponse(errorResult);
        if (errorResult.failed) {
          return errorResult;
        } else {
          return String(res);
        }
      } catch {
        if (isEmpty(res)) {
          return '';
        } else {
          return String(res);
        }
      }
    });
  };
  const secretFieldSaveData = (params) => {
    const { HZERO_PLATFORM } = getEnvConfig();
    return request(`${HZERO_PLATFORM}/v1/desensitize/value/save`, {
      body: params,
      method: 'POST',
      responseType: 'text',
    }).then((res) => {
      try {
        if (res === undefined) return '';
        const errorResult = JSON.parse(res);
        getResponse(errorResult);
        if (errorResult.failed) {
          return errorResult;
        } else {
          return String(res);
        }
      } catch {
        if (isEmpty(res)) {
          return '';
        } else {
          return String(res);
        }
      }
    });
  };
  const secretFieldEnable = () => {
    const {
      additionInfo: { enableDesensitize },
    } = getCurrentUser();
    return enableDesensitize;
  };
  const secretFieldTypes = () => {
    const {
      additionInfo: { phone = '', email = '' },
    } = getCurrentUser();
    return [
      {
        type: 'phone',
        name: intl.get('hzero.common.SecretField.phone').d('电话'),
        value: phone,
      },
      {
        type: 'email',
        name: intl.get('hzero.common.SecretField.email').d('邮箱'),
        value: email,
      },
    ];
  };

  configure({
    colorPreset: true,
    tableBorder: false,
    ripple: false,
    tableColumnEditorBorder: true,
    tableHighLightRow: 'focus',
    tableCommandProps: { funcType: 'link', color: 'primary' },
    tableRowHeight: 28,
    tableHeaderRowHeight: () => 26,
    tableFooterRowHeight: () => 26,
    tooltip: (target) => (['output'].includes(target) ? undefined : 'overflow'),
    tooltipTheme: (target) => (target === 'validation' ? 'light' : 'dark'),
    tooltipPlacement: (target) => (target === 'table-cell' ? 'top' : undefined),
    tableColumnDraggable: true,
    tableColumnTitleEditable: true,
    tableHeightChangeable: false,
    tableColumnAlign(_column, field, record) {
      if (field) {
        switch (field.get('type', record)) {
          case 'number':
          case 'currency':
          case 'bigNumber':
            return 'right';
          default:
        }
      }
    },
    cacheRecords: true,
    tableShowCachedTips: true,
    // tableShowSelectionTips: true,
    tableVirtualCell: true,
    highlightRenderer: ({ ...props }, element) => (
      <DocumentWizardPopover {...props}>{element}</DocumentWizardPopover>
    ),
    dropdownMatchSelectWidth: false,
    showRequiredColorsOnlyEmpty: true,
    dateTimePickerOkButton: true,
    attachment: attachmentConfig,
    renderEmpty(componentName) {
      switch (componentName) {
        case 'Attachment':
          return (
            <div
              style={{
                padding: '30px 0',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
            >
              <img
                src={require('@/assets/illustrator_none.svg')}
                alt="empty"
                style={{ marginBottom: 10 }}
              />
              {$l('Attachment', 'no_attachments')}
            </div>
          );
        case 'Table':
          return $l('Table', 'empty_data');
        case 'Select':
          return $l('Select', 'no_matching_results');
        case 'Output':
          return '-';
        default:
      }
    },
    customizable: true,
    async customizedLoad(customizedCode, component) {
      const tenantId = getCurrentOrganizationId();
      const userId = getCurrentUserId();
      const code = `${getCustomizedComponentTag(component)}.customized.${customizedCode}`;
      const localCode = `${code}.${tenantId}.${userId}`;
      const serializedCustomized = localStorage.getItem(localCode);
      if (serializedCustomized) {
        try {
          const customized = JSON.parse(serializedCustomized);
          if (tenantId === 0 || Date.now() - customized.lastUpdateTime < 60 * 60000) {
            return customized;
          }
        } catch (e) {
          console.error(e);
        }
      }
      if (tenantId !== 0 && tenantId !== undefined && userId !== undefined) {
        try {
          const { dataJson } = await request(`${SRM_PLATFORM}/v1/${tenantId}/personal-tables`, {
            method: 'GET',
            query: {
              code,
              tenantId,
              userId,
            },
          });
          const remoteCustomized = {
            ...(dataJson ? JSON.parse(dataJson) : {}),
            lastUpdateTime: Date.now(),
          };
          const newSerializedCustomized = JSON.stringify(remoteCustomized);
          localStorage.setItem(localCode, newSerializedCustomized);
          return remoteCustomized;
        } catch (e) {
          console.error(e);
        }
      }
      return {
        columns: {},
      };
    },
    customizedSave(customizedCode, customized, component) {
      const code = `${getCustomizedComponentTag(component)}.customized.${customizedCode}`;
      const tenantId = getCurrentOrganizationId();
      const userId = getCurrentUserId();
      const localCode = `${code}.${tenantId}.${userId}`;
      const serializedCustomized = JSON.stringify({
        ...customized,
        lastUpdateTime: Date.now(),
      });
      localStorage.setItem(localCode, serializedCustomized);
      if (tenantId !== 0 && tenantId !== undefined && userId !== undefined) {
        request(`${SRM_PLATFORM}/v1/${tenantId}/personal-tables`, {
          method: 'POST',
          body: {
            code,
            tenantId,
            userId,
            dataJson: serializedCustomized,
          },
        });
      }
    },
    pagination,
    drawerOkFirst: true,
    lovSelectionProps: {
      placeholder: <SelectionPlaceholder />,
    },
    lovTableProps: {
      className: 'c7n-pro-lov-table',
      boxSizing: 'wrapper',
      style: {
        maxHeight: 'calc(100vh - 300px)',
      },
    },
    lovModalProps: {
      className: 'c7n-pro-lov-modal',
      bodyStyle: {
        minHeight: 'auto',
      },
    },
    modalOkFirst: false,
    lovDefineAxiosConfig,
    lovQueryAxiosConfig,
    lookupAxiosConfig,
    lookupUrl: (code) => {
      const { API_HOST, HZERO_PLATFORM } = getEnvConfig();
      return `${API_HOST}${HZERO_PLATFORM}/v1/${
        isTenantRoleLevel() ? `${getCurrentOrganizationId()}/` : ''
      }lovs/data?lovCode=${code}`;
    },
    lovQueryUrl: undefined,
    lovQueryCachedSelected,
    dateAxiosConfig,
    lookupBatchAxiosConfig,
    lovBatchAxiosConfig,
    lookupAxiosMethod: 'GET',
    lookupShowTextIfNotFound: ({ name, value, record, showValueIfNotFound }) => {
      let text;
      if (record && name && value !== null && value !== undefined && value !== '') {
        text = record.get(`${name}Meaning`);
        const recordField = record.getField(name);
        if (recordField) {
          const multiple = recordField && recordField.get('multiple');
          if (multiple && text) {
            try {
              const multipleValue = toJS(record.get(name));
              if (multipleValue && isArray(multipleValue)) {
                const index = multipleValue.findIndex((item) => item === value);
                if (index !== -1) {
                  let multipleText;
                  if (isArray(text)) {
                    multipleText = text;
                  } else if (isString(text) && isArray(JSON.parse(text))) {
                    multipleText = JSON.parse(text);
                  }
                  if (multipleText) {
                    text = multipleText[index];
                  }
                }
              }
            } catch (e) {
              // eslint-disable-next-line no-empty
            }
          } else if (!multiple && !isArray(text) && isObject(text) && text) {
            text = text[value];
          }
        }
      }
      if (isNil(text) && showValueIfNotFound) {
        text = value;
      }
      if (!isArray(text) && isObject(text)) {
        text = undefined;
      }
      return text;
    },
    lovNoCache: true,
    autoCount: false,
    lovQueryAutoCount: false,
    dataKey: 'content',
    totalKey: 'totalElements',
    axios,
    generatePageQuery,
    formatter: {
      // timeZone: (value, options = {}) => {
      //   if (options.boundaryType) {
      //     const offset = value.utcOffset() / 60;
      //     return ` (GMT${offset < 0 ? '-' : '+'}${Math.abs(offset)})`;
      //   }
      //   return <span className="c7n-time-zone"> ({getCurrentUser().timeZone})</span>;
      // },
    },
    status: {
      add: 'create',
      update: 'update',
      delete: 'delete',
    },
    // iconfontPrefix: 'c7n',
    statusKey: '_status',
    tlsKey: '_tls',
    useColon: true,
    modalAutoCenter: true,
    // queryBar: props => <QueryBarMore {...props} />,
    // eslint-disable-next-line
    queryBar: renderQueryBar({
      labelLayout: 'float',
    }),
    lovQueryBar: renderQueryBar({
      labelLayout: 'float',
      cache: true,
    }),
    feedback: {
      loadSuccess: () => {},
      loadFailed: (resp) => {
        if (resp && resp.failed) {
          notification.error({
            message: intl.get('hzero.common.status.mistake').d('错误'),
            description: resp && resp.message,
          });
        } else if (resp && resp.response) {
          notification.error({
            message: intl.get('hzero.common.status.mistake').d('错误'),
            description:
              intl.get(`hzero.common.requestNotification.${resp.response.status}`) || resp.message,
          });
          if (!authrIntercept(resp.response.status)) {
            // eslint-disable-next-line no-useless-return
            return;
          }
        }
      },
      submitSuccess: (resp) => {
        notification.success({
          message: resp && resp.message,
        });
      },
      submitFailed: (resp) => {
        if (resp && resp.failed) {
          notification.error({
            message: intl.get('hzero.common.status.mistake').d('错误'),
            description: resp && resp.message,
          });
        } else if (resp && resp.response) {
          notification.error({
            message: intl.get('hzero.common.status.mistake').d('错误'),
            description:
              intl.get(`hzero.common.requestNotification.${resp.response.status}`) || resp.message,
          });
          if (!authrIntercept(resp.response.status)) {
            // eslint-disable-next-line no-useless-return
            return;
          }
        }
      },
    },
    transport: {
      tls: ({ name: fieldName, record }) => {
        const _token = record.get('_token');
        const { HZERO_PLATFORM } = getEnvConfig();
        return {
          url: `${HZERO_PLATFORM}/v1/multi-language`,
          method: 'GET',
          params: { _token, fieldName },
          transformResponse: (data) => {
            try {
              const jsonData = JSON.parse(data);
              if (jsonData && !jsonData.faied) {
                const tlsRecord = {};
                jsonData.forEach((intlRecord) => {
                  tlsRecord[intlRecord.code] = intlRecord.value;
                });
                return [{ [fieldName]: tlsRecord }];
              }
            } catch (e) {
              // do nothing, use default error deal
            }
            return data;
          },
        };
      },
    },
    /**
     * secretFieldTypes-验证方式、对应号码及其对应多语言
     * secretFieldFetchVerifyCode-获取验证码
     * secretFieldQueryData-校验验证码并返回原始数据
     * secretFieldSaveData-保存编辑数据
     */
    // true enable
    secretFieldEnable,
    secretFieldTypes,
    secretFieldFetchVerifyCode,
    secretFieldQueryData,
    secretFieldSaveData,
    fieldMaxTagCount: 5,
    fieldMaxTagPlaceholder: '...',
    showValidation: ShowValidation.newLine,
    lovPatching: () => [
      {
        code: 'SSLM.SUPPLIER_CHOOSE',
        name: 'supplierChooseFlag',
        description: intl
          .get('hzero.common.pagination.patching.supplierChooseFlag.desc')
          .d(
            '选择“精确”时，将按照lov中所选供应商信息匹配与其一致的单据；选择“按平台或按本地供应商”时，将筛选包含该平台供应商或本地供应商的所有单据；例如，本地供应商a作为不协同供应商时，产生订单01。后续转化为协同供应商，关联平台供应商A，产生订单02。选择“精确”时，LOV中只能选到当前已经关联的“A&a”数据，只能查询到订单02；选择“按本地供应商”时，LOV中可以选到“a”本地供应商，可以查询出订单01和订单02。'
          ),
        options: [
          {
            value: 0,
            meaning: intl
              .get('hzero.common.pagination.patching.supplierChooseFlag.meaning1')
              .d('精确'),
          },
          {
            value: 1,
            meaning: intl
              .get('hzero.common.pagination.patching.supplierChooseFlag.meaning2')
              .d('按平台供应商'),
          },
          {
            value: 2,
            meaning: intl
              .get('hzero.common.pagination.patching.supplierChooseFlag.meaning3')
              .d('按本地供应商'),
          },
        ],
      },
    ],
    getDateShowFormat: () => {
      const userFormatPerfer = getCurrentUserDateFormatPerfer();
      if (!userFormatPerfer) {
        return undefined;
      } else {
        return {
          dateFormat: getDateFormat(),
          dateTimeFormat: getDateTimeFormat(),
          timeFormat: getTimeFormat(),
          monthFormat: getDateMonthFormat(),
        };
      }
    },
  });
}

export default loadConfig;
