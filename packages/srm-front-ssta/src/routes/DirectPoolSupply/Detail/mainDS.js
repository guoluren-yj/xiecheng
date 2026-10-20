import { transformQselectDate } from '@/utils/utils';
import intl from 'utils/intl';
import { getCurrentOrganizationId, filterNullValueObject } from 'utils/utils';

// import { getDatas } from '@/utils/utils';

const organizationId = getCurrentOrganizationId();

const prefix = 'ssta.directPoolSupply';
const tableUnitCodes = {
  A: 'SDIM.POOL_SUPPLY.TAB_ALL.GRID',
  B: 'SDIM.POOL_SUPPLY.TAB_INVOICE.GRID',
  C: 'SDIM.POOL_SUPPLY.TAB_INVOICED.GRID',
  D: 'SDIM.POOL_SUPPLY.TAB_TRASH.GRID',
};

const filterUnitCodes = {
  A: 'SDIM.POOL_SUPPLY.TAB_ALL.SEARCH_BAR',
  B: 'SDIM.POOL_SUPPLY.TAB_INVOICE.SEARCH_BAR',
  C: 'SDIM.POOL_SUPPLY.TAB_INVOICED.SEARCH_BAR',
  D: 'SDIM.POOL_SUPPLY.TAB_TRASH.SEARCH_BAR',
};
// 头
const formInfoDs = () => ({
  autoCreate: true,

  fields: [
    {
      name: 'supplierCompanyLov',
      label: intl.get(`${prefix}.model.directPoolSupply.belongCompanyName`).d('所属公司'),
      type: 'object',
      lovCode: 'SPFM.USER_AUTH.COMPANY',
      textField: 'companyName',
      noCache: true,
      // required: true,
      lovPara: {
        tenantId: getCurrentOrganizationId(),
      },
      ignore: 'always',
    },
    {
      name: 'supplierCompanyId',
      type: 'string',
      bind: 'supplierCompanyLov.companyId',
    },
    {
      name: 'supplierCompanyName',
      type: 'string',
      bind: 'supplierCompanyLov.companyName',
    },
    {
      name: 'companyNameLov',
      label: intl.get(`${prefix}.model.directPoolSupply.companyName`).d('所属客户'),
      type: 'object',
      lovCode: 'SSTA.USER_AUTH.EXT_SUPPLIER',
      textField: 'companyName',
      noCache: true,
      // required: true,
      lovPara: {
        tenantId: getCurrentOrganizationId(),
      },
      ignore: 'always',
    },
    {
      name: 'companyId',
      type: 'string',
      bind: 'companyNameLov.supplierCompanyId',
    },
    {
      name: 'companyName',
      type: 'string',
      bind: 'companyNameLov.companyName',
    },
    {
      name: 'applyType',
      type: 'string',
      label: intl.get(`${prefix}.model.directPoolSupply.businessType`).d('业务类型'),
      lookupCode: 'SDIM.APPLY_TYPE',
      defaultValue: 'SALE_INVOICE',
    },
    {
      name: 'ruleLov',
      type: 'object',
      label: intl.get(`${prefix}.model.directPoolSupply.invoiceRule`).d('开票规则'),
      lovCode: 'SDIM.POOL_RULE_LOV',
      noCache: true,
      lovPara: {
        tenantId: getCurrentOrganizationId(),
      },
    },
    {
      name: 'ruleId',
      type: 'string',
      bind: 'ruleLov.ruleId',
    },
    {
      name: 'ruleNum',
      type: 'string',
      bind: 'ruleLov.ruleNum',
    },
    {
      name: 'invoiceType',
      type: 'string',
      label: intl.get(`${prefix}.model.directPoolSupply.billType`).d('发票种类'),
      lookupCode: 'SDIM.INVOICE_TYPE',
      required: true,
    },
    {
      name: 'invoiceListMark',
      type: 'string',
      label: intl.get(`${prefix}.model.directPoolSupply.purchaseListFlag`).d('购货清单标志'),
      lookupCode: 'SDIM.INVOICE_LIST_MARK',
    },
    {
      name: 'extNumber',
      type: 'string',
      label: intl.get(`${prefix}.model.directPoolSupply.extNumber`).d('分机号'),
    },

    {
      name: 'applyNum',
      type: 'string',
      label: intl.get(`${prefix}.model.directPoolSupply.InvoiceNum`).d('开票清单编号'),
    },

    {
      name: 'applyStatus',
      type: 'string',
      label: intl.get(`${prefix}.model.directPoolSupply.applyStatus`).d('申请状态'),
      defaultValue: 'NEW',
      lookupCode: 'SDIM.APPLY_STATUS',
    },
    {
      name: 'purchaseCompanyLov',
      label: intl.get('ssta.costSheet.model.costSheet.purname').d('购方名称'),
      type: 'object',
      lovCode: 'SSTA.USER_AUTH_COMPANY.WITH_TAXCODE',
      textField: 'companyName',
      noCache: true,
      // required: true,
      lovPara: {
        tenantId: getCurrentOrganizationId(),
      },
      ignore: 'always',
    },
    {
      name: 'purchaseCompanyId',
      type: 'string',
      bind: 'purchaseCompanyLov.companyId',
    },
    {
      name: 'purchaseCompanyName',
      type: 'string',
      bind: 'purchaseCompanyLov.companyName',
    },
    {
      name: 'purUnifiedSocialCode',
      type: 'string',
      label: intl
        .get(`${prefix}.model.directPoolSupply.purUnifiedSocialCode`)
        .d('购方纳税人识别号'),
      bind: 'purchaseCompanyLov.unifiedSocialCode',
    },
    {
      name: 'saleCompanyLov',
      label: intl.get('ssta.costSheet.model.costSheet.supcompanysName').d('销方名称'),
      type: 'object',
      lovCode: 'SSTA.USER_AUTH_SUPPLIER_WITH_TAX',
      textField: 'companyName',
      noCache: true,
      // required: true,
      lovPara: {
        tenantId: getCurrentOrganizationId(),
      },
      ignore: 'always',
    },
    {
      name: 'saleCompanyId',
      type: 'string',
      bind: 'saleCompanyLov.supplierCompanyId',
    },
    {
      name: 'saleCompanyName',
      type: 'string',
      bind: 'saleCompanyLov.supplierCompanyName',
    },
    {
      name: 'saleUnifiedSocialCode',
      type: 'string',
      label: intl
        .get(`${prefix}.model.directPoolSupply.supUnifiedSocialCode`)
        .d('销方纳税人识别号'),
      bind: 'saleCompanyLov.unifiedSocialCode',
    },
    {
      name: 'purchaseCompanyType',
      type: 'string',
      label: intl.get(`${prefix}.model.directPoolSupply.purCompanyType`).d('购方企业类型'),
      lookupCode: 'SDIM.COMPANY_TYPE',
      required: true,
    },
    {
      name: 'saleCompanyType',
      type: 'string',
      label: intl.get(`${prefix}.model.directPoolSupply.supCompanyType`).d('销方企业类型'),
      lookupCode: 'SDIM.COMPANY_TYPE',
      required: true,
    },
    {
      name: 'purAddressTel',
      type: 'string',
      label: intl.get('ssta.costSheet.model.costSheet.purAddrAndTel').d('购方地址电话'),
    },
    {
      name: 'saleAddressTel',
      type: 'string',
      label: intl.get('ssta.costSheet.model.costSheet.supAddrAndTel').d('销方地址电话'),
      required: true,
    },
    {
      name: 'purBankAndAccount',
      type: 'string',
      label: intl.get(`${prefix}.model.directPoolSupply.purBankAccount`).d('购方开户行及账号'),
    },
    {
      name: 'saleBankAndAccount',
      type: 'string',
      label: intl.get(`${prefix}.model.directPoolSupply.supBankAccount`).d('销方开户行及账号'),
      required: true,
    },
    {
      name: 'netAmount',
      type: 'string',
      label: intl.get(`${prefix}.model.directPoolSupply.totalIncludeTax`).d('合计不含税金额'),
    },
    {
      name: 'taxAmount',
      type: 'string',
      label: intl.get(`${prefix}.model.directPoolSupply.totalTax`).d('合计税额'),
    },
    {
      name: 'amount',
      type: 'number',
      label: intl.get('ssta.costSheet.model.costSheet.taxsIncludedAmount').d('价税合计'),
    },
    {
      name: 'invoiceBy',
      type: 'string',
      label: intl.get('ssta.costSheet.model.costSheet.drawer').d('开票人'),
    },
    {
      name: 'payee',
      type: 'string',
      label: intl.get('ssta.costSheet.model.costSheet.payee').d('收款人'),
    },

    {
      name: 'reviewer',
      type: 'string',
      label: intl.get('ssta.costSheet.model.costSheet.reviewer').d('复核人'),
    },
    {
      name: 'receiver',
      type: 'string',
      label: intl.get(`${prefix}.model.directPoolSupply.receiverPaper`).d('纸票收件人'),
    },
    {
      name: 'recipientPhone',
      type: 'string',
      label: intl.get(`${prefix}.model.directPoolSupply.receiverPaperPhone`).d('纸票收件人电话'),
    },
    {
      name: 'recipientAddress',
      type: 'string',
      label: intl.get(`${prefix}.model.directPoolSupply.receiverPaperAddress`).d('纸票收件人地址'),
    },
    {
      name: 'billingType',
      type: 'string',
      label: intl.get('ssta.supplySettle.model.supplySettle.invoiceTypeMeaning').d('开票类型'),
      lookupCode: 'SDIM.BILLING_TYPE',
      required: true,
    },
    {
      name: 'invoiceCode',
      type: 'string',
      label: intl.get('ssta.costSheet.model.costSheet.invoiceCode').d('发票代码'),
      dynamicProps: {
        disabled: ({ record }) => record.get('billingType') === '0',
        required: ({ record }) => record.get('billingType') && record.get('billingType') !== '0',
      },
    },
    {
      name: 'invoiceNum',
      type: 'string',
      label: intl.get('ssta.costSheet.model.costSheet.invoiceNum').d('发票号码'),
      dynamicProps: {
        disabled: ({ record }) => record.get('billingType') === '0',
        required: ({ record }) => record.get('billingType') && record.get('billingType') !== '0',
      },
    },
    {
      name: 'redInfoNumber',
      type: 'string',
      label: intl.get(`${prefix}.model.directPoolSupply.infoSheet`).d('红字信息表'),
    },
    {
      name: 'remark',
      type: 'string',
      label: intl.get('ssta.costSheet.model.costSheet.remark').d('备注'),
      dynamicProps: {
        required: ({ record }) => record.get('billingType') && record.get('billingType') === '1',
      },
    },
    {
      name: 'representativeFlag',
      type: 'number',
      label: intl.get(`${prefix}.model.directPoolSupply.representativeFlag`).d('代开标志'),
      defaultValue: 0,
    },
    // {
    //   name: 'purchaseFlag',
    //   type: 'number',
    //   label: intl.get(`${prefix}.model.directPoolSupply.purchaseFlag`).d('收购标志'),
    // },
  ],
  transport: {
    read: ({ data }) => {
      const { invoiceHeaderId } = data;

      return {
        url: `/ssta/v1/${organizationId}/invoice-header/detail/${invoiceHeaderId}`,
        method: 'GET',
      };
    },
  },
});

// 行DS
const tableInfoDs = () => ({
  // autoQuery: true,
  primaryKey: 'invoiceHeaderId',
  // table表单显示的字段
  fields: [
    {
      name: 'lineNum',
      type: 'string',
      label: intl.get('ssta.costSheet.model.costSheet.linseNum').d('行号'),
    },
    {
      name: 'applyLineTypeMeaning',
      type: 'string',
      label: intl.get(`${prefix}.model.directPoolSupply.invoiceLineType`).d('发票行性质'),
      // lookupCode: 'SDIM.APPLY_LINE_TYPE',
    },
    {
      name: 'commodityCode',
      type: 'string',
      label: intl.get(`${prefix}.model.directPoolSupply.taxNum`).d('税收编码'),
    },
    {
      name: 'projectName',
      type: 'string',
      label: intl.get('ssta.costSheet.model.costSheet.chargsseCode').d('货物或应税劳务，服务名称'),
    },
    {
      name: 'model',
      type: 'string',
      label: intl.get('ssta.costSheet.model.costSheet.spec').d('规格型号'),
    },
    {
      name: 'uom',
      type: 'string',
      label: intl.get('ssta.costSheet.model.costSheet.theUom').d('单位'),
    },
    {
      name: 'quantity',
      type: 'string',

      label: intl.get('ssta.costSheet.model.costSheet.quantitys').d('数量'),
    },
    {
      name: 'netPrice',
      type: 'number',
      label: intl.get('ssta.costSheet.model.costSheet.thenetPrice').d('不含税单价'),
    },
    {
      name: 'taxRate',
      type: 'string',
      label: intl.get('ssta.costSheet.model.costSheet.taxRate').d('税率'),
    },
    {
      name: 'price',
      type: 'number',
      label: intl.get('ssta.costSheet.model.costSheet.taxIncssludedAmount').d('含税单价'),
    },
    {
      name: 'netAmount',
      type: 'number',
      label: intl.get('ssta.costSheet.model.costSheet.noIncludedPrice').d('不含税金额'),
    },
    {
      name: 'taxAmount',
      type: 'number',
      label: intl.get('ssta.costSheet.model.costSheet.thetaxAmount').d('税额'),
    },
    {
      name: 'amount',
      type: 'number',
      label: intl.get('ssta.costSheet.model.costSheet.thetaxIncludesdAmount').d('含税金额'),
    },
    {
      name: 'deductionAmount',
      type: 'string',
      label: intl.get(`${prefix}.model.directPoolSupply.deduction`).d('扣除额'),
    },
    {
      name: 'freeTaxMark',
      type: 'string',
      label: intl.get('ssta.commodity.model.commodity.zeroTaxRateFlag').d('零税率标识'),
      lookupCode: 'SDIM.FREE_TAX_MARK',
    },
    {
      name: 'preferentialPolicyFlag',
      type: 'string',
      label: intl.get('ssta.commodity.model.commodity.policy').d('优惠政策标识'),
      lookupCode: 'SDIM.PREFERENTIAL_POLICY_FLAG',
    },
    {
      name: 'specialManagementVat',
      type: 'string',
      label: intl.get('ssta.commodity.model.commodity.specialVAT').d('增值税特殊管理'),
    },

    {
      name: 'vehicleType',
      type: 'string',
      label: intl.get(`${prefix}.model.directPoolSupply.carType`).d('车辆类型'),
    },
    {
      name: 'brandModel',
      type: 'string',
      label: intl.get(`${prefix}.model.directPoolSupply.factoryPlate`).d('厂牌型号'),
    },
    {
      name: 'productArea',
      type: 'string',
      label: intl.get(`${prefix}.model.directPoolSupply.sourceArea`).d('原产地'),
    },
    {
      name: 'certificateNum',
      type: 'string',
      label: intl.get(`${prefix}.model.directPoolSupply.qualifiedNum`).d('合格证号'),
    },
    {
      name: 'importExportCertificateNum',
      type: 'string',
      label: intl.get(`${prefix}.model.directPoolSupply.exportsAndImportsNum`).d('进出口证明书号'),
    },
    {
      name: 'commodityInspectionNum',
      type: 'string',
      label: intl.get(`${prefix}.model.directPoolSupply.commodityInspectionNum`).d('商检单号'),
    },
    {
      name: 'engineNum',
      type: 'string',
      label: intl.get(`${prefix}.model.directPoolSupply.EngineNo`).d('发动机号码'),
    },
    {
      name: 'vehicleNum',
      type: 'string',
      label: intl.get(`${prefix}.model.directPoolSupply.vehicleNum`).d('车辆识别号码/机动车号码'),
    },
    {
      name: 'taxPaymentCertificateNum',
      type: 'string',
      label: intl.get(`${prefix}.model.directPoolSupply.taxCertificateNum`).d('完税证明号码'),
    },
    {
      name: 'tonnage',
      type: 'string',
      label: intl.get(`${prefix}.model.directPoolSupply.tonnage`).d('吨位'),
    },

    {
      name: 'passengersLimit',
      type: 'string',
      label: intl.get(`${prefix}.model.directPoolSupply.maxCapacity`).d('限乘人数'),
    },
    {
      name: 'organizationCode',
      type: 'string',
      label: intl.get(`${prefix}.model.directPoolSupply.IDNum`).d('身份证号码或组织机构代码'),
    },
    {
      name: 'settleNum',
      type: 'string',
      label: intl.get(`${prefix}.model.directPoolSupply.settleNum`).d('结算事务编号'),
    },
  ],
  queryParameter: {
    customizeUnitCode:
      'SDIM.POOL_SUPPLY_DETAIL.APPLY_LINE_SEARCH_BAR,SDIM.POOL_SUPPLY_DETAIL.APPLY_LINE',
  },
  transport: {
    read: ({ data, dataSet }) => {
      const applyHeaderId = dataSet.getState('applyHeaderId');
      return {
        url: `/ssta/v1/${organizationId}/direct-invoice-apply-lines/transform/${applyHeaderId}`,
        method: 'GET',
        data: { ...data, applyHeaderId },
      };
    },
    destroy: ({ data }) => {
      return {
        url: `/ssta/v1/${organizationId}/direct-invoice-apply-lines/cancel`,
        data,
        method: 'PUT',
      };
    },
  },
});

const addModalDs = () => {
  return {
    selection: 'multiple',
    autoQuery: false,
    cacheSelection: true,
    primaryKey: 'poolId',
    validateBeforeQuery: false,
    fields: [
      {
        name: 'poolNum',
        type: 'string',
        label: intl.get('ssta.directPoolSupply.model.directPoolSupply.poolNum').d('开票事务编号'),
      },
      {
        name: 'poolStatusMeaning',
        type: 'string',
        label: intl
          .get('ssta.directPoolSupply.model.directPoolSupply.poolStatusMeaning')
          .d('开票状态'),
      },
      {
        name: 'ruleNum',
        type: 'string',
        label: intl.get('ssta.directPoolSupply.model.directPoolSupply.ruleNum').d('执行开票规则'),
      },
      {
        name: 'netPrice',
        type: 'number',
        label: intl.get('ssta.directPoolSupply.model.directPoolSupply.netPrice').d('不含税单价'),
      },
      {
        name: 'amountInvoicing',
        type: 'number',
        label: intl
          .get('ssta.directPoolSupply.model.directPoolSupply.amountInvoicing')
          .d('开票税额'),
      },
      {
        name: 'amountInvoice',
        type: 'number',
        label: intl
          .get('ssta.directPoolSupply.model.directPoolSupply.amountInvoice')
          .d('可开票含税金额'),
      },
      {
        name: 'trxDate',
        type: 'date',
        label: intl.get('ssta.directPoolSupply.model.directPoolSupply.trxDate').d('事务日期'),
      },
      {
        name: 'refDocNumListStr',
        type: 'string',
        label: intl
          .get('ssta.directPoolSupply.model.directPoolSupply.refDocNumListStr')
          .d('关联开票申请单'),
      },
      {
        name: 'defaultInvoiceType',
        type: 'string',
        label: intl
          .get('ssta.directPoolSupply.model.directPoolSupply.defaultInvoiceType')
          .d('税务发票种类'),
      },
      {
        name: 'refInvoiceNumListStr',
        type: 'string',
        label: intl
          .get('ssta.directPoolSupply.model.directPoolSupply.refInvoiceNumListStr')
          .d('关联税务发票代码-发票号码'),
      },
      {
        name: 'companyName',
        type: 'string',
        label: intl.get('ssta.directPoolSupply.model.directPoolSupply.companyName').d('所属客户'),
      },
      {
        name: 'supplierCompanyName',
        type: 'string',
        label: intl
          .get('ssta.directPoolSupply.model.directPoolSupply.supplierCompanyName')
          .d('所属公司'),
      },
      {
        name: 'item',
        type: 'string',
        label: intl.get('ssta.directPoolSupply.model.directPoolSupply.item').d('物料名称'),
      },
      {
        name: 'commodityNum',
        type: 'string',
        label: intl
          .get('ssta.directPoolSupply.model.directPoolSupply.commodityNum')
          .d('税收商品编码'),
      },
      {
        name: 'commodityName',
        type: 'string',
        label: intl
          .get('ssta.directPoolSupply.model.directPoolSupply.commodityName')
          .d('商品或服务名称'),
      },
      {
        name: 'quantity',
        type: 'number',
        label: intl.get('ssta.directPoolSupply.model.directPoolSupply.quantity').d('可开票数量'),
      },
      {
        name: 'sourceDocNum',
        type: 'string',
        label: intl
          .get('ssta.directPoolSupply.model.directPoolSupply.sourceDocNum')
          .d('来源单据号'),
      },
      {
        name: 'sourceDocLineNum',
        type: 'string',
        label: intl
          .get('ssta.directPoolSupply.model.directPoolSupply.sourceDocLineNum')
          .d('来源单据行号'),
      },
    ],
    transport: {
      /**
       * 查询
       */
      read: ({ params, dataSet, data }) => {
        let url = '';
        const {
          queryParameter: { type },
        } = dataSet;
        switch (type) {
          case 'A':
            url = `/ssta/v1/${organizationId}/direct-pools/list/all`;
            break;
          case 'B':
            url = `/ssta/v1/${organizationId}/direct-pools/list/invoice`;
            break;
          case 'C':
            url = `/ssta/v1/${organizationId}/direct-pools/list/invoiced`;
            break;
          default:
            url = `/ssta/v1/${organizationId}/direct-pools/list/all`;
            break;
        }

        return {
          url,
          method: 'GET',
          params: filterNullValueObject({
            ...data,
            ...params,
            ...transformQselectDate(data, { creationDateRange: 'creationDate' }),
            customizeUnitCode: [filterUnitCodes[type], tableUnitCodes[type]]
              .filter((item) => item)
              .join(),
          }),
        };
      },
    },
  };
};

export { formInfoDs, tableInfoDs, addModalDs };
