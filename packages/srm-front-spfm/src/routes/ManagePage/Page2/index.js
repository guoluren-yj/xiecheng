import React, { Component } from 'react';
import { Form, Input, Button, notification, Checkbox } from 'hzero-ui';
import { Header, Content } from 'components/Page';
import { getCurrentUser } from 'utils/utils';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import request from 'hzero-front/lib/utils/request';

const FormItem = Form.Item;
const formItemLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 8 },
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 16 },
  },
};
const tailFormItemLayout = {
  wrapperCol: {
    xs: {
      span: 24,
      offset: 0,
    },
    sm: {
      span: 16,
      offset: 8,
    },
  },
};
@formatterCollections({
  code: ['spfm.managePage', 'hzero.common', 'spfm.customerConfiguration', 'spfm.configServer'],
})
@Form.create({ fieldNameProp: null })
export default class Detail extends Component {
  state = {
    loading: false,
  };

  user = getCurrentUser();

  commit = () => {
    this.props.form.validateFields((err, values) => {
      if (err) return;
      this.setState({ loading: true });
      request(`/iam/v1/srm/tool/data-fix/fix-role-permission`, {
        body: values,
        method: 'POST',
      })
        .then((res) => {
          if (res && !res.failed && res === 'OK') {
            notification.success();
          }
        })
        .finally(() => this.setState({ loading: false }));
    });
  };

  /**
   * render
   * @returns React.element
   */
  render() {
    const { form } = this.props;
    if (this.user.loginName !== 'admin') return null;
    return (
      <>
        <Header title={intl.get('spfm.managePage.header.title.configPage').d('内部配置页面')} />
        <Content>
          <Form style={{ width: '50%' }}>
            <FormItem
              {...formItemLayout}
              label={intl.get('spfm.customerConfiguration.view.message.tenantNum').d('租户编码')}
            >
              {form.getFieldDecorator('tenantCode', {
                rules: [
                  {
                    required: true,
                  },
                ],
              })(<Input />)}
            </FormItem>
            <FormItem
              {...formItemLayout}
              label={intl.get('spfm.configServer.model.purchaser.roleCode').d('角色编码')}
            >
              {form.getFieldDecorator('roleCode', {
                rules: [
                  {
                    required: true,
                  },
                ],
              })(<Input />)}
            </FormItem>
            <FormItem
              {...formItemLayout}
              label={intl.get('spfm.managePage.model.title.extendRoleCode').d('继承角色租户编码')}
            >
              {form.getFieldDecorator('inheritedTenantCode')(<Input />)}
            </FormItem>
            <FormItem
              {...formItemLayout}
              label={intl.get('spfm.managePage.model.title.forceDeletion').d('是否强制删除')}
            >
              {form.getFieldDecorator('forceDeletePermission', {
                initialValue: false,
                valuePropName: 'checked',
              })(<Checkbox />)}
            </FormItem>
            <FormItem {...tailFormItemLayout}>
              <Button type="primary" onClick={this.commit} loading={this.state.loading}>
                {intl.get('hzero.common.model.submit').d('提交')}
              </Button>
            </FormItem>
          </Form>
        </Content>
      </>
    );
  }
}
