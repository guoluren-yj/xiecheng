/* eslint-disable no-unused-vars */
/*
 * @filename:
 * @Date: 2020-04-03 23:53:05
 * @Author: 汪渊  <yuan.wang07@hand-china.com>
 * @version: 1.0.0
 * @copyright: copyright: HAND ® 2020
 */
import { HZERO_HMDE } from '@/utils/config';
import { lowcodeOrganizationURL } from '@/utils/common'; // 新增
import { isTenantRoleLevel } from 'utils/utils';

export default (organizationId, modelId, lovPara = {}) => ({
  autoCreate: true,
  paging: false,
  autoQuery: false,
  parentField: 'secParentCode',
  fields: [
    {
      name: 'dataSourceType',
      type: 'string',
      label: '数据来源类型',
      required: true,
      defaultValue: 'TABLE',
    },
    {
      name: 'reFTable',
      type: 'object',
      label: '引用表',
      lovCode: isTenantRoleLevel() ? 'HMDE.REDUN_TABLE' : 'HMDE.REDUN_TABLE.SITE',
      required: true,
      ignore: 'always',
      textField: 'name',
      valueField: 'code',
      lovPara,
      dynamicProps: {
        lovQueryAxiosConfig: function lovQueryAxiosConfig() {
          return {
            url: `${lowcodeOrganizationURL({
              route: HZERO_HMDE,
            })}/tables/page?tableTypeList=REDUNDANT`,
            method: 'GET',
          };
        },
      },
    },
    {
      name: 'code',
      type: 'string',
      bind: 'reFTable.code',
    },
    {
      name: 'name',
      type: 'string',
      bind: 'reFTable.name',
    },
    {
      name: 'id',
      type: 'string',
      bind: 'reFTable.id',
    },
    {
      name: 'description',
      type: 'string',
      bind: 'reFTable.description',
    },
  ],
  transport: {
    read: () => ({
      url: `${lowcodeOrganizationURL({
        route: HZERO_HMDE,
      })}/logic-models/${modelId}/redundant-table-info`,
      method: 'get',
      dataKey: null,
      transformResponse: (res) => {
        if (!res) return null;
        try {
          const originData = JSON.parse(res);
          Object.assign(originData, { dataSourceType: 'TABLE' });
          return originData;
        } catch (e) {
          return null;
        }
      },
    }),
  },
});
