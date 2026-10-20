/**
 * EventDataType - 事件类型定义 - 编辑表单
 * @date: 2019-3-12
 * @author: Wu <qizheng.wu@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React from 'react';
import { Form, Input, Modal } from 'hzero-ui';
import { Bind } from 'lodash-decorators';

import intl from 'utils/intl';

const FormItem = Form.Item;
const formLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 16 },
};
const otherProps = {
  wrapClassName: 'ant-modal-sidebar-right',
  transitionName: 'move-right',
};
@Form.create({ fieldNameProp: null })
export default class EditModal extends React.PureComponent {
  /**
   * 事件数据类型保存
   */
  @Bind()
  handleOk() {
    const { form, onOk } = this.props;
    form.validateFields((err, fieldsValue) => {
      if (!err) {
        onOk(fieldsValue);
      }
    });
  }

  render() {
    const { form, initData, title, loading, onCancel, modalVisible } = this.props;
    const { getFieldDecorator } = form;
    return (
      <Modal
        destroyOnClose
        title={title}
        visible={modalVisible}
        confirmLoading={loading}
        onCancel={onCancel}
        onOk={this.handleOk}
        {...otherProps}
      >
        <Form>
          <FormItem
            {...formLayout}
            label={intl.get('spfm.eventDataType.model.eventDataType.className').d('类名')}
          >
            {getFieldDecorator('className', {
              initialValue: initData.className,
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get('spfm.eventDataType.model.eventDataType.className').d('类名'),
                  }),
                },
                {
                  max: 30,
                  message: intl.get('hzero.common.validation.max', {
                    max: 30,
                  }),
                },
              ],
            })(<Input trim />)}
          </FormItem>
          <FormItem
            {...formLayout}
            label={intl.get('spfm.eventDataType.model.eventDataType.description').d('描述')}
          >
            {getFieldDecorator('description', {
              initialValue: initData.description,
            })(<Input trim />)}
          </FormItem>
        </Form>
      </Modal>
    );
  }
}
