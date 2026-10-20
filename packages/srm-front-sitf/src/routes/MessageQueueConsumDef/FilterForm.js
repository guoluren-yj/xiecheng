/**
 * MessageQueueConsumDef -消息队列消费组定义页面 查询页面
 * @date: 2018-11-23
 * @author DTM <tingmin.deng@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { Bind } from 'lodash-decorators';
import { Form, Button, Input, Row, Col } from 'hzero-ui';

import intl from 'utils/intl';
import CacheComponent from 'components/CacheComponent';

import Lov from 'components/Lov';

const FormItem = Form.Item;
const formlayout = {
  labelCol: { span: 10 },
  wrapperCol: { span: 14 },
};
@Form.create({ fieldNameProp: null })
@CacheComponent({ cacheKey: '/sitf/message-consum-def' })
export default class FilterForm extends PureComponent {
  constructor(props) {
    super(props);
    props.onRef(this);
  }

  @Bind()
  fetchConsumerGroup() {
    const { form, onFetchConsumer } = this.props;
    form.validateFields((err, values) => {
      if (!err) {
        onFetchConsumer({
          ...values,
        });
      }
    });
  }

  /**
   * 表单重置
   */
  @Bind()
  queryReset() {
    const { form } = this.props;
    form.resetFields();
  }

  render() {
    const {
      form: { getFieldDecorator },
    } = this.props;
    return (
      <Form layout="inline" className="more-fields-form">
        <Row gutter={12}>
          <Col span={6}>
            <FormItem
              label={intl
                .get('sitf.messageQueueConsumDef.model.messageQueueConsumDef.consumerGroupCode')
                .d('消费组代码')}
              {...formlayout}
            >
              {getFieldDecorator('consumerGroupCode')(
                <Input typeCase="upper" trim inputChinese={false} />
              )}
            </FormItem>
          </Col>
          <Col span={6}>
            <FormItem
              label={intl
                .get('sitf.messageQueueConsumDef.model.messageQueueConsumDef.consumerGroupName')
                .d('消费组名称')}
              {...formlayout}
            >
              {getFieldDecorator('consumerGroupName')(<Input />)}
            </FormItem>
          </Col>
          <Col span={6}>
            <FormItem label={intl.get('entity.application.tag').d('应用')} {...formlayout}>
              {getFieldDecorator('applicationCode')(
                <Lov code="SIFC.APPLICATIONS" textField="applicationName" />
              )}
            </FormItem>
          </Col>
          <Col span={6} className="search-btn-more">
            <FormItem>
              <Button onClick={this.queryReset}>
                {intl.get('hzero.common.button.reset').d('重置')}
              </Button>
              <Button type="primary" htmlType="submit" onClick={this.fetchConsumerGroup}>
                {intl.get('hzero.common.button.search').d('查询')}
              </Button>
            </FormItem>
          </Col>
        </Row>
      </Form>
    );
  }
}
