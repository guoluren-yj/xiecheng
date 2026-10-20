/*
 * FilterForm - 账户分配类别维护表单
 * @date: 2020/04/10 14:48:29
 * @author: mjq <jiaqi.mao@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2020, Hand
 */

import React, { PureComponent } from 'react';
import { Form, Input, Modal } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { isEmpty, isFunction } from 'lodash';

import TLEditor from 'components/TLEditor';
import Switch from 'components/Switch';
import intl from 'utils/intl';

const formLayout = {
  labelCol: { span: 7 },
  wrapperCol: { span: 14 },
};
@Form.create({ fieldNameProp: null })
export default class AccountListForm extends PureComponent {
  constructor(props) {
    super(props);
    if (isFunction(props.onRef)) props.onRef(this);
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
            label={intl
              .get(`sodr.orderType.model.orderType.accountAssignTypeCode`)
              .d('账户分配类别编码')}
          >
            {getFieldDecorator('accountAssignTypeCode', {
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl
                      .get(`sodr.orderType.model.orderType.accountAssignTypeCode`)
                      .d('账户分配类别编码'),
                  }),
                },
                {
                  max: 30,
                  message: intl.get('hzero.common.validation.max', { max: 30 }),
                },
              ],
              initialValue: editValue.accountAssignTypeCode,
            })(
              <Input
                disabled={editValue.accountAssignTypeId}
                typeCase="upper"
                inputChinese={false}
              />
            )}
          </Form.Item>
          <Form.Item
            {...formLayout}
            label={intl
              .get(`sodr.orderType.model.orderType.accountNameDescribe`)
              .d('账户分配类别描述')}
          >
            {getFieldDecorator('accountAssignTypeName', {
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl
                      .get(`sodr.orderType.model.orderType.accountNameDescribe`)
                      .d('账户分配类别描述'),
                  }),
                },
                {
                  max: 150,
                  message: intl.get('hzero.common.validation.max', { max: 150 }),
                },
              ],
              initialValue: editValue.accountAssignTypeName,
            })(
              <TLEditor
                label={intl
                  .get(`sodr.orderType.model.orderType.accountNameDescribe`)
                  .d('账户分配类别描述')}
                typeCase="upper"
                field="accountAssignTypeName"
                token={editValue._token}
              />
            )}
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
