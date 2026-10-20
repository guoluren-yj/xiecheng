/**
 * choerodon-ui - choerodon-ui 客制化配置文件
 * @Author: wuyunqiang <yunqiang.wu@hand-china.com>
 * @Date: 2019-08-15 09:12:30
 * @LastEditTime: 2019-08-27 09:47:01
 * @Copyright: Copyright (c) 2018, Hand
 */
import axios from 'axios';
import React, { useState } from 'react';
import { configure, message } from 'choerodon-ui';
import { Button, Form, Modal } from 'choerodon-ui/pro';
import 'utils/c7n-ued-polyfill.important.less';
import { API_HOST, HZERO_PLATFORM } from 'utils/config';
import intl from 'utils/intl';
import notification from 'utils/notification';
import {
  getAccessToken,
  getCurrentOrganizationId,
  isTenantRoleLevel,
  generateUrlWithGetParam,
} from 'utils/utils';
import { getMenuId } from 'utils/menuTab';
import FilterSelect from 'choerodon-ui/pro/lib/table/query-bar/FilterSelect';
import { $l } from 'choerodon-ui/pro/lib/locale-context';

const jsonMimeType = 'application/json';
export const withTokenAxios = axios;

if (!withTokenAxios._HZERO_AXIOS_IS_CONFIGED) {
  // 微前端模式下， 这个语句块会多次执行， 所以加一个条件限制， 只能执行一次
  withTokenAxios.defaults = {
    ...withTokenAxios.defaults,
    headers: {
      ...(withTokenAxios.defaults || {}).headers,
      // Authorization: `bearer ${getAccessToken()}`,
      'Content-Type': jsonMimeType,
      Accept: jsonMimeType,
      'X-Requested-With': 'XMLHttpRequest',
      // baseURL: API_HOST,
    },
  };

  // Add a request interceptor
  withTokenAxios.interceptors.request.use(
    (config) => {
      let { url = '' } = config;
      if (url.indexOf('://') === -1 && !url.startsWith('/_api')) {
        url = `${API_HOST}${url}`;
      }
      // Do something before request is sent
      const MenuId = getMenuId();
      if (MenuId) {
        return {
          ...config,
          url,
          headers: {
            ...config.headers,
            Authorization: `bearer ${getAccessToken()}`,
            'H-Menu-Id': `${getMenuId()}`,
          },
        };
      } else {
        return {
          ...config,
          url,
          headers: {
            ...config.headers,
            Authorization: `bearer ${getAccessToken()}`,
          },
        };
      }
    },
    (error) =>
      // Do something with request error
      Promise.reject(error)
  );

  withTokenAxios.interceptors.response.use((response) => {
    const { status, data } = response;
    if (status === 204) {
      return undefined;
    }
    if (data && data.failed) {
      // notification.error({
      //   message: data.message,
      // });
      throw data;
    } else {
      return data;
    }
  });
  withTokenAxios._HZERO_AXIOS_IS_CONFIGED = true;
}

// axios.defaults.headers.common.Authorization = `bearer ${getAccessToken()}`;
message.config({
  placement: 'bottomRight',
  bottom: 48,
  duration: 2,
});

const AdvancedQueryBarMore = ({
  queryFields,
  queryFieldsLimit = 1,
  buttons,
  dataSet,
  queryDataSet,
}) => {
  let modal;
  const queryListNum = queryFieldsLimit >= 2 ? 2 : queryFieldsLimit;
  const query = async () => {
    if (await dataSet.validate(false, false)) {
      await dataSet.query();
      modal.close();
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
            <div
              style={{
                marginTop: '10px',
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                marginLeft: 40,
              }}
            >
              <Button
                onClick={() => {
                  queryDataSet.current.reset();
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

const QueryBarMore = ({ queryFields, buttons, queryFieldsLimit = 3, dataSet, queryDataSet }) => {
  const [hidden, setHidden] = useState(true);
  const handleToggle = () => {
    setHidden(!hidden);
  };
  const query = async () => {
    if (await dataSet.validate(false, false)) {
      await dataSet.query();
    }
  };
  return (
    <div>
      {queryDataSet ? (
        <div style={{ display: 'flex', marginBottom: '10px', alignItems: 'flex-start' }}>
          <Form
            style={{ flex: 'auto' }}
            columns={queryFieldsLimit}
            dataSet={queryDataSet}
            onKeyDown={(e) => {
              if (e.keyCode === 13) return query();
            }}
          >
            {hidden ? queryFields.slice(0, queryFieldsLimit) : queryFields}
          </Form>
          <div style={{ marginTop: '10px', flexShrink: 0, display: 'flex', alignItems: 'center' }}>
            {queryFields.length > queryFieldsLimit && (
              <Button onClick={handleToggle}>
                {hidden
                  ? intl.get('hzero.common.button.viewMore').d('更多查询')
                  : intl.get('hzero.common.button.collected').d('收起查询')}
              </Button>
            )}
            <Button
              onClick={() => {
                queryDataSet.current.reset();
                dataSet.fireEvent('queryBarReset', {
                  dataSet,
                  queryFields,
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

const lovDefineAxiosConfig = (code) => ({
  url: `${API_HOST}${HZERO_PLATFORM}/v1/${
    isTenantRoleLevel() ? `${getCurrentOrganizationId()}/` : ''
  }lov-view/info?viewCode=${code}`,
  method: 'GET',
  transformResponse: [
    (data) => {
      // 对 data 进行任意转换处理
      let originData = {};

      try {
        originData = JSON.parse(data);
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error(e, data);
        return data;
      }

      const {
        height,
        viewCode = code,
        valueField = 'value',
        displayField = 'name',
        pageSize = 5,
        queryFields = [],
        tableFields = [],
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
          conditionFieldType: queryItem.dataType,
          conditionFieldSelectCode: queryItem.dataType === 'SELECT' ? queryItem.sourceCode : null,
          conditionFieldLovCode: null,
          conditionFieldName: null,
          conditionFieldTextfield: null,
          conditionFieldNewline: 'N',
          conditionFieldSelectUrl: null,
          conditionFieldSelectVf: null,
          conditionFieldSelectTf: null,
          conditionFieldSequence: 1,
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
        placeholder: title,
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
        treeFlag: 'N',
        idField: null,
        parentIdField: null,
        lovItems,
        width: tableWidth ? tableWidth + 300 : 700,
        height,
      };
    },
  ],
});

const lovQueryAxiosConfig = (code, lovConfig = {}) => {
  const { queryUrl, lovCode } = lovConfig.originData || {};
  let url = `${API_HOST}${HZERO_PLATFORM}/v1/${
    isTenantRoleLevel() ? `${getCurrentOrganizationId()}/` : ''
  }lovs/data?lovCode=${lovCode}`;
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
    // url = `${url}${url.indexOf('?') ? '&' : '?'}lovCode=${lovCode}`;
  }
  return {
    url,
    method: 'GET',
  };
};

// TODO: 批量查询lookupCode只支持独立值集，对于sql值集等的如何处理？？
// const lookupBatchAxiosConfig = codes => {
//   const url = `${API_HOST}${HZERO_PLATFORM}/v1/${
//     isTenantRoleLevel() ? `${getCurrentOrganizationId()}/` : ''
//   }lovs/value/batch`;
//   return {
//     url,
//     method: 'GET',
//     params: codes.reduce((obj, code) => {
//       // eslint-disable-next-line
//       obj[code] = code;
//       return obj;
//     }, {}),
//   };
// };

const generatePageQuery = ({ page, pageSize, sortName, sortOrder }) => ({
  page: page === undefined ? page : page - 1,
  size: pageSize,
  sort: sortName && (sortOrder ? `${sortName},${sortOrder}` : sortName),
});

configure({
  lookupUrl: (code) =>
    `${API_HOST}${HZERO_PLATFORM}/v1/${
      isTenantRoleLevel() ? `${getCurrentOrganizationId()}/` : ''
    }lovs/data?lovCode=${code}`,
  ripple: false,
  modalOkFirst: false,
  lovDefineAxiosConfig,
  lovQueryAxiosConfig,
  // lookupBatchAxiosConfig,
  lookupAxiosMethod: 'GET',
  dataKey: 'content',
  totalKey: 'totalElements',
  axios: withTokenAxios,
  generatePageQuery,
  status: {
    add: 'create',
    update: 'update',
    delete: 'delete',
  },
  // iconfontPrefix: 'c7n',
  statusKey: '_status',
  tlsKey: '_tls',
  // eslint-disable-next-line react/jsx-props-no-spreading
  queryBar: (props) => {
    const { buttons } = props;
    return buttons && buttons.findIndex((b) => b.key === 'advanced-query-slot') !== -1 ? (
      <AdvancedQueryBarMore {...props} />
    ) : (
      <QueryBarMore {...props} />
    );
  },
  feedback: {
    loadSuccess: () => {},
    loadFailed: (resp) => {
      if (resp && resp.failed) {
        notification.error({
          message: resp && resp.message,
        });
      } else if (resp && resp.response) {
        notification.error({
          icon: <></>,
          message: (
            <>
              <img
                src={require('@/assets/icon_page_wrong.svg')}
                alt=""
                className="ant-notification-notice-message-img"
              />
              <div className="ant-notification-notice-message-content">
                {intl.get(`hzero.common.requestNotification.${resp.response.status}`) ||
                  resp.message}
              </div>
            </>
          ),
          className: 'request error',
        });
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
          message: resp && resp.message,
        });
      } else if (resp && resp.response) {
        notification.error({
          icon: <></>,
          message: (
            <>
              <img
                src={require('@/assets/icon_page_wrong.svg')}
                alt=""
                className="ant-notification-notice-message-img"
              />
              <div className="ant-notification-notice-message-content">
                {intl.get(`hzero.common.requestNotification.${resp.response.status}`) ||
                  resp.message}
              </div>
            </>
          ),
          className: 'request error',
        });
      }
    },
  },
  transport: {
    tls: ({ dataSet, name: fieldName }) => {
      // TODO: 先使用 dataSet.current 下个版本 c7n 会 把 record 传进来
      const _token = dataSet.current.get('_token');
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
});

export { withTokenAxios as axios, lovDefineAxiosConfig };
