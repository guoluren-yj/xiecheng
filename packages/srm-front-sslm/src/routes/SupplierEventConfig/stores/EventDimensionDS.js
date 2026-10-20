/**
 * 事件数据分配 DataSet
 * @Author: chendengji <dengji.chen@hand-china.com>
 * @Date: 2020-08-20 13:37:15
 * @LastEditTime: 2019-10-11 10:03:57
 * @Copyright: Copyright (c) 2018, Hand
 */
import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';
import { SRM_SSLM } from '_utils/config';

const organizationId = getCurrentOrganizationId();

export default () => ({
  autoQuery: true,
  cacheSelection: true,
  primaryKey: 'exportCfAssignId',
  transport: {
    read: ({ data, params }) => {
      const { exportCfId, ...other } = data;
      return {
        url: `${SRM_SSLM}/v1/${organizationId}/export-cf-lines`,
        method: 'GET',
        params: {
          exportCfId,
          ...params,
        },
        data: {
          ...other,
        },
      };
    },
    submit: ({ data, params }) => {
      return {
        url: `${SRM_SSLM}/v1/${organizationId}/export-cf-lines/batchCreate`,
        data,
        params,
        method: 'POST',
      };
    },
  },
  fields: [
    {
      name: 'exportCfId',
      required: true,
    },
    {
      label: intl.get(`sslm.supplierEventConfig.model.supplierEventConfig.cfName`).d('数据项'),
      name: 'cfName',
      type: 'object',
      lovCode: 'SSLM.SUPPLIER_MAIN_DATA_SQL',
      required: true,
      textField: 'meaning',
      transformRequest: value => value && value.value,
      transformResponse: (value, data) => {
        const { cfName, cfNameMeaning, code } = data;
        return value
          ? {
              value: cfName,
              meaning: cfNameMeaning,
              code,
            }
          : null;
      },
    },
    {
      label: intl
        .get('sslm.supplierEventConfig.model.supplierEventConfig.dataStructure')
        .d('数据结构'),
      name: 'code',
      type: 'string',
      bind: 'cfName.code',
    },
  ],
});

const getDataItemDS = () => ({
  dataToJSON: 'selected',
  autoCreate: true,
  fields: [
    {
      name: 'dataItemLov',
      type: 'object',
      multiple: true,
      noCache: true,
      lovCode: 'SSLM.SUPPLIER_MAIN_DATA_SQL',
    },
  ],
});

export { getDataItemDS };
