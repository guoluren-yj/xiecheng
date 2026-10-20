/**
 * InterTableDef -接口表结构定义 查询部分
 * @date: 2018-11-23
 * @author DTM <tingmin.deng@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { Bind } from 'lodash-decorators';
import { Form, Button, Select, Row, Col } from 'hzero-ui';

import intl from 'utils/intl';

import Lov from 'components/Lov';

const FormItem = Form.Item;
const { Option } = Select;
const formlayout = {
  labelCol: { span: 10 },
  wrapperCol: { span: 14 },
};
@Form.create({ fieldNameProp: null })
export default class FitlerForm extends PureComponent {
  constructor(props) {
    super(props);
    props.onRef(this);
  }

  @Bind()
  fetchInterfaceDef() {
    const { form, onFetchData } = this.props;
    form.validateFields((err, values) => {
      if (!err) {
        onFetchData({
          ...values,
        });
      }
    });
  }

  @Bind()
  handleReset() {
    const { form } = this.props;
    form.resetFields();
  }

  render() {
    const {
      form: { getFieldDecorator },
      code = {},
    } = this.props;
    return (
      <Form layout="inline" className="more-fields-form">
        <Row gutter={12}>
          <Col span={6}>
            <FormItem
              label={intl
                .get(`sitf.interTableDef.model.interTableDef.erpSystemType`)
                .d('外部系统类别')}
              {...formlayout}
            >
              {getFieldDecorator('erpSystemType')(
                <Select allowClear style={{ width: '150px' }}>
                  {(code || []).map(n =>
                    (n || {}).value ? (
                      <Option key={n.value} value={n.value}>
                        {n.meaning}
                      </Option>
                    ) : (
                      undefined
                    )
                  )}
                </Select>
              )}
            </FormItem>
          </Col>
          <Col span={6}>
            <FormItem label={intl.get(`entity.interface.tag`).d('接口')} {...formlayout}>
              {getFieldDecorator('interfaceId')(
                <Lov
                  allowClear
                  code="SITF.INTERFACE"
                  textField="interfaceName"
                  style={{ width: '150px' }}
                />
              )}
            </FormItem>
          </Col>
          <Col span={6} className="search-btn-more">
            <FormItem>
              <Button onClick={this.handleReset}>
                {intl.get('hzero.common.button.reset').d('重置')}
              </Button>
              <Button type="primary" htmlType="submit" onClick={this.fetchInterfaceDef}>
                {intl.get('hzero.common.button.search').d('查询')}
              </Button>
            </FormItem>
          </Col>
        </Row>
      </Form>
    );
  }
}
