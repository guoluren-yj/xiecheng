import intl from 'utils/intl';
import { SRM_SSRC } from '_utils/config';
import { isEmpty } from 'lodash';

// 总价竞价-标的物列表
const totalPriceItemListDS = () => {
  return {
    primaryKey: 'rfxLineItemId',
    autoQuery: false,
    paging: false,
    fields: [
      {
        name: 'itemName',
      },
      {
        name: 'rfxQuantity',
      },
      {
        name: 'secondaryQuantity',
      },
      {
        name: 'uomName',
      },
      {
        name: 'secondaryUomName',
      },
      {
        name: 'specs',
      },
    ],
    transport: {
      read: ({ data, params = {} }) => {
        const { commonProps = {} } = data;
        const { organizationId, customizeUnitCode, ...otherCommonProps } = commonProps || {};

        if (!organizationId) {
          return;
        }

        return {
          url: `${SRM_SSRC}/v1/${organizationId}/bidding/total/item/list`,
          method: 'POST',
          params: {
            ...(params || {}),
            customizeUnitCode,
          },
          data: { ...otherCommonProps },
        };
      },
    },
  };
};

// 总价竞价-供应商列表
const totalPriceSupplierListDS = () => {
  return {
    autoQuery: false,
    paging: false,
    selection: false,
    primaryKey: 'rfxLineSupplierId',
    fields: [
      {
        label: intl.get('ssrc.biddingHall.model.supplierCompanyName').d('供应商名称'),
        name: 'displaySupplierName',
      },
      {
        label: intl.get('ssrc.biddingHall.model.contact').d('联系人'),
        name: 'contactName',
      },
      {
        label: intl.get('ssrc.biddingHall.model.phoneNumber').d('联系人电话'),
        name: 'contactMobilephone',
      },
      {
        label: intl.get('ssrc.biddingHall.model.email').d('联系人邮箱'),
        name: 'contactMail',
      },
      {
        label: intl.get('ssrc.biddingHall.model.signInFlag').d('是否签到'),
        name: 'signInFlag',
      },
      // {
      //   label: intl.get('ssrc.biddingHall.model.priceCoefficient').d('报价权重'),
      //   name: 'priceCoefficient',
      // },
      {
        label: intl.get('ssrc.biddingHall.model.priceCoefficientAmount').d('权重报价'),
        name: 'priceCoefficientAmount',
      },
      {
        label: intl.get('ssrc.biddingHall.model.priceCoefficientAmount').d('权重报价'),
        name: 'priceCoefficientNetAmount',
      },
      {
        label: intl.get('ssrc.biddingHall.model.lastHistoryQtnTotalAmount').d('过程报价'),
        name: 'lastHistoryQtnTotalAmount',
      },
      {
        label: intl.get('ssrc.biddingHall.model.lastHistoryQtnTotalAmount').d('过程报价'),
        name: 'lastHistoryQtnNetAmount',
      },
      {
        label: intl.get('ssrc.biddingHall.model.validPrice').d('最新报价'),
        name: 'qtnNetAmount',
      },
      {
        label: intl.get('ssrc.biddingHall.model.validPrice').d('最新报价'),
        name: 'qtnTotalAmount',
      },
      {
        label: intl.get('ssrc.biddingHall.model.differenceAmount').d('差额'),
        name: 'differenceAmount',
      },
      {
        label: intl.get('ssrc.biddingHall.model.differenceAmount').d('差额'),
        name: 'differenceNetAmount',
      },
      {
        label: intl.get('ssrc.biddingHall.model.firstValidQuotationSecPrice').d('首次报价'),
        name: 'firstQtnNetAmount',
      },
      {
        label: intl.get('ssrc.biddingHall.model.firstValidQuotationSecPrice').d('首次报价'),
        name: 'firstQtnTotalAmount',
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
        label: intl.get('hzero.common.button.action').d('操作'),
        name: 'operate',
      },
    ],
    transport: {
      read: ({ data, params }) => {
        const { commonProps = {}, advanced, header, biddingRules } = data;
        const { status } = advanced || {};
        const { organizationId, customizeUnitCode, ...otherCommonProps } = commonProps || {};

        if (!organizationId) {
          return;
        }

        // biddingType 竞价类型
        const {
          biddingType,
          trialBiddingFlag,
          benchmarkPriceType,
          biddingQuotationMethod,
          biddingAnonymousQuotesFlag,
        } = header || {};

        const { rankRule } = biddingRules || {};

        let searchTag = {};
        if (!isEmpty(status)) {
          status.forEach((item) => {
            searchTag = { ...searchTag, [item]: 1 };
          });
        }

        return {
          url: `${SRM_SSRC}/v1/${organizationId}/bidding/total/supplier/list`,
          method: 'POST',
          params: {
            ...(params || {}),
            customizeUnitCode,
          },
          data: {
            ...otherCommonProps,
            ...searchTag,
            biddingType,
            trialBiddingFlag,
            benchmarkPriceType,
            biddingQuotationMethod,
            rankRule,
            biddingAnonymousQuotesFlag,
          },
        };
      },
    },
  };
};

// japan dutch round list
const japanDutchRoundListDS = () => {
  return {
    autoQuery: false,
    primaryKey: 'biddingRoundDateId',
    paging: false,
    queryFields: [
      {
        label: intl.get('hzero.common.status').d('状态'),
        name: 'biddingRoundStatusQueryParam',
        lookupCode: 'SSRC_BIDDING_ROUND_STATUS',
        multiple: true,
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.startTime`).d('开始时间'),
        name: 'quotationStartDate',
        type: 'dateTime',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.endTime`).d('结束时间'),
        name: 'quotationEndDate',
        type: 'dateTime',
      },
    ],
    fields: [],
    transport: {
      read: ({ data, params = {} }) => {
        const { commonProps = {}, header, advanced = {} } = data;
        const { organizationId, customizeUnitCode, ...otherCommonProps } = commonProps || {};
        const { templateId, biddingAnonymousQuotesFlag } = header || {};

        if (!organizationId) {
          return;
        }

        return {
          url: `${SRM_SSRC}/v1/${organizationId}/bidding/round-info/purchase`,
          method: 'POST',
          params: {
            ...(params || {}),
            customizeUnitCode,
          },
          data: {
            ...otherCommonProps,
            ...(advanced || {}),
            templateId,
            biddingAnonymousQuotesFlag,
          },
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

// 单价竞价-物料详情排名表
const japanDutchRoundTabletDS = () => {
  return {
    autoQuery: false,
    primaryKey: 'rfxLineSupplierId',
    paging: false,
    selection: false,
    fields: [
      {
        label: intl.get('ssrc.biddingHall.model.supplierCompanyName').d('供应商名称'),
        name: 'disSupplierCompanyName',
      },
      {
        name: 'supplierCompanyNum',
        type: 'string',
        label: intl.get('ssrc.inquiryHall.model.inquiryHall.supplierCompanyNum').d('供应商编码'),
      },
      {
        label: intl.get('ssrc.common.model.responseSituation').d('响应情况'),
        name: 'biddingRoundSupplierStatus',
        type: 'string',
      },
    ],
    transport: {
      read: ({ data = {}, params = {} }) => {
        const { tableProps = {} } = data;
        const { organizationId, customizeUnitCode, ...otherCommonProps } = tableProps || {};

        if (!organizationId) {
          return;
        }

        return {
          url: `${SRM_SSRC}/v1/${organizationId}/bidding/round-info/detail/purchase`,
          method: 'POST',
          params: {
            ...(params || {}),
          },
          data: {
            ...otherCommonProps,
          },
        };
      },
    },
  };
};

// round item af-extra form ds
const totalPriceSupplierListAFDataSet = () => {
  return {
    autoQuery: false,
    paging: false,
    fields: [
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.biddingRoundPrice`).d('叫价'),
        name: 'biddingRoundPrice',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.biddingRoundQuotedCount`).d('接受数'),
        name: 'displayBiddingRoundQuotedCount',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.startTime`).d('开始时间'),
        name: 'quotationStartDate',
        showType: 'dateTime',
      },
      {
        label: intl
          .get('ssrc.common.biddingHall.view.subtitle.theFinallyAcceptPrice')
          .d('最终接受价格'),
        name: 'acceptAmount',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.endTime`).d('结束时间'),
        name: 'quotationEndDate',
        showType: 'dateTime',
      },
    ],
  };
};

/**
 * 日式/荷兰 聚合表格ds
 * japan dutch round supplier list
 *
 * 竞价大厅 日/荷 共用一个src/routes/ssrc/BiddingHall/Purchase/page/MainContent/JAPANDUTCHAggregationTableList.js组件
 * 但是ds和数据是两套，如果有改动，需要共同查看
 *
 * 需要关注
 * src/routes/ssrc/BiddingHall/Purchase/stores/totalPriceDS.js
 * src/routes/ssrc/components/PriceComparison/store/tableDS.js
 *
 * 类似新核价聚合表，数据需要特殊处理
 *
 * biddingSupHeaderId 每行处理后的数据key,必须唯一
 * 目前取每层 list 的 index ， 比如'0-0' '1-0' '0',
 *
 * 供应商报价信息 biddingRoundSupplierInfoDTOList 每一轮次下所有供应商的数据
 * 多轮信息 biddingRoundInfoDTOList 表示每一轮次信息
 * index.js -》 handleRebuileAggregrationTableDataForDS 是数据处理打平逻辑
 *
 * 如果第一轮有三家供应商接受，那处理后的数据就是3条，
 *
 * 最后的数据结构需要和demo_data保持一致性
 *
 * demo_data
 * // data: [
    //   {
    //     biddingSupHeaderId: 1,
    //     biddingRoundNumber: 1,
    //     disSupplierCompanyName: 's1-中集安瑞科投资控股（深圳）有限公司',
    //     biddingRoundPrice: 1000,
    //     biddingRoundQuotedCount: 800,
    //     quotationEndDate: '2022-12-12 12:34:34',
    //     biddingRoundSupplierStatus: '0',
    //     biddingRoundSupplierStatusMeaning: 'no',
    //     acceptAmount: 999999999999.23322223,
    //   },
    //   {
    //     biddingSupHeaderId: 2,
    //     biddingRoundNumber: 2,
    //     disSupplierCompanyName: 's1-中集安瑞科投资控股（深圳）有限公司',
    //     biddingRoundPrice: 10,
    //     biddingRoundQuotedCount: 8,
    //     quotationEndDate: '2022-12-12 12:34:34',
    //     biddingRoundSupplierStatus: '1',
    //     biddingRoundSupplierStatusMeaning: 'yes',
    //     acceptAmount: 999999999999.23322223,
    //   },
    //   {
    //     biddingSupHeaderId: 3,
    //     biddingRoundNumber: 1,
    //     disSupplierCompanyName: 's2-上海甄云信息科技有限公司',
    //     biddingRoundPrice: 1000,
    //     biddingRoundQuotedCount: 800,
    //     quotationEndDate: '2022-12-12 12:34:34',
    //     biddingRoundSupplierStatus: '0',
    //     biddingRoundSupplierStatusMeaning: 'no',
    //     acceptAmount: 1112.23322223,
    //   },
    //   {
    //     biddingSupHeaderId: 4,
    //     biddingRoundNumber: 2,
    //     disSupplierCompanyName: 's2-上海甄云信息科技有限公司',
    //     biddingRoundPrice: 10,
    //     biddingRoundQuotedCount: 8,
    //     quotationEndDate: '2022-12-12 12:34:34',
    //     biddingRoundSupplierStatus: 'ACCEPTED',
    //     biddingRoundSupplierStatusMeaning: 'ACCEPTED',
    //     acceptAmount: 1112.23322223,
    //   },
    //   {
    //     biddingSupHeaderId: 5,
    //     biddingRoundNumber: 1,
    //     disSupplierCompanyName: 's3-hahahahahahahahahahahahahahahhahhahahhahahahahahhahhahahhah',
    //     biddingRoundPrice: 1000,
    //     biddingRoundQuotedCount: 800,
    //     quotationEndDate: '2022-12-12 12:34:34',
    //     biddingRoundSupplierStatus: '1',
    //     biddingRoundSupplierStatusMeaning: 'yes',
    //   },
    //   {
    //     biddingSupHeaderId: 6,
    //     biddingRoundNumber: 2,
    //     disSupplierCompanyName: 's3-hahahahahahahahahahahahahahahhahhahahhahahahahahhahhahahhah',
    //     biddingRoundPrice: 10,
    //     biddingRoundQuotedCount: 8,
    //     quotationEndDate: '2022-12-12 12:34:34',
    //     biddingRoundSupplierStatus: '1',
    //     biddingRoundSupplierStatusMeaning: 'yes',
    //   },
    // ],
 * */

const japanDutchAggregationTableDS = () => {
  return {
    autoQuery: false,
    primaryKey: 'biddingSupHeaderId',
    paging: false,
    selection: false,
    queryFields: [
      {
        label: intl.get('hzero.common.status').d('状态'),
        name: 'biddingRoundStatusQueryParam',
        lookupCode: 'SSRC_BIDDING_ROUND_STATUS',
        multiple: true,
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.startTime`).d('开始时间'),
        name: 'quotationStartDate',
        type: 'dateTime',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.endTime`).d('结束时间'),
        name: 'quotationEndDate',
        type: 'dateTime',
      },
    ],
    fields: [
      {
        name: 'disSupplierCompanyName',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.biddingRoundPrice`).d('叫价'),
        name: 'biddingRoundPrice',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.biddingRoundQuotedCount`).d('接受数'),
        name: 'displayBiddingRoundQuotedCount',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.startTime`).d('开始时间'),
        name: 'quotationStartDate',
        showType: 'dateTime',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.endTime`).d('结束时间'),
        name: 'quotationEndDate',
        showType: 'dateTime',
      },
      {
        name: 'biddingSupHeaderId',
      },
      {
        name: 'biddingRoundNumber',
      },
      {
        name: 'disSupplierCompanyName',
      },
      {
        label: intl.get('ssrc.common.model.responseSituation').d('响应情况'),
        name: 'biddingRoundSupplierStatus',
        type: 'string',
      },
      {
        name: 'acceptAmount',
        label: intl
          .get('ssrc.common.biddingHall.view.subtitle.theFinallyAcceptPrice')
          .d('最终接受价格'),
      },
      {
        name: 'supplementAmount',
        label: intl
          .get('ssrc.common.biddingHall.view.subtitle.supplementAmountPrice')
          .d('补充单价金额'),
      },
    ],
    transport: {
      read: ({ data = {}, params = {} }) => {
        const { commonProps = {}, advanced = {} } = data;
        const { organizationId, customizeUnitCode, ...otherCommonProps } = commonProps || {};

        if (!organizationId) {
          return;
        }

        const url = `${SRM_SSRC}/v1/${organizationId}/bidding/round-info/all-detail/purchase`;

        return {
          url,
          method: 'POST',
          params: {
            ...(params || {}),
            customizeUnitCode,
          },
          data: {
            ...otherCommonProps,
            ...(advanced || {}),
          },
        };
      },
    },
  };
};

export {
  totalPriceItemListDS,
  totalPriceSupplierListDS,
  japanDutchRoundListDS,
  japanDutchAggregationTableDS,
  japanDutchRoundTabletDS,
  totalPriceSupplierListAFDataSet,
};
