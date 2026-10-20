/**
 * ProcessorMonitor -前置机监控页面 查询页面
 * @date: 2018-9-14
 * @author dengtingmin <tingmin.deng@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { PureComponent, Fragment } from 'react';
import { Form, Button, Row, Col, Select, Icon } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';

import Lov from 'components/Lov';

const { Option } = Select;
@Form.create({ fieldNameProp: null })
export default class FilterFrom extends PureComponent {
  constructor(props) {
    super(props);
    props.onRef(this);
    this.state = {
      expand: true, // 展开收起
    };
  }

  @Bind()
  toggle() {
    const { expand } = this.state;
    this.setState({ expand: !expand });
  }

  @Bind()
  queryByCondition() {
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
  queryReset() {
    const { form } = this.props;
    form.resetFields();
  }

  render() {
    const {
      form: { getFieldDecorator },
      queryCode = [],
    } = this.props;
    const { expand } = this.state;

    const formlayout = {
      labelCol: { span: 10 },
      wrapperCol: { span: 14 },
    };
    return (
      <div className="table-list-search">
        <Fragment>
          <Form layout="inline" className="more-fields-form">
            <Row>
              <Col span={18}>
                <Row>
                  <Col span={8}>
                    <Form.Item
                      label={intl
                        .get('sitf.processorMonitor.model.processorMonitor.productLine')
                        .d('产品线名称')}
                      {...formlayout}
                    >
                      {getFieldDecorator('productLine')(
                        <Lov code="SIFC.PRODUCT_LINE" textField="productLineName" />
                      )}
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      label={intl
                        .get('sitf.processorMonitor.model.processorMonitor.applicationGroup')
                        .d('应用组名称')}
                      {...formlayout}
                    >
                      {getFieldDecorator('applicationGroup')(
                        <Lov code="SIFC.APPLICATION_GROUPS" textField="applicationGroupName" />
                      )}
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      label={intl
                        .get('sitf.processorMonitor.model.processorMonitor.frontEndSystemCode')
                        .d('前置机')}
                      {...formlayout}
                    >
                      {getFieldDecorator('frontEndSystemCode')(
                        <Lov code="SIFC.FRONT_END_SYSTEM" textField="frontEndSystemCode" />
                      )}
                    </Form.Item>
                  </Col>
                </Row>
                <Row style={{ display: expand ? 'none' : 'block' }}>
                  <Col span={8}>
                    <Form.Item
                      label={intl
                        .get('sitf.processorMonitor.model.processorMonitor.status')
                        .d('状态')}
                      {...formlayout}
                    >
                      {getFieldDecorator('status')(
                        <Select allowClear>
                          {queryCode.map(item => {
                            return (
                              <Option label={item.meaning} value={item.value} key={item.value}>
                                {item.meaning}
                              </Option>
                            );
                          })}
                        </Select>
                      )}
                    </Form.Item>
                  </Col>
                </Row>
              </Col>
              <Col span={6} className="search-btn-more">
                <Form.Item>
                  <Button
                    style={{ display: expand ? 'inline-block' : 'none' }}
                    onClick={this.toggle}
                  >
                    {intl.get(`sitf.common.button.more.inquire`).d('更多查询')}
                  </Button>
                  <Button
                    style={{ display: expand ? 'none' : 'inline-block' }}
                    onClick={this.toggle}
                  >
                    {intl.get(`sitf.common.button.more.inquire`).d('收起查询')}
                  </Button>
                  <Button data-code="reset" style={{ marginLeft: 8 }} onClick={this.queryReset}>
                    {intl.get('hzero.common.button.reset').d('重置')}
                  </Button>
                  <Button
                    data-code="search"
                    type="primary"
                    htmlType="submit"
                    onClick={this.queryByCondition}
                  >
                    {intl.get('hzero.common.button.search').d('查询')}
                  </Button>
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </Fragment>
      </div>
    );
  }
}
