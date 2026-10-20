/**
 * Search - 我发出的订单 - 明细页面表格
 * @date: 2019-01-21
 * @author: lijun <jun.li06@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { Form, Input, Button, Row, Col } from 'hzero-ui';
import intl from 'utils/intl';

const FormItem = Form.Item;

@Form.create({ fieldNameProp: null })
export default class Search extends PureComponent {
  constructor(props) {
    super(props);
    // 方法注册
    ['onClick', 'onReset'].forEach(method => {
      this[method] = this[method].bind(this);
    });
  }

  /**
   * onClick - 查询按钮事件
   */
  onClick() {
    const {
      fetchList = e => e,
      form: { getFieldsValue = e => e },
    } = this.props;
    const data = getFieldsValue() || {};
    fetchList({
      ...data,
    });
  }

  /**
   * onReset - 重置按钮事件
   */
  onReset() {
    const {
      form: { resetFields = e => e },
    } = this.props;
    resetFields();
  }

  render() {
    const {
      form: { getFieldDecorator = e => e },
    } = this.props;
    return (
      <Form layout="inline" className="more-fields-search-form">
        <Row gutter={12}>
          <Col span={6}>
            <FormItem
              label={intl
                .get('spfm.supplierKpiIndicator.model.supplierKpiIndicator.code')
                .d('指标编码')}
            >
              {getFieldDecorator('indicatorCode')(<Input />)}
            </FormItem>
          </Col>
          <Col span={6}>
            <FormItem
              label={intl
                .get('spfm.supplierKpiIndicator.model.supplierKpiIndicator.name')
                .d('指标名称')}
            >
              {getFieldDecorator('indicatorName')(<Input />)}
            </FormItem>
          </Col>
          <Col span={6} className="search-btn-more">
            <FormItem>
              <Button onClick={this.onReset}>
                {intl.get('hzero.common.button.reset').d('重置')}
              </Button>
              <Button type="primary" htmlType="submit" onClick={this.onClick}>
                {intl.get('hzero.common.button.search').d('查询')}
              </Button>
            </FormItem>
          </Col>
        </Row>
      </Form>
    );
  }
}
