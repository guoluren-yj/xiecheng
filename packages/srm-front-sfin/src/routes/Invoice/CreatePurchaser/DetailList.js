/**
 *  @description:非寄销发票维护
 *  @Author: jiwei.liu01@hand-china.com  *
 *  @Date: 2021-06-07 20:09:04  *
 *  @Last Modified time: 2021-06-07 20:09:04  *
 *  @copyright : { Copyright (c) 2021, Hand}  */

import React, { Component } from 'react';
import { connect } from 'dva';
import { Tabs } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { isArray } from 'lodash';

import SubPage from './DetailListItem';

const { TabPane } = Tabs;

@connect(({ invoice }) => ({
  invoice,
}))
class BillCreateList extends Component {
  subPage = {};

  constructor(props) {
    super(props);
    const {
      invoice: { invoiceList = [] },
      history,
    } = props;
    if (invoiceList.length === 0) {
      history.push('/sfin/invoice-create-purchaser/list');
    }
    const defaultActiveKey = invoiceList[0] ? invoiceList[0].invoiceHeaderId : '';
    this.state = {
      defaultActiveKey,
    };
  }

  @Bind()
  updateActiveKey(list) {
    const {
      invoice: { invoiceList = [] },
    } = this.props;
    const subPageList = isArray(list) ? list : invoiceList;
    const defaultActiveKey = subPageList[0] ? subPageList[0].invoiceHeaderId : '';
    this.setState({
      defaultActiveKey,
    });
    if (this.subPage[defaultActiveKey]) {
      this.subPage[defaultActiveKey].init();
    }
  }

  @Bind()
  onTabChage(key) {
    this.setState({
      defaultActiveKey: key,
    });
    if (this.subPage[key]) {
      this.subPage[key].init();
    }
  }

  render() {
    const {
      invoice: { invoiceList = [] },
    } = this.props;
    const { defaultActiveKey } = this.state;
    return (
      <div>
        <Tabs activeKey={`${defaultActiveKey}`} tabPosition="left" onChange={this.onTabChage}>
          {invoiceList.map((item) => {
            const { history } = this.props;
            const { invoiceNum = '', invoiceHeaderId = '' } = item;

            const subPageProps = {
              invoiceHeaderId,
              defaultActiveKey,
              status: 'create',
              flag: true,
              history,
              parentPage: this,
              onRef: (node) => {
                this.subPage[defaultActiveKey] = node;
              },
            };
            if (defaultActiveKey !== invoiceHeaderId) {
              return (
                <TabPane tab={invoiceNum} key={invoiceHeaderId}>
                  {/* <SubPage {...subPageProps} /> */}
                </TabPane>
              );
            }
            return (
              <TabPane tab={invoiceNum} key={invoiceHeaderId}>
                <SubPage {...subPageProps} />
              </TabPane>
            );
          })}
        </Tabs>
      </div>
    );
  }
}

export default BillCreateList;
