import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { withRouter } from 'dva/router';
import { Table, Modal } from 'hzero-ui';
import { isFunction } from 'lodash';
import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { createPagination } from 'hzero-front/lib/utils/utils';
import { dateTimeRender } from 'utils/renderer';

const promptCode = 'sfin.invoiceBill';
@connect(({ bill, loading }) => ({
  bill,
  loading: loading.effects['bill/fetchBillHistory'],
}))
@formatterCollections({ code: 'sfin.invoiceBill' })
@withRouter
export default class ActionHistory extends PureComponent {
  constructor(props) {
    super(props);
    if (isFunction(props.onRef)) {
      props.onRef(this);
    }
    this.state = { operationRecordList: [], operationRecordPagination: {} };
  }

  componentDidMount() {
    this.handleSearch();
  }

  @Bind()
  handleSearch(page = {}) {
    const { dispatch, data } = this.props;
    if (data) {
      dispatch({
        type: 'bill/fetchBillHistory',
        payload: {
          page,
          rcvTrxLineId: data.rcvTrxLineId,
        },
      }).then((res) => {
        if (res) {
          console.log(res.content);
          this.setState({
            operationRecordList: res.content,
            operationRecordPagination: createPagination(res),
          });
        }
      });
    }
  }

  /**
   * render查询表单
   */
  render() {
    const { loading, visible, hideModal } = this.props;
    const { operationRecordList, operationRecordPagination } = this.state;
    const columns = [
      {
        title: intl.get(`${promptCode}.model.invoiceBill.processUser`).d('操作人'),
        dataIndex: 'processUser',
        width: 100,
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.processDate`).d('操作日期'),
        dataIndex: 'processDate',
        width: 100,
        render: dateTimeRender,
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.processStatusMeaning`).d('动作'),
        dataIndex: 'processStatusMeaning',
        width: 100,
      },
    ];
    return (
      <Modal
        title={intl.get('hzero.common.button.operating').d('操作记录')}
        visible={visible}
        onCancel={() => {
          hideModal(false);
        }}
        footer={null}
        width={800}
        bodyStyle={{ minHeight: 300 }}
      >
        <Table
          loading={loading}
          dataSource={operationRecordList}
          pagination={operationRecordPagination}
          rowKey="recordId"
          onChange={this.handleSearch}
          columns={columns}
          bordered
        />
      </Modal>
    );
  }
}
