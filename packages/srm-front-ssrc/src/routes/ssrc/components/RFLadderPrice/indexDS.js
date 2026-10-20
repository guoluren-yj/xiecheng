import intl from 'utils/intl';
import { SRM_SSRC } from '_utils/config';
import { math } from 'choerodon-ui/dataset';
import { getCurrentOrganizationId } from 'utils/utils';

import { getPriceName, getNetPriceName, getLadderFrom, getLadderTo } from '@/utils/utils';

const organizationId = getCurrentOrganizationId();

const ladderQuotationTableDS = ({
  benchmarkPriceType,
  taxRate = 0,
  abandonedFlag,
  doubleUnitFlag = false,
}) => ({
  primaryKey: 'ladderQuotationId',
  selection: 'multiple',
  paging: false,
  fields: [
    {
      name: 'rfLadderLineNum',
      type: 'string',
      label: intl.get('ssrc.rf.model.rf.rfLadderLineNum').d('行号'),
    },
    {
      label: `${intl.get(`ssrc.common.model.common.ladderFrom`).d('数量从')}(>=)`,
      name: 'secondaryLadderFrom',
      type: 'number',
      min: 0,
      max: '99999999999999999999',
      required: doubleUnitFlag,
    },
    {
      label: `${intl.get(`ssrc.common.model.common.ladderTo`).d('数量至')}(<)`,
      name: 'secondaryLadderTo',
      type: 'number',
      min: 0,
      max: '99999999999999999999',
      dynamicProps: {
        required: ({ record, dataSet }) => {
          return doubleUnitFlag && record.index < dataSet.length - 1;
        },
      },
    },
    {
      label: `${getLadderFrom(doubleUnitFlag)}(>=)`,
      name: 'ladderFrom',
      type: 'number',
      min: 0,
      disabled: doubleUnitFlag,
      required: !doubleUnitFlag,
      max: '99999999999999999999',
    },
    {
      label: `${getLadderTo(doubleUnitFlag)}(<)`,
      name: 'ladderTo',
      type: 'number',
      min: 0,
      max: '99999999999999999999',
      disabled: doubleUnitFlag,
      dynamicProps: {
        required: ({ record, dataSet }) => {
          return !doubleUnitFlag && record.index < dataSet.length - 1;
        },
      },
    },
    {
      name: 'validLadderSecondaryPrice',
      type: 'number',
      min: 0,
      label: intl.get(`ssrc.common.model.common.taxPrice`).d('单价(含税)'),
      max: '99999999999999999999',
      dynamicProps: {
        disabled() {
          return benchmarkPriceType === 'NET_PRICE' || abandonedFlag;
        },
        required() {
          return doubleUnitFlag && benchmarkPriceType !== 'NET_PRICE';
        },
      },
    },
    {
      name: 'validNetLadderSecPrice',
      type: 'number',
      min: 0,
      label: intl.get(`ssrc.common.model.common.netPrice`).d('单价(不含税)'),
      max: '99999999999999999999',
      dynamicProps: {
        disabled() {
          return benchmarkPriceType !== 'NET_PRICE' || abandonedFlag;
        },
        required() {
          return doubleUnitFlag && benchmarkPriceType === 'NET_PRICE';
        },
      },
    },
    {
      name: 'validLadderPrice',
      type: 'number',
      min: 0,
      label: getPriceName(doubleUnitFlag),
      max: '99999999999999999999',
      dynamicProps: {
        disabled() {
          return doubleUnitFlag || benchmarkPriceType === 'NET_PRICE' || abandonedFlag;
        },
        required() {
          return !doubleUnitFlag && benchmarkPriceType !== 'NET_PRICE';
        },
      },
    },
    {
      name: 'validNetLadderPrice',
      type: 'number',
      min: 0,
      label: getNetPriceName(doubleUnitFlag),
      max: '99999999999999999999',
      dynamicProps: {
        disabled() {
          return doubleUnitFlag || benchmarkPriceType !== 'NET_PRICE' || abandonedFlag;
        },
        required() {
          return !doubleUnitFlag && benchmarkPriceType === 'NET_PRICE';
        },
      },
    },
    {
      name: 'remark',
      type: 'string',
      label: intl.get('ssrc.rf.model.rf.remark').d('备注'),
    },
    {
      name: 'ladderRemark',
      type: 'string',
      label: intl.get('ssrc.rf.model.rf.remark').d('备注'),
    },
  ],

  events: {
    // load: ({ dataSet }) => {
    //   const { records } = dataSet;
    //   records.forEach((record = {}) => {
    //     const ladderQuotationId = record.get('ladderQuotationId');
    //     const rfLadderLineNum = record.get('rfLadderLineNum');
    //     if (ladderQuotationId && rfLadderLineNum < records.length) {
    //       Object.assign(record, { selectable: false });
    //     }
    //   });
    // },
    update: ({ record, name, value }) => {
      const rate = 1 + (taxRate / 100 || 0);
      if (name === 'validLadderPrice') {
        record.set('validNetLadderPrice', math.div(value, rate));
      } else if (name === 'validNetLadderPrice') {
        record.set('validLadderPrice', math.multipliedBy(value, rate));
      }
    },
  },

  transport: {
    read: ({ dataSet }) => {
      const {
        queryParameter: { quotationLineId },
      } = dataSet;
      return {
        url: `${SRM_SSRC}/v1/${organizationId}/rf-ladder-quotations/${quotationLineId}`,
        method: 'GET',
      };
    },
    submit: ({ dataSet }) => {
      const {
        queryParameter: { quotationLineId },
        records,
      } = dataSet;
      const dataSource = records.map((i, index) => ({ ...i.toData(), rfLadderLineNum: index + 1 }));
      return {
        url: `${SRM_SSRC}/v1/${organizationId}/rf-ladder-quotations/${quotationLineId}`,
        method: 'POST',
        data: dataSource,
      };
    },
    destroy: ({ data }) => {
      return {
        url: `${SRM_SSRC}/v1/${organizationId}/rf-ladder-quotations`,
        method: 'DELETE',
        data,
      };
    },
  },
});

export { ladderQuotationTableDS };
