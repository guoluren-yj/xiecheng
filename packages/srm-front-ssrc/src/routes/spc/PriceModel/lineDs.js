import { getCurrentOrganizationId } from 'utils/utils';
import intl from 'utils/intl';
import { SRM_SPC } from '_utils/config';

const organizationId = getCurrentOrganizationId();

const lineDS = () => {
  return {
    autoQuery: true,
    primaryKey: 'modelId',
    selection: true,
    dataToJSON: 'selected',
    pageSize: 20,
    fields: [
      {
        name: 'modelCode',
        label: intl.get('spc.priceModel.model.priceModel.modelCode').d('价格模型编码'),
        trim: 'both',
        required: true,
        validator: (value, _, record) => {
          const reg = /[\u4e00-\u9fa5]/gm;
          if (reg.test(record.get('modelCode'))) {
            return intl.get(`spc.priceModel.validation.modelCode`).d('价格模型编码不能为中文');
          }
          return true;
        },
      },
      {
        name: 'modelName',
        label: intl.get('spc.priceModel.model.priceModel.modelName').d('模型名称'),
        required: true,
      },
      {
        name: 'modelRemark',
        label: intl.get('spc.priceModel.model.priceModel.modelRemark').d('模型说明'),
        maxLength: 200,
      },
      {
        name: 'modelStatus',
        label: intl.get('spc.priceModel.model.priceModel.modelStatus').d('状态'),
        defaultValue: 'NEW',
        lookupCode: 'SPC.PRICE_MODEL.STATUS',
      },
      {
        name: 'createdByMeaning',
        label: intl.get('spc.priceModel.model.priceModel.createdBy').d('创建人'),
      },
    ],
    transport: {
      read: ({ data }) => {
        return {
          url: `${SRM_SPC}/v1/${organizationId}/price-models/list`,
          method: 'GET',
          data: { ...data, latestFlag: 'P', customizeUnitCode: 'SPC.PRICE_MODEL.LIST.FILTER' },
        };
      },
      destroy: {
        url: `${SRM_SPC}/v1/${organizationId}/price-models`,
        method: 'DELETE',
      },
      submit: {
        url: `${SRM_SPC}/v1/${organizationId}/price-models/save`,
        method: 'POST',
      },
    },
  };
};

export { lineDS };
