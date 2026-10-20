/* eslint-disable no-empty-pattern */
import intl from 'utils/intl';
import { SRM_SPUC } from '_utils/config';

import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

const WeekDataSet = (): any => ({
    paging: false,
    dataToJSON: 'all',
    forceValidate: true,
    fields: [
      {
        name: 'stockMappingType',
        type: 'string',
        label: intl.get(`sinv.inventoryBench.model.view.stockMappingType`).d('类型方向'),
        lookupCode: 'SINV.STOCK_MAPPING_TYPE',
        required: true,
      },
      {
        name: 'strategyCodeObj',
        type: 'object',
        label: intl.get(`sinv.inventoryBench.model.view.strategyCode`).d('类型编码'),
        required: true,
        lovCode: 'SPUC.SINV_STOCK_OUT_STRATEGY_LIST',
        // valueField: 'templateCode',
        textField: 'strategyCode',
        dynamicProps: {
          lovPara: ({ dataSet }) => {
            return {
              curStrategyHeaderId: dataSet.getState('strategyHeaderId'),
              tenantId: organizationId,
              inspectFlag: 1,
            };
          },
        },
      },
      {
        name: 'relStrategyHeaderId',
        type: 'string',
        bind: 'strategyCodeObj.strategyHeaderId',
      },
      {
        name: 'strategyCode',
        type: 'string',
        bind: 'strategyCodeObj.strategyCode',
      },
      {
        name: 'strategyName',
        type: 'string',
        label: intl.get(`sinv.inventoryBench.model.view.strategyName`).d('类型名称'),
        bind: 'strategyCodeObj.strategyName',
      },
  ],
  transport: {
    read: ({ data }) => {
      const { strategyHeaderId } = data;
      return {
        url: `${SRM_SPUC}/v1/${organizationId}/stockout/strategy/mapping-line?strategyHeaderId=${strategyHeaderId}`,
        method: 'GET',
        data,
      };
    },
  },
  });
 export {WeekDataSet };