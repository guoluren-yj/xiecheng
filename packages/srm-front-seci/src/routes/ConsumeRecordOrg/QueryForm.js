/**
 * QueryForm - 消费明细 - 查询表单
 * @date: 2018-12-27
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { Form, DatePicker, Button, Row, Col } from 'hzero-ui';
import moment from 'moment';
import { Bind } from 'lodash-decorators';
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
    const { onQueryConsumeRecordOrg, form } = this.props;
    form.validateFields(err => {
      if (!err) {
        if (onQueryConsumeRecordOrg) {
          onQueryConsumeRecordOrg();
        }
      }
    });
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
    return (
      <div className="table-list-search">
        <Form className="more-fields-form">
          <Row>
            <Col span={18}>
              <Row>
                <Col span={8}>
                  <FormItem
                    label={intl
                      .get('seci.consumeRecordOrg.model.consumeRecordOrg.productId')
                      .d('消费项目')}
                    {...formLayout}
                  >
                    {getFieldDecorator('productId')(<Lov allowClear code="SECI.PRODUCT" />)}
                  </FormItem>
                </Col>
                <Col span={8}>
                  <FormItem
                    label={intl
                      .get('seci.consumeRecordOrg.model.consumeRecordOrg.consumeDateFrom')
                      .d('消费时间从')}
                    {...formLayout}
                  >
                    {getFieldDecorator('consumeDateFrom')(
                      <DatePicker
                        showTime
                        disabledDate={currentDate =>
                          getFieldValue('consumeDateTo') &&
                          moment(getFieldValue('consumeDateTo')).isBefore(currentDate, 'time')
                        }
                        format={getDateTimeFormat()}
                        placeholder=""
                      />
                    )}
                  </FormItem>
                </Col>
                <Col span={8}>
                  <FormItem
                    label={intl
                      .get('seci.consumeRecordOrg.model.consumeRecordOrg.consumeDateTo')
                      .d('消费时间至')}
                    {...formLayout}
                  >
                    {getFieldDecorator('consumeDateTo')(
                      <DatePicker
                        showTime
                        disabledDate={currentDate =>
                          getFieldValue('consumeDateFrom') &&
                          moment(getFieldValue('consumeDateFrom')).isAfter(currentDate, 'time')
                        }
                        format={getDateTimeFormat()}
                        placeholder=""
                      />
                    )}
                  </FormItem>
                </Col>
              </Row>
            </Col>
            <Col span={6} className="search-btn-more">
              <Form.Item>
                <Button
                  data-code="search"
                  type="primary"
                  htmlType="submit"
                  onClick={this.queryData}
                >
                  {intl.get('hzero.common.button.search').d('查询')}
                </Button>
                <Button data-code="reset" style={{ marginLeft: 8 }} onClick={this.handleFormReset}>
                  {intl.get('hzero.common.button.reset').d('重置')}
                </Button>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </div>
    );
  }
}
