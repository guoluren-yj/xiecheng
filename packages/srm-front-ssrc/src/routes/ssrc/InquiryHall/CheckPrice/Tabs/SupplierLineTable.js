/**
 * 供应商表格
 */
import React, { memo, useMemo, useEffect, useCallback } from 'react';
import { DataSet, Table, CheckBox, Attachment } from 'choerodon-ui/pro';
import { math } from 'choerodon-ui/dataset';
import { compose, noop, isEmpty, isNil } from 'lodash';
import { observer, useComputed } from 'mobx-react-lite';

import { yesOrNoRender, dateRender } from 'utils/renderer';
import intl from 'utils/intl';

import { withOverride } from '@/utils/utils';
import { numberSeparatorRender, useTernaryExpression } from '@/utils/renderer';
import PrecisionInputNumber from '@/routes/components/Precision/PrecisionInputNumber';
import FileGroup from '@/routes/components/SupplierQuotationAttachment';
import C7nPrecisionInputNumber from '@/routes/components/Precision/C7nPrecisionInputNumber';
import QuotationDetail from '@/routes/components/QuotationDetailNew/Detail';

import { supplierLineTableDS } from '../store/supplierLineTableDS';
import { renderRoundEliminate, renderFlagDisplay, renderNumberFormatter } from '../utils/renderer';

const SupplierLineTable = (props) => {
  const {
    checkWay,
    basicInfoDs,
    rfxHeaderId,
    rfxLineSupplierId,
    onRef = noop,
    takePrice = noop,
    customizeTable = noop,
    sourceKey = 'INQUIRY',
    doubleUnitFlag = false,
    viewLadderLevel = noop,
    renderValidQuotationQuantity = noop,
    allottedQuantityChange = noop,
    onSetWholePackageFlag = noop,
    onSetWholePackageFlagFalse = noop,
    onComparePriceHistory = () => {},
    bidFlag,
    remote,
    supplierLineTable,
    expandAllFlag,
    priceDataObj = {},
    searchPriceLoading,
    clickAllFlag,
    getAllTabTableCommonColumns,
  } = props;
  const commonColumns = getAllTabTableCommonColumns ? getAllTabTableCommonColumns() : [];

  const { current: headerCurrent } = basicInfoDs;

  const onlyAllowAllWinBids = headerCurrent?.get('onlyAllowAllWinBids');

  const dsProps = {
    ...supplierLineTableDS({
      sourceKey,
      rfxLineSupplierId,
      doubleUnitFlag,
    }),
    events: {
      ...supplierLineTableDS({ sourceKey, doubleUnitFlag }).events,
      load: ({ dataSet, data }) => {
        if (typeof supplierLineTableDS({ sourceKey, doubleUnitFlag }).events?.load === 'function') {
          supplierLineTableDS({ sourceKey, doubleUnitFlag }).events.load({ dataSet, data });
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
              record.data.changePercent = priceDataObj[record.get('quotationLineId')].changePercent;
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

  const supplierLineTableDs = useMemo(
    () =>
      supplierLineTable[rfxLineSupplierId] ||
      new DataSet(
        remote
          ? remote.process('SSRC_CHECK_PRICE_PROCESS_SUPPLIER_TABLE_DS', dsProps, {
              basicInfoDs,
              bidFlag,
              rfxLineSupplierId,
              pageProps: props,
            })
          : dsProps
      ),
    [sourceKey]
  );

  useEffect(() => {
    onRef(rfxLineSupplierId, supplierLineTableDs);
    supplierLineTableDs.setQueryParameter('queryData', {
      rfxLineSupplierId,
      rfxHeaderId,
      customizeUnitCode: `SSRC.${sourceKey}_HALL_CHECK_PRICE.TAB_SUPPLIER`,
    });
    if ((expandAllFlag && !clickAllFlag) || supplierLineTable[rfxLineSupplierId].length) {
      return;
    }
    supplierLineTableDs.query();
  }, []);

  useEffect(() => {
    supplierLineTableDs.setState('onlyAllowAllWinBids', onlyAllowAllWinBids);
  }, [onlyAllowAllWinBids]);

  useEffect(() => {
    supplierLineTableDs.setState('checkWay', checkWay);
  }, [checkWay]);

  /**
   * 渲染差异价
   */
  const renderDiffPrice = useCallback(
    ({ record }) => {
      const { current } = basicInfoDs || {};
      const {
        validNetSecondaryPrice = null,
        validQuotationSecPrice = null,
        referencePrice = null,
        validNetPrice = null,
        validQuotationPrice = null,
      } =
        record.get([
          'validNetSecondaryPrice',
          'validQuotationSecPrice',
          'referencePrice',
          'validNetPrice',
          'validQuotationPrice',
        ]) || {};
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
    },
    [basicInfoDs]
  );

  /**
   * 与首次价格对比
   */
  const renderPriceCompareToFirst = useCallback(({ value }) => {
    if (math.gt(value, 0)) {
      return `↑ ${value}`;
    } else if (math.lt(value, 0)) {
      return `↓ ${value}`;
    } else {
      return value;
    }
  }, []);

  const suggestedFlagChange = withOverride.call(
    props,
    useCallback(
      function suggestedFlagChange(value, record, dataSet) {
        const {
          rfxQuantity,
          secondaryQuantity,
          quotationLineId,
          recordRfxLineSupplierId,
        } = record.get([
          'rfxQuantity',
          'secondaryQuantity',
          'quotationLineId',
          'rfxLineSupplierId',
        ]);
        if (value) {
          record.set('allottedSecondaryQuantity', secondaryQuantity);
          record.set('allottedQuantity', rfxQuantity);
          record.set('allottedRatio', 100);
        } else {
          record.set('allottedSecondaryQuantity', '');
          record.set('allottedQuantity', '');
          record.set('allottedRatio', '');
          record.set('suggestedRemark', '');
        }

        // 以下逻辑为 “改变整包逻辑” - 逻辑从老核价迁移

        const filterRecords = dataSet.filter(
          // eslint-disable-next-line
          (r) =>
            r.get('rfxLineSupplierId') === recordRfxLineSupplierId &&
            r.get('quotationLineId') !== quotationLineId
        );
        // 未操作的明细数据和正在操作的数据，都勾选时，设置整包推荐为1，否则为0
        if (filterRecords.every((r) => r.get('suggestedFlag') === 1) && value) {
          onSetWholePackageFlag(recordRfxLineSupplierId);
        } else {
          onSetWholePackageFlagFalse(recordRfxLineSupplierId);
        }
      },
      [onSetWholePackageFlag, onSetWholePackageFlagFalse, doubleUnitFlag]
    ),
    'suggestedFlagChange'
  );

  const columns = useComputed(() => {
    const { current } = basicInfoDs || {};
    const { multiCurrencyFlag, rankRule, priceTypeCode, newQuotationFlag = 0 } = current
      ? current?.get(['multiCurrencyFlag', 'rankRule', 'priceTypeCode', 'newQuotationFlag'])
      : {};
    const preColumns = [
      // 此列二开，禁止修改字段名
      {
        name: 'suggestedFlag',
        width: 60,
        renderer: ({ record, dataSet }) => {
          return (
            <CheckBox
              name="suggestedFlag"
              record={record}
              onChange={(value) => suggestedFlagChange(value, record, dataSet)}
            />
          );
        },
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
        name: 'itemName',
        width: 380,
        renderer: ({ value, record }) =>
          renderRoundEliminate({ value, record, showInvalidFlag: 0 }),
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
        renderer: renderNumberFormatter,
      }),
      {
        name: 'validQuotationPrice',
        width: 120,
        renderer: renderNumberFormatter,
      },
      {
        name: 'itemSignPostPrice',
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
      useTernaryExpression(doubleUnitFlag, {
        name: 'validNetSecondaryPrice',
        width: 100,
        renderer: renderNumberFormatter,
      }),
      {
        name: 'validNetPrice',
        width: 120,
        renderer: renderNumberFormatter,
      },
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
        renderer: renderDiffPrice,
      },
      {
        name: 'quotationDetailFlag',
        width: 100,
        renderer: ({ record }) => {
          const renderProps = {
            rowData: record,
            sourceFrom: 'RFX',
            uiType: 'c7n',
            allowBuyerViewFlag: 1,
            tableDS: supplierLineTableDs,
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
      {
        name: 'priceBatchQuantity',
        width: 110,
      },
      {
        name: 'newPrice',
        width: 100,
        renderer: renderNumberFormatter,
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
              <C7nPrecisionInputNumber name="allottedQuantity" record={record} uom="uomId" />
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
        renderer: renderPriceCompareToFirst,
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
        width: 100,
        renderer: renderNumberFormatter,
      },
      {
        name: 'validQuotationQuantity',
        width: 100,
      },
      {
        name: 'uomName',
        width: 100,
      },
      {
        name: 'totalPrice',
        width: 80,
        tooltip: 'none',
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
        tooltip: 'none',
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
            tooltip: 'none',
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
            tooltip: 'none',
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
                'SSRC_CHECK_PRICE_PROCESS_SUPPLIER_FREIGHT_AMOUNT_PROPS',
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
      ? remote.process('SSRC_CHECK_PRICE_PROCESS_SUPPLIER_TABLE_COLUMN', preColumns, {
          current,
          basicInfoDs,
          bidFlag,
          suggestedFlagChange,
        })
      : preColumns;
  }, [
    basicInfoDs,
    checkWay,
    doubleUnitFlag,
    viewLadderLevel,
    renderValidQuotationQuantity,
    allottedQuantityChange,
  ]);

  const renderRow = ({ record }) => {
    return remote
      ? remote?.process(
          'SSRC_CHECK_PRICE_PROCESS_SUPPLIER_TABLE_ROW_RENDER',
          {},
          {
            record,
            bidFlag,
          }
        )
      : {};
  };

  const preTableProps = {
    dataSet: supplierLineTableDs,
    columns,
    style: { maxHeight: 450 },
    virtual: true,
    virtualCell: true,
    onRow: renderRow,
  };

  const tableProps = remote
    ? remote.process('SSRC_CHECK_PRICE_PROCESS_SUPPLIER_TABLE_PROPS', preTableProps, {
        basicInfoDs,
        bidFlag,
        pageProps: props,
      })
    : preTableProps;

  return customizeTable(
    {
      code: `SSRC.${sourceKey}_HALL_CHECK_PRICE.TAB_SUPPLIER`,
      namespace: rfxLineSupplierId,
    },
    <Table {...tableProps} />
  );
};

const hocSupplierLineTable = (Comp) => {
  return compose(memo, observer)(Comp);
};

export { hocSupplierLineTable, SupplierLineTable };

export default hocSupplierLineTable(SupplierLineTable);
