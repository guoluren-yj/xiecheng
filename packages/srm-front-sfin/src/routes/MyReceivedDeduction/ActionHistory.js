import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { withRouter } from 'dva/router';
import { Table, Modal } from 'hzero-ui';
import { isFunction } from 'lodash';
import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { createPagination } from 'utils/utils';
import { dateTimeRender } from 'utils/renderer';

const promptCode = 'sfin.invoiceBill';
/**
 * 开票申请--对账单操作记录
 * @extends {Component} - PureComponent
 * @reactProps {Object} supplierDeductionApproval - 数据源
 * @reactProps {boolean} loading - 数据加载是否完成
 * @reactProps {Function} [dispatch= e=>e ] - redux dispatch方法
 * @return React.element
 */
@connect(({ supplierDeductionQuery, loading }) => ({
  supplierDeductionQuery,
  loading: loading.effects['supplierDeductionQuery/fetchOperationRecordList'],
}))
@formatterCollections({ code: 'sfin.supplierDeductionApproval' })
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
    this.state = {
      operationRecordList: {},
      operationRecordPagination: {},
    };
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
        type: 'supplierDeductionQuery/fetchOperationRecordList',
        payload: {
          page,
          supplierDeductionsId: data.supplierDeductionsId,
        },
      }).then((res) => {
        if (res) {
          this.setState({
            operationRecordList: res,
            operationRecordPagination: createPagination(res),
          });
        }
      });
    }
  }

  @Bind()
  closeSearch() {
    const { dispatch } = this.props;
    dispatch({
      type: 'supplierDeductionQuery/updateState',
      payload: {
        operationRecordPagination: {},
        operationRecordList: {}, // 缓存的操作记录数据要清空
      },
    });
  }

  /**
   * render查询表单
   */
  render() {
    const {
      loading,
      // supplierDeductionApproval: { operationRecordList = {}, operationRecordPagination = {} },
      visible,
      hideModal,
    } = this.props;
    const { operationRecordList = {}, operationRecordPagination = {} } = this.state;
    const columns = [
      {
        title: intl.get(`${promptCode}.model.invoiceBill.processTypeCode`).d('操作'),
        dataIndex: 'processTypeCodeMeaning',
        width: 100,
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.processUserName`).d('操作人'),
        dataIndex: 'processUserName',
        width: 100,
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.processedDate`).d('操作时间'),
        dataIndex: 'processedDate',
        width: 100,
        render: dateTimeRender,
      },
    ];
    return (
      <Modal
        title={intl.get('hzero.common.button.operating').d('操作记录')}
        visible={visible}
        onCancel={hideModal}
        footer={null}
        width={500}
        bodyStyle={{ minHeight: 300 }}
      >
        <Table
          loading={loading}
          dataSource={operationRecordList.content}
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
