/**
 * Search - 我发出的订单 - 明细页面表格
 * @date: 2019-01-21
 * @author: lijun <jun.li06@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { Form, Input, Button, Row, Col } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';
import ValueList from 'components/ValueList';

const FormItem = Form.Item;

@Form.create({ fieldNameProp: null })
export default class Search extends PureComponent {
  constructor(props) {
    super(props);
    // 方法注册
    ['onClick', 'onReset'].forEach(method => {
      this[method] = this[method].bind(this);
    });

    this.state = { expand: false };
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

  /**
   * 展开/折叠
   */
  @Bind()
  handleToggle() {
    const { expand } = this.state;
    this.setState({ expand: !expand });
  }

  render() {
    const {
      form: { getFieldDecorator = e => e },
    } = this.props;
    const { expand } = this.state;
    const formItemLayout = {
      labelCol: {
        span: 10,
      },
      wrapperCol: {
        span: 14,
      },
      style: {
        width: '100%',
      },
    };
    return (
      <Form layout="inline" className="more-fields-search-form">
        <Row gutter={24}>
          <Col span={18}>
            <Row>
              <Col span={6}>
                <FormItem
                  label={intl
                    .get('spfm.supplierKpiIndicator.model.supplier.indicatorCode')
                    .d('指标编码')}
                  {...formItemLayout}
                >
                  {getFieldDecorator('indicatorCode')(<Input />)}
                </FormItem>
              </Col>
              <Col span={6}>
                <FormItem
                  label={intl
                    .get('spfm.supplierKpiIndicator.model.supplier.indicatorName')
                    .d('指标名称')}
                  {...formItemLayout}
                >
                  {getFieldDecorator('indicatorName')(<Input />)}
                </FormItem>
              </Col>
              <Col span={6}>
                <FormItem
                  label={intl
                    .get('sslm.common.model.supplierKpiIndicator.indicatorType')
                    .d('指标类型')}
                  {...formItemLayout}
                >
                  {getFieldDecorator('indicatorType')(
                    <ValueList
                      style={{ width: '100%' }}
                      lovCode="SSLM.KPI_INDICATOR_TYPE"
                      allowClear
                    />
                  )}
                </FormItem>
              </Col>
              <Col span={6}>
                <FormItem
                  label={intl
                    .get('spfm.supplierKpiIndicator.model.supplier.enabledFlag')
                    .d('是否启用')}
                  {...formItemLayout}
                >
                  {getFieldDecorator('enabledFlag', {
                    initialValue: '1',
                  })(
                    <ValueList
                      style={{ width: '100%' }}
                      lovCode="HPFM.ENABLED_FLAG"
                      allowClear
                      lazyLoad={false}
                    />
                  )}
                </FormItem>
              </Col>
            </Row>
            <Row style={{ display: expand ? 'block' : 'none' }}>
              <Col span={6}>
                <FormItem
                  label={intl
                    .get('spfm.supplierKpiIndicator.model.supplier.scoreType')
                    .d('评分方式')}
                  {...formItemLayout}
                >
                  {getFieldDecorator('scoreType')(
                    <ValueList style={{ width: '100%' }} lovCode="SPFM.KPI_SCORE_TYPE" allowClear />
                  )}
                </FormItem>
              </Col>
            </Row>
          </Col>
          <Col span={6} className="search-btn-more">
            <FormItem>
              <Button onClick={this.handleToggle}>
                {expand
                  ? intl.get('hzero.common.button.collected').d('收起查询')
                  : intl.get('hzero.common.button.viewMore').d('更多查询')}
              </Button>
              <Button onClick={this.onReset} style={{ marginLeft: 12 }}>
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
