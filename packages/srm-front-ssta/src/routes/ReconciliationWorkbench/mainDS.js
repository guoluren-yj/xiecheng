/*
 * @Description:
 * @Date: 2020-07-23 10:38:14
 * @author: zhangyongxuan <yongxuan.zhang@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2020, Hand
 */
import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';
import { transformSupplierData, amountFormatterOptions, transformQselectDate } from '@/utils/utils';

const prefix = `ssta.reconciliationWorkbench.model.reconciliationWorkbench`;
const organizationId = getCurrentOrganizationId();
const customizeUnitCodePurchaser = [
  'SSTA.PURCHASER_BILL_DETAIL_DRAWER.BILL_INFO',
  'SSTA.PURCHASER_BILL_DETAIL_DRAWER.BILL_RULE',
  'SSTA.PURCHASER_BILL_DETAIL_DRAWER.INVOICE_INFO',
  'SSTA.PURCHASER_BILL_DETAIL_DRAWER.PAYMENT_INFO',
  'SSTA.PURCHASER_BILL_DETAIL_DRAWER.SETTLE_DATA_RULE',
  'SSTA.PURCHASER_BILL_DETAIL_DRAWER.TRADING_PARTY',
  'SSTA.PURCHASER_BILL_DETAIL_DRAWER.TRANSACTION_AFFAIR',
  'SSTA.PURCHASER_BILL_DETAIL_DRAWER.TRANSACTION_AMOUNT',
].join();

const mainTableDs = () => ({
  primaryKey: 'billHeaderId',
  selection: 'multiple',
  cacheSelection: true,
  // table表单显示的字段
  dataToJSON: 'selected',
  pageSize: 20,
  fields: [
    {
      name: 'dragIcon',
      type: 'string',
    },
    {
      name: 'billNum',
      type: 'string',
      label: intl
        .get('ssta.reconciliationWorkbench.model.reconciliationWorkbench.billNum')
        .d('对账单编号'),
    },
    {
      name: 'companyName',
      type: 'string',
      label: intl
        .get('ssta.reconciliationWorkbench.model.reconciliationWorkbench.billCompanyMeaning')
        .d('对账公司'),
    },
    {
      name: 'syncStatusMeaning',
      type: 'string',
      label: intl.get(`${prefix}.syncStatusMeaning`).d('同步ERP状态'),
    },

    {
      name: 'syncResponseMsg',
      type: 'string',
      label: intl.get(`${prefix}.syncResponseMsg`).d('反馈信息'),
    },
    {
      name: 'supplierCompanyName',
      type: 'string',
      label: intl
        .get('ssta.reconciliationWorkbench.model.reconciliationWorkbench.billSupplierMeaning')
        .d('对账供应商'),
    },
    {
      name: 'currencyCode',
      type: 'string',
      label: intl
        .get('ssta.reconciliationWorkbench.model.reconciliationWorkbench.currencyCode')
        .d('币种'),
    },
    {
      name: 'netAmountMeaning',
      type: 'number',
      label: intl
        .get('ssta.reconciliationWorkbench.model.reconciliationWorkbench.netAmountMeaning')
        .d('不含税总金额'),
      computedProps: { formatterOptions: amountFormatterOptions },
    },
    {
      name: 'taxAmountMeaning',
      type: 'number',
      label: intl
        .get('ssta.reconciliationWorkbench.model.reconciliationWorkbench.taxAmountMeaning')
        .d('税额'),
      computedProps: { formatterOptions: amountFormatterOptions },
    },
    {
      name: 'taxIncludedAmountMeaning',
      type: 'number',
      label: intl
        .get('ssta.reconciliationWorkbench.model.reconciliationWorkbench.taxIncludedAmountMeaning')
        .d('含税总金额'),
      computedProps: { formatterOptions: amountFormatterOptions },
    },
    {
      name: 'billStatusMeaning',
      type: 'string',
      label: intl
        .get('ssta.reconciliationWorkbench.model.reconciliationWorkbench.billStatus')
        .d('对账单状态'), // lovCode = "SSTA.BILL_STATUS"
    },
    {
      name: 'creationDate',
      type: 'date',
      label: intl
        .get('ssta.reconciliationWorkbench.model.reconciliationWorkbench.creationDate')
        .d('创建日期'),
    },
    {
      name: 'createdUserName',
      type: 'string',
      label: intl
        .get('ssta.reconciliationWorkbench.model.reconciliationWorkbench.createdUserName')
        .d('创建人'),
    },
    {
      name: 'campMeaning',
      type: 'string',
      label: intl
        .get('ssta.reconciliationWorkbench.model.reconciliationWorkbench.campMeaning')
        .d('创建方阵营'), // lovCode = "SSTA.CAMP"
    },
    {
      name: 'invOrganizationName',
      type: 'string',
      label: intl
        .get('ssta.reconciliationWorkbench.model.reconciliationWorkbench.invOrganizationId')
        .d('库存组织'),
    },
    {
      name: 'sourceSupplierCompanyName',
      type: 'string',
      label: intl
        .get('ssta.reconciliationWorkbench.model.reconciliationWorkbench.sourceSupplierName')
        .d('数据源平台供应商名称'),
    },
    {
      name: 'sourceSupplierCompanyNum',
      type: 'string',
      label: intl
        .get('ssta.reconciliationWorkbench.model.reconciliationWorkbench.sourceSupplierCompanyNum')
        .d('数据源平台供应商编码'),
    },
    {
      type: 'string',
      name: 'confirmCollaborativeMode',
      label: intl
        .get(`ssta.reconciliationWorkbench.model.reconciliationWorkbench.confirmCollaborativeModes`)
        .d('协同模式'),
    },
    {
      name: 'supplierSiteCode',
      type: 'string',
      label: intl.get(`${prefix}.supplierSiteCode`).d('供应商地点'),
    },
    {
      name: 'purchaserESignStatusMeaning',
      type: 'string',
      label: intl.get(`ssta.common.model.reconciliationWorkbench.eSignStatus`).d('采购方签章状态'),
    },
    {
      name: 'supplierESignStatusMeaning',
      type: 'string',
      label: intl
        .get(`ssta.common.model.reconciliationWorkbenchSup.eSignStatus`)
        .d('供应商签章状态'),
    },
    {
      name: 'eSignOrderMeaning',
      type: 'string',
      label: intl.get(`ssta.common.model.reconciliationWorkbench.eSignOrder`).d('签章顺序'),
    },
    {
      name: 'purchaserEvidenceStatusMeaning',
      type: 'string',
      label: intl
        .get(`ssta.common.model.reconciliationWorkbench.evidenceStatu`)
        .d('采购方存证状态'),
    },
    {
      name: 'supplierEvidenceStatusMeaning',
      type: 'string',
      label: intl
        .get(`ssta.common.model.reconciliationWorkbenchSup.evidenceStatus`)
        .d('供应商存证状态'),
    },
    {
      name: 'purchaserESignMsg',
      type: 'string',
      label: intl.get(`ssta.common.model.reconciliationWorkbench.eSignMsg`).d('采购方签章失败原因'),
    },
    {
      name: 'supplierESignMsg',
      type: 'string',
      label: intl
        .get(`ssta.common.model.reconciliationWorkbenchSup.eSignMsg`)
        .d('供应商签章失败原因'),
    },
    {
      name: 'terminateSignStatus',
      type: 'string',
      lookupCode: 'SSTA_TERMINATE_SIGN_STATUS',
      label: intl
        .get(`ssta.common.model.reconciliationWorkbench.terminateSignStatus`)
        .d('解约状态'),
    },
    {
      name: 'operation',
      type: 'string',
      label: intl
        .get('ssta.reconciliationWorkbench.model.reconciliationWorkbench.operation')
        .d('操作'),
    },
  ],

  queryFields: [],

  transport: {
    /**
     * 查询
     */
    read: ({ data }) => {
      const { supplierCompanyId } = data || {};
      return {
        url: `/ssta/v1/${organizationId}/bill-headers/purchaser`,
        method: 'GET',
        data: {
          ...data,
          ...transformQselectDate(data, { creationDateRange: 'creationDate' }),
          ...transformSupplierData(supplierCompanyId),
        },
      };
    },
  },
});

// 头
const formDs = () => ({
  autoCreate: true,

  fields: [
    // 交易方信息
    {
      name: 'sourceCompanyNum',
      type: 'string',
      label: intl
        .get('ssta.reconciliationWorkbench.model.reconciliationWorkbench.sourceCompanyNum')
        .d('数据源公司编码'),
    },
    {
      name: 'sourceCompanyName',
      type: 'string',
      label: intl
        .get('ssta.reconciliationWorkbench.model.reconciliationWorkbench.sourceCompanyName')
        .d('数据源公司名称'),
    },
    {
      name: 'sourceSupplierCompanyNum',
      type: 'string',
      label: intl
        .get('ssta.reconciliationWorkbench.model.reconciliationWorkbench.sourceSupplierCompanyNum')
        .d('数据源平台供应商编码'),
    },
    {
      name: 'sourceSupplierCompanyName',
      type: 'string',
      label: intl
        .get('ssta.reconciliationWorkbench.model.reconciliationWorkbench.sourceSupplierCompanyName')
        .d('数据源供应商名称'),
    },
    {
      name: 'companyNum',
      type: 'string',
      label: intl
        .get('ssta.reconciliationWorkbench.model.reconciliationWorkbench.companyNum')
        .d('结算公司编码'),
    },
    {
      name: 'companyName',
      type: 'string',
      label: intl
        .get('ssta.reconciliationWorkbench.model.reconciliationWorkbench.settlementCompanyName')
        .d('结算公司名称'),
    },
    {
      name: 'supplierCompanyNum',
      type: 'string',
      label: intl
        .get('ssta.reconciliationWorkbench.model.reconciliationWorkbench.supplierCompanyNum')
        .d('结算供应商编码'),
    },
    {
      name: 'supplierCompanyName',
      type: 'string',
      label: intl
        .get(
          'ssta.reconciliationWorkbench.model.reconciliationWorkbench.settlementSupplierCompanyNum'
        )
        .d('结算供应商名称'),
    },
    {
      name: 'supplierSiteCode',
      type: 'string',
      label: intl
        .get('ssta.reconciliationWorkbench.model.reconciliationWorkbench.supplierSiteCode1')
        .d('结算供应商地点'),
    },
    {
      name: 'sourceSupplierSiteCode',
      type: 'string',
      label: intl
        .get('ssta.reconciliationWorkbench.model.reconciliationWorkbench.sourceSupplierSiteCode')
        .d('数据源供应商地点'),
    },
    // 交易金额信息
    {
      name: 'itemCode',
      type: 'string',
      label: intl
        .get('ssta.reconciliationWorkbench.model.reconciliationWorkbench.itemCode')
        .d('结算商品编码'),
    },
    {
      name: 'itemName',
      type: 'string',
      label: intl
        .get('ssta.reconciliationWorkbench.model.reconciliationWorkbench.itemName')
        .d('结算商品名称'),
    },
    {
      name: 'quantity',
      type: 'number',
      label: intl
        .get('ssta.reconciliationWorkbench.model.reconciliationWorkbench.shouldSettlementNum')
        .d('可结算数量'),
    },
    {
      name: 'unitPriceBatch',
      type: 'number',
      label: intl
        .get('ssta.reconciliationWorkbench.model.reconciliationWorkbench.unitPriceBatch')
        .d('每'),
    },
    {
      name: 'netPriceMeaning',
      label: intl
        .get('ssta.reconciliationWorkbench.model.reconciliationWorkbench.notIncludePrice')
        .d('不含税单价'),
    },
    {
      name: 'netAmountMeaning',
      label: intl
        .get('ssta.reconciliationWorkbench.model.reconciliationWorkbench.notIncludeAmount')
        .d('不含税金额'),
    },
    {
      name: 'taxIncludedPriceMeaning',
      label: intl
        .get('ssta.reconciliationWorkbench.model.reconciliationWorkbench.netPrice')
        .d('含税单价'),
    },
    {
      name: 'taxIncludedAmountMeaning',
      label: intl
        .get('ssta.reconciliationWorkbench.model.reconciliationWorkbench.taxIncludedPrice')
        .d('含税金额'),
    },
    {
      name: 'taxRate',
      type: 'number',
      label: intl
        .get('ssta.reconciliationWorkbench.model.reconciliationWorkbench.taxRate')
        .d('税率'),
    },
    {
      name: 'taxAmountMeaning',
      label: intl
        .get('ssta.reconciliationWorkbench.model.reconciliationWorkbench.taxAmount')
        .d('税额'),
    },
    {
      name: 'currencyCode',
      type: 'string',
      label: intl
        .get('ssta.reconciliationWorkbench.model.reconciliationWorkbench.settlementCurrency')
        .d('结算币种'),
    },
    {
      name: 'uom',
      type: 'string',
      label: intl.get('ssta.reconciliationWorkbench.model.reconciliationWorkbench.uom').d('单位'),
    },
    {
      name: 'specificationsModel',
      type: 'string',
      label: intl
        .get('ssta.reconciliationWorkbench.model.reconciliationWorkbench.specificationsModel')
        .d('规格型号'),
    },
    {
      name: 'srmItemCode',
      type: 'string',
      label: intl
        .get('ssta.reconciliationWorkbench.model.reconciliationWorkbench.srmItemCode')
        .d('srm物料编号'),
    },
    {
      name: 'categoryName',
      type: 'string',
      label: intl
        .get(`ssta.reconciliationWorkbench.model.reconciliationWorkbench.categoryName`)
        .d('物料分类'),
    },
    // 交易事务信息

    {
      name: 'settleNum',
      type: 'string',
      label: intl
        .get('ssta.reconciliationWorkbench.model.reconciliationWorkbench.settleNum')
        .d('结算事务编号'),
    },
    {
      name: 'sourceSettleNum',
      type: 'string',
      label: intl
        .get('ssta.reconciliationWorkbench.model.reconciliationWorkbench.sourceSettleNum')
        .d('结算事务来源编号'),
    },
    {
      name: 'sourceSettleLineNum',
      type: 'string',
      label: intl
        .get('ssta.reconciliationWorkbench.model.reconciliationWorkbench.sourceSettleLineNum')
        .d('结算事务来源行号'),
    },
    {
      name: 'dataSourceMeaning',
      type: 'string',
      label: intl
        .get('ssta.reconciliationWorkbench.model.reconciliationWorkbench.dataSource')
        .d('数据来源'),
    },
    {
      label: intl
        .get(`ssta.reconciliationWorkbench.model.reconciliationWorkbench.trxDate`)
        .d('结算事务日期'),
      type: 'date',
      name: 'trxDate',
    },
    {
      name: 'trxYear',
      type: 'string',
      label: intl
        .get('ssta.reconciliationWorkbench.model.reconciliationWorkbench.trxYear')
        .d('事务年度'),
    },
    {
      name: 'contractAndLineNum',
      type: 'string',
      label: intl
        .get('ssta.reconciliationWorkbench.model.reconciliationWorkbench.contractLineNum')
        .d('协议编号|行号'),
    },
    {
      name: 'poAndLineNum',
      type: 'string',
      label: intl
        .get('ssta.reconciliationWorkbench.model.reconciliationWorkbench.poLineNum')
        .d('采购订单编号|行号'),
    },
    {
      name: 'asnAndLineNum',
      type: 'string',
      label: intl
        .get('ssta.reconciliationWorkbench.model.reconciliationWorkbench.asnLineNum')
        .d('送货单号|行号'),
    },
    {
      name: 'poLineLocation',
      type: 'string',
      label: intl
        .get('ssta.reconciliationWorkbench.model.reconciliationWorkbench.poLineLocation')
        .d('发运行'),
    },
    {
      name: 'releaseNum',
      type: 'string',
      label: intl
        .get('ssta.reconciliationWorkbench.model.reconciliationWorkbench.releaseNum')
        .d('发放号'),
    },
    {
      name: 'orderType',
      type: 'string',
      label: intl
        .get('ssta.reconciliationWorkbench.model.reconciliationWorkbench.orderType')
        .d('订单类型'),
    },
    {
      name: 'purOrganizationName',
      type: 'string',
      label: intl
        .get('ssta.reconciliationWorkbench.model.reconciliationWorkbench.purOrganizationId')
        .d('采购组织'),
    },
    {
      name: 'invOrganizationName',
      type: 'string',
      label: intl
        .get('ssta.reconciliationWorkbench.model.reconciliationWorkbench.invOrganizationId')
        .d('库存组织'),
    },
    {
      name: 'inventoryName',
      type: 'string',
      label: intl
        .get('ssta.reconciliationWorkbench.model.reconciliationWorkbench.inventoryName')
        .d('库房'),
    },
    {
      name: 'trxTypeCode',
      type: 'string',
      label: intl
        .get('ssta.reconciliationWorkbench.model.reconciliationWorkbench.trxTypeCode')
        .d('事务类型编码'),
    },
    {
      name: 'trxTypeCodeMeaning',
      type: 'string',
      label: intl
        .get('ssta.reconciliationWorkbench.model.reconciliationWorkbench.trxTypeName')
        .d('事务类型名称'),
    },
    {
      name: 'createdByName',
      type: 'string',
      label: intl
        .get('ssta.reconciliationWorkbench.model.reconciliationWorkbench.createdUserName')
        .d('创建人'),
    },
    {
      name: 'purchaseAgentName',
      type: 'string',
      label: intl
        .get('ssta.reconciliationWorkbench.model.reconciliationWorkbench.purchaseAgentName')
        .d('采购员'),
    },
    {
      name: 'sourceParentSettleLineNum',
      type: 'string',
      label: intl
        .get('ssta.reconciliationWorkbench.model.reconciliationWorkbench.sourceParentSettleLineNum')
        .d('父事务处理编号|行号'),
    },
    {
      name: 'freightFlag',
      type: 'boolean',
      defaultValue: 0,
      label: intl
        .get('ssta.reconciliationWorkbench.model.reconciliationWorkbench.freightFlag')
        .d('运费标识'),
    },
    {
      name: 'ecPoNum',
      type: 'string',
      label: intl
        .get('ssta.reconciliationWorkbench.model.reconciliationWorkbench.ecPoNum')
        .d('电商订单编号'),
    },
    {
      name: 'ecPoSubNum',
      type: 'string',
      label: intl
        .get('ssta.reconciliationWorkbench.model.reconciliationWorkbench.ecPoSubNum')
        .d('电商子订单编号'),
    },
    {
      name: 'deliverTime',
      type: 'dateTime',
      label: intl
        .get('ssta.reconciliationWorkbench.model.reconciliationWorkbench.deliverTime')
        .d('妥投时间'),
    },
    {
      name: 'deliverQuantity',
      type: 'number',
      label: intl
        .get('ssta.reconciliationWorkbench.model.reconciliationWorkbench.deliverQuantity')
        .d('妥投数量'),
    },
    {
      label: intl
        .get(`ssta.reconciliationWorkbench.model.reconciliationWorkbench.ecDeliverQuantity`)
        .d('配送数量'),
      type: 'number',
      name: 'ecDeliverQuantity',
    },
    {
      name: 'invoiceMethodMeaning',
      type: 'string',
      label: intl
        .get('ssta.reconciliationWorkbench.model.reconciliationWorkbench.invoiceMethod')
        .d('开票方式'),
    },
    {
      name: 'elecInvoiceView',
      type: 'string',
      label: intl
        .get('ssta.reconciliationWorkbench.model.reconciliationWorkbench.elecInvoiceView')
        .d('查看电子发票'),
    },
    {
      name: 'afterSalesStatusMeaning',
      type: 'string',
      label: intl
        .get('ssta.reconciliationWorkbench.model.reconciliationWorkbench.afterSalesStatusMeaning')
        .d('电商售后状态'),
    },
    {
      name: 'invoiceTypeMeaning',
      type: 'string',
      label: intl
        .get('ssta.reconciliationWorkbench.model.reconciliationWorkbench.invoiceTypeMeaning')
        .d('电商开票类型'),
    },
    {
      name: 'costName',
      type: 'string',
      label: intl
        .get('ssta.reconciliationWorkbench.model.reconciliationWorkbench.costName')
        .d('成本中心'),
    },

    {
      name: 'termCode',
      type: 'string',
      label: intl
        .get('ssta.reconciliationWorkbench.model.reconciliationWorkbench.termCode')
        .d('付款编码'),
    },
    {
      name: 'sinvLineAttachmentUuid',
      type: 'attachment',
      label: intl
        .get(`ssta.reconciliationWorkbench.model.reconciliationWorkbench.settleAttach`)
        .d('结算事务行附件'),
      bucketName: window.$$env.PRIVATE_BUCKET || 'private-bucket',
    },
    {
      label: intl
        .get(`ssta.reconciliationWorkbench.model.reconciliationWorkbench.multiDealTrxNum`)
        .d('三方交易关联事务来源编号'),
      type: 'string',
      name: 'multiDealTrxNum',
    },
    {
      label: intl
        .get(`ssta.reconciliationWorkbench.model.reconciliationWorkbench.multiDealTrxLineNum`)
        .d('三方交易关联事务来源行'),
      type: 'string',
      name: 'multiDealTrxLineNum',
    },
    {
      label: intl
        .get(`ssta.reconciliationWorkbench.model.reconciliationWorkbench.multiDealPoNum`)
        .d('三方交易关联订单编号'),
      type: 'string',
      name: 'multiDealPoNum',
    },
    {
      label: intl
        .get(`ssta.reconciliationWorkbench.model.reconciliationWorkbench.multiDealPoLineNum`)
        .d('三方交易关联订单行号'),
      type: 'string',
      name: 'multiDealPoLineNum',
    },
    {
      label: intl
        .get(`ssta.reconciliationWorkbench.model.reconciliationWorkbench.pcSubjectLineNum`)
        .d('协议标的行号'),
      type: 'string',
      name: 'pcSubjectLineNum',
    },
    {
      name: 'poClosedFlagMeaning',
      type: 'string',
      label: intl
        .get('ssta.reconciliationWorkbench.model.reconciliationWorkbench.poClosedFlag')
        .d('订单关闭标识'),
    },
    {
      label: intl.get(`ssta.common.model.common.unitName`).d('部门名称'),
      type: 'string',
      name: 'unitName',
    },
    // 对账信息
    {
      name: 'billOccupiedQuantity',
      type: 'number',
      label: intl
        .get('ssta.reconciliationWorkbench.model.reconciliationWorkbench.billOccupiedQuantity')
        .d('对账占用数量'),
    },
    {
      name: 'billOccupiedNetAmountMeaning',
      label: intl
        .get('ssta.reconciliationWorkbench.model.reconciliationWorkbench.billOccupiedNetAmount')
        .d('对账占用不含税金额'),
    },
    {
      name: 'billOccupiedTaxAmountMeaning',
      label: intl
        .get('ssta.reconciliationWorkbench.model.reconciliationWorkbench.billOccupiedTaxAmount')
        .d('对账占用税额'),
    },
    {
      name: 'billOccupiedAmountMeaning',
      label: intl
        .get('ssta.reconciliationWorkbench.model.reconciliationWorkbench.billOccupiedAmountMeaning')
        .d('对账占用含税金额'),
    },
    {
      name: 'billCompletedQuantity',
      type: 'number',
      label: intl
        .get('ssta.reconciliationWorkbench.model.reconciliationWorkbench.billCompletedQuantity')
        .d('对账完成数量'),
    },
    {
      name: 'billCompletedNetAmountMeaning',
      label: intl
        .get('ssta.reconciliationWorkbench.model.reconciliationWorkbench.billCompletedNetAmount')
        .d('对账完成不含税金额'),
    },
    {
      name: 'billCompletedTaxAmountMeaning',
      label: intl
        .get('ssta.reconciliationWorkbench.model.reconciliationWorkbench.billCompletedTaxAmount')
        .d('对账完成税额'),
    },
    {
      name: 'billCompletedAmountMeaning',
      label: intl
        .get(
          'ssta.reconciliationWorkbench.model.reconciliationWorkbench.billCompletedAmountMeaning'
        )
        .d('对账完成含税金额'),
    },
    {
      name: 'billRemoveFlag',
      type: 'boolean',
      defaultValue: 0,
      label: intl
        .get('ssta.reconciliationWorkbench.model.reconciliationWorkbench.billRemoveFlag')
        .d('对账暂挂'),
    },
    {
      name: 'billLockQuantity',
      type: 'string',
      label: intl
        .get('ssta.reconciliationWorkbench.model.reconciliationWorkbench.billLockQuantity')
        .d('对账锁定标记'),
    },
    //  开票信息
    {
      name: 'invoiceOccupiedQuantity',
      type: 'number',
      label: intl
        .get('ssta.reconciliationWorkbench.model.reconciliationWorkbench.invoiceOccupiedQuantity')
        .d('开票占用数量'),
    },
    {
      name: 'invoiceOccupiedNetAmountMeaning',
      label: intl
        .get('ssta.reconciliationWorkbench.model.reconciliationWorkbench.invoiceOccupiedNetAmount')
        .d('开票占用不含税金额'),
    },
    {
      name: 'invoiceOccupiedTaxAmountMeaning',
      label: intl
        .get('ssta.reconciliationWorkbench.model.reconciliationWorkbench.invoiceOccupiedTaxAmount')
        .d('开票占用税额'),
    },
    {
      name: 'invoiceOccupiedAmountMeaning',
      label: intl
        .get('ssta.reconciliationWorkbench.model.reconciliationWorkbench.invoiceOccupiedAmount')
        .d('开票占用含税金额'),
    },
    {
      name: 'invoiceCompletedQuantity',
      type: 'number',
      label: intl
        .get('ssta.reconciliationWorkbench.model.reconciliationWorkbench.invoiceCompletedQuantity')
        .d('开票完成数量'),
    },
    {
      name: 'invoiceCompletedNetAmountMeaning',
      label: intl
        .get(
          'ssta.reconciliationWorkbench.model.reconciliationWorkbench.invoiceCompletedNetAmountMeaning'
        )
        .d('开票完成不含税金额'),
    },
    {
      name: 'invoiceCompletedTaxAmountMeaning',
      label: intl
        .get(
          'ssta.reconciliationWorkbench.model.reconciliationWorkbench.invoiceCompletedTaxAmountMeaning'
        )
        .d('开票完成税额'),
    },
    {
      name: 'invoiceCompletedAmountMeaning',
      label: intl
        .get('ssta.reconciliationWorkbench.model.reconciliationWorkbench.invoiceCompletedAmount')
        .d('开票完成含税金额'),
    },
    {
      name: 'invoiceRemoveFlag',
      type: 'boolean',
      defaultValue: 0,
      label: intl
        .get('ssta.reconciliationWorkbench.model.reconciliationWorkbench.invoiceRemoveFlag')
        .d('开票暂挂'),
    },
    {
      label: intl
        .get(`ssta.reconciliationWorkbench.model.reconciliationWorkbench.invoiceLockQuantity`)
        .d('开票锁定标记'),
      type: 'string',
      name: 'invoiceLockQuantity',
    },
    // 付款信息
    {
      name: 'paymentOccupiedAmountMeaning',
      label: intl
        .get('ssta.reconciliationWorkbench.model.reconciliationWorkbench.paymentOccupiedAmount')
        .d('付款占用金额'),
    },
    {
      name: 'paymentCompletedAmountMeaning',
      label: intl
        .get('ssta.reconciliationWorkbench.model.reconciliationWorkbench.paymentCompletedAmount')
        .d('付款完成金额'),
    },
    {
      name: 'paymentRemoveFlag',
      type: 'boolean',
      defaultValue: 0,
      label: intl
        .get('ssta.reconciliationWorkbench.model.reconciliationWorkbench.paymentRemoveFlag')
        .d('付款暂挂'),
    },
    {
      name: 'paymentLockQuantity',
      type: 'string',
      label: intl
        .get('ssta.reconciliationWorkbench.model.reconciliationWorkbench.paymentLockQuantity')
        .d('付款锁定标记'),
    },
  ],
});

const strategyDs = () => ({
  autoCreate: true,
  fields: [
    // 结算数据规则
    {
      name: 'settleConfigNum',
      type: 'string',

      label: intl
        .get('ssta.reconciliationWorkbench.model.reconciliationWorkbench.settlementMethodNum')
        .d('结算策略编号'),
    },
    {
      name: 'settleConfigName',
      type: 'string',
      label: intl
        .get('ssta.reconciliationWorkbench.model.reconciliationWorkbench.settlementMethodName')
        .d('结算策略名称'),
    },
    {
      name: 'versionNumber',
      type: 'string',
      label: intl
        .get('ssta.reconciliationWorkbench.model.reconciliationWorkbench.settleConfigVersionNumber')
        .d('版本号'),
    },
    {
      name: 'settleBasePriceMeaning',
      type: 'string',
      label: intl
        .get('ssta.reconciliationWorkbench.model.reconciliationWorkbench.settleBasePriceMeaning')
        .d('结算基准价'),
    },
    {
      name: 'settleModeMeaning',
      type: 'string',
      label: intl
        .get('ssta.reconciliationWorkbench.model.reconciliationWorkbench.settleModeMeaning')
        .d('结算模式'),
    },
    {
      name: 'settleMatchDimensionMeaning',
      type: 'string',
      label: intl
        .get(
          'ssta.reconciliationWorkbench.model.reconciliationWorkbench.settleMatchDimensionMeaning'
        )
        .d('结算匹配维度'),
    },
    // 对账单规则
    {
      name: 'billCompanyMeaning',
      type: 'string',
      label: intl
        .get('ssta.reconciliationWorkbench.model.reconciliationWorkbench.billCompanyMeaning')
        .d('对账公司'),
    },
    {
      name: 'billSupplierMeaning',
      type: 'string',
      label: intl
        .get('ssta.reconciliationWorkbench.model.reconciliationWorkbench.billSupplierMeaning')
        .d('对账供应商'),
    },
    {
      name: 'billPartMatchFlag',
      type: 'number',
      label: intl
        .get('ssta.reconciliationWorkbench.model.reconciliationWorkbench.partMatchFlag')
        .d('部分匹配'),
    },
    {
      name: 'priceAdjustFlag',
      type: 'number',
      label: intl
        .get('ssta.reconciliationWorkbench.model.reconciliationWorkbench.priceUpdFlag')
        .d('单价调整'),
    },
    {
      name: 'billDependencyFlag',
      type: 'number',
      label: intl
        .get('ssta.reconciliationWorkbench.model.reconciliationWorkbench.dependencyFlag')
        .d('是否依赖'),
    },
  ],

  transport: {
    read: ({ dataSet }) => {
      const {
        queryParameter: { settleConfigNum, settleConfigId, type },
      } = dataSet;
      const url =
        type === 'F'
          ? `/ssta/v1/${organizationId}/settle-config/release-config/${settleConfigNum}`
          : `/ssta/v1/${organizationId}/settle-config/current-config-by-id/${settleConfigId}`;
      return {
        url,
        method: 'get',
        data: {},
        params: { customizeUnitCode: customizeUnitCodePurchaser },
      };
    },
  },
});

const detailTableDs = () => {
  return {
    cacheSelection: true,
    primaryKey: 'billLineId',
    queryFields: [],
    pageSize: 20,
    fields: [
      {
        name: 'billStatusMeaning',
        type: 'string',
        label: intl.get(`${prefix}.billStatusMeaning`).d('对账单状态'),
      },
      {
        name: 'billNum',
        type: 'string',
        label: intl.get(`${prefix}.billNumLine`).d('对账单编号|行号'),
      },
      {
        name: 'settleNum',
        type: 'string',
        label: intl.get(`${prefix}.settleNum`).d('结算事务编号'),
      },
      {
        name: 'sourceSettleNumAndLineNum',
        type: 'string',
        label: intl.get(`${prefix}.sourceSettleNumAndLineNum`).d('结算事务来源编号|行号'),
      },
      {
        name: 'companyName',
        type: 'string',
        label: intl.get(`${prefix}.companyName`).d('对账公司'),
      },
      {
        name: 'supplierCompanyName',
        type: 'string',
        label: intl.get(`${prefix}.supplierCompanyName`).d('对账供应商'),
      },
      {
        name: 'currencyCode',
        type: 'string',
        label: intl.get(`${prefix}.currencyCode`).d('币种'),
      },
      {
        name: 'itemCode',
        type: 'string',
        label: intl.get(`${prefix}.itemCode`).d('结算商品编码'),
      },
      {
        name: 'itemName',
        type: 'string',
        label: intl.get(`${prefix}.itemName`).d('结算商品名称'),
      },
      {
        name: 'uom',
        type: 'string',
        label: intl.get(`${prefix}.uom`).d('单位'),
      },
      {
        name: 'quantity',
        type: 'number',
        label: intl.get(`${prefix}.quantity`).d('本次对账数量'),
      },
      {
        name: 'netPriceMeaning',
        type: 'number',
        label: intl.get(`${prefix}.netPriceMeaning`).d('本次对账不含税单价'),
      },
      {
        name: 'unitPriceBatch',
        type: 'number',
        label: intl.get(`${prefix}.unitPriceBatch`).d('每'),
      },
      {
        name: 'netAmountMeaning',
        type: 'number',
        label: intl.get(`${prefix}.currentNetAmount`).d('本次对账不含税金额'),
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        name: 'taxRate',
        type: 'number',
        label: intl.get(`${prefix}.taxRate`).d('税率'),
      },
      {
        name: 'taxAmountMeaning',
        type: 'number',
        label: intl.get(`${prefix}.taxAmountMeaning`).d('税额'),
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        name: 'taxIncludedPriceMeaning',
        type: 'number',
        label: intl.get(`${prefix}.taxIncludedPriceMeaning`).d('本次对账含税单价'),
      },
      {
        name: 'taxIncludedAmountMeaning',
        type: 'number',
        label: intl.get(`${prefix}.currentTaxIncludedAmount`).d('本次对账含税金额'),
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        name: 'settleMatchDimensionMeaning',
        type: 'string',
        label: intl.get(`${prefix}.settleMatchDimensionMeaning`).d('结算匹配维度'),
      },
      {
        name: 'settleBasePriceMeaning',
        type: 'string',
        label: intl.get(`${prefix}.settleBasePriceMeaning`).d('结算基准价'),
      },
      {
        name: 'settleModeMeaning',
        type: 'string',
        label: intl.get(`${prefix}.settleModeMeaning`).d('结算模式'),
      },
      {
        name: 'enableQuantity',
        type: 'number',
        label: intl.get(`${prefix}.enableQuantity`).d('可对账数量'),
      },
      {
        name: 'orignPriceMeaning',
        type: 'number',
        label: intl.get(`${prefix}.orignPriceMeaning`).d('原对账单价'),
      },
      {
        name: 'enableAmountMeaning',
        type: 'number',
        label: intl.get(`${prefix}.enableAmountMeaning`).d('可对账金额'),
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        name: 'trxDate',
        type: 'date',
        label: intl.get(`${prefix}.trxDate`).d('结算事务日期'),
      },
      {
        name: 'poAndLineNum',
        type: 'string',
        label: intl.get(`${prefix}.poAndLineNum`).d('采购订单编号|行号'),
      },
      {
        name: 'ecPoSubNum',
        type: 'string',
        label: intl.get(`${prefix}.ecPoSubNum`).d('电商子订单编号'),
      },
      {
        name: 'sourceParentSettleNumAndLineNum',
        type: 'string',
        label: intl.get(`${prefix}.sourceParentSettleNumAndLineNum`).d('父事务编号|行号'),
      },
      {
        name: 'asnAndLineNum',
        type: 'string',
        label: intl.get(`${prefix}.asnAndLineNum`).d('送货单号|行号'),
      },
      {
        name: 'orderType',
        type: 'string',
        label: intl.get(`${prefix}.orderType`).d('订单类型'),
      },
      {
        name: 'purOrganizationName',
        type: 'string',
        label: intl.get(`${prefix}.purOrganizationName`).d('采购组织'),
      },
      {
        name: 'invOrganizationName',
        type: 'string',
        label: intl.get(`${prefix}.invOrganizationName`).d('库存组织'),
      },
      {
        name: 'purchaseAgentName',
        type: 'string',
        label: intl.get(`${prefix}.purchaseAgentName`).d('采购员'),
      },
      {
        name: 'trxTypeCodeMeaning',
        type: 'string',
        label: intl.get(`${prefix}.trxTypeCodeMeaning`).d('采购事务类型'),
      },
      {
        name: 'dataSourceMeaning',
        type: 'string',
        label: intl.get(`${prefix}.sourcePlatformCodeMeaning`).d('数据来源类型'),
      },
      {
        name: 'sourcePlatformCodeMeaning',
        type: 'string',
        label: intl.get(`${prefix}.dataSourceMeaning`).d('数据来源系统'),
      },
      {
        name: 'ecBillNum',
        type: 'string',
        label: intl.get(`${prefix}.ecBillNum`).d('电商对账单编号'),
      },
      {
        name: 'creationDate',
        type: 'date',
        label: intl.get(`${prefix}.creationDate`).d('创建日期'),
      },
      {
        name: 'createdUserName',
        type: 'string',
        label: intl.get(`${prefix}.createdUserName`).d('创建人'),
      },
      {
        name: 'campMeaning',
        type: 'string',
        label: intl.get(`${prefix}.campMeaning`).d('创建方阵营'),
      },
      {
        name: 'supplierSiteCode',
        type: 'string',
        label: intl.get(`${prefix}.supplierSiteCode`).d('供应商地点'),
      },
      {
        type: 'string',
        name: 'multiDealTrxNum',
        label: intl.get(`${prefix}.multiDealTrxNum`).d('三方交易关联事务来源编号'),
      },
      {
        type: 'string',
        name: 'multiDealTrxLineNum',
        label: intl.get(`${prefix}.multiDealTrxLineNum`).d('三方交易关联事务来源行'),
      },
      {
        type: 'string',
        name: 'multiDealPoNum',
        label: intl.get(`${prefix}.multiDealPoNum`).d('三方交易关联订单编号'),
      },
      {
        type: 'string',
        name: 'multiDealPoLineNum',
        label: intl.get(`${prefix}.multiDealPoLineNum`).d('三方交易关联订单行号'),
      },
      {
        name: 'operation',
        type: 'string',
        label: intl.get(`${prefix}.operation`).d('操作'),
      },
    ],
    transport: {
      read: ({ data }) => {
        const { supplierCompanyId } = data || {};
        const customizeUnitCode =
          'SSTA.PURCHASER_BILL_LIST.GRID_DETAIL,SSTA.PURCHASER_BILL_LIST.SEARCH_BAR_DETAIL';
        return {
          url: `/ssta/v1/${organizationId}/bill-lines/purchaser?customizeUnitCode=${customizeUnitCode}`,
          method: 'GET',
          data: {
            ...data,
            ...transformQselectDate(data, { dateRange: 'creationDate', trxDateRange: 'trxDate' }),
            ...transformSupplierData(supplierCompanyId),
          },
        };
      },
    },
  };
};

export { mainTableDs, formDs, strategyDs, detailTableDs };
