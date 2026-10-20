/*
 * OperationRecordModal - 操作记录弹窗
 * @date: 2018/08/20 19:40:29
 * @author: HB <bin.huang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Component } from 'react';
import { Table, Modal } from 'hzero-ui';
import PropTypes from 'prop-types';
import { Bind } from 'lodash-decorators';

import intl from 'utils/intl';
import { dateTimeRender } from 'utils/renderer';
import formatterCollections from 'utils/intl/formatterCollections';

/**
 * 历史版本对比页面
 * @extends {Component} - React.Component
 * @reactProps {Object} [location={}] - 当前路由信息
 * @reactProps {Object} [match={}] - react-router match路由信息
 * @reactProps {Object} [history={}]
 * @reactProps {Object} invitationList - 数据源
 * @reactProps {Object} loading - 数据加载是否完成
 * @reactProps {Object} form - 表单对象
 * @reactProps {Function} [dispatch=function(e) {return e;}] - redux dispatch方法
 * @return React.element
 */

@formatterCollections({ code: ['sslm.historyVersion'] })
export default class OperationRecordModal extends Component {
  static propTypes = {
    dispatch: PropTypes.func,
  };

  static defaultProps = {
    dispatch: e => e,
  };

  componentDidMount() {
    const { handleSearch } = this.props;
    handleSearch();
  }

  @Bind()
  onCancel() {
    const { onCancel } = this.props;
    if (onCancel) {
      onCancel();
    }
  }

  render() {
    const { pagination, dataSource, loading, visible, handleSearch } = this.props;
    const columns = [
      {
        title: intl.get('sslm.historyVersion.model.historyVersion.processUser').d('操作人'),
        dataIndex: 'processUser',
        width: 150,
      },
      {
        title: intl.get('sslm.historyVersion.model.historyVersion.activityTime').d('操作时间'),
        dataIndex: 'processDate',
        width: 160,
        render: (_, record) => dateTimeRender(record.processDate || record.creationDate),
      },
      {
        title: intl.get('hzero.common.button.action').d('操作'),
        dataIndex: 'processStatusMeaning',
        width: 80,
      },
      {
        title: intl.get('sslm.historyVersion.model.historyVersion.processRemark').d('说明'),
        dataIndex: 'processRemark',
        width: 150,
        render: (_, record) => record.approveRemark || record.processRemark,
      },
    ];
    const listProps = {
      pagination,
      dataSource,
      columns,
      loading,
      onChange: handleSearch,
      bordered: true,
      rowKey: (record, index) => index,
    };
    return (
      <React.Fragment>
        <Modal
          footer={null}
          width={700}
          visible={visible}
          onCancel={this.onCancel}
          title={intl.get(`sslm.historyVersion.view.message.operateHistory`).d('操作记录')}
        >
          <Table {...listProps} />
        </Modal>
      </React.Fragment>
    );
  }
}
