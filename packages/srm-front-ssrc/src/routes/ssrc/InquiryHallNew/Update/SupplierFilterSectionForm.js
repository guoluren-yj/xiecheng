// 供应商分配物料弹窗form
import React, { Component } from 'react';
import { Table } from 'choerodon-ui/pro';

export default class SupplierFilterSectionForm extends Component {
  getColumns() {
    const columns = [
      {
        name: 'sectionCode',
        width: 120,
      },
      {
        name: 'sectionName',
      },
      {
        name: 'sectionRemark',
        width: 100,
        editor: true,
      },
      {
        name: 'inviteFlag',
        width: 100,
        editor: true,
      },
    ];

    return columns;
  }

  render() {
    const { SupplierFilterSectionDS, customizeTable, rfx = {} } = this.props;
    const { sourceKey } = rfx;
    return customizeTable(
      { code: `SSRC.${sourceKey}_HALL.NEW_EDIT.SECTION.LINE` },
      <Table
        bordered
        dataSet={SupplierFilterSectionDS}
        columns={this.getColumns()}
        rowKey="rfxLineItemId"
        pageSize="20"
      />
    );
  }
}
