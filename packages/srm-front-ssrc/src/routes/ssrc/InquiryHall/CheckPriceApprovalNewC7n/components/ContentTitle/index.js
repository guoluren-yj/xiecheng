import React from 'react';
import { AFExtra } from 'srm-front-boot/lib/components/AFCards';
import { observer } from 'mobx-react';
import { isNil } from 'lodash';
import { yesOrNoRender } from 'utils/renderer';
import { INQUIRY } from '@/utils/globalVariable';
import PrecisionInputNumber from '@/routes/components/Precision/PrecisionInputNumber';
import styles from './index.less';

const ContentTitle = (props = {}) => {
  const {
    basicDs,
    viewType = 'supplier',
    customizeCommon = () => {},
    sourceKey = INQUIRY,
    headerInfo = {},
    itemBasicDs,
    remote,
  } = props;

  const supplierBasicConfig = {
    benchmarkLocalSugQtnAmount: {
      renderValue({ record }) {
        const sourceName =
          headerInfo?.priceTypeCode === 'NET_PRICE'
            ? 'localSuggestedQtnNetAmount'
            : 'localSuggestedQtnTotalAmount';
        const value = (record && record?.get(sourceName)) || 0;
        return value !== 0 ? (
          <PrecisionInputNumber
            value={value}
            financial={record?.get('currencyCode')}
            type="c7n"
            readOnly
          />
        ) : (
          '-'
        );
      },
    },
    benchmarkLocalQuoAmount: {
      renderValue({ record }) {
        const sourceName =
          headerInfo?.priceTypeCode === 'NET_PRICE' ? 'supplierNetAmount' : 'supplierTotalAmount';
        const value = record && record?.get(sourceName);
        return !isNil(value) ? (
          <PrecisionInputNumber
            value={value}
            financial={record?.get('currencyCode')}
            type="c7n"
            readOnly
          />
        ) : (
          '-'
        );
      },
    },
    savingAmount: {
      renderValue({ value = 0, record }) {
        return !isNil(value) ? (
          <PrecisionInputNumber
            value={value}
            financial={record?.get('currencyCode')}
            type="c7n"
            readOnly
          />
        ) : (
          '-'
        );
      },
    },
    savingRatio: {
      renderValue({ value }) {
        return !isNil(value) ? `${value}%` : '-';
      },
    },
    minMaxSuggestedRatio: {
      renderValue({ value }) {
        return !isNil(value) ? `${value}%` : '-';
      },
    },
  };

  const itemBasicConfig = {
    benchmarkLocalSugQtnAmount: {
      renderValue({ record }) {
        const sourceName =
          headerInfo?.priceTypeCode === 'NET_PRICE'
            ? 'localSuggestedQtnNetAmount'
            : 'localSuggestedQtnTotalAmount';
        const value = (record && record?.get(sourceName)) || 0;
        return value !== 0 ? (
          <PrecisionInputNumber
            value={value}
            financial={record?.get('currencyCode')}
            type="c7n"
            readOnly
          />
        ) : (
          '-'
        );
      },
    },
    suggestedSupplierCount: {},
    savingAmount: {
      renderValue({ value = 0, record }) {
        return !isNil(value) ? (
          <PrecisionInputNumber
            value={value}
            financial={record?.get('currencyCode')}
            type="c7n"
            readOnly
          />
        ) : (
          '-'
        );
      },
    },
    savingRatio: {
      renderValue({ value }) {
        return !isNil(value) ? `${value}%` : '-';
      },
    },
    minMaxSuggestedFlag: {
      renderValue({ value }) {
        return yesOrNoRender(Number(value));
      },
    },
  };

  let showSupplierAFEXTRA = viewType === 'supplier';

  showSupplierAFEXTRA = remote
    ? remote.process(
        'SSRC_CHECK_PRICE_APPROVAL_OVERVIEW_PROCESS_CONTENT_TITLE_SHOW_SUPPLIER_PART',
        showSupplierAFEXTRA,
        {
          headerInfo,
          // headerDs,
          viewType,
        }
      )
    : showSupplierAFEXTRA;

  return (
    <div className={styles['content-table-title-box']}>
      {showSupplierAFEXTRA
        ? customizeCommon(
            {
              code: `SSRC.${sourceKey}_HALL_CHECK_PRICE_OVERVIEW.SUPPLIER_AF_EXTRA`,
              processUnitTag: 'AF-EXTRA',
            },
            <AFExtra
              dataSet={basicDs}
              fieldsConfig={supplierBasicConfig}
              fields={[
                'benchmarkLocalSugQtnAmount',
                'benchmarkLocalQuoAmount',
                'savingAmount',
                'savingRatio',
                'minMaxSuggestedRatio',
              ]}
            />
          )
        : customizeCommon(
            {
              code: `SSRC.${sourceKey}_HALL_CHECK_PRICE_OVERVIEW.ITEM_AF_EXTRA`,
              processUnitTag: 'AF-EXTRA',
            },
            <AFExtra
              dataSet={itemBasicDs}
              fieldsConfig={itemBasicConfig}
              fields={[
                'benchmarkLocalSugQtnAmount',
                'suggestedSupplierCount',
                'savingAmount',
                'savingRatio',
                'minMaxSuggestedFlag',
              ]}
            />
          )}
    </div>
  );
};

export default observer(ContentTitle);
