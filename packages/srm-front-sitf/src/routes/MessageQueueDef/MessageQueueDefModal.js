/**
 * MessageQueueModal -消息队列组定义-modal 编辑
 * @date: 2018-9-13
 * @author dengtingmin <tingmin.deng@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { PureComponent } from 'react';
import { Modal, Form, Input } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { isEmpty } from 'lodash';

import intl from 'utils/intl';

import Switch from 'components/Switch';

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
 * @reactProps {Function} onHandleSaveMessage -保存数据
 * @reactProps {Function} onCancel - 取消模态框
 * @reactProps {Object} visible - 控制模态框显影
 * @reactProps {Object} tableRecord - 表格中信息的一条记录
 * @reactProps {String} anchor - 模态框弹出方向
 * @return React.element
 */
@Form.create({ fieldNameProp: null })
export default class MessageQueueModal extends PureComponent {
  /**
   * 确认后数据保存
   */
  @Bind()
  onOk() {
    const { form, onHandleSaveMessage, tableRecord = {}, tenantId } = this.props;
    form.validateFields((err, values) => {
      if (isEmpty(err)) {
        onHandleSaveMessage({
          ...tableRecord,
          ...values,
          tenantId,
        });
      }
    });
  }

  render() {
    const { visible, onHandleCancel, anchor, tableRecord = {}, loading } = this.props;
    const { getFieldDecorator } = this.props.form;
    return (
      <Modal
        destroyOnClose
        title={intl.get('sitf.messageQueue.view.message.model.title').d('消息队列组定义维护')}
        width={520}
        onCancel={onHandleCancel}
        onOk={this.onOk}
        visible={visible}
        wrapClassName={`ant-modal-sidebar-${anchor}`}
        transitionName={`move-${anchor}`}
        confirmLoading={loading}
      >
        <Form>
          <FormItem
            label={intl
              .get('sitf.messageQueue.model.messageQueue.queueGroupCode')
              .d('消息队列组代码')}
            {...formLayout}
          >
            {getFieldDecorator('queueGroupCode', {
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
                      .get(`sitf.messageQueue.model.messageQueue.queueGroupCode`)
                      .d('消息队列组代码'),
                  }),
                },
              ],
              initialValue: tableRecord.queueGroupCode,
            })(
              tableRecord.queueGroupCode === undefined ? (
                <Input typeCase="upper" trim inputChinese={false} />
              ) : (
                <Input typeCase="upper" trim inputChinese={false} disabled />
              )
            )}
          </FormItem>
          <FormItem
            label={intl
              .get('sitf.messageQueue.model.messageQueue.queueGroupName')
              .d('消息队列组名称')}
            {...formLayout}
          >
            {getFieldDecorator('queueGroupName', {
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
                      .get(`sitf.messageQueue.model.messageQueue.queueGroupName`)
                      .d('消息队列组名称'),
                  }),
                },
              ],
              initialValue: tableRecord.queueGroupName,
            })(<Input />)}
          </FormItem>
          <FormItem label={intl.get('hzero.common.remark').d('备注')} {...formLayout}>
            {getFieldDecorator('remark', {
              initialValue: tableRecord.remark,
            })(<Input />)}
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
