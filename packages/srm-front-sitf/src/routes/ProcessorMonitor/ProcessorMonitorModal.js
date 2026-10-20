/**
 * ProcessorMonitorModal -前置机监控 model 编辑
 * @date: 2018-9-14
 * @author dengtingmin <tingmin.deng@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { PureComponent } from 'react';
import { Modal, Form, Input, Radio, Checkbox, Select, InputNumber, Spin } from 'hzero-ui';
import { isEmpty } from 'lodash';
import { Bind } from 'lodash-decorators';

import intl from 'utils/intl';

import Lov from 'components/Lov';

const FormItem = Form.Item;
const CheckboxGroup = Checkbox.Group;
const { Option } = Select;
/**
 * Form.Item 组件label、wrapper长度比例划分
 */
const formLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 16 },
};

/**
 * 编辑模态框数据展示
 * @extends {PureComponent} - React.PureComponent
 * @reactProps {Function} onCancel - 取消模态框
 * @reactProps {Object} visible - 控制模态框显影
 * @reactProps {Object} tableRecord - 表格中信息的一条记录
 * @reactProps {String} anchor - 模态框弹出方向
 * @return React.element
 */
@Form.create({ fieldNameProp: null })
export default class ProcessorMonitorModal extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      sitfFront: '',
    };
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    const { tableRecord, changeEmail, changeMobile } = nextProps;
    if (prevState !== null) {
      if (
        tableRecord !== prevState.tableRecord ||
        changeMobile !== prevState.changeMobile ||
        changeEmail !== prevState.changeEmail
      ) {
        return {
          ...prevState,
          tableRecord,
          changeMobile,
          changeEmail,
        };
      } else {
        return null;
      }
    }
  }

  /**
   * 确认保存
   */
  @Bind()
  onOk() {
    const { form, onHanleSaveProcessor, tableRecord = {} } = this.props;
    form.validateFields((err, values) => {
      if (isEmpty(err)) {
        const { alert, frontEndSystemName, timeout, ...otherValue } = values;
        const {
          application,
          applicationGroup,
          productLine,
          enabledFlag,
          ...otherRecord
        } = tableRecord;
        onHanleSaveProcessor({
          externalSystemCode: this.state.sitfFront,
          ...otherRecord,
          ...otherValue,
          timeout: parseInt(timeout, 10),
          groupId:
            otherRecord.title === otherValue.groupId ? otherRecord.groupId : otherValue.groupId,
          enabledFlag: enabledFlag === undefined ? 1 : enabledFlag,
          frontEndSystemCode:
            otherRecord.frontEndSystemName === otherValue.frontEndSystemCode
              ? otherRecord.frontEndSystemCode
              : otherValue.frontEndSystemCode,
        });
      }
    });
  }

  /**
   * 取消
   */
  @Bind()
  onCancel() {
    const { form, onCancel } = this.props;
    form.setFieldsValue({ frontEndSystemCode: undefined });
    onCancel();
  }

  /**
   * 手机或邮件选择(多条件选择判断)
   * @param {Object} values 手机或邮件标识
   */
  @Bind()
  onChangeMobile(values) {
    const { onChangeMobileOrEmail, form } = this.props;
    const count = values.findIndex((item) => item === 'undefined');
    if (count > -1) {
      values.splice(count, 1);
    }
    const value = values[0];
    if (values.length === 1) {
      if (value === 'mobile') {
        form.setFieldsValue({ email: null });
      } else if (value === 'email') {
        form.setFieldsValue({ mobile: null });
      }
    } else if (values.length === 0) {
      form.setFieldsValue([{ email: null }, { mobile: null }]);
    }
    onChangeMobileOrEmail(values);
  }

  @Bind()
  changeSitfFront(_, record) {
    const { form } = this.props;
    form.setFieldsValue({ frontEndSystemName: record.frontEndSystemName });
    this.setState({
      sitfFront: record.externalSystemCode,
    });
  }

  render() {
    const {
      modalVisible,
      anchor,
      tableRecord = {},
      loadingModel,
      loadingDetail,
      changeMobile,
      changeEmail,
      code = [],
    } = this.props;
    const { getFieldDecorator } = this.props.form;
    const options = [
      {
        label: intl.get('sitf.processorMonitor.model.processorMonitor.mobile').d('手机短信'),
        value: 'mobile',
      },
      {
        label: intl.get('sitf.processorMonitor.model.processorMonitor.email').d('Email'),
        value: 'email',
      },
    ];
    return (
      <Modal
        destroyOnClose
        title={intl
          .get('sitf.processorMonitor.view.processorMonitor.modelTitle')
          .d('监控对象/选项填写')}
        width={520}
        onCancel={this.onCancel}
        onOk={this.onOk}
        visible={modalVisible}
        wrapClassName={`ant-modal-sidebar-${anchor}`}
        transitionName={`move-${anchor}`}
        confirmLoading={loadingModel}
      >
        <Spin spinning={tableRecord ? false : loadingDetail}>
          <Form>
            <FormItem
              label={intl
                .get('sitf.processorMonitor.model.processorMonitor.frontEndSystem')
                .d('前置机')}
              {...formLayout}
            >
              {getFieldDecorator('frontEndSystemCode', {
                rules: [
                  {
                    max: 30,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`hzero.common.validation.max`, {
                        max: 30,
                      }),
                    }),
                  },
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get(`sitf.processorMonitor.model.processorMonitor.frontEndSystem`)
                        .d('前置机代码'),
                    }),
                  },
                ],
                initialValue: tableRecord.frontEndSystemName,
              })(
                tableRecord.frontEndSystemCode ? (
                  <Lov
                    code="SIFC.FRONT_END_SYSTEM"
                    textValue={tableRecord.frontEndSystemName}
                    disabled
                  />
                ) : (
                  <Lov
                    code="SIFC.FRONT_END_SYSTEM"
                    onChange={(text, record) => {
                      this.changeSitfFront(text, record);
                    }}
                  />
                )
              )}
            </FormItem>
            <FormItem
              label={intl.get('sitf.processorMonitor.model.processorMonitor.groupId').d('执行器')}
              {...formLayout}
            >
              {getFieldDecorator('groupId', {
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get(`sitf.processorMonitor.model.processorMonitor.groupId`)
                        .d('执行器'),
                    }),
                  },
                ],
                initialValue: tableRecord.title,
              })(
                tableRecord.title === undefined ? (
                  <Select allowClear>
                    {code.map((item) => {
                      return (
                        <Option label={item.title} value={item.id} key={item.id}>
                          {item.title}
                        </Option>
                      );
                    })}
                  </Select>
                ) : (
                  <Select disabled>
                    {code.map((item) => {
                      return (
                        <Option label={item.title} value={item.id} key={item.id}>
                          {item.title}
                        </Option>
                      );
                    })}
                  </Select>
                )
              )}
            </FormItem>
            <FormItem
              label={intl
                .get('sitf.processorMonitor.model.processorMonitor.monitorInterval')
                .d('监控频率')}
              {...formLayout}
            >
              {getFieldDecorator('monitorInterval', {
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get(`sitf.processorMonitor.model.processorMonitor.monitorInterval`)
                        .d('监控频率'),
                    }),
                  },
                ],
                initialValue: tableRecord.monitorInterval,
              })(
                <Radio.Group
                  value="size"
                  onChange={this.onChangeButton}
                  defaultValue={tableRecord.monitorInterval}
                >
                  <Radio.Button
                    value={intl
                      .get('sitf.processorMonitor.view.processorMonitor.fiveMin')
                      .d('5分钟')}
                  >
                    {intl.get('sitf.processorMonitor.view.processorMonitor.fiveMin').d('5分钟')}
                  </Radio.Button>
                  <Radio.Button
                    value={intl
                      .get('sitf.processorMonitor.view.processorMonitor.tenMin')
                      .d('10分钟')}
                  >
                    {intl.get('sitf.processorMonitor.view.processorMonitor.tenMin').d('10分钟')}
                  </Radio.Button>
                  <Radio.Button
                    value={intl
                      .get('sitf.processorMonitor.view.processorMonitor.fifteenMin')
                      .d('15分钟')}
                  >
                    {intl.get('sitf.processorMonitor.view.processorMonitor.fifteenMin').d('15分钟')}
                  </Radio.Button>
                  <Radio.Button
                    value={intl
                      .get('sitf.processorMonitor.view.processorMonitor.twentyMin')
                      .d('20分钟')}
                  >
                    {intl.get('sitf.processorMonitor.view.processorMonitor.twentyMin').d('20分钟')}
                  </Radio.Button>
                  <Radio.Button
                    value={intl
                      .get('sitf.processorMonitor.view.processorMonitor.thirtyMin')
                      .d('30分钟')}
                  >
                    {intl.get('sitf.processorMonitor.view.processorMonitor.thirtyMin').d('30分钟')}
                  </Radio.Button>
                  <Radio.Button
                    value={intl
                      .get('sitf.processorMonitor.view.processorMonitor.oneHour')
                      .d('60分钟')}
                  >
                    {intl.get('sitf.processorMonitor.view.processorMonitor.oneHour').d('60分钟')}
                  </Radio.Button>
                </Radio.Group>
              )}
            </FormItem>
            <FormItem
              label={intl
                .get('sitf.processorMonitor.model.processorMonitor.retryCountAlerts')
                .d('重试几次告警')}
              {...formLayout}
            >
              {getFieldDecorator('retryCountAlerts', {
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get(`sitf.processorMonitor.model.processorMonitor.retryCountAlerts`)
                        .d('重试几次告警'),
                    }),
                  },
                ],
                initialValue: tableRecord.retryCountAlerts,
              })(
                <Radio.Group
                  value="size"
                  onChange={this.onChangeAlerts}
                  defaultValue={tableRecord.monitorInterval}
                >
                  <Radio.Button
                    value={intl.get('sitf.processorMonitor.view.processorMonitor.one').d('1次')}
                  >
                    {intl.get('sitf.processorMonitor.view.processorMonitor.one').d('1次')}
                  </Radio.Button>
                  <Radio.Button
                    value={intl.get('sitf.processorMonitor.view.processorMonitor.two').d('2次')}
                  >
                    {intl.get('sitf.processorMonitor.view.processorMonitor.two').d('2次')}
                  </Radio.Button>
                  <Radio.Button
                    value={intl.get('sitf.processorMonitor.view.processorMonitor.three').d('3次')}
                  >
                    {intl.get('sitf.processorMonitor.view.processorMonitor.three').d('3次')}
                  </Radio.Button>
                  <Radio.Button
                    value={intl.get('sitf.processorMonitor.view.processorMonitor.four').d('4次')}
                  >
                    {intl.get('sitf.processorMonitor.view.processorMonitor.four').d('4次')}
                  </Radio.Button>
                  <Radio.Button
                    value={intl.get('sitf.processorMonitor.view.processorMonitor.five').d('5次')}
                  >
                    {intl.get('sitf.processorMonitor.view.processorMonitor.five').d('5次')}
                  </Radio.Button>
                </Radio.Group>
              )}
            </FormItem>
            <FormItem
              label={intl.get('sitf.common.data.handlerInterface').d('处理接口')}
              {...formLayout}
            >
              {getFieldDecorator('monitorProviderInterface', {
                initialValue: tableRecord.monitorProviderInterface,
                rules: [
                  {
                    max: 50,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`hzero.common.validation.max`, {
                        max: 50,
                      }),
                    }),
                  },
                ],
              })(<Input />)}
            </FormItem>
            <FormItem
              label={intl
                .get('sitf.processorMonitor.model.processorMonitor.timeout')
                .d('超时时间(秒)')}
              {...formLayout}
            >
              {getFieldDecorator('timeout', {
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get(`sitf.processorMonitor.model.processorMonitor.timeout`)
                        .d('超时时间(秒)'),
                    }),
                  },
                ],
                initialValue: tableRecord.timeout,
              })(<InputNumber style={{ width: '100%' }} min={0} />)}
            </FormItem>
            <FormItem
              label={intl.get('sitf.processorMonitor.model.processorMonitor.alert').d('告警方式')}
              {...formLayout}
            >
              {getFieldDecorator('alert', {
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get(`sitf.processorMonitor.model.processorMonitor.alert`)
                        .d('告警方式'),
                    }),
                  },
                ],
                initialValue: [
                  `${
                    tableRecord.mobile === undefined || tableRecord.mobile ? 'mobile' : undefined
                  }`,
                  `${tableRecord.email ? 'email' : undefined}`,
                ],
              })(<CheckboxGroup options={options} onChange={this.onChangeMobile} />)}
            </FormItem>
            {changeMobile && (
              <FormItem
                label={intl
                  .get('sitf.processorMonitor.model.processorMonitor.mobile')
                  .d('手机短信')}
                {...formLayout}
              >
                {getFieldDecorator('mobile', {
                  rules: [
                    {
                      max: 20,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get(`hzero.common.validation.max`, {
                          max: 20,
                        }),
                      }),
                    },
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl
                          .get(`sitf.processorMonitor.model.processorMonitor.mobile`)
                          .d('手机短信'),
                      }),
                    },
                  ],
                  initialValue: tableRecord.mobile,
                })(<Input />)}
              </FormItem>
            )}
            {changeEmail && (
              <FormItem
                label={intl.get('sitf.processorMonitor.model.processorMonitor.email').d('Email')}
                {...formLayout}
              >
                {getFieldDecorator('email', {
                  rules: [
                    {
                      max: 50,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get(`hzero.common.validation.max`, {
                          max: 50,
                        }),
                      }),
                    },
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl
                          .get(`sitf.processorMonitor.model.processorMonitor.email`)
                          .d('Email'),
                      }),
                    },
                  ],
                  initialValue: tableRecord.email,
                })(<Input />)}
              </FormItem>
            )}
          </Form>
        </Spin>
      </Modal>
    );
  }
}
