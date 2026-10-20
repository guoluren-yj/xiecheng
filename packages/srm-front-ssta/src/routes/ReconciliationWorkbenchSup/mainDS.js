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

const organizationId = getCurrentOrganizationId();
const customizeUnitCodeSupplier = [
  'SSTA.SUPPLIER_BILL_DETAIL_DRAWER.BILL_INFO',
  'SSTA.SUPPLIER_BILL_DETAIL_DRAWER.BILL_RULE',
  'SSTA.SUPPLIER_BILL_DETAIL_DRAWER.INVOICE_INFO',
  'SSTA.SUPPLIER_BILL_DETAIL_DRAWER.PAYMENT_INFO',
  'SSTA.SUPPLIER_BILL_DETAIL_DRAWER.SETTLE_DATA_RULE',
  'SSTA.SUPPLIER_BILL_DETAIL_DRAWER.TRADING_PARTY',
  'SSTA.SUPPLIER_BILL_DETAIL_DRAWER.TRANSACTION_AFFAIR',
  'SSTA.SUPPLIER_BILL_DETAIL_DRAWER.TRANSACTION_AMOUNT',
].join();

const prefix = 'ssta.reconciliationWorkbenchSup.model.reconciliationWorkbenchSup';

const mainTableDs = () => ({
  primaryKey: 'billHeaderId',
  selection: 'multiple',
  dataToJSON: 'selected',
  cacheSelection: true,
  pageSize: 20,
  // table表单显示的字段
  fields: [
    {
      name: 'dragIcon',
      type: 'string',
    },
    {
      name: 'billNum',
      type: 'string',
      label: intl
        .get('ssta.reconciliationWorkbenchSup.model.reconciliationWorkbenchSup.billNum')
        .d('对账单编号'),
    },
    {
      name: 'companyName',
      type: 'string',
      label: intl
        .get('ssta.reconciliationWorkbenchSup.model.reconciliationWorkbenchSup.companyName')
        .d('对账客户公司'),
    },
    {
      name: 'supplierCompanyName',
      type: 'string',
      label: intl
        .get('ssta.reconciliationWorkbenchSup.model.reconciliationWorkbenchSup.supplierCompanyName')
        .d('对账供应商公司'),
    },
    {
      name: 'currencyCode',
      type: 'string',
      label: intl
        .get('ssta.reconciliationWorkbenchSup.model.reconciliationWorkbenchSup.currencyCode')
        .d('币种'),
    },
    {
      name: 'netAmountMeaning',
      type: 'number',
      label: intl
        .get('ssta.reconciliationWorkbenchSup.model.reconciliationWorkbenchSup.netAmountMeaning')
        .d('不含税总金额'),
      computedProps: { formatterOptions: amountFormatterOptions },
    },
    {
      name: 'taxAmountMeaning',
      type: 'number',
      label: intl
        .get('ssta.reconciliationWorkbenchSup.model.reconciliationWorkbenchSup.taxAmountMeaning')
        .d('税额'),
      computedProps: { formatterOptions: amountFormatterOptions },
    },
    {
      name: 'taxIncludedAmountMeaning',
      type: 'number',
      label: intl
        .get(
          'ssta.reconciliationWorkbenchSup.model.reconciliationWorkbenchSup.taxIncludedAmountMeaning'
        )
        .d('含税总金额'),
      computedProps: { formatterOptions: amountFormatterOptions },
    },
    {
      name: 'billStatusMeaning',
      type: 'string',
      label: intl
        .get('ssta.reconciliationWorkbenchSup.model.reconciliationWorkbenchSup.billStatus')
        .d('对账单状态'), // lovCode = "SSTA.BILL_STATUS"
    },
    {
      name: 'creationDate',
      type: 'dateTime',
      format: 'YYYY-MM-DD HH:mm:ss',
      label: intl
        .get('ssta.reconciliationWorkbenchSup.model.reconciliationWorkbenchSup.creationDate')
        .d('创建日期'),
    },
    {
      name: 'createdUserName',
      type: 'string',
      label: intl
        .get('ssta.reconciliationWorkbenchSup.model.reconciliationWorkbenchSup.createdUserName')
        .d('创建人'),
    },
    {
      name: 'campMeaning',
      type: 'string',
      label: intl
        .get('ssta.reconciliationWorkbenchSup.model.reconciliationWorkbenchSup.campMeaning')
        .d('创建方阵营'), // lovCode = "SSTA.CAMP"
    },
    {
      name: 'invOrganizationName',
      type: 'string',
      label: intl
        .get('ssta.reconciliationWorkbenchSup.model.reconciliationWorkbenchSup.invOrganizationId')
        .d('库存组织'),
    },
    {
      name: 'sourceSupplierCompanyName',
      type: 'string',
      label: intl
        .get('ssta.reconciliationWorkbenchSup.model.reconciliationWorkbenchSup.sourceSupplierName')
        .d('数据源平台供应商名称'),
    },
    {
      name: 'sourceSupplierCompanyNum',
      type: 'string',
      label: intl
        .get('ssta.reconciliationWorkbenchSup.model.reconciliationWorkbenchSup.sourceSupplierNum')
        .d('数据源平台供应商编码'),
    },
    {
      type: 'string',
      name: 'confirmCollaborativeMode',
      label: intl
        .get(
          `ssta.reconciliationWorkbenchSup.model.reconciliationWorkbenchSup.confirmCollaborativeModes`
        )
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
        .get('ssta.reconciliationWorkbenchSup.model.reconciliationWorkbenchSup.operation')
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
        url: `/ssta/v1/${organizationId}/bill-headers/supplier`,
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
  // autoQuery: true,
  autoCreate: true,

  fields: [
    // 交易方信息
    {
      name: 'sourceCompanyNum',
      type: 'string',
      label: intl
        .get(
          'ssta.reconciliationWorkbenchSup.model.reconciliationWorkbenchSup.sourceCustomerCompanyNum'
        )
        .d('数据源客户公司编码'),
    },
    {
      name: 'sourceCompanyName',
      type: 'string',
      label: intl
        .get(
          'ssta.reconciliationWorkbenchSup.model.reconciliationWorkbenchSup.sourceCustomerCompanyName'
        )
        .d('数据源客户公司名称'),
    },
    {
      name: 'sourceSupplierCompanyNum',
      type: 'string',
      label: intl
        .get(
          'ssta.reconciliationWorkbenchSup.model.reconciliationWorkbenchSup.sourceSupplierCompanyNum'
        )
        .d('数据源供应商编码'),
    },
    {
      name: 'sourceSupplierCompanyName',
      type: 'string',
      label: intl
        .get(
          'ssta.reconciliationWorkbenchSup.model.reconciliationWorkbenchSup.sourceSupplierCompanyName'
        )
        .d('数据源供应商名称'),
    },
    {
      name: 'companyNum',
      type: 'string',
      label: intl
        .get('ssta.reconciliationWorkbenchSup.model.reconciliationWorkbenchSup.customerCompanyNum')
        .d('结算客户公司编码'),
    },
    {
      name: 'companyName',
      type: 'string',
      label: intl
        .get(
          'ssta.reconciliationWorkbenchSup.model.reconciliationWorkbenchSup.customerCompanyNameBy'
        )
        .d('结算客户公司名称'),
    },
    {
      name: 'supplierCompanyNum',
      type: 'string',
      label: intl
        .get('ssta.reconciliationWorkbenchSup.model.reconciliationWorkbenchSup.supplierCompanyNum')
        .d('结算供应商编码'),
    },
    {
      name: 'supplierCompanyName',
      type: 'string',
      label: intl
        .get(
          'ssta.reconciliationWorkbenchSup.model.reconciliationWorkbenchSup.settlementCompanyName'
        )
        .d('结算供应商名称'),
    },
    {
      name: 'supplierSiteCode',
      type: 'string',
      label: intl
        .get('ssta.reconciliationWorkbenchSup.model.reconciliationWorkbenchSup.SiteCode')
        .d('结算供应商地点'),
    },
    {
      name: 'sourceSupplierSiteCode',
      type: 'string',
      label: intl
        .get(
          'ssta.reconciliationWorkbenchSup.model.reconciliationWorkbenchSup.sourceSupplierSiteCode'
        )
        .d('数据源供应商地点'),
    },
    // 交易金额信息
    {
      name: 'itemCode',
      type: 'string',
      label: intl
        .get('ssta.reconciliationWorkbenchSup.model.reconciliationWorkbenchSup.itemCode')
        .d('结算商品编码'),
    },
    {
      name: 'itemName',
      type: 'string',
      label: intl
        .get('ssta.reconciliationWorkbenchSup.model.reconciliationWorkbenchSup.itemName')
        .d('结算商品名称'),
    },
    {
      name: 'quantity',
      type: 'number',
      label: intl
        .get('ssta.reconciliationWorkbenchSup.model.reconciliationWorkbenchSup.settlementQuantity')
        .d('可结算数量'),
    },
    {
      name: 'unitPriceBatch',
      type: 'number',
      label: intl
        .get('ssta.reconciliationWorkbenchSup.model.reconciliationWorkbenchSup.unitPriceBatch')
        .d('每'),
    },
    {
      name: 'netPriceMeaning',
      label: intl
        .get('ssta.reconciliationWorkbenchSup.model.reconciliationWorkbenchSup.netPriceTaxMeaning')
        .d('不含税单价'),
    },
    {
      name: 'netAmountMeaning',
      label: intl
        .get('ssta.reconciliationWorkbenchSup.model.reconciliationWorkbenchSup.netAmountTaxMeaning')
        .d('不含税金额'),
    },
    {
      name: 'taxIncludedPriceMeaning',
      label: intl
        .get('ssta.reconciliationWorkbenchSup.model.reconciliationWorkbenchSup.netPrice')
        .d('含税单价'),
    },
    {
      name: 'taxIncludedAmountMeaning',
      label: intl
        .get('ssta.reconciliationWorkbenchSup.model.reconciliationWorkbenchSup.taxIncludedPrice')
        .d('含税金额'),
    },
    {
      name: 'taxRate',
      type: 'number',
      label: intl
        .get('ssta.reconciliationWorkbenchSup.model.reconciliationWorkbenchSup.taxRate')
        .d('税率'),
    },
    {
      name: 'taxAmountMeaning',
      label: intl
        .get('ssta.reconciliationWorkbenchSup.model.reconciliationWorkbenchSup.taxAmount')
        .d('税额'),
    },
    {
      name: 'currencyCode',
      type: 'string',
      label: intl
        .get(
          'ssta.reconciliationWorkbenchSup.model.reconciliationWorkbenchSup.settlementCurrencyCode'
        )
        .d('结算币种'),
    },
    {
      name: 'uom',
      type: 'string',
      label: intl
        .get('ssta.reconciliationWorkbenchSup.model.reconciliationWorkbenchSup.uom')
        .d('单位'),
    },
    {
      name: 'specificationsModel',
      type: 'string',
      label: intl
        .get('ssta.reconciliationWorkbenchSup.model.reconciliationWorkbenchSup.specificationsModel')
        .d('规格型号'),
    },
    {
      name: 'srmItemCode',
      type: 'string',
      label: intl
        .get('ssta.reconciliationWorkbenchSup.model.reconciliationWorkbenchSup.srmItemCode')
        .d('srm物料编号'),
    },
    {
      name: 'categoryName',
      type: 'string',
      label: intl
        .get(`ssta.reconciliationWorkbenchSup.model.reconciliationWorkbenchSup.categoryName`)
        .d('物料分类'),
    },
    // 交易事务信息
    {
      name: 'settleNum',
      type: 'string',
      label: intl
        .get('ssta.reconciliationWorkbenchSup.model.reconciliationWorkbenchSup.settleNum')
        .d('结算事务编号'),
    },
    {
      name: 'sourceSettleNum',
      type: 'string',
      label: intl
        .get('ssta.reconciliationWorkbenchSup.model.reconciliationWorkbenchSup.sourceSettleNum')
        .d('结算事务来源编号'),
    },
    {
      name: 'sourceSettleLineNum',
      type: 'string',
      label: intl
        .get('ssta.reconciliationWorkbenchSup.model.reconciliationWorkbenchSup.sourceSettleLineNum')
        .d('结算事务来源行号'),
    },
    {
      name: 'dataSourceMeaning',
      type: 'string',
      label: intl
        .get('ssta.reconciliationWorkbenchSup.model.reconciliationWorkbenchSup.dataSource')
        .d('数据来源'),
    },
    {
      label: intl
        .get(`ssta.reconciliationWorkbenchSup.model.reconciliationWorkbenchSup.trxDate`)
        .d('结算事务日期'),
      type: 'date',
      name: 'trxDate',
    },
    {
      name: 'trxYear',
      type: 'string',
      label: intl
        .get('ssta.reconciliationWorkbenchSup.model.reconciliationWorkbenchSup.trxYear')
        .d('事务年度'),
    },
    {
      name: 'contractAndLineNum',
      type: 'string',
      label: intl
        .get('ssta.reconciliationWorkbenchSup.model.reconciliationWorkbenchSup.contractLineNum')
        .d('协议编号|行号'),
    },
    {
      name: 'poAndLineNum',
      type: 'string',
      label: intl
        .get('ssta.reconciliationWorkbenchSup.model.reconciliationWorkbenchSup.poLineNum')
        .d('采购订单编号|行号'),
    },
    {
      name: 'asnAndLineNum',
      type: 'string',
      label: intl
        .get('ssta.reconciliationWorkbenchSup.model.reconciliationWorkbenchSup.asnLineNum')
        .d('送货单号|行号'),
    },
    {
      name: 'poLineLocation',
      type: 'string',
      label: intl
        .get('ssta.reconciliationWorkbenchSup.model.reconciliationWorkbenchSup.poLineLocation')
        .d('发运行'),
    },
    {
      name: 'releaseNum',
      type: 'string',
      label: intl
        .get('ssta.reconciliationWorkbenchSup.model.reconciliationWorkbenchSup.releaseNum')
        .d('发放号'),
    },
    {
      name: 'orderType',
      type: 'string',
      label: intl
        .get('ssta.reconciliationWorkbenchSup.model.reconciliationWorkbenchSup.orderType')
        .d('订单类型'),
    },
    {
      name: 'purOrganizationName',
      type: 'string',
      label: intl
        .get('ssta.reconciliationWorkbenchSup.model.reconciliationWorkbenchSup.purOrganizationId')
        .d('采购组织'),
    },
    {
      name: 'invOrganizationName',
      type: 'string',
      label: intl
        .get('ssta.reconciliationWorkbenchSup.model.reconciliationWorkbenchSup.invOrganizationId')
        .d('库存组织'),
    },
    {
      name: 'inventoryName',
      type: 'string',
      label: intl
        .get('ssta.reconciliationWorkbenchSup.model.reconciliationWorkbenchSup.inventoryName')
        .d('库房'),
    },
    {
      name: 'trxTypeCode',
      type: 'string',
      label: intl
        .get('ssta.reconciliationWorkbenchSup.model.reconciliationWorkbenchSup.trxTypeCode')
        .d('事务类型编码'),
    },
    {
      name: 'trxTypeCodeMeaning',
      type: 'string',
      label: intl
        .get('ssta.reconciliationWorkbenchSup.model.reconciliationWorkbenchSup.trxTypeName')
        .d('事务类型名称'),
    },
    {
      name: 'createdByName',
      type: 'string',
      label: intl
        .get('ssta.reconciliationWorkbenchSup.model.reconciliationWorkbenchSup.createdUserName')
        .d('创建人'),
    },
    {
      name: 'purchaseAgentName',
      type: 'string',
      label: intl
        .get('ssta.reconciliationWorkbenchSup.model.reconciliationWorkbenchSup.purchaseAgentName')
        .d('采购员'),
    },
    {
      name: 'sourceParentSettleLineNum',
      type: 'string',
      label: intl
        .get(
          'ssta.reconciliationWorkbenchSup.model.reconciliationWorkbenchSup.sourceParentSettleLineNum'
        )
        .d('父事务处理编号|行号'),
    },
    {
      name: 'freightFlag',
      type: 'boolean',
      defaultValue: 0,
      label: intl
        .get('ssta.reconciliationWorkbenchSup.model.reconciliationWorkbenchSup.freightFlag')
        .d('运费标识'),
    },
    {
      name: 'ecPoNum',
      type: 'string',
      label: intl
        .get('ssta.reconciliationWorkbenchSup.model.reconciliationWorkbenchSup.ecPoNum')
        .d('电商订单编号'),
    },
    {
      name: 'ecPoSubNum',
      type: 'string',
      label: intl
        .get('ssta.reconciliationWorkbenchSup.model.reconciliationWorkbenchSup.ecPoSubNum')
        .d('电商子订单编号'),
    },
    {
      name: 'deliverTime',
      type: 'dateTime',
      label: intl
        .get('ssta.reconciliationWorkbenchSup.model.reconciliationWorkbenchSup.deliverTime')
        .d('妥投时间'),
    },
    {
      name: 'deliverQuantity',
      type: 'number',
      label: intl
        .get('ssta.reconciliationWorkbenchSup.model.reconciliationWorkbenchSup.deliverQuantity')
        .d('妥投数量'),
    },
    {
      label: intl
        .get(`ssta.reconciliationWorkbenchSup.model.reconciliationWorkbenchSup.ecDeliverQuantity`)
        .d('配送数量'),
      type: 'number',
      name: 'ecDeliverQuantity',
    },
    {
      name: 'invoiceMethodMeaning',
      type: 'string',
      label: intl
        .get('ssta.reconciliationWorkbenchSup.model.reconciliationWorkbenchSup.invoiceMethod')
        .d('开票方式'),
    },
    {
      name: 'elecInvoiceView',
      type: 'string',
      label: intl
        .get('ssta.reconciliationWorkbenchSup.model.reconciliationWorkbenchSup.elecInvoiceView')
        .d('查看电子发票'),
    },
    {
      name: 'afterSalesStatusMeaning',
      type: 'string',
      label: intl
        .get(
          'ssta.reconciliationWorkbenchSup.model.reconciliationWorkbenchSup.afterSalesStatusMeaning'
        )
        .d('电商售后状态'),
    },
    {
      name: 'invoiceTypeMeaning',
      type: 'string',
      label: intl
        .get('ssta.reconciliationWorkbenchSup.model.reconciliationWorkbenchSup.invoiceTypeMeaning')
        .d('电商开票类型'),
    },
    {
      name: 'costName',
      type: 'string',
      label: intl
        .get('ssta.reconciliationWorkbenchSup.model.reconciliationWorkbenchSup.costName')
        .d('成本中心'),
    },
    {
      name: 'termCode',
      type: 'string',
      label: intl
        .get('ssta.reconciliationWorkbenchSup.model.reconciliationWorkbenchSup.collectionCode')
        .d('收款条件'),
    },
    {
      name: 'invOrganizationName',
      type: 'string',
      label: intl
        .get('ssta.reconciliationWorkbenchSup.model.reconciliationWorkbenchSup.invOrganizationName')
        .d('库存组织'),
    },
    {
      name: 'sinvLineAttachmentUuid',
      type: 'attachment',
      label: intl
        .get(`ssta.reconciliationWorkbenchSup.model.reconciliationWorkbenchSup.settleAttach`)
        .d('结算事务行附件'),
      bucketName: window.$$env.PRIVATE_BUCKET || 'private-bucket',
    },
    {
      name: 'multiDealTrxNum',
      type: 'string',
      label: intl
        .get('ssta.reconciliationWorkbenchSup.model.reconciliationWorkbenchSup.multiDealTrxNum')
        .d('三方交易关联事务来源编号'),
    },
    {
      name: 'multiDealTrxLineNum',
      type: 'string',
      label: intl
        .get('ssta.reconciliationWorkbenchSup.model.reconciliationWorkbenchSup.multiDealTrxLineNum')
        .d('三方交易关联事务来源行'),
    },
    {
      name: 'multiDealPoNum',
      type: 'string',
      label: intl
        .get('ssta.reconciliationWorkbenchSup.model.reconciliationWorkbenchSup.multiDealPoNum')
        .d('三方交易关联订单编号'),
    },
    {
      name: 'multiDealPoLineNum',
      type: 'string',
      label: intl
        .get('ssta.reconciliationWorkbenchSup.model.reconciliationWorkbenchSup.multiDealPoLineNum')
        .d('三方交易关联订单行号'),
    },
    {
      label: intl
        .get(`ssta.reconciliationWorkbenchSup.model.reconciliationWorkbenchSup.pcSubjectLineNum`)
        .d('协议标的行号'),
      type: 'string',
      name: 'pcSubjectLineNum',
    },
    {
      name: 'poClosedFlagMeaning',
      type: 'string',
      label: intl
        .get('ssta.reconciliationWorkbenchSup.model.reconciliationWorkbenchSup.poClosedFlag')
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
        .get(
          'ssta.reconciliationWorkbenchSup.model.reconciliationWorkbenchSup.billOccupiedQuantity'
        )
        .d('对账占用数量'),
    },
    {
      name: 'billOccupiedNetAmountMeaning',
      label: intl
        .get(
          'ssta.reconciliationWorkbenchSup.model.reconciliationWorkbenchSup.billOccupiedNetAmount'
        )
        .d('对账占用不含税金额'),
    },
    {
      name: 'billOccupiedTaxAmountMeaning',
      label: intl
        .get(
          'ssta.reconciliationWorkbenchSup.model.reconciliationWorkbenchSup.billOccupiedTaxAmount'
        )
        .d('对账占用税额'),
    },
    {
      name: 'billOccupiedAmountMeaning',
      label: intl
        .get(
          'ssta.reconciliationWorkbenchSup.model.reconciliationWorkbenchSup.billOccupiedAmountMeaning'
        )
        .d('对账占用含税金额'),
    },
    {
      name: 'billCompletedQuantity',
      type: 'number',
      label: intl
        .get(
          'ssta.reconciliationWorkbenchSup.model.reconciliationWorkbenchSup.billCompletedQuantity'
        )
        .d('对账完成数量'),
    },
    {
      name: 'billCompletedNetAmountMeaning',
      label: intl
        .get(
          'ssta.reconciliationWorkbenchSup.model.reconciliationWorkbenchSup.billCompletedNetAmount'
        )
        .d('对账完成不含税金额'),
    },
    {
      name: 'billCompletedTaxAmountMeaning',
      label: intl
        .get(
          'ssta.reconciliationWorkbenchSup.model.reconciliationWorkbenchSup.billCompletedTaxAmount'
        )
        .d('对账完成税额'),
    },
    {
      name: 'billCompletedAmountMeaning',
      label: intl
        .get(
          'ssta.reconciliationWorkbenchSup.model.reconciliationWorkbenchSup.billCompletedAmountMeaning'
        )
        .d('对账完成含税金额'),
    },
    {
      name: 'billRemoveFlag',
      type: 'boolean',
      defaultValue: 0,
      label: intl
        .get('ssta.reconciliationWorkbenchSup.model.reconciliationWorkbenchSup.billRemoveFlag')
        .d('对账暂挂'),
    },
    {
      name: 'billLockQuantity',
      type: 'string',
      label: intl
        .get('ssta.reconciliationWorkbenchSup.model.reconciliationWorkbenchSup.billLockQuantity')
        .d('对账锁定标记'),
    },
    //  开票信息
    {
      name: 'invoiceOccupiedQuantity',
      type: 'number',
      label: intl
        .get(
          'ssta.reconciliationWorkbenchSup.model.reconciliationWorkbenchSup.invoiceOccupiedQuantity'
        )
        .d('开票占用数量'),
    },
    {
      name: 'invoiceOccupiedNetAmountMeaning',
      label: intl
        .get(
          'ssta.reconciliationWorkbenchSup.model.reconciliationWorkbenchSup.invoiceOccupiedNetAmount'
        )
        .d('开票占用不含税金额'),
    },
    {
      name: 'invoiceOccupiedTaxAmountMeaning',
      label: intl
        .get(
          'ssta.reconciliationWorkbenchSup.model.reconciliationWorkbenchSup.invoiceOccupiedTaxAmount'
        )
        .d('开票占用税额'),
    },
    {
      name: 'invoiceOccupiedAmountMeaning',
      label: intl
        .get(
          'ssta.reconciliationWorkbenchSup.model.reconciliationWorkbenchSup.invoiceOccupiedAmount'
        )
        .d('开票占用含税金额'),
    },
    {
      name: 'invoiceCompletedQuantity',
      type: 'number',
      label: intl
        .get(
          'ssta.reconciliationWorkbenchSup.model.reconciliationWorkbenchSup.invoiceCompletedQuantity'
        )
        .d('开票完成数量'),
    },
    {
      name: 'invoiceCompletedNetAmountMeaning',
      label: intl
        .get(
          'ssta.reconciliationWorkbenchSup.model.reconciliationWorkbenchSup.invoiceCompletedNetAmountMeaning'
        )
        .d('开票完成不含税金额'),
    },
    {
      name: 'invoiceCompletedTaxAmountMeaning',
      label: intl
        .get(
          'ssta.reconciliationWorkbenchSup.model.reconciliationWorkbenchSup.invoiceCompletedTaxAmountMeaning'
        )
        .d('开票完成税额'),
    },
    {
      name: 'invoiceCompletedAmountMeaning',
      label: intl
        .get(
          'ssta.reconciliationWorkbenchSup.model.reconciliationWorkbenchSup.invoiceCompletedAmount'
        )
        .d('开票完成含税金额'),
    },
    {
      name: 'invoiceRemoveFlag',
      type: 'boolean',
      defaultValue: 0,
      label: intl
        .get('ssta.reconciliationWorkbenchSup.model.reconciliationWorkbenchSup.invoiceRemoveFlag')
        .d('开票暂挂'),
    },
    {
      label: intl
        .get(`ssta.reconciliationWorkbenchSup.model.reconciliationWorkbenchSup.invoiceLockQuantity`)
        .d('开票锁定标记'),
      type: 'string',
      name: 'invoiceLockQuantity',
    },
    // 收款信息
    {
      name: 'paymentOccupiedAmountMeaning',
      label: intl
        .get(
          'ssta.reconciliationWorkbenchSup.model.reconciliationWorkbenchSup.collectionOccupiedAmount'
        )
        .d('收款占用金额'),
    },
    {
      name: 'paymentCompletedAmountMeaning',
      label: intl
        .get(
          'ssta.reconciliationWorkbenchSup.model.reconciliationWorkbenchSup.collectionCompletedAmount'
        )
        .d('收款完成金额'),
    },
    {
      name: 'paymentRemoveFlag',
      type: 'boolean',
      defaultValue: 0,
      label: intl
        .get(
          'ssta.reconciliationWorkbenchSup.model.reconciliationWorkbenchSup.collectionRemoveFlag'
        )
        .d('收款暂挂'),
    },
    {
      name: 'paymentLockQuantity',
      type: 'string',
      label: intl
        .get(
          'ssta.reconciliationWorkbenchSup.model.reconciliationWorkbenchSup.collectionLockQuantity'
        )
        .d('收款锁定标记'),
    },
    // 结算数据规则
    {
      name: 'settleConfigNum',
      type: 'string',
      label: intl
        .get('ssta.reconciliationWorkbenchSup.model.reconciliationWorkbenchSup.settlementMethodNum')
        .d('结算策略编号'),
    },
    {
      name: 'settleConfigName',
      type: 'string',
      label: intl
        .get(
          'ssta.reconciliationWorkbenchSup.model.reconciliationWorkbenchSup.settlementMethodsName'
        )
        .d('结算策略名称'),
    },
    {
      name: 'versionNumber',
      type: 'string',
      label: intl
        .get(
          'ssta.reconciliationWorkbenchSup.model.reconciliationWorkbenchSup.settleConfigVersionNumber'
        )
        .d('版本号'),
    },
    {
      name: 'settleBasePriceMeaning',
      type: 'string',
      label: intl
        .get(
          'ssta.reconciliationWorkbenchSup.model.reconciliationWorkbenchSup.settleBasePriceMeaning'
        )
        .d('结算基准价'),
    },
    {
      name: 'settleModeMeaning',
      type: 'string',
      label: intl
        .get('ssta.reconciliationWorkbenchSup.model.reconciliationWorkbenchSup.settleModeMeaning')
        .d('结算模式'),
    },
    {
      name: 'settleMatchDimensionMeaning',
      type: 'string',
      label: intl
        .get(
          'ssta.reconciliationWorkbenchSup.model.reconciliationWorkbenchSup.settleMatchDimensionMeaning'
        )
        .d('结算匹配维度'),
    },
    // 对账单规则
    {
      name: 'billCompanyMeaning',
      type: 'string',
      label: intl
        .get('ssta.reconciliationWorkbenchSup.model.reconciliationWorkbenchSup.billCompanyMeaning')
        .d('对账公司'),
    },
    {
      name: 'billSupplierMeaning',
      type: 'string',
      label: intl
        .get('ssta.reconciliationWorkbenchSup.model.reconciliationWorkbenchSup.billSupplierMeaning')
        .d('对账供应商'),
    },
    {
      name: 'partMatchFlag',
      type: 'boolean',
      defaultValue: 0,
      label: intl
        .get('ssta.reconciliationWorkbenchSup.model.reconciliationWorkbenchSup.partMatchFlag')
        .d('部分匹配'),
    },
    {
      name: 'priceUpdFlag',
      type: 'boolean',
      defaultValue: 0,
      label: intl
        .get('ssta.reconciliationWorkbenchSup.model.reconciliationWorkbenchSup.priceUpdFlag')
        .d('单价调整'),
    },
    {
      name: 'dependencyFlag',
      type: 'boolean',
      defaultValue: 0,
      label: intl
        .get('ssta.reconciliationWorkbenchSup.model.reconciliationWorkbenchSup.dependencyFlag')
        .d('是否依赖'),
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
        queryParameter: { settleConfigNum, type, settleConfigId },
      } = dataSet;
      const url =
        type === 'F'
          ? `/ssta/v1/${organizationId}/settle-config/release-config/${settleConfigNum}`
          : `/ssta/v1/${organizationId}/settle-config/current-config-by-id/${settleConfigId}`;
      return {
        url,
        method: 'get',
        data: {},
        params: { customizeUnitCode: customizeUnitCodeSupplier },
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
        name: 'lineNum',
        type: 'string',
        label: intl.get(`${prefix}.lineNum`).d('对账单行号'),
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
        label: intl.get(`${prefix}.companyName`).d('对账客户公司'),
      },
      {
        name: 'supplierCompanyName',
        type: 'string',
        label: intl.get(`${prefix}.supplierCompanyName`).d('对账供应商公司'),
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
        type: 'dateTime',
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
          'SSTA.SUPPLIER_BILL_LIST.GRID_DETAIL,SSTA.SUPPLIER_BILL_LIST.SEARCH_BAR_DETAIL';

        return {
          url: `/ssta/v1/${organizationId}/bill-lines/supplier?customizeUnitCode=${customizeUnitCode}`,
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
