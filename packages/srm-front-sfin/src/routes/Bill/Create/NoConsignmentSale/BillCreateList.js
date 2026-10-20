/*
 * @Description:创建开票申请子页面
 * @Date: 2020-06-16 15:55:36
 * @author: zhangyongxuan <yongxuan.zhang@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2020, Hand
 */

import React, { Component } from 'react';
import { connect } from 'dva';
import { Tabs } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { isArray } from 'lodash';

import SubPage from './BillCreateListItem';

const { TabPane } = Tabs;

@connect(({ bill }) => ({
  bill,
}))
class BillCreateList extends Component {
  subPage = {};

  constructor(props) {
    super(props);
    const {
      bill: { billList = [] },
      history,
    } = props;
    if (billList.length === 0) {
      history.push('/sfin/bill-create/list');
    }

    const defaultActiveKey = billList[0] ? billList[0].billHeaderId : '';
    this.state = {
      defaultActiveKey,
    };
  }

  @Bind()
  getSubPage(billHeaderId, subPage) {
    this.subPage[billHeaderId] = subPage;
  }

  @Bind()
  updateActiveKey(list) {
    const {
      bill: { billList = [] },
    } = this.props;
    const subPageList = isArray(list) ? list : billList;
    const defaultActiveKey = subPageList[0] ? subPageList[0].billHeaderId : '';

    this.setState(
      {
        defaultActiveKey,
      },
      () => {
        if (this.subPage[defaultActiveKey]) {
          this.subPage[defaultActiveKey].init();
        }
      }
    );
  }

  @Bind()
  onTabChage(key) {
    const { dispatch } = this.props;
    dispatch({
      type: 'bill/updateState',
      payload: {
        headerInfo: {},
        rowDataSource: {},
        rowPagination: {},
        detailDataSource: {},
        detailPagination: {},
      },
    });
    if (this.subPage[key]) {
      this.subPage[key].init();
    }
  }

  render() {
    const {
      bill: { billList = [] },
    } = this.props;
    const { defaultActiveKey } = this.state;
    return (
      <div>
        <Tabs
          defaultActiveKey={`${defaultActiveKey}`}
          tabPosition="left"
          onChange={this.onTabChage}
        >
          {billList.map((item) => {
            const { history } = this.props;
            const { billNum = '', billHeaderId = '' } = item;
            const subPageProps = {
              billHeaderId,
              status: 'create',
              flag: true,
              history,
              getSubPage: this.getSubPage,
              parentPage: this,
            };
            return (
              <TabPane tab={billNum} key={billHeaderId}>
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
