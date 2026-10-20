/*
 * @filename:
 * @Date: 2021-04-01
 * @Author: 汪渊  <yuan.wang07@hand-china.com>
 * @version: 1.0.0
 * @copyright: copyright: HAND ® 2021
 */
/**
 * 逻辑模型详情页上方 逻辑模型详情信息
 */
import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
import Record from 'choerodon-ui/pro/lib/data-set/Record';
import { getCurrentOrganizationId, isTenantRoleLevel } from 'utils/utils';

import { HZERO_HMDE } from '@/utils/config';
import { lowcodeOrganizationURL } from '@/utils/common';
import { tablesCheck } from '@/services/modelListService';

const isTenantRole = isTenantRoleLevel();
const currentOrganizationId = getCurrentOrganizationId();
// const organizationId = 0;
export default ({ serviceCode, schemaName, dataSourceType, _tenantId, level }) => {
  return {
    autoCreate: true,
    parentField: 'secParentCode',
    fields: [
      {
        required: true,
        name: 'name',
        label: '基础表名',
        type: 'string',
        maxLength: 30,
        validator: async (value, nu, record: Record) => {
          // 校验方法
          const patternA = /^[a-zA-Z][A-Za-z0-9_]*$/g;
          if (!patternA.test(value) || value.toString().length > 30) {
            return '<=30字符，首字符为英文字母且只能由大小写英文字母、数字、"_"组成';
          }
          // if (serviceCode && schemaName && dataSourceType && record.get('name')) {
          const body = {
            name: record.get('name'),
            serviceCode: serviceCode || record.get('serviceCode'),
            schemaName: schemaName || record.get('schemaName'),
            dataSourceType: dataSourceType || record.get('dataSourceType'),
          };
          const res = await tablesCheck(body);
          if (res && res.message) {
            return res.message;
          }
          // }
        },
      },
      {
        name: 'description',
        type: 'string',
        label: '表描述',
      },
      {
        name: 'source',
        type: 'object',
        label: '数据源',
        ignore: 'always',
        lookupCode: isTenantRole
          ? 'HMDE.TABLE.SERVICE.DATASOURCE'
          : 'HMDE.TABLE.SERVICE.DATASOURCE.SITE',
        textField: 'schemaName',
        valueField: 'id',
        dynamicProps: {
          required: () => !serviceCode,
          lovPara: ({ dataSet }) => ({
            serviceCode: dataSet.queryParameter.serviceCode,
          }),
        },
        lovQueryAxiosConfig: {
          url: `${lowcodeOrganizationURL({
            route: HZERO_HMDE,
          })}/lovs/data`,
          method: 'GET',
        },
        cascadeMap: { serviceCode: 'service.serviceCode' },
      },
      {
        name: 'service',
        type: 'object',
        lovCode: isTenantRole ? 'HMDE.TABLE.SERVICE' : 'HMDE.TABLE.SERVICE.SITE',
        label: '服务',
        dynamicProps: {
          required: () => !serviceCode,
          lovPara: () => {
            if (isTenantRole || level === 'tenant') {
              return {
                tenantId: isTenantRole ? currentOrganizationId : _tenantId,
              };
            } else {
              return {};
            }
          },
        },
        ignore: 'always',
      },
      // bing保存需要传给后端的字段
      {
        name: 'dataSourceType',
        type: 'string',
        bind: 'source.dataSourceType',
      },
      {
        name: 'schemaName',
        type: 'string',
        bind: 'source.schemaName',
      },
      {
        name: 'serviceCode',
        type: 'string',
        bind: 'service.serviceCode',
      },
    ],
    events: {
      // update: ({name, dataSet }) => {
      //   if(name === 'source') {
      //     dataSet.current.set('source', "");
      //   }
      // },
    },
  } as DataSetProps;
};
