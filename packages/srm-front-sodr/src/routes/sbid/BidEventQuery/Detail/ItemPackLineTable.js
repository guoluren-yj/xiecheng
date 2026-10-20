import React, { Component } from 'react';
import { Popover, Table } from 'hzero-ui';
import { isNumber, sum } from 'lodash';
import moment from 'moment';
import { yesOrNoRender } from 'utils/renderer';
import { DEFAULT_DATE_FORMAT } from 'utils/constants';
import intl from 'utils/intl';

export default class ItemPackLineTable extends Component {
  /**
   * render
   * @returns React.element
   */
  render() {
    const {
      item,
      onSearch,
      loadingObj = {},
      calibQuotationList = [],
      quotationHeaderId,
      sectionId,
    } = this.props;
    const testData =
      calibQuotationList[`${sectionId}#${quotationHeaderId}`] &&
      calibQuotationList[`${sectionId}#${quotationHeaderId}`].list;
    const pagination =
      calibQuotationList[`${sectionId}#${quotationHeaderId}`] &&
      calibQuotationList[`${sectionId}#${quotationHeaderId}`].pagination;
    const columns = [
      {
        title: intl.get(`ssrc.bidEventQuery.model.supplierQuotation.lineNo.`).d('行号'),
        dataIndex: 'bidLineItemNum',
        width: 100,
      },
      {
        title: intl.get(`ssrc.bidEventQuery.model.supplierQuotation.itemCode`).d('物品编码'),
        dataIndex: 'itemCode',
        width: 200,
      },
      {
        title: intl.get(`ssrc.bidEventQuery.model.supplierQuotation.itemName`).d('物品描述'),
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
        title: intl.get(`ssrc.bidEventQuery.model.supplierQuotation.itemCategory`).d('物品分类'),
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
        title: intl.get(`ssrc.bidEventQuery.model.supplierQuotation.quantity`).d('需求数量'),
        dataIndex: 'bidQuantity',
        width: 100,
      },
      {
        title: intl.get(`ssrc.bidEventQuery.model.supplierQuotation.unit`).d('单位'),
        dataIndex: 'uomName',
        width: 80,
      },
      {
        title: intl.get(`ssrc.bidEventQuery.model.bidHall.taxIncludedFlag`).d('是否含税'),
        dataIndex: 'taxIncludedFlag',
        width: 100,
        render: yesOrNoRender,
      },
      {
        title: intl.get(`ssrc.bidEventQuery.model.bidHall.taxRate(%)`).d('税率（%）'),
        dataIndex: 'taxRate',
        width: 100,
      },
      {
        title: intl.get(`ssrc.bidEventQuery.model.supplierQuotation.inventoryOrg`).d('报价单价'),
        dataIndex: 'validQuotationPrice',
        width: 100,
        align: 'right',
        render: (val) => {
          return val > 0 ? <div>{`${val.toFixed(2)}`}</div> : null;
        },
      },
      {
        title: intl.get(`ssrc.bidEventQuery.model.supplierQuotation.quantityAvai`).d('可供数量'),
        dataIndex: 'validQuotationQuantity',
        width: 100,
      },
      {
        title: intl.get(`ssrc.bidEventQuery.model.bidHall.suggestedFlag`).d('是否中标'),
        dataIndex: 'suggestedFlag',
        width: 100,
        render: yesOrNoRender,
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
        title: intl.get(`ssrc.bidEventQuery.model.supplierQuotation.demandDate`).d('需求日期'),
        dataIndex: 'demandDate',
        width: 100,
        render: (val) => val && moment(val).format(DEFAULT_DATE_FORMAT),
      },
      {
        title: intl.get(`ssrc.bidEventQuery.model.bidHall.costPrice`).d('标底单价'),
        dataIndex: 'costPrice',
        width: 120,
      },
      {
        title: intl.get(`ssrc.bidEventQuery.model.bidHall.validDeliveryCycle`).d('供货周期'),
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
    const scrollX = sum(columns.map((n) => (isNumber(n.width) ? n.width : 0)));
    return (
      <React.Fragment>
        <Table
          bordered
          rowKey="quotationLineId"
          columns={columns}
          scroll={{ x: scrollX }}
          dataSource={testData}
          pagination={pagination}
          loading={
            loadingObj[quotationHeaderId] && loadingObj[quotationHeaderId].queryCalibrationLoading
          }
          onChange={(page) => onSearch(page, quotationHeaderId, item)}
        />
      </React.Fragment>
    );
  }
}
