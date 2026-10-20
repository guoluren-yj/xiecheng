/**
 * EditForm - 平台电商账号管理 - 数据维护表单
 * @date: 2019-3-07
 * @author: Wu <qizheng.wu@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React from 'react';
import { Form, Input, Modal } from 'hzero-ui';
import lodash from 'lodash';
import { Bind } from 'lodash-decorators';

import intl from 'utils/intl';
import Lov from 'components/Lov';
import Switch from 'components/Switch';

/**
 * 使用Form.Item组件
 */
const FormItem = Form.Item;
/**
 * 侧滑modal样式属性
 */
const otherProps = {
  wrapClassName: 'ant-modal-sidebar-right',
  transitionName: 'move-right',
};

const formLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 16 },
};

/**
 * 数据维护表单
 * @extends {Component} - React.Component
 * @reactProps {Object} loading - 数据加载是否完成
 * @reactProps {Object} form - 表单对象
 * @return React.element
 */
@Form.create({ fieldNameProp: null })
export default class EditForm extends React.Component {
  state = {
    disabledLov: true,
  };

  /**
   * 点击确定触发事件
   */
  @Bind()
  okHandle() {
    const {
      form,
      onHandleAddECClient,
      editRowData: { ecClientId },
    } = this.props;
    form.validateFields((err, fieldsValue) => {
      if (!ecClientId) {
        if (!err) {
          const params = {
            ...fieldsValue,
            userName: lodash.trim(fieldsValue.userName),
            clientType: 'PLATFORM',
          };
          delete params.newPassWord;
          onHandleAddECClient(params, form);
        }
      } else {
        const { userPassword, ...otherErrors } = err;
        if (lodash.isEmpty(otherErrors)) {
          const params = {
            ...fieldsValue,
            userName: lodash.trim(fieldsValue.userName),
            clientType: 'PLATFORM',
            userPassword: fieldsValue.newPassWord,
          };
          delete params.newPassWord;
          onHandleAddECClient(params, form);
        }
      }
    });
  }

  /**
   * 点击取消触发事件
   */
  @Bind()
  cancelHandle() {
    const { form, showEditModal } = this.props;
    showEditModal(false);
    form.resetFields();
  }

  /**
   * 设置tenantId
   * @param {Number} index 索引
   * @param {Object} record 行数据
   */
  @Bind()
  setTenantId(index, record) {
    const { form } = this.props;
    form.setFieldsValue({
      ecTenantId: record.tenantId,
    });
    this.setState({
      disabledLov: false,
    });
  }

  render() {
    const { form, modalVisible, editRowData, loading } = this.props;
    const { disabledLov } = this.state;
    const {
      ecPlatform,
      ecClientId,
      ecTenantId,
      ecPlatformName,
      ecCompanyName,
      ecCompanyId,
      userName,
      userPassword,
      serverAddress,
      enabledFlag,
      activateFlag,
    } = editRowData;
    return (
      <Modal
        destroyOnClose
        title={
          editRowData.ecClientId === undefined
            ? intl.get('small.ecClientSite.model.ecClientSite.newAccount').d('账户新建')
            : intl.get('small.ecClientSite.model.ecClientSite.accountMaintain').d('账户维护')
        }
        visible={modalVisible}
        onOk={this.okHandle}
        onCancel={this.cancelHandle}
        confirmLoading={loading}
        {...otherProps}
      >
        <React.Fragment>
          <FormItem
            label={intl.get('small.ecClientSite.model.ecClientSite.ecPlatform').d('电商平台')}
            {...formLayout}
          >
            {form.getFieldDecorator('ecPlatform', {
              initialValue: ecPlatform,
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl
                      .get('small.ecClientSite.model.ecClientSite.ecPlatform')
                      .d('电商平台'),
                  }),
                },
              ],
            })(
              <Lov code="SMAL.EC_PLATFORM" textValue={ecPlatformName} onChange={this.setTenantId} />
            )}
          </FormItem>
          <FormItem style={{ display: 'none' }} {...formLayout}>
            {form.getFieldDecorator('ecTenantId', {
              initialValue: ecTenantId,
            })(<Input />)}
          </FormItem>
          <FormItem
            label={intl.get('small.ecClientSite.model.ecClientSite.ecCompany').d('公司名称')}
            {...formLayout}
          >
            {form.getFieldDecorator('ecCompanyId', {
              initialValue: ecCompanyId,
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get('small.ecClientSite.model.ecClientSite.ecCompany').d('公司名称'),
                  }),
                },
              ],
            })(
              <Lov
                textValue={ecCompanyName}
                code="HPFM.COMPANY"
                disabled={!ecClientId && disabledLov}
                queryParams={{ tenantId: form.getFieldValue('ecTenantId'), enabledFlag: 1 }}
              />
            )}
          </FormItem>
          <FormItem
            label={intl.get('small.ecClient.model.ecClient.userName').d('账户名')}
            {...formLayout}
          >
            {form.getFieldDecorator('userName', {
              initialValue: userName || '',
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get('small.ecClient.model.ecClient.userName').d('账户名'),
                  }),
                },
                {
                  max: 100,
                  message: intl.get('hzero.common.validation.max', {
                    max: 100,
                  }),
                },
              ],
            })(<Input inputChinese="false" />)}
          </FormItem>
          {ecClientId === undefined ? (
            <React.Fragment>
              <FormItem
                label={intl.get('small.ecClientSite.model.ecClientSite.password').d('密码')}
                {...formLayout}
              >
                {form.getFieldDecorator('userPassword', {
                  initialValue: userPassword,
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get('small.ecClientSite.model.ecClientSite.password').d('密码'),
                      }),
                    },
                    {
                      max: 120,
                      message: intl.get('hzero.common.validation.max', {
                        max: 120,
                      }),
                    },
                  ],
                })(<Input disabled={!!ecClientId} type="password" autoComplete="new-password" />)}
              </FormItem>
            </React.Fragment>
          ) : null}
          {ecClientId && !activateFlag && (
            <FormItem
              label={intl.get('small.ecClient.model.ecClient.form.updatePassword').d('修改密码')}
              {...formLayout}
            >
              {form.getFieldDecorator('newPassWord', {
                initialValue: undefined,
                rules: [
                  {
                    max: 120,
                    message: intl.get('hzero.common.validation.max', {
                      max: 120,
                    }),
                  },
                ],
              })(<Input type="password" autoComplete="new-password" />)}
            </FormItem>
          )}
          <FormItem
            label={intl.get('small.ecClientSite.model.ecClientSite.serverAddress').d('服务地址')}
            {...formLayout}
          >
            {form.getFieldDecorator('serverAddress', {
              initialValue: serverAddress,
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl
                      .get('small.ecClientSite.model.ecClientSite.serverAddress')
                      .d('服务地址'),
                  }),
                },
                {
                  max: 100,
                  message: intl.get('hzero.common.validation.max', {
                    max: 100,
                  }),
                },
              ],
            })(<Input />)}
          </FormItem>
          <FormItem label={intl.get('hzero.common.status.enable').d('启用')} {...formLayout}>
            {form.getFieldDecorator('enabledFlag', {
              initialValue: enabledFlag === undefined ? 1 : enabledFlag,
            })(<Switch />)}
          </FormItem>
        </React.Fragment>
      </Modal>
    );
  }
}
