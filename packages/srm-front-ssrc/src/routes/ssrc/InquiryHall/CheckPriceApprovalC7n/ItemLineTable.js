import React, { Component } from 'react';
import { Table, DataSet, Attachment } from 'choerodon-ui/pro';
import { isFunction, isNil } from 'lodash';
import { Bind } from 'lodash-decorators';
import { connect } from 'dva';
import { observer } from 'mobx-react';

import intl from 'utils/intl';

import { numberSeparatorRender } from '@/utils/renderer';
import QuotationDetail from '@/routes/components/QuotationDetailNew/Detail';
import { INQUIRY } from '@/utils/globalVariable';
import PrecisionInputNumber from '@/routes/components/Precision/PrecisionInputNumber';
import FileGroup from '@/routes/components/SupplierQuotationAttachment';

import {
  renderRoundEliminate,
  renderFlagDisplay,
  renderNumberFormatter,
  renderDiffPrice,
} from './utils/renderer';
import { itemLineTableDS } from './store/itemLineTableDS';

@connect(({ inquiryHall }) => ({
  inquiryHall,
}))
@observer
export default class ItemLineTable extends Component {
  constructor(props) {
    super(props);
    const { sourceKey, remote, onRef, itemLineTable, rfxLineItemId } = props;
    const dsProps = itemLineTableDS({ sourceKey });
    this.itemLineTableDs =
      itemLineTable[rfxLineItemId] ||
      new DataSet(
        remote
          ? remote.process('SSRC_CHECK_PRICE_NEW_APPROVAL_PROCESS_ITEM_LINE_TABLE_DSPROPS', dsProps)
          : dsProps
      );
    if (isFunction(onRef)) {
      onRef(props.rfxLineItemId, this.itemLineTableDs);
    }
  }

  componentDidMount() {
    const {
      sourceKey,
      rfxHeaderId,
      rfxLineItemId,
      doubleUnitFlag,
      expandAllFlag,
      clickAllFlag,
      headerInfoDs,
      remote,
    } = this.props;
    const { current } = headerInfoDs || {};
    const auctionDirection = current?.get('auctionDirection') || '';
    this.itemLineTableDs.setState('doubleUnitFlag', doubleUnitFlag);
    this.itemLineTableDs.setState('auctionDirection', auctionDirection);

    let currentQueryParamObj = {};
    currentQueryParamObj = remote
      ? remote.process(
          'SSRC_CHECK_PRICE_NEW_APPROVAL_PROCESS_CHECK_APPROVE_ITEMLINETABLE_PARAMS',
          currentQueryParamObj,
          { that: this }
        )
      : currentQueryParamObj;

    this.itemLineTableDs.setQueryParameter('queryData', {
      rfxHeaderId,
      rfxLineItemId,
      checkApproveFlag: 1,
      customizeUnitCode: `SSRC.${sourceKey}_HALL_CHECK_PRICE.TAB_ITEM_DTL`,
      ...(currentQueryParamObj || {}),
    });
    if (expandAllFlag && !clickAllFlag) {
      return;
    }
    this.itemLineTableDs.query();
  }

  @Bind()
  renderNetPrice(val = null, record, name) {
    let mean = '';
    const formatValue = numberSeparatorRender(val);
    const { redField } = record;

    mean = redField === name ? <span style={{ color: 'red' }}>{formatValue}</span> : formatValue;
    return mean;
  }

  /**
   * 渲染单价样式
   */
  renderValidQuotationPrice(val, record, name = '') {
    const { headerInfoDs = {} } = this.props;
    const { current } = headerInfoDs || {};
    const auctionDirection = current?.get('auctionDirection');
    // // eslint-disable-next-line
    // const newDataSource = dataSource.filter((r) => r.rfxLineItemId == rfxLineItemId);
    let mean = '';
    // const validQuotationPriceList =
    //   newDataSource &&
    //   newDataSource
    //     .filter((item) => item.validQuotationPrice !== null)
    //     .map((r) => r.validQuotationPrice);
    // const validQuotationPriceMax = Math.max(...validQuotationPriceList);
    // const validQuotationPriceMin = Math.min(...validQuotationPriceList);
    const formatValue = numberSeparatorRender(val);

    const { itemLineFloorPrice, itemLineHighestPrice, redField } =
      record?.get(['itemLineFloorPrice', 'itemLineHighestPrice', 'redField']) || {};

    if (auctionDirection === 'FORWARD') {
      mean =
        itemLineHighestPrice === val || redField === name ? (
          <span style={{ color: 'red' }}>{formatValue}</span>
        ) : (
          formatValue
        );
    } else {
      mean =
        itemLineFloorPrice === val || redField === name ? (
          <span style={{ color: 'red' }}>{formatValue}</span>
        ) : (
          formatValue
        );
    }
    return mean;
  }

  /**
   * 渲染行金额样式
   */
  renderTotalPrice(val, record) {
    // const { headerInfoDs = {} } = this.props;
    // const { current } = headerInfoDs || {};
    // const auctionDirection = current?.get('auctionDirection');
    // eslint-disable-next-line
    // const newDataSource = dataSource.filter((r) => r.rfxLineItemId == rfxLineItemId);
    // let mean = '';
    // const totalPriceList =
    //   newDataSource &&
    //   newDataSource.filter((item) => item.totalPrice !== null).map((r) => r.totalPrice);
    // const totalPriceMax = Math.max(...totalPriceList);
    // const totalPriceMin = Math.min(...totalPriceList);
    const formatValue = (
      <PrecisionInputNumber
        financial={record.get('currencyCode')}
        value={val}
        type="c7n"
        readOnly
      />
    );
    // const { itemLineFloorPrice, itemLineHighestPrice } =
    //   record?.get(['itemLineFloorPrice', 'itemLineHighestPrice']) || {};

    // if (auctionDirection === 'FORWARD') {
    //   mean =
    //     itemLineHighestPrice === val ? (
    //       <span style={{ color: 'red' }}>{formatValue}</span>
    //     ) : (
    //       formatValue
    //     );
    // } else {
    //   mean =
    //     itemLineFloorPrice === val ? (
    //       <span style={{ color: 'red' }}>{formatValue}</span>
    //     ) : (
    //       formatValue
    //     );
    // }
    return formatValue;
  }

  @Bind()
  renderFormatPrice(val = null, record, name) {
    const { remote } = this.props;
    let mean = '';
    const formatValue = numberSeparatorRender(val);
    const redField = record?.get('redField');

    const colorRemote = remote
      ? remote?.process(
          'SSRC_CHECK_PRICE_NEW_APPROVAL_PROCESS_ITEM_LINE_TABLE_COLUMNS_COLOR',
          'red'
        )
      : 'red';

    mean =
      redField === name ? <span style={{ color: colorRemote }}>{formatValue}</span> : formatValue;
    return mean;
  }

  render() {
    const {
      rfxLineItemId = undefined,
      viewLadderLevel,
      // showQuotationDetail,
      customizeTable,
      sourceKey = INQUIRY,
      doubleUnitFlag = false,
      headerInfoDs = {},
      onComparePriceHistory = () => {},
      remote,
      getAllTabTableCommonColumns,
    } = this.props;
    const { current } = headerInfoDs || {};
    const { priceTypeCode, newQuotationFlag, multiCurrencyFlag } = current
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
        name: 'companyName',
        width: 380,
        renderer: renderRoundEliminate,
      },
      {
        name: 'candidateSuggestion',
        width: 100,
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
      // 此列二开，禁止修改字段名
      {
        name: 'validQuotationPrice',
        width: 100,
        align: 'right',
        renderer: ({ value, record }) =>
          this.renderFormatPrice(value, record, 'validQuotationPrice'),
      },
      // 此列二开，禁止修改字段名
      {
        name: 'validNetPrice',
        width: 100,
        renderer: ({ value, record }) => this.renderFormatPrice(value, record, 'validNetPrice'),
      },
      doubleUnitFlag
        ? {
            name: 'validQuotationSecPrice',
            width: 100,
            align: 'right',
            renderer: ({ value, record }) =>
              this.renderFormatPrice(value, record, 'validQuotationSecPrice'),
          }
        : null,
      doubleUnitFlag
        ? {
            name: 'validNetSecondaryPrice',
            width: 100,
            renderer: ({ value, record }) =>
              this.renderFormatPrice(value, record, 'validNetSecondaryPrice'),
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
        name: 'differentPrice',
        width: 100,
        renderer: ({ record }) => renderDiffPrice(record, { headerInfoDs, doubleUnitFlag }),
      },
      multiCurrencyFlag
        ? {
            name: 'baseQuotationPrice',
            width: 120,
            renderer: ({ value, record }) =>
              this.renderFormatPrice(value, record, 'baseQuotationPrice'),
          }
        : null,
      multiCurrencyFlag
        ? {
            name: 'baseNetPrice',
            width: 120,
            renderer: ({ value, record }) => this.renderFormatPrice(value, record, 'baseNetPrice'),
          }
        : null,
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
            width: 100,
          }
        : null,
      {
        name: 'totalPrice',
        width: 120,
        align: 'right',
        renderer: ({ value, record }) => value && this.renderTotalPrice(value, record),
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
        name: 'priceBatchQuantity',
        width: 100,
        align: 'right',
      },
      {
        name: 'allottedQuantity',
        width: 120,
      },
      doubleUnitFlag
        ? {
            name: 'allottedSecondaryQuantity',
            width: 120,
          }
        : null,
      {
        name: 'allottedRatio',
        width: 120,
      },
      {
        name: 'suggestedRemark',
        width: 120,
      },
      {
        name: 'ladderInquiryFlag',
        width: 100,
        renderer: ({ value, record }) =>
          value === 1 ? (
            <a onClick={() => viewLadderLevel(record)}>
              {intl.get(`ssrc.inquiryHall.view.message.button.ladderInquiryFlag`).d('阶梯报价')}
            </a>
          ) : null,
      },
      {
        name: 'preQuotationPrice',
        width: 100,
      },
      {
        name: 'priceFluctuation',
        width: 100,
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
                'SSRC_CHECK_PRICE_NEW_APPROVAL_PROCESS_ITEM_FREIGHT_AMOUNT_PROPS',
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
        name: 'newPrice',
        width: 100,
        renderer: renderNumberFormatter,
      },
      {
        name: 'quotedDate',
        width: 150,
      },
      {
        name: 'costPrice',
        align: 'right',
        width: 100,
      },
      {
        name: 'supplierSavingAmount',
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
        name: 'supplierSavingRatio',
        width: 130,
        renderer: ({ value }) => (!isNil(value) ? `${value}%` : '-'),
      },
      {
        name: 'supplierMinMaxSuggestedRatio',
        width: 130,
        renderer: ({ value }) => (!isNil(value) ? `${value}%` : '-'),
      },
      {
        name: 'attachmentUuid',
        width: 120,
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
      ? remote.process('SSRC_CHECK_PRICE_NEW_APPROVAL_PROCESS_ITEMLINE_TABLE_COLUMNS', preColumns, {
          bidFlag: sourceKey === 'BID',
          headerInfoDs,
          that: this,
        })
      : preColumns;

    const preTableProps = {
      dataSet: this.itemLineTableDs,
      columns,
      style: { maxHeight: 450 },
      virtual: true,
      virtualCell: true,
    };

    const tableProps = remote
      ? remote.process(
          'SSRC_CHECK_PRICE_NEW_APPROVAL_PROCESS_ITEMLINE_TABLE_PROPS',
          preTableProps,
          {}
        )
      : preTableProps;
    return customizeTable(
      {
        code: `SSRC.${sourceKey}_HALL_CHECK_PRICE.TAB_ITEM_DTL`,
        namespace: rfxLineItemId,
        readOnly: remote
          ? remote.process('SSRC_CHECK_PRICE_NEW_APPROVAL_PROCESS_ITEMLINE_TABLE_READONLY', true, {
              bidFlag: sourceKey === 'BID',
            })
          : true,
      },
      <Table {...tableProps} />
    );
  }
}
