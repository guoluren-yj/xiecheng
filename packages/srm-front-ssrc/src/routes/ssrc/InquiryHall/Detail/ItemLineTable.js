import React, { Component } from 'react';
import { Popover } from 'hzero-ui';
import { math } from 'choerodon-ui/dataset';
import { sum, isNumber, noop, isNil } from 'lodash';
import moment from 'moment';
import EditTable from 'components/EditTable';
import Upload from 'srm-front-boot/lib/components/Upload';

import {
  getUomName,
  getQtyName,
  getAvailableQtyName,
  getAllottedQuantity,
  getPriceName,
  getNetPriceName,
} from '@/utils/utils';
import intl from 'utils/intl';
import { yesOrNoRender, dateRender } from 'utils/renderer';
import PrecisionInputNumber from '@/routes/components/Precision/PrecisionInputNumber';
import { numberSeparatorRender, roundEliminate, useTernaryExpression } from '@/utils/renderer';
import { DEFAULT_DATE_FORMAT } from 'utils/constants';
import QuotationDetail from '@/routes/components/QuotationDetailNew/Detail';
import { Bind } from 'lodash-decorators';
import { PRIVATE_BUCKET } from '_utils/config';

import FileGroup from '@/routes/components/SupplierQuotationAttachment';

export default class ItemLineTable extends Component {
  /**
   * 渲染单价样式
   */
  @Bind()
  renderNetPrice(val = null, record, name) {
    const { remote } = this.props;
    let mean = '';
    const formatValue = numberSeparatorRender(val);
    const { redField } = record;

    const colorRemote = remote
      ? remote?.process('SSRC_DETAIL_CHECK_PRICE_TABS_ITEM_COLUMNS_COLOR', 'red')
      : 'red';
    mean =
      redField === name ? <span style={{ color: colorRemote }}>{formatValue}</span> : formatValue;
    return mean;
  }

  render() {
    const {
      // checkWay,
      organizationId,
      header = {},
      itemLineHeader = {},
      onChange,
      dataSource = [],
      pagination = {},
      viewLadderLevel,
      customizeTable = () => {},
      rfx = {},
      doubleUnitFlag = false,
      fetchHistoryline,
      onComparePriceHistory,
      viewApplicationOrgModal = noop,
      remote,
      getAllTabTableCommonColumns,
    } = this.props;
    const { newQuotationFlag } = header || {};
    const { unitCodeSymbol, quotationName, bidFlag = false } = rfx || {};
    const commonColumns = getAllTabTableCommonColumns ? getAllTabTableCommonColumns() : [];

    const columns = [
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.suggestedFlag`).d('选用'),
        dataIndex: 'suggestedFlag',
        width: 60,
        render: (val) => yesOrNoRender(val),
      },
      {
        title: intl.get('ssrc.common.supplierName').d('供应商名称'),
        dataIndex: 'companyName',
        width: 320,
        render: (value, record) => (value ? roundEliminate(value, record) : ''),
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.candidateSuggestion`).d('推荐意见'),
        dataIndex: 'candidateSuggestion',
        width: 100,
        render: (value) =>
          value ? (
            <Popover placement="topLeft" content={value}>
              {value}
            </Popover>
          ) : (
            ''
          ),
      },
      {
        dataIndex: 'stageDescription',
        title: intl.get('ssrc.inquiryHall.model.inquiryHall.lifeCycleState').d('生命周期阶段'),
        width: 100,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.taxInclude`).d('是否含税'),
        dataIndex: 'taxIncludedFlag',
        width: 100,
        render: yesOrNoRender,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.taxRate`).d('税率（%）'),
        dataIndex: 'taxRate',
        width: 100,
      },
      {
        title: intl
          .get(`ssrc.inquiryHall.model.inquiryHall.commonQuotationStatus`, { quotationName })
          .d('{quotationName}状态'),
        dataIndex: 'quotationLineStatusMeaning',
        width: 100,
      },
      header.multiCurrencyFlag
        ? {
            title: intl
              .get(`ssrc.inquiryHall.model.inquiryHall.quotationCurrencyCode`)
              .d('报价币种'),
            dataIndex: 'quotationCurrencyCode',
            width: 100,
          }
        : '',
      header.multiCurrencyFlag
        ? {
            title: intl.get(`ssrc.inquiryHall.model.inquiryHall.exchangeRate`).d('汇率'),
            dataIndex: 'exchangeRate',
            width: 100,
          }
        : '',
      useTernaryExpression(doubleUnitFlag, {
        title: intl.get('ssrc.inquiryHall.model.inquiryHall.unitPriceTax').d('单价(含税)'),
        dataIndex: 'validQuotationSecPrice',
        width: 100,
        align: 'right',
        render: (val, record) =>
          val !== null ? this.renderNetPrice(val, record, 'validQuotationSecPrice') : '-',
      }),
      // 此列二开，禁止修改字段名
      {
        title: getPriceName(doubleUnitFlag),
        dataIndex: 'validQuotationPrice',
        width: 120,
        align: 'right',
        render: (val, record) =>
          val !== null ? this.renderNetPrice(val, record, 'validQuotationPrice') : '-',
      },
      header.rankRule === 'WEIGHT_PRICE'
        ? {
            title: intl.get(`ssrc.inquiryHall.model.inquiryHall.priceCoefficient`).d('价格系数'),
            dataIndex: 'priceCoefficient',
            width: 100,
          }
        : '',
      header.rankRule === 'WEIGHT_PRICE'
        ? {
            title: intl.get(`ssrc.inquiryHall.model.inquiryHall.weightPrice`).d('权重单价'),
            dataIndex: 'weightPrice',
            width: 100,
            render: numberSeparatorRender,
          }
        : '',
      useTernaryExpression(doubleUnitFlag, {
        title: intl.get(`ssrc.queryRfq.model.queryRfq.netPrice`).d('单价(不含税)'),
        dataIndex: 'validNetSecondaryPrice',
        width: 100,
        align: 'right',
        render: (val, record) =>
          val !== null ? this.renderNetPrice(val, record, 'validNetSecondaryPrice') : '-',
      }),
      // 此列二开，禁止修改字段名
      {
        title: getNetPriceName(doubleUnitFlag),
        dataIndex: 'validNetPrice',
        width: 120,
        align: 'right',
        render: (val, record) =>
          val !== null ? this.renderNetPrice(val, record, 'validNetPrice') : '-',
      },
      {
        title: intl.get('ssrc.inquiryHall.model.inquiryHall.perNetPrice').d('每一单价(不含税)'),
        dataIndex: 'perNetPrice',
        width: 120,
        render: (val, record) =>
          doubleUnitFlag ? record.perNetSecondaryPrice : record.perNetPrice,
      },
      {
        title: intl
          .get('ssrc.inquiryHall.model.inquiryHall.perTaxIncludedPrice')
          .d('每一单价(含税)'),
        dataIndex: 'perTaxIncludedPrice',
        width: 120,
        render: (val, record) =>
          doubleUnitFlag ? record.perTaxIncludedSecPrice : record.perTaxIncludedPrice,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.differentPrice`).d('差异价'),
        dataIndex: 'differentPrice',
        width: 100,
        render: (val, record) => {
          const price =
            header.priceTypeCode === 'NET_PRICE'
              ? record[doubleUnitFlag ? 'validNetSecondaryPrice' : 'validNetPrice']
              : record[doubleUnitFlag ? 'validQuotationSecPrice' : 'validQuotationPrice'];

          return !isNil(price) && !isNil(record.referencePrice)
            ? numberSeparatorRender(math.minus(price, record.referencePrice))
            : '';
        },
      },
      header.multiCurrencyFlag
        ? {
            title: intl
              .get(`ssrc.inquiryHall.model.inquiryHall.unitPriceIncludedTax`)
              .d('本币含税单价'),
            dataIndex: 'baseQuotationPrice',
            align: 'right',
            width: 100,
            render: (val, record) =>
              val !== null ? this.renderNetPrice(val, record, 'baseQuotationPrice') : '-',
          }
        : '',
      header.multiCurrencyFlag
        ? {
            title: intl
              .get(`ssrc.inquiryHall.model.inquiryHall.currencyNetPrice`)
              .d('本币单价(不含税)'),
            dataIndex: 'baseNetPrice',
            align: 'right',
            width: 100,
            render: (val, record) =>
              val !== null ? this.renderNetPrice(val, record, 'baseNetPrice') : '-',
          }
        : '',
      {
        title: intl.get(`hzero.common.button.view`).d('查看'),
        dataIndex: 'quotationDetailFlag',
        width: 100,
        render: (_, record) => {
          const currentQuotationDetailProps = {
            rowData: record,
          };

          const quotationDetailProps = remote
            ? remote.process(
                'SSRC_DETAIL_CHECK_PRICE_TABS_PROCESS_TABLE_COLUMNS_QUOTATIONDETAILCOMMONPROPS',
                currentQuotationDetailProps,
                {
                  rfx,
                }
              )
            : currentQuotationDetailProps;

          return (
            <QuotationDetail
              rowData={record}
              sourceFrom="RFX"
              allowBuyerViewFlag
              pageFrom="checkPriceDetail"
              bidFlag={bidFlag}
              {...quotationDetailProps}
            />
          );
        },
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.specs`).d('规格'),
        dataIndex: 'specs',
        width: 100,
        render: (value) =>
          value ? (
            <Popover placement="topLeft" content={value}>
              {value}
            </Popover>
          ) : (
            ''
          ),
      },
      useTernaryExpression(doubleUnitFlag, {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.quantity`).d('需求数量'),
        dataIndex: 'secondaryQuantity',
        width: 100,
        render: (val) => (val !== null ? numberSeparatorRender(val) : '-'),
      }),
      useTernaryExpression(doubleUnitFlag, {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.availableQuantity`).d('可供数量'),
        dataIndex: 'validQuotationSecQuantity',
        width: 100,
        render: (val) => (val !== null ? numberSeparatorRender(val) : '-'),
      }),
      useTernaryExpression(doubleUnitFlag, {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.unit`).d('单位'),
        dataIndex: 'secondaryUomName',
        width: 100,
      }),
      {
        title: getQtyName(doubleUnitFlag),
        dataIndex: 'rfxQuantity',
        width: 100,
        render: (val) => (val !== null ? numberSeparatorRender(val) : '-'),
      },
      {
        title: getAvailableQtyName(doubleUnitFlag),
        dataIndex: 'validQuotationQuantity',
        width: 120,
        render: (val) => (val !== null ? numberSeparatorRender(val) : '-'),
      },
      {
        title: getUomName(doubleUnitFlag),
        dataIndex: 'uomName',
        width: 120,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.theLinePrice`).d('行金额'),
        dataIndex: 'totalPrice',
        width: 80,
        align: 'right',
        render: (val, record) => (
          <PrecisionInputNumber financial={record.currencyCode} type="hzero" readOnly value={val} />
        ),
      },
      {
        title: intl
          .get(`ssrc.inquiryHall.model.inquiryHall.lineAmountWithoutTax`)
          .d('行金额(不含税)'),
        dataIndex: 'netAmount',
        width: 140,
        render: (val, record) => (
          <PrecisionInputNumber financial={record.currencyCode} type="hzero" readOnly value={val} />
        ),
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.estimatedPrice`).d('预估单价(含税)'),
        dataIndex: 'estimatedPrice',
        width: 140,
        render: numberSeparatorRender,
      },
      {
        title: intl
          .get(`ssrc.inquiryHall.model.inquiryHall.netEstimatedPrice`)
          .d('预估单价(不含税)'),
        dataIndex: 'netEstimatedPrice',
        width: 140,
        render: numberSeparatorRender,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.estimatedAmount`).d('预估行金额(含税)'),
        dataIndex: 'estimatedAmount',
        width: 140,
        render: (val, record) => (
          <PrecisionInputNumber financial={record.currencyCode} type="hzero" readOnly value={val} />
        ),
      },
      {
        title: intl
          .get(`ssrc.inquiryHall.model.inquiryHall.netEstimatedAmount`)
          .d('预估行金额(不含税)'),
        dataIndex: 'netEstimatedAmount',
        width: 140,
        render: (val, record) => (
          <PrecisionInputNumber financial={record.currencyCode} type="hzero" readOnly value={val} />
        ),
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.initialFluctuation`).d('初始价涨跌幅'),
        dataIndex: 'initialFluctuation',
        width: 130,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.priceBatch`).d('价格批量'),
        dataIndex: 'priceBatchQuantity',
        width: 100,
        align: 'right',
        render: numberSeparatorRender,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.newPrice`).d('最新价'),
        dataIndex: 'newPrice',
        width: 100,
        render: numberSeparatorRender,
      },
      useTernaryExpression(doubleUnitFlag, {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.allottedQuantity`).d('分配数量'),
        dataIndex: 'allottedSecondaryQuantity',
        width: 100,
        render: numberSeparatorRender,
      }),
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.allottedRatio`).d('分配比例%'),
        dataIndex: 'allottedRatio',
        width: 120,
      },
      {
        title: getAllottedQuantity(doubleUnitFlag),
        dataIndex: 'allottedQuantity',
        width: 120,
        render: numberSeparatorRender,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.suggestedRemark`).d('选用理由'),
        dataIndex: 'suggestedRemark',
        width: 120,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.ladderInquiryFlag`).d('阶梯报价'),
        dataIndex: 'ladderInquiryFlag',
        width: 100,
        render: (val, record) =>
          val === 1 ? (
            <a onClick={() => viewLadderLevel(record)}>
              {intl.get(`ssrc.inquiryHall.view.message.button.ladderInquiryFlag`).d('阶梯报价')}
            </a>
          ) : null,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.preQuotationPrice`).d('上次报价'),
        dataIndex: 'preQuotationPrice',
        width: 100,
        render: numberSeparatorRender,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.priceFluctuation`).d('价格浮动'),
        dataIndex: 'priceFluctuation',
        width: 100,
      },
      {
        title: intl
          .get(`ssrc.inquiryHall.model.inquiryHall.commonQuotationDescription`, { quotationName })
          .d('{quotationName}说明'),
        dataIndex: 'validQuotationRemark',
        width: 120,
        render: (value) =>
          value ? (
            <Popover placement="topLeft" content={value}>
              {value}
            </Popover>
          ) : (
            ''
          ),
      },
      {
        title: intl.get('ssrc.common.productionPlace').d('产地'),
        dataIndex: 'origin',
        width: 120,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.paymentTerms`).d('付款方式'),
        dataIndex: 'paymentTypeName',
        width: 120,
      },
      {
        title: intl.get(`ssrc.common.model.common.termsOfPayment`).d('付款条款'),
        dataIndex: 'paymentTermName',
        width: 120,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.qVFrom`).d('报价有效期从'),
        dataIndex: 'validExpiryDateFrom',
        width: 120,
        render: (value) => value && moment(value).format(DEFAULT_DATE_FORMAT),
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.qVTo`).d('报价有效期至'),
        dataIndex: 'validExpiryDateTo',
        width: 120,
        render: (value) => value && moment(value).format(DEFAULT_DATE_FORMAT),
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.validPromisedDate`).d('承诺交货期'),
        dataIndex: 'validPromisedDate',
        width: 100,
        render: dateRender,
      },
      {
        title: intl.get('ssrc.common.deliveryCycleDay').d('供货周期(天)'),
        dataIndex: 'validDeliveryCycle',
        width: 120,
      },
      // 该字段二开，请勿修改字段名
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.minimumPurchaseAmount`).d('最小采购量'),
        dataIndex: 'minPurchaseQuantity',
        width: 100,
        render: numberSeparatorRender,
      },
      // 该字段二开，请勿修改字段名
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.minimumPackageAmount`).d('最小包装量'),
        dataIndex: 'minPackageQuantity',
        width: 100,
        render: numberSeparatorRender,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.includingFreight`).d('是否含运费'),
        dataIndex: 'freightIncludedFlag',
        width: 100,
        render: yesOrNoRender,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.freightAmount`).d('运费'),
        dataIndex: 'freightAmount',
        width: 100,
        render: (value, record) => {
          let cuxFreightAmountProps = {};
          cuxFreightAmountProps = remote
            ? remote.process(
                'SSRC_DETAIL_CHECK_PRICE_TABS_ITEM_PROCESS_ALL_FREIGHT_AMOUNT_PROPS',
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
              financial={record.quotationCurrencyCode}
              readOnly
              {...cuxFreightAmountProps}
            />
          );
        },
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.quotationTime`).d('报价时间'),
        dataIndex: 'quotedDate',
        width: 150,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.costPrice`).d('成本单价'),
        dataIndex: 'costPrice',
        width: 100,
      },
      {
        title: intl
          .get(`ssrc.inquiryHall.model.inquiryHall.supplierSavingAmount`)
          .d('节支金额(供应商)'),
        dataIndex: 'supplierSavingAmount',
        width: 100,
        render: (val, record) => (
          <PrecisionInputNumber financial={record.currencyCode} type="hzero" readOnly value={val} />
        ),
      },
      {
        title: intl
          .get(`ssrc.inquiryHall.model.inquiryHall.supplierSavingRatio`)
          .d('节支率(供应商)'),
        dataIndex: 'supplierSavingRatio',
        width: 100,
        render: (value) => (!isNil(value) ? `${value}%` : ''),
      },
      {
        title:
          header.auctionDirection === 'FORWARD'
            ? intl
                .get(`ssrc.inquiryHall.model.inquiryHall.supplierMaxSuggestedRatio`)
                .d('最高价中标率(供应商)')
            : intl
                .get(`ssrc.inquiryHall.model.inquiryHall.supplierMinMaxSuggestedRatio`)
                .d('最低价中标率(供应商)'),
        dataIndex: 'supplierMinMaxSuggestedRatio',
        render: (value) => (!isNil(value) ? `${value}%` : ''),
      },
      {
        title: intl
          .get(`ssrc.inquiryHall.model.inquiryHall.supplierLineAttachment`)
          .d('供应商行附件'),
        dataIndex: 'attachmentUuid',
        width: 150,
        render: (val, record) => {
          return !newQuotationFlag ? (
            <Upload
              filePreview
              viewOnly
              icon="download"
              bucketName={PRIVATE_BUCKET}
              bucketDirectory="ssrc-rfx-quotationline"
              attachmentUUID={val}
              tenantId={organizationId}
            />
          ) : (
            <FileGroup name="attachmentUuid" record={record} uiType="h0" fileType="LINE" />
          );
        },
      },
      {
        title: intl
          .get(`ssrc.supplierQuotation.model.supQuo.commonQuotationHistory`, { quotationName })
          .d('{quotationName}历史'),
        width: 100,
        dataIndex: 'quotationHistory',
        render: (_, record) => (
          <a onClick={() => fetchHistoryline(record)}>
            {intl.get(`hzero.common.button.view`).d('查看')}
          </a>
        ),
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.comparePriceHistory`).d('还比价历史'),
        dataIndex: 'comparePriceHistory',
        width: 150,
        render: (_, record) =>
          record.quotationLineId !== null ? (
            <a onClick={() => onComparePriceHistory(record)}>
              {intl.get(`hzero.common.button.view`).d('查看')}
            </a>
          ) : (
            ''
          ),
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.applicationScope`).d('适用范围'),
        dataIndex: 'applicationScopeFlag',
        width: 100,
        render: (_, record) => {
          const { applicationScopeFlag = 0, rfxLineItemId = null } = record;

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
      ...commonColumns,
    ].filter(Boolean);

    const scrollX = sum(columns.map((n) => (isNumber(n.width) ? n.width : 0)));

    const preTableProps = {
      bordered: true,
      rowKey: 'quotationLineId',
      columns: remote
        ? remote.process('SSRC_DETAIL_CHECK_PRICE_TABS_ITEM_COLUMNS', columns, {
            doubleUnitFlag,
            rfx,
            header,
          })
        : columns,
      scroll: { x: scrollX, y: 360 },
      dataSource,
      pagination,
      onChange: (page) => onChange(page, itemLineHeader),
    };

    const tableProps = remote
      ? remote.process('SSRC_DETAIL_CHECK_PRICE_TABS_ITEM_TABLE_PROPS', preTableProps, {
          header,
          rfx,
        })
      : preTableProps;

    return customizeTable(
      {
        code: `SSRC.${unitCodeSymbol}_DETAIL.ITEM_DETAIL`,
        readOnly: true,
      },
      <EditTable {...tableProps} />
    );
  }
}
