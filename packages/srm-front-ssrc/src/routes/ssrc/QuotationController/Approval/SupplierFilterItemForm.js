// 供应商分配物料弹窗form
import React, { Component } from 'react';
import { Table } from 'choerodon-ui/pro';

import { noop } from 'lodash';

import intl from 'utils/intl';

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
      },
      {
        name: 'maxLimitPrice',
        width: 100,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.whetherAllot`).d('是否分配'),
        name: 'inviteFlag',
        width: 100,
      },
    ];

    return columns;
  }

  render() {
    const {
      SupplierFilterItemDS,
      customizeTable = noop,
      custKey = '',
      currentMode = '',
    } = this.props;

    return customizeTable(
      {
        code:
          currentMode === 'history'
            ? `SSRC.${custKey}QUOTATION_CONTROLLER_DETAIL.SUPPLIER_ALLOT_ITEM_HIS`
            : `SSRC.${custKey}QUOTATION_CONTROLLER_DETAIL.SUPPLIER_ALLOT_ITEM_READ`,
        dataSet: SupplierFilterItemDS,
      },
      <Table
        bordered
        dataSet={SupplierFilterItemDS}
        columns={this.getColumns()}
        rowKey="rfxLineItemId"
      />
    );
  }
}
