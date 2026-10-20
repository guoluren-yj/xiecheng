/**
 * 模型详情页上方 模型详情信息
 */
import React from 'react';
import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';

import { HZERO_HMDE } from '@/utils/config';
import { lowcodeOrganizationURL } from '@/utils/common';

export default (tenantId) =>
  ({
    primaryKey: 'id',
    selection: false,
    autoQuery: false,
    paging: true,
    pageSize: 10,
    autoLocateFirst: false,
    autoLocateAfterCreate: false,
    transport: {
      read: {
        url: `${lowcodeOrganizationURL({ route: HZERO_HMDE })}/service/assign?tenantId=${tenantId}`,
        method: 'get',
      },
      submit: ({ data = [] }) => {
        return {
          url: `${lowcodeOrganizationURL({
            route: HZERO_HMDE,
          })}/service/assign?tenantId=${tenantId}`,
          method: 'put',
          data: data[0],
        };
      },
    },
    fields: [
      {
        name: 'serviceCode',
        type: 'string',
        label: '服务名称',
      },
      {
        name: 'createApiFlag',
        type: 'boolean',
        label: '授权创建API结构',
        trueValue: 1,
        falseValue: 0,
        defaultValue: 0,
        help: '服务创建API结构的权限，即该租户的租户角色有权限在该服务下创建API结构',
      },
      {
        name: 'allApiFlag',
        type: 'boolean',
        label: 'API结构授权',
        trueValue: 1,
        falseValue: 0,
        defaultValue: 0,
        help: (
          <React.Fragment>
            <div>全部授权：可支持授权该租户对应服务全部API结构的使用权限；</div>
            <div>权限分配：支持授权该租户对应服务下勾选的API结构；</div>
          </React.Fragment>
        ),
      },
      {
        name: 'command',
        label: '操作',
      },
    ],
    events: {
      update: ({ name, dataSet }) => {
        if (['createApiFlag', 'allApiFlag'].includes(name)) {
          dataSet.submit();
          // checkBoxOnChange(record.data, name, value);
        }
      },
    },
  } as DataSetProps);
