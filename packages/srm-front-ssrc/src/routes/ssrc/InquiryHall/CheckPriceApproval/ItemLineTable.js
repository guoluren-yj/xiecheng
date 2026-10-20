import React, { Component } from 'react';
import { Popover } from 'hzero-ui';
import { sum, isNumber, isFunction, isNil } from 'lodash';
import { Bind } from 'lodash-decorators';
import { connect } from 'dva';
import moment from 'moment';
import { math } from 'choerodon-ui/dataset';

import EditTable from 'components/EditTable';
import Upload from 'srm-front-boot/lib/components/Upload';
import intl from 'utils/intl';
import { yesOrNoRender, dateRender } from 'utils/renderer';
import { DEFAULT_DATE_FORMAT } from 'utils/constants';
import { roundEliminate, numberSeparatorRender } from '@/utils/renderer';
import QuotationDetail from '@/routes/components/QuotationDetailNew/Detail';
import { INQUIRY, getQuotationName } from '@/utils/globalVariable';
import { PRIVATE_BUCKET } from '_utils/config';
import FileGroup from '@/routes/components/SupplierQuotationAttachment';
import PrecisionInputNumber from '@/routes/components/Precision/PrecisionInputNumber';

class ItemLineTable extends Component {
  constructor(props) {
    super(props);
    if (isFunction(props.onRef)) {
      props.onRef(props.rfxLineItemId, this);
    }
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
    const { header = {} } = this.props;
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

    const { itemLineFloorPrice, itemLineHighestPrice, redField } = record;

    if (header.auctionDirection === 'FORWARD') {
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
    // const { header = {} } = this.props;
    // eslint-disable-next-line
    // const newDataSource = dataSource.filter((r) => r.rfxLineItemId == rfxLineItemId);
    // let mean = '';
    // const totalPriceList =
    //   newDataSource &&
    //   newDataSource.filter((item) => item.totalPrice !== null).map((r) => r.totalPrice);
    // const totalPriceMax = Math.max(...totalPriceList);
    // const totalPriceMin = Math.min(...totalPriceList);
    // const { itemLineFloorPrice, itemLineHighestPrice } = record;

    // if (header.auctionDirection === 'FORWARD') {
    //   mean =
    //     itemLineHighestPrice === val ? (
    //       <span style={{ color: 'red' }}>
    //         <PrecisionInputNumber
    //           financial={record.currencyCode}
    //           type="hzero"
    //           readOnly
    //           value={val}
    //         />
    //       </span>
    //     ) : (
    //       <PrecisionInputNumber financial={record.currencyCode} type="hzero" readOnly value={val} />
    //     );
    // } else {
    //   mean =
    //     itemLineFloorPrice === val ? (
    //       <span style={{ color: 'red' }}>
    //         <PrecisionInputNumber
    //           financial={record.currencyCode}
    //           type="hzero"
    //           readOnly
    //           value={val}
    //         />
    //       </span>
    //     ) : (
    //       <PrecisionInputNumber financial={record.currencyCode} type="hzero" readOnly value={val} />
    //     );
    // }
    return (
      <PrecisionInputNumber financial={record.currencyCode} type="hzero" readOnly value={val} />
    );
  }

  @Bind()
  renderFormatPrice(val = null, record, name) {
    let mean = '';
    const formatValue = numberSeparatorRender(val);
    const { redField } = record;

    mean = redField === name ? <span style={{ color: 'red' }}>{formatValue}</span> : formatValue;
    return mean;
  }

  /**
   * 表格行事件
   * [东博] 重写, 谨慎修改!!!
   * @protected
   */
  @Bind()
  renderOnRow() {}

  /**
   * 表格列
   * [东博] 重写, 谨慎修改!!!
   * @protected
   */
  renderColumns() {
    const {
      organizationId,
      viewLadderLevel,
      sourceKey = INQUIRY,
      header = {},
      onComparePriceHistory = () => {},
      remote,
    } = this.props;
    const { newQuotationFlag } = header || {};
    let columns = [
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.suggestedFlag`).d('选用'),
        dataIndex: 'suggestedFlag',
        width: 60,
        render: yesOrNoRender,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.companyName`).d('供应商名称'),
        dataIndex: 'companyName',
        width: 380,
        render: (value, record) =>
          value ? (
            <Popover placement="topLeft" content={value}>
              {roundEliminate(value, record)}
            </Popover>
          ) : (
            ''
          ),
      },
      {
        dataIndex: 'candidateSuggestion',
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.candidateSuggestion`).d('推荐意见'),
        width: 100,
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
          .get(`ssrc.inquiryHall.model.inquiryHall.commomQuotationStatus`, {
            quotationName: getQuotationName(sourceKey === 'NEW_BID'),
          })
          .d('{quotationName}状态'),
        dataIndex: 'quotationLineStatusMeaning',
        width: 100,
      },
      {
        title: intl.get('ssrc.inquiryHall.model.inquiryHall.unitPriceTax').d('单价(含税)'),
        dataIndex: 'validQuotationPrice',
        width: 100,
        align: 'right',
        render: (val, record) => this.renderFormatPrice(val, record, 'validQuotationPrice'),
      },
      {
        title: intl.get(`ssrc.queryRfq.model.queryRfq.netPrice`).d('单价(不含税)'),
        dataIndex: 'validNetPrice',
        width: 100,
        render: (val, record) => this.renderFormatPrice(val, record, 'validNetPrice'),
      },
      {
        title: intl.get('ssrc.inquiryHall.model.inquiryHall.perNetPrice').d('每一单价(不含税)'),
        dataIndex: 'perNetPrice',
        width: 120,
      },
      {
        title: intl
          .get('ssrc.inquiryHall.model.inquiryHall.perTaxIncludedPrice')
          .d('每一单价(含税)'),
        dataIndex: 'perTaxIncludedPrice',
        width: 120,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.differentPrice`).d('差异价'),
        dataIndex: 'differentPrice',
        width: 100,
        render: (val, record) =>
          (header.priceTypeCode === 'NET_PRICE'
            ? record.validNetPrice
            : record.validQuotationPrice) !== null && record.referencePrice !== null
            ? numberSeparatorRender(
                math.minus(
                  header.priceTypeCode === 'NET_PRICE'
                    ? record.validNetPrice
                    : record.validQuotationPrice,
                  record.referencePrice
                )
              )
            : '',
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.quotationDetail`).d('报价明细'),
        dataIndex: 'quotationDetailFlag',
        width: 100,
        render: (val, record) => (
          <React.Fragment>
            {
              <QuotationDetail
                rowData={record}
                sourceFrom="RFX"
                allowBuyerViewFlag
                modalType="hzero"
              />
            }
          </React.Fragment>
        ),
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.availableQuantity`).d('可供数量'),
        dataIndex: 'validQuotationQuantity',
        width: 100,
        render: numberSeparatorRender,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.theLinePrice`).d('行金额'),
        dataIndex: 'totalPrice',
        width: 80,
        align: 'right',
        render: (val, record) => val && this.renderTotalPrice(val, record),
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
      header.priceTypeCode === 'TAX_INCLUDED_PRICE'
        ? {
            title: intl
              .get(`ssrc.inquiryHall.model.inquiryHall.estimatedPrice`)
              .d('预估单价(含税)'),
            dataIndex: 'estimatedPrice',
            width: 100,
          }
        : {
            title: intl
              .get(`ssrc.inquiryHall.model.inquiryHall.netEstimatedPrice`)
              .d('预估单价(不含税)'),
            dataIndex: 'netEstimatedPrice',
            width: 100,
          },
      header.priceTypeCode === 'TAX_INCLUDED_PRICE'
        ? {
            title: intl
              .get(`ssrc.inquiryHall.model.inquiryHall.estimatedAmount`)
              .d('预估行金额(含税)'),
            dataIndex: 'estimatedAmount',
            width: 100,
            render: (val, record) => (
              <PrecisionInputNumber
                financial={record.currencyCode}
                type="hzero"
                readOnly
                value={val}
              />
            ),
          }
        : {
            title: intl
              .get(`ssrc.inquiryHall.model.inquiryHall.netEstimatedAmount`)
              .d('预估行金额(不含税)'),
            dataIndex: 'netEstimatedAmount',
            width: 100,
            render: (val, record) => (
              <PrecisionInputNumber
                financial={record.currencyCode}
                type="hzero"
                readOnly
                value={val}
              />
            ),
          },
      {
        dataIndex: 'supplierSavingAmount',
        title: intl
          .get(`ssrc.inquiryHall.model.inquiryHall.supplierSavingAmount`)
          .d('节支金额(供应商)'),
        width: 130,
        render: (value, record) => (
          <PrecisionInputNumber
            value={value}
            financial={record.currencyCode}
            type="hzero"
            readOnly
          />
        ),
      },
      {
        title: intl
          .get(`ssrc.inquiryHall.model.inquiryHall.supplierSavingRatio`)
          .d('节支率(供应商)'),
        dataIndex: 'supplierSavingRatio',
        width: 130,
        render: (value) => (!isNil(value) ? `${value}%` : '-'),
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
        width: 130,
        render: (value) => (!isNil(value) ? `${value}%` : '-'),
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.priceBatch`).d('价格批量'),
        dataIndex: 'priceBatchQuantity',
        width: 100,
        align: 'right',
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.allottedQuantity`).d('分配数量'),
        dataIndex: 'allottedQuantity',
        width: 100,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.allottedRatio`).d('分配比例%'),
        dataIndex: 'allottedRatio',
        width: 120,
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
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.priceFluctuation`).d('价格浮动'),
        dataIndex: 'priceFluctuation',
        width: 100,
      },
      {
        title: intl
          .get(`ssrc.inquiryHall.model.inquiryHall.commonQuotationDescription`, {
            quotationName: getQuotationName(sourceKey === 'NEW_BID'),
          })
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
        width: 100,
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
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.deliveryPeriod`).d('供货周期'),
        dataIndex: 'validDeliveryCycle',
        width: 100,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.minimumPurchaseAmount`).d('最小采购量'),
        dataIndex: 'minPurchaseQuantity',
        width: 100,
        render: numberSeparatorRender,
      },
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
        render: numberSeparatorRender,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.newPrice`).d('最新价'),
        dataIndex: 'newPrice',
        width: 100,
        render: numberSeparatorRender,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.quotationTime`).d('报价时间'),
        dataIndex: 'quotedDate',
        width: 150,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.costPrice`).d('成本单价'),
        dataIndex: 'costPrice',
        align: 'right',
        width: 100,
      },
      {
        title: intl
          .get(`ssrc.inquiryHall.model.inquiryHall.supplierLineAttachment`)
          .d('供应商行附件'),
        dataIndex: 'attachmentUuid',
        width: 120,
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
            <FileGroup record={record} uiType="h0" fileType="LINE" />
          );
        },
      },
      {
        dataIndex: 'comparePriceHistory',
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.comparePriceHistory`).d('还比价历史'),
        width: 120,
        render: (_, record) =>
          record.quotationLineId !== null ? (
            <a onClick={() => onComparePriceHistory(record)}>
              {intl.get(`hzero.common.button.view`).d('查看')}
            </a>
          ) : (
            ''
          ),
      },
    ];

    columns = remote
      ? remote.process('SSRC_CHECK_APPROVE_ITEMLINE_TABLE_COLUMNS', columns, {
          sourceKey,
          header,
          that: this,
        })
      : columns;

    return columns.filter(Boolean);
  }

  render() {
    const {
      rfxLineItemId = undefined,
      onChange,
      dataSource = [],
      pagination = {},
      loadingObj,
      // showQuotationDetail,
      customizeTable,
      sourceKey = INQUIRY,
      remote,
    } = this.props;
    // eslint-disable-next-line
    const newDataSource = dataSource.filter((r) => r.rfxLineItemId == rfxLineItemId);
    const newPagination = pagination[rfxLineItemId];
    const columns = this.renderColumns();
    const scrollX = sum(columns.map((n) => (isNumber(n.width) ? n.width : 0)));
    const preTableProps = {
      bordered: true,
      rowKey: 'quotationLineId',
      loading: loadingObj[rfxLineItemId] && loadingObj[rfxLineItemId].fetchItemQuoteLineLoading,
      columns,
      scroll: { x: scrollX },
      dataSource: newDataSource,
      pagination: newPagination,
      onChange: (page) => onChange(page, rfxLineItemId),
      onRow: this.renderOnRow,
    };
    const tableProps = remote
      ? remote.process('SSRC_CHECK_APPROVE_ITEMLINE_TABLE_PROPS', preTableProps, { sourceKey })
      : preTableProps;
    return customizeTable(
      {
        code: `SSRC.${sourceKey}_HALL_CHECK_PRICE.TAB_ITEM_DTL`,
        readOnly: remote
          ? remote.process('SSRC_CHECK_APPROVE_ITEMLINE_TABLE_READ_ONLY', true)
          : true,
      },
      <EditTable {...tableProps} />
    );
  }
}

const hocFunc = (com) =>
  connect(({ inquiryHall }) => ({
    inquiryHall,
  }))(com);

export { hocFunc, ItemLineTable };
export default hocFunc(ItemLineTable);
