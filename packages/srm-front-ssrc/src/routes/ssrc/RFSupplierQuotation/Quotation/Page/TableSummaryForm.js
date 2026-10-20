import React, { memo, useMemo, useEffect, useLayoutEffect } from 'react';
import { Tooltip } from 'choerodon-ui/pro';
// import { Popover, } from 'choerodon-ui';
import { observer } from 'mobx-react-lite';
import { noop, isNil, isEmpty } from 'lodash';

import { numberSeparatorRender } from '@/utils/renderer';

// import intl from 'utils/intl';
import { AFBasic } from 'srm-front-boot/lib/components/AFCards';
// import CollapseForm from '_components/CollapseForm';

import Styles from '../index.less';

const TableSummaryForm = observer((props) => {
  const {
    // customizeForm = noop,
    // customizeCollapseForm = noop,
    customizeCommon = noop,
    basicFormDS = {},
    summaryFormDS,
    // custLoading,
    // organizationId,
    getCustomizeUnitCode = () => {},
    // isBidSectionData,
    quotationRemote,
  } = props;

  let customizeHiddenTimer = null;

  const { quotationScope, priceTypeCode } = basicFormDS?.current
    ? basicFormDS.current.get(['quotationScope', 'priceTypeCode'])
    : {};

  const { quotationTotalAmount } = summaryFormDS?.current
    ? summaryFormDS.current.get(['quotationTotalAmount'])
    : {};

  const partQuotationFlag = useMemo(() => quotationScope === 'PART_QUOTATION', [quotationScope]);
  const isUnTaxPriceFlag = useMemo(() => priceTypeCode && priceTypeCode === 'NET_PRICE', [
    priceTypeCode,
  ]);

  useEffect(() => {
    return () => {
      clearCustomizeHiddenTimer();
    };
  }, []);

  const clearCustomizeHiddenTimer = () => {
    if (customizeHiddenTimer) {
      clearTimeout(customizeHiddenTimer);
    }
  };

  const handlecustomizeHiddenTimer = () => {
    const container = document.querySelectorAll(
      '.ssrc-quotation-table-summary-form-wrap .c7n-pro-form .c7n-row>.c7n-col-6'
    );
    if (isEmpty(container)) {
      return;
    }

    // todo 临时方案
    for (const field of container) {
      if (field && isEmpty(field.children)) {
        if (field.style) {
          field.style.display = 'none';
        }
      }
    }
  };

  useLayoutEffect(() => {
    customizeHiddenTimer = setTimeout(handlecustomizeHiddenTimer, 2000);
  }, []);

  const renderCommonFields = ({ fieldLabel, fieldValue }) => {
    const currentFieldValue = fieldValue ?? '-';

    return (
      <div className={Styles['table-summary-form-wrap-amount-wrap-field']}>
        <span>{fieldLabel}：</span>
        <div className={Styles['table-summary-form-wrap-amount-wrap']}>
          <Tooltip title={currentFieldValue}>{currentFieldValue}</Tooltip>
        </div>
      </div>
    );
  };

  const fieldsConfigs = {
    rfxNumTitle: {
      hidden: true,
    },
    currentQuotationTotalCount: {
      useLabel: true,
      hidden: !partQuotationFlag,
      render: ({ record, name, dataSet }) => {
        const { currentQuotationTotalCount, currentQuotationTotalCountValue } = record?.get
          ? record.get(['currentQuotationTotalCount', 'currentQuotationTotalCountValue'])
          : {};

        const field = dataSet.getField(name);
        const fieldLabel = field.get('label', dataSet.current);

        let amount = currentQuotationTotalCountValue ?? currentQuotationTotalCount;
        if (isNil(amount)) {
          amount = '-';
        }

        return (
          <div className={Styles['table-summary-form-wrap-amount-wrap-field']}>
            <span>{fieldLabel}：</span>
            <div className={Styles['table-summary-form-wrap-amount-wrap']}>
              <Tooltip title={amount}>{amount}</Tooltip>
            </div>
          </div>
        );
      },
    },
    currentTotalAmount: {
      useLabel: true,
      render: ({ record, name, dataSet }) => {
        const {
          quotationCurrentTotalAmount,
          quotationCurrentNetAmount,
          quotationCurrentTotalAmountValue,
          quotationCurrentNetAmountValue,
        } = record?.get
          ? record.get([
              'quotationCurrentTotalAmount',
              'quotationCurrentNetAmount',
              'quotationCurrentTotalAmountValue',
              'quotationCurrentNetAmountValue',
            ])
          : {};

        const field = dataSet.getField(name);
        const fieldLabel = field.get('label', dataSet.current);

        let amount = quotationCurrentTotalAmountValue ?? quotationCurrentTotalAmount;
        if (isUnTaxPriceFlag) {
          amount = quotationCurrentNetAmountValue ?? quotationCurrentNetAmount;
        }

        const amountText = numberSeparatorRender(amount);

        return (
          <div className={Styles['table-summary-form-wrap-amount-wrap-field']}>
            {fieldLabel}：
            <div className={Styles['table-summary-form-wrap-amount-wrap']}>
              <Tooltip title={amountText}>{amountText}</Tooltip>
            </div>
          </div>
        );
      },
    },
    quotationLineNumber: {
      useLabel: true,
      hidden: !partQuotationFlag,
      render: ({ record, name, dataSet }) => {
        const { quotationLineNumber } = record?.get ? record.get(['quotationLineNumber']) : {};

        const amountText = numberSeparatorRender(quotationLineNumber);
        const field = dataSet.getField(name);
        const fieldLabel = field.get('label', dataSet.current);

        return (
          <div className={Styles['table-summary-form-wrap-amount-wrap-field']}>
            {fieldLabel}：
            <div className={Styles['table-summary-form-wrap-amount-wrap']}>
              <Tooltip title={amountText}>{amountText}</Tooltip>
            </div>
          </div>
        );
      },
    },
    quotationTotalAmount: {
      useLabel: true,
      hidden: isNil(quotationTotalAmount),
      render: ({ value, name, dataSet }) => {
        const amountText = numberSeparatorRender(value);
        const field = dataSet.getField(name);
        const fieldLabel = field.get('label', dataSet.current);

        return (
          <div className={Styles['table-summary-form-wrap-amount-wrap-field']}>
            {fieldLabel}：
            <div className={Styles['table-summary-form-wrap-amount-wrap']}>
              <Tooltip title={amountText}>{amountText}</Tooltip>
            </div>
          </div>
        );
      },
    },
  };

  const FieldConfigsObj = quotationRemote
    ? quotationRemote.process(
        'SSRC_SUPPLIER_QUOTATION_NEW_PROCESS_TABLE_SUMMARY_FORM_FIELDS_CONFIG',
        fieldsConfigs,
        {
          ...props,
          renderCommonFields,
        }
      )
    : fieldsConfigs;

  return (
    <div className={Styles['ssrc-quotation-table-summary-form-wrapper-new']}>
      {customizeCommon(
        {
          code: getCustomizeUnitCode('tableSummary'),
          processUnitTag: 'AF-BASIC',
        },
        <AFBasic
          dataSet={summaryFormDS}
          titleField="rfxNumTitle"
          tagFields={['biddingMode', 'currencyCode']}
          normalFields={[
            'currentQuotationTotalCount',
            'currentTotalAmount',
            'quotationLineNumber',
            'quotationTotalAmount',
          ]}
          fieldsConfig={FieldConfigsObj}
        />
      )}
    </div>
  );

  // return (
  //   <div>
  //     {customizeCollapseForm(
  //       {
  //         code: getCustomizeUnitCode('tableSummary'),
  //         dataSet: summaryFormDS,
  //         gutter: 6,
  //       },
  //       <CollapseForm
  //         dataSet={summaryFormDS}
  //         labelLayout="horizontal"
  //         layout="none"
  //         showLines={1}
  //         columns={4}
  //         custLoading={custLoading}
  //         labelWidth={120}
  //         useColon={false}
  //         wrapperClassName="ssrc-quotation-table-summary-form-wrap"
  //         firstShowFields={[
  //           'currentQuotationTotalCount',
  //           'currentTotalAmount',
  //           'quotationLineNumber',
  //           'quotationTotalAmount',
  //         ]}
  //       >
  //         <Row gutter={6}>
  //           {partQuotationFlag ? (
  //             <Col span={6}>
  //               <Form.Item>
  //                 <Output
  //                   name="currentQuotationTotalCount"
  //                   renderer={({ record }) => {
  //                     const {
  //                       currentQuotationTotalCount,
  //                       currentQuotationTotalCountValue,
  //                     } = record?.get
  //                       ? record.get([
  //                           'currentQuotationTotalCount',
  //                           'currentQuotationTotalCountValue',
  //                         ])
  //                       : {};

  //                     const amount = currentQuotationTotalCountValue ?? currentQuotationTotalCount;
  //                     if (isNil(amount)) {
  //                       return '-';
  //                     }

  //                     return (
  //                       <span>
  //                         {partQuotationFlag && !isBidSectionData
  //                           ? numberSeparatorRender(amount)
  //                           : '-'}
  //                       </span>
  //                     );
  //                   }}
  //                 />
  //               </Form.Item>
  //             </Col>
  //           ) : (
  //             ''
  //           )}
  //           <Col span={6}>
  //             <Form.Item>
  //               <Output
  //                 name="currentTotalAmount"
  //                 renderer={({ record }) => {
  //                   const {
  //                     quotationCurrentTotalAmount,
  //                     quotationCurrentNetAmount,
  //                     quotationCurrentTotalAmountValue,
  //                     quotationCurrentNetAmountValue,
  //                   } = record?.get
  //                     ? record.get([
  //                         'quotationCurrentTotalAmount',
  //                         'quotationCurrentNetAmount',
  //                         'quotationCurrentTotalAmountValue',
  //                         'quotationCurrentNetAmountValue',
  //                       ])
  //                     : {};

  //                   let amount = quotationCurrentTotalAmountValue ?? quotationCurrentTotalAmount;
  //                   if (isUnTaxPriceFlag) {
  //                     amount = quotationCurrentNetAmountValue ?? quotationCurrentNetAmount;
  //                   }

  //                   const amountText = numberSeparatorRender(amount);

  //                   return (
  //                     <div className={Styles['table-summary-form-wrap-amount-wrap']}>
  //                       <Popover content={amountText}>{amountText}</Popover>
  //                     </div>
  //                   );
  //                 }}
  //               />
  //             </Form.Item>
  //           </Col>

  //           {partQuotationFlag ? (
  //             <Col span={6}>
  //               <Form.Item>
  //                 <Output name="quotationLineNumber" />
  //               </Form.Item>
  //             </Col>
  //           ) : (
  //             ''
  //           )}
  //           {!isNil(quotationTotalAmount) ? (
  //             <Col span={6}>
  //               <Form.Item>
  //                 <Output
  //                   name="quotationTotalAmount"
  //                   renderer={({ value }) => {
  //                     const amountText = numberSeparatorRender(value);

  //                     return (
  //                       <div className={Styles['table-summary-form-wrap-amount-wrap']}>
  //                         <Popover content={amountText}>{amountText}</Popover>
  //                       </div>
  //                     );
  //                   }}
  //                 />
  //               </Form.Item>
  //             </Col>
  //           ) : (
  //             ''
  //           )}
  //         </Row>
  //       </CollapseForm>
  //     )}
  //   </div>
  // );
});

export default memo(TableSummaryForm);
