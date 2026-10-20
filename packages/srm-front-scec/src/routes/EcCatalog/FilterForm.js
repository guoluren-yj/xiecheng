/**
 * ecCatalog -租户目录维护
 *
 * @date: 2019-2-2
 * @author zjx <jingxi.zhang@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { Form, Button, Input, Row, Col, Select } from 'hzero-ui';
import { Bind } from 'lodash-decorators';

import intl from 'utils/intl';

import CacheComponent from 'components/CacheComponent';

const FormItem = Form.Item;
const formLayout = {
  labelCol: { span: 10 },
  wrapperCol: { span: 14 },
};
@Form.create({ fieldNameProp: null })
@CacheComponent({ cacheKey: '/scec/ec-catalog' })
export default class FilterForm extends PureComponent {
  constructor(props) {
    super(props);
    props.onRef(this);
  }

  /**
   * 表单查询
   */
  @Bind()
  fetchEcCatalog() {
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
      enabledStatusList = [],
    } = this.props;
    return (
      <Form layout="inline" className="more-fields-form">
        <Row gutter={12}>
          <Col span={6}>
            <FormItem
              label={intl.get('scec.ecCatalog.model.ecCatalog.catalogCode').d('目录编码')}
              {...formLayout}
            >
              {getFieldDecorator('catalogCode')(<Input />)}
            </FormItem>
          </Col>
          <Col span={6}>
            <FormItem
              label={intl.get('scec.ecCatalog.model.ecCatalog.catalogName').d('目录名称')}
              {...formLayout}
            >
              {getFieldDecorator('catalogName')(<Input />)}
            </FormItem>
          </Col>
          <Col span={6}>
            <FormItem label={intl.get('hzero.common.status').d('状态')} {...formLayout}>
              {getFieldDecorator('enabledFlag')(
                <Select allowClear>
                  {enabledStatusList.map(item => (
                    <Select.Option key={item.value} value={item.value}>
                      {item.meaning}
                    </Select.Option>
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
              <Button type="primary" htmlType="submit" onClick={this.fetchEcCatalog}>
                {intl.get('hzero.common.button.search').d('查询')}
              </Button>
            </FormItem>
          </Col>
        </Row>
      </Form>
    );
  }
}
