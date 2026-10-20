/**
 * AddressModal - 收货地址配置 - Modal
 * @date: 2019-2-10
 * @author: ZZ <qizheng.wu@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2019, Hand
 */
import React, { PureComponent } from 'react';
import { Bind } from 'lodash-decorators';
import { Form, Input, Row, Col, Button, Select } from 'hzero-ui';

import intl from 'utils/intl';

const { Option } = Select;

@Form.create({ fieldNameProp: null })
export default class FilterForm extends PureComponent {
  constructor(props) {
    super(props);
    props.onRef(this);
  }

  @Bind()
  reset() {
    const { form } = this.props;
    form.resetFields();
  }

  /**
   * 表单查询
   */
  @Bind()
  fetchData() {
    const { form, onFetchModalData } = this.props;
    form.validateFields((err, values) => {
      if (!err) {
        onFetchModalData({
          ...values,
        });
      }
    });
  }

  render() {
    const {
      form: { getFieldDecorator },
    } = this.props;
    return (
      <Form layout="inline" className="more-fields-form">
        <Row gutter={12}>
          <Col span={6}>
            <Form.Item label={intl.get('small.common.view.contact').d('联系人')}>
              {getFieldDecorator('contactName')(<Input />)}
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item label={intl.get('hzero.common.button.status').d('状态')}>
              {getFieldDecorator('enabledFlag')(
                <Select allowClear style={{ width: '150px' }}>
                  <Option key={1} value={1}>
                    {intl.get('hzero.common.status.enable').d('启用')}
                  </Option>
                  <Option key={0} value={0}>
                    {intl.get('hzero.common.status.disable').d('禁用')}
                  </Option>
                </Select>
              )}
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item label={intl.get('small.common.view.type').d('类型')}>
              {getFieldDecorator('belongType')(
                <Select allowClear style={{ width: '150px' }}>
                  <Option key="COMPANY" value="1">
                    {intl.get('small.common.model.company').d('公司')}
                  </Option>
                  <Option key="PERSON" value="2">
                    {intl.get('small.common.model.person').d('个人')}
                  </Option>
                </Select>
              )}
            </Form.Item>
          </Col>
          <Col span={6} className="search-btn-more">
            <Form.Item>
              <Button style={{ marginRight: 8 }} onClick={this.reset}>
                {intl.get('hzero.common.button.reset').d('重置')}
              </Button>
              <Button type="primary" htmlType="submit" onClick={this.fetchData}>
                {intl.get('hzero.common.button.search').d('查询')}
              </Button>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    );
  }
}
