import intl from 'utils/intl';
import { SMALL_ORDER } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

const baseDS = () => ({
  fields: [
    {
      name: 'statementsCode',
      label: intl.get('smodr.recon.model.statementsCode').d('商城对账单编码'),
    },
    {
      name: 'ecStatementsCode',
      label: intl.get('smodr.recon.model.ecStatementsCode').d('电商对账单编码'),
    },
    {
      name: 'srmStatementsCode',
      label: intl.get('smodr.recon.model.outStatementsCode').d('外部对账单编码'),
    },
    {
      name: 'statementsTotalAmount',
      label: intl.get('smodr.recon.model.stateTotalAmountNew').d('对账总金额'),
    },
    {
      name: 'statementsStatusMeaning',
      label: intl.get('smodr.recon.model.statementsStatus').d('对账状态'),
    },
    {
      name: 'statementsTime',
      type: 'dateTime',
      label: intl.get('smodr.recon.model.chargeOffTime').d('出账日期'),
    },
    {
      name: 'lastUpdateDate',
      type: 'dateTime',
      label: intl.get('smodr.recon.model.updateTime').d('更新时间'),
    },
  ],
});


const productDs = () => ({
  selection: false,
  pageSize: 20,
  fields: [
    {
      name: 'consignmentCode',
      type: 'string',
      label: intl.get('smodr.recon.model.consignmentCode').d('商城配送单编码'),
    },
    {
      name: 'receiptCode',
      type: 'string',
      label: intl.get('smodr.recon.model.receiptCode').d('商城接收单编码'),
    },
    {
      name: 'afterSaleCode',
      type: 'string',
      label: intl.get('smodr.recon.model.afterSaleCode').d('商城售后单编码'),
    },
    {
      name: 'skuCode',
      type: 'string',
      label: intl.get('smodr.recon.model.skuCode').d('商品编码'),
    },
    {
      name: 'skuName',
      type: 'string',
      label: intl.get('smodr.recon.model.skuName').d('商品名称'),
    },
    {
      name: 'quantityMeaning',
      type: 'string',
      label: intl.get('smodr.recon.model.quantity').d('对账数量'),
    },
    {
      name: 'taxRateMeaning',
      type: 'string',
      label: intl.get('smodr.recon.model.tax').d('税率'),
    },
    {
      name: 'unitPriceMeaning',
      type: 'string',
      label: intl.get('smodr.recon.model.unitPriceTaxNew').d('单价(含税)'),
    },
    {
      name: 'unitNakedPriceMeaning',
      type: 'string',
      label: intl.get('smodr.recon.model.noUnitPriceTaxNew').d('单价(不含税)'),
    },
  ],
  transport: {
    read({ data }) {
      return {
        url: `${SMALL_ORDER}/v1/${organizationId}/statements-entrys/product-page`,
        method: 'GET',
        data: { ...data },
      };
    },
  },
});

const freightDs = () => ({
  selection: false,
  pageSize: 20,
  fields: [
    {
      name: 'statementsLineNum',
      type: 'string',
      label: intl.get('smodr.orderLine.model.lineCode').d('行号'),
    },
    {
      name: 'skuName',
      type: 'string',
      label: intl.get('smodr.orderLine.model.skuName').d('商品名称'),
    },
    {
      name: 'consignmentCode',
      type: 'string',
      label: intl.get('smodr.recon.model.consignmentCode').d('商城配送单编码'),
    },
    {
      name: 'receiptCode',
      type: 'string',
      label: intl.get('smodr.recon.model.receiptCode').d('商城接收单编码'),
    },
    {
      name: 'itemCode',
      type: 'string',
      label: intl.get('smodr.recon.model.itemCode').d('物料编码'),
    },
    {
      name: 'itemName',
      type: 'string',
      label: intl.get('smodr.recon.model.itemName').d('物料名称'),
    },
    {
      name: 'extraCostTypeMeaning',
      type: 'string',
      label: intl.get('smodr.recon.model.additionType').d('附加费种类'),
    },
    // {
    //   name: 'freightPricingMethodMeaning',
    //   type: 'string',
    //   label: intl.get('smodr.recon.model.freightRuleTypeMethod').d('运费计价方式'),
    // },
    {
      name: 'quantityMeaning',
      type: 'string',
      label: intl.get('smodr.recon.model.quantity').d('对账数量'),
    },
    {
      name: 'taxRateMeaning',
      type: 'string',
      label: intl.get('smodr.recon.model.tax').d('税率'),
    },
    {
      name: 'unitPriceMeaning',
      type: 'string',
      label: intl.get('smodr.recon.model.unitPriceTaxNew').d('单价(含税)'),
    },
    {
      name: 'unitNakedPriceMeaning',
      type: 'string',
      label: intl.get('smodr.recon.model.noUnitPriceTaxNew').d('单价(不含税)'),
    },
  ],
  transport: {
    read({ data }) {
      return {
        url: `${SMALL_ORDER}/v1/${organizationId}/statements-entrys/freight-page`,
        method: 'GET',
        data: { ...data },
      };
    },
  },
});

export { productDs, freightDs, baseDS };
