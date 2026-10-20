/**
 * customBar - 平台自定义栏操作记录
 * @date: 2019年2月20日 20:16:26
 * @author: Jehu <zhihao.zeng@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Component } from 'react';
import { connect } from 'dva';
import { Table, Modal } from 'hzero-ui';
import { isEmpty, isUndefined } from 'lodash';
import { Bind } from 'lodash-decorators';
import { dateTimeRender } from 'utils/renderer';
import intl from 'utils/intl';

/**
 * 平台自定义栏操作记录
 * @extends {Component} - PureComponent
 * @reactProps {Object} customBar - 数据源
 * @reactProps {boolean} loading - 数据加载是否完成
 * @return React.element
 */

const prompt = 'scec.customBar.model.customBar';
@connect(({ loading, groupCustomBar }) => ({
  loading: loading.effects['groupCustomBar/fetchCustomBarHistory'],
  groupCustomBar,
}))
export default class HistoryModal extends Component {
  componentDidMount() {
    const { barId } = this.props;
    if (!isUndefined(barId)) {
      this.handleSearch(barId);
    }
  }

  /**
   * 操作记录查询
   * @param {object} params - 查询参数
   */
  @Bind()
  handleSearch(params = {}) {
    const {
      dispatch,
      groupCustomBar: { historyPagination = {} },
      barId,
    } = this.props;
    if (params) {
      dispatch({
        type: 'groupCustomBar/fetchCustomBarHistory',
        payload: {
          page: isEmpty(params) ? historyPagination : params,
          barId,
        },
      });
    }
  }

  /**
   * render查询表单
   */
  render() {
    const {
      groupCustomBar: { historyPagination = {}, historyList = {} },
      visible,
      loading,
      onCancel,
    } = this.props;

    const columns = [
      {
        title: intl.get(`${prompt}.processUser`).d('操作人'),
        dataIndex: 'operatedByName',
        width: 100,
      },
      {
        title: intl.get(`${prompt}.processDate`).d('操作日期'),
        dataIndex: 'operatedDate',
        render: dateTimeRender,
        width: 150,
      },
      {
        title: intl.get(`${prompt}.processStatusMeaning`).d('动作'),
        dataIndex: 'operationName',
        width: 100,
      },
      {
        title: intl.get(`${prompt}.processRemark`).d('说明'),
        dataIndex: 'operatedRemark',
      },
    ];
    return (
      <Modal
        destroyOnClose
        title={intl.get('scec.common.button.operating').d('操作记录')}
        visible={visible}
        onCancel={onCancel}
        footer={null}
        width={800}
      >
        <Table
          loading={loading}
          dataSource={historyList.content}
          pagination={historyPagination}
          rowKey="barHistoryId"
          onChange={page => this.handleSearch(page)}
          columns={columns}
          bordered
        />
      </Modal>
    );
  }
}
