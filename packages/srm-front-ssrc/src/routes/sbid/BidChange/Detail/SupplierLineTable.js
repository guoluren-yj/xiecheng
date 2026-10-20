import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { isNumber, sum } from 'lodash';

import intl from 'utils/intl';
import EditTable from 'components/EditTable';
import CPopover from '@/routes/sbid/components/CPopover';
import { phoneRender } from '@/utils/renderer';

class SupplierLineTable extends Component {
  render() {
    const { loading, dataSource = [], onSearch, supplierCompanyId } = this.props;
    const pagination =
      dataSource[`${supplierCompanyId}`] && dataSource[`${supplierCompanyId}`].pagination;

    const columns = [
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.supplierCode`).d('供应商编码'),
        dataIndex: 'supplierCompanyNum',
        width: 150,
        render: (val) => <CPopover content={val}>{val}</CPopover>,
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.supplierName`).d('供应商名称'),
        dataIndex: 'supplierCompanyName',
        width: 200,
        render: (val) => <CPopover content={val}>{val}</CPopover>,
      },
      {
        title: intl.get(`ssrc.bidHall.model.queryRfq.lifeCycle`).d('生命周期阶段'),
        dataIndex: 'stageDescription',
        width: 150,
      },
      {
        title: intl.get(`ssrc.bidHall.model.queryRfq.contactName`).d('联系人'),
        dataIndex: 'contactName',
        width: 100,
        render: (val) => <CPopover content={val}>{val}</CPopover>,
      },
      {
        title: intl.get(`hzero.common.phone`).d('电话'),
        dataIndex: 'contactMobilephone',
        render: (_, record) =>
          phoneRender(record.internationalTelCodeMeaning, record.contactMobilephone),
      },
      {
        title: intl.get(`hzero.common.email`).d('邮箱'),
        dataIndex: 'contactMail',
        width: 250,
        render: (val) => <CPopover content={val}>{val}</CPopover>,
      },
    ];

    const scrollX = sum(columns.map((n) => (isNumber(n.width) ? n.width : 0)));

    return (
      <React.Fragment>
        <EditTable
          bordered
          rowKey="supplierCompanyId"
          loading={loading}
          columns={columns}
          scroll={{ x: scrollX }}
          dataSource={dataSource}
          pagination={pagination}
          onChange={(page) => onSearch(page, supplierCompanyId)}
        />
      </React.Fragment>
    );
  }
}

export default withRouter(SupplierLineTable);
