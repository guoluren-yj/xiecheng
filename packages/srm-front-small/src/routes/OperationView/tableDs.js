import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';
import moment from 'moment';

const organizationId = getCurrentOrganizationId();
const SRM_SMODR = '/smodr';

export function filterBarDs() {
  return {
    autoQuery: false,
    queryFields: [
      {
        name: 'savingType',
        label: intl.get('small.common.model.savingType').d('节支统计口径'),
        type: 'select',
        lookupCode: 'S2FUL.SAVING_STATISTICAL_STANDARDS',
        display: true,
        required: true,
        defaultValue: 'max',
      },
      {
        name: 'currencyCode',
        type: 'object',
        label: intl.get('small.common.model.common.currencyCode').d('币种'),
        lovCode: 'HPFM.CURRENCY',
        valueField: 'currencyCode',
        textField: 'currencyCode',
        display: true,
        required: true,
        defaultValue: { currencyCode: "CNY" },
      },
      {
        name: 'supplierCompanyId',
        label: intl.get(`small.common.model.supplier`).d('供应商'),
        type: 'object',
        lovPara: { tenantId: organizationId },
        lovCode: 'SPFM.USER_AUTH.SUPPLIER',
        display: true,
      },
      {
        name: 'catalogId',
        label: intl.get('small.common.model.mallCatalog').d('商城目录'),
        type: 'object',
        lovPara: { tenantId: organizationId },
        lovCode: 'SMPC.CATALOG_THREE',
        display: true,
      },
      {
        name: 'cecCreatedTime_range',
        label: intl.get('smodr.orderDetail.model.buyerDate').d('下单时间'),
        type: 'dateTime',
        range: ['start', 'end'],
        required: true,  
        display: true,
        defaultValue:[moment().subtract(6, 'month').startOf('day').format('YYYY-MM-DD HH:mm:ss'), moment(new Date()).endOf('day').format('YYYY-MM-DD HH:mm:ss')],
      },
      {
        name: 'purchaseCompanyId',
        type: 'object',
        label: intl.get('small.common.model.company').d('公司'),
        lovCode: 'SPFM.USER_AUTHORITY_COMPANY',
        valueField: 'companyId',
        textField: 'companyName',
        display: true,
      },
      {
        name: 'ouId',
        type: 'object',
        label: intl.get('smodr.orderDetail.model.ouName').d('业务实体'),
        lovCode: 'SPFM.USER_AUTH.OU',
        display: true,
      },
      {
        name: 'purOrganizationId',
        type: 'object',
        label: intl.get('smodr.orderDetail.model.purchaseOrg').d('采购组织'),
        lovCode: 'SPFM.USER_AUTH.PURCHASE_ORG',
        display: true,
      },
      {
        name: 'unitId',
        lovCode: 'S2FUL.USER_UNIT',
        type: 'object',
        label: intl.get('small.common.model.unit').d('部门'),
        lovPara: { tenantId: organizationId },
        display: true,
      },
    ],
  };
};

/**
 * 汇总指标 DataSet（卡片使用）
 */
export function summaryDs() {
  return {
    autoQuery: false,
    fields: [
      {
        name: 'sumProcurementAmount',
        label: intl.get('small.common.model.totalAmount').d('采购总金额'),
        type: 'number',
        colSpan: 2,
        helpTip: intl.get('small.common.model.totalAmount.help').d('所选范围内，所有启用比价的订单商品实际支付的含税总金额'),
        isCurrency: true,
      },
      {
        name: 'savingsAmount',
        label: intl.get('small.common.model.savingsAmount').d('节支金额'),
        type: 'number',
        helpTip: intl.get('small.common.model.savingsAmount.help').d('按所选口径计算，实际支付价格低于基准价格（最高价或平均价）所节省的总金额'),
        isCurrency: true,
      },
      {
        name: 'savingsRate',
        label: intl.get('small.common.model.savingsRate').d('节支率'),
        type: 'string',
        color: '#0161D5',
        helpTip: intl.get('small.common.model.savingsRate.help').d('节支金额占“假设全部按基准价购买总金额”的比例，即节省幅度的百分比'),
        transformResponse: (value) => value ? `${value}%` : '-',
      },
      {
        name: 'sumNonMinimumAmount',
        label: intl.get('small.common.model.sumNonMinimumAmount').d('非最低下单金额'),
        type: 'number',
        helpTip: intl.get('small.common.model.sumNonMinimumAmount.help').d('因未选择比价单中最低价商品而多支付的金额总和（与口径无关，始终以最低价为参考）'),
        isCurrency: true,
      },
      {
        name: 'sumNonMinimumRate',
        label: intl.get('small.common.model.nonMinRate').d('非最低下单比率'),
        type: 'string',
        color: '#0161D5',
        helpTip: intl.get('small.common.model.nonMinRate.help').d('非最低下单金额占采购总金额的百分比，反映采购中“未选最低价”的成本占比'),
        transformResponse: (value) => value ? `${value}%` : '-',
      },
      {
        name: 'recommendedUsageCount',
        label: intl.get('small.common.model.recommendCount').d('推荐使用次数'),
        type: 'number',
        helpTip: intl.get('small.common.model.recommendCount.help').d('系统向用户推荐了更优价格的商品行总数'),
      },
      {
        name: 'recommendedUsageRate',
        label: intl.get('small.common.model.usageRate').d('用户使用率'),
        type: 'string',
        helpTip: intl.get('small.common.model.usageRate.help').d('用户实际采纳推荐（即购买价格低于基准价的订单行）次数占推荐总次数的比例'),
        transformResponse: (value) => value ? `${value}%` : '-',
      },
    ],
    transport: {
      read: () => ({
        url: `${SRM_SMODR}/v1/${organizationId}/order-entrys/intelligence-compare/report/group`,
        method: 'GET',
      }),
    },
  };
}

/**
 * 采购节流明细表格 DataSet
 */
export function detailTableDs() {
  return {
    autoQuery: false,
    selection: false,
    pageSize: 10,
    fields: [
      {
        name: 'orderCodeLine',
        label: intl.get('smodr.orderDetail.model.groupOrderCode').d('商城订单编码-行号'),
        type: 'string',
      },
      {
        name: 'skuCode',
        label: intl.get('small.common.model.productNum').d('商品编码'),
        type: 'string',
      },
      {
        name: 'skuName',
        label: intl.get('small.common.model.productName').d('商品名称'),
        type: 'string',
      },
      {
        name: 'originalQuantityMeaning',
        label: intl.get('smodr.orderDetail.model.quantity').d('数量'),
        type: 'number',
      },
      {
        name: 'unitPriceMeaning',
        type: 'string',
        label: intl.get('smodr.orderLine.model.unitPriceTaxNew').d('单价(含税)'),
      },
      {
        name: 'entryAmountMeaning',
        type: 'string',
        label: intl.get('smodr.orderLine.model.paidAmountTaxNew').d('行金额(含税)'),
      },
      {
        name: 'purchaseCompanyName',
        label: intl.get('small.common.model.company').d('公司'),
        type: 'string',
      },
      {
        name: 'supplierCompanyName',
        type: 'string',
        label: intl.get('smodr.orderLine.model.supplierCompany').d('供应商'),
      },
      {
        name: 'ouName',
        type: 'string',
        label: intl.get('smodr.orderDetail.model.ouName').d('业务实体'),
      },
      {
        name: 'purOrganizationName',
        type: 'string',
        label: intl.get('smodr.orderDetail.model.purchaseOrg').d('采购组织'),
      },
      {
        name: 'buyerName',
        type: 'string',
        label: intl.get('smodr.orderDetail.model.buyer').d('下单人'),
      },
      {
        name: 'cecCreatedTime',
        type: 'dateTime',
        label: intl.get('smodr.orderDetail.model.buyerDate').d('下单时间'),
      },
      {
        name: 'productCompareDTO',
        type: 'object',
        label: intl.get('smodr.orderDetail.model.competitive').d('比价单'),
      },
      {
        name: 'lowestPrice',
        type: 'number',
        label: intl.get('small.common.model.lowestPrice').d('是否为最低价'),
      },
      {
        name: 'intelligenceFlag',
        type: 'number',
        label: intl.get('small.common.model.intelligenceFlag').d('是否启用智能比价'),
      },
      {
        name: 'lowestConversionPriceFlag',
        type: 'number',
        label: intl.get('small.common.model.lowestConversionPriceFlag').d('是否为折算价最低'),
      },
      {
        name: 'conversionPrice',
        type: 'number',
        label: intl.get('small.common.model.conversionPrice').d('折算单价'),
      },
    ],
    transport: {
      read: () => ({
        url: `${SRM_SMODR}/v1/${organizationId}/order-entrys/intelligence-compare/report/line`,
        method: 'GET',
      }),
    },
  };
}
