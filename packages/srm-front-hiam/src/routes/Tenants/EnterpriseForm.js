/**
 * tenants - 转为核企Modal
 * @date: 2023-3-14
 * @author: zlh
 * @version: 0.0.1
 * @copyright Copyright (c) 2023, Hand
 */
import React from 'react';
import { Form, Input } from 'hzero-ui';

import ModalForm from 'components/Modal/ModalForm';
import TLEditor from 'components/TLEditor';
import Lov from 'components/Lov';

import intl from 'utils/intl';
import { CODE } from 'utils/regExp';

/**
 * 转为核企模态框表单
 * @extends {ModalForm} - React.ModalForm
 * @reactProps {Function} handleAdd - 表单提交
 * @reactProps {Object} form - 表单对象
 * @return React.element
 */
@Form.create({ fieldNameProp: null })
export default class EnterpriseForm extends ModalForm {
  renderForm() {
    const { data = {}, form = {} } = this.props;
    const { getFieldDecorator = (e) => e, setFieldsValue } = form;
    const formLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 14 },
    };
    return (
      <>
        <Form.Item label={intl.get('entity.tenant.code').d('租户编码')} {...formLayout}>
          {getFieldDecorator('newTenantNum', {
            initialValue: data.newTenantNum,
            rules: [
              {
                required: true,
                message: intl.get('hzero.common.validation.notNull', {
                  name: intl.get('entity.tenant.code').d('租户编码'),
                }),
              },
              {
                pattern: CODE,
                message: intl
                  .get('hzero.common.validation.code')
                  .d('大小写及数字，必须以字母、数字开头，可包含“-”、“_”、“.”、“/”'),
              },
              {
                max: 30,
                message: intl.get('hzero.common.validation.max', {
                  max: 30,
                }),
              },
            ],
          })(<Input trim inputChinese={false} />)}
        </Form.Item>
        <Form.Item label={intl.get('entity.tenant.name').d('租户名称')} {...formLayout}>
          {getFieldDecorator('tenantName', {
            initialValue: data.tenantName,
            rules: [
              {
                // required: true,
                message: intl.get('hzero.common.validation.notNull', {
                  name: intl.get('entity.tenant.name').d('租户名称'),
                }),
              },
              {
                max: 30,
                message: intl.get('hzero.common.validation.max', {
                  max: 30,
                }),
              },
            ],
          })(
            <TLEditor
              label={intl.get('entity.tenant.name').d('租户名称')}
              field="tenantName"
              inputSize={{ zh: 64, en: 64 }}
              token={data._token}
              disabled
            />
          )}
        </Form.Item>
        <Form.Item
          label={intl.get('hiam.tenants.model.tenantAdmin').d('项目负责人')}
          {...formLayout}
        >
          {getFieldDecorator('tenantAdmin', {
            initialValue: data.tenantAdmin,
            rules: [
              {
                required: true,
                message: intl.get('hzero.common.validation.notNull', {
                  name: intl.get('hiam.tenants.model.tenantAdmin').d('项目负责人'),
                }),
              },
            ],
          })(<Input trim />)}
        </Form.Item>
        <Form.Item label={intl.get('hiam.tenants.model.mail').d('负责人邮箱')} {...formLayout}>
          {getFieldDecorator('adminEmail', {
            initialValue: data.adminEmail,
            rules: [
              {
                required: true,
                message: intl.get('hzero.common.validation.notNull', {
                  name: intl.get('hiam.tenants.model.mail').d('负责人邮箱'),
                }),
              },
            ],
          })(<Input trim inputChinese={false} />)}
        </Form.Item>
        <Form.Item
          label={intl.get('hiam.tenants.model.phoneNumber').d('负责人手机号码')}
          {...formLayout}
        >
          {getFieldDecorator('adminPhone', {
            initialValue: data.adminPhone,
            rules: [
              {
                required: true,
                message: intl.get('hzero.common.validation.notNull', {
                  name: intl.get('hzero.common.model.phoneNumber').d('负责人手机号码'),
                }),
              },
            ],
          })(<Input trim inputChinese={false} />)}
        </Form.Item>
        <Form.Item
          label={intl.get('entity.tenant.model.loginName').d('租户管理员帐号')}
          {...formLayout}
        >
          {getFieldDecorator('loginName', {
            initialValue: data.loginName,
            rules: [
              {
                required: true,
                message: intl.get('hzero.common.validation.notNull', {
                  name: intl.get('entity.tenant.model.loginName').d('租户管理员帐号'),
                }),
              },
            ],
          })(
            <Lov
              trim
              code="SSLM.TENANT_ACCOUNT_LOGIN_NAME"
              textField="name"
              textValue={data.loginName}
              queryParams={{ organizationId: data.tenantId }}
              onChange={(_, lovRecord) => {
                setFieldsValue({ name: lovRecord.name });
              }}
            />
          )}
        </Form.Item>
      </>
    );
  }
}
