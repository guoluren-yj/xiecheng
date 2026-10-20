// time control DS
import intl from 'utils/intl';
import moment from 'moment';
import { noop } from 'lodash';
// import { getDateTimeFormat } from 'utils/utils';

// 竞价时间DS
const biddingTimeDS = () => {
  // 【竞价模式】是英式竞价且【报价类型】为总价竞价
  // const isTotalPriceFlag = ({ dataSet }) => {
  //   const headerBaseInfo = dataSet.getQueryParameter('headerBaseInfo');
  //   const {
  //     biddingMode, // 竞价模式
  //     biddingTarget, // 报价类型是 总价竞价还是单价竞价
  //   } = headerBaseInfo || {};
  //   const biddingTotalPriceFlag =
  //     biddingMode === 'BRITISH_BIDDING' && biddingTarget === 'TOTAL_PRICE';
  //   return biddingTotalPriceFlag;
  // };

  return {
    autoCreate: true,
    dataToJSON: 'all',
    fields: [
      // 发布即开始字段
      {
        name: 'nowAdjustedField',
        type: 'string',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.clarifyEndDate`).d('澄清截止时间'),
        name: 'clarifyEndDate',
        type: 'dateTime',
        // format: getDateTimeFormat(),
        dynamicProps: {
          disabled: ({ record }) => {
            return record
              .get('fieldPropertyDTOList')
              ?.find?.((item) => item.name === 'clarifyEndDate')?.disabled;
          },
        },
      },
      {
        label: intl.get('ssrc.inquiryHall.model.biddingRules.biddingStrategy').d('出价策略'),
        name: 'biddingStrategy',
        type: 'string',
        lookupCode: 'SSRC.BIDDING_STRATEGY',
        dynamicProps: {
          required({ dataSet }) {
            const headerBaseInfo = dataSet.getQueryParameter('headerBaseInfo');
            const showRuleFormFlag = dataSet.getQueryParameter('showRuleFormFlag'); // 是否展示form标识
            const {
              biddingMode, // 竞价模式
            } = headerBaseInfo || {};
            return showRuleFormFlag && biddingMode === 'BRITISH_BIDDING';
          },
        },
      },
      {
        label: intl.get('ssrc.inquiryHall.model.biddingRules.biddingQuotationRange').d('报价幅度'),
        name: 'biddingQuotationRange',
      },
      {
        label: intl.get('ssrc.inquiryHall.model.biddingRules.biddingQuotationRange').d('报价幅度'),
        name: 'floatType',
        type: 'string',
        lookupCode: 'SSRC.BIDDING_FLOAT_TYPE',
        defaultValue: 'money',
      },
      {
        name: 'quotationRange',
        type: 'number',
        min: '0',
        max: '99999999999999999999',
        dynamicProps: {
          precision({ record }) {
            const floatType = record.get('floatType');
            if (floatType === 'ratio') {
              return 2;
            }
          },
        },
      },
      {
        label: intl.get('ssrc.inquiryHall.model.biddingRules.safePrice').d('安全价'),
        name: 'safePrice',
        type: 'number',
        min: '0',
        max: '99999999999999999999',
        // dynamicProps: {
        //   required({ dataSet }) {
        //     return isTotalPriceFlag({ dataSet });
        //   },
        // },
      },
      {
        name: 'currencyCode', // 币种
      },
      {
        name: 'ssrcCustomCurrentNewDateTime', // 前端自定义字段，记录当前时间
        defaultValue: new Date(),
      },
      {
        label: intl.get('ssrc.biddingHall.view.message.biddingSpreadPrice').d('价差'),
        name: 'biddingSpreadPrice',
        type: 'number',
        min: 0,
        dynamicProps: {
          required({ dataSet }) {
            const headerBaseInfo = dataSet.getQueryParameter('headerBaseInfo');
            const showRuleFormFlag = dataSet.getQueryParameter('showRuleFormFlag'); // 是否展示form标识
            const { biddingMode, biddingTarget, biddingTotalPricePrinciple } = headerBaseInfo || {};
            const flag =
              biddingMode === 'BRITISH_BIDDING' &&
              biddingTarget === 'TOTAL_PRICE' &&
              biddingTotalPricePrinciple === 'TOTAL_PRICE_REQUIRED';

            return showRuleFormFlag && flag;
          },
          disabled({ dataSet }) {
            const headerBaseInfo = dataSet.getQueryParameter('headerBaseInfo');
            const { biddingMode, biddingTarget, biddingTotalPricePrinciple } = headerBaseInfo || {};
            const flag =
              biddingMode !== 'BRITISH_BIDDING' ||
              biddingTarget !== 'TOTAL_PRICE' ||
              biddingTotalPricePrinciple !== 'TOTAL_PRICE_REQUIRED';

            return flag;
          },
        },
      },
    ],
  };
};

// 动态添加签到相关字段
function addBiddingTimeDSField(payload) {
  const { timeControlDS, field } = payload || {};
  const { name, visible = 0, required = 0, disabled } = field || {};

  if (!visible || !timeControlDS) return;

  // 签到开始时间
  if (name === 'signInStartDate') {
    timeControlDS.addField('signInStartDate', {
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.signStartTimeRFX`).d(`签到开始时间`),
      name: 'signInStartDate',
      type: 'dateTime',
      // format: getDateTimeFormat(),
      disabled,
      computedProps: {
        min({ record, dataSet }) {
          if (disabled) {
            return null;
          }
          const preQualificationObj = dataSet.getQueryParameter('preQualificationObj');
          const { getPrequalEndDate = noop, preQualificationFlag } = preQualificationObj || {};
          const prequalEndDate = getPrequalEndDate();

          const { signInStartFlag, biddingOnlineSignInFlag } = record.get([
            'signInStartFlag',
            'biddingOnlineSignInFlag',
          ]);
          if (!biddingOnlineSignInFlag || signInStartFlag) return null;
          // 如果存在资格预审，则开始时间最小值就是截止时间
          if (
            preQualificationFlag &&
            prequalEndDate &&
            moment(prequalEndDate).isValid() &&
            moment().isSameOrBefore(prequalEndDate)
          ) {
            return prequalEndDate;
          }
          return 'ssrcCustomCurrentNewDateTime';
        },
        max({ record }) {
          if (disabled) {
            return null;
          }
          const { signInEndDate, signInRunningDurationFlag, biddingOnlineSignInFlag } = record.get([
            'signInEndDate',
            'signInRunningDurationFlag',
            'biddingOnlineSignInFlag',
          ]);
          if (!biddingOnlineSignInFlag) return null;
          if (signInEndDate && !signInRunningDurationFlag) {
            return moment(signInEndDate).subtract(1, 's');
          }
        },
      },
      dynamicProps: {
        required({ record }) {
          const currentField = record.dataSet.getField(name);
          if (!currentField || disabled) {
            return false;
          }
          const signInStartFlag = record.get('signInStartFlag');
          return signInStartFlag === 0 && required;
        },
      },
    });
    timeControlDS.addField('signStartWrapper', {
      name: 'signStartWrapper',
      type: 'string',
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.signIn`).d(`签到`),
    });
    timeControlDS.addField('signInStartFlag', {
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.signIn`).d(`签到`),
      name: 'signInStartFlag',
      defaultValue: 0,
    });
    return;
  }
  // 签到运行时间 截止时间
  if (['signInRunningDuration', 'signInEndDate'].includes(name)) {
    const dynamicProps = {
      required({ record }) {
        const {
          signInRunningDurationFlag,
          signInRunningDay,
          signInRunningHour,
          signInRunningMinute,
        } =
          record.get([
            'signInRunningDurationFlag',
            'signInRunningDay',
            'signInRunningHour',
            'signInRunningMinute',
          ]) || {};
        if (disabled) return false;
        return (
          required &&
          signInRunningDurationFlag === 1 &&
          !signInRunningDay &&
          !signInRunningHour &&
          !signInRunningMinute
        );
      },
      disabled() {
        return disabled;
      },
    };
    // 如果ds中无签到运行时间字段，则添加
    if (!timeControlDS.getField('signInRunningDuration')) {
      timeControlDS.addField('signInRunningDuration', {
        name: 'signInRunningDuration',
        type: 'number',
        min: 0,
        dynamicProps,
      });
      timeControlDS.addField('signInRunningDay', {
        name: 'signInRunningDay',
        type: 'number',
        placeholder: intl.get('ssrc.inquiryHall.view.inquiryHall.signInTimeDay').d('签到时间(天)'),
        precision: 0,
        min: 0,
        defaultValidationMessages: { valueMissingNoLabel: '' },
        dynamicProps,
      });
      timeControlDS.addField('signInRunningHour', {
        name: 'signInRunningHour',
        type: 'number',
        placeholder: intl.get('hzero.common.date.unit.hours').d('小时'),
        precision: 0,
        min: 0,
        defaultValidationMessages: { valueMissingNoLabel: '' },
        dynamicProps,
      });
      timeControlDS.addField('signInRunningMinute', {
        name: 'signInRunningMinute',
        type: 'number',
        placeholder: intl.get('hzero.common.date.unit.minutes').d('分钟'),
        precision: 1,
        min: 0,
        defaultValidationMessages: { valueMissingNoLabel: '' },
        dynamicProps,
      });
      timeControlDS.addField('signInRunningDurationFlag', {
        name: 'signInRunningDurationFlag',
        defaultValue: 0,
      });
    }
    // 如果ds中无签到截止时间字段，则添加
    if (!timeControlDS.getField('signInEndDate')) {
      timeControlDS.addField('signInEndDate', {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.signInEndDate`).d(`签到截止时间`),
        name: 'signInEndDate',
        type: 'dateTime',
        // format: getDateTimeFormat(),
        disabled,
        computedProps: {
          min({ record }) {
            if (disabled) {
              return null;
            }

            const {
              signInStartDate,
              signInRunningDurationFlag,
              biddingOnlineSignInFlag, // 签到标识
            } = record.get([
              'signInStartDate',
              'signInRunningDurationFlag',
              'biddingOnlineSignInFlag',
            ]);
            if (!biddingOnlineSignInFlag || signInRunningDurationFlag) return null;
            const min =
              signInStartDate && biddingOnlineSignInFlag && moment().isSameOrBefore(signInStartDate)
                ? moment(signInStartDate).add(1, 's')
                : 'ssrcCustomCurrentNewDateTime';
            return min;
          },
          max({ record }) {
            const {
              startingTrialBiddingStartFlag,
              startingTrialBiddingStartDate,
              quotationStartDate,
              signInRunningDurationFlag,
              biddingTrialBiddingFlag, // 试竞价标识
              biddingOnlineSignInFlag,
              startFlag,
            } = record.get([
              'startingTrialBiddingStartFlag',
              'startingTrialBiddingStartDate',
              'quotationStartDate',
              'signInRunningDurationFlag',
              'biddingTrialBiddingFlag',
              'biddingOnlineSignInFlag',
              'startFlag',
            ]);
            if (disabled) {
              return null;
            }
            if (!biddingOnlineSignInFlag || signInRunningDurationFlag) return null;
            /**
             *  a.如果【试竞价】为【是】，判断试竞价开始时间是否有值，有值则为最大值
                b.如果【试竞价】为【否】，判断竞价开始时间是否有值，有值则为最大值
             */
            if (
              biddingTrialBiddingFlag &&
              !startingTrialBiddingStartFlag &&
              startingTrialBiddingStartDate
            ) {
              return 'startingTrialBiddingStartDate';
            }
            if (!biddingTrialBiddingFlag && !startFlag && quotationStartDate) {
              return 'quotationStartDate';
            }
          },
        },
        dynamicProps: {
          required({ record }) {
            const currentField = record.dataSet.getField('signInEndDate');
            if (!currentField || disabled) {
              return false;
            }
            const signInRunningDurationFlag = record.get('signInRunningDurationFlag');
            return signInRunningDurationFlag === 0 && required;
          },
        },
      });
    }
    if (!timeControlDS.getField('signEndWrapper')) {
      timeControlDS.addField('signEndWrapper', {
        name: 'signEndWrapper',
        type: 'string',
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.signIn`).d(`签到`),
      });
    }
    return;
  }

  // 试竞价开始时间
  if (name === 'startingTrialBiddingStartDate') {
    timeControlDS.addField('startingTrialBiddingStartDate', {
      label: intl
        .get(`ssrc.inquiryHall.model.inquiryHall.startingTrialBiddingStartDate`)
        .d(`试竞价开始时间`),
      name: 'startingTrialBiddingStartDate',
      type: 'dateTime',
      // format: getDateTimeFormat(),
      disabled,
      computedProps: {
        min({ record, dataSet }) {
          if (disabled) {
            return null;
          }

          const preQualificationObj = dataSet.getQueryParameter('preQualificationObj');
          const { getPrequalEndDate = noop, preQualificationFlag } = preQualificationObj || {};
          const prequalEndDate = getPrequalEndDate();

          const {
            signInEndDate,
            startingTrialBiddingStartFlag,
            biddingOnlineSignInFlag, // 签到标识
            biddingTrialBiddingFlag, // 试竞价标识
          } = record.get([
            'signInEndDate',
            'startingTrialBiddingStartFlag',
            'biddingOnlineSignInFlag',
            'biddingTrialBiddingFlag',
          ]);

          if (startingTrialBiddingStartFlag || !biddingTrialBiddingFlag) return null;
          // 如果签到配置为真且有签到截止时间
          if (biddingOnlineSignInFlag && signInEndDate && moment().isSameOrBefore(signInEndDate)) {
            return 'signInEndDate';
          }
          // 如果存在资格预审，则开始时间最小值就是截止时间
          if (
            !biddingOnlineSignInFlag &&
            preQualificationFlag &&
            prequalEndDate &&
            moment(prequalEndDate).isValid() &&
            moment().isSameOrBefore(prequalEndDate)
          ) {
            return prequalEndDate;
          }
          return 'ssrcCustomCurrentNewDateTime';
        },
        max({ record }) {
          const startingTrialBiddingEndDate = record.get('startingTrialBiddingEndDate');
          if (disabled) {
            return null;
          }
          const { startingTrialBiddingRunningDurationFlag, biddingTrialBiddingFlag } = record.get([
            'startingTrialBiddingRunningDurationFlag',
            'biddingTrialBiddingFlag',
          ]);
          if (!biddingTrialBiddingFlag) return null;
          if (startingTrialBiddingEndDate && !startingTrialBiddingRunningDurationFlag) {
            return moment(startingTrialBiddingEndDate).subtract(1, 's');
          }
        },
      },
      dynamicProps: {
        required({ record }) {
          const currentField = record.dataSet.getField(name);
          if (!currentField || disabled) {
            return false;
          }
          const startingTrialBiddingStartFlag = record.get('startingTrialBiddingStartFlag');
          return startingTrialBiddingStartFlag === 0 && required;
        },
      },
    });
    timeControlDS.addField('startingBiddingWrapper', {
      name: 'startingBiddingWrapper',
      type: 'string',
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.startingTrialBidding`).d(`试竞价`),
    });
    timeControlDS.addField('startingTrialBiddingStartFlag', {
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.startingTrialBidding`).d(`试竞价`),
      name: 'startingTrialBiddingStartFlag',
      defaultValue: 0,
    });
    return;
  }

  // 试竞价运行时间 截止时间
  if (['startingTrialBiddingRunningDuration', 'startingTrialBiddingEndDate'].includes(name)) {
    const dynamicProps = {
      required({ record }) {
        const {
          startingTrialBiddingRunningDurationFlag,
          startingBiddingRunningDay,
          startingBiddingRunningHour,
          startingBiddingRunningMinute,
        } =
          record.get([
            'startingTrialBiddingRunningDurationFlag',
            'startingBiddingRunningDay',
            'startingBiddingRunningHour',
            'startingBiddingRunningMinute',
          ]) || {};
        if (disabled) return false;
        return (
          required &&
          startingTrialBiddingRunningDurationFlag === 1 &&
          !startingBiddingRunningDay &&
          !startingBiddingRunningHour &&
          !startingBiddingRunningMinute
        );
      },
      disabled() {
        return disabled;
      },
    };
    if (!timeControlDS.getField('startingTrialBiddingRunningDuration')) {
      timeControlDS.addField('startingTrialBiddingRunningDuration', {
        name: 'startingTrialBiddingRunningDuration',
        type: 'number',
        min: 0,
        dynamicProps,
      });
      timeControlDS.addField('startingBiddingRunningDay', {
        name: 'startingBiddingRunningDay',
        type: 'number',
        precision: 0,
        min: 0,
        placeholder: intl
          .get('ssrc.inquiryHall.view.inquiryHall.durationRunningTimeDay')
          .d('运行时间(天)'),
        defaultValidationMessages: { valueMissingNoLabel: '' },
        dynamicProps,
      });
      timeControlDS.addField('startingBiddingRunningHour', {
        name: 'startingBiddingRunningHour',
        type: 'number',
        precision: 0,
        min: 0,
        placeholder: intl.get('hzero.common.date.unit.hours').d('小时'),
        defaultValidationMessages: { valueMissingNoLabel: '' },
        dynamicProps,
      });
      timeControlDS.addField('startingBiddingRunningMinute', {
        name: 'startingBiddingRunningMinute',
        type: 'number',
        precision: 1,
        min: 0,
        placeholder: intl.get('hzero.common.date.unit.minutes').d('分钟'),
        defaultValidationMessages: { valueMissingNoLabel: '' },
        dynamicProps,
      });
      timeControlDS.addField('startingTrialBiddingRunningDurationFlag', {
        name: 'startingTrialBiddingRunningDurationFlag',
        defaultValue: 0,
      });
    }
    if (!timeControlDS.getField('startingTrialBiddingEndDate')) {
      timeControlDS.addField('startingTrialBiddingEndDate', {
        label: intl
          .get(`ssrc.inquiryHall.model.inquiryHall.startingTrialBiddingEndDate`)
          .d(`试竞价截止时间`),
        name: 'startingTrialBiddingEndDate',
        type: 'dateTime',
        // format: getDateTimeFormat(),
        disabled,
        computedProps: {
          min({ record }) {
            if (disabled) {
              return null;
            }

            const {
              startingTrialBiddingStartDate,
              startingTrialBiddingRunningDurationFlag,
              // biddingOnlineSignInFlag, // 签到标识
              biddingTrialBiddingFlag, // 试竞价标识
            } = record.get([
              'startingTrialBiddingStartDate',
              'startingTrialBiddingRunningDurationFlag',
              // 'biddingOnlineSignInFlag',
              'biddingTrialBiddingFlag',
            ]);

            if (startingTrialBiddingRunningDurationFlag || !biddingTrialBiddingFlag) return null;
            if (
              biddingTrialBiddingFlag &&
              startingTrialBiddingStartDate &&
              moment().isSameOrBefore(startingTrialBiddingStartDate)
            ) {
              // 如果试竞价存开始存在
              return moment(startingTrialBiddingStartDate).add(1, 's');
            }

            return 'ssrcCustomCurrentNewDateTime';
          },
          max({ record }) {
            if (disabled) {
              return null;
            }
            const {
              startFlag,
              quotationStartDate,
              startingTrialBiddingRunningDurationFlag,
            } = record.get([
              'startFlag',
              'quotationStartDate',
              'startingTrialBiddingRunningDurationFlag',
            ]);
            if (startingTrialBiddingRunningDurationFlag) return null;
            if (quotationStartDate && !startFlag) {
              return 'quotationStartDate';
            }
          },
        },
        dynamicProps: {
          required({ record }) {
            const currentField = record.dataSet.getField('startingTrialBiddingEndDate');
            if (!currentField || disabled) {
              return false;
            }
            const startingTrialBiddingRunningDurationFlag = record.get(
              'startingTrialBiddingRunningDurationFlag'
            );
            return startingTrialBiddingRunningDurationFlag === 0 && required;
          },
        },
      });
    }
    if (!timeControlDS.getField('startingBiddingEndWrapper')) {
      timeControlDS.addField('startingBiddingEndWrapper', {
        name: 'startingBiddingEndWrapper',
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.startingTrialBidding`).d(`试竞价`),
      });
    }
    return;
  }

  // 正式竞价开始时间
  if (name === 'quotationStartDate') {
    timeControlDS.addField('quotationStartDate', {
      label: intl.get(`ssrc.inquiryHall.model.biddingTime.biddingStartTime`).d('竞价开始时间'),
      name: 'quotationStartDate',
      type: 'dateTime',
      // format: getDateTimeFormat(),
      disabled,
      computedProps: {
        min({ record, dataSet }) {
          if (disabled) {
            return null;
          }
          const preQualificationObj = dataSet.getQueryParameter('preQualificationObj');
          const { getPrequalEndDate = noop, preQualificationFlag } = preQualificationObj || {};
          const prequalEndDate = getPrequalEndDate();
          const {
            // startingTrialBiddingStartDate,
            signInEndDate,
            startingTrialBiddingEndDate,
            startFlag,
            biddingOnlineSignInFlag, // 签到标识
            biddingTrialBiddingFlag, // 试竞价标识
          } = record.get([
            // 'startingTrialBiddingStartDate',
            'signInEndDate',
            'startingTrialBiddingEndDate',
            'startFlag',
            'biddingOnlineSignInFlag',
            'biddingTrialBiddingFlag',
          ]);
          if (startFlag) return null;
          // 模板中【试竞价】为【是】且试竞价截止时间有值时，只能选到试竞价截止时间后的时间
          if (
            biddingTrialBiddingFlag &&
            startingTrialBiddingEndDate &&
            moment().isSameOrBefore(startingTrialBiddingEndDate)
          ) {
            return 'startingTrialBiddingEndDate';
          }
          // 模板中【试竞价】为【否】&【在线签到】为【是】&签到截止时间有值时，只能选到签到截止时间后的时间
          if (
            !biddingTrialBiddingFlag &&
            biddingOnlineSignInFlag &&
            signInEndDate &&
            moment().isSameOrBefore(signInEndDate)
          ) {
            return 'signInEndDate';
          }
          // 如果存在资格预审，则开始时间最小值就是截止时间
          if (
            !biddingOnlineSignInFlag &&
            !biddingTrialBiddingFlag &&
            preQualificationFlag &&
            prequalEndDate &&
            moment(prequalEndDate).isValid() &&
            moment().isSameOrBefore(prequalEndDate)
          ) {
            return prequalEndDate;
          }
          return 'ssrcCustomCurrentNewDateTime';
        },
        max({ record }) {
          if (disabled) {
            return null;
          }
          const { quotationEndDate, startFlag, startingBiddingRunningDurationFlag } = record.get([
            'quotationEndDate',
            'startFlag',
            'startingBiddingRunningDurationFlag',
          ]);
          if (startFlag) return null;
          if (!startingBiddingRunningDurationFlag && quotationEndDate) {
            return moment(quotationEndDate).subtract(1, 's');
          }

          return null;
        },
      },
      dynamicProps: {
        required({ record }) {
          if (disabled) {
            return false;
          }
          const startFlag = record.get('startFlag');
          return startFlag === 0 && required;
        },
      },
    });
    timeControlDS.addField('biddingStartFlagWrap', {
      name: 'biddingStartFlagWrap',
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.startingBidding`).d(`竞价`),
    });
    timeControlDS.addField('startFlag', {
      name: 'startFlag',
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.startingBidding`).d(`竞价`),
    });
    return;
  }

  // 正式竞价运行时间 截止时间
  if (['quotationRunningDuration', 'quotationEndDate'].includes(name)) {
    const dynamicProps = {
      required({ record }) {
        const {
          startingBiddingRunningDurationFlag,
          biddingRunnintDay,
          biddingRunnintHour,
          biddingRunnintMinute,
        } =
          record.get([
            'startingBiddingRunningDurationFlag',
            'biddingRunnintDay',
            'biddingRunnintHour',
            'biddingRunnintMinute',
          ]) || {};
        if (disabled) return false;

        return (
          required &&
          startingBiddingRunningDurationFlag === 1 &&
          !biddingRunnintDay &&
          !biddingRunnintHour &&
          !biddingRunnintMinute
        );
      },
      disabled() {
        return disabled;
      },
    };
    if (!timeControlDS.getField('quotationRunningDuration')) {
      timeControlDS.addField('quotationRunningDuration', {
        name: 'quotationRunningDuration',
        type: 'number',
        dynamicProps,
      });
      timeControlDS.addField('biddingRunnintDay', {
        name: 'biddingRunnintDay',
        type: 'number',
        placeholder: intl
          .get('ssrc.inquiryHall.view.inquiryHall.durationRunningTimeDay')
          .d('运行时间(天)'),
        precision: 0,
        min: 0,
        defaultValidationMessages: { valueMissingNoLabel: '' },
        dynamicProps,
      });
      timeControlDS.addField('biddingRunnintHour', {
        name: 'biddingRunnintHour',
        type: 'number',
        precision: 0,
        min: 0,
        placeholder: intl.get('hzero.common.date.unit.hours').d('小时'),
        defaultValidationMessages: { valueMissingNoLabel: '' },
        dynamicProps,
      });
      timeControlDS.addField('biddingRunnintMinute', {
        name: 'biddingRunnintMinute',
        type: 'number',
        precision: 1,
        min: 0,
        placeholder: intl.get('hzero.common.date.unit.minutes').d('分钟'),
        defaultValidationMessages: { valueMissingNoLabel: '' },
        dynamicProps,
      });
      timeControlDS.addField('startingBiddingRunningDurationFlag', {
        name: 'startingBiddingRunningDurationFlag',
        defaultValue: 1,
      });
    }
    if (!timeControlDS.getField('quotationEndDate')) {
      timeControlDS.addField('quotationEndDate', {
        label: intl.get(`ssrc.inquiryHall.model.biddingTime.biddingEndDate`).d('竞价截止时间'),
        name: 'quotationEndDate',
        type: 'dateTime',
        // format: getDateTimeFormat(),
        disabled,
        computedProps: {
          min({ record }) {
            if (disabled) {
              return null;
            }
            const { quotationStartDate, startingBiddingRunningDurationFlag } = record.get([
              'quotationStartDate',
              'startingBiddingRunningDurationFlag',
            ]);
            if (startingBiddingRunningDurationFlag) return null;
            // 如果【在线签到】和【试竞价】都为否，并且勾选了【发布即开始】，只能选到此刻之后的时间
            // 其余情况需校验【竞价开始时间】是否有值，有值则只能选到【竞价开始时间】之后的时间，没值则只能选到此刻之后的时间
            if (quotationStartDate && moment().isSameOrBefore(quotationStartDate)) {
              return moment(quotationStartDate).add(1, 's');
            }
            return 'ssrcCustomCurrentNewDateTime';
          },
          max({ record }) {
            if (disabled) {
              return null;
            }
            const {
              biddingSupplementPriceStartDate,
              biddingSupplementPriceStartFlag,
            } = record.get(['biddingSupplementPriceStartDate', 'biddingSupplementPriceStartFlag']);
            // 如果补充单价时间有值 & 竞价开始时间选择框为自定义时间
            if (biddingSupplementPriceStartDate && !biddingSupplementPriceStartFlag) {
              return 'biddingSupplementPriceStartDate';
            }
          },
        },
        dynamicProps: {
          required({ record }) {
            if (disabled) {
              return false;
            }
            const startingBiddingRunningDurationFlag = record.get(
              'startingBiddingRunningDurationFlag'
            );
            return startingBiddingRunningDurationFlag === 0 && required;
          },
        },
      });
    }

    if (!timeControlDS.getField('biddingEndWrap')) {
      timeControlDS.addField('biddingEndWrap', {
        name: 'biddingEndWrap',
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.startingBidding`).d(`竞价`),
      });
    }
    return;
  }

  // 补充单价开始时间
  if (name === 'biddingSupplementPriceStartDate') {
    timeControlDS.addField(name, {
      label: intl
        .get(`ssrc.inquiryHall.model.inquiryHall.biddingSupplementPriceStartDate`)
        .d(`补充单价开始时间`),
      name: 'biddingSupplementPriceStartDate',
      type: 'dateTime',
      // format: getDateTimeFormat(),
      disabled,
      computedProps: {
        min({ record }) {
          if (disabled) {
            return null;
          }

          const { quotationEndDate } = record.get(['quotationEndDate']);

          if (quotationEndDate) {
            return quotationEndDate;
          }

          return 'ssrcCustomCurrentNewDateTime';
        },
        max({ record }) {
          if (disabled) {
            return null;
          }
          const {
            biddingSupplementPriceEndDate,
            biddingSupplementPriceRunningDurationFlag,
          } = record.get([
            'biddingSupplementPriceEndDate',
            'biddingSupplementPriceRunningDurationFlag',
          ]);
          if (biddingSupplementPriceEndDate && !biddingSupplementPriceRunningDurationFlag) {
            return moment(biddingSupplementPriceEndDate).subtract(1, 's');
          }
        },
      },
      dynamicProps: {
        required({ record }) {
          if (disabled) {
            return false;
          }
          const biddingSupplementPriceStartFlag = record.get('biddingSupplementPriceStartFlag');
          return biddingSupplementPriceStartFlag === 0 && required;
        },
      },
    });
    timeControlDS.addField('biddingSupplementPriceStartWrap', {
      name: 'biddingSupplementPriceStartWrap',
      label: intl.get('ssrc.inquiryHall.model.inquiryHall.biddingSupplementPrice').d('补充单价'),
    });
    timeControlDS.addField('biddingSupplementPriceStartFlag', {
      name: 'biddingSupplementPriceStartFlag',
      label: intl.get('ssrc.inquiryHall.model.inquiryHall.biddingSupplementPrice').d('补充单价'),
    });
    return;
  }

  // 补充单价运行时间 截止时间
  if (['biddingSupplementPriceRunningDuration', 'biddingSupplementPriceEndDate'].includes(name)) {
    const dynamicProps = {
      required({ record }) {
        const {
          biddingSupplementPriceRunningDurationFlag,
          biddingSupplementPriceRunnintDay,
          biddingSupplementPriceRunnintHour,
          biddingSupplementPriceRunnintMinute,
        } =
          record.get([
            'biddingSupplementPriceRunningDurationFlag',
            'biddingSupplementPriceRunnintDay',
            'biddingSupplementPriceRunnintHour',
            'biddingSupplementPriceRunnintMinute',
          ]) || {};
        if (disabled) return false;

        return (
          required &&
          biddingSupplementPriceRunningDurationFlag === 1 &&
          !biddingSupplementPriceRunnintDay &&
          !biddingSupplementPriceRunnintHour &&
          !biddingSupplementPriceRunnintMinute
        );
      },
      disabled() {
        return disabled;
      },
    };

    if (!timeControlDS.getField('biddingSupplementPriceRunningDuration')) {
      timeControlDS.addField('biddingSupplementPriceRunningDuration', {
        name: 'biddingSupplementPriceRunningDuration',
        type: 'number',
        min: 0,
        dynamicProps,
      });
      timeControlDS.addField('biddingSupplementPriceRunnintDay', {
        name: 'biddingSupplementPriceRunnintDay',
        type: 'number',
        placeholder: intl
          .get('ssrc.inquiryHall.view.inquiryHall.durationRunningTimeDay')
          .d('运行时间(天)'),
        min: 0,
        precision: 0,
        defaultValidationMessages: { valueMissingNoLabel: '' },
        dynamicProps,
      });
      timeControlDS.addField('biddingSupplementPriceRunnintHour', {
        name: 'biddingSupplementPriceRunnintHour',
        type: 'number',
        min: 0,
        precision: 0,
        placeholder: intl.get('hzero.common.date.unit.hours').d('小时'),
        defaultValidationMessages: { valueMissingNoLabel: '' },
        dynamicProps,
      });
      timeControlDS.addField('biddingSupplementPriceRunnintMinute', {
        name: 'biddingSupplementPriceRunnintMinute',
        type: 'number',
        precision: 1,
        min: 0,
        placeholder: intl.get('hzero.common.date.unit.minutes').d('分钟'),
        defaultValidationMessages: { valueMissingNoLabel: '' },
        dynamicProps,
      });
    }
    if (!timeControlDS.getField('biddingSupplementPriceEndDate')) {
      timeControlDS.addField('biddingSupplementPriceEndDate', {
        label: intl
          .get(`ssrc.inquiryHall.model.inquiryHall.biddingSupplementPriceEndDate`)
          .d(`补充单价截止时间`),
        name: 'biddingSupplementPriceEndDate',
        type: 'dateTime',
        // format: getDateTimeFormat(),
        disabled,
        computedProps: {
          min({ record }) {
            if (disabled) {
              return null;
            }

            const { biddingSupplementPriceStartDate } = record.get([
              'biddingSupplementPriceStartDate',
            ]);

            if (biddingSupplementPriceStartDate) {
              return moment(biddingSupplementPriceStartDate).add(1, 's');
            }

            return 'ssrcCustomCurrentNewDateTime';
          },
        },
        dynamicProps: {
          required({ record }) {
            if (disabled) {
              return false;
            }
            const biddingSupplementPriceRunningDurationFlag = record.get(
              'biddingSupplementPriceRunningDurationFlag'
            );
            return biddingSupplementPriceRunningDurationFlag === 0 && required;
          },
        },
      });
    }
    if (!timeControlDS.getField('biddingSupplementPriceEndWrap')) {
      timeControlDS.addField('biddingSupplementPriceEndWrap', {
        name: 'biddingSupplementPriceEndWrap',
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.biddingSupplementPrice`).d(`补充单价`),
      });
    }
  }

  // 延时时长
  if (name === 'autoDeferDuration') {
    const dynamicProps = field || {};
    timeControlDS.addField(name, {
      name,
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.autoDeferDuration`).d('延时时长'),
      ...dynamicProps,
      required,
      disabled,
    });
  }
}

export { biddingTimeDS, addBiddingTimeDSField };
