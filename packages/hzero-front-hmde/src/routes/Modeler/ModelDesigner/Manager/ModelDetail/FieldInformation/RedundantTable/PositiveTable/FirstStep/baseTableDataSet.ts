/*
 * @filename:
 * @Date: 2020-04-08 13:07:42
 * @Author: 汪渊  <yuan.wang07@hand-china.com>
 * @version: 1.0.0
 * @copyright: copyright: HAND ® 2020
 */
/**
 * 模型详情页上方 模型详情信息
 */
import { HZERO_HMDE } from '@/utils/config';
import { tablesCheck } from '@/services/modelListService';
import { lowcodeOrganizationURL } from '@/utils/common';

export default (checkObj, modelId, redundantTableName) => ({
  autoCreate: true,
  paging: false,
  autoQuery: false,
  transport: {
    read: {
      url: `${lowcodeOrganizationURL({
        route: HZERO_HMDE,
      })}/logic-models/${modelId}/redundant-table-info`,
      method: 'get',
      transformResponse: (data) => {
        if (!data) return null;
        try {
          const originData = JSON.parse(data);
          const newData = [originData].map((item) => ({
            name: item.name,
            redundantMode: checkObj.redundantMode,
            description: item.description,
          }));
          return newData;
        } catch (e) {
          return null;
        }
      },
    },
  },
  fields: [
    {
      required: true,
      name: 'name',
      label: '基础表名',
      type: 'string',
      validator: async (value, nu, record) => {
        if (!record.get('name')) {
          return '基础表名不能为空';
        }
        // 校验方法
        const patternA = /^[a-z][a-z0-9_]*$/g;
        if (!patternA.test(value) || value.toString().length > 30) {
          return '<=30字符，首字符为英文字母且只能由小写英文字母、数字、"_"组成';
        }
        if (
          !redundantTableName &&
          checkObj.refServiceCode &&
          checkObj.refSchemaName &&
          checkObj.refDataSourceType &&
          record.get('name')
        ) {
          const body = {
            name: record.get('name'),
            serviceCode: checkObj.refServiceCode,
            schemaName: checkObj.refSchemaName,
            dataSourceType: checkObj.refDataSourceType,
          };
          const res = await tablesCheck(body);
          if (res && res.message) {
            return res.message;
          }
        }
      },
    },
    {
      name: 'redundantMode',
      type: 'string',
      label: '扩展模式',
      defaultValue: 'REDUNDANT_X',
      lookupCode: 'HMDE.REDUNDANT_MODE',
      required: true,
    },
    {
      name: 'description',
      type: 'string',
      label: '表描述',
    },
  ],
});
