import { DataSet } from 'choerodon-ui/pro';

import { HZERO_RPT } from 'utils/config';
import intl from 'utils/intl';
import { getCurrentTenant } from 'utils/utils';

export const getHeaderFormDs = () => {
  const { tenantId, tenantName } = getCurrentTenant();
  return {
    autoCreate: true,
    fields: [
      {
        name: 'tenant',
        type: 'object',
        lovCode: 'HPFM.TENANT',
        defaultValue: {
          tenantId,
          tenantName,
        },
      },
      {
        name: 'tenantId',
        bind: 'tenant.tenantId',
      },
      {
        name: 'tenantName',
        bind: 'tenant.tenantName',
      },
    ],
  };
};

export const getTableDs = () => {
  return {
    selection: false,
    queryFields: [
      {
        label: intl.get('hrpt.reportDataSet.model.reportDataSet.dataSetCode').d('数据集编码'),
        name: 'datasetCode',
      },
      {
        label: intl.get('hrpt.reportDataSet.model.reportDataSet.datasetName').d('数据集名称'),
        name: 'datasetName',
      },
      {
        label: intl.get('hzero.common.status').d('状态'),
        name: 'enabledFlag',
        options: new DataSet({
          selection: 'single',
          data: [
            { value: 1, meaning: intl.get('hzero.common.status.enable').d('启用') },
            { value: 0, meaning: intl.get('hzero.common.status.disable').d('禁用') },
          ],
        }),
      },
    ],
    fields: [
      {
        label: intl.get('entity.tenant.tag').d('租户'),
        name: 'tenantName',
      },
      {
        label: intl.get('hrpt.reportDataSet.model.reportDataSet.dataSetCode').d('数据集编码'),
        name: 'datasetCode',
      },
      {
        label: intl.get('hrpt.reportDataSet.model.reportDataSet.datasetName').d('数据集名称'),
        name: 'datasetName',
      },
      {
        label: intl
          .get('hrpt.reportDataSet.model.reportDataSet.businessObjectName')
          .d('组合业务对象'),
        name: 'businessObjectName',
      },
      {
        label: intl.get('hrpt.reportDataSet.modal.reportDataSet.type').d('类型'),
        name: 'datasetType',
      },
      {
        label: intl.get('hzero.common.remark').d('备注'),
        name: 'remark',
      },
      {
        label: intl.get('hzero.common.status').d('状态'),
        name: 'enabledFlag',
      },
    ],
    transport: {
      read: ({ data, params }) => {
        return {
          url: `${HZERO_RPT}/v1/print-datasets`,
          method: 'get',
          params: {
            ...params,
            ...data,
            customizeUnitCode: 'PRINT_DATASET.SEARCHBAR',
          },
        };
      },
    },
  };
};

export const getCopyModalTableDs = () => {
  return {
    selection: 'single',
    queryFields: [
      {
        label: intl.get('hrpt.reportDataSet.model.reportDataSet.dataSetCode').d('数据集编码'),
        name: 'datasetCode',
      },
      {
        label: intl.get('hrpt.reportDataSet.model.reportDataSet.datasetName').d('数据集名称'),
        name: 'datasetName',
      },
    ],
    fields: [
      {
        label: intl.get('hrpt.reportDataSet.model.reportDataSet.dataSetCode').d('数据集编码'),
        name: 'datasetCode',
      },
      {
        label: intl.get('hrpt.reportDataSet.model.reportDataSet.datasetName').d('数据集名称'),
        name: 'datasetName',
      },
    ],
    transport: {
      read: ({ data, params }) => {
        return {
          url: `${HZERO_RPT}/v1/print-datasets/can-be-copy`,
          method: 'get',
          params: {
            ...data,
            ...params,
          },
        };
      },
    },
  };
};
