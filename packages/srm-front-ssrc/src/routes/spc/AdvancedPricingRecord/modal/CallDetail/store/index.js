import { SRM_SPC } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';
import intl from 'utils/intl';

const organizationId = getCurrentOrganizationId();

const TableDS = (recordId, isAdjust) => ({
  // autoQuery: true,
  primaryKey: 'recordLineId',
  pageSize: 20,
  selection: false,
  fields: [
    {
      name: 'lineNum',
      label: isAdjust ? intl.get(`spc.advancedPricingRecord.model.adjustLineNum`).d('调用记录行号') : intl.get(`spc.advancedPricingRecord.model.advancedLineNum`).d('取价记录行号'),
    },
    {
      name: 'priceTemplateCode',
      label: intl.get(`spc.advancedPricingRecord.model.priceTemplateCode`).d('监听价格库编码'),
    },
    {
      name: 'priceLibCode',
      label: intl.get(`spc.advancedPricingRecord.model.priceLibCode`).d('监听价格编码'),
    },
    {
      name: 'sourceNum',
      label: intl.get(`spc.advancedPricingRecord.model.sourceNum`).d('来源单据编码'),
    },
    {
      name: 'sourceLineNum',
      label: intl.get(`spc.advancedPricingRecord.model.sourceLineNum`).d('来源单据行号'),
    },
    {
      name: 'calcDetail',
      label: intl.get(`spc.advancedPricingRecord.view.title.calcDetail`).d('计算明细'),
    },
    {
      name: 'calculatePrice',
      type: 'currency',
      label: intl.get(`spc.advancedPricingRecord.model.calculatePrice`).d('计算结果'),
    },
  ],
  queryFields: [
    {
      name: 'lineNum',
      sortFlag: true,
      label: isAdjust ? intl.get(`spc.advancedPricingRecord.model.adjustLineNum`).d('调用记录行号') : intl.get(`spc.advancedPricingRecord.model.advancedLineNum`).d('取价记录行号'),
      merge: true,
    },
    ...isAdjust ?
      [{
        name: 'priceTemplateCode',
        label: intl.get(`spc.advancedPricingRecord.model.priceTemplateCode`).d('监听价格库编码'),
      }, {
        name: 'priceLibCode',
        label: intl.get(`spc.advancedPricingRecord.model.priceLibCode`).d('监听价格编码'),
      }] :
      [
        // {
        //   name: 'sourceNum',
        //   label: intl.get(`spc.advancedPricingRecord.model.sourceNum`).d('来源单据编码'),
        // },
        // {
        //   name: 'sourceLineNum',
        //   label: intl.get(`spc.advancedPricingRecord.model.sourceLineNum`).d('来源单据行号'),
        // }
      ],
  ],
  transport: {
    read({ data }) {
      return {
        url: `${SRM_SPC}/v1/${organizationId}/price-${isAdjust ? 'adjust' : 'pricing'}-records/line/${recordId}`,
        method: 'GET',
        data,
      };
    },
  },
});


export { TableDS };
