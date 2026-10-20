import moment from 'moment';
import { isNil, isFunction } from 'lodash';

import { DEFAULT_DATE_FORMAT } from 'utils/constants';
import intl from 'utils/intl';
import { SRM_SSRC, PRIVATE_BUCKET } from '_utils/config';

import { ChunkUploadProps } from '@/utils/SsrcRegx';
import {
  getQuantityAndUomCombine,
  getAvailableQtyName,
  getValidPriceName,
  getValidNetPriceName,
  getTooltipsName,
  getPriceName,
  getNetPriceName,
} from '@/utils/utils';
import { NumberMin, NumberMax } from '@/utils/constants';

const priceTitle = (auctionDirection = null) => {
  let currentTitle = null;
  if (auctionDirection === 'FORWARD') {
    currentTitle = intl
      .get('ssrc.common.title.forwardDirectionPriceTitleExplain')
      .d('采购方要求本单报价方向为英式，每次报价需高于上次报价');
  }
  if (auctionDirection === 'REVERSE') {
    // 荷兰
    currentTitle = intl
      .get('ssrc.common.title.reverseDirectionPriceTitleExplain')
      .d('采购方要求本单报价方向为荷兰式，每次报价需低于上次报价');
  }

  return currentTitle;
};

// 上轮有效报价的气泡提示
const doubleUnitTooltip = ({ doubleUnitFlag, title }) => {
  return doubleUnitFlag ? title : null;
};

const quotationLineDataSet = (options = {}) => {
  const { quotationName, basicFormDS } = options || {};

  const getAllPageDisabled = (ds) => {
    let flag = false;
    if (!ds) {
      return flag;
    }

    flag = ds.getState('allPageDisabled');
    return flag;
  };

  // require
  const commonRequired = (record = {}, ds) => {
    const {
      abandonedFlag,
      bargainFlag,
      eliminateFlag,
      displayQuotationLineStatus,
      bargainStatus,
      continuousQuotationFlag,
      headerBargainFlag,
      currentDateTime,
      rfxHeaderQuotationEndDate,
    } = record.get([
      'abandonedFlag',
      'bargainFlag', // 议价/还价都为1
      'eliminateFlag',
      'displayQuotationLineStatus',
      'bargainStatus',
      'continuousQuotationFlag',
      'headerBargainFlag',
      'currentDateTime',
      'rfxHeaderQuotationEndDate',
    ]);
    const allPageDisabled = getAllPageDisabled(ds);

    const statusResult =
      displayQuotationLineStatus !== 'NOT_START' &&
      displayQuotationLineStatus !== 'ABANDONED' &&
      displayQuotationLineStatus !== 'FINISHED';
    const continueResult =
      continuousQuotationFlag ||
      (!continuousQuotationFlag && displayQuotationLineStatus !== 'SUBMITTED');
    const bargainResult =
      headerBargainFlag === 1 &&
      bargainStatus === 'BARGAINING_ONLINE' &&
      currentDateTime < rfxHeaderQuotationEndDate &&
      bargainFlag !== 1;

    const baseResult =
      !abandonedFlag &&
      !eliminateFlag &&
      statusResult &&
      continueResult &&
      !bargainResult &&
      !allPageDisabled;

    // if (bargainFlag === 1) {
    //   // 还价
    //   return baseResult;
    // }

    return baseResult;
  };

  // disable
  const commonDisabled = (record, ds) => {
    const {
      abandonedFlag,
      bargainFlag,
      eliminateFlag,
      displayQuotationLineStatus,
      bargainStatus,
      continuousQuotationFlag,
      headerBargainFlag,
    } = record.get([
      'abandonedFlag',
      'bargainFlag',
      'eliminateFlag',
      'displayQuotationLineStatus',
      'bargainStatus',
      'continuousQuotationFlag',
      'headerBargainFlag',
    ]);
    const allPageDisabled = getAllPageDisabled(ds);

    const statusResult =
      displayQuotationLineStatus === 'NOT_START' ||
      displayQuotationLineStatus === 'ABANDONED' ||
      displayQuotationLineStatus === 'FINISHED';
    const continueResult =
      continuousQuotationFlag !== 1 && displayQuotationLineStatus === 'SUBMITTED';
    const bargainResult =
      bargainFlag !== 1 && headerBargainFlag === 1 && bargainStatus === 'BARGAINING_ONLINE';

    const baseResult =
      abandonedFlag ||
      eliminateFlag ||
      statusResult ||
      continueResult ||
      bargainResult ||
      allPageDisabled;

    return baseResult;
  };

  return {
    autoQuery: false,
    primaryKey: 'quotationLineCurrentId',
    cacheSelection: true,
    selection: 'multiple',
    pageSize: 20,
    fields: [
      {
        label: intl.get(`ssrc.supplierQuotation.model.supQuo.lineNo`).d('行号'),
        name: 'lineNumGroup',
      },
      {
        name: 'rfxLineItemNum',
        label: intl.get(`ssrc.supplierQuotation.model.supQuo.lineNo`).d('行号'),
        disabled: true,
      },

      {
        name: 'statusGroup',
        label: intl.get('hzero.common.status').d('状态'),
      },
      {
        label: intl
          .get(`ssrc.supplierQuotation.model.supQuo.commonQuotationStatus`, { quotationName })
          .d('{quotationName}状态'),
        name: 'displayQuotationLineStatus',
        disabled: true,
      },

      // group
      {
        label: intl.get(`ssrc.common.biddingRanking`).d('竞价排名'),
        name: 'biddingRankingGroup',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.scoreRank`).d('排名'),
        name: 'rank',
        disabled: true,
      },

      // item detail group
      {
        label: intl.get('ssrc.rf.view.card.subtitle.itemInfo').d('物料信息'),
        name: 'itemInfo',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.itemName`).d('物料描述'),
        name: 'itemName',
        disabled: true,
      },
      {
        label: intl.get('ssrc.common.quantityAndUomCombine').d('数量-单位'),
        name: 'secondaryQuantityAndUomCombine',
        disabled: true,
      },
      {
        // label: getQuantityAndUomCombine(doubleUnitFlag),
        name: 'quantityAndUomCombine',
        dynamicProps: {
          label({ dataSet }) {
            const doubleUnitFlag = dataSet.getState('doubleUnitFlag');
            return getQuantityAndUomCombine(doubleUnitFlag);
          },
        },
        disabled: true,
      },
      // {
      //   label: intl.get(`ssrc.supplierQuotation.model.supQuo.unit`).d('单位'),
      //   name: 'uomName',
      // },
      // {
      //   label: intl.get(`ssrc.supplierQuotation.model.supQuo.rfxQuantity`).d('需求数量'),
      //   name: 'rfxQuantity',
      // },
      {
        label: intl.get(`ssrc.supplierQuotation.model.supQuo.demandDate`).d('需求日期'),
        name: 'demandDate',
        type: 'date',
        disabled: true,
      },
      {
        label: intl.get(`ssrc.supplierQuotation.model.supQuo.specs`).d('规格'),
        name: 'specs',
        disabled: true,
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.purchaseAttachment`).d('采购方附件'),
        // label: intl.get(`ssrc.supplierQuotation.model.supQuo.commonInquiryAttachment`, { documentTypeName, }).d('{documentTypeName}附件'),
        bucketName: PRIVATE_BUCKET,
        bucketDirectory: 'ssrc-rfx-rfxitem',
        name: 'rfxAttachmentUuid',
        type: 'attachment',
        readOnly: true,
      },

      // group RFA INFO
      {
        label: intl.get(`ssrc.common.biddingOfferInfo`).d('竞价信息'),
        name: 'biddingOfferInfoGroup',
      },
      {
        label: intl.get('ssrc.common.startTime').d('开始时间'),
        name: 'quotationStartDate',
        disabled: true,
        showType: 'dateTime',
      },
      {
        label: intl.get(`ssrc.supplierQuotation.model.supQuo.quotationsEndDate`).d('结束时间'),
        name: 'quotationEndDate',
        disabled: true,
        showType: 'dateTime',
      },
      {
        label: intl.get('ssrc.common.timerCountDown').d('倒计时'),
        name: 'countDown',
      },
      { name: 'currentDateTime', disabled: true },

      // group - bargain info
      {
        label: intl.get(`ssrc.common.bargainInfo`).d('还价信息'),
        name: 'bargainInfoGroup',
      },
      {
        label: intl.get(`ssrc.supplierQuotation.model.supQuo.validBargainPrice`).d('还价-单价'),
        name: 'validBargainPrice',
        dynamicProps: {
          help({ dataSet }) {
            const doubleUnitFlag = dataSet.getState('doubleUnitFlag');
            return doubleUnitTooltip({
              doubleUnitFlag,
              title: intl
                .get(`ssrc.supplierQuotation.model.supQuo.validBargainPriceAuxiliary`)
                .d('辅助单位对应的还价单价'),
            });
          },
        },
        disabled: true,
      },
      {
        label: intl.get(`ssrc.supplierQuotation.model.supQuo.counterOfferReason`).d('还价理由'),
        name: 'validBargainRemark',
        disabled: true,
      },
      {
        label: intl.get(`ssrc.supplierQuotation.model.supQuo.bargainer`).d('还价人'),
        name: 'bargainName',
        disabled: true,
      },

      // group round quotation info
      {
        label: intl.get(`ssrc.common.roundQuotationInfo`).d('多轮报价信息'),
        name: 'roundQuotationInfoGroup',
      },
      {
        label: intl.get(`ssrc.supplierQuotation.model.supQuo.lastRank`).d('上一轮排名'),
        name: 'autoRoundRank',
        disabled: true,
      },
      {
        label: intl
          .get('ssrc.supplierQuotation.model.supQuo.lastValidTaxQuotationPrice')
          .d('上轮有效报价(含税)'),
        name: 'lastQuotationPrice',
        dynamicProps: {
          help({ dataSet }) {
            const doubleUnitFlag = dataSet.getState('doubleUnitFlag');
            return doubleUnitTooltip({
              doubleUnitFlag,
              title: intl
                .get('ssrc.supplierQuotation.model.supQuo.lastValidTaxQuotationPriceAuxiliary')
                .d('辅助单位对应的上轮有效报价(含税)'),
            });
          },
        },
        disabled: true,
      },
      {
        label: intl
          .get('ssrc.supplierQuotation.model.supQuo.lastValidUnTaxQuotationPrice')
          .d('上轮有效报价(不含税)'),
        name: 'lastValidNetPrice',
        dynamicProps: {
          help({ dataSet }) {
            const doubleUnitFlag = dataSet.getState('doubleUnitFlag');
            return doubleUnitTooltip({
              doubleUnitFlag,
              title: intl
                .get('ssrc.supplierQuotation.model.supQuo.lastValidUnTaxQuotationPriceAuxiliary')
                .d('辅助单位对应的上轮有效报价(不含税)'),
            });
          },
        },
        disabled: true,
      },

      // group quotation info
      {
        label: intl.get(`ssrc.supplierQuotation.view.quotationInfo`).d('报价基本信息'),
        name: 'quotationInfo',
      },
      {
        label: intl.get(`ssrc.supplierQuotation.view.message.giveUp`).d('放弃'),
        name: 'abandonedFlag',
        type: 'boolean',
        trueValue: 1,
        falseValue: 0,
        dynamicProps: {
          disabled({ dataSet, record }) {
            const {
              quotationScope,
              quotationLineStatus,
              eliminateFlag,
              bargainFlag,
              headerBargainFlag,
              bargainStatus,
              displayQuotationLineStatus,
              continuousQuotationFlag,
            } = record.get([
              'quotationScope',
              'quotationLineStatus',
              'eliminateFlag',
              'bargainFlag',
              'headerBargainFlag',
              'bargainStatus',
              'displayQuotationLineStatus',
              'continuousQuotationFlag',
            ]);
            const allPageDisabled = getAllPageDisabled(dataSet);

            const statusResult =
              displayQuotationLineStatus === 'NOT_START' ||
              displayQuotationLineStatus === 'ABANDONED' ||
              displayQuotationLineStatus === 'FINISHED';
            const continueResult =
              continuousQuotationFlag !== 1 && displayQuotationLineStatus === 'SUBMITTED';
            const bargainResult =
              bargainFlag !== 1 && headerBargainFlag === 1 && bargainStatus === 'BARGAINING_ONLINE';

            const Result =
              statusResult ||
              continueResult ||
              quotationScope === 'ALL_QUOTATION' ||
              eliminateFlag ||
              quotationLineStatus === 'ABANDONED' ||
              bargainResult ||
              allPageDisabled;
            return Result;
          },
        },
      },
      {
        label: intl.get(`ssrc.supplierQuotation.model.supQuo.availableQuantity`).d('可供数量'),
        name: 'currentQuotationSecQuantity',
        type: 'number',
        max: '999999999999999999999',
        dynamicProps: {
          required({ dataSet, record }) {
            const systemVersion = basicFormDS?.current
              ? basicFormDS.current?.get('systemVersion')
              : null;
            const doubleUnitFlag = dataSet.getState('doubleUnitFlag');
            const { quantityChangeFlag } = record.get(['quantityChangeFlag']);
            const RequiredFlag = commonRequired(record, dataSet);
            const Result = quantityChangeFlag === 1 && RequiredFlag;
            if (Number(systemVersion) === 2) {
              // systemVersion代表此单子走的新模板 新模板取消quantityChangeFlag控制
              return doubleUnitFlag && RequiredFlag;
            }
            return doubleUnitFlag && Result;
          },
          disabled({ dataSet, record }) {
            const systemVersion = basicFormDS?.current
              ? basicFormDS.current?.get('systemVersion')
              : null;
            const { quantityChangeFlag } = record.get(['quantityChangeFlag']);
            const DisabledFlag = commonDisabled(record, dataSet);
            const Result = !quantityChangeFlag || DisabledFlag;
            if (Number(systemVersion) === 2) {
              // systemVersion代表此单子走的新模板 新模板取消quantityChangeFlag控制
              return DisabledFlag;
            }
            return Result;
          },
        },
      },
      {
        name: 'currentQuotationQuantity',
        type: 'number',
        max: '999999999999999999999',
        dynamicProps: {
          required({ dataSet, record }) {
            const systemVersion = basicFormDS?.current
              ? basicFormDS.current?.get('systemVersion')
              : null;
            const doubleUnitFlag = dataSet.getState('doubleUnitFlag');
            const { quantityChangeFlag } = record.get(['quantityChangeFlag']);
            const RequiredFlag = commonRequired(record, dataSet);
            const Result = quantityChangeFlag === 1 && RequiredFlag;
            if (Number(systemVersion) === 2) {
              // systemVersion代表此单子走的新模板 新模板取消quantityChangeFlag控制
              return !doubleUnitFlag && RequiredFlag;
            }
            return !doubleUnitFlag && Result;
          },
          disabled({ dataSet, record }) {
            const systemVersion = basicFormDS?.current
              ? basicFormDS.current?.get('systemVersion')
              : null;
            const doubleUnitFlag = dataSet.getState('doubleUnitFlag');
            const { quantityChangeFlag } = record.get(['quantityChangeFlag']);
            const DisabledFlag = commonDisabled(record, dataSet);
            const Result = !quantityChangeFlag || DisabledFlag;
            if (Number(systemVersion) === 2) {
              // systemVersion代表此单子走的新模板 新模板取消quantityChangeFlag控制
              return doubleUnitFlag || DisabledFlag;
            }
            return doubleUnitFlag || Result;
          },
          label({ dataSet }) {
            const doubleUnitFlag = dataSet.getState('doubleUnitFlag');
            return getAvailableQtyName(doubleUnitFlag);
          },
        },
      },
      {
        label: intl.get(`ssrc.supplierQuotation.model.supQuo.priceQuantity`).d('价格批量'),
        help: intl
          .get('ssrc.supplierQuotation.model.supQuo.priceQuantityExplainHelp')
          .d(
            '一个单位包含多少个货品;例如以"袋"为单位的螺丝里,一袋有20个螺丝,价格批量即为20,用以价格库等地方计算"每一单价"，即"单价"除以"价格批量"'
          ),
        name: 'priceBatchQuantity',
        disabled: true,
      },
      {
        label: intl.get(`ssrc.supplierQuotation.model.supQuo.ladderInquiryFlag`).d('启用阶梯报价'),
        name: 'ladderInquiryFlag',
        type: 'boolean',
        trueValue: 1,
        falseValue: 0,
        dynamicProps: {
          disabled({ record }) {
            const { diyLadderQuotationFlag, eliminateRoundNumber, abandonedFlag } = record.get([
              'diyLadderQuotationFlag',
              'eliminateRoundNumber',
              'abandonedFlag',
            ]);
            const DisabledFlag = commonDisabled(record);
            const Result =
              DisabledFlag ||
              diyLadderQuotationFlag === 0 ||
              eliminateRoundNumber ||
              abandonedFlag === 1;
            return Result;
          },
        },
      },
      {
        label: intl.get(`ssrc.supplierQuotation.view.message.button.ladderLevel`).d('阶梯报价'),
        name: 'ladderLevel',
        disabled: true,
      },
      {
        label: intl.get(`ssrc.supplierQuotation.model.supQuo.quotationDetails`).d('报价明细'),
        name: 'priceDetail',
        disabled: true,
      },

      // group valid price amount
      {
        name: 'quotationInfoValidGroup',
        label: intl.get('ssrc.inquiryHall.model.inquiryHall.acceptInfor').d('中标信息'),
      },
      {
        label: intl
          .get(`ssrc.supplierQuotation.model.supQuo.validLadderTaxPrice`)
          .d('有效含税报价'),
        help: intl.get('ssrc.common.previewSubmitValidPrice').d('上一次提交的有效单价'),
        name: 'validQuotationSecPrice',
        type: 'number',
      },
      {
        label: intl
          .get(`ssrc.supplierQuotation.model.supQuo.validUnTaxQuotationPrice`)
          .d('有效报价(不含税)'),
        help: intl.get('ssrc.common.previewSubmitValidPrice').d('上一次提交的有效单价'),
        name: 'validNetSecondaryPrice',
        type: 'number',
      },
      {
        name: 'validQuotationPrice',
        type: 'number',
        dynamicProps: {
          label({ dataSet }) {
            const doubleUnitFlag = dataSet.getState('doubleUnitFlag');
            return getValidPriceName(doubleUnitFlag);
          },
          help({ dataSet }) {
            const doubleUnitFlag = dataSet.getState('doubleUnitFlag');
            return getTooltipsName(doubleUnitFlag);
          },
        },
      },
      {
        name: 'validNetPrice',
        type: 'number',
        dynamicProps: {
          label({ dataSet }) {
            const doubleUnitFlag = dataSet.getState('doubleUnitFlag');
            return getValidNetPriceName(doubleUnitFlag);
          },
          help({ dataSet }) {
            const doubleUnitFlag = dataSet.getState('doubleUnitFlag');
            return getTooltipsName(doubleUnitFlag);
          },
        },
      },
      {
        label: intl.get(`ssrc.supplierQuotation.model.supQuo.taxQuotationAmount`).d('行金额(含税)'),
        name: 'currentLnTotalAmount',
        type: 'number',
        dynamicProps: {
          // label({ dataSet }) {
          //   const header = dataSet.getState('header') || {};
          //   const { priceTypeCode } = header || {};
          //   const isUnTaxPriceFlag = priceTypeCode && priceTypeCode === 'NET_PRICE';
          //   const text = !isUnTaxPriceFlag
          //     ? intl
          //         .get('ssrc.common.netPriceCalcMethodExplain')
          //         .d('【行金额(含税)= 行金额(不含税)+税额；税额=行金额(不含税)*税率】')
          //     : intl
          //         .get('ssrc.common.taxPriceCalcMethodExplain')
          //         .d('【行金额(含税)=单价(含税)*数量/价格批量】');
          //   return (
          //     <Tooltip title={text}>
          //       {intl
          //         .get(`ssrc.supplierQuotation.model.supQuo.taxQuotationAmount`)
          //         .d('行金额(含税)')}
          //     </Tooltip>
          //   );
          // },
        },
        disabled: true,
      },
      {
        label: intl
          .get(`ssrc.inquiryHall.model.inquiryHall.lineAmountWithoutTax`)
          .d('行金额(不含税)'),
        name: 'currentLnNetAmount',
        type: 'number',
        dynamicProps: {
          // label({ dataSet }) {
          //   const header = dataSet.getState('header') || {};
          //   const { priceTypeCode } = header || {};
          //   const isUnTaxPriceFlag = priceTypeCode && priceTypeCode === 'NET_PRICE';
          //   const text = isUnTaxPriceFlag
          //     ? intl
          //         .get('ssrc.common.netAmountCalcMethodExplain')
          //         .d('【行金额(不含税)=单价(不含税)*数量/价格批量】')
          //     : intl
          //         .get('ssrc.common.taxAmountCalcMethodExplain')
          //         .d('【行金额(不含税)= 行金额(含税)-税额；税额=[行金额(含税)/(1+税率)]*税率】');
          //   return (
          //     <Tooltip title={text}>
          //       {intl
          //         .get(`ssrc.inquiryHall.model.inquiryHall.lineAmountWithoutTax`)
          //         .d('行金额(不含税)')}
          //     </Tooltip>
          //   );
          // },
        },
        disabled: true,
      },

      // price group
      {
        label: intl.get('ssrc.common.unitPrice').d('单价'),
        name: 'priceInfo',
      },
      {
        label: intl.get(`ssrc.supplierQuotation.model.supQuo.unitPriceTax`).d('单价(含税)'),
        name: 'currentQuotationSecPrice',
        type: 'number',
        // max: '999999999999999999999',
        dynamicProps: {
          help({ dataSet }) {
            // const doubleUnitFlag = dataSet.getState('doubleUnitFlag');
            const header = dataSet.getState('header') || {};
            const { auctionDirection } = header || {};

            return priceTitle(auctionDirection);
          },
          max({ dataSet, record }) {
            const currentField = record.getField('currentQuotationSecPrice');
            if (!currentField) {
              return null;
            }
            const disabledFlag = currentField?.get('disabled');
            const readOnlyFlag = currentField?.get('readOnly');
            if (disabledFlag || readOnlyFlag) {
              return null;
            }

            const doubleUnitFlag = dataSet.getState('doubleUnitFlag');
            const maxPrice = record.get('maxLimitPrice');

            const flag = doubleUnitFlag && !isNil(maxPrice) ? maxPrice : NumberMax;
            return flag;
          },
          min({ dataSet, record }) {
            const currentField = record.getField('currentQuotationSecPrice');
            if (!currentField) {
              return null;
            }
            const disabledFlag = currentField?.get('disabled');
            const readOnlyFlag = currentField?.get('readOnly');
            if (disabledFlag || readOnlyFlag) {
              return null;
            }

            const doubleUnitFlag = dataSet.getState('doubleUnitFlag');
            const minPrice = record.get('minLimitPrice');

            const flag = doubleUnitFlag && !isNil(minPrice) ? minPrice : NumberMin;
            return flag;
          },
          required({ dataSet, record }) {
            const doubleUnitFlag = dataSet.getState('doubleUnitFlag');
            const header = dataSet.getState('header') || {};
            const { priceTypeCode } = header || {};
            const { ladderQuotationFlag, ladderInquiryFlag } = record.get([
              'ladderQuotationFlag',
              'ladderInquiryFlag',
            ]);

            const isUnTaxPriceFlag = priceTypeCode && priceTypeCode === 'NET_PRICE';
            const RequiredFlag = commonRequired(record, dataSet);
            const ladderFlag =
              ladderInquiryFlag !== 1 || (ladderInquiryFlag === 1 && ladderQuotationFlag !== 1); // 当前价格是否在阶梯报价区间内

            const Result = !isUnTaxPriceFlag && RequiredFlag && ladderFlag && doubleUnitFlag;

            return Result;
          },
          disabled({ dataSet, record }) {
            const doubleUnitFlag = dataSet.getState('doubleUnitFlag');
            const header = dataSet.getState('header') || {};
            const { priceTypeCode } = header || {};
            const { ladderQuotationFlag, ladderInquiryFlag } = record.get([
              'ladderQuotationFlag',
              'ladderInquiryFlag',
            ]);

            const isUnTaxPriceFlag = priceTypeCode && priceTypeCode === 'NET_PRICE';
            const DisabledFlag = commonDisabled(record, dataSet);
            const ladderFlag = ladderInquiryFlag === 1 && ladderQuotationFlag === 1; // 当前价格是否在阶梯报价区间内

            const Result = DisabledFlag || isUnTaxPriceFlag || ladderFlag || !doubleUnitFlag;

            return Result;
          },
        },
      },
      {
        label: intl.get(`ssrc.supplierQuotation.model.supQuo.netPrice`).d('单价(不含税)'),
        name: 'netSecondaryPrice',
        type: 'number',
        dynamicProps: {
          help({ dataSet }) {
            // const doubleUnitFlag = dataSet.getState('doubleUnitFlag');
            const header = dataSet.getState('header') || {};
            const { auctionDirection } = header || {};

            return priceTitle(auctionDirection);
          },
          max({ dataSet, record }) {
            const currentField = record.getField('netSecondaryPrice');
            if (!currentField) {
              return null;
            }
            const disabledFlag = currentField?.get('disabled');
            const readOnlyFlag = currentField?.get('readOnly');
            if (disabledFlag || readOnlyFlag) {
              return null;
            }

            const doubleUnitFlag = dataSet.getState('doubleUnitFlag');
            const maxPrice = record.get('maxLimitPrice');
            const flag = doubleUnitFlag && !isNil(maxPrice) ? maxPrice : NumberMax;
            return flag;
          },
          min({ dataSet, record }) {
            const currentField = record.getField('netSecondaryPrice');
            if (!currentField) {
              return null;
            }
            const disabledFlag = currentField?.get('disabled');
            const readOnlyFlag = currentField?.get('readOnly');
            if (disabledFlag || readOnlyFlag) {
              return null;
            }

            const doubleUnitFlag = dataSet.getState('doubleUnitFlag');
            const minPrice = record.get('minLimitPrice');

            const flag = doubleUnitFlag && !isNil(minPrice) ? minPrice : NumberMin;
            return flag;
          },
          required({ dataSet, record }) {
            const doubleUnitFlag = dataSet.getState('doubleUnitFlag');
            const header = dataSet.getState('header') || {};
            const { priceTypeCode } = header || {};
            const { ladderQuotationFlag, ladderInquiryFlag } = record.get([
              'ladderQuotationFlag',
              'ladderInquiryFlag',
            ]);

            const isUnTaxPriceFlag = priceTypeCode && priceTypeCode === 'NET_PRICE';
            const RequiredFlag = commonRequired(record, dataSet);
            const ladderFlag =
              ladderInquiryFlag !== 1 || (ladderInquiryFlag === 1 && ladderQuotationFlag !== 1); // 当前价格是否在阶梯报价区间内

            const Result = RequiredFlag && isUnTaxPriceFlag && ladderFlag && doubleUnitFlag;

            return Result;
          },
          disabled({ dataSet, record }) {
            const doubleUnitFlag = dataSet.getState('doubleUnitFlag');
            const header = dataSet.getState('header') || {};
            const { priceTypeCode } = header || {};
            const { ladderQuotationFlag, ladderInquiryFlag } = record.get([
              'ladderQuotationFlag',
              'ladderInquiryFlag',
            ]);

            const isUnTaxPriceFlag = priceTypeCode && priceTypeCode === 'NET_PRICE';
            const DisabledFlag = commonDisabled(record, dataSet);
            const ladderFlag = ladderInquiryFlag === 1 && ladderQuotationFlag === 1;

            const Result = DisabledFlag || !isUnTaxPriceFlag || ladderFlag || !doubleUnitFlag;

            return Result;
          },
        },
      },
      {
        // label: intl.get(`ssrc.common.model.supQuo.basicUnitPriceTax`).d('基本单价(含税)'),
        name: 'currentQuotationPrice',
        type: 'number',
        // max: '999999999999999999999',
        dynamicProps: {
          label({ dataSet }) {
            const doubleUnitFlag = dataSet.getState('doubleUnitFlag');
            return getPriceName(doubleUnitFlag);
          },
          help({ dataSet }) {
            const header = dataSet.getState('header') || {};
            const { auctionDirection } = header || {};
            return priceTitle(auctionDirection);
          },
          max({ dataSet, record }) {
            const currentField = record.getField('currentQuotationPrice');
            if (!currentField) {
              return null;
            }
            const disabledFlag = currentField?.get('disabled');
            const readOnlyFlag = currentField?.get('readOnly');
            if (disabledFlag || readOnlyFlag) {
              return null;
            }

            const doubleUnitFlag = dataSet.getState('doubleUnitFlag');
            const maxPrice = record.get('maxLimitPrice');

            const flag = !doubleUnitFlag && !isNil(maxPrice) ? maxPrice : NumberMax;
            return flag;
          },
          min({ dataSet, record }) {
            const currentField = record.getField('currentQuotationPrice');
            if (!currentField) {
              return null;
            }
            const disabledFlag = currentField?.get('disabled');
            const readOnlyFlag = currentField?.get('readOnly');
            if (disabledFlag || readOnlyFlag) {
              return null;
            }

            const doubleUnitFlag = dataSet.getState('doubleUnitFlag');
            const minPrice = record.get('minLimitPrice');

            const flag = !doubleUnitFlag && !isNil(minPrice) ? minPrice : NumberMin;
            return flag;
          },
          required({ dataSet, record }) {
            const doubleUnitFlag = dataSet.getState('doubleUnitFlag');
            const header = dataSet.getState('header') || {};
            const { priceTypeCode, quotationStatus, quotationChange } = header || {};
            const isUnTaxPriceFlag = priceTypeCode && priceTypeCode === 'NET_PRICE';
            const RequiredFlag = commonRequired(record, dataSet);
            const { ladderQuotationFlag, ladderInquiryFlag } = record.get([
              'ladderQuotationFlag',
              'ladderInquiryFlag',
            ]);

            const Result =
              !isUnTaxPriceFlag &&
              RequiredFlag &&
              !(quotationStatus !== 'NEW' && quotationChange === 'ORDER');

            const ladderFlag =
              ladderInquiryFlag !== 1 || (ladderInquiryFlag === 1 && ladderQuotationFlag !== 1); // 当前价格是否在阶梯报价区间内

            return !doubleUnitFlag && Result && ladderFlag;
          },
          disabled({ dataSet, record }) {
            const doubleUnitFlag = dataSet.getState('doubleUnitFlag');
            const header = dataSet.getState('header') || {};
            const { priceTypeCode, quotationStatus, quotationChange } = header || {};
            const isUnTaxPriceFlag = priceTypeCode && priceTypeCode === 'NET_PRICE';
            const DisabledFlag = commonDisabled(record, dataSet);
            const { ladderQuotationFlag, ladderInquiryFlag } = record.get([
              'ladderQuotationFlag',
              'ladderInquiryFlag',
            ]);

            const Result =
              DisabledFlag ||
              isUnTaxPriceFlag ||
              (quotationStatus !== 'NEW' && quotationChange === 'ORDER') ||
              (ladderInquiryFlag === 1 && ladderQuotationFlag === 1); // 当前价格是否在阶梯报价区间内

            return doubleUnitFlag || Result;
          },
        },
      },
      {
        // label: intl.get(`ssrc.common.model.supQuo.basicNetPrice`).d('基本单价(不含税)'),
        name: 'netPrice',
        type: 'number',
        dynamicProps: {
          label({ dataSet }) {
            const doubleUnitFlag = dataSet.getState('doubleUnitFlag');
            return getNetPriceName(doubleUnitFlag);
          },
          help({ dataSet }) {
            const header = dataSet.getState('header') || {};
            const { auctionDirection } = header || {};
            return priceTitle(auctionDirection);
          },
          max({ dataSet, record }) {
            const currentField = record.getField('netPrice');
            if (!currentField) {
              return null;
            }
            const disabledFlag = currentField?.get('disabled');
            const readOnlyFlag = currentField?.get('readOnly');
            if (disabledFlag || readOnlyFlag) {
              return null;
            }

            const doubleUnitFlag = dataSet.getState('doubleUnitFlag');
            const maxPrice = record.get('maxLimitPrice');

            const flag = !doubleUnitFlag && !isNil(maxPrice) ? maxPrice : NumberMax;
            return flag;
          },
          min({ dataSet, record }) {
            const currentField = record.getField('netPrice');
            if (!currentField) {
              return null;
            }
            const disabledFlag = currentField?.get('disabled');
            const readOnlyFlag = currentField?.get('readOnly');
            if (disabledFlag || readOnlyFlag) {
              return null;
            }

            const doubleUnitFlag = dataSet.getState('doubleUnitFlag');
            const minPrice = record.get('minLimitPrice');

            const flag = !doubleUnitFlag && !isNil(minPrice) ? minPrice : NumberMin;
            return flag;
          },
          required({ dataSet, record }) {
            const doubleUnitFlag = dataSet.getState('doubleUnitFlag');
            const header = dataSet.getState('header') || {};
            const { priceTypeCode, quotationStatus, quotationChange } = header || {};
            const isUnTaxPriceFlag = priceTypeCode && priceTypeCode === 'NET_PRICE';
            const RequiredFlag = commonRequired(record, dataSet);
            const { ladderQuotationFlag, ladderInquiryFlag } = record.get([
              'ladderQuotationFlag',
              'ladderInquiryFlag',
            ]);

            const Result =
              RequiredFlag &&
              isUnTaxPriceFlag &&
              !(quotationStatus !== 'NEW' && quotationChange === 'ORDER');

            const ladderFlag =
              ladderInquiryFlag !== 1 || (ladderInquiryFlag === 1 && ladderQuotationFlag !== 1); // 当前价格是否在阶梯报价区间内

            return !doubleUnitFlag && Result && ladderFlag;
          },
          disabled({ dataSet, record }) {
            const doubleUnitFlag = dataSet.getState('doubleUnitFlag');
            const header = dataSet.getState('header') || {};
            const { priceTypeCode, quotationStatus, quotationChange } = header || {};
            const isUnTaxPriceFlag = priceTypeCode && priceTypeCode === 'NET_PRICE';
            const DisabledFlag = commonDisabled(record, dataSet);
            const { ladderQuotationFlag, ladderInquiryFlag } = record.get([
              'ladderQuotationFlag',
              'ladderInquiryFlag',
            ]);

            const Result =
              DisabledFlag ||
              !isUnTaxPriceFlag ||
              (quotationStatus !== 'NEW' && quotationChange === 'ORDER') ||
              (ladderInquiryFlag === 1 && ladderQuotationFlag === 1);

            return doubleUnitFlag || Result;
          },
        },
      },
      {
        label: intl.get(`ssrc.supplierQuotation.model.supQuo.taxInclude`).d('是否含税'),
        name: 'taxIncludedFlag',
        type: 'boolean',
        trueValue: 1,
        falseValue: 0,
        dynamicProps: {
          disabled({ record, dataSet }) {
            const { taxChangeFlag } = record.get(['taxChangeFlag']);
            const systemVersion = basicFormDS?.current
              ? basicFormDS.current?.get('systemVersion')
              : null;

            const DisabledFlag = commonDisabled(record, dataSet);

            const result = DisabledFlag || taxChangeFlag === 0;

            if (Number(systemVersion) === 2) {
              // systemVersion代表此单子走的新模板 新模板取消taxChangeFlag控制
              return DisabledFlag;
            }
            return result;
          },
          required({ record, dataSet }) {
            const systemVersion = basicFormDS?.current
              ? basicFormDS.current?.get('systemVersion')
              : null;

            const { taxChangeFlag } = record.get(['taxChangeFlag']);
            const RequiredFlag = commonRequired(record, dataSet);

            const result = RequiredFlag && taxChangeFlag === 1;

            if (Number(systemVersion) === 2) {
              // systemVersion代表此单子走的新模板 新模板取消taxChangeFlag控制
              return RequiredFlag;
            }
            return result;
          },
        },
      },
      {
        label: intl.get(`ssrc.supplierQuotation.model.supQuo.taxRate`).d('税率'),
        name: 'taxId',
        type: 'object',
        lovCode: 'SMDM.TAX',
        ignore: 'always',
        textField: 'taxRate',
        valueField: 'taxId',
        transformRequest: (value) => value && value.taxId,
        transformResponse: (value) => {
          return value ? { taxId: value } : null;
        },
        dynamicProps: {
          lovPara({ dataSet }) {
            const {
              queryParameter: { commonProps = {} },
            } = dataSet;
            const { organizationId } = commonProps;
            return { organizationId };
          },
          required({ record, dataSet }) {
            const systemVersion = basicFormDS?.current
              ? basicFormDS.current?.get('systemVersion')
              : null;

            const { taxChangeFlag, taxIncludedFlag } = record.get([
              'taxChangeFlag',
              'taxIncludedFlag',
            ]);
            const RequiredFlag = commonRequired(record, dataSet);

            const result = RequiredFlag && taxChangeFlag === 1 && taxIncludedFlag === 1;
            if (Number(systemVersion) === 2) {
              // systemVersion代表此单子走的新模板 新模板取消taxChangeFlag控制
              return RequiredFlag && taxIncludedFlag === 1;
            }
            return result;
          },
          disabled({ record, dataSet }) {
            const systemVersion = basicFormDS?.current
              ? basicFormDS.current?.get('systemVersion')
              : null;

            const { taxChangeFlag, taxIncludedFlag } = record.get([
              'taxChangeFlag',
              'taxIncludedFlag',
            ]);
            const DisabledFlag = commonDisabled(record, dataSet);

            const result = DisabledFlag || taxChangeFlag === 0 || taxIncludedFlag === 0;
            if (Number(systemVersion) === 2) {
              // systemVersion代表此单子走的新模板 新模板取消taxChangeFlag控制
              return DisabledFlag || taxIncludedFlag === 0;
            }
            return result;
          },
        },
      },
      {
        name: 'taxRate',
        type: 'string',
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.taxRate`).d('税率(%)'),
        bind: 'taxId.taxRate',
        // disabled: true,
      },

      // group
      {
        label: intl.get('ssrc.common.quotationDateAndHistory').d('报价日期与历史'),
        name: 'quotationHistoryInfo',
      },
      {
        label: intl
          .get(`ssrc.supplierQuotation.model.supQuo.quotationValidityFrom`)
          .d('报价有效期从'),
        name: 'currentExpiryDateFrom',
        type: 'date',
        dynamicProps: {
          required({ dataSet, record }) {
            const systemVersion = basicFormDS?.current
              ? basicFormDS.current?.get('systemVersion')
              : null;

            const { validDateInputType } = record.get(['validDateInputType']);
            const RequiredFlag = commonRequired(record, dataSet);

            const flag = validDateInputType === 'REQUIRED' && RequiredFlag;
            if (Number(systemVersion) === 2) {
              // systemVersion代表此单子走的新模板 新模板取消validDateInputType控制
              return false;
            }
            return flag;
          },
          disabled({ dataSet, record }) {
            const systemVersion = basicFormDS?.current
              ? basicFormDS.current?.get('systemVersion')
              : null;

            const { validDateInputType } = record.get(['validDateInputType']);
            const DisabledFlag = commonDisabled(record, dataSet);

            const disabledFlag = DisabledFlag || validDateInputType === 'READONLY';
            if (Number(systemVersion) === 2) {
              // systemVersion代表此单子走的新模板 新模板取消validDateInputType控制
              return DisabledFlag;
            }
            return disabledFlag;
          },
        },
      },
      {
        label: intl
          .get(`ssrc.supplierQuotation.model.supQuo.currentExpiryDateTo`)
          .d('报价有效期至'),
        name: 'currentExpiryDateTo',
        type: 'date',
        dynamicProps: {
          required({ dataSet, record }) {
            const systemVersion = basicFormDS?.current
              ? basicFormDS.current?.get('systemVersion')
              : null;

            const { validDateInputType } = record.get(['validDateInputType']);
            const RequiredFlag = commonRequired(record, dataSet);

            const flag = validDateInputType === 'REQUIRED' && RequiredFlag;
            if (Number(systemVersion) === 2) {
              // systemVersion代表此单子走的新模板 新模板取消validDateInputType控制
              return false;
            }
            return flag;
          },
          disabled({ dataSet, record }) {
            const systemVersion = basicFormDS?.current
              ? basicFormDS.current?.get('systemVersion')
              : null;

            const { validDateInputType } = record.get(['validDateInputType']);
            const DisabledFlag = commonDisabled(record, dataSet);

            const flag = DisabledFlag || validDateInputType === 'READONLY';
            if (Number(systemVersion) === 2) {
              // systemVersion代表此单子走的新模板 新模板取消validDateInputType控制
              return DisabledFlag;
            }
            return flag;
          },
          min({ record }) {
            const currentExpiryDateFrom = record.get('currentExpiryDateFrom');
            return currentExpiryDateFrom
              ? 'currentExpiryDateFrom'
              : moment(new Date()).format(DEFAULT_DATE_FORMAT);
          },
        },
        computedProps: {
          min({ record }) {
            const currentField = record.getField('currentExpiryDateTo');
            if (!currentField) {
              return null;
            }
            const disabledFlag = currentField?.get('disabled');
            const readOnlyFlag = currentField?.get('readOnly');
            if (disabledFlag || readOnlyFlag) {
              return null;
            }

            const currentExpiryDateFrom = record.get('currentExpiryDateFrom');
            const min = currentExpiryDateFrom
              ? 'currentExpiryDateFrom'
              : moment(new Date()).format(DEFAULT_DATE_FORMAT);
            return min;
          },
        },
      },
      {
        label: intl.get('ssrc.common.deliveryCycleDay').d('供货周期(天)'),
        name: 'currentDeliveryCycle',
        type: 'number',
        min: 0,
        step: 1,
        dynamicProps: {
          disabled({ dataSet, record }) {
            const DisabledFlag = commonDisabled(record, dataSet);

            const flag = DisabledFlag;
            return flag;
          },
        },
      },
      {
        label: intl.get('ssrc.supplierQuotation.model.supQuo.includingFreight').d('是否含运费'),
        name: 'freightIncludedFlag',
        type: 'boolean',
        trueValue: 1,
        falseValue: 0,
        dynamicProps: {
          disabled({ dataSet, record }) {
            const DisabledFlag = commonDisabled(record, dataSet);

            const flag = DisabledFlag;
            return flag;
          },
        },
      },
      {
        label: intl.get('ssrc.supplierQuotation.model.supQuo.freightAmount').d('运费'),
        name: 'freightAmount',
        type: 'number',
        dynamicProps: {
          disabled({ record, dataSet }) {
            const DisabledFlag = commonDisabled(record, dataSet);

            const flag = DisabledFlag || !!record.get('freightIncludedFlag');
            return flag;
          },
        },
      },
      {
        name: 'quotationHistory',
        label: intl
          .get(`ssrc.supplierQuotation.model.supQuo.commonQuotationHistory`, { quotationName })
          .d('{quotationName}历史'),
      },
      {
        name: 'currentAttachmentUuid',
        type: 'attachment',
        label: intl
          .get(`ssrc.supplierQuotation.model.supQuo.purchaserLineAttachment`)
          .d('供应商行附件'),
        bucketName: PRIVATE_BUCKET,
        bucketDirectory: 'ssrc-rfx-quotationline',
        ...(ChunkUploadProps || {}),
        dynamicProps: {
          disabled({ dataSet, record }) {
            const DisabledFlag = commonDisabled(record, dataSet);

            const flag = DisabledFlag;
            return flag;
          },
        },
      },

      { name: 'actionSectionSelectedFlag' },
      { name: 'updatedFlag' },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.minimumPrice`).d('最低限价'),
        name: 'minLimitPrice',
        type: 'number',
        disabled: true,
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.maximumPrice`).d('最高限价'),
        name: 'maxLimitPrice',
        type: 'number',
        disabled: true,
      },
      {
        name: 'taxRateType',
      },
    ],
    events: {
      load: ({ dataSet }) => {
        dataSet.forEach((record) => {
          if (!record) {
            return;
          }

          const {
            quotationLineStatus,
            eliminateFlag,
            bargainFlag,
            headerBargainFlag,
            bargainStatus,
            displayQuotationLineStatus,
          } = record.get([
            'quotationLineStatus',
            'eliminateFlag',
            'bargainFlag',
            'headerBargainFlag',
            'bargainStatus',
            'displayQuotationLineStatus',
          ]);

          const statusDisabled = displayQuotationLineStatus === 'FINISHED';
          const bargainResult =
            bargainFlag !== 1 && headerBargainFlag !== 1 && bargainStatus === 'BARGAINING_ONLINE';
          const disabledSelectFlag =
            statusDisabled || eliminateFlag || quotationLineStatus === 'ABANDONED' || bargainResult;

          if (disabledSelectFlag) {
            Object.assign(record, { selectable: false });
          }
        });
        const batchUpdateLines = dataSet.getState('batchUpdateLines') || null;
        const getBatchUpdateFlag = dataSet.getState('getBatchUpdateFlag') || null;
        if (isFunction(batchUpdateLines) && isFunction(getBatchUpdateFlag)) {
          const { batchEditQuotationLineDTO = {}, allEditFlag = -1, batchEditData = {} } =
            getBatchUpdateFlag() || {};
          // line update
          batchUpdateLines(dataSet, batchEditQuotationLineDTO, allEditFlag, batchEditData);
        }
      },
      // select: ({ record }) => {
      //   record.set('actionSectionSelectedFlag', 1);
      // },
      // unSelect: ({ record }) => {
      //   record.set('actionSectionSelectedFlag', 0);
      // },
      update: ({ record, name }) => {
        const markUpdatedFlag =
          name !== 'status' &&
          name !== 'rank' &&
          name !== 'trendFlag' &&
          name !== 'quotationEndDate' &&
          name !== 'quotationStartDate' &&
          name !== 'currentDateTime' &&
          name !== 'displayQuotationLineStatus' &&
          name !== 'displayQuotationLineStatusMeaning';

        if (record && markUpdatedFlag) {
          record.set('updatedFlag', 1); // 行如果有变更，后端会依据此提交
        }
      },
    },
    // feedback: {
    //   loadSuccess: (res) => {
    //     if (res) {

    //     }
    //   },
    // },
    transport: {
      read: ({ data }) => {
        const { commonProps = {}, advanced = {}, ...others } = data;
        const { organizationId } = commonProps;

        if (!organizationId) {
          return;
        }

        return {
          url: `${SRM_SSRC}/v2/${organizationId}/rfx/supplier/quotation/lines`,
          method: 'GET',
          data: { ...commonProps, ...advanced, ...others },
        };
      },
    },
  };
};

export { quotationLineDataSet };
