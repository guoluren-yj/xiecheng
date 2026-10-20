/**
 * AccountVisible - 账号目录可见配置 - 分配设置
 * @date: 2019-12-13
 * @author: ZZ <qizheng.wu@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2019, Hand
 */
import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Modal, Form, Button } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import uuidv4 from 'uuid/v4';
import { filter, isEmpty } from 'lodash';

import EditTable from 'components/EditTable';
import intl from 'utils/intl';
import Lov from 'components/Lov';
import notification from 'utils/notification';
import { getCurrentOrganizationId } from 'utils/utils';

import FilterForm from './FilterForm';

const otherProps = {
  wrapClassName: 'ant-modal-sidebar-right',
  transitionName: 'move-right',
};
@connect(({ loading, accountVisible }) => ({
  accountVisible,
  fetchLoading: loading.effects['accountVisible/fetchAssignList'],
  updateLoading: loading.effects['accountVisible/updateAssignList'],
}))
@Form.create({ fieldNameProp: null })
export default class AssignModal extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      selectedRowKeys: [],
    };
  }

  form;

  @Bind()
  handleRef(ref = {}) {
    this.form = (ref.props || {}).form;
  }

  @Bind()
  handleRowSelectChange(selectedRowKeys) {
    this.setState({
      selectedRowKeys,
    });
  }

  @Bind()
  handleCancel() {
    const { onHandleCancel } = this.props;
    onHandleCancel();
  }

  @Bind()
  createLine() {
    const {
      dispatch,
      accountVisible: { assignList = [] },
    } = this.props;
    dispatch({
      type: 'accountVisible/updateState',
      payload: {
        assignList: [
          ...assignList,
          {
            accountId: uuidv4(),
            loginName: undefined,
            realName: undefined,
            userEnableFlag: 1,
            _status: 'create',
          },
        ],
      },
    });
  }

  @Bind()
  deleteLine() {
    const { selectedRowKeys = [] } = this.state;
    const {
      dispatch,
      accountVisible: { assignList = [] },
    } = this.props;
    const checkedData = filter(assignList, item => {
      return selectedRowKeys.indexOf(item.assignId) >= 0;
    });
    const unCheckedData = filter(assignList, item => {
      return selectedRowKeys.indexOf(item.assignId) < 0;
    });
    // const newUnsaveData = filter(assignList, item => {
    //   return item._status === 'create';
    // });
    Modal.confirm({
      title: intl.get('hzero.common.message.confirm.remove').d('确定删除选中数据?'),
      onOk: () => {
        const localDel = [];
        const remoteDel = [];
        checkedData.forEach(item => {
          if (item._status === 'create') {
            localDel.push(item);
          }
          if (!item._status) {
            remoteDel.push(item);
          }
        });
        if (isEmpty(remoteDel)) {
          dispatch({
            type: 'accountVisible/updateState',
            payload: {
              assignList: unCheckedData,
            },
          });
        } else {
          dispatch({
            type: 'accountVisible/deleteAssignList',
            payload: { remoteDel },
          }).then(res => {
            if (res) {
              notification.success();
              dispatch({
                type: 'accountVisible/updateState',
                payload: {
                  assignList: unCheckedData,
                },
              });
              this.setState({ selectedRowKeys: [] });
            }
          });
        }
      },
    });
  }

  render() {
    const {
      modalVisible,
      accountVisible: { assignList = [], assignListPagination = {} },
      onHandleOK,
      fetchLoading,
      updateLoading,
      onHandleSearch,
    } = this.props;
    const { selectedRowKeys } = this.state;
    const columns = [
      {
        title: '登录名',
        dataIndex: 'loginName',
        render: (val, record) => {
          if (record._status) {
            const { getFieldDecorator, getFieldValue, setFieldsValue } = record.$form;
            return (
              <Form.Item>
                {getFieldDecorator('userId', {
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: '登录名',
                      }),
                    },
                  ],
                  initialValue: record.loginName,
                })(
                  <Lov
                    style={{ width: '133px' }}
                    textValue={getFieldValue('loginName')}
                    textField="loginName"
                    code="SCEC.USER_BY_TENANT"
                    queryParams={{
                      tenantId: getCurrentOrganizationId(),
                    }}
                    onChange={(_, item) => {
                      setFieldsValue({
                        realName: item.realName,
                        loginName: item.loginName,
                      });
                    }}
                  />
                )}
              </Form.Item>
            );
          } else {
            return val;
          }
        },
      },
      {
        title: '姓名',
        dataIndex: 'realName',
        render: (val, record) => {
          if (record._status) {
            const { getFieldDecorator, getFieldValue } = record.$form;
            getFieldDecorator('realName', { initialValue: val });
            return getFieldValue('realName');
          } else {
            return val;
          }
        },
      },
    ];
    const rowSelection = {
      selectedRowKeys,
      onChange: this.handleRowSelectChange,
    };

    return (
      <Modal
        destroyOnClose
        title="分配账号"
        visible={modalVisible}
        width={750}
        onOk={onHandleOK}
        onCancel={this.handleCancel}
        {...otherProps}
      >
        <FilterForm onRef={this.handleRef} onHandleSearch={onHandleSearch} />
        <Form.Item>
          <Button
            type="primary"
            style={{ marginLeft: '8px', float: 'right' }}
            onClick={this.createLine}
          >
            新建
          </Button>
          <Button
            style={{ float: 'right' }}
            disabled={selectedRowKeys.length < 1}
            onClick={this.deleteLine}
          >
            删除
          </Button>
        </Form.Item>
        <EditTable
          bordered
          rowKey="assignId"
          columns={columns}
          rowSelection={rowSelection}
          dataSource={assignList}
          pagination={assignListPagination}
          loading={fetchLoading || updateLoading}
        />
      </Modal>
    );
  }
}
