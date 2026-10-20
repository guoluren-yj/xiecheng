// 供应商分配物料弹窗form
import React, { Component } from 'react';
import { Table } from 'choerodon-ui/pro';

import { noop } from 'lodash';

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
    const { SupplierFilterItemDS, customizeTable = noop, custKey = '', supplierRecord } = this.props;
    // 当 showItemAssignFlag 为 1 不展示跨页勾选
    const showAllPageFlag = supplierRecord?.get('showItemAssignFlag') !== 1;
    return customizeTable(
      {
        code: `SSRC.${custKey}QUOTATION_CONTROLLER_DETAIL.SUPPLIER_ALLOT_ITEM`,
        dataSet: SupplierFilterItemDS,
      },
      <Table
        bordered
        autoHeight={{ type: 'maxHeight', diff: 40 }}
        showAllPageSelectionButton={showAllPageFlag}
        dataSet={SupplierFilterItemDS}
        columns={this.getColumns()}
        rowKey="rfxLineItemId"
      />
    );
  }
}
