import React, { Component } from 'react';
import { noop, isNil } from 'lodash';
import { Table } from 'choerodon-ui/pro';
import { Bind } from 'lodash-decorators';
import { observer } from 'mobx-react';

import Upload from 'srm-front-boot/lib/components/Upload';
import intl from 'utils/intl';
import { yesOrNoRender } from 'utils/renderer';
import { PRIVATE_BUCKET } from '_utils/config';

import { numberSeparatorRender, roundEliminate, useTernaryExpression } from '@/utils/renderer';
import QuotationDetail from '@/routes/components/QuotationDetailNew/Detail';

import FileGroup from '@/routes/components/SupplierQuotationAttachment';

@observer
export default class ItemLineTable extends Component {
  /**
   * 渲染单价样式
   */
  @Bind()
  renderNetPrice(value = null, record, name) {
    if (isNil(value)) {
      return '-';
    }

    let mean = '';
    const formatValue = numberSeparatorRender(value);
    const { redField } = record.get(['redField']);
    const color = redField === name ? 'red' : '';

    mean = <span style={{ color }}>{formatValue}</span>;
    return mean;
  }

  getColumns = () => {
    const {
      doubleUnitFlag,
      header = {},
      bidFlag,
      viewLadderLevel,
      organizationId,
      fetchHistoryline = noop,
      viewApplicationOrgModal = noop,
      onComparePriceHistory = noop,
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
        name: 'companyName',
        // width: 220,
        renderer: ({ value, record }) =>
          value ? roundEliminate(value, record, { uiType: 'c7n-pro' }) : '',
      },
      {
        name: 'candidateSuggestion',
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
        name: 'quotationLineStatusMeaning',
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
        width: 100,
        align: 'right',
        renderer: ({ value, record }) =>
          this.renderNetPrice(value, record, 'validQuotationSecPrice'),
      }),
      {
        name: 'validQuotationPrice',
        width: 120,
        align: 'right',
        renderer: ({ value, record }) => this.renderNetPrice(value, record, 'validQuotationPrice'),
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
        width: 120,
        align: 'right',
        renderer: ({ value, record }) =>
          this.renderNetPrice(value, record, 'validNetSecondaryPrice'),
      }),
      {
        name: 'validNetPrice',
        width: 120,
        align: 'right',
        renderer: ({ value, record }) => this.renderNetPrice(value, record, 'validNetPrice'),
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
      multiCurrencyFlag
        ? {
            name: 'baseQuotationPrice',
            align: 'right',
            width: 120,
            renderer: ({ value, record }) =>
              this.renderNetPrice(value, record, 'baseQuotationPrice'),
          }
        : '',
      multiCurrencyFlag
        ? {
            name: 'baseNetPrice',
            align: 'right',
            width: 120,
            renderer: ({ value, record }) => this.renderNetPrice(value, record, 'baseNetPrice'),
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
        name: 'specs',
        width: 100,
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
      useTernaryExpression(doubleUnitFlag, {
        name: 'secondaryUomName',
        width: 100,
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
        name: 'uomName',
        width: 120,
      },
      {
        name: 'totalPrice',
        width: 80,
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
        name: 'initialFluctuation',
        width: 130,
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
      useTernaryExpression(doubleUnitFlag, {
        name: 'allottedSecondaryQuantity',
        width: 100,
        renderer: ({ value }) => {
          if (isNil(value)) {
            return '-';
          }
          return numberSeparatorRender(value);
        },
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
        name: 'suggestedRemark',
        width: 120,
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
        name: 'costPrice',
        width: 100,
        align: 'right',
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
      ...(tableCommonFields({ itemFlag: 1 }) || []),
    ];

    return columns.filter(Boolean);
  };

  render() {
    const { ds, customizeTable = noop, getCustomizeUnitCode = noop } = this.props;

    if (!ds) {
      return '';
    }

    return (
      <div>
        {customizeTable(
          {
            code: getCustomizeUnitCode('itemTable'),
          },
          <Table
            bordered
            dataSet={ds}
            rowKey="quotationLineId"
            columns={this.getColumns()}
            style={{
              maxHeight: '450px',
            }}
            virtual
            virtualCell
          />
        )}
      </div>
    );
  }
}
