import React, { Component } from 'react';
import { Modal, Form, Input } from 'hzero-ui';
import { isUndefined, isEmpty } from 'lodash';
import { Bind } from 'lodash-decorators';

import intl from 'utils/intl';
/**
 * Form.Item 组件label、wrapper长度比例划分
 */
const formLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 16 },
};

@Form.create({ fieldNameProp: null })
export default class ApprovalGroupDrawer extends Component {
  @Bind()
  handleOk() {
    const { form, onHandleOk, itemData } = this.props;
    if (onHandleOk) {
      form.validateFields((err, values) => {
        if (isEmpty(err)) {
          onHandleOk({
            ...itemData,
            ...values,
          });
        }
      });
    }
  }

  @Bind()
  checkUnique(documents, value, callback) {
    const { ruleList, itemData } = this.props;
    if (isUndefined(itemData.code)) {
      // 非编辑时，校验规则编码是否重复
      const target = ruleList.find((item) => item.code === +value);
      if (target) {
        callback(
          intl.get('hwfp.common.view.validation.code.exist').d('编码已存在，请输入其他编码')
        );
      }
      callback();
    }
  }

  render() {
    const {
      anchor,
      visible,
      title,
      itemData,
      onCancel,
      form: { getFieldDecorator },
      loading = false,
    } = this.props;
    return (
      <Modal
        okButtonProps={{ loading }}
        title={title}
        width={520}
        wrapClassName={`ant-modal-sidebar-${anchor}`}
        transitionName={`move-${anchor}`}
        visible={visible}
        onOk={this.handleOk}
        onCancel={onCancel}
        destroyOnClose
      >
        <Form>
          <Form.Item label={intl.get('hwfp.common.model.common.defCode').d('编码')} {...formLayout}>
            {getFieldDecorator('defCode', {
              initialValue: itemData.defCode,
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get('hwfp.common.model.common.defCode').d('编码'),
                  }),
                },
              ],
            })(<Input inputChinese={false} disabled={itemData.id} />)}
          </Form.Item>
          <Form.Item label={intl.get('hwfp.common.model.common.defName').d('名称')} {...formLayout}>
            {getFieldDecorator('defName', {
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get('hwfp.common.model.common.defName').d('名称'),
                  }),
                },
                {
                  max: 240,
                  message: intl.get('hzero.common.validation.max', {
                    max: 240,
                  }),
                },
              ],
              initialValue: itemData.defName,
            })(<Input />)}
          </Form.Item>
          <Form.Item
            label={intl.get('hwfp.common.model.common.illustrate').d('说明')}
            {...formLayout}
          >
            {getFieldDecorator('description', {
              initialValue: itemData.description,
            })(<Input />)}
          </Form.Item>
        </Form>
      </Modal>
    );
  }
}
