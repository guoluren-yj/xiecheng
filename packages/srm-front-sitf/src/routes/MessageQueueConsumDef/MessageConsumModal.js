/**
 * MessageConsumModal -消息队列消费组定义-model 编辑页
 * @date: 2018-9-28
 * @author dengtingmin <tingmin.deng@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { PureComponent } from 'react';
import { Modal, Form, Input } from 'hzero-ui';
import { isEmpty } from 'lodash';
import { Bind } from 'lodash-decorators';
import Lov from 'components/Lov';
import Switch from 'components/Switch';
import intl from 'utils/intl';

const FormItem = Form.Item;

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
 * @reactProps {Function} groupDateSave - 编辑确定后回调函数以保存数据
 * @reactProps {Function} onCancel - 取消模态框
 * @reactProps {Object} visible - 控制模态框显影
 * @reactProps {Object} tableRecord - 表格中信息的一条记录
 * @reactProps {String} anchor - 模态框弹出方向
 * @return React.element
 */
@Form.create({ fieldNameProp: null })
export default class MessageConsumModal extends PureComponent {
  // 点击确认回调
  @Bind()
  onOk() {
    const { form, onHandleSaveMessageQueue, tableRecord } = this.props;
    form.validateFields((err, values) => {
      if (isEmpty(err)) {
        onHandleSaveMessageQueue({
          ...tableRecord,
          ...values,
          applicationCode:
            values.applicationCode === tableRecord.applicationName
              ? tableRecord.applicationCode
              : values.applicationCode,
        });
      }
    });
  }

  render() {
    const { visible, onHandleCancel, anchor, tableRecord = {}, updateLoading } = this.props;
    const { getFieldDecorator } = this.props.form;
    return (
      <Modal
        destroyOnClose
        title={intl
          .get('sitf.messageQueueConsumDef.view.messageQueueConsumDef.headerTitle')
          .d('消息队列消费组定义')}
        width={520}
        onCancel={onHandleCancel}
        onOk={this.onOk}
        visible={visible}
        wrapClassName={`ant-modal-sidebar-${anchor}`}
        transitionName={`move-${anchor}`}
        confirmLoading={updateLoading}
      >
        <Form>
          <FormItem
            label={intl
              .get('sitf.messageQueueConsumDef.model.messageQueueConsumDef.consumerGroupCode')
              .d('消费组代码')}
            {...formLayout}
          >
            {getFieldDecorator('consumerGroupCode', {
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
                      .get(
                        `sitf.messageQueueConsumDef.model.messageQueueConsumDef.consumerGroupCode`
                      )
                      .d('消费组代码'),
                  }),
                },
              ],
              initialValue: tableRecord.consumerGroupCode,
            })(
              tableRecord.consumerGroupCode === undefined ? (
                <Input typeCase="upper" trim inputChinese={false} />
              ) : (
                <Input typeCase="upper" trim inputChinese={false} disabled />
              )
            )}
          </FormItem>
          <FormItem
            label={intl
              .get('sitf.messageQueueConsumDef.model.messageQueueConsumDef.consumerGroupName')
              .d('消费组名称')}
            {...formLayout}
          >
            {getFieldDecorator('consumerGroupName', {
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
                      .get(
                        `sitf.messageQueueConsumDef.model.messageQueueConsumDef.consumerGroupName`
                      )
                      .d('消费组名称'),
                  }),
                },
              ],
              initialValue: tableRecord.consumerGroupName,
            })(<Input />)}
          </FormItem>
          <FormItem label={intl.get('entity.application.tag').d('应用')} {...formLayout}>
            {getFieldDecorator('applicationCode', {
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get(`entity.application.tag`).d('应用'),
                  }),
                },
              ],
              initialValue: tableRecord.applicationName,
            })(<Lov textValue={tableRecord.applicationName} code="SIFC.APPLICATIONS" />)}
          </FormItem>
          <FormItem
            label={intl
              .get('sitf.messageQueueConsumDef.model.messageQueueConsumDef.consumerAllFlag')
              .d('消费所有分配')}
            {...formLayout}
          >
            {getFieldDecorator('consumerAllFlag', {
              initialValue:
                tableRecord.consumerAllFlag === undefined ? 1 : tableRecord.consumerAllFlag ? 1 : 0,
            })(<Switch />)}
          </FormItem>
          <FormItem label={intl.get('hzero.common.status.enable').d('启用')} {...formLayout}>
            {getFieldDecorator('enabledFlag', {
              initialValue:
                tableRecord.enabledFlag === undefined ? 1 : tableRecord.enabledFlag ? 1 : 0,
            })(<Switch />)}
          </FormItem>
        </Form>
      </Modal>
    );
  }
}
