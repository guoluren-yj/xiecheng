import intl from 'utils/intl';
import { Prefix } from '@/utils/globalVariable';
import { PRIVATE_BUCKET } from '_utils/config';
import { getUomName, getQtyName } from '@/utils/utils';

const ItemLineTableDS = (documentTypeName, otherPayload = {}) => {
  const { rfxInfoDS } = otherPayload || {};
  return {
    primaryKey: 'rfxLineItemId',
    autoQuery: false,
    selection: false,
    fields: [
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.lineNo.`).d('行号'),
        name: 'rfxLineItemNum',
        type: 'string',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.businessUnit`).d('业务实体'),
        name: 'ouName',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.invOrganizationName`).d('库存组织'),
        name: 'invOrganizationName',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.itemCode`).d('物料编码'),
        name: 'itemCode',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.itemName`).d('物料名称'),
        name: 'itemName',
        type: 'string',
      },
      {
        label: intl.get(`ssrc.supplierQuotation.model.supQuo.specs`).d('规格'),
        name: 'specs',
        type: 'string',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.itemCategory`).d('物料类别'),
        name: 'itemCategoryName',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.quantity`).d('需求数量'),
        name: 'secondaryQuantity',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.unit`).d('单位'),
        name: 'secondaryUomName',
      },
      {
        // label: intl.get(`ssrc.common.model.inquiryHall.basicQuantity`).d('基本数量'),
        name: 'rfxQuantity',
        dynamicProps: {
          label: ({ dataSet }) => {
            const doubleUnitFlag = dataSet.getState('doubleUnitFlag');
            return getQtyName(doubleUnitFlag);
          },
        },
      },
      {
        // label: intl.get(`ssrc.common.model.inquiryHall.basicUomName`).d('基本单位'),
        name: 'uomName',
        dynamicProps: {
          label: ({ dataSet }) => {
            const doubleUnitFlag = dataSet.getState('doubleUnitFlag');
            return getUomName(doubleUnitFlag);
          },
        },
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.priceQuantity`).d('价格批量'),
        name: 'batchPrice',
        align: 'right',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.taxInclude`).d('是否含税'),
        name: 'taxIncludedFlag',
      },
      {
        name: 'estimatedPrice',
        label: intl.get(`ssrc.inquiryHall.model.offlineEntry.estimatedPrice`).d('预估单价(含税)'),
      },
      {
        name: 'netEstimatedPrice',
        label: intl
          .get(`ssrc.inquiryHall.model.offlineEntry.netEstimatedPrice`)
          .d('预估单价(不含税)'),
      },
      {
        name: 'estimatedAmount',
        label: intl
          .get(`ssrc.inquiryHall.model.offlineEntry.estimatedAmount`)
          .d('预估行金额(含税)'),
      },
      {
        name: 'netEstimatedAmount',
        label: intl
          .get(`ssrc.inquiryHall.model.offlineEntry.netEstimatedAmount`)
          .d('预估行金额(不含税)'),
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.taxRate`).d('税率（%）'),
        name: 'taxRate',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.neededDate`).d('需求日期'),
        name: 'demandDate',
        type: 'date',
        format: 'YYYY-MM-DD',
      },
      {
        name: 'startingBiddingPrice',
        type: 'number',
        dynamicProps: {
          label() {
            // 竞价方式为拍卖 - 起拍价；竞价方式为竞价 - 起竞价
            if (rfxInfoDS?.current?.get('biddingQuotationMethod') === 'AUCTION') {
              return intl
                .get('ssrc.inquiryHall.model.biddingRules.startingAuctionPrice')
                .d('起拍价');
            }
            return intl.get('ssrc.inquiryHall.model.biddingRules.startingBiddingPrice').d('起竞价');
          },
        },
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.quotationRange`).d('报价幅度'),
        name: 'biddingQuotationRange',
        type: 'string',
      },
      {
        label: intl.get('ssrc.inquiryHall.model.biddingRules.safePrice').d('安全价'),
        name: 'safePrice',
        type: 'number',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.startLadderLevel`).d('启用阶梯报价'),
        name: 'ladderInquiryFlag',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.ladderInquiryFlag`).d('阶梯报价'),
        name: 'ladderOffer',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.quotationTemplateName`).d('报价模板'),
        name: 'templateName',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.quotationDetail`).d('报价明细'),
        name: 'quotationDetailFlag',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.floatingWay`).d('浮动方式'),
        name: 'floatTypeMeaning',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.quotationRange`).d('报价幅度'),
        name: 'quotationRange',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.prNum`).d('采购申请编号'),
        name: 'prNum',
        type: 'string',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.prLineNum`).d('采购申请行号'),
        name: 'prDisplayLineNum',
        type: 'string',
      },
      {
        name: 'projectTaskName',
        label: intl.get('ssrc.common.model.common.projectTaskNme').d('项目任务名称'),
      },
      {
        label: intl
          .get(`ssrc.inquiryHall.model.inquiryHall.commonRFxAttachment`, { documentTypeName })
          .d('{documentTypeName}附件'),
        name: 'attachmentUuid',
        type: 'attachment',
        readOnly: true,
        bucketName: PRIVATE_BUCKET,
        bucketDirectory: 'ssrc-rfx-rfxitem',
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.newPrice`).d('最新价'),
        dataIndex: 'newPrice',
        type: 'number',
      },
      // {
      //   label: intl.get(`ssrc.inquiryHall.model.inquiryHall.filterSupplier`).d('筛选供应商'),
      //   name: 'filterSupplier',
      //   type: 'string',
      // },
      {
        name: 'rfxHeaderId',
        type: 'string',
      },
      {
        name: 'objectVersionNumber',
        type: 'number',
      },
      {
        name: 'prHeaderId',
        type: 'string',
      },
      {
        name: 'organizationId',
        type: 'string',
      },
      {
        name: 'applicationScopeFlag',
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.applicationScope`).d('适用范围'),
        type: 'boolean',
        trueValue: 1,
        falseValue: 0,
      },
      {
        name: 'resultsExpandingDimensions',
        label: intl
          .get(`ssrc.inquiryHall.model.inquiryHall.resultsExpandingDimensions`)
          .d('寻源拓展维度'),
        lookupCode: 'SSRC.RESULTS_EXPANDING_DIMENSIONS',
      },
      {
        name: 'resultsExpandingHierarchy',
        label: intl
          .get(`ssrc.inquiryHall.model.inquiryHall.resultsExpandingHierarchy`)
          .d('寻源拓展层级'),
        lookupCode: 'SSRC.RESULTS_EXPANDING_HIERARCHY',
      },
      {
        name: 'expandCompanyMeaning',
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.expandCompany`).d('拓展公司'),
      },
      {
        name: 'expandInvOrganizationMeaning',
        label: intl
          .get(`ssrc.inquiryHall.model.inquiryHall.expandInvOrganization`)
          .d('拓展库存组织'),
      },
      {
        label: intl.get('ssrc.inquiryHall.model.inquiryHall.targetPriceLowerLimit').d('目标价下限'),
        name: 'targetPriceLowerLimit',
      },
      {
        label: intl.get('ssrc.inquiryHall.model.inquiryHall.targetPriceUpperLimit').d('目标价上限'),
        name: 'targetPriceUpperLimit',
      },
      {
        label: intl
          .get('ssrc.inquiryHall.model.inquiryHall.trialTargetPriceLowerLimit')
          .d('试竞价目标价下限'),
        name: 'trialTargetPriceLowerLimit',
      },
      {
        label: intl
          .get('ssrc.inquiryHall.model.inquiryHall.trialTargetPriceUpperLimit')
          .d('试竞价目标价上限'),
        name: 'trialTargetPriceUpperLimit',
      },
    ],
    transport: {
      read: ({ dataSet }) => {
        const {
          queryParameter: { commonProps = {} },
        } = dataSet;
        const { organizationId, rfxHeaderId, isPubPage, ...others } = commonProps;
        let url;
        if (!rfxHeaderId || rfxHeaderId === 'null') {
          return;
        }

        if (isPubPage) {
          url = `${Prefix}/${organizationId}/rfx/hist/${rfxHeaderId}/items`;
        } else {
          url = `${Prefix}/${organizationId}/rfx/${rfxHeaderId}/items`;
        }
        return {
          url,
          method: 'GET',
          data: others,
        };
      },
    },
  };
};

export default ItemLineTableDS;
