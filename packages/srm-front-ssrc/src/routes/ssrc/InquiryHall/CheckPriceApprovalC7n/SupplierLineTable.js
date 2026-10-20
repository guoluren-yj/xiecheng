import React, { Component } from 'react';
import { isFunction, isNil } from 'lodash';
import { Table, DataSet, Attachment } from 'choerodon-ui/pro';
import { observer } from 'mobx-react';

import intl from 'utils/intl';
import { yesOrNoRender } from 'utils/renderer';
import { INQUIRY } from '@/utils/globalVariable';
import PrecisionInputNumber from '@/routes/components/Precision/PrecisionInputNumber';
import FileGroup from '@/routes/components/SupplierQuotationAttachment';
import QuotationDetail from '@/routes/components/QuotationDetailNew/Detail';
import { numberSeparatorRender } from '@/utils/renderer';

import { renderFlagDisplay, renderNumberFormatter, renderDiffPrice } from './utils/renderer';
import { supplierLineTableDS } from './store/supplierLineTableDS';

@observer
export default class SupplierLineTable extends Component {
  constructor(props) {
    super(props);
    const { sourceKey, remote, supplierLineTable, rfxLineSupplierId, onRef } = props;
    const dsProps = supplierLineTableDS({ sourceKey });
    this.supplierLineTableDs =
      supplierLineTable[rfxLineSupplierId] ||
      new DataSet(
        remote
          ? remote.process(
              'SSRC_CHECK_PRICE_NEW_APPROVAL_PROCESS_SUPPLIER_LINE_TABLE_DSPROPS',
              dsProps,
              {
                sourceKey,
              }
            )
          : dsProps
      );
    if (isFunction(onRef)) {
      onRef(rfxLineSupplierId, this.supplierLineTableDs);
    }
  }

  componentDidMount() {
    const {
      sourceKey,
      rfxHeaderId,
      rfxLineSupplierId,
      doubleUnitFlag,
      expandAllFlag,
      clickAllFlag,
      remote,
    } = this.props;

    let currentQueryParamObj = {};
    currentQueryParamObj = remote
      ? remote.process(
          'SSRC_CHECK_PRICE_NEW_APPROVAL_PROCESS_CHECK_APPROVE_SUPPLIERLINETABLE_PARAMS',
          currentQueryParamObj,
          { that: this }
        )
      : currentQueryParamObj;

    this.supplierLineTableDs.setQueryParameter('queryData', {
      rfxHeaderId,
      rfxLineSupplierId,
      checkApproveFlag: 1,
      customizeUnitCode: `SSRC.${sourceKey}_HALL_CHECK_PRICE.TAB_SUPPLIER`,
      ...(currentQueryParamObj || {}),
    });
    this.supplierLineTableDs.setState('doubleUnitFlag', doubleUnitFlag);
    if (expandAllFlag && !clickAllFlag) {
      return;
    }

    this.supplierLineTableDs.query();
  }

  render() {
    const {
      rfxLineSupplierId,
      viewLadderLevel,
      customizeTable,
      sourceKey = INQUIRY,
      headerInfoDs = {},
      doubleUnitFlag = false,
      onComparePriceHistory = () => {},
      remote,
      getAllTabTableCommonColumns,
    } = this.props;

    const { current } = headerInfoDs || {};
    const { priceTypeCode, newQuotationFlag = 0, multiCurrencyFlag } = current
      ? current?.get(['priceTypeCode', 'newQuotationFlag', 'multiCurrencyFlag'])
      : {};
    const commonColumns = getAllTabTableCommonColumns ? getAllTabTableCommonColumns() : [];

    const preColumns = [
      {
        name: 'suggestedFlag',
        width: 60,
        renderer: renderFlagDisplay,
      },
      {
        name: 'rfxLineItemNum',
        width: 60,
      },
      {
        name: 'itemCode',
        width: 120,
      },
      {
        name: 'newPrice',
        width: 100,
        renderer: renderNumberFormatter,
      },
      {
        name: 'itemName',
        width: 120,
      },
      {
        name: 'stageDescription',
        width: 120,
      },
      {
        name: 'taxIncludedFlag',
        width: 100,
        renderer: renderFlagDisplay,
      },
      {
        name: 'taxRate',
        width: 100,
      },
      {
        name: 'quotationLineStatusMeaning',
        width: 100,
      },
      {
        name: 'itemSignPostPrice',
      },
      {
        name: 'validQuotationPrice',
        width: 100,
        align: 'right',
        renderer: renderNumberFormatter,
      },
      {
        name: 'validNetPrice',
        width: 100,
        renderer: renderNumberFormatter,
      },
      doubleUnitFlag
        ? {
            name: 'validQuotationSecPrice',
            width: 100,
            align: 'right',
            renderer: renderNumberFormatter,
          }
        : null,
      doubleUnitFlag
        ? {
            name: 'validNetSecondaryPrice',
            width: 100,
            renderer: renderNumberFormatter,
          }
        : null,
      {
        name: 'perNetPrice',
        width: 120,
      },
      {
        name: 'perTaxIncludedPrice',
        width: 120,
      },
      {
        name: 'priceBatchQuantity',
        width: 100,
        align: 'right',
        renderer: renderNumberFormatter,
      },
      {
        name: 'allottedQuantity',
        width: 100,
        renderer: renderNumberFormatter,
      },
      doubleUnitFlag
        ? {
            name: 'allottedSecondaryQuantity',
            width: 100,
            renderer: renderNumberFormatter,
          }
        : null,
      {
        name: 'allottedRatio',
        width: 120,
      },
      {
        name: 'suggestedRemark',
        width: 100,
      },
      {
        name: 'ladderInquiryFlag',
        width: 100,
        renderer: ({ value, record }) =>
          value === 1 ? (
            <a onClick={() => viewLadderLevel(record)}>
              {intl.get(`ssrc.inquiryHall.view.message.button.ladderLevel`).d('阶梯报价')}
            </a>
          ) : null,
      },
      {
        name: 'preQuotationPrice',
        width: 100,
        renderer: renderNumberFormatter,
      },
      {
        name: 'priceFluctuation',
        align: 'right',
        width: 100,
      },
      {
        name: 'rfxQuantity',
        width: 120,
        renderer: renderNumberFormatter,
      },
      {
        name: 'validQuotationQuantity',
        width: 120,
        renderer: renderNumberFormatter,
      },
      {
        name: 'uomName',
        width: 120,
      },
      doubleUnitFlag
        ? {
            name: 'secondaryQuantity',
            width: 100,
            renderer: renderNumberFormatter,
          }
        : null,
      doubleUnitFlag
        ? {
            name: 'validQuotationSecQuantity',
            width: 100,
            renderer: renderNumberFormatter,
          }
        : null,
      doubleUnitFlag
        ? {
            name: 'secondaryUomName',
            width: 120,
          }
        : null,
      {
        name: 'totalPrice',
        width: 80,
        align: 'right',
        renderer: ({ value, record }) => (
          <PrecisionInputNumber
            financial={record.get('currencyCode')}
            value={value}
            type="c7n"
            readOnly
          />
        ),
      },
      {
        name: 'netAmount',
        width: 140,
        renderer: ({ value, record }) => (
          <PrecisionInputNumber
            financial={record.get('currencyCode')}
            value={value}
            type="c7n"
            readOnly
          />
        ),
      },
      {
        name: 'differentPrice',
        width: 100,
        renderer: ({ record }) => renderDiffPrice(record, { headerInfoDs, doubleUnitFlag }),
      },
      {
        name: 'quotationDetailFlag',
        width: 100,
        renderer: ({ record }) => {
          const currentQuotationDetailProps = {
            rowData: record,
          };

          const quotationDetailProps = remote
            ? remote.process(
                'SSRC_CHECK_PRICE_NEW_APPROVAL_PROCESS_TABLE_COLUMNS_QUOTATIONDETAILCOMMONPROPS',
                currentQuotationDetailProps,
                {
                  bidFlag: sourceKey === 'BID',
                }
              )
            : currentQuotationDetailProps;

          return (
            <React.Fragment>
              <QuotationDetail
                sourceFrom="RFX"
                allowBuyerViewFlag
                uiType="c7n"
                pageFrom="checkPriceApprove"
                bidFlag={sourceKey === 'BID'}
                {...quotationDetailProps}
              />
            </React.Fragment>
          );
        },
      },
      multiCurrencyFlag
        ? {
            name: 'baseQuotationPrice',
            width: 120,
            align: 'right',
            renderer: renderNumberFormatter,
          }
        : null,
      multiCurrencyFlag
        ? {
            name: 'baseNetPrice',
            width: 120,
            align: 'right',
            renderer: renderNumberFormatter,
          }
        : null,
      priceTypeCode === 'TAX_INCLUDED_PRICE'
        ? {
            name: 'estimatedPrice',
            width: 100,
          }
        : {
            name: 'netEstimatedPrice',
            width: 100,
          },
      priceTypeCode === 'TAX_INCLUDED_PRICE'
        ? {
            name: 'estimatedAmount',
            width: 100,
            renderer: ({ value, record }) => (
              <PrecisionInputNumber
                financial={record.get('currencyCode')}
                value={value}
                type="c7n"
                readOnly
              />
            ),
          }
        : {
            name: 'netEstimatedAmount',
            width: 100,
            renderer: ({ value, record }) => (
              <PrecisionInputNumber
                financial={record.get('currencyCode')}
                value={value}
                type="c7n"
                readOnly
              />
            ),
          },
      {
        name: 'validQuotationRemark',
        width: 120,
      },
      {
        name: 'origin',
        width: 100,
      },
      {
        name: 'paymentTypeName',
        width: 120,
      },
      {
        name: 'paymentTermName',
        width: 120,
      },
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
        width: 100,
      },
      // 该字段二开，请勿修改字段名
      {
        name: 'minPurchaseQuantity',
        width: 100,
        renderer: renderNumberFormatter,
      },
      // 该字段二开，请勿修改字段名
      {
        name: 'minPackageQuantity',
        width: 100,
        renderer: renderNumberFormatter,
      },
      {
        name: 'freightIncludedFlag',
        width: 100,
        renderer: renderFlagDisplay,
      },
      {
        name: 'freightAmount',
        width: 100,
        renderer: ({ record, value }) => {
          let cuxFreightAmountProps = {};
          cuxFreightAmountProps = remote
            ? remote.process(
                'SSRC_CHECK_PRICE_NEW_APPROVAL_PROCESS_SUPPLIER_FREIGHT_AMOUNT_PROPS',
                cuxFreightAmountProps,
                {
                  that: this,
                  record,
                }
              )
            : cuxFreightAmountProps;
          cuxFreightAmountProps = cuxFreightAmountProps || {};

          return (
            <PrecisionInputNumber
              value={value}
              financial={record.get('quotationCurrencyCode')}
              readOnly
              {...cuxFreightAmountProps}
            />
          );
        },
      },
      {
        name: 'quotedDate',
        width: 150,
      },
      {
        name: 'itemSavingAmount',
        width: 130,
        renderer: ({ value, record }) => (
          <PrecisionInputNumber
            value={value}
            financial={record.get('currencyCode')}
            type="c7n"
            readOnly
          />
        ),
      },
      {
        name: 'itemSavingRatio',
        width: 130,
        renderer: ({ value }) => (!isNil(value) ? `${value}%` : '-'),
      },
      {
        name: 'itemMinMaxSuggestedFlag',
        width: 130,
        renderer: ({ value }) => yesOrNoRender(value),
      },
      {
        name: 'attachmentUuid',
        width: 110,
        renderer: ({ record }) => {
          return !newQuotationFlag ? (
            <Attachment
              name="attachmentUuid"
              record={record}
              readOnly
              viewMode="popup"
              funcType="link"
            />
          ) : (
            <FileGroup name="attachmentUuid" record={record} uiType="c7n-pro" fileType="LINE" />
          );
        },
      },
      {
        name: 'comparePriceHistory',
        width: 120,
        renderer: ({ record }) =>
          record.quotationLineId !== null ? (
            <a onClick={() => onComparePriceHistory(record)}>
              {intl.get(`hzero.common.button.view`).d('查看')}
            </a>
          ) : (
            ''
          ),
      },
      {
        name: 'minPrice',
        width: 100,
        renderer: ({ value }) => numberSeparatorRender(value),
      },
      ...commonColumns,
    ];

    const columns = remote
      ? remote.process('SSRC_CHECK_PRICE_NEW_APPROVAL_PROCESS_SUPPLIER_TABLE_COLUMNS', preColumns, {
          bidFlag: sourceKey === 'BID',
          headerInfoDs,
          that: this,
        })
      : preColumns;

    const preTableProps = {
      dataSet: this.supplierLineTableDs,
      columns,
      style: { maxHeight: 450 },
      virtual: true,
      virtualCell: true,
    };

    const tableProps = remote
      ? remote.process(
          'SSRC_CHECK_PRICE_NEW_APPROVAL_PROCESS_SUPPLIER_TABLE_PROPS',
          preTableProps,
          { basicInfoDs: headerInfoDs }
        )
      : preTableProps;
    return customizeTable(
      {
        code: `SSRC.${sourceKey}_HALL_CHECK_PRICE.TAB_SUPPLIER`, // 单元编码，必传
        readOnly: remote
          ? remote.process('SSRC_CHECK_PRICE_NEW_APPROVAL_PROCESS_SUPPLIER_TABLE_READONLY', true, {
              bidFlag: sourceKey === 'BID',
            })
          : true,
        namespace: rfxLineSupplierId,
      },
      <Table {...tableProps} />
    );
  }
}
