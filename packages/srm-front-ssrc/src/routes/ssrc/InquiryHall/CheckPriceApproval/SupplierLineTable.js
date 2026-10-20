import React, { Component } from 'react';
import { Popover } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { sum, isNumber, isEmpty, isFunction, isNil } from 'lodash';
import moment from 'moment';
import { DEFAULT_DATE_FORMAT } from 'utils/constants';
import { math } from 'choerodon-ui/dataset';

import EditTable from 'components/EditTable';
import Upload from 'srm-front-boot/lib/components/Upload';

import intl from 'utils/intl';
import { yesOrNoRender, dateRender } from 'utils/renderer';
import { numberSeparatorRender } from '@/utils/renderer';
import { INQUIRY, getQuotationName } from '@/utils/globalVariable';
import { PRIVATE_BUCKET } from '_utils/config';
import FileGroup from '@/routes/components/SupplierQuotationAttachment';
import PrecisionInputNumber from '@/routes/components/Precision/PrecisionInputNumber';
import QuotationDetail from '@/routes/components/QuotationDetailNew/Detail';

export default class SupplierLineTable extends Component {
  constructor(props) {
    super(props);
    if (isFunction(props.onRef)) {
      props.onRef(props.rfxLineSupplierId, this);
    }
  }

  /**
   * 检查表格内容值发生变化
   */
  @Bind()
  hasChangeData(record, changeValues) {
    const { onChangeTableData } = this.props;
    if (!isEmpty(changeValues)) {
      onChangeTableData();
    }
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
      header = {},
      sourceKey = INQUIRY,
      onComparePriceHistory = () => {},
      remote,
    } = this.props;
    const { newQuotationFlag = 0 } = header || {};
    let columns = [
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.suggestedFlag`).d('选用'),
        dataIndex: 'suggestedFlag',
        width: 60,
        render: yesOrNoRender,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.lineNo.`).d('行号'),
        dataIndex: 'rfxLineItemNum',
        width: 60,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.itemCode`).d('物料编码'),
        dataIndex: 'itemCode',
        width: 120,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.newPrice`).d('最新价'),
        dataIndex: 'newPrice',
        width: 100,
        render: numberSeparatorRender,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.itemName`).d('物料名称'),
        dataIndex: 'itemName',
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
          .get(`ssrc.inquiryHall.model.inquiryHall.commonQuotationStatus`, {
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
        render: numberSeparatorRender,
      },
      {
        title: intl.get(`ssrc.queryRfq.model.queryRfq.netPrice`).d('单价(不含税)'),
        dataIndex: 'validNetPrice',
        width: 100,
        render: numberSeparatorRender,
      },
      {
        title: intl.get('ssrc.inquiryHall.model.inquiryHall.itemSignPostPrice').d('标杆价'),
        dataIndex: 'itemSignPostPrice',
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
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.priceBatch`).d('价格批量'),
        dataIndex: 'priceBatchQuantity',
        width: 100,
        align: 'right',
        render: numberSeparatorRender,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.allottedQuantity`).d('分配数量'),
        dataIndex: 'allottedQuantity',
        width: 100,
        render: numberSeparatorRender,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.allottedRatio`).d('分配比例%'),
        dataIndex: 'allottedRatio',
        width: 120,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.reason`).d('选用理由'),
        dataIndex: 'suggestedRemark',
        width: 100,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.ladderInquiryFlag`).d('阶梯报价'),
        dataIndex: 'ladderInquiryFlag',
        width: 100,
        render: (val, record) =>
          val === 1 ? (
            <a onClick={() => viewLadderLevel(record)}>
              {intl.get(`ssrc.inquiryHall.view.message.button.ladderLevel`).d('阶梯报价')}
            </a>
          ) : null,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.lastQuotation`).d('上次报价'),
        dataIndex: 'preQuotationPrice',
        width: 100,
        render: numberSeparatorRender,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.floatPrice`).d('价格浮动'),
        dataIndex: 'priceFluctuation',
        align: 'right',
        width: 100,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.quantity`).d('需求数量'),
        dataIndex: 'rfxQuantity',
        width: 100,
        render: numberSeparatorRender,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.availableQuantity`).d('可供数量'),
        dataIndex: 'validQuotationQuantity',
        width: 100,
        render: numberSeparatorRender,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.lineAmount`).d('行金额'),
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
        dataIndex: 'quotationDetailFlag',
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.quotationDetail`).d('报价明细'),
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
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.quotationTime`).d('报价时间'),
        dataIndex: 'quotedDate',
        width: 150,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.itemSavingAmount`).d('节支金额(物料)'),
        dataIndex: 'itemSavingAmount',
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
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.itemSavingRatio`).d('节支率(物料)'),
        dataIndex: 'itemSavingRatio',
        width: 130,
        render: (value) => (!isNil(value) ? `${value}%` : '-'),
      },
      {
        title: intl
          .get(`ssrc.inquiryHall.model.inquiryHall.minMaxSuggestedFlag`)
          .d('是否最低价中标'),
        dataIndex: 'itemMinMaxSuggestedFlag',
        width: 130,
        render: (value) => yesOrNoRender(value),
      },
      {
        title: intl
          .get(`ssrc.inquiryHall.model.inquiryHall.supplierLineAttachment`)
          .d('供应商行附件'),
        dataIndex: 'attachmentUuid',
        width: 110,
        render: (val, record) => {
          return !newQuotationFlag ? (
            <Upload
              filePreview
              viewOnly
              bucketName={PRIVATE_BUCKET}
              bucketDirectory="ssrc-rfx-quotationline"
              icon="download"
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
      ? remote.process('SSRC_CHECK_APPROVE_SUPPLIER_TABLE_COLUMNS', columns, {
          sourceKey,
          header,
          that: this,
        })
      : columns;
    return columns.filter(Boolean);
  }

  render() {
    const {
      rfxLineSupplierId,
      loadingObj,
      onChange,
      dataSource,
      pagination,
      customizeTable,
      sourceKey = INQUIRY,
      remote,
    } = this.props;
    // eslint-disable-next-line
    const newDataSource = dataSource.filter((r) => r.rfxLineSupplierId == rfxLineSupplierId);
    const newPagination = pagination[rfxLineSupplierId];

    const columns = this.renderColumns();
    const scrollX = sum(columns.map((n) => (isNumber(n.width) ? n.width : 0)));
    const preTableProps = {
      bordered: true,
      rowKey: 'quotationLineId',
      loading:
        loadingObj[rfxLineSupplierId] && loadingObj[rfxLineSupplierId].fetchItemQuoteLineLoading,
      columns,
      scroll: { x: scrollX },
      dataSource: newDataSource,
      pagination: newPagination,
      onDataChange: this.hasChangeData,
      onChange: (page) => onChange(page, rfxLineSupplierId),
      onRow: this.renderOnRow,
    };
    const tableProps = remote
      ? remote.process('SSRC_CHECK_APPROVE_SUPPLIER_TABLE_PROPS', preTableProps, { sourceKey })
      : preTableProps;
    return customizeTable(
      {
        code: `SSRC.${sourceKey}_HALL_CHECK_PRICE.TAB_SUPPLIER`, // 单元编码，必传
        readOnly: remote
          ? remote.process('SSRC_CHECK_APPROVE_SUPPLIERLINE_TABLE_READ_ONLY', true)
          : true,
      },
      <EditTable {...tableProps} />
    );
  }
}
