import React from 'react';
import { connect } from 'dva';
import { Bind } from 'lodash-decorators';
import { Drawer, Tabs, Table } from 'hzero-ui';

import intl from 'utils/intl';

const { TabPane } = Tabs;

@connect(({ relevanceDrawer, loading }) => ({
  relevanceDrawer,
  fetchLoading: loading.effects['relevanceDrawer/fetchData'],
}))
export default class RelevanceDrawer extends React.Component {
  constructor(props) {
    super(props);
    props.onRef(this);
    this.state = {
      visible: false,
    };
  }

  @Bind()
  fetchInitData() {
    const { dispatch, orderEntryId } = this.props;
    if (orderEntryId) {
      dispatch({
        type: 'relevanceDrawer/fetchData',
        payload: orderEntryId,
      });
    }
  }

  @Bind()
  openDraw() {
    const { orderEntryId } = this.props;
    this.setState({ visible: true }, orderEntryId ? () => this.fetchInitData() : () => {});
  }

  render() {
    const { relevanceDrawer = {}, fetchLoading } = this.props;
    const {
      orderList = [],
      deliveryList = [],
      receiveList = [],
      reconciliationList = [],
      returnEntryList = [],
    } = relevanceDrawer;
    const orderColumns = [
      {
        title: intl.get('smodr.common.model.reqNum').d('采购申请编号'),
        dataIndex: 'reqNum',
        width: 150,
      },
      {
        title: intl.get('smodr.common.model.srmOrderCode').d('订单编号'),
        dataIndex: 'srmOrderCode',
        width: 150,
      },
      {
        title: intl.get('smodr.common.model.fatherOrderCode').d('电商父订单编码'),
        dataIndex: 'cecOrderCode',
        width: 150,
      },
    ];
    const deliveryColumns = [
      {
        title: intl.get('smodr.common.model.srmConsignmentCode').d('配送单号'),
        dataIndex: 'srmConsignmentCode',
        width: 150,
      },
      // {
      //   title: intl.get('smodr.common.model.cecConsignmentLineNum').d('行号'),

      //   dataIndex: 'cecConsignmentLineNum',
      //   width: 150,
      // },
      {
        title: intl.get('smodr.common.model.quantityNum').d('数量'),
        dataIndex: 'quantityMeaning',
        width: 150,
      },
      {
        title: intl.get('smodr.common.model.logisticCompanyMeaning').d('物流公司'),
        dataIndex: 'logisticCompanyMeaning',
        width: 150,
      },
      {
        title: intl.get('smodr.common.model.logisticOrderNum').d('物流单号'),
        dataIndex: 'logisticOrderNum',
        width: 150,
      },
    ];
    const receiveColumns = [
      {
        title: intl.get('smodr.common.model.receiptTypeMeaning').d('事务类型'),
        dataIndex: 'receiptTypeMeaning',
        width: 150,
      },
      {
        title: intl.get('smodr.common.model.cecReceiptCode').d('事务编号'),
        dataIndex: 'cecReceiptCode',
        width: 150,
      },
      // {
      //   title: intl.get('smodr.common.model.cecReceiptLineNum').d('行号'),
      //   dataIndex: 'cecReceiptLineNum',
      //   width: 150,
      // },
      {
        title: intl.get('smodr.common.model.quantityNum').d('数量'),
        dataIndex: 'quantityMeaning',
        width: 150,
      },
      {
        title: intl.get('smodr.common.model.receiptTime').d('事务日期'),
        dataIndex: 'receiptedTime',
        width: 150,
      },
    ];
    const reconciliationColumns = [
      {
        title: intl.get('smodr.common.model.srmStatementsCode').d('对账单号'),
        dataIndex: 'srmStatementsCode',
        width: 150,
      },
      // {
      //   title: intl.get('smodr.common.model.order').d('行号'),
      //   dataIndex: 'order',
      //   width: 150,
      // },
      {
        title: intl.get('smodr.common.model.quantityNum').d('数量'),
        dataIndex: 'quantityMeaning',
        width: 150,
      },
      {
        title: intl.get('smodr.common.model.statementsTime').d('确认日期'),
        dataIndex: 'statementsTime',
        width: 150,
      },
    ];
    const returnColumns = [
      {
        title: intl.get('smodr.common.model.returnNum').d('退货事务编码'),
        dataIndex: 'cecReceiptCode',
        width: 150,
      },
      {
        title: intl.get('smodr.common.model.quantityNum').d('数量'),
        dataIndex: 'quantityMeaning',
        width: 150,
      },
      {
        title: intl.get('smodr.common.model.receiptTime').d('事务日期'),
        dataIndex: 'receiptedTime',
        width: 150,
      },
    ];
    return (
      <Drawer
        closable
        destroyOnClose
        maskClosable="true"
        visible={this.state.visible}
        onClose={() => this.setState({ visible: false })}
        width={800}
      >
        <Tabs>
          <TabPane tab={intl.get('smodr.common.view.request').d('申请/订单')} key="1">
            <Table
              bordered
              columns={orderColumns}
              dataSource={orderList || []}
              pagination={false}
              loading={fetchLoading}
            />
          </TabPane>
          <TabPane tab={intl.get('smodr.common.view.omsDelivery').d('配送')} key="2">
            <Table
              bordered
              columns={deliveryColumns}
              dataSource={deliveryList || []}
              pagination={false}
            />
          </TabPane>
          <TabPane tab={intl.get('smodr.common.view.omsReceive').d('接收')} key="3">
            <Table
              bordered
              columns={receiveColumns}
              dataSource={receiveList || []}
              pagination={false}
            />
          </TabPane>
          <TabPane tab={intl.get('smodr.common.view.omsReturn').d('退货')} key="4">
            <Table
              bordered
              columns={returnColumns}
              dataSource={returnEntryList || []}
              pagination={false}
            />
          </TabPane>
          <TabPane tab={intl.get('smodr.common.view.omsRecon').d('对账')} key="5">
            <Table
              bordered
              columns={reconciliationColumns}
              dataSource={reconciliationList || []}
              pagination={false}
            />
          </TabPane>
        </Tabs>
      </Drawer>
    );
  }
}
