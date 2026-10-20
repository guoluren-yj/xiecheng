/**
 * 逻辑模型详情页上方 模型详情信息
 */
import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';

import { HZERO_HMDE } from '@/utils/config';
import { lowcodeOrganizationURL } from '@/utils/common';

export const leftDs = () =>
  ({
    primaryKey: 'id',
    selection: 'multiple',
    paging: false,
    autoQuery: false,
    autoLocateFirst: false,
    autoLocateAfterCreate: false,
    transport: {
      read: {
        url: `${lowcodeOrganizationURL({ route: HZERO_HMDE })}/service/assign/api/assignable`,
        method: 'get',
      },
    },
    fields: [
      {
        name: 'apiPath',
        type: 'string',
        label: 'API路径',
      },
      {
        name: 'description',
        type: 'string',
        label: 'API描述',
      },
      {
        name: 'apiMethod',
        type: 'string',
        label: '请求方式',
      },
    ],
    events: {
      update: () => {},
    },
  } as DataSetProps);

export const rightDs = () =>
  ({
    primaryKey: 'id',
    selection: 'multiple',
    paging: false,
    autoQuery: false,
    autoLocateFirst: false,
    autoLocateAfterCreate: false,
    transport: {
      read: {
        url: `${lowcodeOrganizationURL({ route: HZERO_HMDE })}/service/assign/api/assigned`,
        method: 'get',
      },
    },
    fields: [
      {
        name: 'apiPath',
        type: 'string',
        label: 'API路径',
      },
      {
        name: 'description',
        type: 'string',
        label: 'API描述',
      },
      {
        name: 'apiMethod',
        type: 'string',
        label: '请求方式',
      },
    ],
    events: {
      update: () => {},
    },
  } as DataSetProps);
