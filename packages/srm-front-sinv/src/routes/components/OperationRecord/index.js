/*
 * OperationRecord - sinv公用操作记录页面
 * @date: 2019/08/20 18:48
 * @author: LC <chao.li03@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Component } from 'react';
import { Table, Modal } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { createPagination } from 'utils/utils';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { connect } from 'dva';
import { dateTimeRender } from 'utils/renderer';

@connect(({ loading = {}, sinvCommon = {} }) => ({
  fetchOperationRecordListLoading: loading.effects['sinvCommon/fetchOperationRecordList'],
  sinvCommon,
}))
@formatterCollections({
  code: ['sinv.deliveryCancelled', 'entity.supplier', 'entity.customer', 'entity.roles'],
})
export default class ActionRecord extends Component {
  constructor(props) {
    super(props);
    this.state = {
      dataSource: [], // 操作记录数据源
      pagination: {}, // 分页
    };
  }

  /**
   * getSnapshotBeforeUpdate 生命周期函数
   * 判断是否加载数据
   * @param {object} prevProps - 上一个状态下的props
   */
  getSnapshotBeforeUpdate(prevProps) {
    const { visible } = this.props;
    return visible && prevProps.visible !== visible;
  }

  componentDidMount() {
    this.handleSearch();
  }

  /**
   * 查询操作记录
   * @param pagination
   */
  @Bind()
  handleSearch(pagination = {}) {
    const { operationRecordId, dispatch } = this.props;
    dispatch({
      type: 'sinvCommon/fetchOperationRecordList',
      payload: {
        asnHeaderId: operationRecordId,
        page: pagination,
      },
    }).then((res) => {
      if (res) {
        this.setState({
          dataSource: res.content || [],
          pagination: createPagination(res),
        });
      }
    });
  }

  render() {
    const { hideModal, visible = false, fetchOperationRecordListLoading } = this.props;
    const { pagination = {}, dataSource = [] } = this.state;
    const columns = [
      {
        title: intl.get(`entity.roles.operator`).d('操作人'),
        dataIndex: 'processUser',
        width: 150,
      },
      {
        title: intl.get(`sinv.common.model.common.processDate`).d('操作时间'),
        dataIndex: 'processDate',
        width: 150,
        render: dateTimeRender,
      },
      {
        title: intl.get(`sinv.common.model.common.processStatusMeaning`).d('动作'),
        dataIndex: 'processStatusMeaning',
        width: 150,
      },
      {
        title: intl.get(`sinv.common.model.common.explain`).d('说明'),
        dataIndex: 'processRemark',
        width: 150,
      },
    ];
    const tableProps = {
      pagination,
      columns,
      dataSource,
      bordered: true,
      loading: fetchOperationRecordListLoading,
      rowKey: 'asnActionId',
      onChange: this.handleSearch,
    };
    return (
      <Modal
        title={intl.get(`sinv.common.model.common.operationRecord`).d('操作记录')}
        width={820}
        visible={visible}
        bodyStyle={{ maxHeight: '600px', overflow: 'auto' }}
        onCancel={hideModal}
        footer={null}
      >
        <Table {...tableProps} />
      </Modal>
    );
  }
}
