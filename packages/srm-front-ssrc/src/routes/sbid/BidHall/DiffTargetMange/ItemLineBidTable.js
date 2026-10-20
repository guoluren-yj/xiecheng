import React, { Component } from 'react';
import { Popover } from 'hzero-ui';
import { isNumber, sum } from 'lodash';
import moment from 'moment';
import { DEFAULT_DATE_FORMAT } from 'utils/constants';
import intl from 'utils/intl';
import EditTable from 'components/EditTable';
import { dateRender } from 'utils/renderer';
import { numberSeparatorRender } from '@/utils/renderer';
import QuotationDetail from '@/routes/components/QuotationDetailNew/Detail';

export default class ItemLineTable extends Component {
  /**
   * render
   * @returns React.element
   */
  render() {
    const {
      header = {},
      item,
      onSearch,
      loadingObj = {},
      calibQuotationList = {},
      quotationHeaderId,
      sectionId,
      customizeTable,
      supplierCompanyId,
    } = this.props;
    const testData =
      calibQuotationList[`${quotationHeaderId}${sectionId}`] &&
      calibQuotationList[`${quotationHeaderId}${sectionId}`].list;
    const pagination =
      calibQuotationList[`${quotationHeaderId}${sectionId}`] &&
      calibQuotationList[`${quotationHeaderId}${sectionId}`].pagination;
    const columns = [
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.bidLineItemNum`).d('行号'),
        dataIndex: 'bidLineItemNum',
        width: 100,
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.itemCode`).d('物料编码'),
        dataIndex: 'itemCode',
        width: 200,
      },
      {
        title: intl.get(`ssrc.common.goodsDescription`).d('物品描述'),
        dataIndex: 'itemName',
        width: 200,
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
        title: intl.get(`ssrc.bidHall.model.bidHall.itemCategory`).d('物品分类'),
        dataIndex: 'itemCategoryName',
        width: 200,
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
        title: intl.get(`ssrc.supplierBid.model.supplierBid.quotationDetails`).d('报价明细'),
        dataIndex: 'priceDetail',
        width: 100,
        render: (val, record) => (
          <QuotationDetail rowData={record} sourceFrom="BID" allowBuyerViewFlag />
        ),
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.specifications`).d('规格'),
        dataIndex: 'specifications',
        width: 100,
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.model`).d('型号'),
        dataIndex: 'model',
        width: 100,
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.taxIncludedPrice`).d('单价(含税)'),
        dataIndex: 'validQuotationPrice',
        width: 100,
        align: 'right',
        render: numberSeparatorRender,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.netPrice`).d('单价(不含税)'),
        dataIndex: 'netPrice',
        align: 'right',
        width: 100,
        render: numberSeparatorRender,
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.canSupportNum`).d('可供数量'),
        dataIndex: 'validQuotationQuantity',
        width: 100,
        render: numberSeparatorRender,
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.needNum`).d('需求数量'),
        dataIndex: 'bidQuantity',
        width: 100,
        render: numberSeparatorRender,
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.unit`).d('单位'),
        dataIndex: 'uomName',
        width: 80,
      },
      {
        title: <span>{intl.get(`ssrc.bidHall.model.bidHall.taxRate`).d('税率')}(%)</span>,
        dataIndex: 'taxRate',
        width: 100,
        render: (val) => val || intl.get('ssrc.bidHall.model.bidHall.excludingTax').d('不含税'),
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.allottedQuantity`).d('中标数量'),
        dataIndex: 'allottedQuantity',
        width: 100,
        render: numberSeparatorRender,
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.allottedPrice`).d('中标金额'),
        dataIndex: 'allottedPrice',
        width: 100,
        render: numberSeparatorRender,
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.allottedRatio`).d('中标比例'),
        dataIndex: 'allottedRatio',
        width: 100,
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.demandDate`).d('需求日期'),
        dataIndex: 'demandDate',
        width: 100,
        render: (val) => val && moment(val).format(DEFAULT_DATE_FORMAT),
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.costPrice`).d('标底单价'),
        dataIndex: 'costPrice',
        width: 100,
        render: numberSeparatorRender,
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.deliveryDay`).d('供货周期(天)'),
        dataIndex: 'validDeliveryCycle',
        width: 100,
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.currentPromisedDate`).d('承诺交付日期'),
        dataIndex: 'validPromisedDate',
        width: 150,
        render: (val) => val && moment(val).format(DEFAULT_DATE_FORMAT),
      },
      header.explorationFlag
        ? {
            title: intl.get(`ssrc.common.supplierExplorationStatus`).d('是否踏勘'),
            dataIndex: 'supplierExplorationStatusMeaning',
            width: 100,
          }
        : '',
      header.explorationFlag
        ? {
            title: intl.get(`ssrc.common.supplierExplorationDate`).d('踏勘日期'),
            dataIndex: 'supplierExplorationDate',
            width: 100,
            render: dateRender,
          }
        : '',
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.validRemark`).d('投标备注'),
        dataIndex: 'validRemark',
        width: 200,
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
        title: intl
          .get(`ssrc.bidHall.model.supplierBid.quotationStartValidTime`)
          .d('报价有效日期从'),
        dataIndex: 'quotationExpiryDateFrom',
        width: 150,
      },
      {
        title: intl.get(`ssrc.bidHall.model.supplierBid.quotationEndValidTime`).d('报价有效日期至'),
        dataIndex: 'quotationExpiryDateTo',
        width: 150,
      },
    ].filter(Boolean);
    const scrollX = sum(columns.map((n) => (isNumber(n.width) ? n.width : 100)));
    return (
      <React.Fragment>
        {customizeTable(
          {
            code: 'SSRC.BID_HALL_CHECK_PRICE.TAB_PACK',
            cacheKey: `${sectionId}-${supplierCompanyId}`,
          },
          <EditTable
            bordered
            rowKey="quotationLineId"
            // loading={loading}
            columns={columns}
            scroll={{ x: scrollX }}
            dataSource={testData}
            pagination={pagination}
            loading={
              loadingObj[quotationHeaderId] && loadingObj[quotationHeaderId].queryCalibrationLoading
            }
            onChange={(page) => onSearch(page, quotationHeaderId, item)}
          />
        )}
      </React.Fragment>
    );
  }
}
