/**
 * EditForm - 应用维护 - 数据维护表单
 * @date: 2018-9-11
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { Form, Input, Modal, InputNumber, Select } from 'hzero-ui';
import lodash from 'lodash';
import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';
import Lov from 'components/Lov';
import Switch from 'components/Switch';

/**
 * 使用 Form.Item 组件
 */
const FormItem = Form.Item;
/**
 * 下拉选择框组件
 */
const { Option } = Select;
/**
 * 侧滑弹出框样式属性
 */
const otherProps = {
  wrapClassName: 'ant-modal-sidebar-right',
  transitionName: 'move-right',
};

/**
 * Form.Item 组件label、wrapper长度比例划分
 */
const formLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 16 },
  width: { width: '100%' },
};

/**
 * 数据维护表单
 * @extends {Component} - React.Component
 * @reactProps {Object} loading - 数据加载是否完成
 * @reactProps {Object} form - 表单对象
 * @return React.element
 */
@Form.create({ fieldNameProp: null })
export default class EditForm extends PureComponent {
  /**
   * 点击确定事件
   */
  @Bind()
  okHandle() {
    const { form, onHandleAddQueue } = this.props;
    form.validateFields((err, fieldsValue) => {
      if (!err) {
        onHandleAddQueue({ ...fieldsValue, queueCode: lodash.trim(fieldsValue.queueCode) }, form);
      }
    });
  }

  /**
   * 点击取消事件
   */
  @Bind()
  cancelHandle() {
    const { form, onShowEditModal } = this.props;
    onShowEditModal(false);
    form.resetFields();
  }

  /**
   * 渲染方法
   */
  render() {
    const { form, modalVisible, editRowData, loading, ConsumptionType = [] } = this.props;
    const {
      queueId,
      queueCode,
      queueName,
      queueGroupId,
      queueGroupName,
      queueNumber,
      enabledFlag,
      consumptionMode,
      messageTimeout,
      remark,
    } = editRowData;
    return (
      <Modal
        title={intl.get('sitf.queuesSetting.view.message.title.list.modal').d('消息队列维护')}
        width={520}
        {...otherProps}
        destroyOnClose
        confirmLoading={loading}
        visible={modalVisible}
        onOk={this.okHandle}
        onCancel={this.cancelHandle}
      >
        <React.Fragment>
          <FormItem
            label={intl.get('sitf.queuesSetting.model.queuesSetting.queueCode').d('消息队列代码')}
            {...formLayout}
          >
            {form.getFieldDecorator('queueCode', {
              initialValue: queueCode,
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl
                      .get('sitf.queuesSetting.model.queuesSetting.queueCode')
                      .d('消息队列代码'),
                  }),
                },
                {
                  max: 30,
                  message: intl.get('hzero.common.validation.max', {
                    max: 30,
                  }),
                },
              ],
            })(<Input typeCase="upper" trim inputChinese={false} disabled={!!queueId} />)}
          </FormItem>
          <FormItem
            label={intl.get('sitf.common.message.queueName').d('消息队列名称')}
            {...formLayout}
          >
            {form.getFieldDecorator('queueName', {
              initialValue: queueName,
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get('sitf.common.message.queueName').d('消息队列名称'),
                  }),
                },
                {
                  max: 70,
                  message: intl.get('hzero.common.validation.max', {
                    max: 70,
                  }),
                },
              ],
            })(<Input />)}
          </FormItem>
          <FormItem
            label={intl.get('sitf.queuesSetting.model.queuesSetting.queueGroupName').d('队列组')}
            {...formLayout}
          >
            {form.getFieldDecorator('queueGroupId', {
              initialValue: queueGroupId,
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl
                      .get('sitf.queuesSetting.model.queuesSetting.queueGroupName')
                      .d('队列组'),
                  }),
                },
              ],
            })(<Lov code="SIFC.QUEUE_GROUP" textValue={queueGroupName} />)}
          </FormItem>
          <FormItem
            label={intl.get('sitf.queuesSetting.model.queuesSetting.consumptionMode').d('消费方式')}
            {...formLayout}
          >
            {form.getFieldDecorator('consumptionMode', {
              initialValue: consumptionMode,
            })(
              <Select style={{ width: '100%' }}>
                {ConsumptionType &&
                  ConsumptionType.map(type => {
                    return (
                      <Option value={type.value} key={type.value}>
                        {type.meaning}
                      </Option>
                    );
                  })}
              </Select>
            )}
          </FormItem>
          <FormItem
            label={intl.get('sitf.queuesSetting.model.queuesSetting.queueNumber').d('消息队列数量')}
            {...formLayout}
          >
            {form.getFieldDecorator('queueNumber', {
              initialValue: queueNumber,
            })(<InputNumber style={{ width: '100%' }} min={0} />)}
          </FormItem>
          <FormItem
            label={intl
              .get('sitf.queuesSetting.model.queuesSetting.messageTimeout')
              .d('消息超时(秒)')}
            {...formLayout}
          >
            {form.getFieldDecorator('messageTimeout', {
              initialValue: messageTimeout,
            })(<InputNumber style={{ width: '100%' }} min={0} />)}
          </FormItem>
          <FormItem label={intl.get('hzero.common.remark').d('备注')} {...formLayout}>
            {form.getFieldDecorator('remark', {
              initialValue: remark,
            })(<Input />)}
          </FormItem>
          <FormItem label={intl.get('hzero.commom.status.enable').d('启用')} {...formLayout}>
            {form.getFieldDecorator('enabledFlag', {
              initialValue: enabledFlag === undefined ? 1 : enabledFlag,
            })(<Switch />)}
          </FormItem>
        </React.Fragment>
      </Modal>
    );
  }
}
