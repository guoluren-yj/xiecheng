import { sortBy } from 'lodash';

import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';
import { PRIVATE_BUCKET, SRM_SSRC } from '_utils/config';
import { amountCalculation } from 'srm-front-boot/lib/utils/utils';
import { LadderSourceStatus, QRListCodes, QRListSearchBarCodes, QRLadderHeaderCode } from './enum';

const amountCalculate = ({ record, headRecord, caclRule }) => {
  const isTaxFlag = record.get('targetPriceType') === 'TAX_INCLUDED_PRICE';
  const defaultPrecision = headRecord?.getState('currency_precision') || 10;
  const { taxRate } = headRecord?.get(['taxRate']);
  const { ladderSecPrice, netLadderSecPrice, taxRateType } = record.get([
    'ladderSecPrice',
    'netLadderSecPrice',
    'taxRateType',
  ]);
  const COMMONS = {
    taxRate,
    caclRule,
    hasMount: false,
    hasTax: isTaxFlag,
    defaultPrecision,
    stageRule: 'noQuantity', // 数量不存在，修改计算场景
    taxRateType,
  };
  if (isTaxFlag) {
    COMMONS.taxUnitPrice = ladderSecPrice;
  }
  if (!isTaxFlag) {
    COMMONS.netUnitPrice = netLadderSecPrice;
  }
  // 无需换算数量，双单位场景待公共方法实现，暂不处理
  const { calcNetUnitPrice, calcTaxUnitPrice } = amountCalculation(COMMONS) || {};
  if (isTaxFlag) {
    record.set({ netLadderSecPrice: calcNetUnitPrice });
  } else {
    record.set({ ladderSecPrice: calcTaxUnitPrice });
  }
};

// 快速回复 - 列表
export const quickReplyTableDS = ({ stageCode, dsConfig = {} }) => {
  let type = stageCode;
  if (stageCode === 'ALL') type = 'QRALL';
  return {
    primaryKey: 'rfqQuotationId',
    selection: false,
    pageSize: 20,
    ...(dsConfig || {}), // dsConfig 配置
    fields: [
      {
        name: 'quotationStatusMeaning',
        type: 'string',
        label: intl.get('ssrc.quickInquiry.quickReply.model.quickInquiry.statusMeaning').d('状态'),
      },
      // 用于获取状态的tag值
      {
        name: 'quotationStatus',
        type: 'string',
        lookupCode: 'SSRC_QUICK_RFQ_QUOTATION_STATUS_SUPPLIER',
      },
      {
        name: 'batchNo',
        type: 'string',
        label: intl.get('ssrc.quickInquiry.quickReply.model.quickInquiry.batchNum').d('批次'),
      },
      {
        name: 'companyName',
        type: 'string',
        label: intl
          .get('ssrc.quickInquiry.quickReply.model.quickInquiry.customerCompany')
          .d('客户公司'),
      },
      {
        name: 'purOrganizationName',
        type: 'string',
        label: intl
          .get('ssrc.quickInquiry.quickReply.model.quickInquiry.purOrganization')
          .d('采购组织'),
      },
      {
        name: 'ouName',
        type: 'string',
        label: intl.get('ssrc.quickInquiry.quickReply.model.quickInquiry.ouName').d('业务实体'),
      },
      {
        name: 'invOrganizationName',
        type: 'string',
        label: intl
          .get('ssrc.quickInquiry.quickReply.model.quickInquiry.invOrganizationName')
          .d('库存组织'),
      },
      {
        name: 'itemCode',
        type: 'string',
        label: intl.get('ssrc.quickInquiry.quickReply.model.quickInquiry.itemCode').d('物料编码'),
      },
      {
        name: 'itemName',
        type: 'string',
        label: intl.get('ssrc.quickInquiry.quickReply.model.quickInquiry.itemName').d('物料名称'),
      },
      {
        name: 'itemCategoryName',
        type: 'string',
        label: intl
          .get('ssrc.quickInquiry.quickReply.model.quickInquiry.itemCategoryName')
          .d('物料类别名称'),
      },
      {
        name: 'supplierCompanyNum',
        type: 'string',
        label: intl.get('ssrc.quickInquiry.quickReply.model.quickInquiry.companyNum').d('公司编码'),
      },
      {
        name: 'supplierCompanyName',
        type: 'string',
        label: intl
          .get('ssrc.quickInquiry.quickReply.model.quickInquiry.companyName')
          .d('公司名称'),
      },
      {
        name: 'contactName',
        type: 'string',
        label: intl
          .get('ssrc.quickInquiry.quickReply.model.quickInquiry.contactName')
          .d('联系人姓名'),
      },
      {
        name: 'contactAreaCodeMeaning',
        type: 'string',
        label: intl
          .get('ssrc.quickInquiry.quickReply.model.quickInquiry.contactAreaCode')
          .d('区号'),
      },
      {
        name: 'contactMobilephone',
        type: 'string',
        label: intl
          .get('ssrc.quickInquiry.quickReply.model.quickInquiry.contactMobilephone')
          .d('联系方式'),
      },
      {
        name: 'contactMail',
        type: 'string',
        label: intl.get('ssrc.quickInquiry.quickReply.model.quickInquiry.contactMail').d('邮箱'),
      },
      {
        name: 'roundNumber',
        label: intl
          .get('ssrc.quickInquiry.quickReply.model.quickInquiry.roundNumber')
          .d('报价轮次'),
      },
      {
        name: 'secondaryUomName',
        type: 'string',
        label: intl
          .get('ssrc.quickInquiry.quickReply.model.quickInquiry.secondaryUom')
          .d('辅助单位ID/单位'),
      },
      {
        name: 'uomName',
        type: 'string',
        label: intl.get('ssrc.quickInquiry.quickReply.model.quickInquiry.uomName').d('基本单位'),
      },
      {
        name: 'currencyCode',
        type: 'string',
        label: intl
          .get('ssrc.quickInquiry.quickReply.model.quickInquiry.quotationCurrencyName')
          .d('币种'),
      },
      {
        name: 'targetPriceTypeMeaning',
        type: 'string',
        label: intl
          .get('ssrc.quickInquiry.quickReply.model.quickInquiry.targetPriceType')
          .d('目标单价类型'),
      },
      {
        name: 'targetPrice',
        type: 'number',
        label: intl
          .get('ssrc.quickInquiry.quickReply.model.quickInquiry.targetPrice')
          .d('基本目标单价'),
      },
      {
        name: 'secondaryTargetPrice',
        type: 'number',
        label: intl
          .get('ssrc.quickInquiry.quickReply.model.quickInquiry.secondaryTargetPrice')
          .d('目标单价'),
      },
      {
        name: 'taxRate',
        type: 'number',
        label: intl.get('ssrc.quickInquiry.quickReply.model.quickInquiry.taxRate').d('物料行税率'),
      },
      {
        name: 'ladderInquiryFlag',
        type: 'boolean',
        label: intl
          .get('ssrc.quickInquiry.quickReply.model.quickInquiry.ladderInquiryFlag')
          .d('启用阶梯报价'),
        trueValue: 1,
        falseValue: 0,
      },
      {
        name: 'ladderInquiryLink',
        type: 'string',
        label: intl
          .get('ssrc.quickInquiry.quickReply.model.quickInquiry.ladderInquiry')
          .d('阶梯报价'),
      },
      {
        name: 'brand',
        type: 'string',
        label: intl.get('ssrc.quickInquiry.quickReply.model.quickInquiry.brand').d('品牌'),
      },
      {
        name: 'specs',
        type: 'string',
        label: intl.get('ssrc.quickInquiry.quickReply.model.quickInquiry.specs').d('规格'),
      },
      {
        name: 'validDateFrom',
        type: 'date',
        label: intl
          .get('ssrc.quickInquiry.quickReply.model.quickInquiry.validDateFrom')
          .d('报价有效期从'),
      },
      {
        name: 'validDateTo',
        type: 'date',
        label: intl
          .get('ssrc.quickInquiry.quickReply.model.quickInquiry.validDateTo')
          .d('报价有效期至'),
      },
      {
        name: 'minLimitPrice',
        type: 'number',
        label: intl
          .get('ssrc.quickInquiry.quickReply.model.quickInquiry.minLimitPrice')
          .d('最低限价'),
      },
      {
        name: 'maxLimitPrice',
        type: 'number',
        label: intl
          .get('ssrc.quickInquiry.quickReply.model.quickInquiry.maxLimitPrice')
          .d('最高限价'),
      },
      {
        name: 'remark',
        type: 'string',
        label: intl
          .get('ssrc.quickInquiry.quickReply.model.quickInquiry.lineItemRemark')
          .d('物料行备注'),
      },
      {
        name: 'attachmentUuid',
        type: 'attachment',
        label: intl.get('ssrc.quickInquiry.quickReply.model.quickInquiry.attachmentUuid').d('附件'),
        bucketName: PRIVATE_BUCKET,
      },
      {
        name: 'action',
        type: 'string',
        label: intl.get('ssrc.quickInquiry.quickReply.model.quickInquiry.action').d('操作'),
      },

      // 聚合组字段
      {
        name: 'itemInfo1',
        type: 'string',
        label: intl.get('ssrc.quickInquiry.quickReply.model.quickInquiry.itemInfo1').d('物料信息1'),
      },
      {
        name: 'organizationInfo',
        type: 'string',
        label: intl
          .get('ssrc.quickInquiry.quickReply.model.quickInquiry.organizationInfo')
          .d('客户组织信息'),
      },
      {
        name: 'supplierInfo',
        type: 'string',
        label: intl
          .get('ssrc.quickInquiry.quickReply.model.quickInquiry.companyInfo')
          .d('公司信息'),
      },
      {
        name: 'itemInfo2',
        type: 'string',
        label: intl.get('ssrc.quickInquiry.quickReply.model.quickInquiry.itemInfo2').d('物料信息2'),
      },

      {
        name: 'otherInfo',
        type: 'string',
        label: intl.get('ssrc.quickInquiry.quickReply.model.quickInquiry.otherInfo').d('其他信息'),
      },
    ],
    transport: {
      read: ({ data, params }) => {
        const { defaultParams = {}, ...restData } = data || {};
        return {
          url: `${SRM_SSRC}/v1/${getCurrentOrganizationId()}/supplier/quick-rfq-quotation/query-list`,
          method: 'POST',
          data: { stageCode },
          params: {
            ...params,
            customizeUnitCode: [QRListCodes[type], QRListSearchBarCodes[type]].join(),
            ...restData,
            ...(defaultParams || {}),
          },
        };
      },
    },
  };
};

// 阶梯报价 - 物料信息
export const ladderItemFormDS = (rfqQuotationId) => {
  return {
    autoQuery: true,
    fields: [
      {
        name: 'itemCode',
        type: 'string',
        label: intl.get('ssrc.quickInquiry.quickReply.model.quickInquiry.itemCode').d('物料编码'),
      },
      {
        name: 'itemName',
        type: 'string',
        label: intl.get('ssrc.quickInquiry.quickReply.model.quickInquiry.itemName').d('物料名称'),
      },
    ],
    transport: {
      read: () => {
        return {
          url: `${SRM_SSRC}/v1/${getCurrentOrganizationId()}/supplier/quick-rfq-quotation/view/ladder-header`,
          method: 'POST',
          data: { rfqQuotationId },
          params: { customizeUnitCode: QRLadderHeaderCode },
        };
      },
    },
  };
};

// 阶梯报价 - 报价信息行
export const ladderLineDS = ({
  sourceStatus,
  params,
  targetPriceType,
  customizeUnitCode,
  headRecord,
  caclRule,
}) => {
  return {
    paging: false,
    autoQuery: true,
    dataToJSON: 'all',
    fields: [
      {
        name: 'ladderLineNum',
        label: intl
          .get('ssrc.quickInquiry.quickReply.model.quickInquiry.ladderLineNum')
          .d('阶梯行号'),
      },
      {
        name: 'secondaryLadderFrom',
        type: 'number',
        label: intl
          .get('ssrc.quickInquiry.quickReply.model.quickInquiry.secondaryLadderFrom')
          .d('数量从(>=)'),
        required: true,
      },
      {
        name: 'secondaryLadderTo',
        type: 'number',
        label: intl
          .get('ssrc.quickInquiry.quickReply.model.quickInquiry.secondaryLadderTo')
          .d('数量至(<)'),
        dynamicProps: {
          required: ({ dataSet, record }) => record.index + 1 !== dataSet.length,
        },
      },
      {
        name: 'ladderFrom',
        type: 'number',
        label: intl
          .get('ssrc.quickInquiry.quickReply.model.quickInquiry.ladderFrom')
          .d('基本数量从(>=)'),
      },
      {
        name: 'ladderTo',
        type: 'number',
        label: intl
          .get('ssrc.quickInquiry.quickReply.model.quickInquiry.ladderTo')
          .d('基本数量至(<)'),
      },
      {
        name: 'ladderSecPrice',
        type: 'number',
        label: intl
          .get('ssrc.quickInquiry.quickReply.model.quickInquiry.ladderSecPrice')
          .d('单价(含税)'),
        dynamicProps: {
          required: () => targetPriceType === 'TAX_INCLUDED_PRICE',
          disabled: () => targetPriceType !== 'TAX_INCLUDED_PRICE',
        },
      },
      {
        name: 'ladderPrice',
        type: 'number',
        label: intl
          .get('ssrc.quickInquiry.quickReply.model.quickInquiry.ladderPrice')
          .d('基本单价(含税)'),
      },
      {
        name: 'netLadderSecPrice',
        type: 'number',
        label: intl
          .get('ssrc.quickInquiry.quickReply.model.quickInquiry.netLadderSecPrice')
          .d('单价(不含税)'),
        dynamicProps: {
          required: () => targetPriceType !== 'TAX_INCLUDED_PRICE',
          disabled: () => targetPriceType === 'TAX_INCLUDED_PRICE',
        },
      },
      {
        name: 'netLadderPrice',
        type: 'number',
        label: intl
          .get('ssrc.quickInquiry.quickReply.model.quickInquiry.netLadderPrice')
          .d('基本单价(不含税)'),
      },
      {
        name: 'remark',
        type: 'string',
        label: intl.get('ssrc.quickInquiry.quickReply.model.quickInquiry.remark').d('备注'),
      },
    ],
    events: {
      update: ({ name, record }) => {
        const isTaxFlag = record.get('targetPriceType') === 'TAX_INCLUDED_PRICE';
        if (name === 'ladderSecPrice' && isTaxFlag) {
          amountCalculate({ name, record, headRecord, caclRule });
        }
        if (name === 'netLadderSecPrice' && !isTaxFlag) {
          amountCalculate({ name, record, headRecord, caclRule });
        }
      },
    },
    transport: {
      read: ({ data, params: dsParams }) => {
        const url =
          sourceStatus === LadderSourceStatus.HEADER_VIEW
            ? 'quotation-ladder'
            : sourceStatus === LadderSourceStatus.HEADER_EDIT
            ? 'ladder'
            : 'ladder-history';
        return {
          url: `${SRM_SSRC}/v1/${getCurrentOrganizationId()}/supplier/quick-rfq-quotation/view/${url}`,
          method: 'POST',
          data: { ...data, ...params },
          params: { ...dsParams, customizeUnitCode },
        };
      },
      submit: ({ data }) => {
        return {
          url: `${SRM_SSRC}/v1/${getCurrentOrganizationId()}/supplier/quick-rfq-quotation/save-ladder`,
          method: 'POST',
          // 行号升序
          data: sortBy(data, (item) => item.ladderLineNum),
          params: { organizationId: getCurrentOrganizationId(), customizeUnitCode },
        };
      },
      destroy: () => {
        return {
          url: `${SRM_SSRC}/v1/${getCurrentOrganizationId()}/supplier/quick-rfq-quotation/delete-ladder`,
          method: 'POST',
          params: { customizeUnitCode },
        };
      },
    },
  };
};
