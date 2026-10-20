/*
 * ListForm - 采购订单类型维护表单
 * @date: 2018/10/13 11:15:59
 * @author: HB <bin.huang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { PureComponent } from 'react';
import { Form, Input, InputNumber, Modal } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { isEmpty } from 'lodash';
import TLEditor from 'components/TLEditor';

import Switch from 'components/Switch';
import intl from 'utils/intl';

const formLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 16 },
};
@Form.create({ fieldNameProp: null })
export default class DemandListForm extends PureComponent {
  componentDidMount() {
    const { form, onRef } = this.props;
    if (onRef) onRef(form);
  }

  @Bind()
  validator(rule, value, callback) {
    const { demandTypeList = [], editValue } = this.props;
    if (!editValue.prTypeId && demandTypeList.find(item => item.prTypeCode === value)) {
      callback(intl.get(`sodr.orderType.view.message.codeRepeat`).d('编码重复'));
    }
    callback();
  }

  // 保存
  @Bind()
  saveBtn() {
    const { form, onHandleAdd } = this.props;
    form.validateFields((err, values) => {
      if (isEmpty(err)) {
        onHandleAdd(values);
      }
    });
  }

  render() {
    const {
      form: { getFieldDecorator },
      editValue,
      title,
      anchor,
      visible,
      onCancel,
      confirmLoading,
    } = this.props;
    return (
      <Modal
        destroyOnClose
        title={title}
        width={520}
        wrapClassName={`ant-modal-sidebar-${anchor}`}
        transitionName={`move-${anchor}`}
        visible={visible}
        onOk={this.saveBtn}
        onCancel={onCancel}
        confirmLoading={confirmLoading}
        okText={intl.get('hzero.common.button.sure').d('确定')}
        cancelText={intl.get('hzero.common.button.cancel').d('取消')}
      >
        <Form>
          <Form.Item
            {...formLayout}
            label={intl.get(`entity.order.type.applicationTypeCode`).d('申请类型编码')}
          >
            {getFieldDecorator('prTypeCode', {
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get(`entity.order.type.applicationTypeCode`).d('申请类型编码'),
                  }),
                },
                { validator: this.validator },
              ],
              initialValue: editValue.prTypeCode,
            })(<Input disabled={!!editValue.prTypeId} typeCase="upper" inputChinese={false} />)}
          </Form.Item>
          <Form.Item
            {...formLayout}
            label={intl.get(`entity.order.type.applicationTypeName`).d('申请类型')}
          >
            {getFieldDecorator('prTypeName', {
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get(`entity.order.type.applicationTypeName`).d('申请类型'),
                  }),
                },
                {
                  max: 120,
                  message: intl.get('hzero.common.validation.max', {
                    max: 120,
                  }),
                },
              ],
              initialValue: editValue.prTypeName,
            })(
              <TLEditor
                label={intl.get(`entity.order.type.applicationTypeName`).d('申请类型')}
                field="prTypeName"
                token={editValue._token}
              />
            )}
          </Form.Item>
          <Form.Item
            label={intl.get(`sodr.common.model.common.sourceCode`).d('来源系统')}
            {...formLayout}
          >
            {getFieldDecorator('sourceCode', {
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get(`sodr.common.model.common.sourceCode`).d('来源系统'),
                  }),
                },
              ],
              initialValue: editValue.sourceCode || 'SRM',
            })(<Input disabled />)}
          </Form.Item>
          <Form.Item
            {...formLayout}
            label={intl.get(`sodr.orderType.model.orderType.orderSeq`).d('排序号')}
          >
            {getFieldDecorator('orderSeq', {
              rules: [
                {
                  pattern: /\d/,
                  message: intl.get(`hzero.common.validation.requireNumber`).d('请输入数字'),
                },
              ],
              initialValue: editValue.orderSeq,
            })(<InputNumber min={0} style={{ width: '100%' }} />)}
          </Form.Item>
          <Form.Item {...formLayout} label={intl.get(`hzero.common.status.enable`).d('启用')}>
            {getFieldDecorator('enabledFlag', {
              initialValue: editValue.enabledFlag === 0 ? 0 : 1,
            })(<Switch />)}
          </Form.Item>
        </Form>
      </Modal>
    );
  }
}
