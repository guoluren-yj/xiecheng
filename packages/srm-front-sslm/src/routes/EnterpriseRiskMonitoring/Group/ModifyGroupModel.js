/**
 * ModifyGroupModel - 修改分组
 * @date: 2019-07-03
 * @author: LXM <xiaomei.lv@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2019, Hand
 */

import React, { Component, Fragment } from 'react';
import { Modal, Transfer, Spin } from 'hzero-ui';
import { connect } from 'dva';
import { isEmpty } from 'lodash';
import { Bind } from 'lodash-decorators';

import intl from 'utils/intl';
import notification from 'utils/notification';
import formatterCollections from 'utils/intl/formatterCollections';

import styles from '../index.less';

@connect(({ riskMonitoring, loading }) => ({
  riskMonitoring,
  groupData: riskMonitoring.groupData,
  groupTargetKeys: riskMonitoring.groupTargetKeys,
  queryLoading: loading.effects['riskMonitoring/queryEditGroup'],
  assignLoading: loading.effects['riskMonitoring/assignGroup'],
}))
@formatterCollections({ code: ['sslm.riskMonitoring'] })
export default class ModifyGroupModel extends Component {
  componentDidMount() {
    this.handleEditGroup();
  }

  /**
   * 查询修改分组
   */
  @Bind()
  handleEditGroup() {
    const { dispatch, selectedRows } = this.props;
    const noCompanyIdList = selectedRows.filter((item) => !item.companyId);
    const companyIdList = selectedRows.filter((item) => item.companyId);
    dispatch({
      type: 'riskMonitoring/queryEditGroup',
      payload: {
        companyIds: companyIdList.map((n) => n.companyId).toString(),
        companyNames: noCompanyIdList.map((item) => item.companyName).toString(),
        queryType: 'RIGHT',
      },
    });
  }

  /**
   * 选项在两栏之间转移时的回调
   */
  @Bind()
  handleChange(targetKeys) {
    const { dispatch } = this.props;
    dispatch({
      type: 'riskMonitoring/updateState',
      payload: {
        groupTargetKeys: targetKeys,
      },
    });
  }

  /**
   * 分配分组
   */
  @Bind()
  handleAssignGroup() {
    const { groupTargetKeys = [], groupData = [], dispatch, selectedRows } = this.props;
    const arr = [];
    for (let i = 0; i < groupTargetKeys.length; i++) {
      for (let n = 0; n < groupData.length; n++) {
        if (groupTargetKeys[i] === groupData[n].monitorGroupId) {
          arr.push(groupData[n]);
        }
      }
    }
    if (isEmpty(arr)) {
      notification.warning({
        message: intl.get(`sslm.riskMonitoring.view.message.selectOneGroup`).d('至少选择一个分组'),
      });
    } else {
      dispatch({
        type: 'riskMonitoring/assignGroup',
        payload: {
          monitorGroupId: arr.map((item) => item.monitorGroupId),
          monitorList: selectedRows,
        },
      }).then((res) => {
        if (res) {
          notification.success();
          this.handleEditGroup();
        }
      });
    }
  }

  /**
   * Transfer
   */
  @Bind()
  renderTransfer(item) {
    const label = (
      <Fragment>
        <span style={{ marginRight: '20px' }}>{item.monitorGroupCode}</span>
        <span>{item.monitorGroupName}</span>
      </Fragment>
    );
    return {
      label,
      value: `${item.monitorGroupCode} ${item.monitorGroupName}`,
    };
  }

  render() {
    const {
      modifyGroupVisible,
      onCancel,
      groupData = [],
      groupTargetKeys = [],
      queryLoading,
      assignLoading,
    } = this.props;
    return (
      <Fragment>
        <Modal
          width={700}
          onCancel={onCancel}
          visible={modifyGroupVisible}
          title={intl.get(`sslm.riskMonitoring.view.title.selectGroup`).d('分组选择')}
          onOk={this.handleAssignGroup}
          confirmLoading={assignLoading}
          className={styles['modify-group']}
        >
          <Spin spinning={queryLoading}>
            <Transfer
              rowKey={(item) => item.monitorGroupId}
              showSearch
              dataSource={groupData}
              targetKeys={groupTargetKeys}
              render={this.renderTransfer}
              listStyle={{ height: 400, width: 303 }}
              onChange={this.handleChange}
            />
          </Spin>
        </Modal>
      </Fragment>
    );
  }
}
