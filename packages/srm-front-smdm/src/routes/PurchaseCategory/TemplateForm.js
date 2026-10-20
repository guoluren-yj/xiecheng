import React from 'react';
import { Form, Input, Select, Modal } from 'hzero-ui';
import { Bind } from 'lodash-decorators';

import Switch from 'components/Switch';

import intl from 'utils/intl';

const { Option } = Select;
const FormItem = Form.Item;

const formLayout = {
  labelCol: { span: 4 },
  wrapperCol: { span: 18 },
};
@Form.create({ fieldNameProp: null })
export default class TemplateForm extends React.PureComponent {
  /**
   * 配置保存
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
    const { form, initData, requiredList, title, modalVisible, onCancel } = this.props;
    const { getFieldDecorator } = form;
    const {
      optionName,
      quantity = 'OPTIONAL',
      price = 'OPTIONAL',
      remark = 'OPTIONAL',
      enabledFlag,
    } = initData;
    const select = (
      <Select style={{ width: '150px' }}>
        {requiredList.map((item) => (
          <Option key={item.value} value={item.value}>
            {item.meaning}
          </Option>
        ))}
      </Select>
    );
    return (
      <Modal
        destroyOnClose
        title={title}
        visible={modalVisible}
        wrapClassName="ant-modal-sidebar-right"
        transitionName="move-right"
        onCancel={onCancel}
        onOk={this.handleOk}
      >
        <Form>
          <FormItem
            {...formLayout}
            label={intl.get('smdm.purchaseCategory.model.category.optionName').d('配置项')}
          >
            {getFieldDecorator('optionName', {
              initialValue: optionName,
              rules: [
                {
                  type: 'string',
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get('smdm.purchaseCategory.model.category.optionName').d('配置项'),
                  }),
                },
              ],
            })(<Input />)}
          </FormItem>
          <FormItem
            {...formLayout}
            label={intl.get('smdm.purchaseCategory.model.category.quantity').d('数量')}
          >
            {getFieldDecorator('quantity', {
              initialValue: quantity,
            })(select)}
          </FormItem>
          <FormItem
            {...formLayout}
            label={intl.get('smdm.purchaseCategory.model.category.price').d('单价')}
          >
            {getFieldDecorator('price', {
              initialValue: price,
            })(select)}
          </FormItem>
          <FormItem {...formLayout} label={intl.get('hzero.common.remark').d('备注')}>
            {getFieldDecorator('remark', {
              initialValue: remark,
            })(select)}
          </FormItem>
          <FormItem {...formLayout} label={intl.get('hzero.common.status.enable').d('启用')}>
            {getFieldDecorator('enabledFlag', {
              initialValue: enabledFlag === 0 ? 0 : 1,
            })(<Switch />)}
          </FormItem>
        </Form>
      </Modal>
    );
  }
}
