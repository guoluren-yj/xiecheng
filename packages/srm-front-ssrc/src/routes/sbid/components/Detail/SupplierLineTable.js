import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { isNumber, sum } from 'lodash';

import intl from 'utils/intl';
import EditTable from 'components/EditTable';
import CPopover from '@/routes/sbid/components/CPopover';
import { phoneRender } from '@/utils/renderer';

class SupplierLineTable extends Component {
  render() {
    const {
      loading,
      dataSource = [],
      onSearch,
      // supplierCompanyId,
      supplierLinePagination,
      customizeTable = () => {},
    } = this.props;

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
        width: 130,
      },
      {
        title: intl.get(`ssrc.bidHall.model.queryRfq.contactName`).d('联系人'),
        dataIndex: 'contactName',
        width: 150,
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
        width: 200,
        render: (val) => <CPopover content={val}>{val}</CPopover>,
      },
    ];

    const scrollX = sum(columns.map((n) => (isNumber(n.width) ? n.width : 0)));

    return (
      <React.Fragment>
        {customizeTable(
          { code: 'SSRC.BID_HALL_DETAIL.PREPARE_SUPPLIER', dataSource },
          <EditTable
            bordered
            rowKey="supplierCompanyId"
            loading={loading}
            columns={columns}
            scroll={{ x: scrollX }}
            dataSource={dataSource}
            pagination={supplierLinePagination}
            onChange={(page) => onSearch(page)}
          />
        )}
      </React.Fragment>
    );
  }
}

export default withRouter(SupplierLineTable);
