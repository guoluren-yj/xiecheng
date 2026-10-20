import { getCurrentOrganizationId } from 'utils/utils';
import intl from 'utils/intl';
import { SRM_SSRC, PRIVATE_BUCKET } from '_utils/config';
import { ChunkUploadProps } from '@/utils/SsrcRegx';

const tableDS = (props = {}) => {
  const { module = '', selection = false, filterCode = '', customizeUnitCode = '', remote } =
    props || {};
  const dsConfig = {
    autoQuery: false,
    primaryKey: 'uniqueKey', // 唯一key
    pageSize: 20,
    cacheSelection: true,
    selection,
    fields: [
      {
        name: 'quotationStatus',
        label: intl.get('ssrc.quickInquiry.model.quickInquiry.status').d('状态'),
      },
      {
        name: 'batchNo',
        label: intl.get('ssrc.quickInquiry.model.quickInquiry.batchNo').d('批次'),
      },
      {
        name: 'operate',
        label: intl.get('ssrc.quickInquiry.model.quickInquiry.operate').d('操作'),
      },
      // =====物料信息1==================================================================
      {
        // label: intl.get('ssrc.quickInquiry.model.quickInquiry.itemInfo').d('物料信息') + 1,
        name: 'itemOne',
      },
      {
        name: 'itemCode',
        label: intl.get('ssrc.quickInquiry.model.quickInquiry.itemCode').d('物料编码'),
      },
      {
        name: 'itemName',
        label: intl.get('ssrc.quickInquiry.model.quickInquiry.itemName').d('物料名称'),
      },
      {
        label: intl.get(`ssrc.common.model.unit`).d('单位'),
        name: 'secondaryUomName',
      },
      {
        name: 'uomName',
        label: intl.get(`ssrc.common.model.inquiryHall.basicUomName`).d('基本单位'),
      },
      {
        label: intl.get(`ssrc.common.model.targetPrice`).d('目标单价'),
        name: 'secondaryTargetPrice',
        type: 'number',
      },
      {
        name: 'targetPrice',
        label: intl.get(`ssrc.common.model.inquiryHall.basicTargetPrice`).d('基本目标单价'),
        type: 'number',
      },
      // =====组织信息==================================================================
      {
        name: 'organizationInfo',
        // label: intl.get(`ssrc.quickInquiry.model.quickInquiry.orgInfos`).d('组织信息'),
      },
      {
        name: 'companyName',
        label: intl.get('ssrc.quickInquiry.model.quickInquiry.companyName').d('公司'),
      },
      {
        name: 'ouName',
        label: intl.get('ssrc.quickInquiry.model.quickInquiry.ouName').d('业务实体'),
      },
      {
        name: 'invOrganizationName',
        label: intl.get('ssrc.quickInquiry.model.quickInquiry.invOrganizationName').d('库存组织'),
      },
      {
        name: 'purOrganizationName',
        label: intl.get('ssrc.quickInquiry.model.quickInquiry.purOrganizationName').d('采购组织'),
      },
      {
        name: 'purchaseName',
        label: intl.get('ssrc.quickInquiry.model.quickInquiry.purchaseName').d('采购员'),
      },
      // =====报价信息==================================================================
      {
        // label: intl.get('ssrc.quickInquiry.model.quickInquiry.quotationInfo').d('报价信息'),
        name: 'quotationInfo',
      },
      {
        label: intl.get(`ssrc.quickInquiry.model.quickInquiry.quotationRounds`).d('报价轮次'),
        name: 'roundNumber',
      },
      {
        label: intl.get(`ssrc.quickInquiry.model.quickInquiry.taxIncludedPrice`).d('单价（含税）'),
        name: 'localQuotationSecPrice',
        type: 'number',
      },
      {
        label: intl
          .get(`ssrc.quickInquiry.model.quickInquiry.basicTaxIncludedPrice`)
          .d('基本单价（含税）'),
        name: 'localQuotationPrice',
        type: 'number',
      },
      {
        label: intl.get(`ssrc.quickInquiry.model.quickInquiry.netPrice`).d('单价（不含税）'),
        name: 'localNetSecPrice',
        type: 'number',
      },
      {
        label: intl
          .get(`ssrc.quickInquiry.model.quickInquiry.basicNetPrice`)
          .d('基本单价（不含税）'),
        name: 'localNetPrice',
        type: 'number',
      },
      // =====供应商信息==================================================================
      {
        name: 'supplierInfo',
        // label: intl.get(`ssrc.quickInquiry.model.quickInquiry.supplierInfo`).d('供应商信息'),
      },
      {
        name: 'supplierCompanyNum',
        label: intl.get('ssrc.quickInquiry.model.quickInquiry.supplierCompanyNum').d('供应商编码'),
      },
      {
        name: 'supplierCompanyName',
        label: intl.get('ssrc.quickInquiry.model.quickInquiry.supplierCompanyName').d('供应商名称'),
      },
      {
        name: 'contactName',
        label: intl.get('ssrc.quickInquiry.model.quickInquiry.contactName').d('联系人姓名'),
      },
      {
        name: 'contactMobilephone',
        label: intl.get('ssrc.quickInquiry.model.quickInquiry.contactMobilephone').d('联系方式'),
      },
      {
        name: 'contactMail',
        label: intl.get('ssrc.quickInquiry.model.quickInquiry.contactMail').d('邮箱'),
      },
      // =====物料信息2==================================================================
      {
        // label: intl.get('ssrc.quickInquiry.model.quickInquiry.itemInfo').d('物料信息') + 2,
        name: 'itemTwo',
      },
      {
        label: intl.get(`ssrc.quickInquiry.model.quickInquiry.targetPriceType`).d('目标单价类型'),
        name: 'targetPriceType',
        lookupCode: 'SFIN.BENCHMARK_PRICE',
      },
      {
        label: intl.get(`ssrc.quickInquiry.model.quickInquiry.tax`).d('税率'),
        name: 'taxRate',
        type: 'number',
      },
      {
        label: intl.get(`ssrc.quickInquiry.model.quickInquiry.currencyCode`).d('币种'),
        name: 'currencyCode',
      },
      {
        label: intl.get(`ssrc.quickInquiry.model.quickInquiry.ladderInquiryFlag`).d('启用阶梯报价'),
        name: 'ladderInquiryFlag',
        type: 'boolean',
        trueValue: 1,
        falseValue: 0,
      },
      {
        label: intl.get(`ssrc.quickInquiry.model.quickInquiry.ladderInquiry`).d('阶梯报价'),
        name: 'ladderInquiry',
      },
      {
        label: intl.get(`ssrc.quickInquiry.model.quickInquiry.validDateFrom`).d('报价有效期从'),
        name: 'validDateFrom',
        type: 'date',
      },
      {
        label: intl.get(`ssrc.quickInquiry.model.quickInquiry.validDateTo`).d('报价有效期至'),
        name: 'validDateTo',
        type: 'date',
      },
      {
        label: intl.get(`ssrc.quickInquiry.model.quickInquiry.validDateFrom`).d('报价有效期从'),
        name: 'quotationExpiryDateFrom',
        type: 'date',
      },
      {
        label: intl.get(`ssrc.quickInquiry.model.quickInquiry.validDateTo`).d('报价有效期至'),
        name: 'quotationExpiryDateTo',
        type: 'date',
      },
      {
        name: 'itemCategoryName',
        label: intl.get('ssrc.quickInquiry.model.quickInquiry.itemCategoryName').d('物料类别名称'),
      },
      {
        label: intl.get(`ssrc.quickInquiry.model.quickInquiry.brand`).d('品牌'),
        name: 'brand',
      },
      {
        label: intl.get(`ssrc.quickInquiry.model.quickInquiry.specs`).d('规格'),
        name: 'specs',
      },
      {
        label: intl.get(`ssrc.quickInquiry.model.quickInquiry.minLimitPrice`).d('最低限价'),
        name: 'minLimitPrice',
        type: 'number',
      },
      {
        label: intl.get(`ssrc.quickInquiry.model.quickInquiry.maxLimitPrice`).d('最高限价'),
        name: 'maxLimitPrice',
        type: 'number',
      },
      // =====采购申请信息==================================================================
      {
        // label: intl.get('ssrc.quickInquiry.model.quickInquiry.purchaseInfo').d('采购申请信息'),
        name: 'purchaseInfo',
      },
      {
        label: intl.get(`ssrc.quickInquiry.model.quickInquiry.prNum`).d('采购申请号'),
        name: 'prNum',
      },
      {
        label: intl.get(`ssrc.quickInquiry.model.quickInquiry.prLineNum`).d('申请行号'),
        name: 'prLineNum',
      },
      // =====其他信息==================================================================
      {
        // label: intl.get('ssrc.quickInquiry.model.quickInquiry.otherInfo').d('其他信息'),
        name: 'otherInfo',
      },
      {
        label: intl.get(`ssrc.quickInquiry.model.quickInquiry.remark`).d('物料行备注'),
        name: 'remark',
      },
      {
        label: intl.get(`ssrc.quickInquiry.model.quickInquiry.attachment`).d('附件'),
        name: 'attachmentUuid',
        type: 'attachment',
        bucketName: PRIVATE_BUCKET,
        bucketDirectory: 'ssrc-rfq-item',
        readOnly: true,
        ...(ChunkUploadProps || {}),
      },
      // =====创建信息==================================================================
      {
        // label: intl.get('ssrc.quickInquiry.model.quickInquiry.creationInfo').d('创建信息'),
        name: 'creationInfo',
      },
      {
        name: 'createdByName',
        label: intl.get(`ssrc.quickInquiry.model.quickInquiry.createdByName`).d('创建人'),
      },
      {
        name: 'creationDate',
        label: intl.get(`ssrc.quickInquiry.model.quickInquiry.creationDateTime`).d('创建时间'),
      },
      {
        label: intl.get(`ssrc.quickInquiry.model.quickInquiry.operate`).d('操作'),
        name: 'operate',
      },
      // =====创建信息==================================================================
      {
        // label: intl.get('ssrc.quickInquiry.model.quickInquiry.priceAdjustmentInfo').d('调价单信息'),
        name: 'priceAdjustmentInfo',
      },
      {
        label: intl.get(`ssrc.quickInquiry.model.quickInquiry.priceAdjustmentNum`).d('调价单号'),
        name: 'priceAdjustmentCode',
      },
      {
        label: intl
          .get(`ssrc.quickInquiry.model.quickInquiry.priceAdjustmentStatus`)
          .d('调价单状态'),
        name: 'priceAdjustmentStatus',
      },
    ],
    transport: {
      read: ({ params = {}, data = {} }) => {
        // module PENDING 待发布 || IN_QUOTATION 报价中 || CONFIRM 待处理 || SELECT_APPROVING 选用审批 || FINISHED 完成 || ALL 全部
        return {
          url: `${SRM_SSRC}/v1/${getCurrentOrganizationId()}/purchase/quick-rfq-quotations/workbenches`,
          method: 'POST',
          params: {
            ...(params || {}), // 分页参数信息等内置参数
            ...(data || {}), // 筛选器参数信息等外传参数
            customizeUnitCode: [customizeUnitCode, filterCode].join(','),
          },
          data: {
            module,
          },
        };
      },
    },
  };
  return remote
    ? remote.process('SSRC_QUICK_INQUIRY_WORKBENCH_LIST_PROCESS_TABLE_DS_CONFIG', dsConfig, props)
    : dsConfig;
};

const reQuoteFormDS = ({ customizeUnitCode } = {}) => {
  return {
    selection: false,
    dataToJSON: 'all',
    fields: [
      {
        name: 'returnRemark',
        label: intl.get('ssrc.quickInquiry.model.quickInquiry.reQuoteReason').d('重新报价理由'),
        required: true,
      },
    ],
    transport: {
      submit: ({ data }) => {
        return {
          url: `${SRM_SSRC}/v1/${getCurrentOrganizationId()}/purchase/quick-rfq-quotations/workbenches/return`,
          params: {
            customizeUnitCode,
          },
          data: (data || [])?.[0] || {},
          method: 'POST',
        };
      },
    },
  };
};

const resultExecuteRuleFormDS = () => {
  return {
    selection: false,
    dataToJSON: 'all',
    fields: [
      {
        name: 'resultExecuteRule',
        label: intl.get('ssrc.quickInquiry.model.quickInquiry.resultExecuteRule').d('执行规则'),
        lookupCode: 'SSRC_QUICK_RFQ_EXECUTE_RULE',
        required: true,
      },
    ],
  };
};

export { tableDS, reQuoteFormDS, resultExecuteRuleFormDS };
