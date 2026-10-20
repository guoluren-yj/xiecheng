import { SRM_SLOD } from '_utils/config';
import { getCurrentOrganizationId, filterNullValueObject } from 'utils/utils';

import intl from 'utils/intl';

const organizationId = getCurrentOrganizationId();

const indexDS = (id) => ({
  primaryKey: id,
  cacheSelection: true, // 跨页勾选
  pageSize: 20,
  fields: [
    {
      label: intl.get('slod.deliveryBoard.model.common.poLineLocationStatus').d('订单发运行状态'),
      name: 'poLineLocationStatusMeaning',
      type: 'string',
    },
    {
      label: intl.get('slod.deliveryBoard.model.common.fromDisplayPoNum').d('来源订单号-行号'),
      name: 'fromDisplayPoNum',
      type: 'string',
    },
    {
      label: intl.get('slod.deliveryBoard.model.common.fromDisplayPoLocationNum').d('发运号'),
      name: 'fromDisplayPoLocationNum',
      type: 'string',
    },
    {
      label: intl.get('slod.deliveryBoard.model.common.supplierCompanyName').d('供应商'),
      name: 'supplierCompanyName',
      type: 'string',
    },
    {
      label: intl.get('slod.deliveryBoard.model.common.itemCode').d('物料编码'),
      name: 'itemCode',
      type: 'string',
    },
    {
      label: intl.get('slod.deliveryBoard.model.common.itemName').d('物料名称'),
      name: 'itemName',
      type: 'string',
    },
    {
      label: intl.get('slod.deliveryBoard.model.common.uomName').d('单位'),
      name: 'displayUom',
      type: 'string',
    },
    {
      label: intl.get('slod.deliveryBoard.model.common.poQuantity').d('数量'),
      name: 'poQuantity',
      type: 'number',
    },
    {
      label: intl.get('slod.deliveryBoard.model.common.strategyName').d('发货策略'),
      name: 'strategyName',
      type: 'string',
    },
    {
      label: intl.get('slod.deliveryBoard.model.common.trxStrategyName').d('收货策略'),
      name: 'trxStrategyName',
      type: 'string',
    },
    {
      label: intl.get('slod.deliveryBoard.model.common.syncStatusMeaning').d('同步状态'),
      name: 'syncStatusMeaning',
      type: 'string',
    },
    {
      label: intl.get('slod.deliveryBoard.model.common.syncMsg').d('返回信息'),
      name: 'syncMsg',
      type: 'string',
    },
    {
      label: intl.get('slod.deliveryBoard.model.common.createResult').d('自动创建结果'),
      name: 'createResult',
      type: 'string',
    },
  ],
  transport: {
    read: ({ data }) => {
      const { params, customizeUnitCode, ...other } = data;
      const queryData = filterNullValueObject({ ...params, customizeUnitCode, ...other });
      return {
        url: `${SRM_SLOD}/v1/${organizationId}/delivery/delivery-report-query?campKey=p`,
        method: 'GET',
        data: queryData,
        transformResponse: (value) => {
          const newRes = [];
          const { content: result, ...pages } = JSON.parse(value);
          (result || []).forEach((item) => {
            const resultTableData = {};
            const { nodeReportList = [] } = item;
            nodeReportList.forEach((ele) => {
              const { nodeConfigName, processStatus, processStatusMeaning } = ele;
              resultTableData[nodeConfigName] = { processStatusMeaning, processStatus };
              // resultTableData.processStatus = processStatus;
            });
            newRes.push({
              ...item,
              ...resultTableData,
            });
          });
          return { content: newRes, ...pages };
        },
      };
    },
  },
});

export { indexDS };
