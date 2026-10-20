import { getCurrentOrganizationId } from 'utils/utils';
import intl from 'utils/intl';

import { SRM_SIEC } from '_utils/config';

const organizationId = getCurrentOrganizationId();

const queryFormDS = () => ({
  fields: [
    {
      name: 'status',
      label: intl.get('ssrc.priceLibBatchCreate.model.create.dataStatus').d('数据状态'),
      lookupCode: 'HIMP.DATA_STATUS',
      multiple: ',',
    },
  ],
});

const listLineDS = (param) => ({
  primaryKey: 'id',
  selection: false,
  // table表单显示的字段
  fields: [
    {
      name: '_dataStatus',
      label: intl.get('ssrc.priceLibBatchCreate.model.create.dataStatus').d('数据状态'),
      lookupCode: 'HIMP.DATA_STATUS',
    },
    {
      name: '_info',
      label: intl.get('ssrc.priceLibBatchCreate.model.create.message').d('错误信息'),
    },
  ],

  transport: {
    read: ({ data }) => {
      const { params, ...otherData } = data;
      return {
        url: `${SRM_SIEC}/v1/${organizationId}/feedback-import`,
        method: 'GET',
        data: {
          ...param,
          ...params,
          ...otherData,
        },
        transformResponse: (res) => {
          const dealData = JSON.parse(res);
          const { content = [] } = dealData;
          const result = content.map((item) => {
            const { _data = '{}', ...reset } = item;
            const newData = JSON.parse(_data);
            return { ...newData, ...reset };
          });
          return { ...dealData, content: result };
        },
      };
    },
  },
});

const ladderQuotationDS = (param) => ({
  primaryKey: 'priceLibLadderId',
  selection: false,

  // table表单显示的字段
  fields: [
    {
      name: '_dataStatus',
      label: intl.get('ssrc.priceLibBatchCreate.model.create.dataStatus').d('数据状态'),
      lookupCode: 'HIMP.DATA_STATUS',
    },
    {
      name: '_info',
      label: intl.get('ssrc.priceLibBatchCreate.model.create.message').d('错误信息'),
    },
    {
      name: 'ladderLineNum',
      type: 'string',
      label: intl.get('ssrc.priceLibBatchCreate.model.create.ladderLineNum').d('行号'),
    },
    {
      name: 'ladderFrom',
      type: 'number',
      label: intl.get('ssrc.priceLibBatchCreate.model.create.ladderFrom').d('数量从（>=）'),
    },
    {
      name: 'ladderTo',
      type: 'number',
      label: intl.get('ssrc.priceLibBatchCreate.model.create.ladderTo').d('数量至(<)'),
    },
    {
      name: 'ladderPrice',
      type: 'number',
      label: intl.get('ssrc.priceLibBatchCreate.model.create.price').d('阶梯价格'),
    },
    {
      name: 'ladderNetPrice',
      type: 'number',
      label: intl.get('ssrc.priceLibBatchCreate.model.create.ladderNetPrice').d('阶梯价格(不含税)'),
    },
    {
      name: 'cumulativeFlag',
      type: 'string',
      // trueValue: 1,
      // falseValue: 0,
      label: intl.get('ssrc.priceLibBatchCreate.model.create.cumulativeFlag').d('是否累计价格'),
    },
    {
      name: 'ladderPriceRemark',
      type: 'string',
      label: intl.get('ssrc.priceLibBatchCreate.model.create.remark').d('阶梯价格备注'),
    },
  ],

  transport: {
    read: ({ data }) => {
      const { params, ...otherData } = data;
      return {
        url: `${SRM_SIEC}/v1/${organizationId}/lib-mains-import`,
        method: 'GET',
        data: {
          ...param,
          ...params,
          ...otherData,
        },
        transformResponse: (res) => {
          if (res) {
            const dealData = JSON.parse(res);
            const { content = [] } = dealData;
            const result = content.map((item) => {
              const { _data = '{}', ...reset } = item;
              const newData = JSON.parse(_data);
              return { ...newData, ...reset };
            });
            return { ...dealData, content: result };
          }
        },
      };
    },
  },
});

const applicationScopeDS = (param) => ({
  primaryKey: 'priceLibLadderId',
  selection: false,

  // table表单显示的字段
  fields: [
    {
      name: '_dataStatus',
      label: intl.get('ssrc.priceLibBatchCreate.model.create.dataStatus').d('数据状态'),
      lookupCode: 'HIMP.DATA_STATUS',
    },
    {
      name: '_info',
      label: intl.get('ssrc.priceLibBatchCreate.model.create.message').d('错误信息'),
    },
    {
      name: 'dimensionCode',
      type: 'string',
      label: intl.get('ssrc.priceLibBatchCreate.model.create.dimensionCode').d('维度编码'),
    },
    {
      name: 'dataCode',
      type: 'string',
      label: intl.get('ssrc.priceLibBatchCreate.model.create.dataCode').d('维度值编码'),
    },
    {
      name: 'includeAllFlag',
      type: 'string',
      label: intl.get('ssrc.priceLibBatchCreate.model.create.includeAllFlag').d('是否包含所有'),
    },
  ],

  transport: {
    read: ({ data }) => {
      const { params, ...otherData } = data;
      return {
        url: `${SRM_SIEC}/v1/${organizationId}/lib-mains-import`,
        method: 'GET',
        data: {
          ...param,
          ...params,
          ...otherData,
        },
        transformResponse: (res) => {
          if (res) {
            const dealData = JSON.parse(res);
            const { content = [] } = dealData;
            const result = content.map((item) => {
              const { _data = '{}', ...reset } = item;
              const newData = JSON.parse(_data);
              return { ...newData, ...reset };
            });
            return { ...dealData, content: result };
          }
        },
      };
    },
  },
});

export { queryFormDS, listLineDS, ladderQuotationDS, applicationScopeDS };
