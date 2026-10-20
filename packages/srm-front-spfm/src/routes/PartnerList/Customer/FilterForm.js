/**
 * FilterForm -我的客户页头部
 * @date: 2019-12-13
 * @author wxm <xiaomin.wang01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2019, Hand
 */
import React, { PureComponent } from 'react';
import { Form, Input, Row, Col, DatePicker, Button } from 'hzero-ui';

import intl from 'utils/intl';
import { Bind } from 'lodash-decorators';

const formLayout = {
  labelCol: { span: 10 },
  wrapperCol: { span: 14 },
};
const FormItem = Form.Item;

@Form.create({ fieldNameProp: null })
export default class FilterForm extends PureComponent {
  constructor(props) {
    super(props);
    const { bindForm, form } = this.props;
    bindForm(form);
    this.state = {
      expand: false,
    };
  }

  /**
   * onReset - 重置按钮事件
   */
  @Bind()
  onReset() {
    const {
      form: { resetFields },
    } = this.props;
    resetFields();
  }

  /**
   * 折叠或展开查询表单
   */
  @Bind()
  handleToggle() {
    this.setState((state) => ({
      expand: !state.expand,
    }));
  }

  /**
   * render
   */
  render() {
    const { form, fetchList, customizeFilterForm, code = '', custLoading } = this.props;
    const { getFieldDecorator } = form;
    const { expand } = this.state;

    return customizeFilterForm(
      {
        code, // 单元编码，必传
        form,
        expand, // 控制查询表单收起展开状态的参数
      },
      <Form layout="inline" className="more-fields-form" custLoading={custLoading}>
        <Row gutter={24}>
          <Col span={18}>
            <Row>
              <Col span={6}>
                <FormItem
                  {...formLayout}
                  label={intl
                    .get('spfm.customer.model.customer.platformCompanyNum')
                    .d('平台客户编码')}
                >
                  {getFieldDecorator('customCompanyNum')(<Input />)}
                </FormItem>
              </Col>
              <Col span={6}>
                <FormItem
                  {...formLayout}
                  label={intl
                    .get('spfm.customer.model.customer.platformCompanyName')
                    .d('平台客户名称')}
                >
                  {getFieldDecorator('customCompanyName')(<Input dbc2sbc={false} />)}
                </FormItem>
              </Col>
              <Col span={6}>
                <FormItem
                  {...formLayout}
                  label={intl.get('spfm.customer.model.customer.startDate').d('合作开始日期')}
                >
                  {getFieldDecorator('startDate')(
                    <DatePicker placeholder={null} style={{ width: '100%' }} />
                  )}
                </FormItem>
              </Col>
            </Row>
          </Col>
          <Col span={6} className="search-btn-more">
            <Form.Item>
              <Button onClick={this.handleToggle}>
                {!expand
                  ? intl.get(`hzero.common.button.viewMore`).d('更多查询')
                  : intl.get('hzero.common.button.collected').d('收起查询')}
              </Button>
              <Button data-code="reset" onClick={this.onReset} style={{ marginLeft: '10px' }}>
                {intl.get('hzero.common.button.reset').d('重置')}
              </Button>
              <Button
                type="primary"
                style={{ marginLeft: '15px' }}
                htmlType="submit"
                onClick={() => fetchList(form)}
              >
                {intl.get('hzero.common.button.search').d('查询')}
              </Button>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    );
  }
}
