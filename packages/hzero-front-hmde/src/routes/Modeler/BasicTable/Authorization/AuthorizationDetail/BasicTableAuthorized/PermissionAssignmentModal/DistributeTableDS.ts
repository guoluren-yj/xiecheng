/**
 * 模型详情页上方 模型详情信息
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
        url: `${lowcodeOrganizationURL({ route: HZERO_HMDE })}/datasource/assign/table/assignable`,
        method: 'get',
      },
    },
    fields: [
      {
        name: 'name',
        type: 'string',
        label: '表名称',
      },
      {
        name: 'description',
        type: 'string',
        label: '表描述',
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
        url: `${lowcodeOrganizationURL({ route: HZERO_HMDE })}/datasource/assign/table/assigned`,
        method: 'get',
      },
    },
    fields: [
      {
        name: 'name',
        type: 'string',
        label: '表名称',
      },
      {
        name: 'description',
        type: 'string',
        label: '表描述',
      },
    ],
    events: {
      update: () => {},
    },
  } as DataSetProps);
