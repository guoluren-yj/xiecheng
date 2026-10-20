/*
 * @Date: 2022-04-28 15:12:58
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import React, { Component } from 'react';
import { Form, Modal } from 'hzero-ui';
import TLEditor from 'components/TLEditor';
import intl from 'utils/intl';

const FormItem = Form.Item;
const formItemLayout = {
  labelCol: { span: 4 },
  wrapperCol: { span: 20 },
};

export default class EditNameModal extends Component {
  render() {
    const {
      form: { getFieldDecorator },
      visible,
      config,
      onCancel,
      onOk,
    } = this.props;
    const { configDescription, _token } = config;
    return (
      <Modal
        destroyOnClose
        onOk={onOk}
        visible={visible}
        onCancel={onCancel}
        title={intl
          .get('spfm.investigationDefinition.model.definition.tagNameRename')
          .d('页签名称重命名')}
      >
        <Form>
          <FormItem
            style={{ marginBottom: 0 }}
            {...formItemLayout}
            label={intl.get('spfm.investigationDefinition.model.definition.tagName').d('页签名称')}
          >
            {getFieldDecorator('configDescription', {
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl
                      .get('spfm.investigationDefinition.model.definition.tagName')
                      .d('页签名称'),
                  }),
                },
              ],
              initialValue: configDescription,
            })(
              <TLEditor
                token={_token}
                label={intl
                  .get('spfm.investigationDefinition.model.definition.tagNameTle')
                  .d('页签名称多语言')}
                field="configDescription"
              />
            )}
          </FormItem>
        </Form>
      </Modal>
    );
  }
}
