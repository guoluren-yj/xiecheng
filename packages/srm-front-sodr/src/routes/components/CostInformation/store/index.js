import { SRM_SPUC } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';
import intl from 'utils/intl';

const organizationId = getCurrentOrganizationId();

const header = ({ poLineId, poHeaderId }) => ({
  autoQuery: true,
  autoCreate: true,
  fields: [
    {
      name: 'itemCode',
      label: intl.get('sodr.costInformation.model.common.itemCode').d('物料编码'),
    },
    {
      name: 'itemName',
      label: intl.get('sodr.costInformation.model.common.itemName').d('物料名称'),
    },
    {
      name: 'quantity',
      type: 'number',
      label: intl.get('sodr.costInformation.model.common.quantity').d('订单行数量'),
    },
    {
      name: 'currencyCode',
      label: intl.get('sodr.costInformation.model.common.currencyCode').d('币种'),
    },
    {
      name: 'taxIncludedLineAmount',
      type: 'currency',
      label: intl
        .get('sodr.costInformation.model.common.taxIncludedLineAmount')
        .d('订单行金额(含税)'),
    },
    {
      name: 'lineAmount',
      type: 'currency',
      label: intl.get('sodr.costInformation.model.common.lineAmount').d('订单行金额(不含税)'),
    },
    {
      name: 'expenseTaxIncludedLineAmount',
      type: 'currency',
      label: intl
        .get('sodr.costInformation.model.common.expenseTaxIncludedLineAmount')
        .d('费用金额(含税)'),
    },
    {
      name: 'expenseLineAmount',
      type: 'currency',
      label: intl.get('sodr.costInformation.model.common.expenseLineAmount').d('费用金额(不含税)'),
    },
  ],
  transport: {
    read({ data }) {
      return {
        url: `${SRM_SPUC}/v1/${organizationId}/po-item-expense-line/query-expense-header-detail`,
        method: 'post',
        data: { ...data, poLineId, poHeaderId },
      };
    },
  },
});

const line = ({ viewOnly, quantity }) => ({
  aotuQuery: true,
  fields: [
    {
      name: 'expenseLineNum',
      label: intl.get('sodr.costInformation.model.common.expenseLineNum').d('行号'),
    },
    {
      name: 'expenseCode',
      label: intl.get('sodr.costInformation.model.common.expenseCode').d('费用类型编码'),
    },
    {
      name: 'expenseName',
      label: intl.get('sodr.costInformation.model.common.expenseName').d('费用类型描述'),
    },
    {
      name: 'pricingType',
      lookupCode: 'SODR.PO_EXPENSE_AMOUNT_PRICING_TYPE',
      label: intl.get('sodr.costInformation.model.common.pricingType').d('计价方式'),
    },
    {
      name: 'numericalValue',
      label: intl.get('sodr.costInformation.model.common.numericalValue').d('数值'),
    },
    {
      name: 'valueCalculation',
      label: intl.get('sodr.costInformation.model.common.valueCalculation').d('计价值'),
    },
    {
      name: 'expenseCurrency',
      label: intl.get('sodr.costInformation.model.common.expenseCurrency').d('费用币种'),
    },
    {
      name: 'taxId',
      label: intl.get('sodr.costInformation.model.common.taxId').d('税率'),
    },
    {
      name: 'supplier',
      label: intl.get('sodr.costInformation.model.common.supplier').d('供应商'),
    },
    {
      name: 'lineAmount',
      label: intl.get('sodr.costInformation.model.common.lineAmount').d('行金额(不含税)'),
    },
    {
      name: 'taxIncludedLineAmount',
      label: intl.get('sodr.costInformation.model.common.taxIncludedLineAmount').d('行金额(含税)'),
    },
    {
      name: 'currencyCode',
      label: intl.get('sodr.costInformation.model.common.currencyCode').d('订单币种'),
    },
  ],
  transport: {
    read({ data }) {
      return {
        url: `${SRM_SPUC}/v1/${organizationId}/po-item-expense-line/query-expense-line-detail`,
        method: 'post',
        data: { ...data, editFlag: Number(viewOnly), quantity },
      };
    },
  },
});

export { header, line };
