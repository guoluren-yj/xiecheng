/**
 * 物料表格
 */
import React, { PureComponent } from 'react';
import { DataSet, Table, CheckBox, Attachment } from 'choerodon-ui/pro';
import { math } from 'choerodon-ui/dataset';
import { isFunction, noop, isNil, isEmpty } from 'lodash';
import { Bind } from 'lodash-decorators';
import { observer } from 'mobx-react';

import { dateRender } from 'utils/renderer';
import intl from 'utils/intl';

import QuotationDetail from '@/routes/components/QuotationDetailNew/Detail';
import C7nPrecisionInputNumber from '@/routes/components/Precision/C7nPrecisionInputNumber';
import PrecisionInputNumber from '@/routes/components/Precision/PrecisionInputNumber';
import { numberSeparatorRender, useTernaryExpression } from '@/utils/renderer';
import FileGroup from '@/routes/components/SupplierQuotationAttachment';
import { itemLineTableDS } from '../store/itemLineTableDS';
import { renderRoundEliminate, renderFlagDisplay, renderNumberFormatter } from '../utils/renderer';

class ItemLineTable extends PureComponent {
  constructor(props) {
    super(props);
    const {
      sourceKey,
      selectedPolicyValue,
      checkWay,
      takePrice = noop,
      doubleUnitFlag,
      remote,
      basicInfoDs,
      bidFlag,
      onRef,
      itemLineTable = {},
      rfxLineItemId,
      priceDataObj = {},
      searchPriceLoading,
    } = props;
    const dsProps = {
      ...itemLineTableDS({ sourceKey, doubleUnitFlag }),
      events: {
        ...itemLineTableDS({ sourceKey, doubleUnitFlag }).events,
        load: ({ dataSet, data }) => {
          if (typeof itemLineTableDS({ sourceKey, doubleUnitFlag }).events?.load === 'function') {
            itemLineTableDS({ sourceKey, doubleUnitFlag }).events.load({ dataSet, data });
          }
          if (isEmpty(priceDataObj) && searchPriceLoading) {
            takePrice(
              'changePercent',
              { page: dataSet.currentPage - 1, size: dataSet.pageSize },
              dataSet.toData(),
              dataSet
            );
            takePrice(
              'minPrice',
              { page: dataSet.currentPage - 1, size: dataSet.pageSize },
              dataSet.toData(),
              dataSet
            );
            takePrice(
              'newPrice',
              { page: dataSet.currentPage - 1, size: dataSet.pageSize },
              dataSet.toData(),
              dataSet
            );
          } else {
            dataSet.forEach((record) => {
              if (priceDataObj[record.get('quotationLineId')]) {
                // eslint-disable-next-line no-param-reassign
                record.data.changePercent =
                  priceDataObj[record.get('quotationLineId')].changePercent;
                // eslint-disable-next-line no-param-reassign
                record.data.minPrice = priceDataObj[record.get('quotationLineId')].minPrice;
                // eslint-disable-next-line no-param-reassign
                record.data.newPrice = priceDataObj[record.get('quotationLineId')].newPrice;
              }
            });
          }
        },
      },
    };
    this.itemLineTableDs =
      itemLineTable[rfxLineItemId] ||
      new DataSet(
        remote
          ? remote.process('SSRC_CHECK_PRICE_PROCESS_ITEMLINE_TABLE_DS', dsProps, {
              basicInfoDs,
              bidFlag,
              that: this,
            })
          : dsProps
      );
    this.itemLineTableDs.setState('selectedPolicyValue', selectedPolicyValue);
    this.itemLineTableDs.setState('checkWay', checkWay);
    const { current } = basicInfoDs || {};
    const auctionDirection = current?.get('auctionDirection');
    this.itemLineTableDs.setState('auctionDirection', auctionDirection);
    if (isFunction(onRef)) {
      onRef(rfxLineItemId, this.itemLineTableDs);
    }
  }

  getSnapshotBeforeUpdate(preProps) {
    const { selectedPolicyValue: preSelectedPolicyValue, checkWay: preCheckWay } = preProps;
    const { selectedPolicyValue, checkWay, rfxLineItemId, itemLineTable, onRef } = this.props;
    if (!itemLineTable[rfxLineItemId]) {
      if (isFunction(onRef)) {
        onRef(rfxLineItemId, this.itemLineTableDs);
        this.itemLineTableDs.query();
      }
    }
    return {
      policyChangedFlag: preSelectedPolicyValue !== selectedPolicyValue,
      checkWayChangedFlag: preCheckWay !== checkWay,
    };
  }

  componentDidUpdate(...params) {
    const { checkWay, selectedPolicyValue } = this.props;
    if (params[2]) {
      if (params[2].policyChangedFlag) {
        this.itemLineTableDs.setState('selectedPolicyValue', selectedPolicyValue);
      }
      if (params[2].checkWayChangedFlag) {
        this.itemLineTableDs.setState('checkWay', checkWay);
      }
    }
  }

  componentDidMount() {
    const {
      sourceKey,
      rfxHeaderId,
      rfxLineItemId,
      expandAllFlag,
      clickAllFlag,
      itemLineTable,
    } = this.props;
    this.itemLineTableDs.setQueryParameter('queryData', {
      rfxHeaderId,
      rfxLineItemId,
      customizeUnitCode: `SSRC.${sourceKey}_HALL_CHECK_PRICE.TAB_ITEM_DTL`,
    });
    if ((expandAllFlag && !clickAllFlag) || itemLineTable[rfxLineItemId]?.length) {
      return;
    }
    this.itemLineTableDs.query();
  }

  /**
   * 渲染单价样式 -netPrice
   */
  @Bind()
  renderNetPrice({ value, record, name }) {
    const { remote } = this.props;
    let mean = '';
    const formatValue = numberSeparatorRender(value);
    const redField = record.get('redField');
    if (isNil(value)) return value;

    const colorRemote = remote
      ? remote?.process('SSRC_CHECK_PRICE_PROCESS_ITEM_TABLE_COLUMN_COLOR', 'red')
      : 'red';
    mean =
      redField === name ? <span style={{ color: colorRemote }}>{formatValue}</span> : formatValue;
    return mean;
  }

  /**
   * 渲染差异价
   */
  @Bind()
  renderDiffPrice({ record }) {
    const { basicInfoDs, doubleUnitFlag } = this.props;
    const { current } = basicInfoDs || {};
    const {
      validNetSecondaryPrice = null,
      validQuotationSecPrice = null,
      referencePrice = null,
      validNetPrice = null,
      validQuotationPrice = null,
    } = record.get([
      'validNetSecondaryPrice',
      'validQuotationSecPrice',
      'referencePrice',
      'validNetPrice',
      'validQuotationPrice',
    ]);
    const priceTypeCode = current?.get('priceTypeCode');
    return (priceTypeCode === 'NET_PRICE'
      ? doubleUnitFlag
        ? validNetSecondaryPrice
        : validNetPrice
      : doubleUnitFlag
      ? validQuotationSecPrice
      : validQuotationPrice) !== null && referencePrice !== null
      ? numberSeparatorRender(
          math.minus(
            priceTypeCode === 'NET_PRICE'
              ? doubleUnitFlag
                ? validNetSecondaryPrice
                : validNetPrice
              : doubleUnitFlag
              ? validQuotationSecPrice
              : validQuotationPrice,
            referencePrice
          )
        )
      : null;
  }

  /**
   * 与首次价格对比
   */
  @Bind()
  renderPriceCompareToFirst({ value }) {
    if (math.gt(value, 0)) {
      return `↑ ${value}`;
    } else if (math.lt(value, 0)) {
      return `↓ ${value}`;
    } else {
      return value;
    }
  }

  suggestedFlagChange(value, record) {
    const { rfxQuantity, secondaryQuantity } = record.get(['rfxQuantity', 'secondaryQuantity']);
    if (value) {
      record.set('allottedSecondaryQuantity', secondaryQuantity);
      record.set('allottedQuantity', rfxQuantity);
      record.set('allottedRatio', 100);
    } else {
      record.set('allottedQuantity', '');
      record.set('allottedSecondaryQuantity', '');
      record.set('allottedRatio', '');
      record.set('suggestedRemark', '');
    }
  }

  getColumns() {
    const {
      remote,
      checkWay,
      basicInfoDs,
      doubleUnitFlag = false,
      viewLadderLevel = noop,
      renderValidQuotationQuantity = noop,
      allottedQuantityChange = noop,
      onComparePriceHistory = () => {},
      bidFlag = false,
      getAllTabTableCommonColumns,
    } = this.props;
    const { current } = basicInfoDs || {};
    const { multiCurrencyFlag, rankRule, priceTypeCode, newQuotationFlag } = current
      ? current?.get(['multiCurrencyFlag', 'rankRule', 'priceTypeCode', 'newQuotationFlag'])
      : {};
    const commonColumns = getAllTabTableCommonColumns ? getAllTabTableCommonColumns() : [];

    const preColumns = [
      // 此列二开，禁止修改字段名
      {
        name: 'suggestedFlag',
        width: 60,
        renderer: ({ record }) => {
          return (
            <CheckBox
              name="suggestedFlag"
              record={record}
              onChange={(value) => this.suggestedFlagChange(value, record)}
            />
          );
        },
      },
      {
        name: 'companyName',
        width: 250,
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
      multiCurrencyFlag
        ? {
            name: 'quotationCurrencyCode',
            width: 100,
          }
        : null,
      multiCurrencyFlag
        ? {
            name: 'exchangeRate',
            width: 100,
          }
        : null,
      useTernaryExpression(doubleUnitFlag, {
        name: 'validQuotationSecPrice',
        width: 100,
        renderer: ({ value, record }) =>
          value !== null
            ? this.renderNetPrice({ value, record, name: 'validQuotationSecPrice' })
            : '-',
      }),
      useTernaryExpression(doubleUnitFlag, {
        name: 'validNetSecondaryPrice',
        width: 250,
        renderer: ({ value, record }) =>
          value !== null
            ? this.renderNetPrice({ value, record, name: 'validNetSecondaryPrice' })
            : '-',
      }),
      {
        name: 'validQuotationPrice',
        width: 100,
        renderer: ({ value, record }) =>
          value !== null
            ? this.renderNetPrice({ value, record, name: 'validQuotationPrice' })
            : '-',
      },
      {
        name: 'validNetPrice',
        width: 250,
        renderer: ({ value, record }) =>
          value !== null ? this.renderNetPrice({ value, record, name: 'validNetPrice' }) : '-',
      },
      {
        name: 'perNetPrice',
        width: 120,
      },
      {
        name: 'perTaxIncludedPrice',
        width: 120,
      },
      rankRule === 'WEIGHT_PRICE'
        ? {
            name: 'priceCoefficient',
            width: 100,
          }
        : null,
      rankRule === 'WEIGHT_PRICE'
        ? {
            name: 'weightPrice',
            width: 100,
            renderer: renderNumberFormatter,
          }
        : null,
      {
        name: 'differentPrice',
        width: 100,
        renderer: this.renderDiffPrice,
      },
      multiCurrencyFlag
        ? {
            name: 'baseQuotationPrice',
            width: 120,
            renderer: this.renderNetPrice,
          }
        : null,
      multiCurrencyFlag
        ? {
            name: 'baseNetPrice',
            width: 120,
            renderer: this.renderNetPrice,
          }
        : null,
      {
        name: 'quotationDetailFlag',
        width: 100,
        renderer: ({ record }) => {
          const renderProps = {
            rowData: record,
            sourceFrom: 'RFX',
            uiType: 'c7n',
            allowBuyerViewFlag: 1,
            tableDS: this.itemLineTableDs,
            pageFrom: 'checkPrice',
            bidFlag,
          };

          const QUOTATION = <QuotationDetail {...renderProps} />;
          const render = remote
            ? remote.render(
                'SSRC_CHECK_PRICE_TABLE_COLUMNS_QUOTATIONDETAIL',
                QUOTATION,
                renderProps
              )
            : QUOTATION;

          return render;
        },
      },
      {
        name: 'newPrice',
        width: 100,
        renderer: ({ value }) => (value === 0 ? '' : numberSeparatorRender(value)),
      },
      useTernaryExpression(doubleUnitFlag, {
        name: 'secondaryQuantity',
        width: 100,
        renderer: renderNumberFormatter,
      }),
      useTernaryExpression(doubleUnitFlag, {
        name: 'validQuotationSecQuantity',
        width: 100,
        renderer: ({ value, record }) => renderValidQuotationQuantity(value, record, 'item'),
      }),
      useTernaryExpression(doubleUnitFlag, {
        name: 'secondaryUomName',
        width: 100,
      }),
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
      {
        name: 'totalPrice',
        width: 80,
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
        name: 'netAmount',
        width: 140,
        renderer: ({ value, record }) => (
          <PrecisionInputNumber
            value={value}
            financial={record.get('currencyCode')}
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
                value={value}
                financial={record.get('currencyCode')}
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
                value={value}
                financial={record.get('currencyCode')}
                type="c7n"
                readOnly
              />
            ),
          },
      {
        name: 'priceBatchQuantity',
        width: 110,
      },
      useTernaryExpression(doubleUnitFlag && checkWay === 'quantity', {
        name: 'allottedSecondaryQuantity',
        width: 100,
        align: 'right',
        editor: (record) => (
          <C7nPrecisionInputNumber
            onChange={(val) => allottedQuantityChange(val, record)}
            name="allottedSecondaryQuantity"
            record={record}
            uom="secondaryUomId"
          />
        ),
        renderer: ({ value, record }) =>
          numberSeparatorRender(value, record.getState('uom_precision')),
      }),
      checkWay === 'quantity'
        ? {
            name: 'allottedQuantity',
            width: 100,
            align: 'right',
            editor: (record) => (
              <C7nPrecisionInputNumber
                name="allottedQuantity"
                record={record}
                uom="uomId"
                onChange={(val) => allottedQuantityChange(val, record)}
              />
            ),
            renderer: ({ value, record }) =>
              doubleUnitFlag && record.get('itemId')
                ? numberSeparatorRender(value)
                : numberSeparatorRender(value, record.getState('uom_precision')),
          }
        : {
            name: 'allottedRatio',
            width: 120,
            editor: true,
          },
      {
        name: 'suggestedRemark',
        width: 120,
        editor: true,
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
        renderer: renderNumberFormatter,
      },
      {
        name: 'priceFluctuation',
        width: 100,
      },
      {
        name: 'initialFluctuation',
        width: 130,
      },
      {
        name: 'priceCompareToFirst',
        width: 130,
        renderer: this.renderPriceCompareToFirst,
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
        name: 'validQuotationRemark',
        width: 120,
      },
      {
        name: 'origin',
        width: 120,
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
        width: 180,
        editor: true,
        renderer: ({ value }) => dateRender(value),
      },
      {
        name: 'validExpiryDateTo',
        width: 180,
        editor: true,
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
        editor: true,
      },
      // 该字段二开，请勿修改字段名
      {
        name: 'minPurchaseQuantity',
        width: 100,
        editor: (record) => {
          return <C7nPrecisionInputNumber name="minPurchaseQuantity" record={record} uom="uomId" />;
        },
        renderer: ({ value, record }) =>
          numberSeparatorRender(value, record.getState('uom_precision')),
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
                'SSRC_CHECK_PRICE_PROCESS_ITEM_FREIGHT_AMOUNT_PROPS',
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
        name: 'costPrice',
        width: 150,
      },
      {
        name: 'attachmentUuid',
        width: 120,
        renderer: ({ record }) => {
          return !newQuotationFlag ? (
            <Attachment
              name="attachmentUuid"
              record={record}
              viewMode="popup"
              funcType="link"
              readOnly
              previewTarget="_blank"
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
    return remote
      ? remote.process('SSRC_CHECK_PRICE_PROCESS_ITEM_TABLE_COLUMN', preColumns, {
          current,
          bidFlag,
          suggestedFlagChange: this.suggestedFlagChange,
          basicInfoDs,
        })
      : preColumns;
  }

  renderRow = ({ record }) => {
    const { remote, bidFlag = false } = this.props;
    return remote
      ? remote?.process(
          'SSRC_CHECK_PRICE_PROCESS_ITEM_TABLE_ROW_RENDER',
          {},
          {
            record,
            bidFlag,
          }
        )
      : {};
  };

  render() {
    const {
      rfxLineItemId,
      customizeTable = noop,
      sourceKey = 'INQUIRY',
      remote,
      basicInfoDs,
      bidFlag = false,
    } = this.props;
    const columns = this.getColumns();
    const preTableProps = {
      dataSet: this.itemLineTableDs,
      columns,
      style: { maxHeight: 450 },
      virtual: true,
      virtualCell: true,
      onRow: this.renderRow,
    };

    const tableProps = remote
      ? remote.process('SSRC_CHECK_PRICE_PROCESS_ITEMLINE_TABLE_PROPS', preTableProps, {
          basicInfoDs,
          bidFlag,
        })
      : preTableProps;
    return customizeTable(
      {
        code: `SSRC.${sourceKey}_HALL_CHECK_PRICE.TAB_ITEM_DTL`,
        namespace: rfxLineItemId,
      },
      <Table {...tableProps} />
    );
  }
}

const hocItemLineTable = (Comp) => {
  return observer(Comp);
};

export { ItemLineTable, hocItemLineTable };
export default hocItemLineTable(ItemLineTable);
