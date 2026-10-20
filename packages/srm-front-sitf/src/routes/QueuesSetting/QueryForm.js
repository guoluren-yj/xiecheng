/**
 * QueryForm - 消息队列定义 - 查询表单
 * @date: 2018-9-12
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { Form, Input, Button, Row, Col } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';

/**
 * 使用 Form.Item 组件
 */
const FormItem = Form.Item;
const formlayout = {
  labelCol: { span: 10 },
  wrapperCol: { span: 14 },
};

/**
 * 查询表单
 * @extends {Component} - React.Component
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
   * 查询消息队列定义
   */
  @Bind()
  fetchQueueByCondition() {
    const { onFetchQueue, form } = this.props;
    form.validateFields((err, fieldsValue) => {
      if (!err) {
        onFetchQueue(fieldsValue);
      }
    });
  }

  /**
   * 渲染查询结构
   */
  render() {
    const { getFieldDecorator } = this.props.form;
    return (
      <div className="table-list-search">
        <Form layout="inline" className="more-fields-form">
          <Row gutter={12}>
            <Col span={6}>
              <FormItem
                label={intl
                  .get('sitf.queuesSetting.model.queuesSetting.queueCode')
                  .d('消息队列代码')}
                {...formlayout}
              >
                {getFieldDecorator('queueCode')(
                  <Input trim typeCase="upper" inputChinese={false} />
                )}
              </FormItem>
            </Col>
            <Col span={6}>
              <FormItem
                label={intl.get('sitf.common.message.queueName').d('消息队列名称')}
                {...formlayout}
              >
                {getFieldDecorator('queueName')(<Input />)}
              </FormItem>
            </Col>
            <Col span={6} className="search-btn-more">
              <FormItem>
                <Button onClick={this.handleFormReset}>
                  {intl.get('hzero.common.button.reset').d('重置')}
                </Button>
                <Button
                  type="primary"
                  onClick={() => this.fetchQueueByCondition()}
                  htmlType="submit"
                >
                  {intl.get('hzero.common.button.search').d('查询')}
                </Button>
              </FormItem>
            </Col>
          </Row>
        </Form>
      </div>
    );
  }
}
