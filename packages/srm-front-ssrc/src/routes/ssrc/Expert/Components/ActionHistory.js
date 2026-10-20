/**
 * 操作记录模态框
 * @date: 2019/01/22 10:26:49
 * @author: YKK <kaikai.yang@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Component } from 'react';
import { connect } from 'dva';
import { Table, Modal } from 'hzero-ui';
import { isFunction } from 'lodash';
import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';

const promptCode = 'ssrc.expert';
/**
 * 操作记录
 * @extends {Component} - PureComponent
 * @reactProps {Object} expert - 数据源
 * @reactProps {boolean} loading - 数据加载是否完成
 * @reactProps {Function} [dispatch= e=>e ] - redux dispatch方法
 * @return React.element
 */
@connect(({ expert, loading }) => ({
  expert,
  loading: loading.effects['expert/queryRecordList'],
}))
@formatterCollections({ code: 'ssrc.expert' })
export default class ActionHistory extends Component {
  /**
   * state初始化
   * @param {objet} props - 组件props
   */
  constructor(props) {
    super(props);
    if (isFunction(props.onRef)) {
      props.onRef(this);
    }
    this.state = {};
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
        type: 'expert/queryRecordList',
        payload: {
          page,
          expertReqId: data.expertReqId,
        },
      });
    }
  }

  @Bind()
  closeSearch() {
    const { dispatch } = this.props;
    dispatch({
      type: 'expert/updateState',
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
      expert: { operationRecordList = {}, operationRecordPagination = {} },
      visible,
      hideModal,
    } = this.props;
    const columns = [
      {
        title: intl.get(`${promptCode}.model.expert.loginName`).d('操作人'),
        dataIndex: 'realName',
        width: 100,
      },
      {
        title: intl.get(`${promptCode}.model.expert.processDate`).d('操作时间'),
        dataIndex: 'processDate',
        width: 100,
      },
      {
        title: intl.get(`${promptCode}.model.expert.processStatusMeaning`).d('状态'),
        dataIndex: 'processStatusMeaning',
        width: 100,
      },
      {
        title: intl.get(`hzero.common.remark`).d('备注'),
        dataIndex: 'processRemark',
        width: 100,
      },
    ];
    return (
      <Modal
        title={intl.get('hzero.common.button.operating').d('操作记录')}
        visible={visible}
        onCancel={hideModal}
        footer={null}
        width={800}
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
