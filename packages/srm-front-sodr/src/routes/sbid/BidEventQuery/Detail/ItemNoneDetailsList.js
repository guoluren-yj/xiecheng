import React, { Component } from 'react';
import { Popover } from 'hzero-ui';
import { isEmpty, isNumber, sum } from 'lodash';
import { dateRender } from 'utils/renderer';
import intl from 'utils/intl';
import EditTable from 'components/EditTable';

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
      dataSource = [],
      onSearch,
      bidLineItemId,
      loadingObj,
    } = this.props;
    const testData = dataSource[`${bidLineItemId}`] && dataSource[`${bidLineItemId}`].list;
    const pagination = dataSource[`${bidLineItemId}`] && dataSource[`${bidLineItemId}`].pagination;
    const columns = [
      {
        title: intl.get(`ssrc.bidEventQuery.model.bidHall.supplierCompanyNum`).d('供应商编码'),
        dataIndex: 'supplierCompanyNum',
        width: 100,
        render: value =>
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
        render: value =>
          value ? (
            <Popover placement="topLeft" content={value}>
              {value}
            </Popover>
          ) : (
            ''
          ),
      },
      {
        title: intl.get(`ssrc.bidEventQuery.model.bidHall.sumScore`).d('总分'),
        dataIndex: 'sumScore',
        width: 80,
      },
      {
        title: intl.get(`ssrc.bidEventQuery.model.bidHall.quotationTotalAmount`).d('报价总价'),
        dataIndex: 'totalAmount',
        width: 100,
      },
      {
        title: <span>{intl.get(`ssrc.bidEventQuery.model.bidHall.taxRate`).d('税率')}%</span>,
        dataIndex: 'taxRate',
        width: 100,
      },
      {
        title: intl.get(`ssrc.bidEventQuery.model.bidHall.validQuotationPrice`).d('报价单价'),
        dataIndex: 'validQuotationPrice',
        width: 100,
      },
      {
        title: intl.get(`ssrc.bidEventQuery.model.bidHall.validQuotationQuantity`).d('可供数量'),
        dataIndex: 'validQuotationQuantity',
        width: 100,
        render: value =>
          value ? (
            <Popover placement="topLeft" content={value}>
              {value}
            </Popover>
          ) : (
            ''
          ),
      },
      {
        title: intl.get(`ssrc.bidEventQuery.model.bidHall.allottedQuantity`).d('中标数量'),
        dataIndex: 'allottedQuantity',
        width: 100,
      },
      {
        title: intl.get(`ssrc.bidEventQuery.model.bidHall.allottedPrice`).d('中标金额'),
        dataIndex: 'allottedPrice',
        width: 100,
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
        render: val => dateRender(val),
      },
      {
        title: intl.get(`ssrc.bidEventQuery.model.bidHall.costPrice`).d('标底单价'),
        dataIndex: 'costPrice',
        width: 120,
      },
      {
        title: intl.get(`ssrc.bidEventQuery.model.bidHall.deliveryPeriod`).d('供货周期'),
        dataIndex: 'validDeliveryCycle',
        width: 100,
      },
      {
        title: intl.get(`ssrc.bidEventQuery.model.bidHall.validPromisedDate`).d('承诺交货日期'),
        dataIndex: 'validPromisedDate',
        width: 120,
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
    ];
    const scrollX = sum(columns.map(n => (isNumber(n.width) ? n.width : 0)));
    return (
      <React.Fragment>
        <EditTable
          bordered
          onDataChange={this.hasChangeData}
          rowKey="quotationLineId"
          columns={columns}
          scroll={{ x: scrollX }}
          loading={loadingObj[bidLineItemId] && loadingObj[bidLineItemId].fetchAloneItemLineLoading}
          dataSource={testData}
          pagination={pagination}
          onChange={page => onSearch(page, bidLineItemId)}
        />
      </React.Fragment>
    );
  }
}
