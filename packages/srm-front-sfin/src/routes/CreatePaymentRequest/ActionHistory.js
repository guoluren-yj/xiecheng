/**
 * 详情页面操作记录模态框
 * @date: 2018/11/30 10:26:49
 * @author: YKK <kaikai.yang@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
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
/**
 * 开票申请--对账单操作记录
 * @extends {Component} - PureComponent
 * @reactProps {Object} bill - 数据源
 * @reactProps {boolean} loading - 数据加载是否完成
 * @reactProps {Function} [dispatch= e=>e ] - redux dispatch方法
 * @return React.element
 */
@connect(({ createPaymentRequest, loading }) => ({
  createPaymentRequest,
  loading: loading.effects['createPaymentRequest/fetchOperationRecordList'],
}))
@formatterCollections({ code: 'sfin.bill' })
@withRouter
export default class ActionHistory extends PureComponent {
  /**
   * state初始化
   * @param {objet} props - 组件props
   */
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

  /**
   * 操作记录查询
   * @param {object} page - 查询参数
   */
  @Bind()
  handleSearch(page = {}) {
    const { dispatch, data } = this.props;
    if (data) {
      dispatch({
        type: 'createPaymentRequest/fetchOperationRecordList',
        payload: {
          page,
          paymentHeaderId: data.paymentHeaderId,
        },
      }).then((res) => {
        if (res) {
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
        dataIndex: 'processUserName',
        width: 100,
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.processDate`).d('操作日期'),
        dataIndex: 'processedDate',
        width: 100,
        render: dateTimeRender,
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.processStatusMeaning`).d('动作'),
        dataIndex: 'processTypeCodeMeaning',
        width: 100,
      },
      // {
      //   title: intl.get(`${promptCode}.model.invoiceBill.trxNumTrxLineNum`).d('事务单号|行号'),
      //   dataIndex: 'trxNumTrxLineNum',
      //   width: 100,
      // },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.processRemark`).d('说明'),
        dataIndex: 'processRemark',
        width: 100,
      },
    ];
    return (
      <Modal
        title={intl.get('hzero.common.button.operating').d('操作记录')}
        visible={visible}
        onCancel={() => {
          hideModal('visible', false);
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
