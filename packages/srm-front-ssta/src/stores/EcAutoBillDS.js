import { getCurrentOrganizationId, filterNullValueObject } from 'utils/utils';
import intl from 'utils/intl';
import { transformSupplierData } from '@/utils/utils';

const prefix = 'ssta.ecAutoBill.model.ecAutoBill';
const tenantId = getCurrentOrganizationId();

const tableDS = () => ({
  autoQuery: true,
  selection: 'multiple',
  cacheSelection: true,
  primaryKey: 'autoBillId',
  pageSize: 20,
  queryFields: [],
  fields: [
    {
      name: 'autoBillNum',
      type: 'string',
      label: intl.get(`${prefix}.autoBillNum`).d('对账记录编号'),
    },
    {
      name: 'ecBillNum',
      type: 'string',
      label: intl.get(`${prefix}.ecBillNum`).d('电商账单编号'),
    },
    {
      name: 'companyName',
      type: 'string',
      label: intl.get(`${prefix}.company`).d('公司'),
    },
    {
      name: 'supplierCompanyName',
      type: 'string',
      label: intl.get(`${prefix}.supplierCompany`).d('供应商'),
    },
    {
      name: 'currencyCode',
      type: 'string',
      label: intl.get(`${prefix}.currencyCode`).d('币种'),
    },
    {
      name: 'billStatusMeaning',
      type: 'string',
      label: intl.get(`${prefix}.billStatus`).d('对账状态'),
    },
    {
      name: 'action',
      type: 'string',
      label: intl.get(`${prefix}.action`).d('操作'),
    },
    {
      name: 'ecBillDimension',
      type: 'string',
      lookupCode: 'SSTA.EC_BILL_DIMENSION',
      label: intl.get(`${prefix}.ecBillDimension`).d('对账维度'),
    },
  ],
  transport: {
    /**
     * 查询
     */
    read: ({ params, data }) => {
      const url = `/ssta/v1/${tenantId}/auto-bills`;
      return {
        url,
        method: 'GET',
        params: filterNullValueObject({
          ...params,
          // ...data,
          customizeUnitCode: 'SSTA.ECAUTO_BILL_LIST.SEARCH_BAR,SSTA.ECAUTO_BILL_LIST.GRID',
        }),
        data: filterNullValueObject({ ...data, ...transformSupplierData(data.supplierCompanyId) }),
      };
    },
  },
});

const headerDS = () => ({
  selection: false,
  autoCreate: true,
  queryFields: [],
  fields: [
    {
      name: 'autoBillNum',
      type: 'string',
      label: intl.get(`${prefix}.autoBillNum`).d('对账记录编号'),
    },
    {
      name: 'companyLov',
      type: 'object',
      label: intl.get(`${prefix}.billCompanyName`).d('对账公司名称'),
      noCache: true,
      ignore: 'always',
      lovCode: 'SPFM.USER_AUTHORITY_COMPANY',
      lovPara: { tenantId },
      textField: 'companyName',
      required: true,
    },
    {
      name: 'companyNum',
      type: 'string',
      label: intl.get(`${prefix}.billCompanyNum`).d('对账公司编码'),
      bind: 'companyLov.companyNum',
    },
    {
      name: 'companyName',
      type: 'string',
      bind: 'companyLov.companyName',
    },
    {
      name: 'companyId',
      type: 'string',
      bind: 'companyLov.companyId',
    },
    {
      name: 'supplierCompanyLov',
      type: 'object',
      label: intl.get(`${prefix}.billSupplierCompanyName`).d('对账供应商名称'),
      noCache: true,
      ignore: 'always',
      lovCode: 'SSTA.USER_AUTH.EXT_SUPPLIER',
      lovPara: { tenantId },
      textField: 'displaySupplierName',
      required: true,
    },
    {
      name: 'supplierCompanyNum',
      type: 'string',
      label: intl.get(`${prefix}.billSupplierCompanyNum`).d('对账供应商编码'),
      bind: 'supplierCompanyLov.supplierCompanyNum',
    },
    {
      name: 'supplierCompanyName',
      type: 'string',
      bind: 'supplierCompanyLov.supplierCompanyName',
    },
    {
      name: 'supplierCompanyId',
      type: 'string',
      bind: 'supplierCompanyLov.supplierCompanyId',
    },
    {
      name: 'supplierTenantId',
      type: 'string',
      bind: 'supplierCompanyLov.supplierTenantId',
    },
    {
      name: 'supplierId',
      bind: 'supplierCompanyLov.supplierId',
    },
    {
      name: 'supplierNum',
      bind: 'supplierCompanyLov.supplierNum',
    },

    {
      name: 'currencyCode',
      type: 'object',
      label: intl.get(`${prefix}.currencyCode`).d('币种'),
      noCache: true,
      textField: 'currencyCode',
      lovCode: 'SMDM.LEDGER.CURRENCY',
      required: true,
      transformRequest: (value) => value && value.currencyCode,
    },
    {
      name: 'ecBillLov',
      type: 'object',
      label: intl.get(`${prefix}.ecBillNum`).d('电商账单编号'),
      lovCode: 'SSTA.EC_BILL_NUM',
      lovPara: { tenantId },
      cascadeMap: {
        companyId: 'companyId',
        supplierCompanyId: 'supplierCompanyId',
        currencyCode: 'currencyCode.currencyCode',
      },
      required: true,
      transformRequest: (value) => value && value.ecBillNum,
    },
    {
      name: 'ecBillNum',
      type: 'string',
      bind: 'ecBillLov.ecBillNum',
    },
    {
      name: 'ecBillHeaderId',
      type: 'string',
      bind: 'ecBillLov.ecBillHeaderId',
    },
    {
      name: 'billStatusMeaning',
      type: 'string',
      label: intl.get(`${prefix}.billStatus`).d('对账状态'),
    },
    {
      name: 'billStatus',
      type: 'string',
      lookupCode: 'SSTA.AUTO_BILL_STATUS',
      label: intl.get(`${prefix}.billStatus`).d('对账状态'),
    },
    {
      name: 'ecBillDimension',
      type: 'string',
      lookupCode: 'SSTA.EC_BILL_DIMENSION',
      label: intl.get(`${prefix}.ecBillDimension`).d('对账维度'),
    },
    {
      name: 'billingDate',
      type: 'date',
      label: intl.get(`${prefix}.billingDate`).d('出账日期'),
    },
    {
      name: 'finalPayDate',
      type: 'date',
      label: intl.get(`${prefix}.finalPayDate`).d('最后支付日期'),
    },
  ],
  transport: {
    /**
     * 查询
     */
    read: ({ dataSet }) => {
      const {
        queryParameter: { autoBillId },
      } = dataSet;
      const url = `/ssta/v1/${tenantId}/auto-bills/${autoBillId}`;
      return {
        url,
        method: 'GET',
        params: {},
        data: {},
      };
    },
  },
});

const lineDS = () => ({
  pageSize: 20,
  selection: false,
  queryParameter: {
    customizeUnitCode: [
      'SSTA.ECAUTO_BILL_DETAIL.EC',
      'SSTA.ECAUTO_BILL_DETAIL.OPTION',
      'SSTA.ECAUTO_BILL_DETAIL.PRICE',
      'SSTA.ECAUTO_BILL_DETAIL.FILTER',
    ].join(),
  },
  fields: [
    {
      name: 'ecPoSubNum',
      type: 'string',
      label: intl.get(`${prefix}.ecPoSubNum`).d('电商子订单编号'),
    },
    {
      name: 'asnNum',
      type: 'string',
      label: intl.get(`${prefix}.asnNum`).d('电商送货单编号'),
    },
    {
      name: 'asnLineNum',
      type: 'string',
      label: intl.get(`${prefix}.asnLineNum`).d('电商送货单行号'),
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
      name: 'afterSalesStatusMeaning',
      type: 'string',
      label: intl.get(`${prefix}.afterSalesStatus`).d('售后状态'),
    },
    {
      name: 'billStatus',
      type: 'string',
      label: intl.get(`${prefix}.billStatus`).d('对账状态'),
      lookupCode: 'SSTA.EC_BILL_LINE_STATUS',
      required: true,
    },
    {
      name: 'billRemark',
      type: 'string',
      label: intl.get(`${prefix}.billRemark`).d('对账意见'),
      required: true,
    },
    {
      name: 'billResultMeaning',
      type: 'string',
      label: intl.get(`${prefix}.billResult`).d('自动核对结果'),
    },
    {
      name: 'settleTaxIncludedPrice',
      type: 'number',
      label: intl.get(`${prefix}.settleTaxIncludedPrice`).d('含税单价'),
    },
    {
      name: 'sumQuantity',
      type: 'number',
      label: intl.get(`${prefix}.sumQuantity`).d('数量'),
    },
    {
      name: 'srmTaxRate',
      type: 'number',
      label: intl.get(`${prefix}.srmTaxRate`).d('税率'),
    },
    {
      name: 'sumTaxIncludedAmount',
      type: 'number',
      label: intl.get(`${prefix}.sumTaxIncludedAmount`).d('含税金额'),
    },
    {
      name: 'sumNetAmount',
      type: 'number',
      label: intl.get(`${prefix}.sumNetAmount`).d('不含税金额'),
    },
    {
      name: 'sumTaxAmount',
      type: 'number',
      label: intl.get(`${prefix}.sumTaxAmount`).d('税额'),
    },
    {
      name: 'settleDetail',
      type: 'string',
      label: intl.get(`${prefix}.settleDetail`).d('结算详情信息'),
    },
    {
      name: 'taxIncludedPrice',
      type: 'number',
      label: intl.get(`${prefix}.taxIncludedPrice`).d('电商含税单价'),
    },
    {
      name: 'quantity',
      type: 'number',
      label: intl.get(`${prefix}.quantity`).d('电商数量'),
    },
    {
      name: 'taxRate',
      type: 'number',
      label: intl.get(`${prefix}.taxRate`).d('电商税率'),
    },
    {
      name: 'taxIncludedAmount',
      type: 'number',
      label: intl.get(`${prefix}.ecSubPoAmount`).d('电商子订单金额'),
    },
    {
      name: 'netAmount',
      type: 'number',
      label: intl.get(`${prefix}.netAmount`).d('电商不含税金额'),
    },
    {
      name: 'companyName',
      type: 'string',
      label: intl.get(`${prefix}.company`).d('公司'),
    },
    {
      name: 'supplierCompanyName',
      type: 'string',
      label: intl.get(`${prefix}.supplierCompany`).d('供应商'),
    },
    {
      name: 'requestedByRealName',
      type: 'string',
      label: intl.get(`${prefix}.buyerName`).d('下单人'),
    },
  ],
  transport: {
    /**
     * 查询
     */
    read: () => {
      const url = `/ssta/v1/${tenantId}/auto-bills/ec-bill`;
      return {
        url,
        method: 'GET',
      };
    },
  },
});

/**
 * 对账平台查看结算单行数据源
 *
 * @return {import('choerodon-ui/dataset/data-set/DataSet').DataSetProps}
 */
const settleLineDS = (record) => ({
  pageSize: 20,
  autoQuery: true,
  selection: false,
  fields: [
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
      name: 'souceSettleAndLineNum',
      type: 'string',
      label: intl.get(`${prefix}.souceSettleAndLineNum`).d('结算事务来源编号|行号'),
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
      name: 'quantity',
      type: 'number',
      label: intl.get(`${prefix}.shouldSettlementNum`).d('可结算数量'),
    },
    {
      name: 'netPriceMeaning',
      type: 'number',
      label: intl.get(`${prefix}.netPrice`).d('本次对账不含税单价'),
    },
    {
      name: 'unitPriceBatch',
      type: 'number',
      label: intl.get(`${prefix}.unitPriceBatch`).d('每'),
    },
    {
      name: 'netAmountMeaning',
      type: 'number',
      label: intl.get(`${prefix}.netAmountMeaning`).d('不含税金额'),
    },
    {
      name: 'taxRate',
      type: 'number',
      label: intl.get(`${prefix}.srmTaxRate`).d('税率'),
    },
    {
      name: 'taxAmount',
      type: 'number',
      label: intl.get(`${prefix}.taxAmount`).d('税额'),
    },
    {
      name: 'taxIncludedPriceMeaning',
      type: 'number',
      label: intl.get(`${prefix}.settleTaxIncludedPrice`).d('含税单价'),
    },
    {
      name: 'taxIncludedAmountMeaning',
      type: 'number',
      label: intl.get(`${prefix}.sumTaxIncludedAmount`).d('含税金额'),
    },
    {
      name: 'settleMatchDimensionMeaning',
      type: 'string',
      label: intl.get(`${prefix}.settleMatchDimension`).d('结算匹配维度'), //  SSTA.MATCH_DIMENSION
    },
    {
      name: 'settleBasePriceMeaning',
      type: 'string',
      label: intl.get(`${prefix}.settleBasePrice`).d('结算基准价'), // SSTA.BASE_PRICE
    },
    {
      name: 'enableQuantity',
      type: 'number',
      label: intl.get(`${prefix}.enableQuantity`).d('可对账数量'),
    },
    {
      name: 'orignPriceMeaning',
      type: 'number',
      label: intl.get(`${prefix}.orignPrice`).d('原对账单价'),
      computedProps: {
        bind: ({ record }) =>
          record.get('settleBasePrice') === 'NET_PRICE'
            ? 'netPriceMeaning'
            : 'taxIncludedPriceMeaning',
      },
    },
    {
      name: 'enableAmountMeaning',
      type: 'number',
      label: intl.get(`${prefix}.enableAmount`).d('可对账金额'),
      computedProps: {
        bind: ({ record }) =>
          record.get('settleBasePrice') === 'NET_PRICE'
            ? 'netAmountMeaning'
            : 'taxIncludedAmountMeaning',
      },
    },
    {
      name: 'poNum',
      type: 'string',
      label: intl.get(`${prefix}.poNum`).d('srm采购订单编号'),
    },
    {
      name: 'projectNum',
      type: 'string',
      label: intl.get(`${prefix}.projectNum`).d('项目编号'),
    },
    {
      name: 'chargeTypeMeaning',
      type: 'string',
      label: intl.get(`${prefix}.chargeTypeMeaning`).d('费用类型'),
    },
    {
      name: 'prRequestedName',
      type: 'string',
      label: intl.get(`${prefix}.prRequestedName`).d('申请人'),
    },
    {
      name: 'unitName',
      type: 'string',
      label: intl.get(`${prefix}.unitName`).d('部门'),
    },
    {
      name: 'operation',
      type: 'string',
      label: intl.get(`${prefix}.operation`).d('操作'),
    },
  ],
  queryParameter: {
    ...(record?.get(['asnNum', 'asnLineNum']) || {}),
    autoIssueCode: 'EC_BILL',
  },
  transport: {
    read: () => {
      // const customizeUnitCode = 'SSTA.ECAUTO_BILL_DETAIL.SETTLEMENTINFORMATION';
      return {
        url: `/ssta/v1/${tenantId}/settles/purchaser/ec-bill-able`,
        method: 'GET',
      };
    },
  },
});

const settleDetailDS = () => ({
  // autoQuery: true,
  autoCreate: true,
  fields: [
    // 交易方信息
    {
      name: 'sourceCompanyNum',
      type: 'string',
      label: intl.get(`${prefix}.sourceCompanyNum`).d('数据源公司编码'),
    },
    {
      name: 'sourceCompanyName',
      type: 'string',
      label: intl.get(`${prefix}.sourceCompanyName`).d('数据源公司名称'),
    },
    {
      name: 'sourceSupplierCompanyNum',
      type: 'string',
      label: intl.get(`${prefix}.sourceSupplierCompanyNum`).d('数据源供应商编码'),
    },
    {
      name: 'sourceSupplierCompanyName',
      type: 'string',
      label: intl.get(`${prefix}.sourceSupplierCompanyName`).d('数据源供应商名称'),
    },
    {
      name: 'companyNum',
      type: 'string',
      label: intl.get(`${prefix}.settleCompanyNum`).d('结算公司编码'),
    },
    {
      name: 'companyName',
      type: 'string',
      label: intl.get(`${prefix}.settleCompanyName`).d('结算公司名称'),
    },
    {
      name: 'supplierCompanyNum',
      type: 'string',
      label: intl.get(`${prefix}.settleSupplierCompanyNum`).d('结算供应商编码'),
    },
    {
      name: 'supplierCompanyName',
      type: 'string',
      label: intl.get(`${prefix}.settleSupplierCompanyName`).d('结算供应商名称'),
    },
    // 交易金额信息
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
      name: 'quantity',
      type: 'number',
      label: intl.get(`${prefix}.sumQuantity`).d('数量'),
    },
    {
      name: 'unitPriceBatch',
      type: 'number',
      label: intl.get(`${prefix}.unitPriceBatch`).d('每'),
    },
    {
      name: 'netPriceMeaning',
      type: 'string',
      label: intl.get(`${prefix}.netPriceMeaning`).d('不含税单价'),
    },
    {
      name: 'netAmountMeaning',
      type: 'string',
      label: intl.get(`${prefix}.netAmountMeaning`).d('不含税金额'),
    },
    {
      name: 'netPrice',
      type: 'number',
      label: intl.get(`${prefix}.netPrice`).d('本次对账不含税单价'),
    },
    {
      name: 'taxIncludedPrice',
      type: 'number',
      label: intl.get(`${prefix}.settleTaxIncludedPrice`).d('含税单价'),
    },
    {
      name: 'taxRate',
      type: 'number',
      label: intl.get(`${prefix}.srmTaxRate`).d('税率'),
    },
    {
      name: 'taxAmount',
      type: 'number',
      label: intl.get(`${prefix}.taxAmount`).d('税额'),
    },
    {
      name: 'currencyCode',
      type: 'string',
      label: intl.get(`${prefix}.currencyCode`).d('结算币种'),
    },
    {
      name: 'uom',
      type: 'string',
      label: intl.get(`${prefix}.uom`).d('单位'),
    },
    {
      name: 'specificationsModel',
      type: 'string',
      label: intl.get(`${prefix}.specificationsModel`).d('规格型号'),
    },
    {
      name: 'srmItemCode',
      type: 'string',
      label: intl.get(`${prefix}.srmItemCode`).d('srm物料编号'),
    },
    {
      name: 'categoryName',
      type: 'string',
      label: intl.get(`${prefix}.categoryName`).d('物料分类'),
    },
    // 交易事务信息
    {
      name: 'settleNum',
      type: 'string',
      label: intl.get(`${prefix}.settleNum`).d('结算事务编号'),
    },
    {
      name: 'sourceSettleNum',
      type: 'string',
      label: intl.get(`${prefix}.sourceSettleNum`).d('结算事务来源编号'),
    },
    {
      name: 'sourceSettleLineNum',
      type: 'string',
      label: intl.get(`${prefix}.sourceSettleLineNum`).d('结算事务来源行号'),
    },
    {
      name: 'dataSource',
      type: 'string',
      label: intl.get(`${prefix}.dataSource`).d('数据来源'),
    },
    {
      label: intl.get(`${prefix}.trxDate`).d('结算事务日期'),
      type: 'date',
      name: 'trxDate',
    },
    {
      name: 'trxYear',
      type: 'string',
      label: intl.get(`${prefix}.trxYear`).d('事务年度'),
    },
    {
      name: 'contractLineNum',
      type: 'string',
      label: intl.get(`${prefix}.contractLineNum`).d('协议编号|行号'),
    },
    {
      name: 'poLineNum',
      type: 'string',
      label: intl.get(`${prefix}.poLineNum`).d('采购订单编号|行号'),
    },
    {
      name: 'asnLineNum',
      type: 'string',
      label: intl.get(`${prefix}.asnLineNum`).d('送货单号|行号'),
    },
    {
      name: 'poLineLocation',
      type: 'string',
      label: intl.get(`${prefix}.poLineLocation`).d('发运行'),
    },
    {
      name: 'releaseNum',
      type: 'string',
      label: intl.get(`${prefix}.releaseNum`).d('发放号'),
    },
    {
      name: 'orderType',
      type: 'string',
      label: intl.get(`${prefix}.orderType`).d('订单类型'),
    },
    {
      name: 'purOrganizationName',
      type: 'string',
      label: intl.get(`${prefix}.purOrganizationId`).d('采购组织'),
    },
    {
      name: 'invOrganizationName',
      type: 'string',
      label: intl.get(`${prefix}.invOrganizationId`).d('库存组织'),
    },
    {
      name: 'inventoryName',
      type: 'string',
      label: intl.get(`${prefix}.inventoryName`).d('库房'),
    },
    {
      name: 'trxTypeCode',
      type: 'string',
      label: intl.get(`${prefix}.trxTypeCode`).d('事务类型编码'),
    },
    {
      name: 'trxTypeCodeMeaning',
      type: 'string',
      label: intl.get(`${prefix}.trxTypeName`).d('事务类型名称'),
    },
    {
      name: 'createdByName',
      type: 'string',
      label: intl.get(`${prefix}.createdUserName`).d('创建人'),
    },
    {
      name: 'purchaseAgentName',
      type: 'string',
      label: intl.get(`${prefix}.purchaseAgentName`).d('采购员'),
    },
    {
      name: 'sourceParentSettleLineNum',
      type: 'string',
      label: intl.get(`${prefix}.sourceParentSettleLineNum`).d('父事务处理编号|行号'),
    },
    {
      name: 'freightFlag',
      type: 'boolean',
      defaultValue: 0,
      label: intl.get(`${prefix}.freightFlag`).d('运费标识'),
    },
    {
      name: 'ecPoNum',
      type: 'string',
      label: intl.get(`${prefix}.ecPoNum`).d('电商订单编号'),
    },
    {
      name: 'ecPoSubNum',
      type: 'string',
      label: intl.get(`${prefix}.ecPoSubNum`).d('电商子订单编号'),
    },
    {
      name: 'deliverTime',
      type: 'dateTime',
      label: intl.get(`${prefix}.deliverTime`).d('妥投时间'),
    },
    {
      name: 'deliverQuantity',
      type: 'number',
      label: intl.get(`${prefix}.deliverQuantity`).d('妥投数量'),
    },
    {
      name: 'invoiceMethodMeaning',
      type: 'string',
      label: intl.get(`${prefix}.invoiceMethod`).d('开票方式'),
    },
    {
      name: 'elecInvoiceView',
      type: 'string',
      label: intl.get(`${prefix}.elecInvoiceView`).d('查看电子发票'),
    },
    {
      name: 'afterSalesStatusMeaning',
      type: 'string',
      label: intl.get(`${prefix}.afterSalesStatusMeaning`).d('电商售后状态'),
    },
    {
      name: 'invoiceTypeMeaning',
      type: 'string',
      label: intl.get(`${prefix}.invoiceTypeMeaning`).d('电商开票类型'),
    },
    // 对账信息
    {
      name: 'billOccupiedQuantity',
      type: 'number',
      label: intl.get(`${prefix}.billOccupiedQuantity`).d('对账占用数量'),
    },
    {
      name: 'billOccupiedNetAmount',
      type: 'number',
      label: intl.get(`${prefix}.billOccupiedNetAmount`).d('对账占用不含税金额'),
    },
    {
      name: 'billOccupiedTaxAmount',
      type: 'number',
      label: intl.get(`${prefix}.billOccupiedTaxAmount`).d('对账占用税额'),
    },
    {
      name: 'billOccupiedAmountMeaning',
      type: 'string',
      label: intl.get(`${prefix}.billOccupiedAmountMeaning`).d('对账占用含税金额'),
    },
    {
      name: 'billCompletedQuantity',
      type: 'number',
      label: intl.get(`${prefix}.billCompletedQuantity`).d('对账完成数量'),
    },
    {
      name: 'billCompletedNetAmount',
      type: 'number',
      label: intl.get(`${prefix}.billCompletedNetAmount`).d('对账完成不含税金额'),
    },
    {
      name: 'billCompletedTaxAmount',
      type: 'number',
      label: intl.get(`${prefix}.billCompletedTaxAmount`).d('对账完成税额'),
    },
    {
      name: 'billCompletedAmountMeaning',
      type: 'string',
      label: intl.get(`${prefix}.billCompletedAmountMeaning`).d('对账完成含税金额'),
    },
    {
      name: 'billRemoveFlag',
      type: 'boolean',
      defaultValue: 0,
      label: intl.get(`${prefix}.billRemoveFlag`).d('对账暂挂'),
    },
    {
      name: 'billLockQuantity',
      type: 'string',
      label: intl.get(`${prefix}.billLockQuantity`).d('对账锁定标记'),
    },
    //  开票信息
    {
      name: 'invoiceOccupiedQuantity',
      type: 'number',
      label: intl.get(`${prefix}.invoiceOccupiedQuantity`).d('开票占用数量'),
    },
    {
      name: 'invoiceOccupiedNetAmount',
      type: 'number',
      label: intl.get(`${prefix}.invoiceOccupiedNetAmount`).d('开票占用不含税金额'),
    },
    {
      name: 'invoiceOccupiedTaxAmount',
      type: 'number',
      label: intl.get(`${prefix}.invoiceOccupiedTaxAmount`).d('开票占用税额'),
    },
    {
      name: 'invoiceOccupiedAmount',
      type: 'number',
      label: intl.get(`${prefix}.invoiceOccupiedAmount`).d('开票占用含税金额'),
    },
    {
      name: 'invoiceCompletedQuantity',
      type: 'number',
      label: intl.get(`${prefix}.invoiceCompletedQuantity`).d('开票完成数量'),
    },
    {
      name: 'invoiceCompletedNetAmountMeaning',
      type: 'string',
      label: intl.get(`${prefix}.invoiceCompletedNetAmountMeaning`).d('开票完成不含税金额'),
    },
    {
      name: 'invoiceCompletedTaxAmountMeaning',
      type: 'string',
      label: intl.get(`${prefix}.invoiceCompletedTaxAmountMeaning`).d('开票完成税额'),
    },
    {
      name: 'invoiceCompletedAmount',
      type: 'number',
      label: intl.get(`${prefix}.invoiceCompletedAmount`).d('开票完成含税金额'),
    },
    {
      name: 'invoiceRemoveFlag',
      type: 'boolean',
      defaultValue: 0,
      label: intl.get(`${prefix}.invoiceRemoveFlag`).d('开票暂挂'),
    },
    {
      label: intl
        .get(`ssta.reconciliationWorkbenchSup.model.reconciliationWorkbenchSup.invoiceLockQuantity`)
        .d('开票锁定标记'),
      type: 'string',
      name: 'invoiceLockQuantity',
    },
    // 付款信息
    {
      name: 'paymentOccupiedAmount',
      type: 'number',
      label: intl.get(`${prefix}.paymentOccupiedAmount`).d('付款占用金额'),
    },
    {
      name: 'paymentCompletedAmount',
      type: 'number',
      label: intl.get(`${prefix}.paymentCompletedAmount`).d('付款完成金额'),
    },
    {
      name: 'paymentRemoveFlag',
      type: 'boolean',
      defaultValue: 0,
      label: intl.get(`${prefix}.paymentRemoveFlag`).d('付款暂挂'),
    },
    {
      name: 'paymentLockQuantity',
      type: 'string',
      label: intl.get(`${prefix}.paymentLockQuantity`).d('付款锁定标记'),
    },
  ],
});

const strategyDS = () => ({
  autoCreate: true,
  fields: [
    // 结算数据规则
    {
      name: 'settleConfigNum',
      type: 'string',
      label: intl.get(`${prefix}.settleConfigNum`).d('结算策略编号'),
    },
    {
      name: 'settleConfigName',
      type: 'string',
      label: intl.get(`${prefix}.settleConfigName`).d('结算策略名称'),
    },
    {
      name: 'versionNumber',
      type: 'string',
      label: intl.get(`${prefix}.versionNumber`).d('版本号'),
    },
    {
      name: 'settleBasePriceMeaning',
      type: 'string',
      label: intl.get(`${prefix}.settleBasePrice`).d('结算基准价'),
    },
    {
      name: 'settleModeMeaning',
      type: 'string',
      label: intl.get(`${prefix}.settleMode`).d('结算模式'),
    },
    {
      name: 'settleMatchDimensionMeaning',
      type: 'string',
      label: intl.get(`${prefix}.settleMatchDimension`).d('结算匹配维度'),
    },
    // 对账单规则
    {
      name: 'billCompanyMeaning',
      type: 'string',
      label: intl.get(`${prefix}.billCompany`).d('对账公司'),
    },
    {
      name: 'billSupplierMeaning',
      type: 'string',
      label: intl.get(`${prefix}.billSupplierCompany`).d('对账供应商'),
    },
    {
      name: 'partMatchFlag',
      type: 'boolean',
      defaultValue: 0,
      label: intl.get(`${prefix}.partMatchFlag`).d('部分匹配'),
    },
    {
      name: 'priceUpdFlag',
      type: 'boolean',
      defaultValue: 0,
      label: intl.get(`${prefix}.priceUpdFlag`).d('单价调整'),
    },
    {
      name: 'dependencyFlag',
      type: 'boolean',
      defaultValue: 0,
      label: intl.get(`${prefix}.dependencyFlag`).d('是否依赖'),
    },
  ],

  transport: {
    read: ({ dataSet }) => {
      const {
        queryParameter: { settleConfigNum },
      } = dataSet;
      return {
        url: `/ssta/v1/${tenantId}/settle-config/release-config/${settleConfigNum}`,
        method: 'get',
        data: {},
        params: {},
      };
    },
  },
});

const errorRecordDS = () => ({
  autoCreate: false,
  selection: false,
  pageSize: 20,
  fields: [
    {
      name: 'documentNum',
      type: 'string',
      label: intl.get(`ssta.ecAutoBill.model.ecAutoBill.ecBillNum`).d('电商账单编号'),
    },
    {
      name: 'companyName',
      type: 'string',
      label: intl.get(`${prefix}.billCompany`).d('对账公司'),
    },
    {
      name: 'supplierCompanyName',
      type: 'string',
      label: intl.get(`${prefix}.billSupplierCompany`).d('对账供应商'),
    },
    {
      name: 'lastUpdateDate',
      type: 'dateTime',
      label: intl.get(`ssta.ecAutoBill.model.ecAutoBill.pushTime`).d('推送时间'),
    },
    {
      name: 'errorMsg',
      type: 'string',
      label: intl.get(`ssta.ecAutoBill.model.ecAutoBill.pushReason`).d('推送失败原因'),
    },
  ],

  transport: {
    read: ({ data }) => {
      return {
        url: `/ssta/v1/${tenantId}/error-messages/list`,
        method: 'GET',
        data,
      };
    },
  },
});

export { tableDS, headerDS, lineDS, settleLineDS, settleDetailDS, strategyDS, errorRecordDS };
