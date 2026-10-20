import intl from 'utils/intl';
import { SRM_SSRC } from '_utils/config';
import { isEmpty } from 'lodash';

// 单价竞价-供应商列表
const supplierListDS = () => {
  return {
    autoQuery: false,
    primaryKey: 'rfxLineSupplierId',
    paging: false,
    fields: [],
    transport: {
      read: ({ data, params = {} }) => {
        const { commonProps = {}, header } = data;
        const { organizationId, customizeUnitCode, ...otherCommonProps } = commonProps;
        const { templateId, biddingAnonymousQuotesFlag, trialBiddingFlag } = header || {};

        if (!organizationId) {
          return;
        }

        return {
          url: `${SRM_SSRC}/v1/${organizationId}/bidding/unit/supplier/list`,
          method: 'POST',
          params: {
            ...(params || {}),
            customizeUnitCode,
          },
          data: { ...otherCommonProps, templateId, biddingAnonymousQuotesFlag, trialBiddingFlag },
        };
      },
    },
    events: {
      beforeLoad({ dataSet }) {
        // 加载前，清除缓存，解决倒计时不一致问题
        dataSet.clearCachedRecords();
      },
    },
  };
};

// 单价竞价-列表外层卡片
const unitPriceListDS = () => {
  return {
    autoQuery: false,
    primaryKey: 'rfxLineItemId',
    // paging: false,
    pageSize: 5,
    fields: [
      {
        // 物料编码
        name: 'itemCode',
      },
      {
        // 物料名称
        name: 'itemName',
      },
      {
        // 展示的物料，按照一定格式展示的
        name: 'displayItem',
      },
      {
        // 规格
        name: 'specs',
      },
      {
        // 起竞价
        name: 'startingBiddingPrice',
      },
      {
        // 报价幅度
        name: 'quotationRange',
      },
      {
        // 出价供应商数
        name: 'quotedSupplierCount',
      },
      {
        // 报价总次数
        name: 'quotationCount',
      },
      {
        // 物料分配给物料的总数
        name: 'assignedSupplierCount',
      },
      {
        // 最低价，竞价的时候展示
        name: 'minPrice',
      },
      {
        // 最高价，拍卖的时候展示
        name: 'maxPrice',
      },
      {
        name: 'openTab',
      },
      // 看ds中是否会有roundNumber 不写name
    ],
    events: {
      load: ({ dataSet }) => {
        if (!dataSet) {
          return;
        }
        const openTabList = dataSet.getState('openTabList') || [];

        dataSet.forEach((record = {}) => {
          const rfxLineItemId = record.get('rfxLineItemId') || {};
          if (openTabList.includes(rfxLineItemId)) {
            record.set('openTab', true);
          }
        });
      },
    },
    transport: {
      read: ({ data, params = {} }) => {
        const { commonProps = {}, header = {}, advanced, rules } = data;
        const { status, searchBarParams } = advanced || {};
        const { organizationId, customizeUnitCode, ...otherCommonProps } = commonProps;
        const { rankRule } = rules || {};

        if (!organizationId) {
          return;
        }

        let searchTag = {};
        if (!isEmpty(status)) {
          status.forEach((item) => {
            searchTag = { ...searchTag, [item]: 1 };
          });
        }

        const {
          biddingStatus,
          biddingRoundNumber,
          biddingPausedDate,
          biddingQuotationMethod,
          biddingType,
          trialBiddingFlag,
        } = header || {};

        return {
          url: `${SRM_SSRC}/v1/${organizationId}/bidding/unit/item/list`,
          method: 'POST',
          params: {
            ...(params || {}),
            customizeUnitCode,
            ...(searchBarParams || {}), // 筛选器查询参数
          },
          data: {
            ...otherCommonProps,
            ...searchTag,
            rankRule,
            biddingStatus,
            biddingType,
            trialBiddingFlag,
            biddingRoundNumber,
            biddingPausedDate: biddingStatus === 'BIDDING_PAUSED' ? biddingPausedDate : null,
            biddingQuotationMethod,
          },
        };
      },
    },
  };
};

// 单价竞价-物料详情排名表
const unitPriceRankTableDS = () => {
  return {
    autoQuery: false,
    primaryKey: 'rfxLineSupplierId',
    paging: false,
    selection: false,
    fields: [
      {
        label: intl.get('ssrc.biddingHall.model.biddingQuotationRank').d('排名'),
        name: 'biddingQuotationRank',
      },
      {
        label: intl.get('ssrc.biddingHall.model.trafficLightSigns').d('红绿灯标识'),
        name: 'trafficLight',
      },
      {
        label: intl.get('ssrc.biddingHall.model.supplierCompanyName').d('供应商名称'),
        name: 'displaySupplierName',
      },
      {
        label: intl.get('ssrc.biddingHall.model.priceCoefficientPrice').d('权重单价'),
        name: 'priceCoefficientPrice',
      },
      {
        label: intl.get('ssrc.biddingHall.model.priceCoefficientPrice').d('权重单价'),
        name: 'priceCoefficientNetPrice',
      },
      {
        label: intl.get('ssrc.biddingHall.model.validPrice').d('最新报价'),
        name: 'validNetSecondaryPrice',
      },
      {
        label: intl.get('ssrc.biddingHall.model.validPrice').d('最新报价'),
        name: 'validQuotationSecPrice',
      },
      {
        label: intl.get('ssrc.biddingHall.model.firstValidQuotationSecPrice').d('首次报价'),
        name: 'firstValidNetSecPrice',
      },
      {
        label: intl.get('ssrc.biddingHall.model.firstValidQuotationSecPrice').d('首次报价'),
        name: 'firstValidQuotationSecPrice',
      },
      {
        label: intl.get('ssrc.biddingHall.model.quotationCount').d('报价次数'),
        name: 'quotationCount',
      },
      {
        label: intl.get('ssrc.biddingHall.model.quotedDate').d('报价时间'),
        name: 'quotedDate',
        showType: 'dateTime',
      },
      {
        label: intl.get('ssrc.common.view.IP').d('IP'),
        name: 'supplierCompanyIp',
        help: intl
          .get('ssrc.common.view.ipOnlyReferenceWarning')
          .d('供应商报价/投标时，IP可通过使用代理服务等操作进行包装，此结果仅用于参考'),
        showHelp: 'tooltip',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.whetherIpCoincide`).d('IP是否重合'),
        name: 'whetherIpCoincide',
      },
      {
        label: intl.get('hzero.common.button.action').d('操作'),
        name: 'operate',
      },
    ],
    transport: {
      read: ({ data = {}, params = {} }) => {
        const { submitProps = {} } = data;
        const { organizationId, customizeUnitCode, ...otherCommonProps } = submitProps;

        if (!organizationId) {
          return;
        }

        return {
          url: `${SRM_SSRC}/v1/${organizationId}/bidding/unit/item/supplier-line`,
          method: 'POST',
          params: {
            ...(params || {}),
          },
          data: {
            ...otherCommonProps,
            queryLatestBiddingFlag: 0,
          },
        };
      },
    },
  };
};

// 单价竞价-竞价现场-物料表单
const unitPriceItemDataSet = (data = {}) => {
  const { biddingQuotationMethod } = data || {};

  return {
    autoQuery: false,
    paging: false,
    fields: [
      {
        label:
          biddingQuotationMethod === 'AUCTION'
            ? intl.get('ssrc.biddingHall.model.startingAuctionBiddingPrice').d('起拍价')
            : intl.get('ssrc.biddingHall.model.startingBiddingPrice').d('起竞价'),
        name: 'startingBiddingPrice',
      },
      {
        name: 'quotationRange',
        label: intl.get('ssrc.biddingHall.model.quotationRange').d('报价幅度'),
      },
      {
        name: 'quotedSupplierCount',
        label: intl.get('ssrc.biddingHall.model.BidStatus').d('出价情况'),
      },
      {
        name: 'quotationCount',
        label: intl.get('ssrc.biddingHall.view.title.numberOfBids').d('出价次数'),
      },
      {
        name: 'minPrice',
        type: 'number',
        label:
          biddingQuotationMethod === 'BIDDING'
            ? intl.get(`ssrc.inquiryHall.model.inquiryHall.minPrice`).d('最低价')
            : intl.get('ssrc.inquiryHall.model.inquiryHall.maxPrice').d('最高价'),
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
  };
};

export { unitPriceListDS, unitPriceRankTableDS, supplierListDS, unitPriceItemDataSet };
