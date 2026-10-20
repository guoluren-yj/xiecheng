import React, { PureComponent } from 'react';
import { Table } from 'hzero-ui';
import { Link } from 'dva/router';
import { getActiveTabKey, updateTab } from 'utils/menuTab';

import intl from 'utils/intl';
import { tableScrollWidth } from 'utils/utils';
import { dateTimeRender } from 'utils/renderer';
import formatterCollections from 'utils/intl/formatterCollections';

const modelPrompt = 'sodr.sendOrder.model.common';

@formatterCollections({
  code: [
    'hzero.common',
    'sodr.common',
    'sodr.sendOrder',
    'entity.order',
    'entity.business',
    'entity.organization',
  ],
})
class PurchaseOrderPanel extends PureComponent {

  goPo = (record) => {
    const { history, prefixToPath = '', isSupplier, backPath } = this.props;
    updateTab({
      key: getActiveTabKey(),
      state: { backPath },
    });
    history.push({
      pathname: `/sqam${prefixToPath}/${isSupplier ? 'receivedOrder' : 'sendOrder'}/detail/${record.poHeaderId}`,
      state: {
        backPath,
      },
    });
  }

  render() {
    const {
      loading = false,
      dataSource = [],
      rowSelection = null,
      prefixToPath = '',
      backPath,
      isSupplier = false,
      history,
    } = this.props;
    const columns = [
      {
        title: intl.get(`${modelPrompt}.orderNum`).d('订单号'),
        dataIndex: 'displayPoNum',
        width: 180,
        fixed: 'left',
        render: (val, record) => {
          if (history) {
            return (
              <a onClick={() => {this.goPo(record);}}>{val}</a>
            );
          } else {
            return (
              <Link
                to={{
                  pathname: `/sqam${prefixToPath}/${
                    isSupplier ? 'receivedOrder' : 'sendOrder'
                  }/detail/${record.poHeaderId}`,
                  state: { backPath },
                }}
              >
                {val}
              </Link>
            );
          }
        },
      },
      {
        title: intl.get(`${modelPrompt}.orderStatus`).d('订单状态'),
        dataIndex: 'statusCodeMeaning',
        width: 120,
      },
      {
        title: intl.get(`entity.order.type`).d('订单类型'),
        dataIndex: 'orderTypeName',
        width: 150,
      },
      {
        title: intl.get(`${modelPrompt}.purchaseAgent`).d('采购员'),
        dataIndex: 'purchaseAgentName',
        width: 120,
      },
      {
        title: intl.get(`entity.business.tag`).d('业务实体'),
        dataIndex: 'ouName',
        width: 150,
      },
      {
        title: intl.get(`entity.organization.class.purchase`).d('采购组织'),
        dataIndex: 'organizationName',
        width: 150,
      },
      {
        title: intl.get(`${modelPrompt}.srmPoNum`).d('SRM订单号'),
        dataIndex: 'poNum',
        width: 150,
      },
      {
        title: intl.get('sodr.common.model.common.contractNumber').d('协议编号'),
        dataIndex: 'pohPcNum',
        width: 120,
      },
      {
        title: intl.get(`${modelPrompt}.dataSourceCode`).d('来源系统'),
        dataIndex: 'sourceCode',
        width: 120,
      },
      {
        title: intl.get(`hzero.common.date.release`).d('发布日期'),
        dataIndex: 'releasedDate',
        width: 150,
        render: dateTimeRender,
      },
    ];
    return (
      <Table
        bordered
        rowKey="poHeaderId"
        loading={loading}
        columns={columns}
        pagination={false}
        dataSource={dataSource}
        rowSelection={rowSelection}
        scroll={{ x: tableScrollWidth(columns) }}
      />
    );
  }
}
export default PurchaseOrderPanel;
