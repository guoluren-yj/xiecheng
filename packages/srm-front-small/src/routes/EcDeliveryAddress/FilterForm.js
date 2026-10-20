/**
 * EcDeliveryAddress -收货地址
 * @date: 2019-1-25
 * @author zjx <jingxi.zhang@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { Form, Button, Input, Select, Row, Col } from 'hzero-ui';
import { Bind } from 'lodash-decorators';

import intl from 'utils/intl';

import CacheComponent from 'components/CacheComponent';

const { Option } = Select;
const FormItem = Form.Item;
const formLayout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
};
@Form.create({ fieldNameProp: null })
@CacheComponent({ cacheKey: '/small/ec-delivery-address' })
export default class FilterForm extends PureComponent {
  constructor(props) {
    super(props);
    props.onRef(this);
  }

  /**
   * 表单查询
   */
  @Bind()
  fetchEcDeliveryAddressList() {
    const { form, onFetchData } = this.props;
    form.validateFields((err, values) => {
      if (!err) {
        onFetchData({
          ...values,
        });
      }
    });
  }

  /**
   * 表单重置
   */
  @Bind()
  reset() {
    const { form } = this.props;
    form.resetFields();
  }

  render() {
    const {
      form: { getFieldDecorator },
    } = this.props;
    const flags = [
      {
        value: 1,
        meaning: intl.get('small.common.model.yes').d('是'),
      },
      {
        value: 0,
        meaning: intl.get('small.common.model.no').d('否'),
      },
    ];
    return (
      <Form layout="inline" className="more-fields-form">
        <Row gutter={12}>
          <Col span={6}>
            <FormItem label={intl.get('small.common.model.contact').d('联系人')} {...formLayout}>
              {getFieldDecorator('contactName')(<Input />)}
            </FormItem>
          </Col>
          <Col span={6}>
            <FormItem
              label={intl.get('small.common.model.isornoEnabledFlag').d('是否启用')}
              {...formLayout}
            >
              {getFieldDecorator('enabledFlag')(
                <Select allowClear>
                  {flags.map(item => (
                    <Option value={item.value} key={item.value}>
                      {item.meaning}
                    </Option>
                  ))}
                </Select>
              )}
            </FormItem>
          </Col>
          <Col span={6} className="search-btn-more">
            <FormItem>
              <Button style={{ marginRight: 8 }} onClick={this.reset}>
                {intl.get('hzero.common.button.reset').d('重置')}
              </Button>
              <Button type="primary" htmlType="submit" onClick={this.fetchEcDeliveryAddressList}>
                {intl.get('hzero.common.button.search').d('查询')}
              </Button>
            </FormItem>
          </Col>
          <Col span={6} />
        </Row>
      </Form>
    );
  }
}
