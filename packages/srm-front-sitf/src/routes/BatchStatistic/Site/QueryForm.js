/**
 * QueryForm - 接口批次统计 - 查询表单
 * @date: 2018-11-26
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { Form, DatePicker, Button, Row, Col } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import moment from 'moment';
import Lov from 'components/Lov';
import intl from 'utils/intl';
import { getDateTimeFormat } from 'utils/utils';

/**
 * 使用 Form.Item 组件
 */
const FormItem = Form.Item;

/**
 * 查询表单
 * @extends {Component} - React.Component
 * @reactProps {Object} loading - 数据加载是否完成
 * @reactProps {Object} form - 表单对象
 * @return React.element
 */
@Form.create({ fieldNameProp: null })
export default class QueryForm extends PureComponent {
  constructor(props) {
    super(props);
    props.onRef(this);
    this.state = {
      expand: true,
    };
  }

  /**
   * 表单重置
   */
  @Bind()
  handleFormReset() {
    const { form } = this.props;
    form.resetFields();
  }

  /**
   * 查询数据
   */
  @Bind()
  queryData() {
    const { onQueryBatchStatistic, form } = this.props;
    form.validateFields((err) => {
      if (!err) {
        if (onQueryBatchStatistic) {
          onQueryBatchStatistic();
        }
      }
    });
  }

  // 是否展开
  @Bind()
  toggle() {
    const { expand } = this.state;
    this.setState({ expand: !expand });
  }

  /**
   * 渲染查询结构
   * @returns
   */
  render() {
    const { getFieldDecorator, getFieldValue } = this.props.form;
    const formLayout = {
      labelCol: { span: 10 },
      wrapperCol: { span: 14 },
    };
    const { expand } = this.state;
    return (
      <div className="table-list-search">
        <Form className="more-fields-form">
          <Row>
            <Col span={18}>
              <Row>
                <Col span={8}>
                  <FormItem label={intl.get('entity.tenant.name').d('租户名称')} {...formLayout}>
                    {getFieldDecorator('tenantId', {
                      rules: [
                        {
                          required: true,
                          message: intl.get('hzero.common.validation.notNull', {
                            name: intl.get('entity.tenant.name').d('租户名称'),
                          }),
                        },
                      ],
                    })(<Lov allowClear code="SITF.MONITOR_SYSTEM.TENANT" textField="tenantName" />)}
                  </FormItem>
                </Col>
                <Col span={8}>
                  <FormItem
                    label={intl
                      .get('sitf.batchStatistic.model.batchStatistic.startDate')
                      .d('时间从')}
                    {...formLayout}
                  >
                    {getFieldDecorator(
                      'startDate',
                      {}
                    )(
                      <DatePicker
                        showTime
                        format={getDateTimeFormat()}
                        placeholder=""
                        disabledDate={(currentDate) =>
                          getFieldValue('endDate') &&
                          moment(getFieldValue('endDate')).isBefore(currentDate, 'time')
                        }
                      />
                    )}
                  </FormItem>
                </Col>
                <Col span={8}>
                  <FormItem
                    label={intl.get('sitf.batchStatistic.model.batchStatistic.endDate').d('时间至')}
                    {...formLayout}
                  >
                    {getFieldDecorator('endDate')(
                      <DatePicker
                        showTime
                        format={getDateTimeFormat()}
                        placeholder=""
                        disabledDate={(currentDate) =>
                          getFieldValue('startDate') &&
                          moment(getFieldValue('startDate')).isAfter(currentDate, 'time')
                        }
                      />
                    )}
                  </FormItem>
                </Col>
                <Col span={8} style={{ display: !expand ? 'block' : 'none' }}>
                  <FormItem label={intl.get('entity.interface.name').d('接口名称')} {...formLayout}>
                    {getFieldDecorator('interfaceId')(<Lov allowClear code="SIFC.INTERFACE" />)}
                  </FormItem>
                </Col>
              </Row>
            </Col>
            <Col span={6} className="search-btn-more">
              <Form.Item>
                <Button style={{ display: expand ? 'inline-block' : 'none' }} onClick={this.toggle}>
                  {intl.get(`sitf.common.button.more.inquire`).d('更多查询')}
                </Button>
                <Button style={{ display: expand ? 'none' : 'inline-block' }} onClick={this.toggle}>
                  {intl.get(`hzero.common.button.collected`).d('收起查询')}
                </Button>
                <Button data-code="reset" onClick={this.handleFormReset}>
                  {intl.get('hzero.common.button.reset').d('重置')}
                </Button>
                <Button
                  data-code="search"
                  type="primary"
                  htmlType="submit"
                  onClick={this.queryData}
                >
                  {intl.get('hzero.common.button.search').d('查询')}
                </Button>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </div>
    );
  }
}
