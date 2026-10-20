import intl from 'utils/intl';
import { SRM_SPCM } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';
import { validateBits } from '@/utils/util';

const organizationId = getCurrentOrganizationId();

// 协议返利信息
const rebateDS = (props) => {
  const { editable, pcHeaderId } = props;
  return {
    selection: editable && 'multiple',
    primaryKey: 'rebateInformationId',

    fields: [
      {
        name: 'lineNum',
        type: 'string',
        label: intl.get(`spcm.common.model.common.orderSeq`).d('序号'),
      },
      {
        name: 'saleRangeFrom',
        type: 'number',
        label: intl.get(`spcm.common.model.common.saleRangeFrom`).d('销售额区间从'),
        required: true,
        dynamicProps: {
          max: ({ record }) => record.get('saleRangeTo'),
        },
        validator: (value) => validateBits(value),
      },
      {
        name: 'saleRangeTo',
        type: 'number',
        label: intl.get(`spcm.common.model.common.saleRangeTo`).d('销售额区间至'),
        required: true,
        dynamicProps: {
          min: ({ record }) => record.get('saleRangeFrom'),
        },
        validator: (value) => validateBits(value),
      },
      {
        name: 'annualReturnRate',
        type: 'currency',
        label: intl.get(`spcm.common.model.common.annualReturnRate`).d('年度返利率（%）'),
        validator: (value, _, record) => {
          const rebateAmountVal = record.get('rebateAmount');
          if (isNaN(value) && (isNaN(rebateAmountVal) || !rebateAmountVal)) {
            return intl
              .get('spcm.common.view.message.noAnnualReturnAndrebateAmount')
              .d('年度返利率和返利金额必填其一');
          }
          return true;
        },
        dynamicProps: {
          required: ({ record }) => isNaN(record.get('rebateAmount')),
        },
      },
      {
        name: 'rebateAmount',
        type: 'number',
        label: intl.get(`spcm.common.model.common.rebateAmount`).d('返利金额'),
        validator: (value, _, record) => {
          const annualReturnVal = record.get('annualReturnRate');
          if (isNaN(value) && (isNaN(annualReturnVal) || !annualReturnVal)) {
            return intl
              .get('spcm.common.view.message.noAnnualReturnAndrebateAmount')
              .d('年度返利率和返利金额必填其一');
          }
          validateBits(value);
        },
        dynamicProps: {
          required: ({ record }) => isNaN(record.get('annualReturnRate')),
        },
      },
      {
        name: 'validityDateFrom',
        type: 'dateTime',
        label: intl.get(`spcm.common.model.common.validityDateFrom`).d('有效期从'),
        required: true,
        dynamicProps: {
          max: ({ record }) => record.get('validityDateTo'),
        },
      },
      {
        name: 'validityDateTo',
        type: 'dateTime',
        label: intl.get(`spcm.common.model.common.validityDateTo`).d('有效期至'),
        required: true,
        dynamicProps: {
          min: ({ record }) => record.get('validityDateFrom'),
        },
      },
      {
        name: 'affiliatedCompany',
        type: 'string',
        label: intl.get('spcm.common.model.common.affiliatedCompany').d('关联公司'),
      },
      {
        name: 'remark',
        type: 'string',
        label: intl.get('hzero.common.explain').d('说明'),
      },
    ],
    transport: {
      read: ({ data }) => {
        const { queryParams } = data;
        return {
          url: `${SRM_SPCM}/v1/${organizationId}/pc-rebate-informations/${pcHeaderId}/pc-rebate/page`,
          method: 'GET',
          data: queryParams,
        };
      },
      destroy: ({ data }) => {
        return {
          url: `${SRM_SPCM}/v1/${organizationId}/pc-rebate-informations/${pcHeaderId}/pc-rebate/batch`,
          method: 'DELETE',
          data,
        };
      },
    },
  };
};

export default rebateDS;
