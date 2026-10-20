import intl from 'utils/intl';
import { PRIVATE_BUCKET, SRM_SSRC } from '_utils/config';
import moment from 'moment';

import { omit } from 'lodash';

import { getDateTimeFormat } from 'utils/utils';

const resumeBidDS = (payload = {}) => {
  const { submitParams: commonProps } = payload || {};
  return {
    selection: false,
    autoCreate: true,
    fields: [
      {
        label: intl.get(`ssrc.biddingHall.model.ResumeBid.innerReason`).d('启动内部理由'),
        name: 'processRemark',
        type: 'string',
        maxLength: 500,
        required: true,
      },
      {
        label: intl.get(`ssrc.biddingHall.model.ResumeBid.outerReason`).d('启动外部理由'),
        name: 'processExternalRemark',
        type: 'string',
        maxLength: 500,
        required: true,
      },
      {
        name: 'processAttachmentUuid',
        type: 'attachment',
        label: intl.get(`ssrc.biddingHall.model.ResumeBid.attachment`).d('启动附件'),
        bucketName: PRIVATE_BUCKET,
        bucketDirectory: 'ssrc-bidding',
      },
    ],
    transport: {
      submit: ({ data, params = {} }) => {
        // const { commonProps = {} } = data;
        const { organizationId, customizeUnitCode, ...otherCommonProps } = commonProps;

        if (!organizationId) {
          return;
        }
        const submitData = omit(data[0] || {}, '__id', '_status');
        return {
          url: `${SRM_SSRC}/v1/${organizationId}/bidding/header/resume`,
          method: 'POST',
          params: {
            ...(params || {}),
            customizeUnitCode,
          },
          data: { ...otherCommonProps, ...submitData },
        };
      },
    },
  };
};

const pauseBidDS = (payload) => {
  const { submitParams: commonProps } = payload || {};

  return {
    selection: false,
    autoCreate: true,
    fields: [
      {
        label: intl.get(`ssrc.biddingHall.model.pauseBid.innerReason`).d('暂停内部理由'),
        name: 'processRemark',
        type: 'string',
        maxLength: 500,
        required: true,
      },
      {
        label: intl.get(`ssrc.biddingHall.model.pauseBid.outerReason`).d('暂停外部理由'),
        name: 'processExternalRemark',
        type: 'string',
        maxLength: 500,
        required: true,
      },
      {
        name: 'processAttachmentUuid',
        type: 'attachment',
        label: intl.get(`ssrc.biddingHall.model.pauseBid.attachment`).d('暂停理由附件'),
        bucketName: PRIVATE_BUCKET,
        bucketDirectory: 'ssrc-bidding',
      },
    ],
    transport: {
      submit: ({ data, params }) => {
        const { organizationId, customizeUnitCode, ...otherCommonProps } = commonProps;

        if (!organizationId) {
          return;
        }
        const submitData = omit(data[0] || {}, '__id', '_status');
        return {
          url: `${SRM_SSRC}/v1/${organizationId}/bidding/header/pause`,
          method: 'POST',
          params: {
            ...(params || {}),
            customizeUnitCode,
          },
          data: { ...otherCommonProps, ...submitData },
        };
      },
    },
  };
};

const hangeTimeDS = () => {
  return {
    selection: false,
    autoCreate: true,
    fields: [
      {
        label: intl
          .get(`ssrc.biddingHall.model.currentBiddingFormalLadtedTime`)
          .d('当前竞价剩余时间'),
        name: 'currentBiddingFormalLadtedTime',
        type: 'string',
        disabled: true,
      },
      {
        label: intl
          .get('ssrc.inquiryHall.model.inquiryHall.afterAdjustBiddingEndTime')
          .d('调整后竞价剩余时间'),
        name: 'adjustQuotationRunningDuration',
        type: 'number',
      },
      {
        name: 'biddingRunnintDay',
        type: 'number',
        placeholder: intl.get('hzero.common.date.unit.day').d('天'),
        min: 0,
        defaultValidationMessages: { valueMissingNoLabel: '' },
        dynamicProps: {
          required({ record }) {
            const { biddingRunnintDay, biddingRunnintHour, biddingRunnintMinute } = record.get([
              'biddingRunnintDay',
              'biddingRunnintHour',
              'biddingRunnintMinute',
            ]);

            const flag = !biddingRunnintDay && !biddingRunnintMinute && !biddingRunnintHour;

            return flag;
          },
        },
      },
      {
        name: 'biddingRunnintHour',
        type: 'number',
        min: 0,
        precision: 0,
        defaultValidationMessages: { valueMissingNoLabel: '' },
        placeholder: intl.get('hzero.common.date.unit.hours').d('小时'),
        dynamicProps: {
          required({ record }) {
            const { biddingRunnintDay, biddingRunnintHour, biddingRunnintMinute } = record.get([
              'biddingRunnintDay',
              'biddingRunnintHour',
              'biddingRunnintMinute',
            ]);

            const flag = !biddingRunnintDay && !biddingRunnintMinute && !biddingRunnintHour;

            return flag;
          },
        },
      },
      {
        name: 'biddingRunnintMinute',
        type: 'number',
        precision: 1,
        min: 0,
        // step: 0.1,
        defaultValidationMessages: { valueMissingNoLabel: '' },
        placeholder: intl.get('hzero.common.date.unit.minutes').d('分钟'),
        dynamicProps: {
          required({ record }) {
            const { biddingRunnintDay, biddingRunnintHour, biddingRunnintMinute } = record.get([
              'biddingRunnintDay',
              'biddingRunnintHour',
              'biddingRunnintMinute',
            ]);

            const flag = !biddingRunnintDay && !biddingRunnintMinute && !biddingRunnintHour;

            return flag;
          },
        },
      },
      /**
       * 补充单价
       */
      {
        label: intl
          .get(`ssrc.inquiryHall.model.inquiryHall.biddingSupplementPriceStartDate`)
          .d(`补充单价开始时间`),
        name: 'biddingSupplementPriceStartDate',
        type: 'dateTime',
        format: getDateTimeFormat(),
        computedProps: {
          // required({ record }) {
          //   const {
          //     totalPriceTotalPriceRequiredFlag,
          //     biddingSupplementPriceStartFlag,
          //     autoDeferFlag,
          //   } = record.get(['totalPriceTotalPriceRequiredFlag', 'biddingSupplementPriceStartFlag']);
          //   const flag =
          //     totalPriceTotalPriceRequiredFlag &&
          //     !biddingSupplementPriceStartFlag &&
          //     !autoDeferFlag;

          //   return flag;
          // },
          disabled({ record }) {
            const {
              totalPriceTotalPriceRequiredFlag,
              biddingSupplementPriceStartFlag,
              autoDeferFlag,
            } = record.get([
              'totalPriceTotalPriceRequiredFlag',
              'biddingSupplementPriceStartFlag',
              'autoDeferFlag',
            ]);
            const flag =
              !totalPriceTotalPriceRequiredFlag || biddingSupplementPriceStartFlag || autoDeferFlag;

            return flag;
          },
          min({ record }) {
            const { currentTime, biddingSupplementPriceStartFlag } = record.get([
              'currentTime',
              'biddingSupplementPriceStartFlag',
            ]);
            const currentField = record.getField('biddingSupplementPriceStartDate');

            const disabledFlag = currentField?.get('disabled');
            const readOnlyFlag = currentField?.get('readOnly');
            if (disabledFlag || readOnlyFlag || biddingSupplementPriceStartFlag) {
              return null;
            }

            const min = currentTime || new Date();

            return min;
          },
          max({ record }) {
            const {
              biddingSupplementPriceEndDate,
              biddingSupplementPriceRunningDurationFlag,
            } = record.get([
              'biddingSupplementPriceEndDate',
              'biddingSupplementPriceRunningDurationFlag',
            ]);

            const currentField = record.getField('biddingSupplementPriceStartDate');

            const disabledFlag = currentField?.get('disabled');
            const readOnlyFlag = currentField?.get('readOnly');
            if (disabledFlag || readOnlyFlag) {
              return null;
            }

            if (biddingSupplementPriceEndDate && !biddingSupplementPriceRunningDurationFlag) {
              return moment(biddingSupplementPriceEndDate).subtract(1, 's');
            }
          },
        },
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.biddingSupplementPrice`).d(`补充单价`),
        name: 'biddingSupplementPriceStartFlag',
        // type: 'boolean',
        // trueValue: 1,
        // falseValue: 0,
        // defaultValue: 0,
      },
      {
        label: intl
          .get(`ssrc.inquiryHall.model.inquiryHall.biddingSupplementPriceEndDate`)
          .d(`补充单价截止时间`),
        name: 'biddingSupplementPriceEndDate',
        type: 'dateTime',
        format: getDateTimeFormat(),
        computedProps: {
          // required({ record }) {
          //   const {
          //     totalPriceTotalPriceRequiredFlag,
          //     biddingSupplementPriceRunningDurationFlag,
          //     autoDeferFlag,
          //   } = record.get([
          //     'totalPriceTotalPriceRequiredFlag',
          //     'biddingSupplementPriceRunningDurationFlag',
          //     'autoDeferFlag',
          //   ]);
          //   const flag =
          //     totalPriceTotalPriceRequiredFlag &&
          //     !biddingSupplementPriceRunningDurationFlag &&
          //     !autoDeferFlag;

          //   return flag;
          // },
          disabled({ record }) {
            const {
              totalPriceTotalPriceRequiredFlag,
              biddingSupplementPriceRunningDurationFlag,
              autoDeferFlag,
            } = record.get([
              'totalPriceTotalPriceRequiredFlag',
              'biddingSupplementPriceRunningDurationFlag',
              'autoDeferFlag',
            ]);
            const flag =
              !totalPriceTotalPriceRequiredFlag ||
              biddingSupplementPriceRunningDurationFlag ||
              autoDeferFlag;

            return flag;
          },
          min({ record }) {
            const {
              currentTime,
              biddingSupplementPriceStartDate,
              biddingSupplementPriceRunningDurationFlag,
              biddingSupplementPriceStartFlag,
            } = record.get([
              'currentTime',
              'biddingSupplementPriceStartDate',
              'biddingSupplementPriceRunningDurationFlag',
              'biddingSupplementPriceStartFlag',
            ]);
            const currentField = record.getField('biddingSupplementPriceEndDate');

            const disabledFlag = currentField?.get('disabled');
            const readOnlyFlag = currentField?.get('readOnly');
            let min = null;

            if (disabledFlag || readOnlyFlag || biddingSupplementPriceRunningDurationFlag) {
              return min;
            }

            // 竞价截止即开始
            if (biddingSupplementPriceStartFlag) {
              min = currentTime || new Date();
              return min;
            }

            min = biddingSupplementPriceStartDate;

            return min;
          },
        },
      },
      {
        name: 'biddingSupplementPriceRunningDuration',
        type: 'number',
        min: 0,
      },
      {
        name: 'biddingSupplementPriceRunnintDay',
        type: 'number',
        placeholder: intl
          .get('ssrc.inquiryHall.view.inquiryHall.biddingSupplementPriceRunnintDay')
          .d('补充单价时间(天)'),
        min: 0,
        precision: 0,
        defaultValidationMessages: { valueMissingNoLabel: '' },
        dynamicProps: {
          // required({ record }) {
          //   const {
          //     biddingSupplementPriceRunnintDay,
          //     biddingSupplementPriceRunnintHour,
          //     biddingSupplementPriceRunnintMinute,
          //     biddingSupplementPriceRunningDurationFlag,
          //     biddingTarget,
          //     biddingTotalPricePrinciple,
          //   } = record.get([
          //     'biddingSupplementPriceRunnintDay',
          //     'biddingSupplementPriceRunnintHour',
          //     'biddingSupplementPriceRunnintMinute',
          //     'biddingSupplementPriceRunningDurationFlag',
          //     'biddingTarget',
          //     'biddingTotalPricePrinciple',
          //   ]);
          //   const totalPriceFlag =
          //     biddingTarget === 'TOTAL_PRICE' &&
          //     biddingTotalPricePrinciple === 'TOTAL_PRICE_REQUIRED';
          //   const flag =
          //     !!biddingSupplementPriceRunningDurationFlag &&
          //     !biddingSupplementPriceRunnintDay &&
          //     !biddingSupplementPriceRunnintMinute &&
          //     !biddingSupplementPriceRunnintHour &&
          //     totalPriceFlag;
          //   return flag;
          // },
        },
      },
      {
        name: 'biddingSupplementPriceRunnintHour',
        type: 'number',
        min: 0,
        precision: 0,
        defaultValidationMessages: { valueMissingNoLabel: '' },
        placeholder: intl.get('hzero.common.date.unit.hours').d('小时'),
        dynamicProps: {
          // required({ record }) {
          //   const {
          //     biddingSupplementPriceRunnintDay,
          //     biddingSupplementPriceRunnintHour,
          //     biddingSupplementPriceRunnintMinute,
          //     biddingSupplementPriceRunningDurationFlag,
          //     biddingTarget,
          //     biddingTotalPricePrinciple,
          //   } = record.get([
          //     'biddingSupplementPriceRunnintDay',
          //     'biddingSupplementPriceRunnintHour',
          //     'biddingSupplementPriceRunnintMinute',
          //     'biddingSupplementPriceRunningDurationFlag',
          //     'biddingTarget',
          //     'biddingTotalPricePrinciple',
          //   ]);
          //   const totalPriceFlag =
          //     biddingTarget === 'TOTAL_PRICE' &&
          //     biddingTotalPricePrinciple === 'TOTAL_PRICE_REQUIRED';
          //   const flag =
          //     !!biddingSupplementPriceRunningDurationFlag &&
          //     !biddingSupplementPriceRunnintDay &&
          //     !biddingSupplementPriceRunnintMinute &&
          //     !biddingSupplementPriceRunnintHour &&
          //     totalPriceFlag;
          //   return flag;
          // },
        },
      },
      {
        name: 'biddingSupplementPriceRunnintMinute',
        type: 'number',
        precision: 1,
        min: 0,
        // step: 0.1,
        defaultValidationMessages: { valueMissingNoLabel: '' },
        placeholder: intl.get('hzero.common.date.unit.minutes').d('分钟'),
        dynamicProps: {
          // required({ record }) {
          //   const {
          //     biddingSupplementPriceRunnintDay,
          //     biddingSupplementPriceRunnintHour,
          //     biddingSupplementPriceRunnintMinute,
          //     biddingSupplementPriceRunningDurationFlag,
          //     biddingTarget,
          //     biddingTotalPricePrinciple,
          //   } = record.get([
          //     'biddingSupplementPriceRunnintDay',
          //     'biddingSupplementPriceRunnintHour',
          //     'biddingSupplementPriceRunnintMinute',
          //     'biddingSupplementPriceRunningDurationFlag',
          //     'biddingTarget',
          //     'biddingTotalPricePrinciple',
          //   ]);
          //   const totalPriceFlag =
          //     biddingTarget === 'TOTAL_PRICE' &&
          //     biddingTotalPricePrinciple === 'TOTAL_PRICE_REQUIRED';
          //   const flag =
          //     !!biddingSupplementPriceRunningDurationFlag &&
          //     !biddingSupplementPriceRunnintDay &&
          //     !biddingSupplementPriceRunnintMinute &&
          //     !biddingSupplementPriceRunnintHour &&
          //     totalPriceFlag;
          //   return flag;
          // },
        },
      },
      {
        name: 'adjustRemark',
        type: 'string',
        label: intl.get(`ssrc.inquiryHall.view.message.changeDocument`).d('变更说明'),
        required: true,
      },
      {
        name: 'autoDeferFlag',
      },
      {
        name: 'updateBiddingSupplementPriceStartDateFlag',
        type: 'number',
      },
      {
        name: 'updateBiddingSupplementPriceEndDateFlag',
        type: 'number',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.autoDeferDuration`).d('延时时长'),
        name: 'autoDeferDuration',
        type: 'number',
        disabled: true,
      },
    ],
  };
};

export { resumeBidDS, pauseBidDS, hangeTimeDS };
