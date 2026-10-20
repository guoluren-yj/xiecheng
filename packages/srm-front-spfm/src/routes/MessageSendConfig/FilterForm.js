import React, { PureComponent, Fragment } from 'react';
import { Form, Button } from 'hzero-ui';
import Lov from 'components/Lov';
import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';

/**
 * 查询表单
 * @extends {PureComponent} - React.PureComponent
 * @reactProps {Function} handleSearch - 查询
 * @return React.element
 */
@Form.create({ fieldNameProp: null })
export default class FilterForm extends PureComponent {
  constructor(props) {
    super(props);
    props.onRef(this);
  }

  /**
   * 查询
   */
  @Bind()
  handleSearch() {
    const { onSearch, form } = this.props;
    if (onSearch) {
      form.validateFields(err => {
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
      tenantId,
    } = this.props;
    return (
      <Fragment>
        <Form layout="inline">
          <Form.Item label={intl.get('entity.tenant.tag').d('租户')}>
            {getFieldDecorator('tenantId')(<Lov code="HPFM.TENANT" textField="tenantName" />)}
          </Form.Item>
          <Form.Item
            label={intl.get('spfm.messageSendConfig.model.receiver.messageName').d('消息名称')}
          >
            {getFieldDecorator('messageCode')(
              <Lov code="SPFM.MESSAGE_CODE" queryParams={{ tenantId }} />
            )}
          </Form.Item>
          <Form.Item>
            <Button data-code="reset" onClick={this.handleFormReset}>
              {intl.get('hzero.common.status.reset').d('重置')}
            </Button>
            <Button
              data-code="search"
              type="primary"
              style={{ marginLeft: 8 }}
              htmlType="submit"
              onClick={this.handleSearch}
            >
              {intl.get('hzero.common.status.search').d('查询')}
            </Button>
          </Form.Item>
        </Form>
      </Fragment>
    );
  }
}
