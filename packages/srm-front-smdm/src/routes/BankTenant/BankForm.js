import React, { Component } from 'react';
import { Form, Input, Modal, Row, Col, Select } from 'hzero-ui';
import { Bind } from 'lodash-decorators';

// import Lov from 'components/Lov';
import TLEditor from 'components/TLEditor';
import Switch from 'components/Switch';
import { CODE_UPPER } from 'utils/regExp';
import { MODAL_FORM_ITEM_LAYOUT } from 'utils/constants';

import intl from 'utils/intl';

const FormItem = Form.Item;

@Form.create({ fieldNameProp: null })
export default class BankForm extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  @Bind()
  handleOk() {
    const { form, handleAdd } = this.props;
    form.validateFields((err, fieldsValue) => {
      if (!err) {
        handleAdd({ ...fieldsValue });
      }
    });
  }

  render() {
    const { form, modalVisible, hideModal, loading, bankTenant, flag } = this.props;
    const { getFieldDecorator } = form;
    return (
      <Modal
        destroyOnClose
        title={intl.get('hpfm.bank.view.message.newBank').d('新建银行')}
        width={600}
        visible={modalVisible}
        confirmLoading={loading}
        wrapClassName="ant-modal-sidebar-right"
        transitionName="move-right"
        onCancel={hideModal}
        onOk={this.handleOk}
      >
        <Form>
          <Row>
            <Col span={24}>
              <FormItem
                {...MODAL_FORM_ITEM_LAYOUT}
                label={intl.get('hpfm.bank.model.bank.bankCode').d('银行代码')}
              >
                {getFieldDecorator('bankCode', {
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get('hpfm.bank.model.bank.bankCode').d('银行代码'),
                      }),
                    },
                    {
                      pattern: CODE_UPPER,
                      message: intl
                        .get('hzero.common.validation.codeUpper')
                        .d('全大写及数字，必须以字母、数字开头，可包含“-”、“_”、“.”、“/”'),
                    },
                  ],
                })(<Input trim inputChinese={false} typeCase="upper" />)}
              </FormItem>
            </Col>
          </Row>
          <Row>
            <Col span={24}>
              <FormItem
                {...MODAL_FORM_ITEM_LAYOUT}
                label={intl.get('hpfm.bank.model.bank.bankType').d('银行类型')}
              >
                {form.getFieldDecorator('bankTypeCode', {
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get('hpfm.bank.model.bank.bankType').d('银行类型'),
                      }),
                    },
                  ],
                })(
                  <Select style={{ width: '100%' }}>
                    {bankTenant.enumMap.bankType.map((item) => (
                      <Select.Option key={item.value} value={item.value}>
                        {item.meaning}
                      </Select.Option>
                    ))}
                  </Select>
                )}
              </FormItem>
            </Col>
          </Row>
          <Row>
            <Col span={24}>
              <FormItem
                {...MODAL_FORM_ITEM_LAYOUT}
                label={intl.get('hpfm.bank.model.bank.bankName').d('银行名称')}
              >
                {form.getFieldDecorator('bankName', {
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get('hpfm.bank.model.bank.bankName').d('银行名称'),
                      }),
                    },
                  ],
                })(
                  <TLEditor
                    label={intl.get('hpfm.bank.model.bank.bankName').d('银行名称')}
                    field="bankName"
                  />
                )}
              </FormItem>
            </Col>
          </Row>
          <Row>
            <Col span={24}>
              <FormItem
                {...MODAL_FORM_ITEM_LAYOUT}
                label={intl.get('hpfm.bank.model.bank.bankShortName').d('银行简称')}
              >
                {form.getFieldDecorator('bankShortName', {
                  rules: [
                    {
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get('hpfm.bank.model.bank.bankShortName').d('银行简称'),
                      }),
                    },
                  ],
                })(
                  <TLEditor
                    label={intl.get('hpfm.bank.model.bank.bankShortName').d('银行简称')}
                    field="bankShortName"
                  />
                )}
              </FormItem>
            </Col>
          </Row>
          <Row>
            <Col span={24}>
              <FormItem
                {...MODAL_FORM_ITEM_LAYOUT}
                label={intl.get('hzero.common.status.enable').d('启用')}
              >
                {form.getFieldDecorator('enabledFlag', { initialValue: flag })(<Switch />)}
              </FormItem>
            </Col>
          </Row>
        </Form>
      </Modal>
    );
  }
}
