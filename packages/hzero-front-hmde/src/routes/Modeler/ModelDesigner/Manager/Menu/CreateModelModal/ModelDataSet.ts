/* eslint-disable no-unused-vars */
import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';

import { HZERO_HMDE } from '@/utils/config';
import { lowcodeOrganizationURL } from '@/utils/common';

export default () =>
  ({
    autoQuery: true,
    pageSize: 10,
    queryFields: [
      {
        name: 'name',
        type: 'string',
        label: '逻辑模型名称',
      },
      {
        name: 'serviceCode',
        type: 'string',
        label: '服务名',
      },
      {
        name: 'schemaName',
        type: 'string',
        label: '数据库名',
      },
      {
        name: 'refTableName',
        type: 'string',
        label: '引用表',
      },
    ],
    fields: [
      {
        name: 'dataSourceType',
        type: 'string',
        label: '数据来源类型',
        defaultValue: '数据表',
        required: true,
      },
      {
        name: 'refServiceCode',
        type: 'string',
        label: '服务名',
        required: true,
        defaultValue: 'lowcode',
      },
      {
        name: 'refSchemaName',
        type: 'string',
        label: '数据库名',
        required: true,
        defaultValue: '数据库名',
      },
      {
        name: 'name',
        type: 'string',
        label: '逻辑模型名称',
        required: true,
      },
      {
        name: 'description',
        type: 'string',
        label: '逻辑模型描述',
        maxLength: 200,
      },
      {
        name: 'refTable',
        type: 'object',
        label: '引用表',
        required: true,
        ignore: 'always',
      },
      {
        name: 'refTableName',
        type: 'string',
        label: '引用表名',
        required: true,
        bind: 'refTable.name',
      },
      {
        name: 'refTableCode',
        type: 'string',
        label: '编码',
        required: true,
        bind: 'refTable.code',
      },
      {
        name: 'sourceType',
        type: 'string',
        label: '来源',
      },
      {
        name: 'publishStatus',
        type: 'string',
        label: '发布状态',
      },
      {
        name: 'code',
        type: 'string',
      },
    ],
    transport: {
      read: () => ({
        url: `${lowcodeOrganizationURL({
          route: HZERO_HMDE,
        })}/logic-models`,
        method: 'get',
        // headers: {
        //   'app-id': appId,
        //   'draft-flag': getDraftFlag(),
        // },
      }),
      destroy: ({ data }) => ({
        url: `${lowcodeOrganizationURL({
          route: HZERO_HMDE,
        })}/logic-models/batch-delete`,
        method: 'delete',
        data,
        // headers: {
        //   'app-id': appId,
        //   'draft-flag': getDraftFlag(),
        // },
      }),
    },
    data: [{ name: '111' }],
  } as DataSetProps);
