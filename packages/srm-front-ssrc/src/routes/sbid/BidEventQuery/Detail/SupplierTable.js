import moment from 'moment';
import React, { Component } from 'react';
import { isNumber, sum, isFunction } from 'lodash';
import { Popover } from 'hzero-ui';

import intl from 'utils/intl';
import EditTable from 'components/EditTable';
import { DEFAULT_DATE_FORMAT } from 'utils/constants';
import { yesOrNoRender, dateRender } from 'utils/renderer';
import { numberSeparatorRender } from '@/utils/renderer';
import QuotationDetail from '@/routes/components/QuotationDetailNew/Detail';

export default class SupplierLineTable extends Component {
  constructor(props) {
    super(props);
    if (isFunction(props.onRef)) {
      props.onRef(this);
    }
  }

  render() {
    const {
      header = {},
      loadingObj,
      dataSource = {},
      onSearch,
      supplierCompanyId = '',
      customizeTable,
    } = this.props;
    const testData =
      (dataSource[`${supplierCompanyId}`] && dataSource[`${supplierCompanyId}`].supplierItemList) ||
      [];
    const pagination =
      (dataSource[`${supplierCompanyId}`] &&
        dataSource[`${supplierCompanyId}`].supplierItemPagination) ||
      {};
    // 审批页面
    const columns = [
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.lineNo`).d('行号'),
        dataIndex: 'bidLineItemNum',
        width: 60,
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.itemCode`).d('物料编码'),
        dataIndex: 'itemCode',
        width: 100,
      },
      {
        title: intl.get(`ssrc.common.goodsDescription`).d('物品描述'),
        dataIndex: 'itemName',
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
        title: intl.get(`ssrc.common.goodsSorts`).d('物品分类'),
        dataIndex: 'itemCategoryName',
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
        title: intl.get(`ssrc.bidHall.model.bidHall.quantity`).d('需求数量'),
        dataIndex: 'bidQuantity',
        width: 100,
        render: numberSeparatorRender,
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.unit`).d('单位'),
        dataIndex: 'uomName',
        width: 100,
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.taxInclude`).d('是否含税'),
        dataIndex: 'taxIncludedFlag',
        width: 100,
        render: yesOrNoRender,
      },
      {
        title: <span>{intl.get(`ssrc.bidHall.model.bidHall.taxRate`).d('税率')}%</span>,
        dataIndex: 'taxRate',
        width: 100,
      },

      header.multiCurrencyFlag
        ? {
            title: intl.get(`ssrc.bidHall.model.bidHall.quotationCurCode`).d('报价币种'),
            dataIndex: 'currencyCode',
            width: 100,
          }
        : '',
      header.multiCurrencyFlag
        ? {
            title: intl.get(`ssrc.bidHall.model.bidHall.exchangeRate`).d('汇率'),
            dataIndex: 'exchangeRate',
            width: 100,
          }
        : '',

      {
        title: intl.get(`ssrc.bidHall.model.bidHall.taxIncludedPrice`).d('单价(含税)'),
        dataIndex: 'validQuotationPrice',
        width: 100,
        align: 'right',
        render: (val, record) => {
          return header.bidStatus === 'FINISHED' && isNumber(val) ? (
            <div>{`${numberSeparatorRender(val)}`}</div>
          ) : (
            numberSeparatorRender(record.validQuotationPrice)
          );
        },
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.netPrice`).d('单价(不含税)'),
        dataIndex: 'netPrice',
        align: 'right',
        width: 100,
        render: numberSeparatorRender,
      },
      header.multiCurrencyFlag
        ? {
            title: intl.get(`ssrc.bidHall.model.bidHall.baseQuotationPrice`).d('本币单价'),
            dataIndex: 'baseQuotationPrice',
            width: 100,
          }
        : '',
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.quotationDetail`).d('报价明细'),
        dataIndex: 'quotationDetailFlag',
        width: 100,
        render: (val, record) => (
          <QuotationDetail rowData={record} sourceFrom="BID" allowBuyerViewFlag />
        ),
      },
      {
        title: intl
          .get(`ssrc.inquiryHall.model.supplierBid.quotationStartValidTime`)
          .d('报价有效日期从'),
        dataIndex: 'quotationExpiryDateFrom',
        width: 150,
      },
      {
        title: intl
          .get(`ssrc.inquiryHall.model.supplierBid.quotationEndValidTime`)
          .d('报价有效日期至'),
        dataIndex: 'quotationExpiryDateTo',
        width: 150,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.specifications`).d('规格'),
        dataIndex: 'specifications',
        width: 100,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.model`).d('型号'),
        dataIndex: 'model',
        width: 100,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.paymentTerms`).d('付款方式'),
        dataIndex: 'paymentTypeName',
        width: 120,
      },
      {
        title: intl.get(`ssrc.common.model.common.termsOfPayment`).d('付款条款'),
        dataIndex: 'paymentTerm',
        width: 120,
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.availableQuantity`).d('可供数量'),
        dataIndex: 'validQuotationQuantity',
        width: 100,
        render: numberSeparatorRender,
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.wetherWinbid`).d('是否中标'),
        dataIndex: 'suggestedFlag',
        width: 100,
        render: yesOrNoRender,
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.allottedQuantity`).d('中标数量'),
        dataIndex: 'allottedQuantity',
        width: 120,
        render: numberSeparatorRender,
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.allottedPrice`).d('中标金额'),
        dataIndex: 'allottedPrice',
        width: 100,
        align: 'right',
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
        width: 110,
        render: (value) => value && moment(value).format(DEFAULT_DATE_FORMAT),
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.costPrice`).d('标底单价'),
        dataIndex: 'costPrice',
        width: 100,
        align: 'right',
        render: numberSeparatorRender,
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.validDeliveryCycle`).d('供货周期'),
        dataIndex: 'validDeliveryCycle',
        width: 100,
      },
      {
        title: intl.get(`ssrc.bidHall.model.inquiryHall.validPromisedDate`).d('承诺交货日期'),
        dataIndex: 'validPromisedDate',
        width: 110,
        render: (value) => value && moment(value).format(DEFAULT_DATE_FORMAT),
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
        title: intl.get('hzero.common.remark').d('备注'),
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
    ].filter(Boolean);
    const scrollX = sum(columns.map((n) => (isNumber(n.width) ? n.width : 100)));
    return (
      <React.Fragment>
        {customizeTable(
          {
            code: 'SSRC.BID_HALL_DETAIL.TAB_SUPPLIER_READ',
          },
          <EditTable
            bordered
            rowKey="quotationLineId"
            loading={
              supplierCompanyId &&
              loadingObj[supplierCompanyId] &&
              loadingObj[supplierCompanyId].fetchAloneSupplierItemLineLoading
            }
            columns={columns}
            scroll={{ x: scrollX }}
            dataSource={testData}
            pagination={pagination}
            onChange={(page) => onSearch(page, supplierCompanyId)}
          />
        )}
      </React.Fragment>
    );
  }
}
