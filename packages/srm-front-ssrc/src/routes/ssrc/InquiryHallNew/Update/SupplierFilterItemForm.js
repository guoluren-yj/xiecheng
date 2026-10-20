// 供应商分配物料弹窗form
import React, { Component } from 'react';
import { Table } from 'choerodon-ui/pro';

// import intl from 'utils/intl';

export default class SupplierFilterItemForm extends Component {
  getColumns() {
    const columns = [
      {
        name: 'rfxLineItemNum',
        width: 100,
      },
      {
        name: 'itemCode',
        width: 120,
      },
      {
        name: 'itemName',
      },
      {
        name: 'minLimitPrice',
        width: 100,
        editor: true,
      },
      {
        name: 'maxLimitPrice',
        width: 100,
        editor: true,
      },
      // {
      //   title: intl.get(`ssrc.inquiryHall.model.inquiryHall.whetherAllot`).d('是否分配'),
      //   name: 'inviteFlag',
      //   width: 100,
      //   editor: true,
      // },
    ];

    return columns;
  }

  render() {
    const { SupplierFilterItemDS, customizeTable, rfx = {} } = this.props;
    const { sourceKey } = rfx;
    return customizeTable(
      { code: `SSRC.${sourceKey}_HALL.NEW_EDIT.ITEM_SUP_ASSIGN` },
      <Table
        bordered
        autoHeight={{ type: 'maxHeight', diff: 40 }}
        showAllPageSelectionButton
        dataSet={SupplierFilterItemDS}
        columns={this.getColumns()}
        rowKey="rfxLineItemId"
      />
    );
  }
}
