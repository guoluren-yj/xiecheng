import { SRM_SPC } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';
import intl from 'utils/intl';

const organizationId = getCurrentOrganizationId();

const TableDS = (recordId) => ({
  primaryKey: 'recordLineId',
  autoQuery: true,
  selection: false,
  pageSize: 20,
  fields: [
    {
      name: 'sourceNum',
      label: intl.get(`spc.advancedPricingRecord.model.sourceNum`).d('来源单据编码'),
    },
    {
      name: 'sourceLineNum',
      label: intl.get(`spc.advancedPricingRecord.model.sourceLineNum`).d('来源单据行号'),
    },
    {
      name: 'sourceBenchmarkPrice',
      type: 'currency',
      label: intl.get(`spc.advancedPricingRecord.model.sourceBenchmarkPrice`).d('来源基准价'),
    },
    {
      name: 'priceLibCode',
      label: intl.get(`spc.advancedPricingRecord.model.priceLibCode`).d('价格编码'),
    },
    {
      name: 'discountRuleCode',
      label: intl.get(`spc.advancedPricingRecord.model.discountRuleCode`).d('折扣规则编码'),
    },
    {
      name: 'discountRuleVersion',
      label: intl.get(`spc.advancedPricingRecord.model.discountRuleVersion`).d('折扣规则版本'),
    },
    {
      name: 'discountScenarioName',
      label: intl.get(`spc.advancedPricingRecord.model.discountScenarioName`).d('折扣场景'),
    },
    {
      name: 'cumulativePrice',
      type: 'currency',
      label: intl.get(`spc.advancedPricingRecord.model.cumulativePrice`).d('折扣累计值'),
    },
    {
      name: 'discountPrice',
      type: 'currency',
      label: intl.get(`spc.advancedPricingRecord.model.discountPrice`).d('折后价'),
    },
  ],
  transport: {
    read({ data }) {
      return {
        url: `${SRM_SPC}/v1/${organizationId}/price-pricing-records/line/${recordId}`,
        method: 'GET',
        data,
      };
    },
  },
});


export { TableDS };
