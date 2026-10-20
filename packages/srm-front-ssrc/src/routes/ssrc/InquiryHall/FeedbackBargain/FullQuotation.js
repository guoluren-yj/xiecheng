import React, { useMemo, useCallback } from 'react';
import { Popover } from 'choerodon-ui';
import { Attachment } from 'choerodon-ui/pro';
import { noop, isNil } from 'lodash';
import { observer } from 'mobx-react-lite';

import intl from 'utils/intl';
import { yesOrNoRender } from 'utils/renderer';
import { numberSeparatorRender } from '@/utils/renderer';
import QuotationDetail from '@/routes/components/QuotationDetailNew/Detail';

import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import SearchBarTable from 'srm-front-boot/lib/components/SearchBarTable';
import C7nPrecisionInputNumber from '@/routes/components/Precision/C7nPrecisionInputNumber';
import FileGroup from '@/routes/components/SupplierQuotationAttachment';
import LadderLevelModal from './LadderLevelModal';

const FullQuotation = (props = {}) => {
  const {
    header,
    organizationId,
    // allLineRowSelection,
    viewLadderLevel,
    viewLadderLevelVisible,
    hideModal = noop,
    barginLadderLevelData,
    onSaveBarginLadderLine,
    LadderLevelHeaderData,
    saveLoading,
    fetchLoading,
    doubleUnitFlag = false,
    // sourceKey = INQUIRY,
    customizeTable = noop,
    custLoading,
    fullQuotationDS,
    getCustomizeUnitCode = noop,
    newQuotationFlag = false,
    ssrcRemote,
    bidFlag = false,
  } = props;
  const ladderLevelModalProps = {
    visible: viewLadderLevelVisible,
    hideModal,
    barginLadderLevelData,
    onSaveBarginLadderLine,
    LadderLevelHeaderData,
    saveLoading,
    fetchLoading,
    doubleUnitFlag,
  };

  const { multiCurrencyFlag } = header || {};

  const renderRedMinPrice = useCallback(({ value, record, name, isNeedSeparator = true }) => {
    const formatValue = isNeedSeparator ? numberSeparatorRender(value) : value;
    if (isNil(value)) return value;
    const redField = record.get('redField');
    const colorRemote = ssrcRemote
      ? ssrcRemote?.process(
          'SSRC_INQUIRY_HALL_FEEDBACK_BARGAIN_PROCESS_FULL_QUOTATION_TABLE_COLOR',
          'red'
        )
      : 'red';
    return redField === name ? (
      <span style={{ color: colorRemote }}>{formatValue}</span>
    ) : (
      formatValue
    );
  }, []);

  const columns = useMemo(
    () =>
      [
        {
          name: 'quotationLineStatus',
          width: 120,
          // sortable: true,
          renderer: ({ record }) => {
            return record.get('quotationLineStatusMeaning');
          },
        },
        {
          name: 'rfxLineItemNum',
          width: 80,
        },
        {
          name: 'itemCategoryName',
          width: 120,
        },
        {
          name: 'itemCode',
          width: 120,
          // sortable: true,
        },
        {
          name: 'itemName',
          width: 120,
          // sortable: true,
          renderer: ({ value }) =>
            value ? (
              <Popover placement="topLeft" content={value}>
                {value}
              </Popover>
            ) : (
              ''
            ),
        },
        {
          name: 'supplierCompanyName',
          width: 150,
          // sortable: true,
          renderer: ({ value }) =>
            value ? (
              <Popover placement="topLeft" content={value}>
                {value}
              </Popover>
            ) : (
              ''
            ),
        },
        {
          name: 'supplierCompanyNum',
          width: 120,
          // sortable: true,
        },
        multiCurrencyFlag === 1
          ? {
              name: 'quotationCurrencyCode',
              width: 100,
            }
          : null,
        multiCurrencyFlag === 1
          ? {
              name: 'exchangeRate',
              width: 100,
            }
          : null,
        {
          name: 'validQuotationPrice',
          width: 100,
          align: 'right',
          renderer: ({ value, record }) =>
            value || value === 0 ? (
              <Popover placement="topLeft" content={numberSeparatorRender(value)}>
                {renderRedMinPrice({ value, record, name: 'validQuotationPrice' })}
              </Popover>
            ) : (
              ''
            ),
        },
        {
          name: 'validNetPrice',
          width: 100,
          align: 'right',
          renderer: ({ value, record }) =>
            renderRedMinPrice({ value, record, name: 'validNetPrice' }),
        },
        doubleUnitFlag
          ? {
              name: 'validQuotationSecPrice',
              width: 100,
              align: 'right',
              renderer: ({ value }) =>
                value || value === 0 ? (
                  <Popover placement="topLeft" content={numberSeparatorRender(value)}>
                    {numberSeparatorRender(value)}
                  </Popover>
                ) : (
                  ''
                ),
            }
          : null,
        doubleUnitFlag
          ? {
              name: 'validNetSecondaryPrice',
              width: 100,
              align: 'right',
              renderer: ({ value }) => numberSeparatorRender(value),
            }
          : null,
        multiCurrencyFlag === 1
          ? {
              name: 'baseQuotationPrice',
              width: 120,
              align: 'right',
              renderer: ({ value }) => numberSeparatorRender(value),
            }
          : null,
        multiCurrencyFlag === 1
          ? {
              name: 'baseNetPrice',
              width: 120,
              align: 'right',
              renderer: ({ value }) => numberSeparatorRender(value),
            }
          : null,
        {
          name: 'preQuotationPrice',
          width: 120,
          align: 'right',
          renderer: ({ value }) => numberSeparatorRender(value),
        },
        {
          name: 'priceFluctuation',
          width: 100,
        },
        {
          name: 'currentBargainPrice',
          width: 100,
          align: 'right',
          editor: (record) => {
            return (
              <C7nPrecisionInputNumber
                name="currentBargainPrice"
                record={record}
                currency="quotationCurrencyCode"
                omitZeroFlag
              />
            );
          },
          renderer: ({ record, value }) =>
            numberSeparatorRender(value, record.getState('currency_precision'), {
              omitZeroFlag: true,
            }),
        },
        {
          name: 'currentBargainRemark',
          width: 100,
          editor: true,
        },
        {
          name: 'validBargainPrice',
          width: 100,
          align: 'right',
          renderer: ({ value }) =>
            value || value === 0 ? (
              <Popover placement="topLeft" content={numberSeparatorRender(value)}>
                {numberSeparatorRender(value)}
              </Popover>
            ) : (
              ''
            ),
        },
        {
          name: 'validBargainRemark',
          width: 120,
          renderer: ({ value }) =>
            value ? (
              <Popover placement="topLeft" content={value}>
                {value}
              </Popover>
            ) : (
              ''
            ),
        },
        {
          name: 'taxIncludedFlag',
          width: 100,
          renderer: ({ value }) => yesOrNoRender(value),
        },
        {
          name: 'taxRate',
          width: 100,
        },
        {
          name: 'ladderInquiryFlag',
          width: 100,
          renderer: ({ value, record }) => {
            return value === 1 ? (
              <a onClick={() => viewLadderLevel(record.toData())}>
                {intl.get(`ssrc.inquiryHall.view.message.button.ladderLevel`).d('阶梯报价')}
              </a>
            ) : null;
          },
        },
        {
          name: 'quotationDetailFlag',
          width: 100,
          renderer: ({ record }) => (
            <React.Fragment>
              {
                <QuotationDetail
                  rowData={record.toData()}
                  sourceFrom="RFX"
                  allowBuyerViewFlag
                  bidFlag={bidFlag}
                />
              }
            </React.Fragment>
          ),
        },
        {
          name: 'totalPrice',
          width: 100,
          align: 'right',
          renderer: ({ value }) =>
            value || value === 0 ? (
              <Popover placement="topLeft" content={numberSeparatorRender(value)}>
                {numberSeparatorRender(value)}
              </Popover>
            ) : (
              ''
            ),
        },
        {
          name: 'netAmount',
          width: 140,
          align: 'right',
          renderer: ({ value }) => numberSeparatorRender(value),
        },
        {
          name: 'validQuotationRemark',
          width: 100,
          renderer: ({ value }) =>
            value ? (
              <Popover placement="topLeft" content={value}>
                {value}
              </Popover>
            ) : (
              ''
            ),
        },
        {
          name: 'origin',
          width: 100,
        },
        {
          name: 'paymentTypeName',
          width: 100,
        },
        {
          name: 'paymentTermName',
          width: 100,
        },
        {
          name: 'rfxQuantity',
          width: 100,
          renderer: ({ value }) => numberSeparatorRender(value),
        },
        {
          name: 'validQuotationQuantity',
          width: 120,
          renderer: ({ value }) => numberSeparatorRender(value),
        },
        {
          name: 'uomName',
          width: 120,
        },
        doubleUnitFlag
          ? {
              name: 'secondaryQuantity',
              width: 100,
              renderer: ({ value }) => numberSeparatorRender(value),
            }
          : null,
        doubleUnitFlag
          ? {
              name: 'validQuotationSecQuantity',
              width: 100,
              renderer: ({ value }) => numberSeparatorRender(value),
            }
          : null,
        doubleUnitFlag
          ? {
              name: 'secondaryUomName',
              width: 120,
            }
          : null,
        {
          name: 'validExpiryDateFrom',
          width: 120,
        },
        {
          name: 'validExpiryDateTo',
          width: 120,
        },
        {
          name: 'validPromisedDate',
          width: 100,
        },
        {
          name: 'validDeliveryCycle',
          width: 120,
        },
        {
          name: 'minPurchaseQuantity',
          width: 100,
          renderer: ({ value }) => numberSeparatorRender(value),
        },
        {
          name: 'minPackageQuantity',
          width: 100,
        },
        {
          name: 'freightIncludedFlag',
          width: 100,
          renderer: ({ value }) => yesOrNoRender(value),
        },
        {
          name: 'freightAmount',
          width: 100,
          align: 'right',
          renderer: ({ value }) => numberSeparatorRender(value),
        },
        {
          name: 'quotedDate',
          width: 150,
        },
        {
          name: 'newPrice',
          width: 150,
        },
        {
          name: 'attachmentUuid',
          width: 180,
          renderer: ({ record }) => {
            return !newQuotationFlag ? (
              <Attachment
                readOnly
                name="attachmentUuid"
                record={record}
                viewMode="popup"
                funcType="link"
                data={{
                  tenantId: organizationId,
                }}
              />
            ) : (
              <FileGroup name="attachmentUuid" record={record} uiType="c7n-pro" fileType="LINE" />
            );
          },
        },
      ].filter(Boolean),
    [multiCurrencyFlag, fullQuotationDS, doubleUnitFlag]
  );

  const currentColumns = ssrcRemote
    ? ssrcRemote?.process(
        'SSRC_INQUIRY_HALL_FEEDBACK_BARGAIN_PROCESS_FULL_QUOTATION_TABLE_COLUMNS',
        columns,
        {
          bidFlag,
          header,
        }
      )
    : columns;

  return (
    <div style={{ marginTop: '16px' }}>
      {customizeTable(
        {
          code: getCustomizeUnitCode('allTable'),
        },
        <SearchBarTable
          clearButton
          searchCode={getCustomizeUnitCode('allTableSearch')}
          // onQuery={tableSearchQuery}
          fieldProps={{}}
          showLoading={false}
          queryBar="none"
          // searchBarConfig={{
          //   closeFilterSelector: true, // 不能切换筛选 和新建筛选了
          //   defaultExpand: false,
          //   right: {
          //     render: rightRender,
          //   },
          //   // left: {
          //   //   // render: (_, ds) => leftRender(ds),
          //   // },
          //   onQuery: tableSearchQuery,
          // }}
          bordered
          custLoading={custLoading}
          dataSet={fullQuotationDS}
          rowKey="quotationLineId"
          columns={currentColumns}
          // pagination={Paginations}
          // onAggregationChange={tableCustomAggregrationChange}
          // footer={tableFooter}
        />
      )}

      {viewLadderLevelVisible && <LadderLevelModal {...ladderLevelModalProps} />}
    </div>
  );
};

const HOCComponent = (Com) => {
  return withCustomize({
    unitCode: [
      'SSRC.INQUIRY_HALL.BARGAIN.NEW_ALL_QUOTATION',
      'SSRC.INQUIRY_HALL.BARGAIN.NEW_ALL_QUOTATION_FILTER',
      'SSRC.BID_HALL.BARGAIN.NEW_ALL_QUOTATION',
      'SSRC.BID_HALL.BARGAIN.NEW_ALL_QUOTATION_FILTER',
    ],
  })(Com);
};

export { HOCComponent };

export default HOCComponent(observer(FullQuotation));
