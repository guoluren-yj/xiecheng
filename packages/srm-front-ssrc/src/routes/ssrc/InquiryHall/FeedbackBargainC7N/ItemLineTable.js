import React, { Component } from 'react';
import { Table, Attachment, Button } from 'choerodon-ui/pro';
import { Popover } from 'choerodon-ui';
import { isNil, noop } from 'lodash';
import { observer } from 'mobx-react';

import { yesOrNoRender, dateRender } from 'utils/renderer';
import intl from 'utils/intl';
import { numberSeparatorRender } from '@/utils/renderer';
import { PRIVATE_BUCKET } from '_utils/config';
import QuotationDetail from '@/routes/components/QuotationDetailNew/Detail';
import { INQUIRY, BID } from '@/utils/globalVariable';
import { renderStatusTag } from '@/routes/ssrc/RFSupplierQuotation/util';
import FileGroup from '@/routes/components/SupplierQuotationAttachment';
import C7nPrecisionInputNumber from '@/routes/components/Precision/C7nPrecisionInputNumber';

@observer
export default class ItemLineTable extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  renderRedMinPrice({ value, record = {}, name, isNeedSeparator = true }) {
    const { ssrcRemote } = this.props;
    const formatValue = isNeedSeparator ? numberSeparatorRender(value) : value;
    if (isNil(value)) return value;
    const redField = record?.get('redField');
    const colorRemote = ssrcRemote
      ? ssrcRemote?.process(
          'SSRC_INQUIRY_HALL_FEEDBACK_BARGAIN_PROCESS_ITEM_LINE_TABLE_COLOR',
          'red'
        )
      : 'red';
    return redField === name ? (
      <span style={{ color: colorRemote }}>{formatValue}</span>
    ) : (
      formatValue
    );
  }

  getColumns = () => {
    const {
      doubleUnitFlag = false,
      header = {},
      viewLadderLevel = noop,
      newQuotationFlag = false,
      sourceKey = INQUIRY,
    } = this.props;
    const { multiCurrencyFlag } = header || {};
    return [
      {
        name: 'supplierCompanyName',
        width: 150,
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
        name: 'quotationLineStatusMeaning',
        width: 100,
        renderer: ({ record }) => {
          const { quotationLineStatusMeaning, quotationLineStatus } = record.get([
            'quotationLineStatusMeaning',
            'quotationLineStatus',
          ]);

          return renderStatusTag({
            status: quotationLineStatus,
            statusMeaning: quotationLineStatusMeaning,
          });
        },
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

        renderer: ({ value, record }) =>
          value || value === 0 ? (
            <Popover placement="topLeft" content={numberSeparatorRender(value)}>
              {this.renderRedMinPrice({ value, record, name: 'validQuotationPrice' })}
            </Popover>
          ) : (
            ''
          ),
      },
      {
        name: 'validNetPrice',
        width: 100,
        renderer: ({ value, record }) =>
          this.renderRedMinPrice({ value, record, name: 'validNetPrice' }),
      },
      doubleUnitFlag
        ? {
            name: 'validQuotationSecPrice',
            width: 100,
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
            renderer: ({ value }) => numberSeparatorRender(value),
          }
        : null,
      multiCurrencyFlag === 1
        ? {
            name: 'baseQuotationPrice',
            width: 120,
            renderer: ({ value }) => numberSeparatorRender(value),
          }
        : null,
      multiCurrencyFlag === 1
        ? {
            name: 'baseNetPrice',
            width: 120,
            renderer: ({ value }) => numberSeparatorRender(value),
          }
        : null,
      {
        name: 'preQuotationPrice',
        width: 100,
        renderer: ({ value }) => numberSeparatorRender(value),
      },
      {
        name: 'priceFluctuation',
        width: 100,
      },
      {
        name: 'currentBargainPrice',
        width: 100,
        editor: (line) => {
          return (
            <C7nPrecisionInputNumber
              name="currentBargainPrice"
              currency="quotationCurrencyCode"
              record={line}
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
        renderer: ({ value }) => numberSeparatorRender(value),
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
        renderer: ({ value, record }) =>
          value === 1 ? (
            <a onClick={() => viewLadderLevel(record)}>
              {intl.get(`ssrc.inquiryHall.view.message.button.ladderLevel`).d('阶梯报价')}
            </a>
          ) : null,
      },
      {
        name: 'quotationDetailFlag',
        width: 100,
        renderer: ({ record }) => (
          <React.Fragment>
            {
              <QuotationDetail
                rowData={record}
                sourceFrom="RFX"
                allowBuyerViewFlag
                uiType="c7n-pro"
                bidFlag={sourceKey === BID}
              />
            }
          </React.Fragment>
        ),
      },
      {
        name: 'totalPrice',
        width: 140,
        renderer: ({ value }) =>
          value ? (
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
        width: 100,
        renderer: ({ value }) => numberSeparatorRender(value),
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
      {
        name: 'validExpiryDateFrom',
        width: 120,
        renderer: ({ value }) => dateRender(value),
      },
      {
        name: 'validExpiryDateTo',
        width: 120,
        renderer: ({ value }) => dateRender(value),
      },
      {
        name: 'validPromisedDate',
        width: 100,
        renderer: ({ value }) => dateRender(value),
      },
      {
        name: 'validDeliveryCycle',
        width: 120,
      },
      {
        name: 'minPurchaseQuantity',
        width: 100,
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
        renderer: ({ value }) => numberSeparatorRender(value),
      },
      {
        width: 120,
        name: 'newPrice',
        align: 'right',
      },
      {
        name: 'quotedDate',
        width: 150,
      },
      {
        name: 'attachmentUuid',
        width: 180,
        renderer: ({ value, record }) => {
          return !newQuotationFlag ? (
            <Attachment
              readOnly
              bucketName={PRIVATE_BUCKET}
              bucketDirectory="ssrc-rfx-quotationline"
              value={value}
              viewMode="popup"
              funcType="link"
            />
          ) : (
            <FileGroup name="attachmentUuid" record={record} fileType="LINE" />
          );
        },
      },
    ].filter(Boolean);
  };

  batchEditorTable = (data = {}) => {
    const { handleEditCounterOffers } = this.props;

    handleEditCounterOffers(data);
  };

  getButtons = (data) => {
    const buttons = [
      <Button
        color="primary"
        icon="auto_complete"
        funcType="flat"
        onClick={() => this.batchEditorTable(data)}
      >
        {intl.get(`ssrc.inquiryHall.view.button.counterOffersBulk`).d('批量填写还价')}
      </Button>,
    ];

    return buttons;
  };

  /**
   * render
   * @returns React.element
   */
  render() {
    const {
      itemMap = {},
      rfxLineItemId,
      sourceKey = INQUIRY,
      customizeTable = () => {},
    } = this.props;

    const dataSet = (itemMap.get(rfxLineItemId) || {}).currentTableDS;

    return (
      <React.Fragment>
        {customizeTable(
          { code: `SSRC.${sourceKey}_HALL.BARGAIN.QUOTATION_ITEM`, namespace: rfxLineItemId },
          <Table
            dataSet={dataSet}
            columns={this.getColumns()}
            buttons={this.getButtons({ ds: dataSet })}
          />
        )}
      </React.Fragment>
    );
  }
}
