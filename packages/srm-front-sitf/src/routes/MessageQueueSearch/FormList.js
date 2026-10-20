/**
 * MessageQueueSearch- FormItem -消息队列数据查询表单
 * @date: 2018-9-17
 * @author dengtingmin <tingmin.deng@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { Form, Row, Col, Input, Button } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';
import Lov from 'components/Lov';

const FormItem = Form.Item;
@Form.create({ fieldNameProp: null })
export default class FormList extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      queueId: '',
      queueCode: '',
      queueGroupName: '', // 消息队列组名称
      queueGroupCode: '', // 消息队列组code
      assignTargetCode: '', // 系统分配代码
      applicationGroupCode: '', // 应用组code
      applicationGroupName: '', // 应用组名称
      expand: true,
    };
  }

  /**
   * 消息队列选择
   * @param {String} text  当前数据
   * @param {Object} record 当前行数据
   */
  @Bind()
  changeQueue(text, record) {
    this.setState({
      queueId: record.queueId,
      queueCode: record.queueCode,
      queueGroupName: record.queueGroupName,
      queueGroupCode: record.queueGroupCode,
    });
  }

  /**
   * 系统分配类型
   * @param {String} text  当前数据
   * @param {Object} record 当前行数据
   */
  changeAssignType(text, record) {
    this.setState({
      assignTargetCode: record.systemCode,
    });
  }

  /**
   * 消息队列处理
   * @param {String} text  当前数据
   * @param {Object} record 当前行数据
   */
  changeQueueCode(text, record) {
    this.setState({
      applicationGroupCode: record.applicationGroupCode,
      applicationGroupName: record.applicationGroupName,
    });
  }

  /**
   * 按条件查询
   */
  @Bind()
  fetchListByCondition() {
    const { form, fetchMessageList } = this.props;
    form.validateFields((err, values) => {
      if (!err) {
        const { queueGroupCode, applicationGroupCode, ...otherValue } = values;

        fetchMessageList({
          ...otherValue,
          queueCode: this.state.queueCode,
          queueGroupCode: this.state.queueGroupCode,
          applicationGroupCode: this.state.applicationGroupCode,
        });
      }
    });
  }

  /**
   * 重置
   */
  @Bind()
  resetForm() {
    const { form } = this.props;
    form.resetFields();
    this.setState({
      queueGroupCode: '',
      queueGroupName: '',
      applicationGroupCode: '',
      applicationGroupName: '',
      assignTargetCode: '',
    });
  }

  // 是否展开
  @Bind()
  toggle() {
    const { expand } = this.state;
    this.setState({ expand: !expand });
  }

  render() {
    const {
      form: { getFieldDecorator, getFieldsValue },
    } = this.props;
    const { expand } = this.state;
    const formlayout = {
      labelCol: { span: 10 },
      wrapperCol: { span: 14 },
    };
    return (
      <div className="table-list-search">
        <Form layout="inline" className="more-fields-form">
          <Row>
            <Col span={18}>
              <Row>
                <Col span={8}>
                  <FormItem
                    label={intl
                      .get('sitf.messageQueueSearch.model.messageQueueSearch.queueCode')
                      .d('消息队列')}
                    {...formlayout}
                  >
                    {getFieldDecorator('queueId', {
                      rules: [
                        {
                          required: true,
                          message: intl.get('hzero.common.validation.notNull', {
                            name: intl
                              .get('sitf.messageQueueSearch.model.messageQueueSearch.queueCode')
                              .d('消息队列'),
                          }),
                        },
                      ],
                    })(
                      <Lov
                        allowClear
                        code="SIFC.QUEUE"
                        onChange={(text, record) => {
                          this.changeQueue(text, record);
                        }}
                      />
                    )}
                  </FormItem>
                </Col>
                <Col span={8}>
                  <FormItem
                    label={intl
                      .get('sitf.messageQueueSearch.model.messageQueueSearch.queueGroupCode')
                      .d('消息队列组')}
                    {...formlayout}
                  >
                    {getFieldDecorator('queueGroupCode', {
                      initialValue: this.state.queueGroupName,
                    })(<Input disabled />)}
                  </FormItem>
                </Col>
                <Col span={8}>
                  <FormItem
                    label={intl.get('sitf.common.batch.number').d('批次号')}
                    {...formlayout}
                  >
                    {getFieldDecorator('batchNum', {
                      rules: [
                        {
                          required: true,
                          message: intl.get('hzero.common.validation.notNull', {
                            name: intl.get('sitf.common.batch.number').d('批次号'),
                          }),
                        },
                      ],
                    })(<Input />)}
                  </FormItem>
                </Col>
              </Row>
              <Row style={{ display: !expand ? 'block' : 'none' }}>
                <Col span={8}>
                  <FormItem
                    label={intl.get('sitf.common.system.type').d('系统分配类型')}
                    {...formlayout}
                  >
                    {getFieldDecorator('assignType', {
                      rules: [
                        {
                          required: true,
                          message: intl.get('hzero.common.validation.notNull', {
                            name: intl.get('sitf.common.system.type').d('系统分配类型'),
                          }),
                        },
                      ],
                    })(
                      <Lov
                        allowClear
                        code="SIFC.SYSTEM_ASSIGN"
                        queryParams={{ queueId: this.state.queueId }}
                        disabled={getFieldsValue().queueId === undefined}
                        onChange={(text, record) => {
                          this.changeAssignType(text, record);
                        }}
                      />
                    )}
                  </FormItem>
                </Col>
                <Col span={8}>
                  <FormItem
                    label={intl.get('sitf.common.system.code').d('系统分配代码')}
                    {...formlayout}
                  >
                    {getFieldDecorator('assignTargetCode', {
                      initialValue: this.state.assignTargetCode,
                    })(<Input disabled />)}
                  </FormItem>
                </Col>
                <Col span={8}>
                  <FormItem
                    label={intl
                      .get('sitf.messageQueueSearch.model.messageQueueSearch.queueHandlerCode')
                      .d('消息队列处理')}
                    {...formlayout}
                  >
                    {getFieldDecorator('queueHandlerCode', {
                      rules: [
                        {
                          required: true,
                          message: intl.get('hzero.common.validation.notNull', {
                            name: intl
                              .get(
                                'sitf.messageQueueSearch.model.messageQueueSearch.queueHandlerCode'
                              )
                              .d('消息队列处理'),
                          }),
                        },
                      ],
                    })(
                      <Lov
                        allowClear
                        code="SIFC.QUEUE_HANDLE"
                        queryParams={{ queueId: this.state.queueId }}
                        disabled={getFieldsValue().queueId === undefined}
                        onChange={(text, record) => {
                          this.changeQueueCode(text, record);
                        }}
                      />
                    )}
                  </FormItem>
                </Col>
                <Col span={8}>
                  <FormItem
                    label={intl.get('entity.application.group').d('应用组')}
                    {...formlayout}
                  >
                    {getFieldDecorator('applicationGroupCode', {
                      initialValue: this.state.applicationGroupName,
                    })(<Input disabled />)}
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
                <Button data-code="reset" style={{ marginLeft: 8 }} onClick={this.resetForm}>
                  {intl.get('hzero.common.button.reset').d('重置')}
                </Button>
                <Button
                  data-code="search"
                  type="primary"
                  htmlType="submit"
                  onClick={this.fetchListByCondition}
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
