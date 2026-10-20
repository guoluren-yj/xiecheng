import React, { Component } from 'react';
import { noop, isNil } from 'lodash';
import { Table } from 'choerodon-ui/pro';
import { observer } from 'mobx-react';

import Upload from 'srm-front-boot/lib/components/Upload';
import intl from 'utils/intl';
import { yesOrNoRender } from 'utils/renderer';
import { PRIVATE_BUCKET } from '_utils/config';

import { numberSeparatorRender, roundEliminate, useTernaryExpression } from '@/utils/renderer';
import QuotationDetail from '@/routes/components/QuotationDetailNew/Detail';
import NoQuotedItemView from '@/routes/ssrc/InquiryHall/CheckPrice/components/NoQuotedItemView';
import FileGroup from '@/routes/components/SupplierQuotationAttachment';

@observer
export default class AllQuoteLine extends Component {
  /**
   * 渲染单价样式
   */
  renderPriceWhetherRed = (value = null, record, name) => {
    if (isNil(value)) {
      return '-';
    }

    let mean = '';
    const formatValue = numberSeparatorRender(value);
    const { redField } = record.get(['redField']);
    const color = redField === name ? 'red' : '';

    mean = <span style={{ color }}>{formatValue}</span>;
    return mean;
  };

  getColumns = () => {
    const {
      organizationId,
      header = {},
      viewLadderLevel,
      doubleUnitFlag = false,
      fetchHistoryline,
      onComparePriceHistory,
      viewApplicationOrgModal = noop,
      bidFlag,
      tableCommonFields = noop,
    } = this.props;
    const { multiCurrencyFlag, rankRule, newQuotationFlag } = header || {};

    const columns = [
      {
        name: 'suggestedFlag',
        width: 60,
        renderer: ({ value }) => yesOrNoRender(value),
      },
      {
        name: 'categoryName',
        width: 120,
      },
      {
        name: 'itemCode',
        width: 120,
      },
      {
        name: 'itemName',
      },
      useTernaryExpression(doubleUnitFlag, {
        name: 'secondaryUomName',
        width: 100,
      }),
      {
        name: 'uomName',
        width: 120,
      },
      {
        name: 'companyNum',
        width: 120,
      },
      {
        name: 'companyName',
        width: 320,
        renderer: ({ value, record }) => {
          const nameValue = value ? roundEliminate(value, record, { uiType: 'c7n-pro' }) : '';
          return nameValue;
        },
      },
      {
        name: 'candidateSuggestion',
        width: 100,
      },
      multiCurrencyFlag
        ? {
            name: 'quotationCurrencyCode',
            width: 100,
          }
        : '',
      multiCurrencyFlag
        ? {
            name: 'exchangeRate',
            width: 100,
          }
        : '',
      useTernaryExpression(doubleUnitFlag, {
        name: 'validQuotationSecPrice',
        width: 120,
        align: 'right',
        renderer: ({ value, record }) =>
          this.renderPriceWhetherRed(value, record, 'validQuotationSecPrice'),
      }),
      {
        name: 'validQuotationPrice',
        width: 120,
        align: 'right',
        renderer: ({ value, record }) =>
          this.renderPriceWhetherRed(value, record, 'validQuotationPrice'),
      },
      rankRule === 'WEIGHT_PRICE'
        ? {
            name: 'priceCoefficient',
            width: 100,
          }
        : '',
      rankRule === 'WEIGHT_PRICE'
        ? {
            name: 'weightPrice',
            width: 100,
            align: 'right',
            renderer: ({ value }) => {
              if (isNil(value)) {
                return '-';
              }
              return numberSeparatorRender(value);
            },
          }
        : '',
      useTernaryExpression(doubleUnitFlag, {
        name: 'validNetSecondaryPrice',
        width: 100,
        align: 'right',
        renderer: ({ value, record }) =>
          this.renderPriceWhetherRed(value, record, 'validNetSecondaryPrice'),
      }),
      {
        name: 'validNetPrice',
        width: 120,
        align: 'right',
        renderer: ({ value, record }) => this.renderPriceWhetherRed(value, record, 'validNetPrice'),
      },
      {
        name: 'perNetPrice',
        width: 120,
        align: 'right',
        renderer: ({ record }) => {
          const { perNetSecondaryPrice, perNetPrice } = record.get([
            'perNetSecondaryPrice',
            'perNetPrice',
          ]);
          return doubleUnitFlag ? perNetSecondaryPrice : perNetPrice;
        },
      },
      {
        name: 'perTaxIncludedPrice',
        width: 120,
        align: 'right',
        renderer: ({ record }) => {
          const { perTaxIncludedSecPrice, perTaxIncludedPrice } = record.get([
            'perTaxIncludedSecPrice',
            'perTaxIncludedPrice',
          ]);
          return doubleUnitFlag ? perTaxIncludedSecPrice : perTaxIncludedPrice;
        },
      },
      {
        name: 'referencePrice',
        width: 100,
        align: 'right',
        renderer: ({ value }) => {
          if (isNil(value)) {
            return '-';
          }
          return numberSeparatorRender(value);
        },
      },
      multiCurrencyFlag
        ? {
            name: 'baseQuotationPrice',
            align: 'right',
            width: 100,
            renderer: ({ value, record }) =>
              this.renderPriceWhetherRed(value, record, 'baseQuotationPrice'),
          }
        : '',
      multiCurrencyFlag
        ? {
            name: 'baseNetPrice',
            align: 'right',
            width: 100,
            renderer: ({ value, record }) =>
              this.renderPriceWhetherRed(value, record, 'baseNetPrice'),
          }
        : '',
      {
        name: 'quotationDetailFlag',
        width: 100,
        renderer: ({ record }) => {
          const currentQuotationDetailProps = {
            rowData: record,
            uiType: 'c7n-pro',
          };

          return (
            <QuotationDetail
              rowData={record}
              sourceFrom="RFX"
              allowBuyerViewFlag
              pageFrom="checkPriceDetail"
              bidFlag={bidFlag}
              {...currentQuotationDetailProps}
            />
          );
        },
      },
      {
        name: 'newPrice',
        width: 100,
        align: 'right',
        renderer: ({ value }) => {
          if (isNil(value)) {
            return '-';
          }
          return numberSeparatorRender(value);
        },
      },
      {
        name: 'priceBatchQuantity',
        width: 100,
        align: 'right',
        renderer: ({ value }) => {
          if (isNil(value)) {
            return '-';
          }
          return numberSeparatorRender(value);
        },
      },
      useTernaryExpression(doubleUnitFlag, {
        name: 'allottedSecondaryQuantity',
        width: 100,
      }),
      {
        name: 'allottedRatio',
        width: 120,
      },
      {
        name: 'allottedQuantity',
        width: 120,
        renderer: ({ value }) => {
          if (isNil(value)) {
            return '-';
          }
          return numberSeparatorRender(value);
        },
      },
      {
        name: 'quotationLineStatusMeaning',
        width: 100,
      },
      {
        name: 'stageDescription',
        width: 100,
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
        name: 'suggestedRemark',
        width: 100,
      },
      {
        name: 'ladderInquiryFlag',
        width: 100,
        renderer: ({ value, record }) => {
          return value === 1 ? (
            <a onClick={() => viewLadderLevel({ record })}>
              {intl.get(`ssrc.inquiryHall.view.message.button.ladderInquiryFlag`).d('阶梯报价')}
            </a>
          ) : (
            '-'
          );
        },
      },
      {
        name: 'preQuotationPrice',
        width: 100,
        align: 'right',
        renderer: ({ value }) => {
          if (isNil(value)) {
            return '-';
          }
          return numberSeparatorRender(value);
        },
      },
      {
        name: 'priceFluctuation',
        width: 100,
        align: 'right',
      },
      {
        name: 'initialFluctuation',
        width: 130,
      },
      useTernaryExpression(doubleUnitFlag, {
        name: 'secondaryQuantity',
        width: 100,
        renderer: ({ value }) => {
          if (isNil(value)) {
            return '-';
          }
          return numberSeparatorRender(value);
        },
      }),
      useTernaryExpression(doubleUnitFlag, {
        name: 'validQuotationSecQuantity',
        width: 100,
        renderer: ({ value }) => {
          if (isNil(value)) {
            return '-';
          }
          return numberSeparatorRender(value);
        },
      }),
      {
        name: 'rfxQuantity',
        width: 100,
        renderer: ({ value }) => {
          if (isNil(value)) {
            return '-';
          }
          return numberSeparatorRender(value);
        },
      },
      {
        name: 'validQuotationQuantity',
        width: 120,
        renderer: ({ value }) => {
          if (isNil(value)) {
            return '-';
          }
          return numberSeparatorRender(value);
        },
      },
      {
        name: 'totalPrice',
        width: 100,
        align: 'right',
        renderer: ({ value }) => {
          if (isNil(value)) {
            return '-';
          }
          return numberSeparatorRender(value);
        },
      },
      {
        name: 'netAmount',
        width: 140,
        align: 'right',
        renderer: ({ value }) => {
          if (isNil(value)) {
            return '-';
          }
          return numberSeparatorRender(value);
        },
      },
      {
        name: 'estimatedPrice',
        width: 140,
        align: 'right',
        renderer: ({ value }) => {
          if (isNil(value)) {
            return '-';
          }
          return numberSeparatorRender(value);
        },
      },
      {
        name: 'netEstimatedPrice',
        width: 140,
        align: 'right',
        renderer: ({ value }) => {
          if (isNil(value)) {
            return '-';
          }
          return numberSeparatorRender(value);
        },
      },
      {
        name: 'estimatedAmount',
        width: 140,
        align: 'right',
        renderer: ({ value }) => {
          if (isNil(value)) {
            return '-';
          }
          return numberSeparatorRender(value);
        },
      },
      {
        name: 'netEstimatedAmount',
        width: 140,
        align: 'right',
        renderer: ({ value }) => {
          if (isNil(value)) {
            return '-';
          }
          return numberSeparatorRender(value);
        },
      },
      {
        name: 'validQuotationRemark',
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
        name: 'attachmentUuid',
        width: 150,
        renderer: ({ value, record }) => {
          return !newQuotationFlag ? (
            <Upload
              filePreview
              viewOnly
              icon="download"
              bucketName={PRIVATE_BUCKET}
              bucketDirectory="ssrc-rfx-quotationline"
              attachmentUUID={value}
              tenantId={organizationId}
            />
          ) : (
            <FileGroup name="attachmentUuid" record={record} uiType="c7n-pro" fileType="LINE" />
          );
        },
      },
      {
        name: 'origin',
        width: 120,
      },
      {
        name: 'validExpiryDateFrom',
        width: 150,
      },
      {
        name: 'validExpiryDateTo',
        width: 150,
      },
      {
        name: 'validPromisedDate',
        width: 120,
      },
      {
        name: 'specs',
        width: 100,
      },
      {
        name: 'validDeliveryCycle',
        width: 120,
      },
      {
        name: 'minPurchaseQuantity',
        width: 120,
        renderer: ({ value }) => {
          if (isNil(value)) {
            return '-';
          }
          return numberSeparatorRender(value);
        },
      },
      {
        name: 'minPackageQuantity',
        width: 100,
        renderer: ({ value }) => {
          if (isNil(value)) {
            return '-';
          }
          return numberSeparatorRender(value);
        },
      },
      {
        name: 'freightIncludedFlag',
        width: 100,
        renderer: ({ value }) => yesOrNoRender(value),
      },
      {
        name: 'freightAmount',
        width: 100,
        renderer: ({ value }) => {
          if (isNil(value)) {
            return '-';
          }
          return numberSeparatorRender(value);
        },
      },
      {
        name: 'quotedDate',
        width: 150,
      },
      {
        name: 'rfxLineItemNum',
        width: 60,
      },
      {
        name: 'changePercent',
        width: 100,
      },
      {
        name: 'minPrice',
        width: 100,
        align: 'right',
        renderer: ({ value }) => {
          if (isNil(value)) {
            return '-';
          }
          return numberSeparatorRender(value);
        },
      },
      {
        name: 'supplierSavingAmount',
        width: 100,
        align: 'right',
        renderer: ({ value }) => {
          if (isNil(value)) {
            return '-';
          }
          return numberSeparatorRender(value);
        },
      },
      {
        name: 'supplierSavingRatio',
        width: 100,
        renderer: ({ value }) => {
          return !isNil(value) ? `${value}%` : '';
        },
      },
      {
        name: 'supplierMinMaxSuggestedRatio',
        width: 100,
        renderer: ({ value }) => {
          return !isNil(value) ? `${value}%` : '';
        },
      },
      {
        name: 'itemSavingAmount',
        width: 100,
        align: 'right',
        renderer: ({ value }) => {
          if (isNil(value)) {
            return '-';
          }
          return numberSeparatorRender(value);
        },
      },
      {
        name: 'itemSavingRatio',
        width: 100,
        renderer: ({ value }) => {
          return !isNil(value) ? `${value}%` : '';
        },
      },
      {
        name: 'itemMinMaxSuggestedFlag',
        width: 120,
        renderer: ({ value }) => yesOrNoRender(value),
      },
      {
        name: 'quotationLineSavingAmount',
        width: 100,
        align: 'right',
        renderer: ({ value }) => {
          if (isNil(value)) {
            return '-';
          }
          return numberSeparatorRender(value);
        },
      },
      {
        name: 'quotationLineSavingRatio',
        width: 100,
        renderer: ({ value }) => {
          return !isNil(value) ? `${value}%` : '';
        },
      },
      {
        name: 'itemSignPostPrice',
        width: 100,
        align: 'right',
        renderer: ({ value }) => {
          if (isNil(value)) {
            return '-';
          }
          return numberSeparatorRender(value);
        },
      },
      {
        width: 100,
        name: 'quotationHistory',
        renderer: ({ record }) => {
          return (
            <a onClick={() => fetchHistoryline(record)}>
              {intl.get(`hzero.common.button.view`).d('查看')}
            </a>
          );
        },
      },
      {
        name: 'comparePriceHistory',
        width: 150,
        renderer: ({ record }) => {
          const { quotationLineId } = record.get(['quotationLineId']);

          return quotationLineId !== null ? (
            <a onClick={() => onComparePriceHistory(record)}>
              {intl.get(`hzero.common.button.view`).d('查看')}
            </a>
          ) : (
            ''
          );
        },
      },
      {
        name: 'applicationScopeFlag',
        width: 100,
        renderer: ({ record }) => {
          const { applicationScopeFlag, rfxLineItemId } = record.get([
            'applicationScopeFlag',
            'rfxLineItemId',
          ]);

          return (
            <a
              disabled={!applicationScopeFlag}
              onClick={() =>
                viewApplicationOrgModal({ sourceLineItemId: rfxLineItemId, applicationScopeFlag })
              }
            >
              {intl.get(`ssrc.inquiryHall.model.inquiryHall.view`).d('查看')}
            </a>
          );
        },
      },
      ...(tableCommonFields({ allQuotationFlag: 1 }) || []),
    ].filter(Boolean);

    return columns;
  };

  render() {
    const {
      basicInfoDS,
      allListDS,
      customizeTable = noop,
      getCustomizeUnitCode = noop,
    } = this.props;

    if (!allListDS) {
      return '';
    }

    return (
      <div>
        <NoQuotedItemView headerDs={basicInfoDS} />
        {customizeTable(
          {
            code: getCustomizeUnitCode('allQuotationTable'),
          },
          <Table
            bordered
            dataSet={allListDS}
            rowKey="quotationLineId"
            columns={this.getColumns()}
            style={{
              maxHeight: '500px',
            }}
            virtual
            virtualCell
          />
        )}
      </div>
    );
  }
}
