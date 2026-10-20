/**
 * 我发起的索赔单，索赔结果执行管理的执行情况
 * @date: 2022-01-12
 * @author: <xingya.li@going-link.com>
 * @version: 0.0.1
 */
import React, { Component } from 'react';
import { Table } from 'hzero-ui';
import { Tabs } from 'choerodon-ui';
import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';
import { createPagination, getResponse } from 'utils/utils';
import { dateTimeRender } from 'utils/renderer';
import styles from './index.less';
import {
  fetchChargeLine,
  fetchBillLine,
  fetchInvoiceLine,
  fetchPaymentLine,
} from '@/services/myClaimFormService';
import { thousandBitSeparator } from '@/routes/utils.js';

const { TabPane } = Tabs;
export default class ExecuteCondition extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activeKey: 'expense',
      executeDataSource: [],
      executePagination: {},
      loading: false,
    };
  }

  componentDidMount() {
    this.onSearch();
  }

  @Bind
  getColumns = (key) => {
    switch (key) {
      case 'expense':
        return [
          {
            title: intl.get(`sqam.common.model.sourceNumAndlineNum`).d('索赔单编号|行号'),
            dataIndex: 'sourceNumAndlineNum',
            width: 120,
          },
          {
            title: intl.get(`sqam.common.model.chargeNumAndLineNum`).d('费用单编号|行号'),
            dataIndex: 'chargeNumAndLineNum',
            width: 140,
          },
          {
            title: intl.get(`sqam.common.model.chargeStatusMeaning`).d('费用单状态'),
            dataIndex: 'chargeStatusMeaning',
            width: 100,
          },
          {
            title: intl.get(`sqam.common.model.taxIncludedAmount`).d('费用行金额（含税）'),
            dataIndex: 'taxIncludedAmount',
            width: 120,
            render: (text) => thousandBitSeparator(Number(text)),
          },
          {
            title: intl.get(`sqam.common.model.createdBy`).d('创建人'),
            dataIndex: 'createdUserName',
            width: 120,
          },
          {
            title: intl.get(`sqam.common.model.creationDate`).d('创建时间'),
            dataIndex: 'creationDate',
            width: 120,
            render: dateTimeRender,
          },
          {
            title: intl.get(`sqam.common.model.pushSettleStatus`).d('推送结算池状态'),
            dataIndex: 'pushSettleStatusMeaning',
            width: 120,
          },
        ];
      case 'bill':
        return [
          {
            title: intl.get(`sqam.common.model.sourceNumAndlineNum`).d('索赔单编号|行号'),
            dataIndex: 'sourceNumAndlineNum',
            width: 120,
          },
          {
            title: intl.get(`sqam.common.model.billNumAndLineNum`).d('对账单编号|行号'),
            dataIndex: 'billNumAndLineNum',
            width: 140,
          },
          {
            title: intl.get(`sqam.common.model.billStatusMeaning`).d('对账单状态'),
            dataIndex: 'billStatusMeaning',
            width: 100,
          },
          {
            title: intl.get(`sqam.common.model.taxIncludedAmountBill`).d('对账行金额（含税）'),
            dataIndex: 'taxIncludedAmount',
            width: 120,
            render: (text) => thousandBitSeparator(Number(text)),
          },
          // {
          //   title: intl.get(`sqam.common.model.completedAmount`).d('执行金额'),
          //   dataIndex: 'completedAmount',
          //   width: 120,
          // },
          {
            title: intl.get(`sqam.common.model.createdBy`).d('创建人'),
            dataIndex: 'createdUserName',
            width: 120,
          },
          {
            title: intl.get(`sqam.common.model.creationDate`).d('创建时间'),
            dataIndex: 'creationDate',
            width: 120,
            render: dateTimeRender,
          },
        ];
      default:
        return [
          {
            title: intl.get(`sqam.common.model.sourceNumAndlineNum`).d('索赔单编号|行号'),
            dataIndex: 'sourceNumAndlineNum',
            width: 120,
          },
          {
            title: intl.get(`sqam.common.model.settleNumAndLineNum`).d('结算单编号|行号'),
            dataIndex: 'settleNumAndLineNum',
            width: 140,
          },
          {
            title: intl.get(`sqam.common.model.settleStatusMeaning`).d('结算单状态'),
            dataIndex: 'settleStatusMeaning',
            width: 100,
          },
          {
            title: intl.get(`sqam.common.model.taxIncludedAmountSettle`).d('结算行金额（含税）'),
            dataIndex: 'taxIncludedAmount',
            width: 120,
            render: (text) => thousandBitSeparator(Number(text)),
          },
          // {
          //   title: intl.get(`sqam.common.model.completedAmount`).d('执行金额'),
          //   dataIndex: 'completedAmount',
          //   width: 120,
          // },
          {
            title: intl.get(`sqam.common.model.createdBy`).d('创建人'),
            dataIndex: 'createdUserName',
            width: 120,
          },
          {
            title: intl.get(`sqam.common.model.creationDate`).d('创建时间'),
            dataIndex: 'creationDate',
            width: 120,
            render: dateTimeRender,
          },
        ];
    }
  };

  @Bind
  formatRender = () => {
    const { activeKey, executeDataSource, executePagination, loading } = this.state;
    const columns = this.getColumns(activeKey);
    const total = executeDataSource[0]?.completedAmountTotal;
    return (
      <>
        {activeKey !== 'expense' && (
          <div className={styles.total}>
            <div>{intl.get(`sqam.common.model.completedAmountTotal`).d('执行总金额')}</div>
            <div className={styles.total_value}>{total ? thousandBitSeparator(total) : 0}</div>
          </div>
        )}
        <Table
          loading={loading}
          scroll={{ y: 400, x: 1000 }}
          bordered
          rowKey="problemHeaderId"
          columns={columns}
          dataSource={executeDataSource}
          pagination={executePagination}
          onChange={(page, size) => this.onSearch(page, size)}
        />
      </>
    );
  };

  @Bind
  handleChangeTab = (key) => {
    this.setState({ activeKey: key }, () => {
      this.onSearch({ page: 0 });
    });
  };

  @Bind
  onSearch = async (fields = {}) => {
    const { activeKey } = this.state;
    const { record } = this.props;
    const payload = {
      sourceNum: record.formNum,
      ...fields,
    };
    let res = null;
    this.setState({ loading: true });
    if (activeKey === 'expense') {
      res = await fetchChargeLine(payload);
    } else if (activeKey === 'bill') {
      res = await fetchBillLine(payload);
    } else if (activeKey === 'invoice') {
      // 如果开票单付款单
      res = await fetchInvoiceLine(payload);
    } else {
      res = await fetchPaymentLine(payload);
    }
    if (res) {
      const result = getResponse(res);
      if (result.failed) {
        this.setState({
          executeDataSource: [],
          executePagination: {},
          loading: false,
        });
      } else {
        this.setState({
          executeDataSource: result.content,
          executePagination: createPagination(result),
          loading: false,
        });
      }
    } else {
      this.setState({ loading: false });
    }
  };

  render() {
    const { activeKey } = this.state;
    return (
      <React.Fragment>
        <div style={{ height: '100%' }}>
          <Tabs
            defaultActiveKey={activeKey}
            tabPosition="left"
            style={{ height: '100%' }}
            onChange={this.handleChangeTab}
          >
            <TabPane tab={intl.get(`sqam.common.view.message.expense`).d('费用单')} key="expense">
              {this.formatRender()}
            </TabPane>
            <TabPane tab={intl.get(`sqam.common.view.message.bill`).d('对账单')} key="bill">
              {this.formatRender()}
            </TabPane>
            <TabPane tab={intl.get(`sqam.common.view.message.invoice`).d('开票单')} key="invoice">
              {this.formatRender()}
            </TabPane>
            <TabPane tab={intl.get(`sqam.common.view.message.payment`).d('付款单')} key="payment">
              {this.formatRender()}
            </TabPane>
          </Tabs>
        </div>
      </React.Fragment>
    );
  }
}
