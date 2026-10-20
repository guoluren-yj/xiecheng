import React, { Component } from 'react';
import { sum, isNumber, isFunction } from 'lodash';
import { Popover } from 'hzero-ui';
import { math } from 'choerodon-ui/dataset';
import moment from 'moment';
import EditTable from 'components/EditTable';
import Upload from 'srm-front-boot/lib/components/Upload';
import { DEFAULT_DATE_FORMAT } from 'utils/constants';

import intl from 'utils/intl';
import { yesOrNoRender, dateRender } from 'utils/renderer';
import { numberSeparatorRender } from '@/utils/renderer';
import { PRIVATE_BUCKET } from '_utils/config';

import FileGroup from '@/routes/components/SupplierQuotationAttachment';
import QuotationDetail from '@/routes/components/QuotationDetailNew/Detail';
import { INQUIRY, getQuotationName, BID } from '@/utils/globalVariable';
import { getPriceName, getAvailableQtyName, getNetPriceName, getQtyName } from '@/utils/utils';

export default class ItemLineTable extends Component {
  constructor(props) {
    super(props);
    if (isFunction(props.onRef)) {
      props.onRef(props.rfxLineItemId, this);
    }
    this.state = {};
  }

  /**
   * 渲染单价样式
   */
  renderValidQuotationPrice(val) {
    const { header = {}, dataSource = [], rfxLineItemId = undefined } = this.props;
    // eslint-disable-next-line
    const newDataSource = dataSource.filter((r) => r.rfxLineItemId == rfxLineItemId);
    let mean = '';
    const validQuotationPriceList =
      newDataSource &&
      newDataSource
        .filter((item) => item.validQuotationPrice !== null)
        .map((r) => r.validQuotationPrice);
    const validQuotationPriceMax = math.max(...validQuotationPriceList);
    const validQuotationPriceMin = math.min(...validQuotationPriceList);
    const formatValue = numberSeparatorRender(val);
    if (header.auctionDirection === 'FORWARD') {
      mean =
        validQuotationPriceMax === formatValue ? (
          <span style={{ color: 'red' }}>{formatValue}</span>
        ) : (
          formatValue
        );
    } else {
      mean =
        validQuotationPriceMin === formatValue ? (
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
  renderTotalPrice(val) {
    const { header = {}, dataSource = [], rfxLineItemId = undefined } = this.props;
    // eslint-disable-next-line
    const newDataSource = dataSource.filter((r) => r.rfxLineItemId == rfxLineItemId);
    let mean = '';
    const totalPriceList =
      newDataSource &&
      newDataSource.filter((item) => item.totalPrice !== null).map((r) => r.totalPrice);
    const totalPriceMax = math.max(...totalPriceList);
    const totalPriceMin = math.min(...totalPriceList);
    const formatValue = numberSeparatorRender(val);
    if (header.auctionDirection === 'FORWARD') {
      mean =
        totalPriceMax === formatValue ? (
          <span style={{ color: 'red' }}>{formatValue}</span>
        ) : (
          formatValue
        );
    } else {
      mean =
        totalPriceMin === formatValue ? (
          <span style={{ color: 'red' }}>{formatValue}</span>
        ) : (
          formatValue
        );
    }
    return mean;
  }

  render() {
    const {
      organizationId,
      rfxLineItemId = undefined,
      onChange,
      dataSource = [],
      pagination = {},
      loadingObj,
      viewLadderLevel,
      customizeTable,
      sourceKey = INQUIRY,
      doubleUnitFlag = false,
      newQuotationFlag = 0,
    } = this.props;
    // eslint-disable-next-line
    const newDataSource = dataSource.filter((r) => r.rfxLineItemId == rfxLineItemId);
    const newPagination = pagination[rfxLineItemId];
    const quotationName = getQuotationName(sourceKey === BID);

    const columns = [
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.supplierCode`).d('供应商编码'),
        dataIndex: 'companyNum',
        width: 120,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.supplierName`).d('供应商名称'),
        dataIndex: 'companyName',
        width: 150,
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
        title: getPriceName(doubleUnitFlag),
        dataIndex: 'validQuotationPrice',
        width: 150,
        align: 'right',
        render: (val) => val && this.renderValidQuotationPrice(val),
      },
      doubleUnitFlag
        ? {
            title: intl.get(`ssrc.common.model.common.taxPrice`).d('单价(含税)'),
            dataIndex: 'validQuotationSecPrice',
            width: 100,
            align: 'right',
            render: (val) => val && this.renderValidQuotationPrice(val),
          }
        : null,
      {
        title: getNetPriceName(doubleUnitFlag),
        dataIndex: 'validNetPrice',
        align: 'right',
        width: 150,
        render: numberSeparatorRender,
      },
      doubleUnitFlag
        ? {
            title: intl.get(`ssrc.common.model.common.netPrice`).d('单价(不含税)'),
            dataIndex: 'validNetSecondaryPrice',
            align: 'right',
            width: 100,
            render: numberSeparatorRender,
          }
        : null,
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.quotationDetail`).d('报价明细'),
        dataIndex: 'quotationDetailFlag',
        width: 100,
        render: (val, record) => (
          <React.Fragment>
            {<QuotationDetail rowData={record} sourceFrom="RFX" allowBuyerViewFlag bidFlag={sourceKey === BID} />}
          </React.Fragment>
        ),
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
        width: 100,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.ladderInquiryFlag`).d('阶梯报价'),
        dataIndex: 'ladderInquiryFlag',
        width: 100,
        render: (val, record) =>
          val === 1 ? (
            <a onClick={() => viewLadderLevel(record)}>
              {intl.get(`ssrc.inquiryHall.model.inquiryHall.ladderInquiryFlag`).d('阶梯报价')}
            </a>
          ) : null,
      },
      {
        title: getQtyName(doubleUnitFlag),
        dataIndex: 'rfxQuantity',
        width: 150,
        render: numberSeparatorRender,
      },
      doubleUnitFlag
        ? {
            title: intl.get(`ssrc.inquiryHall.model.inquiryHall.quantity`).d('需求数量'),
            dataIndex: 'secondaryQuantity',
            width: 100,
            render: numberSeparatorRender,
          }
        : null,
      {
        title: getAvailableQtyName(doubleUnitFlag),
        dataIndex: 'validQuotationQuantity',
        width: 150,
        render: numberSeparatorRender,
      },
      doubleUnitFlag
        ? {
            title: intl.get(`ssrc.inquiryHall.model.inquiryHall.availableQuantity`).d('可供数量'),
            dataIndex: 'validQuotationSecQuantity',
            width: 100,
            render: numberSeparatorRender,
          }
        : null,
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.lineAmount`).d('行金额'),
        dataIndex: 'totalPrice',
        width: 80,
        align: 'right',
        render: (val) => val && this.renderTotalPrice(val),
      },
      {
        title: intl
          .get(`ssrc.inquiryHall.model.inquiryHall.lineAmountWithoutTax`)
          .d('行金额(不含税)'),
        dataIndex: 'netAmount',
        width: 140,
        render: numberSeparatorRender,
      },
      {
        title: intl
          .get(`ssrc.inquiryHall.model.inquiryHall.commonQuotationDescription`, { quotationName })
          .d('{quotationName}说明'),
        dataIndex: 'validQuotationRemark',
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
        title: intl.get('ssrc.common.productionPlace').d('产地'),
        dataIndex: 'origin',
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
            <FileGroup name="attachmentUuid" record={record} uiType="h0" fileType="LINE" />
          );
        },
      },
    ].filter(Boolean);
    const scrollX = sum(columns.map((n) => (isNumber(n.width) ? n.width : 0)));
    return customizeTable(
      {
        code: `SSRC.${sourceKey}_HALL_PRETRIAL.ITEM_DETAIL`,
      },
      <EditTable
        bordered
        rowKey="quotationLineId"
        loading={loadingObj[rfxLineItemId] && loadingObj[rfxLineItemId].fetchItemQuoteLineLoading}
        columns={columns}
        scroll={{ x: scrollX }}
        dataSource={newDataSource}
        pagination={newPagination}
        onChange={(page) => onChange(page, rfxLineItemId)}
      />
    );
  }
}
