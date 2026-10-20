import React, { PureComponent } from 'react';
import { Form, Button, Input } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';

const FormItem = Form.Item;

/**
 * 查询表单
 * @extends {PureComponent} - React.PureComponent
 * @reactProps {Function} onSearch - 表单查询
 * @reactProps {Object} form - 表单对象
 * @return React.element
 */
@Form.create({ fieldNameProp: null })
export default class FilterForm extends PureComponent {
  componentDidMount() {
    this.props.onRef(this);
  }

  /**
   * 查询
   */
  @Bind()
  handleSearch() {
    const { onSearch, form } = this.props;
    if (onSearch) {
      form.validateFields((err) => {
        if (!err) {
          // 如果验证成功,则执行onSearch
          onSearch();
        }
      });
    }
  }

  /**
   * 重置
   */
  @Bind()
  handleFormReset() {
    this.props.form.resetFields();
  }

  /**
   * render
   * @returns React.element
   */
  render() {
    const {
      form: { getFieldDecorator },
    } = this.props;
    return (
      <Form layout="inline">
        <FormItem
          label={intl.get('spfm.emailReceiveUser.model.emailReceiveUser.loginName').d('账号')}
        >
          {getFieldDecorator('loginName')(<Input style={{ width: 150 }} />)}
        </FormItem>
        <FormItem
          label={intl.get('spfm.emailReceiveUser.model.emailReceiveUser.realName').d('用户名')}
        >
          {getFieldDecorator('realName')(<Input style={{ width: 150 }} />)}
        </FormItem>
        <FormItem label={intl.get('spfm.emailReceiveUser.model.emailReceiveUser.email').d('邮箱')}>
          {getFieldDecorator('email')(<Input style={{ width: 150 }} />)}
        </FormItem>
        <FormItem>
          <Button onClick={this.handleFormReset}>
            {intl.get('hzero.common.button.reset').d('重置')}
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            style={{ marginLeft: 8 }}
            onClick={() => this.handleSearch()}
          >
            {intl.get('hzero.common.button.search').d('查询')}
          </Button>
        </FormItem>
      </Form>
    );
  }
}
