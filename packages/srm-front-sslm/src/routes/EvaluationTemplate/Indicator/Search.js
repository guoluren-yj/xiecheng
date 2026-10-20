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
import ValueList from 'components/ValueList';
import formatterCollections from 'utils/intl/formatterCollections';

const FormItem = Form.Item;

@formatterCollections({ code: ['spfm.supplierKpiIndicator'] })
@Form.create({ fieldNameProp: null })
export default class Search extends PureComponent {
  constructor(props) {
    super(props);
    const { wrappedComponentRef = (e) => e } = props;
    wrappedComponentRef(this);
    // 方法注册
    ['onClick', 'onReset'].forEach((method) => {
      this[method] = this[method].bind(this);
    });
  }

  /**
   * onClick - 查询按钮事件
   */
  onClick() {
    const {
      fetchList = (e) => e,
      form: { getFieldsValue = (e) => e },
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
      form: { resetFields = (e) => e },
    } = this.props;
    resetFields();
  }

  render() {
    const {
      form: { getFieldDecorator = (e) => e },
    } = this.props;
    const formItemLayout = {
      labelCol: { span: 8 },
      wrapperCol: { span: 16 },
      style: { width: '100%' },
    };
    return (
      <Form layout="inline">
        <Row gutter={24}>
          <Col span={8}>
            <FormItem
              {...formItemLayout}
              label={intl
                .get('spfm.supplierKpiIndicator.model.supplier.indicatorCode')
                .d('指标编码')}
            >
              {getFieldDecorator('indicatorCode')(<Input />)}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              {...formItemLayout}
              label={intl
                .get('spfm.supplierKpiIndicator.model.supplier.indicatorName')
                .d('指标名称')}
            >
              {getFieldDecorator('indicatorName')(<Input />)}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem style={{ marginLeft: 8, marginRight: 8 }}>
              <Button onClick={this.onReset}>
                {intl.get('hzero.common.button.reset').d('重置')}
              </Button>
            </FormItem>
            <FormItem>
              <Button type="primary" htmlType="submit" onClick={this.onClick}>
                {intl.get('hzero.common.button.search').d('查询')}
              </Button>
            </FormItem>
          </Col>
        </Row>
        <Row gutter={24}>
          <Col span={8}>
            <FormItem
              {...formItemLayout}
              label={intl.get('sslm.evaluationQuery.score.indicatorType').d('指标类型')}
            >
              {getFieldDecorator('indicatorType')(<ValueList lovCode="SSLM.KPI_INDICATOR_TYPE" />)}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              {...formItemLayout}
              label={intl.get('sslm.commonApplication.model.accountSet.enabledFlag').d('是否启用')}
            >
              {getFieldDecorator('enabledFlag')(<ValueList lovCode="HPFM.ENABLED_FLAG" />)}
            </FormItem>
          </Col>
        </Row>
      </Form>
    );
  }
}
