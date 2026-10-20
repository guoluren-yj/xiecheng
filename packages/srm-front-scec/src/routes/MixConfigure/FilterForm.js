/**
 * maxConfigure - form
 * @date: 2020-01-10
 * @author lx <xia.li@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2019, Hand
 */

import React, { Component } from 'react';
import { Form, Input, Button, Row, Col } from 'hzero-ui';
import { Bind } from 'lodash-decorators';

import intl from 'utils/intl';
import CacheComponent from 'components/CacheComponent';

const FormItem = Form.Item;
const formLayout = {
  labelCol: { span: 10 },
  wrapperCol: { span: 14 },
};
const commonKey = 'scec.common';

@Form.create({ fieldNameProp: null })
@CacheComponent({ cacheKey: '/scec/mall-resource' })
export default class FilterForm extends Component {
  constructor(props) {
    super(props);
    props.onRef(this);
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
      findConfigureList,
      form: { getFieldDecorator },
    } = this.props;
    return (
      <Form>
        <Row gutter={12}>
          <Col span={6}>
            <FormItem label={intl.get(`${commonKey}.view.tenantNum`).d('租户编号')} {...formLayout}>
              {getFieldDecorator('tenantNum')(<Input />)}
            </FormItem>
          </Col>
          <Col span={6}>
            <FormItem
              label={intl.get(`${commonKey}.view.tenantName`).d('租户名称')}
              {...formLayout}
            >
              {getFieldDecorator('tenantName')(<Input />)}
            </FormItem>
          </Col>
          <Col span={6} className="search-btn-more">
            <FormItem>
              <Button style={{ marginRight: 8 }} onClick={this.reset}>
                {intl.get('hzero.common.button.reset').d('重置')}
              </Button>
              <Button type="primary" onClick={findConfigureList}>
                {intl.get('hzero.common.button.search').d('查询')}
              </Button>
            </FormItem>
          </Col>
        </Row>
      </Form>
    );
  }
}
