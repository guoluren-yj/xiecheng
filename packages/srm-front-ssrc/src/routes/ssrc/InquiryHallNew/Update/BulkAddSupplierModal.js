/*
 * @Description:
 * @Autor: hongzhu.chen@going-link.com
 * @Date: 2021-06-30 23:24:10
 * @LastEditTime: 2021-08-05 14:25:21
 */
// 批量添加供应商modal

import React, { Component } from 'react';
import { Table, Lov, Tooltip } from 'choerodon-ui/pro';

import intl from 'utils/intl';

export default class BulkAddSupplier extends Component {
  tableFields() {
    const columns = [
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.supplierCode`).d('供应商编码'),
        name: 'supplierCompanyNum',
        width: 120,
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.supplierName`).d('供应商名称'),
        name: 'supplierCompanyName',
        width: 200,
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.supplierCategory`).d('供应商分类'),
        name: 'supplierCategoryDescription',
        width: 200,
      },
      // {
      //   title: intl.get(`ssrc.inquiryHall.model.inquiryHall.certified`).d('通过启信宝认证'),
      //   dataIndex: 'passedQiXinBao',
      //   width: 100,
      // },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.lifeCycle`).d('生命周期阶段'),
        name: 'stageDescription',
        width: 100,
      },
    ];

    return columns;
  }

  // 批量添加供应商 物料类别 lov tooltip
  renderSupplierLovCategoryTooltip(value) {
    const { categoryName = null } = value || {};
    return <Tooltip title={categoryName}>{categoryName}</Tooltip>;
  }

  // 批量添加供应商 物料名称 lov tooltip
  renderSupplierLovNameTooltip(value) {
    const { itemName = null } = value || {};
    return <Tooltip title={itemName}>{itemName}</Tooltip>;
  }

  render() {
    const { bulkAddSupplierDS = {}, customizeTable } = this.props;

    return (
      <React.Fragment>
        {customizeTable(
          {
            code: 'SSRC.QUOTATION_CONTROLLER_DETAIL.BULK_ADD_SUPPLIER',
            filterCode: 'SSRC.QUOTATION_CONTROLLER_DETAIL.BULK_ADD_SUPPLIER_QUERY',
          },
          <Table
            queryFields={{
              itemCategoryIds: (
                <Lov
                  name="itemCategoryIds"
                  renderer={({ value }) => this.renderSupplierLovCategoryTooltip(value)}
                />
              ),
              queryItemIds: (
                <Lov
                  name="queryItemIds"
                  renderer={({ value }) => this.renderSupplierLovNameTooltip(value)}
                />
              ),
            }}
            bordered
            dataSet={bulkAddSupplierDS}
            rowKey="companyId"
            queryFieldsLimit={2}
            columns={this.tableFields()}
          />
        )}
      </React.Fragment>
    );
  }
}
