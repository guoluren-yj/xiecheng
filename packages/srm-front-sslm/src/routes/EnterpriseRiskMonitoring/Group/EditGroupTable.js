/**
 * EditGroupTable - 编辑分组table
 * @date: 2019-07-02
 * @author: LXM <xiaomei.lv@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2019, Hand
 */
import uuidv4 from 'uuid/v4';
import { connect } from 'dva';
import { Bind } from 'lodash-decorators';
import { isEmpty, isUndefined } from 'lodash';
import React, { Component, Fragment } from 'react';
import { Popconfirm, Form, Input, Button, Drawer, Modal } from 'hzero-ui';

import intl from 'utils/intl';
import EditTable from 'components/EditTable';
import TLEditor from 'components/TLEditor';
import notification from 'utils/notification';
import { createPagination, getEditTableData } from 'utils/utils';
import formatterCollections from 'utils/intl/formatterCollections';

import AsignUser from './AsignUser';

const FormItem = Form.Item;

@connect(({ riskMonitoring, loading }) => ({
  riskMonitoring,
  groupsList: riskMonitoring.groupsList,
  queryLoading: loading.effects['riskMonitoring/queryChildAccount'],
  asignLoading: loading.effects['riskMonitoring/asignChildAccount'],
}))
@formatterCollections({ code: ['sslm.riskMonitoring'] })
export default class EditGroupTable extends Component {
  constructor(props) {
    super(props);
    this.state = {
      assignUsersVisible: false,
      childAccountList: [], // 子账户集合
      childAccountPagination: {}, // 当前子账户分页
      currentRecord: {}, // 当前行
    };
  }

  /**
   * 行内编辑/取消
   */
  @Bind()
  handleEditGroup(record, flag) {
    const { dispatch, groupsList } = this.props;
    const newList = groupsList.map((item) => {
      const { ...newItem } = item;
      if (item.monitorGroupId === record.monitorGroupId) {
        return { ...newItem, _status: flag ? 'update' : '' };
      } else {
        return newItem;
      }
    });
    dispatch({
      type: 'riskMonitoring/updateState',
      payload: {
        groupsList: newList,
      },
    });
  }

  /**
   * 新增的取消
   */
  @Bind()
  handleCancel(record) {
    const { dispatch, groupsList } = this.props;
    const newList = groupsList.filter((item) => item.monitorGroupId !== record.monitorGroupId);
    dispatch({
      type: 'riskMonitoring/updateState',
      payload: {
        groupsList: newList,
      },
    });
  }

  /**
   * 查询子账户
   */
  @Bind()
  handleChildAccount(page = {}, monitorGroupId) {
    const { dispatch } = this.props;
    const { currentRecord } = this.state;
    const values = isUndefined(this.userForm) ? {} : this.userForm.getFieldsValue();
    dispatch({
      type: 'riskMonitoring/queryChildAccount',
      payload: {
        page,
        monitorGroupId: currentRecord.monitorGroupId || monitorGroupId,
        ...values,
      },
    }).then((res) => {
      if (res) {
        this.setState({
          childAccountList: res.content,
          childAccountPagination: createPagination(res),
        });
      }
    });
  }

  /**
   * 新增子账户
   */
  @Bind()
  handleAddUser() {
    const { childAccountList } = this.state;
    this.setState({
      childAccountList: [{ monitorGroupUserId: uuidv4(), _status: 'create' }, ...childAccountList],
    });
  }

  /**
   * 删除子账户
   */
  @Bind()
  handleUserDelete(selectedRowKeys, selectedRows) {
    const { childAccountList } = this.state;
    const { dispatch, queryGroupsList } = this.props;
    Modal.confirm({
      title: intl.get('sslm.riskMonitoring.view.message.deleteConfirm').d('确认删除？'),
      onOk: () => {
        const newList = childAccountList.filter(
          (n) => selectedRowKeys.findIndex((m) => n.monitorGroupUserId === m) === -1
        );
        this.setState({ childAccountList: newList });
        const deleteList = selectedRows.filter((n) => n._status !== 'create');
        if (!isEmpty(deleteList)) {
          dispatch({
            type: 'riskMonitoring/unAsignChildAccount',
            payload: deleteList,
          }).then((res) => {
            if (res) {
              notification.success();
              this.handleChildAccount();
              queryGroupsList(); // 查询分组tab
            }
          });
        }
      },
    });
  }

  /**
   * 分配用户
   */
  @Bind()
  handleAsignUser(record = {}) {
    const { assignUsersVisible } = this.state;
    const { monitorGroupId } = record;
    this.setState({ assignUsersVisible: !assignUsersVisible, currentRecord: record });
    if (!assignUsersVisible) {
      this.handleChildAccount({}, monitorGroupId);
    }
  }

  /**
   * 分配用户模态框确认回调
   */
  @Bind()
  handleUserOk() {
    const { dispatch, queryGroupsList } = this.props;
    const {
      childAccountList,
      currentRecord: { monitorGroupId },
    } = this.state;
    const newList = getEditTableData(childAccountList, ['_status', 'monitorGroupUserId']);
    dispatch({
      type: 'riskMonitoring/asignChildAccount',
      payload: {
        monitorGroupId,
        childAccountList: newList,
      },
    }).then((res) => {
      if (res) {
        notification.success();
        this.handleChildAccount();
        this.handleAsignUser();
        queryGroupsList(); // 查询分组tab
      }
    });
  }

  render() {
    const { loading, dataSource = [], onDelete, queryLoading, asignLoading } = this.props;
    const { assignUsersVisible, childAccountList, childAccountPagination } = this.state;
    const columns = [
      {
        title: intl.get(`sslm.riskMonitoring.view.group.number`).d('分组编码'),
        dataIndex: 'monitorGroupCode',
        width: 200,
        render: (val, record) =>
          ['create', 'update'].includes(record._status) ? (
            <FormItem>
              {record.$form.getFieldDecorator('monitorGroupCode', {
                initialValue: record.monitorGroupCode,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`sslm.riskMonitoring.view.group.number`).d('分组编码'),
                    }),
                  },
                ],
              })(<Input trim typeCase="upper" inputChinese={false} />)}
            </FormItem>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`sslm.riskMonitoring.view.group.name`).d('分组名称'),
        dataIndex: 'monitorGroupName',
        width: 200,
        render: (val, record) =>
          ['create', 'update'].includes(record._status) ? (
            <FormItem>
              {record.$form.getFieldDecorator('monitorGroupName', {
                initialValue: record.monitorGroupName,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`sslm.riskMonitoring.view.group.name`).d('分组名称'),
                    }),
                  },
                ],
              })(
                <TLEditor
                  label={intl.get(`sslm.riskMonitoring.view.group.name`).d('分组名称')}
                  field="monitorGroupName"
                  token={record._token}
                />
              )}
            </FormItem>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`hzero.common.button.action`).d('操作'),
        dataIndex: 'option',
        width: 140,
        render: (_, record) => {
          return (
            <Fragment>
              {record._status === 'create' && (
                <a style={{ marginRight: 8 }} onClick={() => this.handleCancel(record)}>
                  {intl.get('hzero.common.button.cancel').d('取消')}
                </a>
              )}
              {record._status === 'update' && (
                <Fragment>
                  <a onClick={() => this.handleEditGroup(record, false)}>
                    {intl.get('hzero.common.button.cancel').d('取消')}
                  </a>
                  <a style={{ marginLeft: 8, marginRight: 8 }} disabled>
                    {intl.get('sslm.riskMonitoring.view.message.assignUsers').d('分配用户')}
                  </a>
                  <Popconfirm
                    placement="topLeft"
                    title={intl
                      .get(`sslm.riskMonitoring.view.message.deleteGroup`)
                      .d('确定删除该分组？')}
                    onConfirm={() => onDelete(record)}
                  >
                    <a style={{ color: 'red' }}>
                      {intl.get('hzero.common.button.delete').d('删除')}
                    </a>
                  </Popconfirm>
                </Fragment>
              )}
              {!(record._status === 'create') && !(record._status === 'update') && (
                <Fragment>
                  <a onClick={() => this.handleEditGroup(record, true)}>
                    {intl.get('hzero.common.button.edit').d('编辑')}
                  </a>
                  <a
                    style={{ marginLeft: 8, marginRight: 8 }}
                    onClick={() => this.handleAsignUser(record)}
                  >
                    {intl.get('sslm.riskMonitoring.view.message.assignUsers').d('分配用户')}
                  </a>
                  <Popconfirm
                    placement="topLeft"
                    title={intl
                      .get(`sslm.riskMonitoring.view.message.deleteGroup`)
                      .d('确定删除该分组？')}
                    onConfirm={() => onDelete(record)}
                  >
                    <a style={{ color: 'red' }}>
                      {intl.get('hzero.common.button.delete').d('删除')}
                    </a>
                  </Popconfirm>
                </Fragment>
              )}
            </Fragment>
          );
        },
      },
    ];
    const asignUserProps = {
      queryLoading,
      dataSource: childAccountList,
      pagination: childAccountPagination,
      onSearch: this.handleChildAccount,
      onAdd: this.handleAddUser,
      onUserDelete: this.handleUserDelete,
      onRef: (node = {}) => {
        this.userForm = (node.props || {}).form;
      },
    };

    return (
      <Fragment>
        <EditTable
          bordered
          rowKey="monitorGroupId"
          loading={loading}
          columns={columns}
          pagination={false}
          dataSource={dataSource}
          style={{ paddingTop: 16 }}
        />
        <Drawer
          width={520}
          destroyOnClose
          title={intl.get('sslm.riskMonitoring.view.message.assignUsers').d('分配用户')}
          visible={assignUsersVisible}
          onClose={this.handleAsignUser}
        >
          {assignUsersVisible && <AsignUser {...asignUserProps} />}
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              width: '100%',
              borderTop: '1px solid #e8e8e8',
              padding: '10px 16px',
              textAlign: 'right',
              left: 0,
              background: '#fff',
              borderRadius: '0 0 4px 4px',
            }}
          >
            <Button
              style={{
                marginRight: 8,
              }}
              onClick={this.handleAsignUser}
            >
              {intl.get('hzero.common.button.cancel').d('取消')}
            </Button>
            <Button onClick={this.handleUserOk} type="primary" loading={asignLoading}>
              {intl.get(`hzero.common.button.ok`).d('确定')}
            </Button>
          </div>
        </Drawer>
      </Fragment>
    );
  }
}
