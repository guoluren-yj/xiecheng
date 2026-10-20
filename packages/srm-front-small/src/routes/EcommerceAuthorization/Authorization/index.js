import React, { Component } from 'react';
import { Table, Modal, Form, Input, Badge } from 'hzero-ui';

import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';
import Lov from 'components/Lov';
import Switch from 'components/Switch';

import FilterForm from './FilterForm';
import EditPwForm from './EditPwForm';

const { TextArea } = Input;

const formLayout = {
  labelCol: { span: 5 },
  wrapperCol: { span: 17 },
};
@Form.create({ fieldNameProp: null })
export default class Authorization extends Component {
  handleCreateAccount = () => {
    const {
      onOk,
      form: { validateFields },
    } = this.props;
    validateFields((err, values) => {
      const value = { ...values };
      value.yn = !!value.yn;
      if (!err) {
        onOk(value);
      }
    });
  };

  render() {
    const {
      visible,
      pwdVisible,
      pwdRecord,
      onRef,
      pagination,
      list,
      loading,
      saveLoading,
      editPwdLoading,
      onClose,
      onEnable,
      onEditPassword,
      onSaveNewPwd,
      onClosePassword,
      onOpenModal,
      queryAuthorizateList,
      form: { getFieldDecorator },
    } = this.props;
    const columns = [
      {
        title: intl.get('small.common.model.tenant').d('租户'),
        dataIndex: 'tenantName',
        width: 200,
      },
      {
        title: intl.get('small.common.model.ecommerce').d('电商'),
        dataIndex: 'supplierName',
      },
      {
        title: intl.get('small.common.model.accountNumber').d('账号'),
        dataIndex: 'username',
      },
      {
        title: intl.get('small.common.model.status').d('状态'),
        dataIndex: 'yn',
        render: val => (
          <Badge
            status={val ? 'success' : 'error'}
            text={
              val
                ? intl.get('hzero.common.status.enable').d('启用')
                : intl.get('hzero.common.status.disable').d('禁用')
            }
          />
        ),
      },
      {
        title: intl.get('scec.common.table.column.remark').d('备注'),
        dataIndex: 'remark',
      },
      {
        title: intl.get('small.common.button.operating').d('操作'),
        render: record => {
          return (
            <span className="action-link">
              <a onClick={() => onEnable(record)}>
                {record.yn === true
                  ? intl.get('small.common.button.disable').d('停用')
                  : intl.get('small.common.button.enable').d('启用')}
              </a>
              <a onClick={() => onEditPassword(record)}>
                {intl.get('small.common.button.changePassword').d('修改密码')}
              </a>
              <a onClick={() => onOpenModal(record, 'white')}>
                {intl.get('small.common.button.newWhite').d('新增白名单')}
              </a>
              <a onClick={() => onOpenModal(record, 'black')}>
                {intl.get('small.common.button.newBlack').d('新增黑名单')}
              </a>
            </span>
          );
        },
      },
    ];
    const filterProps = {
      onRef,
      queryAuthorizateList,
    };
    const editFormOptions = {
      pwdRecord,
      pwdVisible,
      editPwdLoading,
      saveNewPwd: onSaveNewPwd,
      closePassword: onClosePassword,
    };
    return (
      <React.Fragment>
        <div className="table-list-search">
          <FilterForm {...filterProps} />
        </div>
        <Table
          className="small-table-all-space"
          bordered
          rowKey="id"
          columns={columns}
          loading={loading}
          pagination={pagination}
          onChange={page => queryAuthorizateList(page)}
          dataSource={list || []}
        />
        <Modal
          destroyOnClose
          width={400}
          title={intl.get('small.common.button.newAccount').d('新建账号')}
          placement="right"
          visible={visible}
          onOk={this.handleCreateAccount}
          onCancel={onClose}
          confirmLoading={saveLoading}
          transitionName="move-right"
          wrapClassName="ant-modal-sidebar-right"
        >
          <Form.Item label={intl.get('small.common.model.tenant').d('租户')} {...formLayout}>
            {getFieldDecorator('tenantId', {
              initialValue: '',
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get('small.common.model.tenant').d('租户'),
                  }),
                },
              ],
            })(<Lov code="HPFM.TENANT" />)}
          </Form.Item>
          <Form.Item label={intl.get('small.common.model.ecommerce').d('电商')} {...formLayout}>
            {getFieldDecorator('supplierCode', {
              initialValue: '',
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get('small.common.model.ecommerce').d('电商'),
                  }),
                },
              ],
            })(
              <Lov
                code="SMAL.PLATFORM_NAME"
                queryParams={{ tenantId: getCurrentOrganizationId() }}
                // queryParams={{ tenantId: getCurrentOrganizationId(), companyId: '-1' }}
              />
            )}
          </Form.Item>
          <Form.Item label={intl.get('small.common.model.accountNumber').d('账号')} {...formLayout}>
            {getFieldDecorator('username', {
              initialValue: '',
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get('small.common.model.accountNumber').d('账号'),
                  }),
                },
              ],
            })(<Input />)}
          </Form.Item>
          <Form.Item
            label={intl.get('small.ecommerceAuthorization.entity.roles.password').d('密码')}
            {...formLayout}
          >
            {getFieldDecorator('password', {
              initialValue: '',
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get('small.ecommerceAuthorization.entity.roles.password').d('密码'),
                  }),
                },
              ],
            })(<Input type="password" />)}
          </Form.Item>
          <Form.Item label={intl.get('small.common.table.column.remark').d('备注')} {...formLayout}>
            {getFieldDecorator('remark', { initialValue: '' })(<TextArea rows={4} />)}
          </Form.Item>
          <Form.Item {...formLayout} label={intl.get(`hzero.common.status.enable`).d('启用')}>
            {getFieldDecorator('yn', {
              initialValue: 1,
            })(<Switch />)}
          </Form.Item>
        </Modal>
        <EditPwForm {...editFormOptions} />
      </React.Fragment>
    );
  }
}
