/**
 * EditGroupDrawer - 编辑分组
 * @date: 2019-07-02
 * @author: LXM <xiaomei.lv@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2019, Hand
 */

import React, { Component, Fragment } from 'react';
import { Drawer, Button } from 'hzero-ui';
import { connect } from 'dva';
import { isEmpty } from 'lodash';
import { Bind } from 'lodash-decorators';

import intl from 'utils/intl';
import uuidv4 from 'uuid/v4';
import { getEditTableData } from 'utils/utils';
import notification from 'utils/notification';
import formatterCollections from 'utils/intl/formatterCollections';

import EditGroupTable from './EditGroupTable';

@connect(({ riskMonitoring, loading }) => ({
  riskMonitoring,
  groupsList: riskMonitoring.groupsList,
  queryGroupsLoading: loading.effects['riskMonitoring/queryGroups'],
  saveLoading: loading.effects['riskMonitoring/saveGroups'],
  deleteLoading: loading.effects['riskMonitoring/deleteGroups'],
}))
@formatterCollections({ code: ['sslm.riskMonitoring'] })
export default class EditGroupDrawer extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    this.handleRefresh();
  }

  /**
   * 刷新列表
   */
  @Bind()
  handleRefresh() {
    const { dispatch } = this.props;
    dispatch({
      type: 'riskMonitoring/queryGroups',
    });
  }

  /**
   * 批量保存
   */
  @Bind()
  handleBatchSave() {
    const { dispatch, groupsList } = this.props;
    const tableValues = getEditTableData(groupsList, ['monitorGroupId']).map(item => {
      if (item._status === 'create') {
        const { monitorGroupId, ...newItem } = item;
        return newItem;
      } else {
        return item;
      }
    });
    if (!isEmpty(tableValues)) {
      dispatch({
        type: 'riskMonitoring/saveGroups',
        payload: {
          adds: tableValues,
        },
      }).then(res => {
        if (res) {
          notification.success();
          this.handleRefresh();
        }
      });
    }
  }

  /**
   * 新增
   */
  @Bind()
  handleAddGroup() {
    const { dispatch, groupsList } = this.props;
    dispatch({
      type: 'riskMonitoring/updateState',
      payload: {
        groupsList: [{ _status: 'create', monitorGroupId: uuidv4() }, ...groupsList],
      },
    });
  }

  /**
   * 删除
   */
  @Bind()
  handleDeleteGroup(record) {
    const { dispatch } = this.props;
    dispatch({
      type: 'riskMonitoring/deleteGroups',
      payload: {
        monitorGroupId: record.monitorGroupId,
      },
    }).then(res => {
      if (res) {
        notification.success();
        this.handleRefresh();
      }
    });
  }

  render() {
    const {
      editGroupVisible,
      onClose,
      saveLoading,
      deleteLoading,
      queryGroupsLoading,
      groupsList,
      queryGroupsList,
    } = this.props;
    const tableProps = {
      queryGroupsList,
      loading: queryGroupsLoading || deleteLoading || saveLoading,
      dataSource: groupsList,
      onDelete: this.handleDeleteGroup,
    };
    return (
      <Fragment>
        <Drawer
          width={620}
          onClose={onClose}
          visible={editGroupVisible}
          title={intl.get(`sslm.riskMonitoring.view.message.title.editGroup`).d('编辑分组')}
        >
          <div style={{ textAlign: 'right' }}>
            <Button style={{ marginRight: 8 }} onClick={this.handleBatchSave} loading={saveLoading}>
              {intl.get('hzero.common.button.save').d('保存')}
            </Button>
            <Button type="primary" onClick={this.handleAddGroup} loading={saveLoading}>
              {intl.get('hzero.common.button.add').d('新增')}
            </Button>
          </div>

          <EditGroupTable {...tableProps} />
        </Drawer>
      </Fragment>
    );
  }
}
