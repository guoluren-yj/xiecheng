/**
 * EventCategory - 事件类型定义 - 编辑表单
 * @date: 2019-3-12
 * @author: Wu <qizheng.wu@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React from 'react';
import { Form, Input, Modal } from 'hzero-ui';
import { Bind } from 'lodash-decorators';

import intl from 'utils/intl';
import Switch from 'components/Switch';
import TLEditor from 'components/TLEditor';

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
   * 事件保存
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
            label={intl
              .get('spfm.eventCategory.model.eventCategory.categoryCode')
              .d('事件类型编码')}
          >
            {getFieldDecorator('categoryCode', {
              initialValue: initData.categoryCode,
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl
                      .get('spfm.eventCategory.model.eventCategory.categoryCode')
                      .d('事件类型编码'),
                  }),
                },
                {
                  max: 30,
                  message: intl.get('hzero.common.validation.max', {
                    max: 30,
                  }),
                },
              ],
            })(<Input trim inputChinese={false} />)}
          </FormItem>
          <FormItem
            {...formLayout}
            label={intl
              .get('spfm.eventCategory.model.eventCategory.categoryName')
              .d('事件类型描述')}
          >
            {getFieldDecorator('categoryName', {
              initialValue: initData.categoryName,
              rules: [
                {
                  required: false,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl
                      .get('spfm.eventCategory.model.eventCategory.categoryName')
                      .d('事件类型描述'),
                  }),
                },
                {
                  max: 360,
                  message: intl.get('hzero.common.validation.max', {
                    max: 360,
                  }),
                },
              ],
            })(
              <TLEditor
                label={intl
                  .get('spfm.eventCategory.model.eventCategory.categoryName')
                  .d('事件类型描述')}
                field="categoryName"
                token={initData._token}
              />
            )}
          </FormItem>
          <FormItem {...formLayout} label={intl.get('hzero.common.status.enable').d('启用')}>
            {getFieldDecorator('enabledFlag', {
              initialValue: initData.enabledFlag === undefined ? 1 : initData.enabledFlag,
            })(<Switch />)}
          </FormItem>
        </Form>
      </Modal>
    );
  }
}
