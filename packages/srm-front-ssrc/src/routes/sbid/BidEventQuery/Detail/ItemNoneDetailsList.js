import React, { Component } from 'react';
import { Popover } from 'hzero-ui';
import { isEmpty, isNumber, sum } from 'lodash';
import moment from 'moment';
import { dateRender } from 'utils/renderer';
import intl from 'utils/intl';
import { DEFAULT_DATE_FORMAT } from 'utils/constants';
import EditTable from 'components/EditTable';
import { numberSeparatorRender } from '@/utils/renderer';
import QuotationDetail from '@/routes/components/QuotationDetailNew/Detail';

export default class ItemDimension extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  // 检查表格内容值发生变化，更新redux
  hasChangeData = (record, changeValues) => {
    const { dispatch, itemContentChange } = this.props;
    if (!isEmpty(changeValues) && record.bidLineItemId) {
      dispatch({
        type: 'bidEventQuery/updateState',
        payload: {
          itemLineChange: true,
          itemContentChange: {
            ...itemContentChange,
            [record.bidLineItemId]: true,
          },
        },
      });
    }
  };

  /**
   * render
   * @returns React.element
   */
  render() {
    const {
      // loading,
      dataSource = {},
      onSearch,
      bidLineItemId,
      loadingObj,
      customizeTable,
      header,
    } = this.props;
    const testData = dataSource[`${bidLineItemId}`] && dataSource[`${bidLineItemId}`].list;
    const pagination = dataSource[`${bidLineItemId}`] && dataSource[`${bidLineItemId}`].pagination;
    const columns = [
      {
        title: intl.get(`ssrc.bidEventQuery.model.bidHall.supplierCompanyNum`).d('供应商编码'),
        dataIndex: 'supplierCompanyNum',
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
        title: intl.get(`ssrc.bidEventQuery.model.bidHall.supplierCompanyName`).d('供应商名称'),
        dataIndex: 'supplierCompanyName',
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
        title: intl.get(`ssrc.bidEventQuery.model.bidEventQuery.candidateSuggestion`).d('推荐意见'),
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
        title: intl.get(`ssrc.bidEventQuery.model.bidHall.sumScore`).d('总分'),
        dataIndex: 'sumScore',
        width: 80,
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.lineAmount`).d('行金额'),
        dataIndex: 'totalAmountMeaning',
        width: 100,
        render: numberSeparatorRender,
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.netAmount`).d('行金额(不含税)'),
        dataIndex: 'netAmount',
        width: 120,
        render: numberSeparatorRender,
      },
      {
        title: <span>{intl.get(`ssrc.bidEventQuery.model.bidHall.taxRate`).d('税率')}%</span>,
        dataIndex: 'taxRate',
        width: 100,
      },
      {
        title: intl.get(`ssrc.bidEventQuery.model.bidHall.quotationCurCode`).d('报价币种'),
        dataIndex: 'currencyCode',
        width: 100,
      },
      {
        title: intl.get(`ssrc.bidEventQuery.model.bidHall.taxIncludedPrice`).d('单价(含税)'),
        dataIndex: 'validQuotationPrice',
        width: 100,
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
        title: intl.get(`ssrc.bidEventQuery.model.bidHall.unitPriceIncludedTax`).d('本币含税单价'),
        dataIndex: 'baseQuotationPrice',
        width: 100,
        render: numberSeparatorRender,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.quotationDetail`).d('报价明细'),
        dataIndex: 'quotationDetailFlag',
        width: 100,
        render: (val, record) => (
          <QuotationDetail rowData={record} sourceFrom="BID" allowBuyerViewFlag />
        ),
      },
      {
        title: intl.get(`ssrc.bidEventQuery.model.bidHall.specifications`).d('规格'),
        dataIndex: 'specifications',
        width: 100,
      },
      {
        title: intl.get(`ssrc.bidEventQuery.model.bidHall.model`).d('型号'),
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
        title: intl.get(`ssrc.bidEventQuery.model.bidHall.validQuotationQuantity`).d('可供数量'),
        dataIndex: 'validQuotationQuantity',
        width: 100,
        render: (value) =>
          value ? (
            <Popover placement="topLeft" content={value}>
              {numberSeparatorRender(value)}
            </Popover>
          ) : (
            ''
          ),
      },
      {
        title: intl.get(`ssrc.bidEventQuery.model.bidHall.allottedQuantity`).d('中标数量'),
        dataIndex: 'allottedQuantity',
        width: 100,
        render: numberSeparatorRender,
      },
      {
        title: intl.get(`ssrc.bidEventQuery.model.bidHall.allottedPrice`).d('中标金额'),
        dataIndex: 'allottedPrice',
        width: 100,
        render: numberSeparatorRender,
      },
      {
        title: intl.get(`ssrc.bidEventQuery.model.bidHall.allottedRatio`).d('中标比例'),
        dataIndex: 'allottedRatio',
        width: 100,
      },
      {
        title: intl.get(`ssrc.bidEventQuery.model.bidHall.demandDate`).d('需求日期'),
        dataIndex: 'demandDate',
        width: 100,
        render: (val) => dateRender(val),
      },
      {
        title: intl.get(`ssrc.bidEventQuery.model.bidHall.costPrice`).d('标底单价'),
        dataIndex: 'costPrice',
        width: 120,
        render: numberSeparatorRender,
      },
      {
        title: intl.get(`ssrc.bidEventQuery.model.bidHall.deliveryDay`).d('供货周期(天)'),
        dataIndex: 'validDeliveryCycle',
        width: 120,
      },
      {
        title: intl.get(`ssrc.bidEventQuery.model.bidHall.validPromisedDate`).d('承诺交货日期'),
        dataIndex: 'validPromisedDate',
        width: 120,
        render: (val) => val && moment(val).format(DEFAULT_DATE_FORMAT),
      },
      {
        title: intl.get(`ssrc.bidEventQuery.model.bidHall.validQuotationRemark`).d('投标备注'),
        dataIndex: 'validQuotationRemark',
        width: 100,
      },
      {
        title: intl.get(`ssrc.bidEventQuery.model.bidHall.businessUnit`).d('业务实体'),
        dataIndex: 'ouName',
        width: 150,
      },
      {
        title: intl.get(`ssrc.bidEventQuery.model.bidHall.inventoryOrg`).d('库存组织'),
        dataIndex: 'invOrganizationName',
        width: 150,
      },
    ].filter(Boolean);
    const scrollX = sum(columns.map((n) => (isNumber(n.width) ? n.width : 0)));
    return (
      <React.Fragment>
        {customizeTable(
          {
            code: 'SSRC.BID_EVENT_DETAIL.TAB_ITEM', // 单元编码，必传
          },
          <EditTable
            bordered
            onDataChange={this.hasChangeData}
            rowKey="quotationLineId"
            columns={columns}
            scroll={{ x: scrollX }}
            loading={
              bidLineItemId &&
              loadingObj[bidLineItemId] &&
              loadingObj[bidLineItemId].fetchAloneItemLineLoading
            }
            dataSource={testData}
            pagination={pagination}
            onChange={(page) => onSearch(page, bidLineItemId)}
          />
        )}
      </React.Fragment>
    );
  }
}
