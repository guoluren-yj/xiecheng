/**
 * FilterForm - 联系人查询
 * @date: 2020-2-24
 * @author: zjx <jingxi.zhang@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2020, Hand
 */
import React, { PureComponent } from 'react';
import { Form, Input, Button, Row, Col } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { isFunction } from 'lodash';
import cacheComponent from 'components/CacheComponent';

import intl from 'utils/intl';

const formLayout = {
  labelCol: { span: 10 },
  wrapperCol: { span: 14 },
};

@Form.create({ fieldNameProp: null })
@cacheComponent()
export default class FilterForm extends PureComponent {
  constructor(props) {
    super(props);
    if (isFunction(props.onRef)) {
      props.onRef(this);
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
    const { onHandleSearch, form } = this.props;
    const { getFieldDecorator } = form;
    return (
      <Form layout="inline" className="more-fields-form">
        <Row gutter={12}>
          <Col span={18}>
            <Row>
              <Col span={8}>
                <Form.Item label={intl.get(`entity.supplier.code`).d('供应商编码')} {...formLayout}>
                  {getFieldDecorator('supplierCompanyCode')(<Input />)}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label={intl.get(`entity.supplier.name`).d('供应商名称')} {...formLayout}>
                  {getFieldDecorator('supplierCompanyName')(<Input />)}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={intl.get('spfm.businessOrder.model.businessOrder.contactId').d('联系人')}
                  {...formLayout}
                >
                  {getFieldDecorator('contactName')(<Input />)}
                </Form.Item>
              </Col>
            </Row>
            <Row>
              <Col span={8}>
                <Form.Item
                  label={intl
                    .get('spfm.businessOrder.model.businessOrder.contactPhone')
                    .d('联系电话')}
                  {...formLayout}
                >
                  {getFieldDecorator('contactPhone')(<Input />)}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label={intl.get('hzero.common.email').d('邮箱')} {...formLayout}>
                  {getFieldDecorator('contactEmail')(<Input />)}
                </Form.Item>
              </Col>
            </Row>
          </Col>
          <Col span={6} className="search-btn-more">
            <Form.Item>
              <Button onClick={this.handleFormReset}>
                {intl.get('hzero.common.button.reset').d('重置')}
              </Button>
              <Button type="primary" htmlType="submit" onClick={() => onHandleSearch()}>
                {intl.get('hzero.common.button.search').d('查询')}
              </Button>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    );
  }
}
