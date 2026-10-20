/**
 * paymentType - 付款方式定义Modal
 * @date: 2018-8-4
 * @author: YB <bo.yang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Component } from 'react';
import { Form, Input, Modal, Row, Col, Select } from 'hzero-ui';
import Switch from 'components/Switch';
import intl from 'utils/intl';
import { isEmpty } from 'lodash';
import { Bind } from 'lodash-decorators';
import TLEditor from 'components/TLEditor';
import { EDIT_FORM_ROW_LAYOUT } from 'utils/constants';

const formLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 16 },
};
/**
 * 付款方式定义模态框表单
 * @extends {ModalForm} - React.ModalForm
 * @reactProps {Function} handleAdd - 表单提交
 * @reactProps {Object} form - 表单对象
 * @return React.element
 */
@Form.create({ fieldNameProp: null })
export default class PaymentForm extends Component {
  // 保存
  @Bind()
  saveBtn() {
    const { form, handleAdd } = this.props;
    form.validateFields((err, values) => {
      if (isEmpty(err)) {
        handleAdd(values);
      }
    });
  }

  render() {
    const {
      data = {},
      form = {},
      customizeForm,
      sideBar,
      title,
      confirmLoading,
      modalVisible,
      hideModal,
      paymentFormList,
    } = this.props;
    const { getFieldDecorator = (e) => e } = form;
    return (
      <Modal
        title={title}
        sideBar={sideBar}
        width={520}
        visible={modalVisible}
        confirmLoading={confirmLoading}
        wrapClassName="ant-modal-sidebar-right"
        transitionName="move-right"
        onOk={this.saveBtn}
        onCancel={hideModal}
      >
        {customizeForm(
          {
            code: 'SMDM.PAYMENT_TYPE.FORM_EDIT',
            form,
            dataSource: data,
          },
          <Form>
            <Row {...EDIT_FORM_ROW_LAYOUT}>
              <Col span={24}>
                <Form.Item
                  label={intl
                    .get(`smdm.paymentType.model.paymentType.paymentCode`)
                    .d('付款方式代码')}
                  {...formLayout}
                >
                  {getFieldDecorator('typeCode', {
                    initialValue: data.typeCode,
                    rules: [
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl
                            .get(`smdm.paymentType.model.paymentType.paymentCode`)
                            .d('付款方式代码'),
                        }),
                      },
                      {
                        max: 30,
                        message: intl.get('hzero.common.validation.max', {
                          max: 30,
                        }),
                      },
                    ],
                  })(<Input inputChinese={false} disabled={!!data.typeId} />)}
                </Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item
                  label={intl
                    .get(`smdm.paymentType.model.paymentType.paymentName`)
                    .d('付款方式名称')}
                  {...formLayout}
                >
                  {getFieldDecorator('typeName', {
                    initialValue: data.typeName,
                    rules: [
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl
                            .get(`smdm.paymentType.model.paymentType.paymentName`)
                            .d('付款方式名称'),
                        }),
                      },
                    ],
                  })(
                    <TLEditor
                      label={intl
                        .get(`smdm.paymentType.model.paymentType.paymentName`)
                        .d('付款方式名称')}
                      field="typeName"
                      token={data._token}
                    />
                    // <Input />
                  )}
                </Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item
                  label={intl.get('smdm.paymentType.model.paymentType.paymentForm').d('付款形式')}
                  {...formLayout}
                >
                  {getFieldDecorator('paymentForm', {
                    initialValue: data.paymentForm,
                  })(
                    <Select allowClear>
                      {paymentFormList.map((m) => {
                        return (
                          <Select.Option key={m.value} value={m.value}>
                            {m.meaning}
                          </Select.Option>
                        );
                      })}
                    </Select>
                  )}
                </Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item
                  label={intl
                    .get(`smdm.paymentType.model.paymentType.ebankAccountFlag`)
                    .d('电子银行账号')}
                  {...formLayout}
                >
                  {getFieldDecorator('elBankFlag', {
                    initialValue: data.elBankFlag,
                  })(<Switch />)}
                </Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item label={intl.get('hzero.common.status.enable').d('启用')} {...formLayout}>
                  {getFieldDecorator('enabledFlag', {
                    initialValue: data.enabledFlag,
                  })(<Switch />)}
                </Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item
                  label={intl.get('smdm.paymentType.view.message.tab.defaultFlag').d('是否默认')}
                  {...formLayout}
                >
                  {getFieldDecorator('defaultFlag', {
                    initialValue: data.defaultFlag,
                  })(<Switch />)}
                </Form.Item>
              </Col>
            </Row>
          </Form>
        )}
      </Modal>
    );
  }
}
