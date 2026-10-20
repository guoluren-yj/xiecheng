import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';

import { PrefixV2 } from '@/utils/globalVariable';
import { getAllottedQuantity } from '@/utils/utils';

const promptCode = 'ssrc.inquiryHall';
const organizationId = getCurrentOrganizationId();

const batchEditDS = ({ headerDs, bidFlag, checkWay, dimensionCode, doubleUnitFlag }) => ({
  primaryKey: 'uniqueKey',
  autoCreate: true,
  fields: [
    {
      name: 'suggestedFlag',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      defaultValue: 1,
      label: intl.get(`${promptCode}.model.inquiryHall.suggestedFlag`).d('是否选用'),
    },
    {
      name: 'allottedRatio',
      type: 'number',
      dynamicProps: {
        required({ record }) {
          return (
            record.get('suggestedFlag') &&
            (checkWay !== 'quantity' || dimensionCode !== 'ITEM') &&
            !doubleUnitFlag
          );
        },
        disabled({ record }) {
          return !record.get('suggestedFlag');
        },
      },
      min: 0,
      label: intl.get(`${promptCode}.model.inquiryHall.inquiryHall.allottedRatio`).d('分配比例%'),
    },
    {
      name: 'allottedQuantity',
      type: 'number',
      dynamicProps: {
        required({ record }) {
          return (
            record.get('suggestedFlag') &&
            checkWay === 'quantity' &&
            dimensionCode === 'ITEM' &&
            !doubleUnitFlag
          );
        },
        disabled({ record }) {
          return !record.get('suggestedFlag') || doubleUnitFlag;
        },
      },
      min: 0,
      label: getAllottedQuantity(doubleUnitFlag),
    },
    {
      name: 'allottedSecondaryQuantity',
      type: 'number',
      dynamicProps: {
        required({ record }) {
          return (
            doubleUnitFlag &&
            record.get('suggestedFlag') &&
            checkWay === 'quantity' &&
            dimensionCode === 'ITEM'
          );
        },
        disabled({ record }) {
          return !record.get('suggestedFlag');
        },
      },
      min: 0,
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.allottedQuantity`).d('分配数量'),
    },
    {
      name: 'suggestedRemark',
      maxLength: 500,
      dynamicProps: {
        required({ record }) {
          return record.get('suggestedFlag');
        },
        disabled({ record }) {
          return !record.get('suggestedFlag');
        },
      },
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.suggestedRemark`).d('选用理由'),
    },
  ],
  events: {
    update({ name, value, record }) {
      if (name === 'suggestedFlag' && !value) {
        record.set('allottedRatio', null);
        record.set('allottedQuantity', null);
        record.set('suggestedRemark', null);
        record.set('allottedSecondaryQuantity', null);
      }
    },
  },
  transport: {
    submit({ data, dataSet }) {
      const rfxHeaderId = headerDs.current?.get('rfxHeaderId');
      const {
        queryParameter: { queryParams },
      } = dataSet;
      return {
        method: 'POST',
        url: `${PrefixV2}/${organizationId}/rfx/check/batch/edit`,
        data: {
          rfxHeaderId,
          rfxQuotationLine: data[0],
          checkSelectionDimension: dimensionCode,
          ...queryParams,
        },
        params: {
          customizeUnitCode: bidFlag
            ? 'SSRC.NEW_BID_HALL_CHECK_PRICE_NEW.BATCH,SSRC.NEW_BID_HALL_CHECK_PRICE_NEW.QUOTATION_DETAIL'
            : 'SSRC.INQUIRY_HALL_CHECK_PRICE_NEW.BATCH,SSRC.INQUIRY_HALL_CHECK_PRICE_NEW.QUOTATION_DETAIL',
        },
      };
    },
  },
});

export { batchEditDS };
