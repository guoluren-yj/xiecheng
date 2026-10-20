/* eslint-disable no-unused-expressions */
import React from 'react';
import { Bind } from 'lodash-decorators';
import { Tabs } from 'choerodon-ui';

import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import { Header, Content } from 'components/Page';
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import { UpdateModalClass } from '@/routes/components/ModalProvider';
import { withRouter } from 'react-router-dom';

import SettleData from './SettleData';
import Invoice from './Invoice';
import InvoiceApply from './InvoiceApply';
import SupplierStatement from './SupplierStatement';

@withCustomize({
  unitCode: [
    'SMODR.ORDER.SETTLEMENT.STATEMENT.TABLE',
    'SMODR.ORDER.SETTLEMENT.INVOICE.TABLE',
    'SMODR.ORDER.SETTLEMENT.POOL.TABLE',
    'SMODR.ORDER.SETTLEMENT.INVOICE.REQUEST.TABLE',
  ],
})
@formatterCollections({
  code: ['smodr.settle', 'smodr.common'],
})
@withRouter
export default class OrderSettle extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      containerRef: null,
    };
  }

  componentDidMount() {
    this.setState({ containerRef: this.containerRef });
  }

  @Bind()
  handleExtensionInfo(key) {
    if (key === '1') {
      this.settleDS.query();
    } else if (key === '2') {
      this.stateDS?.query();
    } else if (key === '3') {
      this.applyDS?.query();
    } else if (key === '4') {
      this.invoiceDS?.query();
    }
  }

  @Bind()
  handleRef(ref) {
    this.settleDS = ref;
  }

  @Bind()
  handleStateRef(ref) {
    this.stateDS = ref;
  }

  @Bind()
  handleApplyRef(ref) {
    this.applyDS = ref;
  }

  @Bind()
  handleInvoiceRef(ref) {
    this.invoiceDS = ref;
  }

  render() {
    const { containerRef } = this.state;
    const { customizeTable } = this.props;
    return (
      <div
        ref={(ref) => {
          this.containerRef = ref;
        }}
        style={{ height: 'calc(100vh - 0.35rem - 0.48rem)' }}
      >
        <Header title={intl.get('smodr.settle.view.title').d('商城订单结算管理')} />
        <Content>
          <Tabs onChange={(key) => this.handleExtensionInfo(key)}>
            <Tabs.TabPane tab={intl.get('smodr.settle.view.settleData').d('结算数据池')} key="1">
              <UpdateModalClass location={this.props.location} containerRef={containerRef}>
                <SettleData onRef={this.handleRef} customizeTable={customizeTable} />
              </UpdateModalClass>
            </Tabs.TabPane>
            <Tabs.TabPane tab={intl.get('smodr.settle.view.supplierStatement').d('对账单')} key="2">
              <UpdateModalClass location={this.props.location} containerRef={containerRef}>
                <SupplierStatement onRef={this.handleStateRef} customizeTable={customizeTable} />
              </UpdateModalClass>
            </Tabs.TabPane>
            <Tabs.TabPane tab={intl.get('smodr.settle.view.invoiceApply').d('开票申请')} key="3">
              <UpdateModalClass location={this.props.location} containerRef={containerRef}>
                <InvoiceApply onRef={this.handleApplyRef} customizeTable={customizeTable} />
              </UpdateModalClass>
            </Tabs.TabPane>
            <Tabs.TabPane tab={intl.get('smodr.settle.view.invoice').d('发票')} key="4">
              <UpdateModalClass location={this.props.location} containerRef={containerRef}>
                <Invoice onRef={this.handleInvoiceRef} customizeTable={customizeTable} />
              </UpdateModalClass>
            </Tabs.TabPane>
          </Tabs>
        </Content>
      </div>
    );
  }
}
