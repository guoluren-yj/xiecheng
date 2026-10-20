/**
 * Event - 事件定义 - 编辑表单
 * @date: 2019-3-12
 * @author: Wu <qizheng.wu@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React from 'react';
import { Form, Input, Modal } from 'hzero-ui';
import { Bind } from 'lodash-decorators';

import intl from 'utils/intl';
import Lov from 'components/Lov';
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
   * 事件定义保存
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
            label={intl.get('spfm.event.model.event.categoryName').d('事件类型')}
          >
            {getFieldDecorator('categoryId', {
              initialValue: initData.categoryId,
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get('spfm.event.model.event.categoryName').d('事件类型'),
                  }),
                },
              ],
            })(<Lov code="SPFM.EVENT_CATEGORY" textValue={initData.categoryName} />)}
          </FormItem>
          <FormItem
            {...formLayout}
            label={intl.get('spfm.common.model.categoryCode').d('事件编码')}
          >
            {getFieldDecorator('eventCode', {
              initialValue: initData.eventCode,
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get('spfm.common.model.categoryCode').d('事件编码'),
                  }),
                },
              ],
            })(<Input trim inputChinese={false} />)}
          </FormItem>
          <FormItem {...formLayout} label={intl.get('spfm.common.model.eventName').d('事件描述')}>
            {getFieldDecorator('eventName', {
              initialValue: initData.eventName,
              rules: [
                {
                  required: false,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get('spfm.common.model.eventName').d('事件描述'),
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
                label={intl.get('spfm.common.model.eventName').d('事件描述')}
                field="eventName"
                token={initData._token}
              />
            )}
          </FormItem>
          <FormItem
            {...formLayout}
            label={intl.get('spfm.event.model.event.className').d('数据类型')}
          >
            {getFieldDecorator('dataTypeId', {
              initialValue: initData.dataTypeId,
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get('spfm.event.model.event.className').d('数据类型'),
                  }),
                },
              ],
            })(<Lov code="SPFM.EVENT_DATA_TYPE" textValue={initData.className} />)}
          </FormItem>
        </Form>
      </Modal>
    );
  }
}
