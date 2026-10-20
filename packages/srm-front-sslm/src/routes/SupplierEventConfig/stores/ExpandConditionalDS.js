/**
 * 拓展条件规则 DataSet
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
  selection: false,
  paging: false,
  transport: {
    read: ({ data }) => {
      const { exportCfId } = data;
      return {
        url: `${SRM_SSLM}/v1/${organizationId}/export-cf-filters/findOne/${exportCfId}`,
        method: 'GET',
        params: {
          filterType: 'INDIVIDUALITY',
        },
        data,
      };
    },
    destroy: ({ data, params }) => {
      return {
        url: `${SRM_SSLM}/v1/${organizationId}/export-cf-filters`,
        method: 'DELETE',
        params,
        data: {
          ...data[0],
        },
      };
    },
  },
  primaryKey: 'exportCfFilterId',
  fields: [
    {
      name: 'exportCfFilterId',
    },
    {
      label: intl.get(`sslm.supplierEventConfig.model.eventConfig.tableName`).d('表名'),
      name: 'filterObject',
      lookupCode: 'SSLM.EXPORT_FILTER_INDIVIDUALITY',
      required: true,
    },
    {
      label: intl.get(`sslm.supplierEventConfig.model.eventConfig.fieldName`).d('字段名'),
      name: 'filterName',
      required: true,
    },
    {
      label: intl.get(`sslm.supplierEventConfig.model.eventConfig.featuresMethod`).d('特性条件'),
      name: 'filterMethod',
      lookupCode: 'SSLM.EXPORT_FILTER_METHOD',
      required: true,
    },
    {
      label: intl.get(`sslm.supplierEventConfig.model.eventConfig.featuresValue`).d('特性值'),
      name: 'filterVluse',
      required: true,
    },
    {
      label: intl.get(`hzero.common.button.operator`).d('操作'),
      name: 'operator',
      ignore: 'always',
    },
  ],
});
