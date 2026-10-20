import intl from 'utils/intl';
import { PRIVATE_BUCKET } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';
import { INQUIRY, getCheckPriceName, Prefix } from '@/utils/globalVariable';
import { getQuotationPrice, getQtyName, getAllottedQuantity } from '@/utils/utils';

const promptCode = 'ssrc.inquiryHall';

const organizationId = getCurrentOrganizationId();

const headerDS = (bidFlag = false) => ({
  primaryKey: 'rfxHeaderId',
  fields: [
    {
      label: bidFlag
        ? intl.get(`${promptCode}.model.inquiryHall.rfxTitle`).d('招标单标题')
        : intl.get(`${promptCode}.model.inquiryHall.rfxTitle`).d('询价单标题'),
      name: 'rfxTitle',
      transformRequest: (value = '', record) =>
        value && record && `${value}-${record?.get('rfxNum')}`,
    },
    {
      label: !bidFlag
        ? intl.get(`ssrc.inquiryHall.model.inquiryHall.RFXcheckPricer`).d('核价员')
        : intl.get(`ssrc.inquiryHall.model.inquiryHall.BIDcheckPricer`).d('定标员'),
      name: 'checkedByName',
    },
  ],
});

const basicDS = (bidFlag = false) => ({
  primaryKey: 'rfxHeaderId',
  fields: [
    {
      label: bidFlag
        ? intl.get(`ssrc.bidHall.model.bidHall.totalPrice`).d('定标总金额')
        : intl.get(`ssrc.inquiryHall.model.inquiryHall.totalPrice`).d('核价总金额'),
      name: 'totalPrice',
    },
    {
      label: intl.get('ssrc.inquiryHall.model.inquiryHall.highestAmount').d('最高金额'),
      name: 'maxSuggestedAmount',
    },
    {
      label: intl.get('ssrc.inquiryHall.model.inquiryHall.minimumAmount').d('最低金额'),
      name: 'minSuggestedAmount',
    },
    {
      label: intl.get('ssrc.projectSetup.model.projectSetup.bidding').d('中标'),
      name: 'suggestedSupCount',
    },
    {
      label: intl.get('ssrc.projectSetup.model.projectSetup.unBidding').d('未中标'),
      name: 'notSuggestedSupCount',
    },
    {
      label: intl.get('ssrc.inquiryHall.model.inquiryHall.allSupCount').d('全部供应商数'),
      name: 'allSupCount',
    },
    {
      name: 'minMaxPriceSuggestedLineCount',
      dynamicProps: {
        label: ({ dataSet }) => {
          const { auctionDirection = '' } = dataSet?.getState('headerInfo') || {};
          return auctionDirection === 'FORWARD'
            ? intl.get('ssrc.inquiryHall.model.inquiryHall.highestSelectedRow').d('选用最高价行数')
            : intl
                .get('ssrc.priceComparison.model.comparison.lowestSelectedRow')
                .d('选用最低价行数');
        },
      },
    },
    {
      label: intl.get('ssrc.inquiryHall.model.inquiryHall.thisTime').d('本次选用'),
      name: 'suggestedLineCount',
    },
    {
      label: intl.get('ssrc.inquiryHall.model.inquiryHall.subMatterrNum').d('标的数'),
      name: 'itemLineCount',
    },
    {
      label: bidFlag
        ? intl.get('ssrc.bidHall.view.message.title.checkPriceRule').d('定标规则')
        : intl.get('ssrc.inquiryHall.view.message.title.checkPriceRule').d('核价规则'),
      name: 'checkRecommendationStrategyDetail',
    },
    {
      label: intl
        .get('ssrc.inquiryHall.model.inquiryHall.usedRecommendedStrategy')
        .d('是否使用推荐策略'),
      name: 'checkRecommendationFlag',
    },
    {
      label: bidFlag
        ? intl.get(`ssrc.bidHall.model.bidHall.calibrationRemark`).d('定标备注')
        : intl.get(`ssrc.inquiryHall.model.inquiryHall.checkRemark`).d('核价备注'),
      name: 'checkRemark',
    },
  ],
});

const itemTableDS = (sourceKey = INQUIRY) => ({
  primaryKey: 'quotationLineId',
  selection: false,
  pageSize: 20,
  fields: [
    {
      label: intl.get('ssrc.common.supplierName').d('供应商名称'),
      name: 'supplierCompanyName',
    },
    {
      name: 'baseQuotationPrice',
      dynamicProps: {
        label: ({ dataSet }) => {
          const doubleUnitFlag = dataSet?.getState('doubleUnitFlag');
          return getQuotationPrice(doubleUnitFlag);
        },
      },
    },
    {
      name: 'baseNetPrice',
      dynamicProps: {
        label: ({ dataSet }) => {
          const doubleUnitFlag = dataSet?.getState('doubleUnitFlag');
          return getQuotationPrice(doubleUnitFlag);
        },
      },
    },
    {
      label: intl.get('ssrc.common.unitPrice').d('单价'),
      name: 'localLnQuotationPrice',
    },
    {
      label: intl.get('ssrc.common.unitPrice').d('单价'),
      name: 'localLnNetPrice',
    },
    {
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.quantity`).d('需求数量'),
      name: 'secondaryQuantity',
    },
    {
      name: 'rfxQuantity',
      dynamicProps: {
        label: ({ dataSet }) => {
          const doubleUnitFlag = dataSet?.getState('doubleUnitFlag');
          return getQtyName(doubleUnitFlag);
        },
      },
    },
    {
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.allottedQuantity`).d('分配数量'),
      name: 'allottedSecondaryQuantity',
    },
    {
      name: 'allottedQuantity',
      dynamicProps: {
        label: ({ dataSet }) => {
          const doubleUnitFlag = dataSet?.getState('doubleUnitFlag');
          return getAllottedQuantity(doubleUnitFlag);
        },
      },
    },
    {
      label: intl.get(`ssrc.resultsQuery.model.resultsQuery.selectLineCost`).d('选用行金额'),
      name: 'localSuggestedLnTotalAmount',
    },
    {
      label: intl.get(`ssrc.resultsQuery.model.resultsQuery.selectLineCost`).d('选用行金额'),
      name: 'localSuggestedLnNetAmount',
    },
    {
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.suggestedFlag`).d('是否选用'),
      name: 'suggestedFlag',
    },
    {
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.allocationForReason`).d('分配理由'),
      name: 'suggestedRemark',
    },
    {
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.lineAttachment`).d('行附件'),
      name: 'attachmentUuid',
      readOnly: true,
      bucketName: PRIVATE_BUCKET,
      bucketDirectory: 'ssrc-rfx-quotationline',
      viewMode: 'popup',
      type: 'attachment',
    },
  ],
  transport: {
    read: ({ dataSet = {} }) => {
      const {
        queryParameter: { rfxHeaderId, rfxLineItemId, templateInfo = {} },
      } = dataSet || {};
      return {
        url: `${Prefix}/${organizationId}/rfx/check/approval-form/supplier/page`,
        method: 'GET',
        data: {
          rfxHeaderId,
          rfxLineItemId,
          customizeUnitCode: `SSRC.${sourceKey}_HALL_CHECK_PRICE_OVERVIEW.ITEM_TABLES`,
          ...templateInfo,
        },
      };
    },
  },
});

const supplierTableDS = (sourceKey = INQUIRY) => ({
  primaryKey: 'quotationLineId',
  selection: false,
  pageSize: 20,
  fields: [
    {
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.lineNo.`).d('行号'),
      name: 'rfxLineItemNum',
    },
    {
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.viewItemDetail`).d('物料'),
      name: 'itemName',
    },
    {
      name: 'baseQuotationPrice',
      dynamicProps: {
        label: ({ dataSet }) => {
          const doubleUnitFlag = dataSet?.getState('doubleUnitFlag');
          return getQuotationPrice(doubleUnitFlag);
        },
      },
    },
    {
      name: 'baseNetPrice',
      dynamicProps: {
        label: ({ dataSet }) => {
          const doubleUnitFlag = dataSet?.getState('doubleUnitFlag');
          return getQuotationPrice(doubleUnitFlag);
        },
      },
    },
    {
      label: intl.get('ssrc.common.unitPrice').d('单价'),
      name: 'localLnQuotationPrice',
    },
    {
      label: intl.get('ssrc.common.unitPrice').d('单价'),
      name: 'localLnNetPrice',
    },
    {
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.lastWinningBidPrice`).d('上次中标价'),
      name: 'lastBiddedPrice',
    },
    {
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.savingRatio`).d('节支率'),
      name: 'savingRatio',
    },
    {
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.quantity`).d('需求数量'),
      name: 'secondaryQuantity',
    },
    {
      name: 'rfxQuantity',
      dynamicProps: {
        label: ({ dataSet }) => {
          const doubleUnitFlag = dataSet?.getState('doubleUnitFlag');
          return getQtyName(doubleUnitFlag);
        },
      },
    },
    {
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.allottedQuantity`).d('分配数量'),
      name: 'allottedSecondaryQuantity',
    },
    {
      name: 'allottedQuantity',
      dynamicProps: {
        label: ({ dataSet }) => {
          const doubleUnitFlag = dataSet?.getState('doubleUnitFlag');
          return getAllottedQuantity(doubleUnitFlag);
        },
      },
    },
    {
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.reason`).d('选用理由'),
      name: 'suggestedRemark',
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
  ],
  transport: {
    read: ({ dataSet = {} }) => {
      const {
        queryParameter: { rfxHeaderId, rfxLineSupplierId, templateInfo = {} },
      } = dataSet || {};
      return {
        url: `${Prefix}/${organizationId}/rfx/check/approval-form/item/page`,
        method: 'GET',
        data: {
          rfxHeaderId,
          rfxLineSupplierId,
          customizeUnitCode: `SSRC.${sourceKey}_HALL_CHECK_PRICE_OVERVIEW.SUPPLIER_TABLES`,
          ...templateInfo,
        },
      };
    },
  },
});

const contentBasicDs = (bidFlag = false) => ({
  primaryKey: 'quotationLineId',
  fields: [
    {
      label: intl
        .get(`ssrc.inquiryHall.model.inquiryHall.benchmarkLocalSugQtnAmount`)
        .d('中标总金额'),
      name: 'benchmarkLocalSugQtnAmount',
    },
    {
      label: bidFlag
        ? intl.get(`ssrc.supplierQuotation.model.supQuo.totalTenderAmount`).d('投标总金额')
        : intl.get('ssrc.common.totalQuotaionAmount').d('报价总金额'),
      name: 'benchmarkLocalQuoAmount',
    },
    {
      label: intl.get('ssrc.bidHall.model.bidHall.savingAmount').d('节支金额'),
      name: 'savingAmount',
    },
    {
      label: intl
        .get(`ssrc.inquiryHall.model.inquiryHall.suggestedSupplierCount`)
        .d('中标供应商数量'),
      name: 'suggestedSupplierCount',
    },
    {
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.savingRatio`).d('节支率'),
      name: 'savingRatio',
    },
    {
      name: 'minMaxSuggestedRatio',
      dynamicProps: {
        label: ({ dataSet }) => {
          const { auctionDirection = '' } = dataSet?.getState('headerInfo') || {};
          return auctionDirection === 'FORWARD'
            ? intl.get(`ssrc.inquiryHall.model.inquiryHall.maxSuggestedRatio`).d('最高价中标率')
            : intl.get(`ssrc.inquiryHall.model.inquiryHall.minMaxSuggestedRatio`).d('最低价中标率');
        },
      },
    },
    {
      name: 'minMaxSuggestedFlag',
      dynamicProps: {
        label: ({ dataSet }) => {
          const { auctionDirection = '' } = dataSet?.getState('headerInfo') || {};
          return auctionDirection === 'FORWARD'
            ? intl.get(`ssrc.inquiryHall.model.inquiryHall.maxSuggestedFlag`).d('是否最高价中标')
            : intl
                .get(`ssrc.inquiryHall.model.inquiryHall.minMaxSuggestedFlag`)
                .d('是否最低价中标');
        },
      },
    },
  ],
});

const tableAttachmentDS = () => ({
  primaryKey: 'quotationLineId',
  fields: [
    {
      name: 'businessAttachmentUuid',
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.businessAttachments`).d('商务附件'),
      readOnly: true,
      type: 'attachment',
      bucketName: PRIVATE_BUCKET,
      bucketDirectory: 'ssrc-rfx-rfxheader',
    },
    {
      name: 'techAttachmentUuid',
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.techAttachments`).d('技术附件'),
      readOnly: true,
      type: 'attachment',
      bucketName: PRIVATE_BUCKET,
      bucketDirectory: 'ssrc-rfx-rfxheader',
    },
    {
      name: 'roundBusinessAttachmentUuid',
      label: intl
        .get(`ssrc.inquiryHall.model.inquiryHall.roundBusinessAttachments`)
        .d('多轮补充商务附件'),
      readOnly: true,
      type: 'attachment',
      bucketName: PRIVATE_BUCKET,
    },
    {
      name: 'roundTechAttachmentUuid',
      label: intl
        .get(`ssrc.inquiryHall.model.inquiryHall.roundTechAttachments`)
        .d('多轮补充技术附件'),
      readOnly: true,
      type: 'attachment',
      bucketName: PRIVATE_BUCKET,
    },
    {
      name: 'bargainBusinessAttachmentUuid',
      label: intl
        .get(`ssrc.inquiryHall.model.inquiryHall.bargainBusinessAttachments`)
        .d('议价补充商务附件'),
      readOnly: true,
      type: 'attachment',
      bucketName: PRIVATE_BUCKET,
    },
    {
      name: 'bargainTechAttachmentUuid',
      label: intl
        .get(`ssrc.inquiryHall.model.inquiryHall.bargainTechAttachments`)
        .d('议价补充技术附件'),
      readOnly: true,
      type: 'attachment',
      bucketName: PRIVATE_BUCKET,
    },
  ],
});

const attachmentDS = (sourceKey = INQUIRY) => ({
  primaryKey: 'rfxHeaderId',
  fields: [
    {
      name: 'checkAttachmentUuid',
      label: intl
        .get(`ssrc.inquiryHall.model.inquiryHall.checkAttachmentRFX`, {
          checkPriceName: getCheckPriceName(sourceKey === 'NEW_BID'),
        })
        .d('{checkPriceName}附件'),
      readOnly: true,
      type: 'attachment',
      bucketName: PRIVATE_BUCKET,
      bucketDirectory: 'ssrc-rfx-quotationline',
    },
  ],
});

const expertScoreHeadDataSet = () => {
  return {
    autoQuery: false,
    selection: false,
    fields: [],
  };
};

const expertScoreDataSet = () => {
  return {
    autoQuery: false,
    selection: false,
    paging: false,
    primaryKey: 'evaluateSummaryId',
    fields: [
      {
        label: intl.get(`sscux.ssrc.ccteghzcg.view.serialNumber`).d('序号'),
        name: 'serialNumber',
      },
      {
        label: intl.get('ssrc.common.supplierName').d('供应商名称'),
        name: 'supplierCompanyName',
      },
    ],
  };
};

export {
  headerDS,
  basicDS,
  itemTableDS,
  supplierTableDS,
  tableAttachmentDS,
  attachmentDS,
  contentBasicDs,
  expertScoreDataSet,
  expertScoreHeadDataSet,
};
