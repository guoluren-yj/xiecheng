/**
 * EditDataTable
 * @author WY <yang.wang06@hand-china.com>
 * @date 2019-08-14
 * @copyright 2019 © HAND
 */
import React, { useCallback, useEffect, useState } from 'react';
import { DatePicker, Form, Tooltip, Icon } from 'hzero-ui';
import { Text } from 'choerodon-ui';
import { Lov, Modal, useDataSet } from 'choerodon-ui/pro';
import { Bind } from 'lodash-decorators';
import moment from 'moment';
// import uuid from 'uuid/v4';

import { Button as ButtonPermission } from 'components/Permission';
import EditTable from 'components/EditTable';
// import { operatorRender } from 'utils/renderer';
// import Lov from 'components/Lov';
// import notification from 'utils/notification';

import intl from 'utils/intl';
import { tableScrollWidth, getDateFormat } from 'utils/utils';
import { DEFAULT_DATE_FORMAT } from 'utils/constants';
import { VERSION_IS_OP } from 'utils/config';
import { checkPermission } from 'hzero-front/lib/services/api';
import { getResponse, isTenantRoleLevel } from 'hzero-front/lib/utils/utils';
import PermissionModal from './PermissionModal';

const rowKey = '_mockId';

export default class EditDataTable extends React.Component {
  constructor(props) {
    super(props);
    props.onRef(this);

    this.state = {
      // assignPerVisible: false,
    };
  }

  @Bind()
  handleAddBtnClick() {
    const { onTableAdd } = this.props;
    onTableAdd();
  }

  @Bind()
  async handleDeleteBtnClick() {
    const { onTableDelete } = this.props;
    const { selectedRows = [] } = this.state;
    await onTableDelete(selectedRows);
  }

  // Table
  getColumns() {
    const { path } = this.props;
    // const { id: roleId } = role;
    const dateFormat = getDateFormat();
    return [
      {
        dataIndex: 'loginName',
        title: intl.get('hiam.roleManagement.model.roleManagement.loginName').d('账户'),
        render: (v, record) => {
          if (record.tipMessage) {
            return (
              <>
                <span>{v}</span>
                <Tooltip title={record.tipMessage}>
                  &nbsp;
                  <Icon type="exclamation-circle-o" />
                </Tooltip>
              </>
            );
          } else {
            return v;
          }
        },
      },
      {
        dataIndex: 'realName',
        title: intl.get('hiam.roleManagement.model.roleManagement.userLoginName').d('用户名'),
        // render: (realName, record) => {
        //   const { _status } = record;
        //   if (_status === 'create') {
        //     const { $form: form } = record;
        //     return (
        //       <Form.Item>
        //         {form.getFieldDecorator('id', {
        //           initialValue: record.id,
        //           rules: [
        //             {
        //               required: true,
        //               message: intl.get('hzero.common.validation.notNull', {
        //                 name: intl
        //                   .get('hiam.roleManagement.model.roleManagement.userLoginName')
        //                   .d('用户名'),
        //               }),
        //             },
        //           ],
        //         })(
        //           <Lov
        //             allowClear={false}
        //             queryParams={{ roleId }}
        //             style={{ width: '100%' }}
        //             code={tenantRoleLevel ? 'HIAM.USER.ORG' : 'HIAM.USER'}
        //             textValue={realName}
        //             onChange={(userId, userRecord) => {
        //               this.handleUserChange(userId, userRecord, record);
        //             }}
        //           />
        //         )}
        //       </Form.Item>
        //     );
        //   } else {
        //     return realName;
        //   }
        // },
      },
      !VERSION_IS_OP && {
        title: intl.get('hiam.roleManagement.model.roleManagement.tenant').d('所属租户'),
        dataIndex: 'tenantName',
        render: (tenantName, record) => {
          const { _status } = record;
          if (_status === 'create' || _status === 'update') {
            const { $form: form } = record;
            return form.getFieldDecorator('tenantName', {
              initialValue: tenantName,
            })(<>{form.getFieldValue('tenantName')}</>);
          } else {
            return tenantName;
          }
        },
      },
      {
        title: intl.get('hiam.subAccount.model.role.startDateActive').d('起始时间'),
        key: 'startDateActive',
        width: 140,
        render: (_, record) => {
          const { _status } = record;
          if (_status === 'create' || _status === 'update') {
            const { $form: form } = record;
            return (
              <Form.Item>
                {form.getFieldDecorator('startDateActive', {
                  initialValue: record.startDateActive
                    ? moment(record.startDateActive, DEFAULT_DATE_FORMAT)
                    : undefined,
                })(
                  <DatePicker
                    format={dateFormat}
                    style={{ width: '100%' }}
                    disabled={record.removableFlag === 0 || record.manageableFlag === 0}
                    placeholder={null}
                    disabledDate={currentDate => {
                      return (
                        form.getFieldValue('endDateActive') &&
                        moment(form.getFieldValue('endDateActive')).isBefore(currentDate, 'day')
                      );
                    }}
                  />
                )}
              </Form.Item>
            );
          } else {
            return _;
          }
        },
      },
      {
        title: intl.get('hiam.subAccount.model.role.endDateActive').d('失效时间'),
        key: 'endDateActive',
        width: 140,
        render: (_, record) => {
          const { _status } = record;
          if (_status === 'create' || _status === 'update') {
            const { $form: form } = record;
            return (
              <Form.Item>
                {form.getFieldDecorator('endDateActive', {
                  initialValue: record.endDateActive
                    ? moment(record.endDateActive, DEFAULT_DATE_FORMAT)
                    : undefined,
                })(
                  <DatePicker
                    format={dateFormat}
                    style={{ width: '100%' }}
                    disabled={record.removableFlag === 0 || record.manageableFlag === 0}
                    placeholder={null}
                    disabledDate={currentDate =>
                      form.getFieldValue('startDateActive') &&
                      moment(form.getFieldValue('startDateActive')).isAfter(currentDate, 'day')
                    }
                  />
                )}
              </Form.Item>
            );
          } else {
            return _;
          }
        },
      },
      {
        key: 'operator',
        title: intl.get('hzero.common.button.action').d('操作'),
        width: 120,
        fixed: 'right',
        render: (_, record) => {
          const operators = [
            <Text>
              <ButtonPermission
                type="text"
                permissionList={[
                  {
                    code: `${path}.button.assignPermissions`,
                    type: 'button',
                    meaning: '角色管理-分配权限',
                  },
                ]}
                onClick={() => this.handleAssignPermissions(record)}
                disabled={record.removableFlag === 0}
              >
                {intl.get(`hiam.roleManagement.view.button.assignPermissions`).d('分配权限')}
              </ButtonPermission>
            </Text>,
          ];
          return operators;
        },
      },
    ].filter(Boolean);
  }

  @Bind()
  handleAssignPermissions(record = {}) {
    const { onFetchPermission, onShield, roleId, path } = this.props;
    const permissionModalProps = {
      path,
      roleId,
      fetchPermissionTree: onFetchPermission,
      onShield,
      member: record,
    };
    Modal.open({
      drawer: true,
      style: { width: 800 },
      title: intl.get('hiam.roleManagement.view.button.assignPermission').d('分配权限'),
      children: <PermissionModal {...permissionModalProps} />,
      okButton: false,
      cancelText: intl.get('hzero.common.button.close').d('关闭'),
    });
  }

  @Bind()
  handleUserChange(userId, userRecord, record) {
    const { $form: form } = record;
    form.setFieldsValue({
      // assignLevel: undefined,
      // assignLevelMeaning: undefined,
      // assignLevelValue: undefined,
      // assignLevelValueMeaning: undefined,
      tenantName: userRecord.tenantName,
    });
  }

  @Bind()
  handleRowSelectionChange(selectedRowKeys, selectedRows) {
    this.setState({
      selectedRows,
      selectedRowKeys: selectedRows.map(record => record[rowKey]),
    });
  }

  // @Bind()
  // getCheckboxProps(record) {
  //   if (record.admin) {
  //     return {
  //       disabled: true,
  //     };
  //   } else {
  //     return {};
  //   }
  // }

  @Bind()
  saveUser(data) {
    const { handleSave } = this.props;
    handleSave(data);
  }

  render() {
    const {
      dataSource = [],
      pagination,
      onChange,
      path,
      queryLoading = false,
      saveLoading = false,
      deleteLoading = false,
    } = this.props;
    const { selectedRowKeys = [] } = this.state;
    const columns = this.getColumns();
    const rowSelection = {
      selectedRowKeys,
      onChange: this.handleRowSelectionChange,
      getCheckboxProps: record => ({
        disabled: record.removableFlag === 0,
      }),
    };

    return (
      <>
        <div className="table-operator">
          <AddUser code="hiam.role.list.button.addAssign" save={this.saveUser} />
          <ButtonPermission
            permissionList={[
              {
                code: `${path}.button.deleteAssign`,
                type: 'button',
                meaning: '角色管理-删除',
              },
            ]}
            onClick={this.handleDeleteBtnClick}
            disabled={selectedRowKeys.length === 0 || saveLoading || queryLoading}
            loading={deleteLoading}
          >
            {intl.get('hzero.common.button.delete').d('删除')}
          </ButtonPermission>
        </div>
        <EditTable
          bordered
          rowKey={rowKey}
          dataSource={dataSource}
          pagination={pagination}
          loading={queryLoading}
          rowSelection={rowSelection}
          columns={columns}
          scroll={{ x: tableScrollWidth(columns) }}
          onChange={onChange}
        />
      </>
    );
  }
}

function AddUser(props) {
  const [disabledFlag, setDisabledFlag] = useState(true);
  const ds = useDataSet(() => ({
    fields: [
      {
        name: 'user',
        lovCode: isTenantRoleLevel() ? 'HIAM.ROLE_MANAGER.USER' : 'HIAM.ROLE_MANAGER.SITE.USER',
        type: 'object',
        multiple: true,
      },
    ],
    events: {
      update({ name, record }) {
        if (name === 'user') {
          props.save(record.toJSONData().user);
        }
      },
    },
  }));
  useEffect(() => {
    if (props.code) {
      checkPermission([props.code]).then(res => {
        if (getResponse(res)) {
          res.forEach(({ approve }) => {
            setDisabledFlag(!approve);
          });
        }
      });
    } else {
      setDisabledFlag(true);
    }
  }, [props.code]);

  const initData = useCallback(() => {
    ds.loadData([{}]);
  }, []);
  return (
    <Lov
      dataSet={ds}
      name="user"
      disabled={disabledFlag}
      mode="button"
      clearButton={false}
      onClick={initData}
      color="primary"
    >
      {intl.get('hzero.common.button.add').d('新增')}
    </Lov>
  );
}
