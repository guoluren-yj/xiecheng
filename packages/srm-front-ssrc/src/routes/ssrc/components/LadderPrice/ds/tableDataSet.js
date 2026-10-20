import React from 'react';
import { isEmpty } from 'lodash';

import intl from 'utils/intl';
import { SRM_SSRC } from '_utils/config';
import {
  getLadderFrom,
  getLadderTo,
  getPriceName,
  getNetPriceName,
  getLadderPriceName,
  getNetLadderPriceName,
} from '@/utils/utils';
import { NumberMin, NumberMax } from '@/utils/constants';

const tableDS = (options = {}) => {
  const {
    readOnly = false,
    TableFieldDisabledCommonFlag,
    isUnTaxPriceFlag,
    pageName,
    doubleUnitFlag = false,
    diyLadderQuotationFlag = 0,
  } = options || {};

  return {
    primaryKey: readOnly ? 'rfxLadderLineNum' : 'ladderQuotationCurrentId',
    autoQuery: false,
    selection: readOnly ? false : 'multiple',
    paging: false,
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
        min: 0,
        dynamicProps: {
          required() {
            return doubleUnitFlag && diyLadderQuotationFlag && !TableFieldDisabledCommonFlag && !readOnly;
          },
          disabled() {
            return TableFieldDisabledCommonFlag || !diyLadderQuotationFlag || readOnly;
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
        min: 0,
        dynamicProps: {
          required({ record, dataSet }) {
            const tableLength = dataSet.length;
            const lastRfxLadderLineNum = tableLength
              ? dataSet.get(tableLength - 1)?.get('rfxLadderLineNum')
              : null;
            const currentRfxLadderLineNum = record.get('rfxLadderLineNum');
            const lastRecordRequiredFlag =
              currentRfxLadderLineNum && currentRfxLadderLineNum !== lastRfxLadderLineNum;

            const flag =
              diyLadderQuotationFlag && !TableFieldDisabledCommonFlag && lastRecordRequiredFlag && !readOnly;
            return doubleUnitFlag && flag;
          },
          disabled() {
            return TableFieldDisabledCommonFlag || !diyLadderQuotationFlag || readOnly;
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
        min: 0,
        type: 'number',
        dynamicProps: {
          required() {
            return !doubleUnitFlag && diyLadderQuotationFlag && !TableFieldDisabledCommonFlag && !readOnly;
          },
          disabled() {
            return doubleUnitFlag || TableFieldDisabledCommonFlag || !diyLadderQuotationFlag || readOnly;
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
        min: 0,
        name: 'ladderTo',
        dynamicProps: {
          required({ record, dataSet }) {
            const tableLength = dataSet.length;
            const lastRfxLadderLineNum = tableLength
              ? dataSet.get(tableLength - 1)?.get('rfxLadderLineNum')
              : null;
            const currentRfxLadderLineNum = record.get('rfxLadderLineNum');
            const lastRecordRequiredFlag =
              currentRfxLadderLineNum && currentRfxLadderLineNum !== lastRfxLadderLineNum;

            const flag =
              diyLadderQuotationFlag && !TableFieldDisabledCommonFlag && lastRecordRequiredFlag && !readOnly;
            return !doubleUnitFlag && flag;
          },
          disabled() {
            return doubleUnitFlag || TableFieldDisabledCommonFlag || !diyLadderQuotationFlag || readOnly;
          },
        },
      },
      {
        label: intl.get(`ssrc.supplierQuotation.model.supQuo.taxPrice`).d('单价(含税)'),
        name: 'currentLadderSecPrice',
        type: 'number',
        min: '0.000000001',
        max: '999999999999999999999',
        dynamicProps: {
          min({ record }) {
            const currentField = record.getField('currentLadderSecPrice');

            if (!currentField) {
              return null;
            }
            const disabledFlag = currentField?.get('disabled');
            const readOnlyFlag = currentField?.get('readOnly');
            if (disabledFlag || readOnlyFlag) {
              return null;
            }
            return '0';
          },
          required() {
            return doubleUnitFlag && !isUnTaxPriceFlag && !TableFieldDisabledCommonFlag && !readOnly;
          },
          disabled() {
            return isUnTaxPriceFlag || TableFieldDisabledCommonFlag || readOnly;
          },
        },
      },
      {
        label: intl.get(`ssrc.supplierQuotation.model.supQuo.netPrice`).d('单价(不含税)'),
        name: 'currentNetLadderSecPrice',
        type: 'number',
        // min: NumberMin,
        max: NumberMax,
        dynamicProps: {
          min({ record }) {
            const currentField = record.getField('currentNetLadderSecPrice');

            if (!currentField) {
              return null;
            }
            const disabledFlag = currentField?.get('disabled');
            const readOnlyFlag = currentField?.get('readOnly');
            if (disabledFlag || readOnlyFlag) {
              return null;
            }
            return NumberMin;
          },
          required() {
            return doubleUnitFlag && isUnTaxPriceFlag && !TableFieldDisabledCommonFlag && !readOnly;
          },
          disabled() {
            return !isUnTaxPriceFlag || TableFieldDisabledCommonFlag || readOnly;
          },
        },
      },
      {
        label: getPriceName(doubleUnitFlag),
        name: 'currentLadderPrice',
        type: 'number',
        max: NumberMax,
        dynamicProps: {
          min({ record }) {
            const currentField = record.getField('currentLadderPrice');

            if (!currentField) {
              return null;
            }
            const disabledFlag = currentField?.get('disabled');
            const readOnlyFlag = currentField?.get('readOnly');
            if (disabledFlag || readOnlyFlag) {
              return null;
            }
            return NumberMin;
          },
          required() {
            return !doubleUnitFlag && !isUnTaxPriceFlag && !TableFieldDisabledCommonFlag && !readOnly;
          },
          disabled() {
            return doubleUnitFlag || isUnTaxPriceFlag || TableFieldDisabledCommonFlag || readOnly;
          },
        },
      },
      {
        label: getNetPriceName(doubleUnitFlag),
        name: 'currentNetLadderPrice',
        type: 'number',
        max: NumberMax,
        dynamicProps: {
          min({ record }) {
            const currentField = record.getField('currentNetLadderPrice');

            if (!currentField) {
              return null;
            }
            const disabledFlag = currentField?.get('disabled');
            const readOnlyFlag = currentField?.get('readOnly');
            if (disabledFlag || readOnlyFlag) {
              return null;
            }
            return NumberMin;
          },
          required() {
            return !doubleUnitFlag && isUnTaxPriceFlag && !TableFieldDisabledCommonFlag && !readOnly;
          },
          disabled() {
            return doubleUnitFlag || !isUnTaxPriceFlag || TableFieldDisabledCommonFlag || readOnly;
          },
        },
      },
      {
        label: intl.get(`ssrc.supplierQuotation.model.supQuo.isCumulativeFlag`).d('是否累计阶梯'),
        name: 'cumulativeFlag',
        type: 'boolean',
        trueValue: 1,
        falseValue: 0,
        dynamicProps: {
          disabled() {
            return TableFieldDisabledCommonFlag || !diyLadderQuotationFlag || readOnly;
          },
        },
      },
      {
        label: intl
          .get(`ssrc.supplierQuotation.model.supQuo.validLadderTaxPrice`)
          .d('有效阶梯报价（含税）'),
        name: 'validLadderSecPrice',
      },
      {
        label: intl
          .get(`ssrc.supplierQuotation.model.supQuo.validLadderNetPrice`)
          .d('有效阶梯报价(不含税)'),
        name: 'validNetLadderSecPrice',
      },
      {
        label: getLadderPriceName(doubleUnitFlag),
        name: 'validLadderPrice',
      },
      {
        label: getNetLadderPriceName(doubleUnitFlag),
        name: 'validNetLadderPrice',
      },
      {
        label: intl.get(`ssrc.supplierQuotation.model.supQuo.validBargainPrice`).d('还价-单价'),
        name: 'validBargainPrice',
      },
      {
        label: intl.get(`ssrc.supplierQuotation.model.supQuo.counterOfferReason`).d('还价理由'),
        name: 'validBargainRemark',
      },
      {
        label: intl.get(`hzero.common.remark`).d('备注'),
        name: 'remark',
      },
      { name: 'quotationLineCurrentId' },
      {
        name: 'currencyCode',
      },
    ],
    transport: {
      read: ({ dataSet }) => {
        const queryParams = dataSet.getQueryParameter('QUERY');
        const { organizationId, rfxLineItemId } = queryParams || {};
        let url = '';

        if (!readOnly) {
          url = `${SRM_SSRC}/v2/${organizationId}/rfx/supplier/ladder-quotation`;
        } else {
          url = `${SRM_SSRC}/v1/${organizationId}/rfx/${rfxLineItemId}/ladder-inquiry`;
          if (pageName === 'quotationHistory') {
            url = `${SRM_SSRC}/v2/${organizationId}/rfx/quotation/header/record/ladder-quotation`;
          }
        }

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
        return {
          url: `${SRM_SSRC}/v2/${organizationId}/rfx/supplier/ladder-quotation`,
          method: 'POST',
          data: newData,
          params: { customizeUnitCode },
        };
      },
      destroy: ({ data, dataSet }) => {
        const queryParams = dataSet.getQueryParameter('QUERY');
        const { organizationId } = queryParams;

        return {
          url: `${SRM_SSRC}/v2/${organizationId}/rfx/supplier/ladder-quotation`,
          method: 'DELETE',
          data,
        };
      },
    },
  };
};

export { tableDS };
