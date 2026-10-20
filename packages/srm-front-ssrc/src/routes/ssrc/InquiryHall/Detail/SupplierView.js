// 供应商分配物料弹窗form
import React, { Component } from 'react';
import { Table } from 'choerodon-ui/pro';
import { yesOrNoRender } from 'utils/renderer';

// import intl from 'utils/intl';

import { noop } from 'lodash';

class SupplierFilterItemForm extends Component {
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
        // title: intl.get(`ssrc.inquiryHall.model.inquiryHall.whetherAllot`).d('是否分配'),
        name: 'inviteFlag',
        width: 100,
        renderer: ({ value }) => yesOrNoRender(value),
      },
    ];

    return columns;
  }

  render() {
    const { SupplierFilterItemDS, customizeTable = noop, rfx = {} } = this.props;

    const { unitCodeSymbol } = rfx || {};

    return customizeTable(
      {
        code: `SSRC.${unitCodeSymbol}_DETAIL.SUPPLIER_ALLOT_ITEM`,
        dataSet: SupplierFilterItemDS,
      },
      <Table
        bordered
        dataSet={SupplierFilterItemDS}
        columns={this.getColumns()}
        rowKey="rfxLineItemId"
        style={{ maxHeight: 'calc(100vh - 260px)' }}
      />
    );
  }
}

export { SupplierFilterItemForm };
