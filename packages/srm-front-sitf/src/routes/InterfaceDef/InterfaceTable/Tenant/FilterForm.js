/**
 * InterfaceTableModal -接口表结构定义 -form 表单头部分
 * @date: 2018-11-28
 * @author DTM <tingmin.deng@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { Form, Input, Row, Col } from 'hzero-ui';

import intl from 'utils/intl';

const FormItem = Form.Item;
const formLayout = {
  labelCol: { span: 10 },
  wrapperCol: { span: 14 },
};

@Form.create({ fieldNameProp: null })
export default class filterForm extends PureComponent {
  render() {
    const {
      form: { getFieldDecorator },
      interfaceCode,
      interfaceName,
    } = this.props;
    return (
      <Form layout="inline" className="more-fields-form">
        <Row gutter={12}>
          <Col span={6}>
            <FormItem {...formLayout} label={intl.get('entity.interface.code').d('接口代码')}>
              {getFieldDecorator('interfaceCode', {
                initialValue: interfaceCode,
              })(<Input disabled />)}
            </FormItem>
          </Col>
          <Col span={6}>
            <FormItem {...formLayout} label={intl.get('entity.interface.name').d('接口名称')}>
              {getFieldDecorator('interfaceName', {
                initialValue: interfaceName,
              })(<Input disabled />)}
            </FormItem>
          </Col>
        </Row>
      </Form>
    );
  }
}
