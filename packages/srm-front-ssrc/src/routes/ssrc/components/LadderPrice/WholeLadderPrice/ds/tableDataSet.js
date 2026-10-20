import React from 'react';
import { isEmpty } from 'lodash';

import intl from 'utils/intl';
import { SRM_SSRC } from '_utils/config';
import {
  getLadderFrom,
  getLadderTo,
  getPriceName,
  getNetPriceName,
  // getLadderPriceName,
  // getNetLadderPriceName,
} from '@/utils/utils';

import { NumberMin, NumberMax } from '@/utils/constants';

const tableDS = (options = {}) => {
  const { readOnly = false, isUnTaxPriceFlag, doubleUnitFlag = false, offlineEntryRemote } =
    options || {};

  return {
    primaryKey: readOnly ? 'rfxLadderLineNum' : 'offlineLadderQuotationId',
    autoQuery: false,
    selection: readOnly ? false : 'multiple',
    paging: false,
    cacheSelection: false,
    fields: [
      {
        label: intl.get(`ssrc.supplierQuotation.model.supQuo.lineNo.`).d('行号'),
        name: 'rfxLadderLineNum',
      },
      {
        label: (
          <span>
            {intl.get(`ssrc.supplierQuotation.model.supQuo.ladderFrom`).d('数量从')}
            {`(>=)`}
          </span>
        ),
        name: 'secondaryLadderFrom',
        type: 'number',
        min: NumberMin,
        step: 0,
        dynamicProps: {
          required() {
            return doubleUnitFlag;
          },
        },
      },
      {
        label: (
          <span>
            {intl.get(`ssrc.supplierQuotation.model.supQuo.ladderTo`).d('数量至')}
            {`(<)`}
          </span>
        ),
        name: 'secondaryLadderTo',
        type: 'number',
        step: 0,
        min: NumberMin,
        dynamicProps: {
          required({ record, dataSet }) {
            const tableLength = dataSet.length;
            const lastRfxLadderLineNum = tableLength
              ? dataSet.get(tableLength - 1)?.get('rfxLadderLineNum')
              : null;
            const currentRfxLadderLineNum = record.get('rfxLadderLineNum');
            const lastRecordRequiredFlag =
              currentRfxLadderLineNum && currentRfxLadderLineNum !== lastRfxLadderLineNum;

            const flag = lastRecordRequiredFlag && doubleUnitFlag;

            return flag;
          },
        },
      },
      {
        label: (
          <span>
            {getLadderFrom(doubleUnitFlag)}
            {`(>=)`}
          </span>
        ),
        name: 'ladderFrom',
        min: NumberMin,
        type: 'number',
        step: 0,
        dynamicProps: {
          required() {
            return !doubleUnitFlag;
          },
          disabled() {
            return doubleUnitFlag;
          },
        },
      },
      {
        label: (
          <span>
            {getLadderTo(doubleUnitFlag)}
            {`(<)`}
          </span>
        ),
        type: 'number',
        name: 'ladderTo',
        min: NumberMin,
        step: 0,
        dynamicProps: {
          required({ record, dataSet }) {
            const tableLength = dataSet.length;
            const lastRfxLadderLineNum = tableLength
              ? dataSet.get(tableLength - 1)?.get('rfxLadderLineNum')
              : null;
            const currentRfxLadderLineNum = record.get('rfxLadderLineNum');
            const lastRecordRequiredFlag =
              currentRfxLadderLineNum && currentRfxLadderLineNum !== lastRfxLadderLineNum;

            const flag = lastRecordRequiredFlag && !doubleUnitFlag;
            return flag;
          },
          disabled() {
            return doubleUnitFlag;
          },
        },
      },
      {
        label: intl.get(`ssrc.supplierQuotation.model.supQuo.taxPrice`).d('单价(含税)'),
        name: 'currentLadderSecPrice',
        type: 'number',
        step: 0,
        min: NumberMin,
        max: NumberMax,
        dynamicProps: {
          required() {
            return doubleUnitFlag && !isUnTaxPriceFlag;
          },
          disabled() {
            return !doubleUnitFlag || isUnTaxPriceFlag;
          },
        },
      },
      {
        label: intl.get(`ssrc.supplierQuotation.model.supQuo.netPrice`).d('单价(不含税)'),
        name: 'currentNetLadderSecPrice',
        type: 'number',
        step: 0,
        min: NumberMin,
        max: NumberMax,
        dynamicProps: {
          required() {
            return doubleUnitFlag && isUnTaxPriceFlag;
          },
          disabled() {
            return !doubleUnitFlag || !isUnTaxPriceFlag;
          },
        },
      },
      {
        label: getPriceName(doubleUnitFlag),
        name: 'currentLadderPrice',
        type: 'number',
        step: 0,
        min: NumberMin,
        max: NumberMax,
        dynamicProps: {
          required() {
            return !doubleUnitFlag && !isUnTaxPriceFlag;
          },
          disabled() {
            return doubleUnitFlag || isUnTaxPriceFlag;
          },
        },
      },
      {
        label: getNetPriceName(doubleUnitFlag),
        name: 'currentNetLadderPrice',
        type: 'number',
        step: 0,
        min: NumberMin,
        max: NumberMax,
        dynamicProps: {
          required() {
            return !doubleUnitFlag && isUnTaxPriceFlag;
          },
          disabled() {
            return doubleUnitFlag || !isUnTaxPriceFlag;
          },
        },
      },
      // {
      //   label: intl.get(`ssrc.supplierQuotation.model.supQuo.isCumulativeFlag`).d('是否累计阶梯'),
      //   name: 'cumulativeFlag',
      //   type: 'boolean',
      //   trueValue: 1,
      //   falseValue: 0,
      // },
      // {
      //   label: intl
      //     .get(`ssrc.supplierQuotation.model.supQuo.validLadderTaxPrice`)
      //     .d('有效阶梯报价（含税）'),
      //   name: 'validLadderSecPrice',
      // },
      // {
      //   label: intl
      //     .get(`ssrc.supplierQuotation.model.supQuo.validLadderNetPrice`)
      //     .d('有效阶梯报价(不含税)'),
      //   name: 'validNetLadderSecPrice',
      // },
      // {
      //   label: getLadderPriceName(doubleUnitFlag),
      //   name: 'validLadderPrice',
      // },
      // {
      //   label: getNetLadderPriceName(doubleUnitFlag),
      //   name: 'validNetLadderPrice',
      // },
      // {
      //   label: intl.get(`ssrc.supplierQuotation.model.supQuo.validBargainPrice`).d('还价-单价'),
      //   name: 'validBargainPrice',
      // },
      // {
      //   label: intl.get(`ssrc.supplierQuotation.model.supQuo.counterOfferReason`).d('还价理由'),
      //   name: 'validBargainRemark',
      // },
      // {
      //   label: intl.get(`hzero.common.remark`).d('备注'),
      //   name: 'remark',
      // },
      { name: 'offlineLadderQuotationId' },
      {
        name: 'currencyCode',
        type: 'string',
      },
    ],
    transport: {
      read: ({ dataSet }) => {
        const queryParams = dataSet.getQueryParameter('QUERY');
        const { organizationId } = queryParams || {};
        const url = `${SRM_SSRC}/v1/${organizationId}/rfx-offline-ladder-quotations`;

        return {
          url,
          method: 'GET',
          data: queryParams,
        };
      },
      submit: ({ dataSet, data }) => {
        const queryParams = dataSet.getQueryParameter('QUERY');
        const { organizationId, customizeUnitCode } = queryParams;
        if (isEmpty(data)) {
          return;
        }
        const newData = data.sort((a, b) => a.rfxLadderLineNum - b.rfxLadderLineNum);
        const processData = offlineEntryRemote
          ? offlineEntryRemote.process(
              'SSRC_WHOLE_OFFLINE_COM_LADDER_PRICE_TABLE_SUBMIT_DATA',
              newData,
              { dataSet }
            )
          : newData;
        return {
          url: `${SRM_SSRC}/v1/${organizationId}/rfx-offline-ladder-quotations`,
          method: 'POST',
          data: processData,
          params: { customizeUnitCode },
        };
      },
      destroy: ({ data, dataSet }) => {
        const queryParams = dataSet.getQueryParameter('QUERY');
        const { organizationId } = queryParams;

        return {
          url: `${SRM_SSRC}/v1/${organizationId}/rfx-offline-ladder-quotations`,
          method: 'DELETE',
          data,
        };
      },
    },
  };
};

export { tableDS };
